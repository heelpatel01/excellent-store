import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js"; // Import User model
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncRequestHandler } from "../utils/asyncHandler.js";
import { uploadMultipleOnCloudinary } from "../services/cloudinary.js";
import fs from "fs";

const handleCreateProduct = asyncRequestHandler(async (req, res) => {
  try {
    const { name, title, description, quantity, price, categories } = req.body;

    if (!name || !title || !description || !quantity || !price) {
      throw new ApiError(400, "All fields are required!");
    }

    // Upload images to Cloudinary and store URLs in an array
    const imageFiles = req?.files?.map((file) => file.path);
    const imageUrls = await uploadMultipleOnCloudinary(imageFiles);

    // Remove temporary files from local storage
    imageFiles.forEach((file) => fs.unlinkSync(file));

    if (imageUrls.length === 0) {
      throw new ApiError(500, "Image upload failed!");
    }

    // Convert `categories` to an array if it's a comma-separated string
    const categoryArray =
      typeof categories === "string" ? categories.split(",") : categories;

    // Create a new product
    const newProduct = await Product.create({
      name,
      title,
      description,
      quantity,
      price,
      categories: categoryArray,
      images: imageUrls,
      postedBy: req.user._id, // Assign current user's ID
    });

    // Add the new product ID to the user's `productsPosted` array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { productsPosted: newProduct._id },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newProduct, "Product created successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while creating a product", error);
  }
});

const handleDeleteProduct = asyncRequestHandler(async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      throw new ApiError(400, "Please provide productId to delete it!");
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found!");
    }

    // Ensure the product belongs to the user
    if (!product.postedBy.equals(req.user._id)) {
      throw new ApiError(403, "You are not authorized to delete this product.");
    }

    // Delete the product
    await product.deleteOne();

    // Remove the product reference from the user's productsPosted array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { productsPosted: productId },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Deleted" },
          "Product deleted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while deleting a product", error);
  }
});

const handleEditProductDetails = asyncRequestHandler(async (req, res) => {
  try {
    const { name, title, description, quantity, price, categories, productId } =
      req.body;

    if (!productId) {
      throw new ApiError(
        400,
        "Please provide product id to update its details!"
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product Not Found");
    }

    if (!product.postedBy.equals(req.user._id)) {
      throw new ApiError(403, "You Are Not Authorized to Update This Product!");
    }

    product.name = name || product.name;
    product.title = title || product.title;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;
    product.description = description || product.description;
    // Update categories, converting to an array if necessary
    product.categories =
      typeof categories === "string"
        ? categories.split(",")
        : categories || product.categories;

    await product.save();

    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while updating the product", error);
  }
});

const handleFetchAllProducts = asyncRequestHandler(async (req, res) => {
  const { page = 1, limit = 10, categories } = req.query;

  // Construct query for categories filtering using $in for array matching
  const query = {};
  if (categories) {
    query.categories = { $in: [categories] }; // Adjust to include only if categories is specified
  }

  // Fetching paginated and filtered results
  const allProducts = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Total count for pagination
  const totalProducts = await Product.countDocuments(query);

  const message =
    allProducts.length == 0
      ? "No Products Available"
      : "Products Fetched Successfully :)";

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: allProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: Number(page),
      },
      message
    )
  );
});

export {
  handleCreateProduct,
  handleDeleteProduct,
  handleEditProductDetails,
  handleFetchAllProducts,
};
