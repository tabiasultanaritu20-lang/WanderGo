const express = require('express');
const router = express.Router();
const { getDocuments, addDocument, deleteDocument, checkExpiry } = require('../controller/documentController');
const { authMiddleware } = require('../middleWare/authMiddleware');

router.use(authMiddleware); // Protect all routes

router.get('/', getDocuments);
router.post('/', addDocument);
router.delete('/:id', deleteDocument);
router.get('/alerts', checkExpiry);

module.exports = router;
