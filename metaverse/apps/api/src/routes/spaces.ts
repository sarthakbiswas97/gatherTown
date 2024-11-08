
//space related routes
import { RequestHandler,Router } from "express";
import { addElement, availableElements, createSpace, deleteElement, delSpace, getAllSpaces, getSpecificSpace } from "../controllers/spaces";
import { authenticateToken } from "../middlewares/tokenAuthorization";

const router = Router();

router.post('/',authenticateToken, createSpace as unknown as RequestHandler);

router.get('/all', authenticateToken, getAllSpaces as unknown as RequestHandler);
router.get('/:spaceId', authenticateToken, getSpecificSpace as unknown as RequestHandler);
router.post('/element', authenticateToken, addElement as unknown as RequestHandler);
router.delete('/element', authenticateToken, deleteElement as unknown as RequestHandler);
router.get('/element', authenticateToken, availableElements as unknown as RequestHandler);
router.delete('/:spaceId', authenticateToken, delSpace as unknown as RequestHandler);

export default router;
