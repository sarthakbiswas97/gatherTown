// admin related routes

import { RequestHandler, Router } from "express";
import { createAvatar, createElement, createMap, updateElement } from "../controllers/admin";
import { authenticateToken, isAdmin } from "../middlewares/tokenAuthorization";

const router = Router();

// router.post('/element', authenticateToken, isAdmin, createElement as unknown as RequestHandler);
// router.put('/element/:elementId', authenticateToken, isAdmin, updateElement as unknown as RequestHandler);
// router.post('/avatar', authenticateToken, isAdmin, createAvatar as unknown as RequestHandler);
// router.post('/map', authenticateToken, isAdmin, createMap as unknown as RequestHandler);

router.post('/element', authenticateToken, createElement as unknown as RequestHandler);
router.put('/element/:elementId', authenticateToken, updateElement as unknown as RequestHandler);
router.post('/avatar', authenticateToken, createAvatar as unknown as RequestHandler);
router.post('/map', authenticateToken, createMap as unknown as RequestHandler);

export default router;