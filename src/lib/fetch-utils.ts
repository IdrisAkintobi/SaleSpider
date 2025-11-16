/**
 * Safely parse JSON response with proper error handling
 * Handles empty responses, malformed JSON, and network errors
 */
export async function safeJsonParse<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text || text.trim() === '') {
    throw new Error(
      'Server returned an empty response. Please check if the API is running correctly.'
    )
  }

  try {
    return JSON.parse(text) as T
  } catch {
    // If JSON parsing fails, the response might be HTML (error page) or plain text
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error(
        'Server returned an HTML page instead of JSON. This usually indicates a server error or misconfiguration.'
      )
    }
    throw new Error(
      'Server returned invalid data. Please try again or contact support if the issue persists.'
    )
  }
}

/**
 * Safely parse error message from response
 * Handles both JSON and text error responses
 */
export async function parseErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const text = await response.text()
  if (!text || text.trim() === '') {
    return fallback
  }

  try {
    const error = JSON.parse(text)
    return error.message || error.error || fallback
  } catch {
    return text || fallback
  }
}

/**
 * Fetch with automatic JSON parsing and comprehensive error handling
 * Use this for all API calls to ensure consistent error handling across the app
 *
 * @example
 * const data = await fetchJson<User>('/api/users/123')
 * const result = await fetchJson('/api/sales', { method: 'POST', body: JSON.stringify(data) })
 */
export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        `Request failed with status ${response.status}`
      )
      throw new Error(errorMessage)
    }

    return safeJsonParse<T>(response)
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error
      throw new Error(
        'Network error: Unable to connect to server. Please check your connection.'
      )
    }
    throw error
  }
}
