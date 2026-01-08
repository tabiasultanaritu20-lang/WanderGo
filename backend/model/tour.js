const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    // --- Basic Info ---
    title: {
        type: String,
        required: [true, 'A tour must have a title'],
        trim: true,
        minlength: [10, 'A tour title must have more than 10 characters']
    },
    category: {
        type: String,
        required: [true, 'A tour must have a category'],
        enum: ["Adventure", "Cultural", "Relaxation", "Beach", "Hiking", "Wildlife", "City", "Cruise"]
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: ["Easy", "Medium", "Hard", "Extreme"]
    },

    // --- Logistics ---
    destinationCountry: { type: String, required: true },
    destinationCity: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxGroupSize: { type: Number, required: true },
    pricePerPerson: { type: Number, required: true },

    // --- Description ---
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },

    // --- Visuals ---
    coverImage: { type: String, required: true },
    images: [String],

    // --- Details ---
    inclusions: [String],
    exclusions: [String],

    // --- Itinerary ---
    itinerary: [{
        day: Number,
        title: String,
        description: String
    }],

    // --- Meta ---
    // FIX IS HERE: Renamed 'agencyId' to 'agency' to match Controller logic
    agency: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A tour must belong to an agency']
    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now(), select: false }
});

tourSchema.virtual('reviews', {
    ref: 'Review',       // The name of your Review model
    foreignField: 'tour', // The field in Review model that refers to this Tour
    localField: '_id'
});

// Ensure virtuals show up in JSON output
tourSchema.set('toJSON', { virtuals: true });
tourSchema.set('toObject', { virtuals: true });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;