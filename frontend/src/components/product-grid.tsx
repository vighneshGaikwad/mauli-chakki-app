import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductCard, type Product } from '@/components/product-card'
import { productsAPI } from '@/lib/api'

export function ProductGrid() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        productsAPI.getAll()
            .then(setProducts)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleSelectProduct = (product: Product) => {
        navigate(`/product/${product._id || product.id}`)
    }

    if (loading) {
        return (
            <section id="shop" className="px-4 py-20 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-sm text-muted-foreground">Loading fresh products...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section id="shop" className="px-4 py-20 text-center">
                <p className="text-sm text-destructive">{error}</p>
            </section>
        )
    }

    if (products.length === 0) {
        return (
            <section id="shop" className="px-4 py-20 text-center">
                <p className="text-sm text-muted-foreground">No products available at the moment.</p>
            </section>
        )
    }

    return (
        <section id="shop" className="px-4 py-8">
            <div className="mb-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Our Products
                </p>
                <h2 className="mt-1.5 font-serif text-2xl text-foreground">
                    The Freshest Flour, Always
                </h2>
                <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
                    Choose your flour, pick your grind, and we mill it fresh.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id || product._id}
                        product={product}
                        onSelect={() => handleSelectProduct(product)}
                    />
                ))}
            </div>
        </section>
    )
}

