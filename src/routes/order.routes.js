import { Router } from "express";

const router = Router();

router.route("/make-order").get(handleFullOrder);

export default router;
