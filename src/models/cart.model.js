import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productPrice: {
        type: Number,
        required: true,
      }, // Original price of the product
      price: {
        type: Number,
        required: true,
      }, // Total price based on quantity
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      image: {
        type: String,
      },
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

export const Cart = model("Cart", cartSchema);
