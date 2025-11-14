// const Agency = require("../models/agencyModel");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
//
// exports.registerAgency = async (req, res) => {
//     try {
//         const { agencyName, contactEmail, password, phoneNumber, country, address } = req.body;
//
//         const existingAgency = await Agency.findOne({ contactEmail });
//         if (existingAgency) {
//             return res.status(400).json({ message: "Email already registered." });
//         }
//
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newAgency = new Agency({
//             agencyName,
//             contactEmail,
//             password: hashedPassword,
//             phoneNumber,
//             country,
//             address
//         });
//
//         await newAgency.save();
//         res.status(201).json({ message: "Agency registered successfully", agency: newAgency });
//     } catch (error) {
//         res.status(500).json({ message: "Error registering agency", error: error.message });
//     }
// };
//
//
// exports.loginAgency = async (req, res) => {
//     try {
//         const { contactEmail, password } = req.body;
//         const agency = await Agency.findOne({ contactEmail });
//
//         if (!agency) {
//             return res.status(404).json({ message: "Agency not found" });
//         }
//
//         const isMatch = await bcrypt.compare(password, agency.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }
//
//         const token = jwt.sign(
//             { id: agency._id, role: "agency" },
//             process.env.JWT_SECRET,
//             { expiresIn: "7d" }
//         );
//
//         res.status(200).json({
//             message: "Login successful",
//             token,
//             agency: {
//                 id: agency._id,
//                 agencyName: agency.agencyName,
//                 contactEmail: agency.contactEmail,
//                 verified: agency.verified
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Login failed", error: error.message });
//     }
// };
//
//
// exports.getAllAgencies = async (req, res) => {
//     try {
//         const agencies = await Agency.find().select("-password");
//         res.status(200).json(agencies);
//     } catch (error) {
//         res.status(500).json({ message: "Failed to retrieve agencies", error: error.message });
//     }
// };
//
//
// exports.verifyAgency = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const agency = await Agency.findByIdAndUpdate(id, { verified: true }, { new: true });
//         if (!agency) {
//             return res.status(404).json({ message: "Agency not found" });
//         }
//         res.status(200).json({ message: "Agency verified successfully", agency });
//     } catch (error) {
//         res.status(500).json({ message: "Verification failed", error: error.message });
//     }
// };
