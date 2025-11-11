const jwt=require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};


const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        console.log(req.user.role);
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};


module.exports = {authMiddleware, adminOnly};