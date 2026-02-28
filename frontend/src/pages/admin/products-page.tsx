import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Upload } from 'lucide-react'
import { productsAPI, type ProductData, getImageUrl } from '@/lib/api'

/*
 🎓 LESSON: Admin Products Page
 
 This page lets the admin:
 - View ALL products (including hidden ones)
 - Add new products
 - Edit existing products (name, price, description, etc.)
 - Hide/show products (soft delete)
 
 It uses a modal form for both adding and editing.
 The form is the same — when editing, it pre-fills with existing data.
*/

// Empty product template for the "Add" form
const emptyProduct = {
    name: '',
    nameMarathi: '',
    shortDescription: '',
    longDescription: '',
    pricePerKg: 0,
    image: '',
    badge: '',
    badgeVariant: '',
    benefits: [] as string[],
    availableWeights: [] as number[],
    comboOffer: null as { productName: string; weightKg: number; price: number } | null,
}

export function AdminProductsPage() {
    const [products, setProducts] = useState<ProductData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null) // null = adding new
    const [form, setForm] = useState(emptyProduct)
    const [benefitsInput, setBenefitsInput] = useState('')
    const [weightsInput, setWeightsInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    // Load products
    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const data = await productsAPI.getAllAdmin()
            setProducts(data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    // Open form for adding
    const handleAdd = () => {
        setEditingId(null)
        setForm(emptyProduct)
        setBenefitsInput('')
        setWeightsInput('')
        setSaveError('')
        setShowForm(true)
    }

    // Open form for editing
    const handleEdit = (product: ProductData) => {
        setEditingId(product._id)
        setForm({
            name: product.name,
            nameMarathi: product.nameMarathi || '',
            shortDescription: product.shortDescription,
            longDescription: product.longDescription,
            pricePerKg: product.pricePerKg,
            image: product.image,
            badge: product.badge || '',
            badgeVariant: product.badgeVariant || '',
            benefits: product.benefits || [],
            availableWeights: product.availableWeights || [],
            comboOffer: product.comboOffer || null,
        })
        setBenefitsInput((product.benefits || []).join(', '))
        setWeightsInput((product.availableWeights || []).join(', '))
        setSaveError('')
        setShowForm(true)
    }

    // Save (create or update)
    const handleSave = async () => {
        if (!form.name || !form.shortDescription || !form.pricePerKg) {
            setSaveError('Name, description, and price are required.')
            return
        }

        setSaving(true)
        setSaveError('')

        try {
            const productData: Partial<ProductData> = {
                ...form,
                comboOffer: form.comboOffer || undefined,
                benefits: benefitsInput.split(',').map(b => b.trim()).filter(Boolean),
                availableWeights: weightsInput
                    .split(',')
                    .map(w => Number(w.trim()))
                    .filter(w => !isNaN(w) && w > 0),
            }

            if (!productData.comboOffer) {
                delete productData.comboOffer
            }

            if (editingId) {
                await productsAPI.update(editingId, productData)
            } else {
                await productsAPI.create(productData)
            }

            setShowForm(false)
            loadProducts() // Refresh list
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save product')
        } finally {
            setSaving(false)
        }
    }

    // Toggle visibility (soft delete)
    const handleToggleActive = async (product: ProductData) => {
        try {
            if (product.isActive) {
                await productsAPI.delete(product._id)
            } else {
                await productsAPI.update(product._id, { isActive: true })
            }
            loadProducts()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update product')
        }
    }

    // Permanently delete product (hard delete)
    const handleHardDelete = async (product: ProductData) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`)) {
            return
        }
        try {
            await productsAPI.hardDelete(product._id)
            loadProducts()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete product permanently')
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
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Products</h1>
                    <p className="text-sm text-muted-foreground">{products.length} products total</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

            {/* Products list */}
            <div className="flex flex-col gap-3">
                {products.map((product) => (
                    <div
                        key={product._id}
                        className={`flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-opacity ${!product.isActive ? 'opacity-50' : ''
                            }`}
                    >
                        {/* Image */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                            {product.image && (
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-bold text-card-foreground">
                                    {product.name}
                                </h3>
                                {product.badge && (
                                    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                        {product.badge}
                                    </span>
                                )}
                            </div>
                            {product.nameMarathi && (
                                <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                                    {product.nameMarathi}
                                </p>
                            )}
                            <p className="mt-0.5 text-sm font-bold text-primary">₹{product.pricePerKg}/kg</p>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                onClick={() => handleEdit(product)}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleToggleActive(product)}
                                className={`rounded-lg p-2 ${product.isActive
                                    ? 'text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500'
                                    : 'text-success hover:bg-success/10'
                                    }`}
                                title={product.isActive ? 'Hide product' : 'Show product'}
                            >
                                {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => handleHardDelete(product)}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-1"
                                title="Permanently Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-card-foreground">
                                {editingId ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="rounded-lg p-1 hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Name */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-card-foreground">
                                    Product Name *
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. MP Sharbati Aatta"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Name Marathi */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-card-foreground">
                                    Name (Marathi)
                                </label>
                                <input
                                    value={form.nameMarathi}
                                    onChange={(e) => setForm({ ...form, nameMarathi: e.target.value })}
                                    placeholder="e.g. एम.पी. शरबती आटा"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    style={{ fontFamily: "'Baloo 2', sans-serif" }}
                                />
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-card-foreground">
                                    Short Description *
                                </label>
                                <input
                                    value={form.shortDescription}
                                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                                    placeholder="One-line description"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Long Description */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-card-foreground">
                                    Long Description
                                </label>
                                <textarea
                                    value={form.longDescription}
                                    onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                                    placeholder="Detailed description"
                                    rows={3}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-card-foreground">
                                    Price per Kg (₹) *
                                </label>
                                <input
                                    type="number"
                                    value={form.pricePerKg || ''}
                                    onChange={(e) => setForm({ ...form, pricePerKg: Number(e.target.value) })}
                                    placeholder="e.g. 55"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-card-foreground">
                                    Product Image
                                </label>

                                {form.image ? (
                                    <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl border border-border bg-secondary">
                                        <img
                                            src={getImageUrl(form.image)}
                                            alt="Preview"
                                            className="h-full w-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, image: '' })}
                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative mb-2 flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card hover:bg-secondary/50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return

                                                try {
                                                    setSaveError('')
                                                    const res = await productsAPI.uploadImage(file)
                                                    setForm({ ...form, image: res.url })
                                                } catch (err: unknown) {
                                                    setSaveError(err instanceof Error ? err.message : 'Failed to upload image')
                                                }
                                            }}
                                        />
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-medium text-muted-foreground">Tap to upload image</p>
                                    </div>
                                )}

                                <input
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    placeholder="Or paste URL here (e.g. /images/product.jpg or https://...)"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Badge */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-card-foreground">
                                        Badge Text
                                    </label>
                                    <input
                                        value={form.badge}
                                        onChange={(e) => setForm({ ...form, badge: e.target.value })}
                                        placeholder="e.g. Bestseller"
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-card-foreground">
                                        Badge Variant
                                    </label>
                                    <select
                                        value={form.badgeVariant}
                                        onChange={(e) => setForm({ ...form, badgeVariant: e.target.value })}
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                                    >
                                        <option value="">None</option>
                                        <option value="bestseller">Bestseller</option>
                                        <option value="health">Health</option>
                                    </select>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-card-foreground">
                                    Benefits (comma-separated)
                                </label>
                                <input
                                    value={benefitsInput}
                                    onChange={(e) => setBenefitsInput(e.target.value)}
                                    placeholder="e.g. High protein, Rich fiber, No additives"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Available Weights */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-card-foreground">
                                    Weight Options in grams (comma-separated)
                                </label>
                                <input
                                    value={weightsInput}
                                    onChange={(e) => setWeightsInput(e.target.value)}
                                    placeholder="e.g. 100, 200, 500 (leave empty for default kg selector)"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    If set, customers will see these weight options instead of the kg +/- selector.
                                </p>
                            </div>

                            {saveError && (
                                <p className="text-xs font-medium text-destructive">{saveError}</p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    ) : editingId ? (
                                        'Save Changes'
                                    ) : (
                                        'Add Product'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
