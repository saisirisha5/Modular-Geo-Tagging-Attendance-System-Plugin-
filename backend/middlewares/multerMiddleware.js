//For Signup uploading
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profilePhoto") {
      cb(null, "uploads/profiles/");
    }
    else if (
      file.fieldname === "aadharFrontImage" ||
      file.fieldname === "aadharBackImage"
    ) {
      cb(null, "uploads/aadhar/");
    }
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

/* -------- FILE FILTER -------- */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

/* -------- MULTER INSTANCE -------- */
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB limit
});