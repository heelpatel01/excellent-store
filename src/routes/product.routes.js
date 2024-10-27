import { Router } from "express";
import {
  handleCreateProduct,
  handleDeleteProduct,
  handleEditProductDetails,
  handleFetchAllProducts,
} from "../controllers/product.controller.js";
import { uploadMultiple } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/create-product")
  .post(verifyJWT, uploadMultiple, handleCreateProduct);

router.route("/delete-product").delete(verifyJWT, handleDeleteProduct);

router
  .route("/edit-product-details")
  .patch(verifyJWT, handleEditProductDetails);

router.route("/fetch-all-products").get(handleFetchAllProducts);

router.route("/add-comment-on-product").post();

router.route("/delete-comment-from-product").delete();

router.route("/fetch-comments-product").get();

router.route("/add-ratings").post();

router.route("/update-ratings").post();

export default router;
