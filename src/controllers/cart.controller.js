import { asyncRequestHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";

const handleAddToCart = asyncRequestHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    throw new ApiError(400, "Product ID and valid quantity are required.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const firstImage = product.images[0] || null;

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    // Create new cart for user if not exists
    cart = await Cart.create({
      userId: req.user._id,
      items: [
        {
          productId,
          productPrice: product.price,
          price: product.price * quantity,
          quantity,
          image: firstImage, // only the first image
        },
      ],
      totalQuantity: quantity,
      totalPrice: product.price * quantity,
    });
  } else {
    // Check if the product already exists in the cart
    const productIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (productIndex > -1) {
      // Update existing product's quantity and price in the cart
      cart.items[productIndex].quantity += quantity;
      cart.items[productIndex].price =
        cart.items[productIndex].quantity * product.price;
    } else {
      // Add new product to the cart
      cart.items.push({
        productId,
        productPrice: product.price,
        price: product.price * quantity,
        quantity,
        image: firstImage, // only the first image
      });
    }

    // Recalculate total quantity and price
    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product added to cart successfully"));
});

const handleShowCart = asyncRequestHandler(async (req, res) => {
  try {
    const userCart = await Cart.findOne({ userId: req.user._id });

    if (!userCart) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, {}, "User has not added any items to the cart.")
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userCart.items,
          "User's cart fetched successfully."
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching cart");
  }
});

export { handleAddToCart, handleShowCart };
