import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { News } from '../news/news.model';
import { UserProfile } from '../user-profile/user-profile.model';
import { Poll } from './poll.model';
import { TPoll } from './poll.type';

// Create poll
const createPoll = async (userId: string, payload: Partial<TPoll>) => {
  // If attached to news, verify news exists
  if (payload.news) {
    const news = await News.findById(payload.news);
    if (!news) {
      throw new AppError(httpStatus.NOT_FOUND, 'News article not found');
    }
  }

  // Initialize options with vote counts
  const options = payload.options?.map((option) => ({
    text: option.text,
    votes: 0,
    voters: [],
  }));

  const poll = await Poll.create({
    ...payload,
    created_by: userId,
    options,
    total_votes: 0,
    unique_voters: 0,
    votes: [],
  });

  return await Poll.findById(poll._id)
    .populate('created_by', 'name email')
    .populate('category', 'name')
    .populate('news', 'title slug');
};

// Get all polls
const getAllPolls = async (query: any) => {
  const filter: any = {};

  if (query.is_active !== undefined) {
    filter.is_active = query.is_active === 'true';
  }

  if (query.is_featured !== undefined) {
    filter.is_featured = query.is_featured === 'true';
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.tags) {
    filter.tags = { $in: query.tags.split(',') };
  }

  // Filter by status
  const now = new Date();
  if (query.status === 'active') {
    filter.is_active = true;
    filter.start_date = { $lte: now };
    filter.$or = [{ end_date: null }, { end_date: { $gte: now } }];
  } else if (query.status === 'ended') {
    filter.end_date = { $lt: now };
  }

  const polls = await Poll.find(filter)
    .sort({ created_at: -1 })
    .populate('created_by', 'name email')
    .populate('category', 'name')
    .populate('news', 'title slug');

  return polls;
};

// Get active polls
const getActivePolls = async () => {
  return await Poll.getActivePolls();
};

// Get featured polls
const getFeaturedPolls = async (limit: number = 5) => {
  return await Poll.getFeaturedPolls(limit);
};

// Get polls by news
const getPollsByNews = async (newsId: string) => {
  const polls = await Poll.find({ news: newsId })
    .sort({ created_at: -1 })
    .populate('created_by', 'name email');

  return polls;
};

// Get poll by ID
const getPollById = async (pollId: string, userId?: string) => {
  const poll = await Poll.findById(pollId)
    .populate('created_by', 'name email image')
    .populate('category', 'name')
    .populate('news', 'title slug');

  if (!poll) {
    throw new AppError(httpStatus.NOT_FOUND, 'Poll not found');
  }

  // Check if user has voted
  let hasVoted = false;
  if (userId) {
    hasVoted = await Poll.hasUserVoted(pollId, userId);
  }

  return {
    ...poll.toObject(),
    has_voted: hasVoted,
  };
};

// Update poll
const updatePoll = async (
  pollId: string,
  userId: string,
  payload: Partial<TPoll>,
) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw new AppError(httpStatus.NOT_FOUND, 'Poll not found');
  }

  // Check if user is creator or admin
  if (poll.created_by.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this poll',
    );
  }

  // Don't allow updating options if poll has votes
  if (poll.total_votes > 0 && payload.options) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot update options after voting has started',
    );
  }

  Object.assign(poll, payload);
  await poll.save();

  return await Poll.findById(poll._id)
    .populate('created_by', 'name email')
    .populate('category', 'name');
};

// Vote on poll
const vote = async (
  pollId: string,
  userId: string | undefined,
  optionIndices: number[],
  guestId?: string,
) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw new AppError(httpStatus.NOT_FOUND, 'Poll not found');
  }

  // Check if poll is active
  const now = new Date();
  if (!poll.is_active) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Poll is not active');
  }

  if (poll.start_date > now) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Poll has not started yet');
  }

  if (poll.end_date && poll.end_date < now) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Poll has ended');
  }

  // Check anonymous voting - require authentication if anonymous voting is disabled
  if (!userId && !guestId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Authentication required to vote on this poll',
    );
  }

  // If poll doesn't allow anonymous voting, require userId
  if (!poll.allow_anonymous && !userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Anonymous voting is not allowed for this poll. Please login to vote.',
    );
  }

  // Check if user has already voted
  if (userId) {
    const hasVoted = await Poll.hasUserVoted(pollId, userId);
    if (hasVoted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already voted on this poll',
      );
    }
  } else if (guestId) {
    const hasVoted = poll.votes.some((vote) => vote.guest_id === guestId);
    if (hasVoted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already voted on this poll',
      );
    }
  }

  // Validate option indices
  for (const index of optionIndices) {
    if (index < 0 || index >= poll.options.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid option index');
    }
  }

  // Check multiple votes
  if (!poll.allow_multiple_votes && optionIndices.length > 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Multiple votes are not allowed for this poll',
    );
  }

  if (poll.allow_multiple_votes && optionIndices.length > poll.max_votes) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can select maximum ${poll.max_votes} options`,
    );
  }

  // Record votes
  for (const index of optionIndices) {
    poll.options[index].votes += 1;

    if (userId) {
      poll.options[index].voters.push(userId as any);
    }

    poll.votes.push({
      user: userId as any,
      guest_id: guestId,
      option_index: index,
      voted_at: new Date(),
    });
  }

  poll.total_votes += optionIndices.length;
  poll.unique_voters += 1;

  await poll.save();

  // Update user activity stats
  if (userId) {
    await UserProfile.incrementActivityStat(userId, 'total_reactions');
  }

  return await Poll.findById(poll._id)
    .populate('created_by', 'name email')
    .populate('category', 'name');
};

// Get poll results
const getPollResults = async (pollId: string) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw new AppError(httpStatus.NOT_FOUND, 'Poll not found');
  }

  return {
    title: poll.title,
    total_votes: poll.total_votes,
    unique_voters: poll.unique_voters,
    results: poll.results,
    status: poll.status,
  };
};

// Delete poll
const deletePoll = async (pollId: string, userId: string) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw new AppError(httpStatus.NOT_FOUND, 'Poll not found');
  }

  // Check if user is creator or admin
  if (poll.created_by.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this poll',
    );
  }

  await poll.softDelete();

  return poll;
};

export const PollService = {
  createPoll,
  getAllPolls,
  getActivePolls,
  getFeaturedPolls,
  getPollsByNews,
  getPollById,
  updatePoll,
  vote,
  getPollResults,
  deletePoll,
};
