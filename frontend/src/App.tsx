import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { ProtectedRoute } from '@/components/protected-route'
import { LoginPage } from '@/pages/login-page'
import { HomePage } from '@/pages/home-page'
import { ProductPage } from '@/pages/product-page'
import { MyOrdersPage } from '@/pages/my-orders-page'
import { MySubscriptionPage } from '@/pages/my-subscription-page'
import { AdminLayout } from '@/pages/admin/admin-layout'
import { AdminProductsPage } from '@/pages/admin/products-page'
import { AdminOrdersPage } from '@/pages/admin/orders-page'

/*
 🎓 LESSON: Nested Routes for Admin Panel
 
 The admin panel uses "nested routes":
 - /admin          → redirects to /admin/products
 - /admin/products → AdminLayout + AdminProductsPage
 - /admin/orders   → AdminLayout + AdminOrdersPage
 
 AdminLayout provides the sidebar, and the child routes
 render inside its <Outlet /> component.
 
 The <ProtectedRoute requireAdmin> ensures only admins
 can access these routes — regular users get redirected.
*/
export default function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected user routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <CartProvider>
                                <HomePage />
                            </CartProvider>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/product/:id"
                    element={
                        <ProtectedRoute>
                            <CartProvider>
                                <ProductPage />
                            </CartProvider>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-orders"
                    element={
                        <ProtectedRoute>
                            <MyOrdersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-subscription"
                    element={
                        <ProtectedRoute>
                            <MySubscriptionPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin routes — nested under AdminLayout */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requireAdmin>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/products" replace />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                </Route>
            </Routes>
        </AuthProvider>
    )
}
