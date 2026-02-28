const mongoose = require('mongoose')

/*
 🎓 LESSON: Nested objects in Schemas
 
 MongoDB documents can contain nested objects.
 Here comboOffer is an object nested inside a Product.
 This is one of MongoDB's big advantages over SQL — you
 can store related data together in one document.
*/

const comboOfferSchema = new mongoose.Schema(
    {
        productName: String,
        weightKg: Number,
        price: Number,
    },
    { _id: false } // We don't need a separate ID for the combo offer
)

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        nameMarathi: {
            type: String,
            trim: true,
            default: '',
        },
        shortDescription: {
            type: String,
            required: true,
        },
        longDescription: {
            type: String,
            required: true,
        },
        pricePerKg: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String,
            default: '/images/placeholder.jpg',
        },
        badge: {
            type: String,
            default: '',
        },
        badgeVariant: {
            type: String,
            enum: ['bestseller', 'health', ''],
            default: '',
        },
        benefits: {
            type: [String], // An array of strings
            default: [],
        },
        availableWeights: {
            type: [Number], // Weight options in grams, e.g. [100, 200, 500]
            default: [],    // Empty = use default kg +/- selector
        },
        comboOffer: {
            type: comboOfferSchema,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true, // Admin can hide a product without deleting it
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Product', productSchema)
