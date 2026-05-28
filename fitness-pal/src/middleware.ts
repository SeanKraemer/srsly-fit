import edgeAuthConfigObject from '@/auth.config'
import NextAuth from 'next-auth'

// we must use the auth object specifically for edge runtimes here,
// otherwise we get errors about edge runtimes missing nodejs
// modules that aren't accessible in the edge runtimes.
const { auth } = NextAuth(edgeAuthConfigObject)
export default auth(async function middleware(req) {
  const path = req.nextUrl.pathname

  if (!req.auth && path != '/login') {
    const newUrl = new URL('/login', req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
