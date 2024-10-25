import { Router } from "express";

const router = Router();

router.route("/create-product").post();

router.route("/delete-product").delete();

router.route("/edit-product-details").patch();

router.route("/fetch-all-products").get();

router.route("/add-comment-on-product").post();

router.route("delete-comment-from-product").delete();

router.route("/fetch-comments-product").get();

router.route("/add-ratings").post();

router.route("/update-ratings").post();

router.route("/fetch-products-related-that-category").get();

export default router;
