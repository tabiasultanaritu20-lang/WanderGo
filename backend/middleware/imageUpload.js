const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 1. CONFIGURATION
cloudinary.config({
  cloud_name: "dyqiibd1s",          
  api_key: "823984523662896",       
  api_secret: "wXzfRa-UuvqwUd-LRwzueaipQyc"  
});

// 2. STORAGE ENGINE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wandergo_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;