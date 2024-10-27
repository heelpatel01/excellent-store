import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        rating: String,
      },
    ],

    avatar: {
      type: String,
      default: "defaultProfilePic.jpg",
    },
    productsPosted: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  console.log("Started IN DB PRE SAVE");
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  console.log("You are in the access token world!");
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      storeName: this.storeName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = model("User", userSchema);
