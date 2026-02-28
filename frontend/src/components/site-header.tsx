import { useState } from 'react'
import { ShoppingBag, User, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

/*
 🎓 LESSON: Updated Header with User Menu
 
 The header now shows:
 - Logo (left)
 - User avatar/name + cart icon (right)
 - Clicking the user avatar opens a dropdown with profile info + logout
 
 We use a simple useState to toggle the dropdown open/closed.
*/
export function SiteHeader() {
    const { totalItems, setIsOpen } = useCart()
    const { user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
        setMenuOpen(false)
    }

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                <a href="/">
                    <img
                        src="/images/logo.png"
                        alt="Mauli Chakki"
                        className="h-12 w-auto object-contain"
                    />
                </a>

                <div className="flex items-center gap-2">
                    {/* User menu */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary"
                            >
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <User className="h-3.5 w-3.5" />
                                </div>
                                <span className="hidden text-xs font-medium text-foreground sm:inline">
                                    {user.mobile}
                                </span>
                                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {menuOpen && (
                                <>
                                    {/* Invisible overlay to close menu on click outside */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
                                        {/* User info */}
                                        <div className="border-b border-border px-3 pb-2">
                                            <p className="text-sm font-semibold text-card-foreground">
                                                +91 {user.mobile}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.role === 'admin' ? '🔑 Admin' : '👤 Customer'}
                                            </p>
                                        </div>

                                        {/* Menu items */}
                                        <div className="mt-1 flex flex-col gap-0.5">
                                            <button
                                                onClick={() => {
                                                    navigate('/my-orders')
                                                    setMenuOpen(false)
                                                }}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-card-foreground hover:bg-secondary"
                                            >
                                                📦 My Orders
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate('/my-subscription')
                                                    setMenuOpen(false)
                                                }}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-card-foreground hover:bg-secondary"
                                            >
                                                🔄 My Subscriptions
                                            </button>
                                            {user.role === 'admin' && (
                                                <button
                                                    onClick={() => {
                                                        navigate('/admin')
                                                        setMenuOpen(false)
                                                    }}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-card-foreground hover:bg-secondary"
                                                >
                                                    🛠️ Admin Panel
                                                </button>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Cart button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => setIsOpen(true)}
                        aria-label={`Open cart, ${totalItems} kg in cart`}
                    >
                        <ShoppingBag className="h-5 w-5 text-foreground" />
                        {totalItems > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                {totalItems}
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </header>
    )
}
