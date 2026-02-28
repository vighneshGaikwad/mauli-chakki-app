import { Badge } from '@/components/ui/badge'
import { Wheat, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { getImageUrl } from '@/lib/api'

export interface Product {
    id?: string
    _id?: string
    name: string
    nameMarathi?: string
    shortDescription: string
    longDescription: string
    pricePerKg: number
    image: string
    badge?: string
    badgeVariant?: string
    benefits: string[]
    comboOffer?: {
        productName: string
        weightKg: number
        price: number
    }
}

function ProductImage({ src, alt, className }: { src: string; alt: string; className: string }) {
    const [error, setError] = useState(false)
    const fullSrc = getImageUrl(src)

    if (error || !src) {
        return (
            <div className={`flex flex-col items-center justify-center bg-secondary/40 text-muted-foreground/30 ${className}`}>
                <Wheat className="h-10 w-10 mb-2 opacity-40" />
                <span className="text-[10px] font-medium tracking-wider uppercase">No Image</span>
            </div>
        )
    }
    return (
        <img
            src={fullSrc}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    )
}

function BadgeEl({ product }: { product: Product }) {
    if (!product.badge) return null
    return (
        <Badge
            className={`absolute left-3 top-3 px-2.5 py-1 text-[9px] font-black tracking-widest uppercase shadow-sm border-0 ${product.badgeVariant === 'health'
                ? 'bg-success text-success-foreground'
                : 'bg-primary text-primary-foreground'
                }`}
        >
            {product.badge}
        </Badge>
    )
}

/** Compact vertical card — used in the 2-column grid */
export function ProductCard({
    product,
    onSelect,
}: {
    product: Product
    onSelect: () => void
}) {
    return (
        <div
            className="group flex flex-col overflow-hidden rounded-[20px] bg-card border border-border/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] active:scale-[0.97] transition-all duration-300 cursor-pointer"
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelect() }}
        >
            {/* Image Box */}
            <div className="relative aspect-square overflow-hidden bg-secondary/30 p-2 pb-0">
                <div className="w-full h-full rounded-t-[14px] rounded-b-[6px] overflow-hidden relative shadow-inner">
                    <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <BadgeEl product={product} />
                </div>
            </div>

            {/* Content Box */}
            <div className="flex flex-col flex-1 p-3.5 pt-3">
                <h3 className="font-serif text-[13.5px] font-bold leading-snug text-foreground line-clamp-2 mb-1">
                    {product.name}
                </h3>
                <div className="mt-auto flex items-end justify-between pt-2">
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-[17px] font-black tracking-tight text-primary">
                            ₹{product.pricePerKg}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">/kg</span>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </div>
                </div>
            </div>
        </div>
    )
}
