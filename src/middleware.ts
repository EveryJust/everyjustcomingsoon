import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Update the user's session (this sets cookies if tokens need refreshing)
  const response = await updateSession(request)

  // Verify auth for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) { /* No-op here, updateSession handles it */ },
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // List of protected routes that require ANY authentication
  const isDashboardRoute = path.startsWith('/dashboard') || path.startsWith('/brands') || path.startsWith('/shop')
  
  // Admin routes
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login')

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/brand/login', request.url)) // redirect to a user login
  }

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // If user is already logged in, prevent access to login page
  if (path === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
