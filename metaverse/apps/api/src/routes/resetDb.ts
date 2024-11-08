
import { RequestHandler, Router } from "express";
import { resetDatabaseAdmin } from "../controllers/resetDb";
import { authenticateToken } from "../middlewares/tokenAuthorization";

const router = Router();

router.delete('/', authenticateToken, resetDatabaseAdmin as unknown as RequestHandler);

export default router;