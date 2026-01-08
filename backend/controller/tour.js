// 👇 FIX 1: Import Tour directly (no destructuring)
const Tour = require('../model/tour');

// --------------------- 1. Create Tour ---------------------
const createTour = async (req, res) => {
    try {
        console.log("Incoming Data:", req.body);

        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const agencyId = req.user._id || req.user.id;

        const tourData = {
            ...req.body,
            agency: agencyId
        };

        const newTour = new Tour(tourData);
        const savedTour = await newTour.save();

        res.status(201).json({
            success: true,
            message: "Tour created successfully",
            data: savedTour
        });

    } catch (err) {
        console.error("Create Tour Error:", err);
        // Handle Mongoose Validation Errors specifically
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

// --------------------- 2. Get All Tours ---------------------
const getAllTours = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', country, category, minPrice, maxPrice } = req.query;
        const query = {}; // Removed { isActive: true } unless you add that field to schema

        if (country) query.destinationCountry = country;
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.pricePerPerson = {};
            if (minPrice) query.pricePerPerson.$gte = Number(minPrice);
            if (maxPrice) query.pricePerPerson.$lte = Number(maxPrice);
        }

        const tours = await Tour.find(query)
            .populate('agency', 'name email')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select('-__v');

        const count = await Tour.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            currentPage: Number(page),
            totalPages: Math.ceil(count / limit),
            data: tours
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --------------------- 3. Get Single Tour ---------------------
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
            .populate('agency', 'name email profilePictureUrl ratingsAverage ratingsQuantity')
            .populate({
                path: 'reviews', // Ensure you have virtual populate set up in Model if using this
                populate: { path: 'user', select: 'name profilePictureUrl' }
            });

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        res.status(200).json({ success: true, data: tour });

    } catch (err) {
        if (err.kind === "ObjectId") {
            return res.status(404).json({ success: false, message: "Invalid ID format" });
        }
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --------------------- 4. Update Tour ---------------------
const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        if (tour.agency.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update" });
        }

        // 👇 FIX 2: Removed external 'validateTour' function.
        // We rely on { runValidators: true } in findByIdAndUpdate below.

        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: updatedTour
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --------------------- 5. Delete Tour ---------------------
const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        if (tour.agency.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete" });
        }

        await Tour.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Tour deleted successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --------------------- 6. Get My Tours ---------------------
const getMyTours = async (req, res) => {
    try {
        const tours = await Tour.find({ agency: req.user._id });
        res.status(200).json({ success: true, count: tours.length, data: tours });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

module.exports = {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours
};