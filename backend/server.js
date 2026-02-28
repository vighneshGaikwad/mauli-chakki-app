/*
 🎓 LESSON: server.js — The Heart of the Backend
 
 This is the main file that:
 1. Loads environment variables from .env
 2. Creates the Express app
 3. Connects to MongoDB
 4. Registers all the middleware and routes
 5. Starts listening for requests on a port
 
 When you run "npm run dev", Node.js starts executing from this file.
*/

// ─── Step 1: Load .env variables ────────────────────────────────
// dotenv reads your .env file and puts all variables into process.env
// Must be done BEFORE anything else that uses process.env
require('dotenv').config()

// ─── Step 2: Import packages ────────────────────────────────────
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')
const uploadRoutes = require('./routes/upload')
const path = require('path')

// ─── Step 4: Create Express app ─────────────────────────────────
const app = express()

// ─── Step 5: Register global middleware ─────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174']

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}))
app.use(express.json())

// ─── Serve static files ─────────────────────────────────────────
/*
 🎓 LESSON: Serving Static Files
 
 By default, files inside your backend folder are private.
 To let the frontend load images using a URL like:
 http://localhost:5000/uploads/my-image.jpg
 
 We must explicitly tell express to serve the 'uploads' folder statically.
*/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── Step 6: Register routes ────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

// ─── Step 7: Health check route ─────────────────────────────────
// A simple route to confirm the server is running
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Chakki backend is running!' })
})

// ─── Step 8: Global error handler ──────────────────────────────
// If any route throws an error, this catches it and sends a clean response
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
})

// ─── Step 9: Connect to MongoDB, then start server ──────────────
/*
 🎓 LESSON: Why connect to DB before starting the server?
 
 We use async/await here to make sure MongoDB is fully connected
 BEFORE we start accepting requests. If MongoDB fails, we log
 the error and exit — there's no point running without a database.
*/
const PORT = process.env.PORT || 5000

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB successfully!')

        app.listen(PORT, () => {
            console.log(`🚀 Chakki backend running on http://localhost:${PORT}`)
            console.log(`📡 API available at http://localhost:${PORT}/api`)
        })
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message)
        console.error('Check your MONGODB_URI in the .env file')
        process.exit(1) // Exit the process — server can't work without DB
    }
}

startServer()
