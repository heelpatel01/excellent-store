import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  handleUpdatePersonalDetails,
  handleProfileFetching,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/update-personal-details/:userName").patch(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  handleUpdatePersonalDetails
);

router.route("/fetch-users-prfile/:userName").get(handleProfileFetching);

router.route("/fetch-all-users");

router.route("/");

export default router;
