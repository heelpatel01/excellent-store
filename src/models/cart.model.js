import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      productId: Schema.Types.ObjectId,
      ref: "Product",
      price: { type: Number, require: true },
    },
  ],
  totalQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Cart = model("Cart", cartSchema);
module.exports = Cart;
