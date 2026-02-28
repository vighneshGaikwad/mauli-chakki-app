import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Repeat, CalendarClock } from 'lucide-react'
import { ordersAPI, type OrderData } from '@/lib/api'

/*
 🎓 LESSON: My Subscription Page
 
 This page filters the user's order history to find items that
 were marked as subscriptions (isSubscription: true).
 
 In a real production app, you might have a dedicated Subscription
 model in the database, but for a simple MVP, filtering past
 orders with subscriptions is a good start to show active subs.
*/

export function MySubscriptionPage() {
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

    // Filter to find items that are subscriptions
    const subItems = orders.flatMap(order =>
        order.items
            .filter(item => item.isSubscription)
            .map(item => ({
                ...item,
                orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }),
                status: order.status
            }))
    )

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
                    <h1 className="font-serif text-lg font-bold text-foreground">My Subscriptions</h1>
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
                ) : subItems.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                            <Repeat className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground">No active subscriptions</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Subscribe to fresh aatta deliveries
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
                    /* Subscriptions list */
                    <div className="flex flex-col gap-4">
                        {subItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-border bg-card p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                                            <Repeat className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-card-foreground">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {item.grind} grind · {item.weightKg}kg / month
                                            </p>
                                        </div>
                                    </div>
                                    <span className="rounded bg-success/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                                        Active
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-secondary/50 p-3 text-sm text-card-foreground">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Monthly Price (5% off)</span>
                                        <span className="font-bold">₹{Math.round(item.pricePerKg * item.weightKg * 0.95)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <CalendarClock className="h-4 w-4" /> Started On
                                        </span>
                                        <span className="font-medium">{item.orderDate}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Last Order Status</span>
                                        <span className="font-medium">{item.status}</span>
                                    </div>
                                </div>

                                <button
                                    className="mt-4 w-full rounded-xl border border-border py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                                    onClick={() => {
                                        const encoded = encodeURIComponent(`Hi, I would like to modify/pause my subscription for ${item.name} (${item.weightKg}kg).`)
                                        window.open(`https://wa.me/918237866355?text=${encoded}`, '_blank')
                                    }}
                                >
                                    Manage via WhatsApp
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
