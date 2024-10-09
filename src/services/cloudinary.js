import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "Couldnt found file path";
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File has been uploaded succcessfully: " + response);
    
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove locally stored temparary file as upload operation got failed!   (25:13)
    return null;
  }
};

export { uploadOnCloudinary };
