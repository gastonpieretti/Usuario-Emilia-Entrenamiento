import { Router } from 'express';
import { sendMessage, getMessages, markAsRead, getUnreadCount } from '../controllers/messageController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.use(isAuthenticated);

router.post('/', sendMessage);
router.get('/', getMessages);
router.get('/unread', getUnreadCount);
router.put('/:messageId/read', markAsRead);

export default router;
