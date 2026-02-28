import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Package, ClipboardList, ArrowLeft, Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

/*
 🎓 LESSON: Admin Layout with Sidebar
 
 This is a "layout component" — it provides the common structure
 (sidebar navigation) for all admin pages.
 
 The <Outlet /> component from react-router-dom is where the
 actual page content (Products or Orders) gets rendered.
 
 Think of it like a picture frame — the layout is the frame,
 and <Outlet /> is where the picture goes.
*/

const navItems = [
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
]

export function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200
                    md:relative md:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex h-full flex-col">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between border-b border-border p-4">
                        <div>
                            <h2 className="text-base font-bold text-card-foreground">Admin Panel</h2>
                            <p className="text-xs text-muted-foreground">+91 {user?.mobile}</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-lg p-1 hover:bg-secondary md:hidden"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Nav links */}
                    <nav className="flex-1 overflow-y-auto p-3">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </nav>

                    {/* Sidebar footer — always visible, never scrolls */}
                    <div className="shrink-0 border-t border-border p-3">
                        <button
                            onClick={() => navigate('/')}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Shop
                        </button>
                        <button
                            onClick={() => { logout(); navigate('/login', { replace: true }) }}
                            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-1.5 hover:bg-secondary"
                    >
                        <Menu className="h-5 w-5 text-foreground" />
                    </button>
                    <h1 className="text-sm font-bold text-foreground">Admin Panel</h1>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
