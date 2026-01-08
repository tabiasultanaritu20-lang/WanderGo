const PackageType = require('../model/packageModel');

exports.createPackage = async (req, res) => {
  try {
    const { title, features, price, destinationCountry, destinationCity, imageUrl, duration, date } = req.body;
    if (!title || price === undefined || !destinationCountry || !destinationCity) {
      return res.status(400).json({ message: 'title, price, destinationCountry, destinationCity are required' });
    }

    const pkg = await PackageType.create({ title, features, price, destinationCountry, destinationCity, imageUrl, duration, date });
    res.status(201).json({ message: 'Package created', data: pkg });
  } catch (err) {
    console.error('Error creating package:', err);
    res.status(500).json({ message: 'Server error while creating package', error: err.message });
  }
};

exports.getPackages = async (req, res) => {
  try {
    const { country, city, maxPrice } = req.query;
    const filter = {};
    if (country) filter.destinationCountry = country;
    if (city) filter.destinationCity = new RegExp(city, 'i');
    if (maxPrice !== undefined) filter.price = { $lte: Number(maxPrice) };

    const packages = await PackageType.find(filter).sort({ createdAt: -1 });
    res.json({ data: packages });
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ message: 'Server error while fetching packages' });
  }
};

exports.recommendPackages = async (req, res) => {
  try {
    const { destinationCountry, destinationCity, budget } = req.query;
    const b = budget !== undefined ? Number(budget) : null;

    if (!destinationCountry && !destinationCity) {
      return res.status(400).json({ message: 'Provide destinationCountry or destinationCity' });
    }

    const filter = {};
    if (destinationCountry) filter.destinationCountry = destinationCountry;
    if (destinationCity) filter.destinationCity = new RegExp(destinationCity, 'i');
    if (b !== null && Number.isFinite(b)) filter.price = { $lte: b };

    let packages = await PackageType.find(filter);

    if (b !== null && Number.isFinite(b)) {
      packages = packages.sort((a, b2) => Math.abs(a.price - b) - Math.abs(b2.price - b));
    } else {
      packages = packages.sort((a, b2) => a.price - b2.price);
    }

    res.json({ destination: { country: destinationCountry, city: destinationCity }, budget: b, recommendations: packages });
  } catch (err) {
    console.error('Error recommending packages:', err);
    res.status(500).json({ message: 'Server error while recommending packages' });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await PackageType.findByIdAndDelete(id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error('Error deleting package:', err);
    res.status(500).json({ message: 'Server error while deleting package', error: err.message });
  }
};
