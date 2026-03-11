import express from 'express';
import { signup, login} from '../controllers/authController.js';
import { upload } from '../middlewares/multerMiddleware.js';

const router = express.Router();

router.post(
    "/signup",
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "aadharFrontImage", maxCount: 1 },
        { name: "aadharBackImage", maxCount: 1 }
    ]),
    signup
);
router.post('/login', login);

export default router;