const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    authorName: {
      type: String,
      default: "Anonymous Traveler",
      trim: true,
    },

    location: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    categories: {
      type: [String],
      default: [],
    },

    coverImageUrl: {
      type: String,
      default: "",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, default: "Traveler" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);