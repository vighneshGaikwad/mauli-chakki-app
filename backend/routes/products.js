const express = require('express')
const Product = require('../models/Product')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

/*
 🎓 LESSON: REST API Routes
 
 REST (Representational State Transfer) is a convention for API design.
 We use different HTTP methods to mean different actions:
 
 GET    /api/products          → get all products (public)
 GET    /api/products/:id      → get one product (public)
 POST   /api/products          → create a product (admin only)
 PUT    /api/products/:id      → update a product (admin only)
 DELETE /api/products/:id      → delete a product (admin only)
*/

// ──────────────────────────────────────────────────────
// PUBLIC ROUTES (no login required)
// ──────────────────────────────────────────────────────

// GET all active products
router.get('/', async (req, res) => {
    try {
        /*
         🎓 LESSON: MongoDB Queries
         
         Product.find({ isActive: true }) returns all products
         where isActive is true. Admin-hidden products won't appear.
         .sort({ createdAt: 1 }) sorts oldest first (consistent order).
        */
        const products = await Product.find({ isActive: true }).sort({ createdAt: 1 })
        res.json(products)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products.' })
    }
})

// GET one product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        res.json(product)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch product.' })
    }
})

// ──────────────────────────────────────────────────────
// ADMIN ROUTES (login + admin role required)
// authMiddleware → checks JWT token
// adminOnly     → checks role === 'admin'
// ──────────────────────────────────────────────────────

// GET all products including hidden ones (admin view)
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: 1 })
        res.json(products)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products.' })
    }
})

// POST create a new product
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const product = await Product.create(req.body)
        res.status(201).json(product) // 201 = Created
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// PUT update a product
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,        // Return updated document
                runValidators: true, // Run schema validations on update
            }
        )

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        res.json(product)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// DELETE a product completely (Hard delete)
router.delete('/hard/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        res.json({ message: 'Product permanently deleted.', product })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete product permanently.' })
    }
})

// DELETE a product (soft delete — just hides it)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        /*
         🎓 LESSON: Soft Delete vs Hard Delete
         
         Hard delete: permanently removes the document from DB.
         Soft delete: we just set isActive = false.
         
         Soft delete is safer because:
         - Existing orders still reference this product
         - Admin can re-activate it later
         - You keep your data history
        */
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        )

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        res.json({ message: 'Product hidden successfully.', product })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete product.' })
    }
})



module.exports = router
