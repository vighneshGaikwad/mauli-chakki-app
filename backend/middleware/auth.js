const jwt = require('jsonwebtoken')

/*
 🎓 LESSON: What is Middleware?
 
 In Express, "middleware" is a function that runs BETWEEN
 the request coming in and your route handler running.
 
 It's like a security checkpoint — every request that needs
 authentication must pass through this function first.
 
 If the token is valid → it calls next() to continue to the route.
 If the token is missing or invalid → it sends a 401 Unauthorized error.
 
 The flow looks like this:
 Request → [authMiddleware] → [route handler] → Response
*/

const authMiddleware = (req, res, next) => {
    // The token is sent in the request header as:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided. Please log in.' })
    }

    // Extract just the token string (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1]

    try {
        // jwt.verify() decodes the token and checks it's not tampered or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Attach the decoded user info to req.user so route handlers can use it
        // decoded will look like: { userId: '...', mobile: '...', role: 'user' }
        req.user = decoded
        next() // ✅ Token is valid, continue to the route handler
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' })
    }
}

/*
 🎓 LESSON: Role-based access control
 
 adminOnly is a middleware that runs AFTER authMiddleware.
 It checks if the logged-in user has the 'admin' role.
 Only if they do, it lets them through.
 
 Usage in routes:
 router.delete('/products/:id', authMiddleware, adminOnly, deleteProduct)
*/
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' })
    }
    next()
}

module.exports = { authMiddleware, adminOnly }
