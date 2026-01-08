const express = require('express');
const router = express.Router();
const { getDocuments, addDocument, deleteDocument, checkExpiry } = require('../controller/documentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all routes

router.get('/', getDocuments);
router.post('/', addDocument);
router.get('/alerts', checkExpiry);
router.delete('/:id', deleteDocument);

module.exports = router;
