import { prisma } from '@/lib/prisma'
import * as argon2 from 'argon2'
import { SignJWT } from 'jose'
import { NextRequest, NextResponse } from 'next/server'
import { authTokenKey, setCookie } from '@/app/api/auth/lib/cookie-handler'
import { createChildLogger } from '@/lib/logger'
import {
  loginRateLimiter,
  getClientIdentifier,
  isRateLimitingEnabled,
} from '@/lib/rate-limiter'
import { loginSchema } from '@/lib/validation-schemas'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const tokenExpiry = process.env.TOKEN_EXPIRY ?? '12h'
const alg = 'HS256'
const logger = createChildLogger('api:auth:login')

// Function to login
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  logger.info(
    {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
    },
    'Login attempt started'
  )

  try {
    const body = await req.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { username: email, password } = validation.data

    // Use email as identifier for rate limiting (not IP)
    // This prevents one user's failed attempts from locking out the entire store
    const clientId = getClientIdentifier(req, email)

    // Check rate limit (if enabled)
    if (isRateLimitingEnabled() && loginRateLimiter.isRateLimited(clientId)) {
      const resetTime = loginRateLimiter.getResetTime(clientId)
      logger.warn({ email, resetTime }, 'Rate limit exceeded for account')
      return NextResponse.json(
        {
          message: `Too many failed login attempts for this account. Please try again in ${Math.ceil(resetTime / 60)} minutes.`,
          retryAfter: resetTime,
        },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      if (isRateLimitingEnabled()) {
        loginRateLimiter.recordFailedAttempt(clientId)
      }
      logger.warn({ email }, 'Login attempt with non-existent user')
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (user.status !== 'ACTIVE') {
      logger.warn(
        { email, status: user.status },
        'Login attempt with inactive account'
      )
      return NextResponse.json(
        {
          message: 'Your account is inactive. Please contact an administrator.',
        },
        { status: 403 }
      )
    }

    // Use argon2.verify for password comparison
    const passwordMatch = await argon2.verify(user.password, password)

    if (!passwordMatch) {
      if (isRateLimitingEnabled()) {
        loginRateLimiter.recordFailedAttempt(clientId)
      }
      logger.warn({ email }, 'Login attempt with incorrect password')
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Clear rate limit on successful login
    if (isRateLimitingEnabled()) {
      loginRateLimiter.clearAttempts(clientId)
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    // Generate JWT
    const token = await new SignJWT(userData)
      .setProtectedHeader({ alg })
      .setExpirationTime(tokenExpiry) // Token expires in 24 hours
      .sign(secret)

    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
    })

    // Set JWT as an HTTP-only cookie
    setCookie(response, authTokenKey, token)

    const duration = Date.now() - startTime
    logger.info(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        duration: `${duration}ms`,
      },
      'Login successful'
    )

    return response
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
      },
      'Login error'
    )
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
