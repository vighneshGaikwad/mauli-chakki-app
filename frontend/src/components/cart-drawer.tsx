import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { ordersAPI, getImageUrl } from '@/lib/api'

/*
 🎓 LESSON: WhatsApp-Only Checkout
 
 Since we don't have a payment gateway yet, users checkout
 via WhatsApp. The order message is sent directly to the
 ADMIN's WhatsApp number so they receive it immediately.
 
 The message includes:
 - Customer's mobile number (from auth)
 - All items with grind, weight, price
 - Total amount
 
 The admin number is set here. In a production app, you might
 fetch this from the backend config instead.
*/

// 👇 This is the admin's WhatsApp number — messages go here
const ADMIN_WHATSAPP = '918237866355' // Format: country code + number (no +)

export function CartDrawer() {
    const {
        items,
        removeItem,
        updateQuantity,
        totalPrice,
        clearCart,
        isOpen,
        setIsOpen,
    } = useCart()
    const { user } = useAuth()
    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const [checkoutError, setCheckoutError] = useState('')
    const navigate = useNavigate()

    const handleWhatsAppCheckout = async () => {
        setCheckoutError('')
        setCheckoutLoading(true)

        try {
            // 1. Save order to database so history works
            const orderItems = items.map((item) => ({
                productId: item.id,
                name: item.name,
                grind: item.grind,
                weightKg: item.weightKg,
                pricePerKg: item.pricePerKg,
                isSubscription: item.isSubscription || false,
            }))

            await ordersAPI.placeOrder(orderItems, totalPrice)

            // 2. Format WhatsApp message
            const now = new Date()
            const date = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

            const itemsList = items
                .map((item, i) => {
                    const linePrice = item.isSubscription
                        ? Math.round(item.pricePerKg * item.weightKg * 0.95)
                        : Math.round(item.pricePerKg * item.weightKg)
                    const sub = item.isSubscription ? '\n   - _Monthly Subscription (5% off)_' : ''
                    const weightDisplay = item.weightKg >= 1
                        ? `${item.weightKg}kg`
                        : `${Math.round(item.weightKg * 1000)}gm`
                    return `${i + 1}. *${item.name}*\n   - Grind: ${item.grind}\n   - Qty: ${weightDisplay} (Rs.${item.pricePerKg}/kg)\n   - Subtotal: *Rs.${linePrice}*${sub}`
                })
                .join('\n\n')

            const customerMobile = user ? user.mobile : 'N/A'

            const message = [
                `-----------------------------`,
                `*NEW ORDER*`,
                `*Mauli Chakki Fresh Aatta*`,
                `-----------------------------`,
                ``,
                `Date: ${date} | Time: ${time}`,
                `Customer: +91 ${customerMobile}`,
                ``,
                `*Order Details:*`,
                ``,
                itemsList,
                ``,
                `-----------------------------`,
                `*Grand Total: Rs.${totalPrice}*`,
                `-----------------------------`,
                ``,
                `_Please confirm availability and delivery details._`,
            ].join('\n')

            // 3. Clear cart, open WhatsApp, redirect to My Orders
            const encoded = encodeURIComponent(message)
            window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encoded}`, '_blank')

            clearCart()
            setIsOpen(false)
            navigate('/my-orders')

        } catch (err: unknown) {
            setCheckoutError(err instanceof Error ? err.message : 'Failed to save order. Please try again.')
        } finally {
            setCheckoutLoading(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent
                side="right"
                className="border-l border-border bg-background"
            >
                <SheetHeader className="border-b border-border pb-4">
                    <SheetTitle className="font-serif text-xl text-foreground">
                        Your Cart
                    </SheetTitle>
                    <SheetDescription>
                        {items.length === 0
                            ? 'Your cart is empty'
                            : `${items.length} item${items.length > 1 ? 's' : ''} in your cart`}
                    </SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                            >
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                <path d="M3 6h18" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Add some fresh aatta to get started!
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="flex flex-col gap-4">
                            {items.map((item) => (
                                <div
                                    key={`${item.id}-${item.grind}`}
                                    className="flex gap-3 rounded-lg border border-border bg-card p-3"
                                >
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-sm font-semibold text-card-foreground">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.grind} grind
                                                    {item.isSubscription && (
                                                        <span className="ml-1.5 inline-flex items-center rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                                                            Monthly
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeItem(item.id, item.grind)}
                                                aria-label={`Remove ${item.name}`}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center self-start rounded-md border border-border">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.grind, item.weightKg - (item.weightKg < 1 ? item.weightKg : 1))
                                                    }
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-12 text-center text-xs font-semibold text-card-foreground">
                                                    {item.weightKg >= 1
                                                        ? `${item.weightKg}kg`
                                                        : `${Math.round(item.weightKg * 1000)}gm`}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.grind, item.weightKg + (item.weightKg < 1 ? item.weightKg : 1))
                                                    }
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <span className="text-sm font-bold text-primary">
                                                {'₹'}{item.isSubscription
                                                    ? Math.round(item.pricePerKg * item.weightKg * 0.95)
                                                    : item.pricePerKg * item.weightKg}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {items.length > 0 && (
                    <SheetFooter className="border-t border-border pt-4">
                        <div className="flex w-full flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-base font-semibold text-foreground">
                                    Total
                                </span>
                                <span className="text-xl font-bold text-primary">
                                    {'₹'}{totalPrice}
                                </span>
                            </div>
                            <Button
                                onClick={handleWhatsAppCheckout}
                                className="h-12 w-full gap-2 bg-success text-success-foreground hover:bg-success/90"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Order via WhatsApp — ₹{totalPrice}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}
