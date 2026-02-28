const express = require('express')
const multer = require('multer')
const path = require('path')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

/*
 🎓 LESSON: Handling File Uploads with Multer
 
 Multer is a middleware that handles multipart/form-data,
 which is specifically used for uploading files.
 
 1. We create a "storage" configuration to tell multer where
    to save the files and what name to give them.
 2. We use path.extname() to keep the original file extension (e.g. .jpg, .png)
*/

const fs = require('fs')

// Use absolute path so it works regardless of where the server is started from
const uploadsDir = path.join(__dirname, '..', 'uploads')

// Auto-create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        // Name the file securely using timestamp + random number to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

// Only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Not an image! Please upload an image.'), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    }
})

// POST /api/upload
// We protect this route so only admins can upload images
router.post('/', authMiddleware, adminOnly, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors (file too large, etc.)
            console.error('Multer Error:', err)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Max size is 15MB.' })
            }
            return res.status(400).json({ message: err.message })
        } else if (err) {
            // Other errors (file filter rejection, etc.)
            console.error('Upload Error:', err)
            return res.status(400).json({ message: err.message || 'Failed to upload image' })
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        // Return the URL to access this image
        const imageUrl = `/uploads/${req.file.filename}`
        res.json({ url: imageUrl, message: 'Image uploaded successfully' })
    })
})

module.exports = router
