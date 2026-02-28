const express = require('express')
const Order = require('../models/Order')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

// ──────────────────────────────────────────────────────
// USER ROUTES
// ──────────────────────────────────────────────────────

// POST place a new order
// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount, deliveryAddress } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order.' })
        }

        /*
         🎓 LESSON: req.user
         
         Remember our authMiddleware? It decoded the JWT and added
         the user info to req.user. So here we know exactly who is
         placing the order without them telling us — the token proves it.
        */
        const order = await Order.create({
            userId: req.user.userId,
            items,
            totalAmount,
            deliveryAddress: deliveryAddress || '',
            status: 'Received',
        })

        res.status(201).json(order)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// GET my orders (logged-in user's own orders)
// GET /api/orders/my
router.get('/my', authMiddleware, async (req, res) => {
    try {
        /*
         🎓 LESSON: .populate()
         
         Our order stores productId (just an ID reference).
         .populate('items.productId', 'name image') tells Mongoose:
         "Replace the productId with the actual Product document,
          but only give me the name and image fields."
         
         This avoids storing duplicate product data in every order.
        */
        const orders = await Order.find({ userId: req.user.userId })
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 }) // Newest first

        res.json(orders)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch orders.' })
    }
})

// ──────────────────────────────────────────────────────
// ADMIN ROUTES
// ──────────────────────────────────────────────────────

// GET all orders (admin view)
// GET /api/orders/admin/all
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'mobile name')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 })

        res.json(orders)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch orders.' })
    }
})

// PUT update order status (admin only)
// PUT /api/orders/:id/status
router.put('/:id/status', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status } = req.body
        const validStatuses = ['Received', 'Dispatched', 'Delivered']

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' })
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' })
        }

        res.json(order)
    } catch (err) {
        res.status(500).json({ message: 'Failed to update order status.' })
    }
})

module.exports = router
