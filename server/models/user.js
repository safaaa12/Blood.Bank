const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin','student']
    }
});

// Pre-save hook to hash the password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Hashed password:',this.password); // Log hashed password

        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Validation function using Joi
const validateUser = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .label("Email"),
        password: passwordComplexity()
            .required()
            .label("Password"),
        username: Joi.string()
            .required()
            .label("Username"),
        role: Joi.string().valid('user', 'admin','student').required().label("Role")
    });
    return schema.validate(data);
};

// Export the User model and validation function
module.exports = {
    User: mongoose.model('User', userSchema),
    validateUser
};