import { Schema, model } from "mongoose";

const WishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

export const whishlist = model("Wishlist", WishlistSchema);
