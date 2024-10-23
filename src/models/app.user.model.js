import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    likedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    comments: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        content: String,
      },
    ],
    ratings: [
      {productId:{
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      rating:String}
    ],
  },
  {}
);
