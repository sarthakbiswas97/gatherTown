//authentication routes
import express,{RequestHandler, Router} from "express"
import { signup,signin } from "../controllers/auth";

const router = Router();

router.post('/signup',signup as unknown as RequestHandler);
router.post('/signin',signin as unknown as RequestHandler);

export default router;