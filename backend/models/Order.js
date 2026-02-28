const mongoose = require('mongoose')

/*
 🎓 LESSON: References between collections (like SQL foreign keys)
 
 In MongoDB we can link documents from different collections
 using ObjectId references. Here each Order has a userId that
 points to a User document.
 
 This is how you model relationships in MongoDB:
 - ref: 'User' tells Mongoose which collection to look in
 - We can later use .populate('userId') to get the full user object
*/

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: String,           // We store the name at time of order
        nameMarathi: String,    // in case product name changes later
        grind: {
            type: String,
            enum: ['Fine', 'Medium', 'Coarse'],
            required: true,
        },
        weightKg: {
            type: Number,
            required: true,
        },
        pricePerKg: Number,
        isSubscription: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Received', 'Dispatched', 'Delivered'],
            default: 'Received',
        },
        deliveryAddress: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Order', orderSchema)
