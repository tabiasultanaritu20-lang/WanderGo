const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = file.fieldname + "-" + Date.now() + ext;
    cb(null, safe);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = file.mimetype.startsWith("image/");
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;