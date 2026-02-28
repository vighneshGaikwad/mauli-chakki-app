import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

/*
 🎓 LESSON: Protected Routes
 
 Some pages should only be visible to logged-in users.
 If someone tries to visit /my-orders without being logged in,
 we redirect them to /login.
 
 Usage in App.tsx:
   <Route path="/my-orders" element={
     <ProtectedRoute>
       <MyOrdersPage />
     </ProtectedRoute>
   } />
   
 For admin-only pages:
   <Route path="/admin" element={
     <ProtectedRoute requireAdmin>
       <AdminPage />
     </ProtectedRoute>
   } />
*/

export function ProtectedRoute({
    children,
    requireAdmin = false,
}: {
    children: React.ReactNode
    requireAdmin?: boolean
}) {
    const { user, isLoading } = useAuth()

    // While checking if token is valid, show a loading spinner
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    // Not logged in → go to login page
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Logged in but not admin → go to home page
    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />
    }

    // All checks passed → show the page
    return <>{children}</>
}
