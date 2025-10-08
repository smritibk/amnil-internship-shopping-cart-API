import cloudinary  from "../config/cloudinary.configuration.js";
import multer from "multer";
import {CloudinaryStorage} from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ProductImage",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage: storage });

export default upload;
