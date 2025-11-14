const express = require('express');
const router = express.Router();
const controller = require('../controller/emergencyController');

router.get('/', controller.listContacts); // /api/emergency-contacts?country=BD&city=Dhaka
router.get('/:id', controller.getContact);
router.post('/', controller.createContact);
router.put('/:id', controller.updateContact);
router.delete('/:id', controller.deleteContact);

module.exports = router;