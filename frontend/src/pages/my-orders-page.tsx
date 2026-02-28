import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Clock, Truck, CheckCircle2 } from 'lucide-react'
import { ordersAPI, type OrderData } from '@/lib/api'

/*
 🎓 LESSON: My Orders Page
 
 This page shows the logged-in user's order history.
 
 When the page loads, it calls GET /api/orders/my
 which returns all orders for the current user (identified 
 by the JWT token attached to the request).
 
 Each order shows:
 - Order date
 - Items list (name, grind, weight)
 - Total amount
 - Status badge (Received → Milling → Dispatched → Delivered)
*/

const statusConfig = {
    Received: { icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Order Received' },
    Dispatched: { icon: Truck, color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Dispatched' },
    Delivered: { icon: CheckCircle2, color: 'text-success bg-success/10 border-success/20', label: 'Delivered' },
}

export function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        ordersAPI.getMyOrders()
            .then(setOrders)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"
                    >
                        <ArrowLeft className="h-4 w-4 text-foreground" />
                    </button>
                    <h1 className="font-serif text-lg font-bold text-foreground">My Orders</h1>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground">No orders yet</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your order history will appear here
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            Shop Now
                        </button>
                    </div>
                ) : (
                    /* Orders list */
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => {
                            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.Received
                            const StatusIcon = status.icon
                            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })

                            return (
                                <div
                                    key={order._id}
                                    className="rounded-2xl border border-border bg-card p-4"
                                >
                                    {/* Order header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                {orderDate}
                                            </p>
                                            <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${status.color}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            <span className="text-[11px] font-semibold">{status.label}</span>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="mt-3 flex flex-col gap-2">
                                        {order.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-card-foreground">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.grind} grind · {item.weightKg}kg
                                                        {item.isSubscription && (
                                                            <span className="ml-1 text-success font-semibold">
                                                                · Monthly
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-foreground">
                                                    ₹{item.pricePerKg * item.weightKg}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                                        <span className="text-sm font-medium text-muted-foreground">Total</span>
                                        <span className="text-lg font-bold text-primary">₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
