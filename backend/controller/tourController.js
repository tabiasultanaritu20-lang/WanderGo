
const Tour = require('../model/tourModel');


const createTour = async (req, res, next) => {
    try {
        const {
            title,
            destinationCountry,
            destinationCity,
            startDate,
            endDate,
            pricePerPerson,
            maxGroupSize,
            description,
            imageUrl,
            isActive
        } = req.body;

        if (
            !title ||
            !destinationCountry ||
            !destinationCity ||
            !startDate ||
            !endDate ||
            pricePerPerson === undefined ||
            maxGroupSize === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields.'
            });
        }

        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: 'endDate cannot be before startDate.'
            });
        }

        const tour = await Tour.create({
            title,
            destinationCountry,
            destinationCity,
            startDate,
            endDate,
            pricePerPerson,
            maxGroupSize,
            description,
            imageUrl,
            isActive,
            agency: req.user.playLoad.id
        });

        return res.status(201).json({
            success: true,
            data: tour
        });
    } catch (error) {
        console.error('Error creating tour:', error);
        if (next) return next(error);

        return res.status(500).json({
            success: false,
            message: 'Server error while creating tour.'
        });
    }
};

// GET /api/tours/:id
const getTourById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tour = await Tour.findById(id);

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: tour
        });
    } catch (error) {
        console.error('Error fetching tour:', error);
        if (next) return next(error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching tour.'
        });
    }
};

// PUT /api/tours/:id  (full update) or PATCH (partial – you can use same function)
const updateTour = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Optional: validate dates if both provided
        if (updateData.startDate && updateData.endDate) {
            if (new Date(updateData.endDate) < new Date(updateData.startDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'endDate cannot be before startDate.'
                });
            }
        }

        const tour = await Tour.findByIdAndUpdate(id, updateData, {
            new: true,           // return updated document
            runValidators: true  // run schema validators on update
        });

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: tour
        });
    } catch (error) {
        console.error('Error updating tour:', error);
        if (next) return next(error);

        return res.status(500).json({
            success: false,
            message: 'Server error while updating tour.'
        });
    }
};

// DELETE /api/tours/:id
const deleteTour = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tour = await Tour.findByIdAndDelete(id);

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tour deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting tour:', error);
        if (next) return next(error);

        return res.status(500).json({
            success: false,
            message: 'Server error while deleting tour.'
        });
    }
};

module.exports = {
    createTour,
    getTourById,
    updateTour,
    deleteTour
};
