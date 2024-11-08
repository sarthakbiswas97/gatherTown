
// avatars related routes
import {RequestHandler, Router} from "express"
import { metadata,getAllAvatars, bulkUserAvatars } from "../controllers/avatar";
import { authenticateToken, isAdmin } from "../middlewares/tokenAuthorization";

const router = Router();

router.post('/metadata',authenticateToken, metadata as unknown as RequestHandler);
router.get('/', getAllAvatars as unknown as RequestHandler);
router.get('/metadata/bulk',bulkUserAvatars as unknown as RequestHandler)

export default router;