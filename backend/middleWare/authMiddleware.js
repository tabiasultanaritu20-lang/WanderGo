const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize token payload: if nested in playLoad, flatten it
    req.user = decoded.playLoad ? { ...decoded, ...decoded.playLoad } : decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

const Agency_And_Admin = (req, res, next) => {
  // Role is now directly available on req.user due to normalization above
  const role = req.user.role;

  if (role !== "agency" && role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin and Agency only." });
  }

  next();
};

module.exports = { authMiddleware, Agency_And_Admin, adminOnly };