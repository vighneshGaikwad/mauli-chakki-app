/*
 🎓 LESSON: Centralizing API Calls
 
 Instead of writing fetch() calls scattered everywhere,
 we put ALL backend calls in ONE file.
 
 Benefits:
 - If the backend URL changes, you update it in ONE place
 - Easy to add the auth token to every request
 - All your API calls are documented in one file
 - Easier to debug network issues
*/

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

// Helper to get full image URL from a relative path
export function getImageUrl(path: string): string {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${BACKEND_URL}${path}`
}

// ─── Helper: Make a request with auth token ─────────────────
/*
 🎓 LESSON: What this helper does
 
 Every time we call the backend, we need to:
 1. Set the correct Content-Type header
 2. Attach the JWT token (if logged in)
 3. Parse the JSON response
 4. Handle errors
 
 This function does all of that, so our actual API functions
 can be simple one-liners.
*/
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem('chakki-token')

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    }

    // If we have a token, attach it to the request
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
    }

    return data as T
}

// ─── Auth API ───────────────────────────────────────────────

export const authAPI = {
    login: (mobile: string, password: string) =>
        request<{
            message: string
            token: string
            user: { id: string; mobile: string; name: string; role: string }
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ mobile, password }),
        }),

    register: (mobile: string, password: string, name?: string) =>
        request<{
            message: string
            token: string
            user: { id: string; mobile: string; name: string; role: string }
        }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ mobile, password, name }),
        }),

    getMe: () => request<{ _id: string; mobile: string; name: string; role: string }>('/auth/me'),
}

// ─── Products API ───────────────────────────────────────────

export interface ProductData {
    _id: string
    name: string
    nameMarathi?: string
    shortDescription: string
    longDescription: string
    pricePerKg: number
    image: string
    badge?: string
    badgeVariant?: string
    benefits: string[]
    availableWeights?: number[] // Weight options in grams, e.g. [100, 200, 500]. Empty = default kg selector
    comboOffer?: {
        productName: string
        weightKg: number
        price: number
    }
    isActive: boolean
}

export const productsAPI = {
    getAll: () => request<ProductData[]>('/products'),

    getById: (id: string) => request<ProductData>(`/products/${id}`),

    // Admin only
    getAllAdmin: () => request<ProductData[]>('/products/admin/all'),

    create: (product: Partial<ProductData>) =>
        request<ProductData>('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        }),

    update: (id: string, updates: Partial<ProductData>) =>
        request<ProductData>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/products/${id}`, {
            method: 'DELETE',
        }),

    hardDelete: (id: string) =>
        request<{ message: string }>(`/products/hard/${id}`, {
            method: 'DELETE',
        }),

    uploadImage: async (file: File) => {
        const formData = new FormData()
        formData.append('image', file)

        // Custom request since we don't send JSON for file uploads
        const token = localStorage.getItem('chakki-token')
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
            headers,
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || 'Failed to upload image')
        }

        return data
    }
}

// ─── Orders API ─────────────────────────────────────────────

export interface OrderData {
    _id: string
    userId: string
    items: {
        productId: string
        name: string
        nameMarathi?: string
        grind: string
        weightKg: number
        pricePerKg: number
        isSubscription: boolean
    }[]
    totalAmount: number
    status: string
    createdAt: string
}

export const ordersAPI = {
    placeOrder: (items: OrderData['items'], totalAmount: number) =>
        request<OrderData>('/orders', {
            method: 'POST',
            body: JSON.stringify({ items, totalAmount }),
        }),

    getMyOrders: () => request<OrderData[]>('/orders/my'),

    // Admin only
    getAllOrders: () => request<OrderData[]>('/orders/admin/all'),

    updateStatus: (orderId: string, status: string) =>
        request<OrderData>(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
}
