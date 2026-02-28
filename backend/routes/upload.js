const express = require('express')
const multer = require('multer')
const { v2: cloudinary } = require('cloudinary')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

/*
 🎓 LESSON: Cloudinary for Image Hosting
 
 Instead of saving images to the server's disk (which gets
 wiped on every deploy on free platforms like Render), we
 upload them to Cloudinary — a free cloud image service.
 
 Flow:
 1. Multer receives the file in memory (not saved to disk)
 2. We upload the buffer to Cloudinary
 3. Cloudinary returns a permanent URL
 4. We send that URL back to the frontend
*/

// Configure Cloudinary with credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Use memory storage instead of disk — file stays in RAM as a buffer
const storage = multer.memoryStorage()

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

// Helper: Upload buffer to Cloudinary
function uploadToCloudinary(fileBuffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder || 'chakki-products',
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit', quality: 'auto', format: 'webp' }
                ]
            },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )
        stream.end(fileBuffer)
    })
}

// POST /api/upload
// We protect this route so only admins can upload images
router.post('/', authMiddleware, adminOnly, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Max size is 15MB.' })
            }
            return res.status(400).json({ message: err.message })
        } else if (err) {
            console.error('Upload Error:', err)
            return res.status(400).json({ message: err.message || 'Failed to upload image' })
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        try {
            // Upload to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer, 'chakki-products')
            
            // Return the Cloudinary URL (starts with https://)
            res.json({ url: result.secure_url, message: 'Image uploaded successfully' })
        } catch (uploadErr) {
            console.error('Cloudinary Upload Error:', uploadErr)
            res.status(500).json({ message: 'Failed to upload image to cloud storage' })
        }
    })
})

module.exports = router
