import edgeAuthConfigObject from '@/auth.config'
import NextAuth from 'next-auth'

const { auth } = NextAuth(edgeAuthConfigObject)
export default auth(async function middleware(req) {
  const path = req.nextUrl.pathname

  if (!req.auth && path != '/login') {
    const newUrl = new URL('/login', req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
