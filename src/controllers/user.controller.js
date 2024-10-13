import { asyncRequestHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user?.generateAccessToken();

    // console.log("though im here" + accessToken);

    if (!accessToken) return json({ Message: "chupkar" });
    const refreshToken = await user.generateRefreshToken();

    // console.log("We generated refresh tokens" + refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "Error while generating tokens!", error);
  }
};

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
  // console.log(req.files);

  const avatar = await uploadOnCloudinary(profilePhotoLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError(400, "Profile image is required!");
  }

  // Add a log before user creation
  // console.log("Ready to create user in MongoDB...");

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
  });

  // Add a log after user creation
  // console.log("User successfully created in MongoDB:", user);

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

const loginUser = asyncRequestHandler(async (req, res) => {
  //take a data from body

  // console.log("Login Activity Started");

  const { userNameOrEmail, password } = req.body;

  // console.log("UserName " + userNameOrEmail);
  //validate is all fields are there or not
  if (!userNameOrEmail || !password) {
    throw new ApiError(400, "Fill all the field!");
  }
  //check if user is already exist if not exist return with User not found

  const user = await User.findOne({
    $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
  });

  // console.log(user);

  if (!user) {
    throw new ApiError(
      404,
      "User doesnt exists, create a new account or try with other credentials!"
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  // console.log("Is Password Correct? " + isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(400, "Please enter correct password to login!");
  }

  // console.log("Hii im here");

  //assign refresh token and return their req. data.
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // console.log("Im here~~~ 112");

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Failed to fetch the logged-in user data.");
  }
  // console.log("Logged-In User: ", loggedInUser);

  // console.log("Im at 118");

  const cookiesOptions = {
    httpOnly: true,
    secure: true,
  };

  // console.log("Im at 125");

  try {
    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);
  } catch (error) {
    console.error("Error setting cookies: ", error);
    throw new ApiError(500, "Error while setting cookies!");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
      },
      "User loggedin successfully!"
    )
  );
});

const logoutUser = asyncRequestHandler(async (req, res) => {
  console.log("Finally");
  const user = await User.findByIdAndUpdate(req?.user?._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const cookiesOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse(200, "User loggedout successfully~~ ~~ ~~"));
});

const refreshAccessToken = asyncRequestHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not recieved!");
  }

  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodeToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const userInfo = await User.findById(decodeToken?._id);

    if (!userInfo) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const cookiesOptions = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      userInfo._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookiesOptions)
      .cookie("refreshToken", refreshToken, cookiesOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
