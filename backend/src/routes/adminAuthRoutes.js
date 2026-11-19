import { Router } from 'express';
import { getCurrentAdmin, loginAdmin, logoutAdmin } from '../controllers/authController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/login', loginRateLimiter, loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', requireAdminAuth, getCurrentAdmin);

export default router;
