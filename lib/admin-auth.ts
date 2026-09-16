export const ADMIN_SESSION_COOKIE = 'aa_admin_session'

async function sha256(input: string) {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Derives the expected session token from the admin password. The cookie
 * never stores the raw password, only this derived value, and it changes
 * automatically if ADMIN_PASSWORD is rotated.
 */
export async function getExpectedSessionToken() {
  const secret = process.env.ADMIN_PASSWORD ?? ''
  return sha256(`aa-sports-admin-session:${secret}`)
}
