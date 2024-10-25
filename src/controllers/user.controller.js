import { asyncRequestHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

/**
 * Generate access and refresh tokens for a user.
 */
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found for token generation");
    }

    const accessToken = await user.generateAccessToken();
    if (!accessToken) {
      throw new ApiError(500, "Failed to generate access token");
    }

    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "Error while generating tokens", error.message);
  }
};

/**
 * Register a new user.
 */
const registerUser = asyncRequestHandler(async (req, res) => {
  const { userName, fullName, email, password, storeName } = req.body;

  if (
    [userName, fullName, email, password, storeName].some(
      (value) => value.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // Handle profile photo upload
  let avatar = "defaultProfilePic.jpg";
  const profilePhotoLocalPath = req.files?.avatar?.[0]?.path;
  if (profilePhotoLocalPath) {
    const uploadResponse = await uploadOnCloudinary(profilePhotoLocalPath);
    if (!uploadResponse || !uploadResponse.url) {
      throw new ApiError(400, "Profile image upload failed");
    }
    avatar = uploadResponse.url;
  }

  // Create the user
  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar,
    storeName,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

/**
 * Log in an existing user.
 */
const loginUser = asyncRequestHandler(async (req, res) => {
  const { userNameOrEmail, password } = req.body;

  if (!userNameOrEmail || !password) {
    throw new ApiError(400, "Both username/email and password are required");
  }

  const user = await User.findOne({
    $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookiesOptions = {
    httpOnly: true,
    secure: true,
  };

  res.cookie("accessToken", accessToken, cookiesOptions);
  res.cookie("refreshToken", refreshToken, cookiesOptions);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully"
      )
    );
});

/**
 * Log out a user by clearing refresh token and cookies.
 */
const logoutUser = asyncRequestHandler(async (req, res) => {
  await User.findByIdAndUpdate(req?.user?._id, {
    $set: { refreshToken: undefined },
  });

  const cookiesOptions = {
    httpOnly: true,
    secure: true,
  };

  res.clearCookie("accessToken", cookiesOptions);
  res.clearCookie("refreshToken", cookiesOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
});

/**
 * Refresh access token using the refresh token.
 */
const refreshAccessToken = asyncRequestHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not received");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const cookiesOptions = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token", error.message);
  }
});

/**
 * Update personal details of a user.
 */
const handleUpdatePersonalDetails = asyncRequestHandler(async (req, res) => {
  const { userName } = req.params;
  const { fullName, email, storeName } = req.body;

  if (
    [userName, fullName, email, storeName].some((value) => value.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const user = await User.findOne({ userName });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let avatar = user.avatar;
  const profilePhotoLocalPath = req.files?.avatar?.[0]?.path;
  if (profilePhotoLocalPath) {
    const uploadResponse = await uploadOnCloudinary(profilePhotoLocalPath);
    if (!uploadResponse || !uploadResponse.url) {
      throw new ApiError(400, "Profile image upload failed");
    }
    avatar = uploadResponse.url;
  }

  user.fullName = fullName;
  user.email = email;
  user.storeName = storeName;
  user.avatar = avatar;

  await user.save();
  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User details updated successfully")
    );
});

const handleProfileFetching = asyncRequestHandler(async (req, res) => {
  try {
    const { userName } = req.params;

    if (!userName) {
      throw ApiError(400, "Please Enter UserName!");
    }

    const userDetails = await User.findOne({ userName });

    if (!userDetails) {
      throw new ApiError(404, "User Not Found!");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          userName: userDetails.userName,
          storeName: userDetails.storeName,
          avatar: userDetails.avatar,
          productsPosted: userDetails?.productsPosted || "No product posted",
        },
        "User Details Fetched Successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Error While Fetching User Profile!",
      error.message
    );
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  handleUpdatePersonalDetails,
  handleProfileFetching,
};
