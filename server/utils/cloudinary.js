const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file from its local path to Cloudinary (raw mode for PDFs).
 * Safely removes the local file afterward.
 */
const uploadToCloudinary = async (filePath, originalName) => {
  try {
    if (!filePath) return null;

    const ext = originalName ? path.extname(originalName) : ".pdf";
    const publicId = `${Date.now()}${ext}`;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      public_id: publicId,
    });

    // Delete local file after upload
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Failed to delete local file after Cloudinary upload:", err);
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    try {
      fs.writeFileSync(
        path.join(__dirname, "..", "cloudinary_error.log"),
        JSON.stringify({ message: error.message, stack: error.stack, error }, null, 2)
      );
    } catch (e) {}
    throw new Error("File upload to Cloudinary failed: " + error.message);
  }
};

module.exports = { cloudinary, uploadToCloudinary };
