import { useState, useEffect } from 'react'
import { Clock, Truck, CheckCircle2 } from 'lucide-react'
import { ordersAPI, type OrderData } from '@/lib/api'

/*
 🎓 LESSON: Admin Orders Page
 
 This page shows ALL orders from ALL customers.
 The admin can update the status of each order:
   Received → Dispatched → Delivered
 
 Each status update is sent to PUT /api/orders/:id/status
*/

const statuses = [
    { value: 'Received', label: 'Received', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'Dispatched', label: 'Dispatched', icon: Truck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { value: 'Delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200' },
]

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            const data = await ordersAPI.getAllOrders()
            setOrders(data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus)
            // Update locally for instant feedback
            setOrders(prev =>
                prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
            )
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update status')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">Orders</h1>
                <p className="text-sm text-muted-foreground">{orders.length} orders total</p>
            </div>

            {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

            {orders.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                        const currentStatus = statuses.find(s => s.value === order.status) || statuses[0]
                        const StatusIcon = currentStatus.icon
                        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })

                        return (
                            <div
                                key={order._id}
                                className="rounded-2xl border border-border bg-card p-4"
                            >
                                {/* Order header */}
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{orderDate}</p>
                                        <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/60">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${currentStatus.color}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            <span className="text-[11px] font-semibold">{currentStatus.label}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">₹{order.totalAmount}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mt-3 flex flex-col gap-1.5">
                                    {order.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.grind} · {item.weightKg}kg · ₹{item.pricePerKg}/kg
                                                    {item.isSubscription && <span className="ml-1 text-success font-semibold">Monthly</span>}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-foreground">
                                                ₹{item.pricePerKg * item.weightKg}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Status update buttons */}
                                <div className="mt-4 border-t border-border pt-3">
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">Update Status:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {statuses.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => handleStatusChange(order._id, s.value)}
                                                disabled={order.status === s.value}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${order.status === s.value
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'
                                                    }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
