import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type GrindType = 'Fine' | 'Medium' | 'Coarse'

export interface CartItem {
    id: string
    name: string
    pricePerKg: number
    grind: GrindType
    weightKg: number
    image: string
    isSubscription?: boolean
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string, grind: GrindType) => void
    updateQuantity: (id: string, grind: GrindType, weightKg: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const addItem = useCallback((item: CartItem) => {
        setItems((prev) => {
            const existingIndex = prev.findIndex(
                (i) => i.id === item.id && i.grind === item.grind
            )
            if (existingIndex > -1) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    weightKg: updated[existingIndex].weightKg + item.weightKg,
                }
                return updated
            }
            return [...prev, item]
        })
        setIsOpen(true)
    }, [])

    const removeItem = useCallback((id: string, grind: GrindType) => {
        setItems((prev) => prev.filter((i) => !(i.id === id && i.grind === grind)))
    }, [])

    const updateQuantity = useCallback(
        (id: string, grind: GrindType, weightKg: number) => {
            if (weightKg <= 0) {
                removeItem(id, grind)
                return
            }
            setItems((prev) =>
                prev.map((i) =>
                    i.id === id && i.grind === grind ? { ...i, weightKg } : i
                )
            )
        },
        [removeItem]
    )

    const clearCart = useCallback(() => setItems([]), [])

    const totalItems = items.reduce((sum, item) => sum + item.weightKg, 0)
    const totalPrice = items.reduce((sum, item) => {
        const linePrice = item.pricePerKg * item.weightKg
        return sum + (item.isSubscription ? Math.round(linePrice * 0.95) : linePrice)
    }, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isOpen,
                setIsOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
