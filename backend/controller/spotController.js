const Spot = require('../model/spotModel');

exports.listSpots = async (req, res) => {
  try {
    const { q, country, city, category, tag, lat, lng, limit = 20 } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (city) filter.city = city;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') }
    ];

    let docs = await Spot.find(filter).limit(Number(limit));

    const la = Number(lat);
    const lo = Number(lng);
    if (Number.isFinite(la) && Number.isFinite(lo)) {
      docs = docs.sort((a,b) => Math.abs((a.lat||0)-la)+Math.abs((a.lng||0)-lo) - (Math.abs((b.lat||0)-la)+Math.abs((b.lng||0)-lo)));
    }

    res.json({ data: docs });
  } catch (err) {
    res.status(500).json({ message: 'server error' });
  }
};

exports.createSpot = async (req, res) => {
  try {
    const spot = await Spot.create(req.body);
    res.status(201).json({ message: 'created', data: spot });
  } catch (err) {
    res.status(500).json({ message: 'server error', error: err.message });
  }
};

exports.deleteSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await Spot.findByIdAndDelete(id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });
    res.json({ message: 'deleted', data: spot });
  } catch (err) {
    res.status(500).json({ message: 'server error', error: err.message });
  }
};

exports.seedSpots = async (req, res) => {
  try {
    const count = await Spot.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'already seeded' });
    const rows = await Spot.insertMany([
      { name: 'Cox’s Bazar Beach', description: 'Longest natural sea beach.', country: 'Bangladesh', city: 'Cox’s Bazar', category: 'Beach', tags: ['sea','beach'], lat: 21.4272, lng: 91.9686, photos: ['https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg'] },
      { name: 'Sajek Valley', description: 'Hilly paradise with clouds.', country: 'Bangladesh', city: 'Rangamati', category: 'Hill', tags: ['valley','hill'], lat: 23.3811, lng: 92.2938, photos: ['https://images.pexels.com/photos/1287075/pexels-photo-1287075.jpeg'] },
      { name: 'Golden Gate Bridge', description: 'Iconic bridge with views.', country: 'United States', city: 'San Francisco', category: 'Landmark', tags: ['bridge','city'], lat: 37.8199, lng: -122.4783, photos: ['https://images.pexels.com/photos/356844/pexels-photo-356844.jpeg'] }
    ]);
    res.status(201).json({ message: 'seeded', data: rows });
  } catch (err) {
    res.status(500).json({ message: 'server error' });
  }
};
