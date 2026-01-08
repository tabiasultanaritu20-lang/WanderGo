const express = require('express');
const router = express.Router();
const controller = require('../controller/emergencyController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

router.get('/', controller.listContacts); // /api/emergency-contacts?country=BD&city=Dhaka
router.get('/:id', controller.getContact);
router.post('/', authMiddleware, adminOnly, controller.createContact);
router.put('/:id', authMiddleware, adminOnly, controller.updateContact);
router.delete('/:id', authMiddleware, adminOnly, controller.deleteContact);

module.exports = router;
