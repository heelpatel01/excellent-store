import { asyncRequestHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncRequestHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  if (
    [userName, fullName, email, password].some((value) => value.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const checkUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (checkUser) {
    throw new ApiError(409, "User already exists");
  }

  const profilePhotoLocalPath = req.files?.avatar?.[0]?.path;
  if (!profilePhotoLocalPath) {
    throw new ApiError(400, "Profile image is required!");
  }
  console.log(req.files);
  const avatar = await uploadOnCloudinary(profilePhotoLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError(400, "Profile image is required!");
  }

  // Add a log before user creation
  console.log("Ready to create user in MongoDB...");

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
  });

  // Add a log after user creation
  console.log("User successfully created in MongoDB:", user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User not created!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

export { registerUser };
