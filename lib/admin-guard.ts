import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, getExpectedSessionToken } from '@/lib/admin-auth'

export async function isAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!session || !process.env.ADMIN_PASSWORD) return false
  return session === (await getExpectedSessionToken())
}

export const NAO_AUTORIZADO = { error: 'Sessão expirada. Faça login novamente.', success: false } as const
