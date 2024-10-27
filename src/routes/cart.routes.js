import { Router } from "express";
import {
  handleAddToCart,
  handleShowCart,
  handleClearAllProducts,
  handleDeleteOneProduct,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add-to-cart").post(verifyJWT, handleAddToCart); //check if possible to send information in body or not ask to gpt if we can do it using post so why we should use post???

router.route("/show-cart").get(verifyJWT, handleShowCart);

router.route("/update-new-changes").patch(); //like if use makes any change in carts products like changing the quantity from cart or anything like this... idk but i think im right?

router.route("/clear-all-product").delete(verifyJWT, handleClearAllProducts);

router.route("/delete-one-product").delete(verifyJWT, handleDeleteOneProduct);

export default router;
