'use server'

import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, getExpectedSessionToken } from '@/lib/admin-auth'

export type LoginState = { error: string | null; success: boolean }

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '')
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!adminPassword) {
    return { error: 'Acesso administrativo não configurado.', success: false }
  }

  if (password !== adminPassword) {
    return { error: 'Senha incorreta.', success: false }
  }

  const token = await getExpectedSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { error: null, success: true }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}
