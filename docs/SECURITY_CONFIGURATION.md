# Security Configuration Guide

## Overview

This guide covers the main security settings for self-hosted deployments:

- Rate Limiting (brute force protection)
- CORS (cross-origin access control)
- JWT Secrets (authentication)

---

## 1. Rate Limiting

### What It Does

Protects against brute force login attacks by limiting failed attempts **per user account** (not per IP address).

**Why per account?** In a store environment, multiple employees share the same network/IP. Rate limiting by IP would lock out everyone if one person forgets their password. Instead, we limit attempts per email/username, so only the affected account is locked.

### Configuration

```bash
# .env
RATE_LIMITING_ENABLED=true          # Set to false to disable
RATE_LIMIT_MAX_ATTEMPTS=5           # Max failed attempts
RATE_LIMIT_WINDOW_MS=900000         # 15 minutes (in milliseconds)
RATE_LIMIT_BLOCK_MS=3600000         # 1 hour block (in milliseconds)
```

### Should You Enable It?

**Enable (Recommended):**

- Any remote/VPN access
- Internet-facing deployments
- Larger teams (10+ users)
- Defense in depth

**Disable (Optional):**

- Small trusted network (<10 users)
- All users known personally
- Good physical security
- Causes user friction

### Default Settings

- 5 failed attempts allowed
- Within 15-minute window
- 1-hour lockout after exceeding limit

---

## 2. CORS Configuration

### What It Does

Controls which devices/origins can access your API from a browser.

### Configuration

```bash
# .env
# Space-separated list of allowed origins
ALLOWED_ORIGINS="https://salespider.local https://192.168.1.133 https://192.168.1.150"
```

### Adding New Devices

When you add a tablet, computer, or phone:

1. Find device IP address
2. Add to `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS="https://salespider.local https://192.168.1.133 https://192.168.1.150"
   ```
3. Restart: `./deploy.sh restart`

### Common Scenarios

**Small Store (3-5 devices):**

```bash
ALLOWED_ORIGINS="https://salespider.local https://192.168.1.133 https://192.168.1.140 https://192.168.1.150"
```

**Using Domain Name Only:**

```bash
ALLOWED_ORIGINS="https://salespider.local"
```

_All devices must access via domain name (requires DNS)_

**Development/Testing (Not for Production):**

```bash
ALLOWED_ORIGINS="*"
```

_Allows all origins - use only for testing_

### Important Notes

- ✅ CORS doesn't bypass authentication - users still need login
- ✅ Only HTTPS origins are allowed
- ⚠️ Must restart after changing ALLOWED_ORIGINS
- ⚠️ Each device IP must be explicitly listed

---

## 3. JWT Secret

### What It Does

Secures authentication tokens. If compromised, attackers can forge login sessions.

### Configuration

```bash
# .env
JWT_SECRET=your-secure-random-string-here
TOKEN_EXPIRY=12h
```

### Generate New Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### When to Rotate

- ✅ Initial deployment
- ✅ Suspected compromise
- ✅ Employee termination (if they had access)
- ✅ Periodically (every 6-12 months)

**Warning:** Rotating JWT secret invalidates all active sessions. Users must log in again.

---

## Quick Reference

### Recommended Settings for Self-Hosted

```bash
# Rate Limiting
RATE_LIMITING_ENABLED=true
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_BLOCK_MS=3600000

# CORS (add all your device IPs)
ALLOWED_ORIGINS="https://salespider.local https://192.168.1.133"

# JWT
JWT_SECRET=<generate-with-crypto>
TOKEN_EXPIRY=12h
COOKIE_SECURE=true
```

### After Changing Settings

```bash
./deploy.sh restart
```

---

## Troubleshooting

### "Too many failed login attempts"

- **Cause:** Rate limiting triggered
- **Solutions:**
  1. Wait for lockout to expire (1 hour by default)
  2. Admin/Manager can clear the block (see Admin Commands below)
  3. Disable rate limiting if not needed

**Admin Commands:**

View blocked accounts (SUPER_ADMIN/MANAGER):

```bash
GET /api/admin/rate-limit
```

Clear specific account:

```bash
DELETE /api/admin/rate-limit?email=cashier@salespider.local
```

**Permissions:**

- **SUPER_ADMIN**: Can unlock any account
- **MANAGER**: Can only unlock CASHIER accounts

### "CORS error" from device

- **Cause:** Device IP not in ALLOWED_ORIGINS
- **Solution:** Add device IP to ALLOWED_ORIGINS and restart

### "Invalid token" after restart

- **Cause:** JWT secret was changed
- **Solution:** Normal behavior - users need to log in again

---

## Security Checklist

- ✅ JWT secret is unique and secure (not default)
- ✅ ALLOWED_ORIGINS lists all devices that need access
- ✅ Rate limiting enabled (or consciously disabled)
- ✅ HTTPS enforced (COOKIE_SECURE=true)
- ✅ Strong passwords enforced for all users
- ✅ Network firewall configured
- ✅ Regular backups enabled

---

For detailed security audit results, see `SECURITY_AUDIT_REPORT.md`
