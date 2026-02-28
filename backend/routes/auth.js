const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

/*
 🎓 LESSON: Simple Password-Based Authentication
 
 This is a straightforward login system:
 - Users register with mobile number and password
 - Users login with mobile number and password
 - Admin users are detected by matching ADMIN_MOBILE in .env
*/

// ─────────────────────────────────────────────
// ROUTE 1: Register
// POST /api/auth/register
// Body: { mobile: "9876543210", password: "1234", name: "John" }
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { mobile, password, name } = req.body

        // Validate mobile number
        if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' })
        }

        // Validate password
        if (!password || password.length < 4) {
            return res.status(400).json({ message: 'Password must be at least 4 characters.' })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ mobile })
        
        // Check if this is an admin mobile
        const adminMobiles = (process.env.ADMIN_MOBILES || process.env.ADMIN_MOBILE || '').split(',').map(m => m.trim())
        const isAdmin = adminMobiles.includes(mobile)
        const role = isAdmin ? 'admin' : 'user'

        let user
        if (existingUser) {
            // If user exists but has no password (from old OTP system), set password
            if (!existingUser.password) {
                existingUser.password = password
                existingUser.name = name || existingUser.name
                existingUser.role = role
                await existingUser.save()
                user = existingUser
                console.log(`Password set for existing user: ${mobile}`)
            } else {
                return res.status(400).json({ message: 'Mobile number already registered. Please login.' })
            }
        } else {
            // Create new user
            user = await User.create({
                mobile,
                password,
                name: name || '',
                role,
            })
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, mobile: user.mobile, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: {
                id: user._id,
                mobile: user.mobile,
                name: user.name,
                role: user.role,
            },
        })
    } catch (err) {
        console.error('register error:', err)
        res.status(500).json({ message: 'Server error. Please try again.' })
    }
})

// ─────────────────────────────────────────────
// ROUTE 2: Login
// POST /api/auth/login
// Body: { mobile: "9876543210", password: "1234" }
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body

        // Validate input
        if (!mobile || !password) {
            return res.status(400).json({ message: 'Mobile number and password are required.' })
        }

        // Find user by mobile
        const user = await User.findOne({ mobile })

        if (!user) {
            return res.status(400).json({ message: 'Mobile number not registered. Please create an account first.' })
        }

        // Handle users from old OTP system (no password set)
        // If user has no password, set the provided password
        if (!user.password) {
            user.password = password
            await user.save()
            console.log(`Password set for existing user: ${mobile}`)
        } else if (user.password !== password) {
            // Check password (simple comparison - in production use bcrypt)
            return res.status(400).json({ message: 'Incorrect password. Please try again or register with a new number.' })
        }

        // Update role if admin mobiles changed in env
        const adminMobiles = (process.env.ADMIN_MOBILES || process.env.ADMIN_MOBILE || '').split(',').map(m => m.trim())
        const isAdmin = adminMobiles.includes(mobile)
        if (isAdmin && user.role !== 'admin') {
            user.role = 'admin'
            await user.save()
        } else if (!isAdmin && user.role === 'admin') {
            user.role = 'user'
            await user.save()
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, mobile: user.mobile, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                mobile: user.mobile,
                name: user.name,
                role: user.role,
            },
        })
    } catch (err) {
        console.error('login error:', err)
        res.status(500).json({ message: 'Server error. Please try again.' })
    }
})

// ─────────────────────────────────────────────
// ROUTE 3: Get current logged-in user
// GET /api/auth/me
// Header: Authorization: Bearer <token>
// ─────────────────────────────────────────────
const { authMiddleware } = require('../middleware/auth')

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found.' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: 'Server error.' })
    }
})

module.exports = router
