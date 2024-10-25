import { Router } from "express";

const router = Router();

router.route("/add-to-whishlist").post();

router.route("/remove-from-whishlist").post();

export default router;