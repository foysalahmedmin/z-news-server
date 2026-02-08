import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { PollController } from './poll.controller';
import { PollValidation } from './poll.validation';

const router = Router();

// Create poll (Authenticated users)
router.post(
  '/',
  auth(),
  validation(PollValidation.createPollSchema),
  PollController.createPoll,
);

// Get all polls (Public)
router.get('/', PollController.getAllPolls);

// Get active polls (Public)
router.get('/active', PollController.getActivePolls);

// Get featured polls (Public)
router.get('/featured', PollController.getFeaturedPolls);

// Get polls by news (Public)
router.get(
  '/news/:newsId',
  validation(PollValidation.getPollsByNewsSchema),
  PollController.getPollsByNews,
);

// Get poll by ID (Public)
router.get('/:pollId', PollController.getPollById);

// Update poll (Creator or Admin)
router.patch(
  '/:pollId',
  auth(),
  validation(PollValidation.updatePollSchema),
  PollController.updatePoll,
);

// Vote on poll (Public or Authenticated based on poll settings)
router.post(
  '/:pollId/vote',
  validation(PollValidation.voteSchema),
  PollController.vote,
);

// Get poll results (Public)
router.get('/:pollId/results', PollController.getPollResults);

// Delete poll (Creator or Admin)
router.delete('/:pollId', auth(), PollController.deletePoll);

const PollRoutes = router;

export default PollRoutes;
