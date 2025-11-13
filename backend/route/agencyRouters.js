const express = require("express");
const router = express.Router();
const agencyController = require("../controllers/agencyController");

router.post("/register", agencyController.registerAgency);
router.post("/login", agencyController.loginAgency);
router.get("/", agencyController.getAllAgencies);
router.put("/verify/:id", agencyController.verifyAgency);

module.exports = router;
