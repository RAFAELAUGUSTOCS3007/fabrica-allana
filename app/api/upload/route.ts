import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, getExpectedSessionToken } from '@/lib/admin-auth'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only authenticated admins can upload product photos.
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
        const expectedToken = await getExpectedSessionToken()
        if (!sessionCookie || sessionCookie !== expectedToken) {
          throw new Error('Não autorizado.')
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
          addRandomSuffix: true,
          maximumSizeInBytes: 10 * 1024 * 1024,
        }
      },
      onUploadCompleted: async () => {
        // No-op: the product row is saved by the server action with the returned URL.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no upload.' },
      { status: 400 },
    )
  }
}
