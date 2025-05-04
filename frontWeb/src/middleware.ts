import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
try {
    const res = await fetch(`http://localhost:8080/auth/verify-token`, {
      method: 'POST',
      headers: {
        Cookie: `token=${token}`
      }
    })

    const data = await res.json()

    if (!data.success) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
}

export const config = {
  matcher: ['/home/:path*','/messages/:path*'],
}
