import { Router } from "express";

const router = Router();

router.route("/show-cart").get();

router.route("/add-to-cart").post(); //check if possible to send information in body or not ask to gpt if we can do it using post so why we should use post???

router.route("/remove-product").delete();

router.route("/update-new-changes").patch(); //like if use makes any change in carts products like changing the quantity from cart or anything like this... idk but i think im right?

export default router;
