const mongoose = require('mongoose')

/*
 🎓 LESSON: What is a Mongoose Schema?
 
 MongoDB stores data as documents (like JSON objects).
 A Schema tells Mongoose the SHAPE of each document:
 - what fields it has
 - what type each field is (String, Number, etc.)
 - which fields are required
 
 Think of it like a blueprint for your data.
*/

const userSchema = new mongoose.Schema(
    {
        mobile: {
            type: String,
            required: true,
            unique: true, // No two users can have the same mobile number
            trim: true,   // Removes extra spaces accidentally added
        },
        password: {
            type: String,
            minlength: 4, // Minimum 4 characters for password
        },
        name: {
            type: String,
            trim: true,
            default: '',
        },
        role: {
            type: String,
            enum: ['user', 'admin'], // Only these two values are allowed
            default: 'user',
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
)

/*
 🎓 LESSON: What is mongoose.model()?
 
 This creates a "Model" from our schema.
 A Model is a class that lets us:
 - Create new documents: User.create({ mobile: '...' })
 - Find documents: User.findOne({ mobile: '...' })
 - Update documents: User.updateOne(...)
 - Delete documents: User.deleteOne(...)
*/
module.exports = mongoose.model('User', userSchema)
