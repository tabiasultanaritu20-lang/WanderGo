const Agency = require("../models/agencyModel");

exports.createTour = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const { title, destinationCountry, destinationCity, startDate, endDate, pricePerPerson, maxGroupSize, description, imageUrl } = req.body;

        const agency = await Agency.findById(agencyId);
        if (!agency) {
            return res.status(404).json({ message: "Agency not found" });
        }

        const newTour = {
            title,
            destinationCountry,
            destinationCity,
            startDate,
            endDate,
            pricePerPerson,
            maxGroupSize,
            description,
            imageUrl
        };

        agency.tours.push(newTour);
        await agency.save();

        res.status(201).json({ message: "Tour created successfully", tour: newTour });
    } catch (error) {
        res.status(500).json({ message: "Failed to create tour", error: error.message });
    }
};


exports.getToursByAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const agency = await Agency.findById(agencyId).select("tours agencyName");

        if (!agency) {
            return res.status(404).json({ message: "Agency not found" });
        }

        res.status(200).json({ agencyName: agency.agencyName, tours: agency.tours });
    } catch (error) {
        res.status(500).json({ message: "Error fetching tours", error: error.message });
    }
};


exports.updateTour = async (req, res) => {
    try {
        const { agencyId, tourId } = req.params;
        const agency = await Agency.findById(agencyId);

        if (!agency) {
            return res.status(404).json({ message: "Agency not found" });
        }

        const tour = agency.tours.id(tourId);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        Object.assign(tour, req.body);
        await agency.save();

        res.status(200).json({ message: "Tour updated successfully", tour });
    } catch (error) {
        res.status(500).json({ message: "Failed to update tour", error: error.message });
    }
};


exports.deleteTour = async (req, res) => {
    try {
        const { agencyId, tourId } = req.params;
        const agency = await Agency.findById(agencyId);

        if (!agency) {
            return res.status(404).json({ message: "Agency not found" });
        }

        const tour = agency.tours.id(tourId);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        tour.deleteOne();
        await agency.save();

        res.status(200).json({ message: "Tour deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete tour", error: error.message });
    }
};
