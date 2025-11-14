const { EmergencyContact, SafetyRating, TravelAlert } = require('../model/emergencyModel');

// Helper to serialize
function contactToDto(c) {
  return {
    id: c._id,
    type: c.type,
    name: c.name,
    phone: c.phone,
    address: c.address,
    city: c.city,
    country: c.country,
    lat: c.lat,
    lng: c.lng,
    notes: c.notes,
    is_emergency: c.is_emergency,
    created_at: c.created_at
  };
}

async function listContacts(req, res) {
  try {
    const { country, city, type } = req.query;
    const filter = {};
    if (country) filter.country = country.toUpperCase();
    if (city) filter.city = new RegExp(city, 'i');
    if (type) filter.type = type;
    const contacts = await EmergencyContact.find(filter).limit(500);
    res.json({ contacts: contacts.map(contactToDto) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function getContact(req, res) {
  try {
    const c = await EmergencyContact.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'not found' });
    res.json(contactToDto(c));
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
}

async function createContact(req, res) {
  try {
    // In production protect with auth
    const body = req.body;
    if (!body.type || !body.name || !body.phone) {
      return res.status(400).json({ error: 'type, name and phone are required' });
    }
    const c = new EmergencyContact(body);
    await c.save();
    res.status(201).json(contactToDto(c));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function updateContact(req, res) {
  try {
    const c = await EmergencyContact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ error: 'not found' });
    res.json(contactToDto(c));
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
}

async function deleteContact(req, res) {
  try {
    const c = await EmergencyContact.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
}

// Safety rating: simple nearest / fallback
async function safetyRating(req, res) {
  try {
    const { lat, lng, country, city } = req.query;
    let row = null;
    if (lat && lng) {
      // naive nearest by Manhattan distance
      const docs = await SafetyRating.find({});
      if (docs && docs.length) {
        docs.sort((a,b) => Math.abs(a.lat-lat) + Math.abs(a.lng-lng) - (Math.abs(b.lat-lat) + Math.abs(b.lng-lng)));
        row = docs[0];
      }
    } else if (city && country) {
      row = await SafetyRating.findOne({ city: city, country: country.toUpperCase() });
    } else if (city) {
      row = await SafetyRating.findOne({ city: new RegExp(city,'i') });
    }

    if (row) {
      let value = null;
      if (row.admin_rating !== undefined && row.admin_rating !== null) value = row.admin_rating;
      else if (row.rating_count && row.rating_count > 0) value = Number(((row.rating_sum || 0) / (row.rating_count || 1)).toFixed(2));
      else value = row.rating;
      return res.json({
        location: { lat: row.lat, lng: row.lng, city: row.city, country: row.country },
        rating: value,
        factors: { crime: row.crime_score, medical_access: row.medical_score },
        summary: simpleSummary({ rating: value })
      });
    } else {
      return res.json({ rating: 3.0, summary: 'No precise data; approximate rating provided.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

function simpleSummary(r) {
  if (!r || r.rating === undefined) return 'No data';
  if (r.rating >= 4.0) return 'Low risk area.';
  if (r.rating >= 3.0) return 'Moderate risk — reasonable precautions.';
  return 'Higher risk — exercise caution.';
}

// Travel advice (very basic)
async function travelAdvice(req, res) {
  try {
    const { origin, dest, mode } = req.query;
    // In production integrate OSRM/GraphHopper/Google Directions and overlays
    // For now return sample route and nearest hospital
    const distance_km = 12.4;
    const duration_min = 32;
    const advice = [];
    if (mode === 'walk' && distance_km > 5) {
      advice.push('Route is long for walking; consider alternate transport.');
    }
    const hospital = await EmergencyContact.findOne({ type: 'hospital' });
    if (hospital) advice.push(`Nearest hospital: ${hospital.name} — ${hospital.phone}`);
    advice.push('Carry local ID and emergency cash.');

    res.json({
      route: { distance_km, duration_min },
      recommended_mode: distance_km > 3 ? 'car' : 'walk',
      safety_advice: advice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function rateSafety(req, res) {
  try {
    const { country, city, rating } = req.body;
    const cc = (country || '').toUpperCase();
    const val = Number(rating);
    if (!city || !cc) return res.status(400).json({ error: 'city and country required' });
    if (!Number.isFinite(val) || val < 0 || val > 5) return res.status(400).json({ error: 'invalid rating' });
    let row = await SafetyRating.findOne({ city: city, country: cc });
    if (!row) row = new SafetyRating({ city: city, country: cc });
    row.rating_sum = (row.rating_sum || 0) + val;
    row.rating_count = (row.rating_count || 0) + 1;
    await row.save();
    const avg = Number(((row.rating_sum || 0) / (row.rating_count || 1)).toFixed(2));
    res.json({ ok: true, rating: avg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

async function setAdminSafetyRating(req, res) {
  try {
    const { country, city, rating, adminKey } = req.body;
    const cc = (country || '').toUpperCase();
    const val = Number(rating);
    if (adminKey !== process.env.ADMIN_ROLE) return res.status(403).json({ error: 'forbidden' });
    if (!city || !cc) return res.status(400).json({ error: 'city and country required' });
    if (!Number.isFinite(val) || val < 0 || val > 5) return res.status(400).json({ error: 'invalid rating' });
    let row = await SafetyRating.findOne({ city: city, country: cc });
    if (!row) row = new SafetyRating({ city: city, country: cc });
    row.admin_rating = val;
    await row.save();
    res.json({ ok: true, admin_rating: row.admin_rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = {
  listContacts, getContact, createContact, updateContact, deleteContact,
  safetyRating, travelAdvice,
  rateSafety, setAdminSafetyRating,
  listAlerts, createAlert
};
async function listAlerts(req, res) {
  try {
    const { country, city, severity } = req.query;
    const filter = {};
    if (country) filter.country = country.toUpperCase();
    if (city) filter.city = new RegExp(city, 'i');
    if (severity) filter.severity = severity;
    const rows = await TravelAlert.find(filter).sort({ start_date: -1 }).limit(500);
    res.json({ alerts: rows });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
}

async function createAlert(req, res) {
  try {
    const body = req.body;
    if (!body.country || !body.city || !body.description) {
      return res.status(400).json({ error: 'country, city, description required' });
    }
    body.country = body.country.toUpperCase();
    const row = new TravelAlert(body);
    await row.save();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
}