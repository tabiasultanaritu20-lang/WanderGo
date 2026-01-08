const Document = require('../model/Document');

// Get all documents for the logged-in user
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ expiryDate: 1 });
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new document
exports.addDocument = async (req, res) => {
  try {
    const { type, country, documentNumber, expiryDate, imageUrl, notes } = req.body;

    const newDoc = new Document({
      user: req.user.id,
      type,
      country,
      documentNumber,
      expiryDate,
      imageUrl,
      notes
    });

    const doc = await newDoc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (doc.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await doc.deleteOne();
    res.json({ message: 'Document removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Check for expiring documents (e.g., expiring within 6 months)
exports.checkExpiry = async (req, res) => {
  try {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const expiringDocs = await Document.find({
      user: req.user.id,
      expiryDate: { $lte: sixMonthsFromNow, $gte: new Date() }
    });

    res.json(expiringDocs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
