import express from 'express';
import {
  createEvent,
  inviteUser,
  respondToInvite,
  joinPublicEvent,
  listPublicEvents,
  listPrivateInvitedEvents, // FIX: renamed import to match corrected function name
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createEvent);

router.post('/:id/invite', protect, inviteUser);
router.post('/invite/:inviteId/respond', protect, respondToInvite);

router.post('/:id/join-public', protect, joinPublicEvent);

router.get('/public', listPublicEvents);
router.get('/private/invited', protect, listPrivateInvitedEvents); // FIX: renamed function usage to match

export default router;
