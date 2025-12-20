const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },

  
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  
    authorName: { type: String, default: "Anonymous Traveler" },

    location: { type: String, default: "Unknown" },
    categories: { type: [String], default: [] },

    coverImageUrl: { type: String, default: "" },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
