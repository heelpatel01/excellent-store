import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncRequestHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncRequestHandler(async (req, res,next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

      

    const token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // console.log("Welcome!"+JSON.stringify(token));

    const user = await User.findById(token?._id);

    if (!user) {
      throw new ApiError(404, "User Not Found");
    }

    
    req.user = user;


    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "Invelid Access!");
  }
});
