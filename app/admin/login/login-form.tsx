'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { loginAction, type LoginState } from '../actions/auth'

const initialState: LoginState = { error: null, success: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Entrando...' : 'Entrar'}
    </Button>
  )
}

export function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(loginAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/admin')
      router.refresh()
    }
  }, [state.success, router])

  return (
    <Card className="border-sidebar-border bg-card">
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha de acesso</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                placeholder="Digite a senha"
                className="pl-9"
              />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
