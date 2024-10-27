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

// Update product quantity in cart
const handleUpdateCartItem = asyncRequestHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity < 0) {
    throw new ApiError(400, "Product ID and valid quantity are required.");
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found for user.");
  }

  const item = cart.items.find((item) => item.productId.equals(productId));
  if (!item) {
    throw new ApiError(404, "Product not found in cart.");
  }

  if (quantity === 0) {
    cart.items = cart.items.filter((item) => !item.productId.equals(productId));
  } else {
    item.quantity = quantity;
    item.price = item.productPrice * quantity; // Update price based on new quantity
  }

  cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);

  await cart.save();
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item updated successfully"));
});

// Clear all products from cart
const handleClearAllProducts = asyncRequestHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { items: [], totalQuantity: 0, totalPrice: 0 },
    { new: true }
  );

  if (!cart) {
    throw new ApiError(404, "Cart not found for user.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "All products cleared from cart"));
});

// Delete a single product from cart
const handleDeleteOneProduct = asyncRequestHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required.");
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found for user.");
  }

  const itemIndex = cart.items.findIndex((item) =>
    item.productId.equals(productId)
  );
  if (itemIndex === -1) {
    throw new ApiError(404, "Product not found in cart.");
  }

  const [removedItem] = cart.items.splice(itemIndex, 1);

  cart.totalQuantity -= removedItem.quantity;
  cart.totalPrice -= removedItem.price;

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product removed from cart successfully"));
});

export { handleAddToCart, handleShowCart ,handleClearAllProducts,handleDeleteOneProduct};
