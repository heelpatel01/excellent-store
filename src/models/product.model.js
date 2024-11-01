import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  images: [String], //add 5 images limit
  title: {
    type: String,
    required: true,
  },
  description: { type: String, required: true },
  ratings: { type: Number, default: 0 },
  comments: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      content: String,
    },
  ],
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  purchasedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  carts: {
    type: Number,
    default: 0,
  },
  categories: [
    {
      type: String,
    },
  ], // Add categories for products
});

export const Product = model("Product", productSchema);