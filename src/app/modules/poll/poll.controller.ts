import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { PollService } from './poll.service';

// Create poll
const createPoll = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const poll = await PollService.createPoll(userId, req.body);

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'Poll created successfully',
    data: poll,
  });
});

// Get all polls
const getAllPolls = catchAsync(async (req, res) => {
  const polls = await PollService.getAllPolls(req.query);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Polls retrieved successfully',
    data: polls,
  });
});

// Get active polls
const getActivePolls = catchAsync(async (_req, res) => {
  const polls = await PollService.getActivePolls();

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Active polls retrieved successfully',
    data: polls,
  });
});

// Get featured polls
const getFeaturedPolls = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 5;

  const polls = await PollService.getFeaturedPolls(limit);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Featured polls retrieved successfully',
    data: polls,
  });
});

// Get polls by news
const getPollsByNews = catchAsync(async (req, res) => {
  const { newsId } = req.params;

  const polls = await PollService.getPollsByNews(newsId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'News polls retrieved successfully',
    data: polls,
  });
});

// Get poll by ID
const getPollById = catchAsync(async (req, res) => {
  const { pollId } = req.params;
  const userId = req.user?._id;

  const poll = await PollService.getPollById(pollId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Poll retrieved successfully',
    data: poll,
  });
});

// Update poll
const updatePoll = catchAsync(async (req, res) => {
  const { pollId } = req.params;
  const userId = req.user?._id;

  const poll = await PollService.updatePoll(pollId, userId, req.body);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Poll updated successfully',
    data: poll,
  });
});

// Vote on poll
const vote = catchAsync(async (req, res) => {
  const { pollId } = req.params;
  const userId = req.user?._id;
  const { option_indices, guest_id } = req.body;

  const poll = await PollService.vote(pollId, userId, option_indices, guest_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Vote recorded successfully',
    data: poll,
  });
});

// Get poll results
const getPollResults = catchAsync(async (req, res) => {
  const { pollId } = req.params;

  const results = await PollService.getPollResults(pollId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Poll results retrieved successfully',
    data: results,
  });
});

// Delete poll
const deletePoll = catchAsync(async (req, res) => {
  const { pollId } = req.params;
  const userId = req.user?._id;

  await PollService.deletePoll(pollId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Poll deleted successfully',
    data: null,
  });
});

export const PollController = {
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
