import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Minus, Plus, ShoppingCart, ShieldCheck, Factory, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useCart, type GrindType } from '@/lib/cart-context'
import { productsAPI, type ProductData, getImageUrl } from '@/lib/api'

const grindOptions: { value: GrindType; label: string; hint: string }[] = [
    { value: 'Fine', label: 'Fine', hint: 'Best for soft rotis' },
    { value: 'Medium', label: 'Medium', hint: 'Great for parathas' },
    { value: 'Coarse', label: 'Coarse', hint: 'Ideal for missi roti' },
]

export function ProductPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addItem } = useCart()

    const [product, setProduct] = useState<ProductData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [grind, setGrind] = useState<GrindType>('Fine')
    const [weight, setWeight] = useState(1) // in kg for default selector
    const [selectedWeightGrams, setSelectedWeightGrams] = useState<number | null>(null) // for gram options
    const [isSubscription, setIsSubscription] = useState(false)
    const [addCombo, setAddCombo] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        productsAPI.getById(id)
            .then((p) => {
                setProduct(p)
                // If product has gram weight options, default to the first one
                if (p.availableWeights && p.availableWeights.length > 0) {
                    setSelectedWeightGrams(p.availableWeights[0])
                }
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false))
    }, [id])

    const selectedGrindHint = grindOptions.find((g) => g.value === grind)?.hint

    // Determine the effective weight in kg
    const hasGramOptions = product?.availableWeights && product.availableWeights.length > 0
    const effectiveWeightKg = hasGramOptions && selectedWeightGrams
        ? selectedWeightGrams / 1000
        : weight

    const totalPrice = useMemo(() => {
        if (!product) return 0
        let price = product.pricePerKg * effectiveWeightKg
        if (isSubscription) {
            price = Math.round(price * 0.95)
        }
        if (addCombo && product.comboOffer) {
            price += product.comboOffer.price
        }
        return Math.round(price)
    }, [product, effectiveWeightKg, isSubscription, addCombo])

    const handleAddToCart = () => {
        if (!product) return
        addItem({
            id: product._id,
            name: product.name,
            pricePerKg: product.pricePerKg,
            grind,
            weightKg: effectiveWeightKg,
            image: product.image,
            isSubscription,
        })
        if (addCombo && product.comboOffer) {
            addItem({
                id: `${product.comboOffer.productName.toLowerCase().replace(/\s+/g, '-')}-combo`,
                name: product.comboOffer.productName,
                pricePerKg: product.comboOffer.price / product.comboOffer.weightKg,
                grind: 'Fine',
                weightKg: product.comboOffer.weightKg,
                image: '/images/product-besan.jpg',
                isSubscription: false,
            })
        }
        navigate(-1) // Go back to shop after adding
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                <p className="text-destructive font-medium mb-4">{error || 'Product not found'}</p>
                <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
            </div>
        )
    }

    const subscriptionPrice = Math.round(product.pricePerKg * effectiveWeightKg * 0.95)
    const regularPrice = Math.round(product.pricePerKg * effectiveWeightKg)

    return (
        <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
            {/* Header: Fixed on mobile with back button */}
            <header className="fixed top-0 inset-x-0 z-50 flex h-14 items-center px-4 backdrop-blur-md bg-background/80 border-b border-border">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 text-foreground transition-transform active:scale-95"
                    aria-label="Go back"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </header>

            {/* Product Image section */}
            <div className="relative w-full bg-secondary pt-14">
                <div className="relative aspect-square w-full md:aspect-[4/3] max-w-2xl mx-auto overflow-hidden">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                {/* Image overlay badges */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <Badge className="border-primary/20 bg-card/90 text-card-foreground backdrop-blur px-2.5 py-1">
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-success" />
                        100% Pure
                    </Badge>
                    <Badge className="border-primary/20 bg-card/90 text-card-foreground backdrop-blur px-2.5 py-1">
                        <Factory className="mr-1.5 h-3.5 w-3.5 text-primary" />
                        Fresh Milled
                    </Badge>
                </div>
            </div>

            {/* Details Section */}
            <main className="flex-1 flex flex-col px-5 py-6 gap-7 max-w-2xl mx-auto w-full">

                {/* Title & Description */}
                <div>
                    <div className="flex flex-col">
                        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                            {product.name}
                        </h1>
                        {product.nameMarathi && (
                            <p
                                className="mt-1 text-base font-medium text-primary/90"
                                style={{ fontFamily: "'Baloo 2', sans-serif" }}
                            >
                                {product.nameMarathi}
                            </p>
                        )}
                    </div>

                    <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground/90 font-medium">
                        {product.longDescription || product.shortDescription}
                    </p>

                    {product.benefits && product.benefits.length > 0 && (
                        <ul className="mt-5 flex flex-col gap-2.5 bg-secondary/30 p-4 rounded-2xl border border-border">
                            {product.benefits.map((benefit) => (
                                <li
                                    key={benefit}
                                    className="flex items-start gap-2.5 text-sm font-medium text-foreground"
                                >
                                    <div className="mt-0.5 rounded-full bg-success/20 p-0.5">
                                        <Check className="h-3 w-3 text-success" />
                                    </div>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="h-px w-full bg-border" />

                {/* Section 1: Grind Texture */}
                <div>
                    <h3 className="mb-3 text-base font-bold text-foreground flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">1</span>
                        Grind Texture
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {grindOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setGrind(option.value)}
                                className={`flex flex-col items-center justify-center rounded-xl p-3 text-sm font-semibold transition-all ${grind === option.value
                                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background scale-[0.98]'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {selectedGrindHint && (
                        <p className="mt-3 text-sm text-muted-foreground text-center font-medium bg-secondary/50 py-2 rounded-lg">
                            💡 {selectedGrindHint}
                        </p>
                    )}
                </div>

                {/* Section 2: Weight */}
                <div>
                    <h3 className="mb-3 text-base font-bold text-foreground flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">2</span>
                        Select Weight
                    </h3>

                    {hasGramOptions ? (
                        /* Gram weight pills */
                        <div className="grid grid-cols-3 gap-2">
                            {product.availableWeights!.map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setSelectedWeightGrams(w)}
                                    className={`flex flex-col items-center justify-center rounded-xl p-3.5 text-sm font-semibold transition-all ${selectedWeightGrams === w
                                        ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background scale-[0.98]'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                                        }`}
                                >
                                    <span className="text-base font-bold">{w >= 1000 ? `${w / 1000} kg` : `${w} gm`}</span>
                                    <span className="text-xs mt-0.5 opacity-80">₹{Math.round(product.pricePerKg * w / 1000)}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Default kg +/- selector */
                        <div className="flex items-center justify-between p-2 rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl text-primary bg-primary/5 hover:bg-primary/20 hover:text-primary active:scale-95"
                                    onClick={() => setWeight(Math.max(1, weight - 1))}
                                    aria-label="Decrease weight"
                                    disabled={weight <= 1}
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>
                                <span className="w-20 text-center text-xl font-bold text-foreground tabular-nums tracking-tight">
                                    {weight} kg
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl text-primary bg-primary/5 hover:bg-primary/20 hover:text-primary active:scale-95"
                                    onClick={() => setWeight(Math.min(25, weight + 1))}
                                    aria-label="Increase weight"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="pr-4 text-right">
                                <span className="block text-sm font-medium text-muted-foreground">Price</span>
                                <span className="block font-bold text-lg text-primary">₹{product.pricePerKg}/kg</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 3: Delivery Type */}
                <div>
                    <h3 className="mb-3 text-base font-bold text-foreground flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">3</span>
                        Delivery Mode
                    </h3>
                    <div className="flex flex-col gap-3">
                        {/* One-time purchase */}
                        <button
                            onClick={() => setIsSubscription(false)}
                            className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all ${!isSubscription
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border bg-card hover:border-muted-foreground/30'
                                }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div
                                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 transition-colors ${!isSubscription
                                        ? 'border-primary bg-primary'
                                        : 'border-muted-foreground/30 bg-secondary'
                                        }`}
                                >
                                    {!isSubscription && (
                                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-foreground">One-time Order</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Buy once, delivered fresh</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-foreground">
                                {'₹'}{regularPrice}
                            </span>
                        </button>

                        {/* Subscription */}
                        <button
                            onClick={() => setIsSubscription(true)}
                            className={`relative flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all overflow-hidden ${isSubscription
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border bg-card hover:border-muted-foreground/30'
                                }`}
                        >
                            <div className="absolute top-0 right-0 bg-success px-2 py-0.5 rounded-bl-lg text-[10px] font-bold text-white tracking-wide uppercase">
                                SAVE 5%
                            </div>
                            <div className="flex items-center gap-3.5">
                                <div
                                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 transition-colors ${isSubscription
                                        ? 'border-primary bg-primary'
                                        : 'border-muted-foreground/30 bg-secondary'
                                        }`}
                                >
                                    {isSubscription && (
                                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-foreground">Monthly Subscription</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Auto-delivered every month</p>
                                </div>
                            </div>
                            <div className="text-right mt-1">
                                <span className="block text-lg font-bold text-success leading-tight">
                                    {'₹'}{subscriptionPrice}
                                </span>
                                <span className="text-xs text-muted-foreground line-through font-medium">
                                    {'₹'}{regularPrice}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Section 4: Combo Offer */}
                {product.comboOffer && (
                    <div className="pt-2">
                        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Special Add-on
                        </h4>
                        <label
                            className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${addCombo
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-dashed border-border bg-secondary/30 hover:border-muted-foreground/30'
                                }`}
                        >
                            <Checkbox
                                className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                checked={addCombo}
                                onCheckedChange={(checked) => setAddCombo(checked === true)}
                            />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-foreground leading-tight">
                                    Add {product.comboOffer.weightKg}kg {product.comboOffer.productName}
                                </p>
                                <p className="text-[13px] text-muted-foreground mt-1">
                                    Perfectly pairs with {product.name.toLowerCase()}
                                </p>
                            </div>
                            <div className="rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-black text-primary">
                                +{'₹'}{product.comboOffer.price}
                            </div>
                        </label>
                    </div>
                )}
            </main>

            {/* Sticky Floating Action Bar for Add to Cart */}
            <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-safe bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    <div className="pl-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
                        <p className="text-3xl font-black tracking-tight text-foreground">
                            {'₹'}{totalPrice}
                        </p>
                    </div>
                    <Button
                        onClick={handleAddToCart}
                        className="h-14 flex-1 max-w-[200px] rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>
                </div>
            </div>

            <style>{`
                /* Safe area helper for iOS */
                .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 1rem); }
            `}</style>
        </div>
    )
}
