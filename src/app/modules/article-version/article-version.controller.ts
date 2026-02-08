import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { ArticleVersionService } from './article-version.service';

// Get all versions for a news article
const getVersionsByNewsId = catchAsync(async (req, res) => {
  const { newsId } = req.params;

  const versions = await ArticleVersionService.getVersionsByNewsId(newsId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Versions retrieved successfully',
    data: versions,
  });
});

// Get a specific version
const getVersionById = catchAsync(async (req, res) => {
  const { versionId } = req.params;

  const version = await ArticleVersionService.getVersionById(versionId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Version retrieved successfully',
    data: version,
  });
});

// Compare two versions
const compareVersions = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const { version1, version2 } = req.query;

  const diff = await ArticleVersionService.compareVersions(
    newsId,
    Number(version1),
    Number(version2),
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Versions compared successfully',
    data: diff,
  });
});

// Restore a version
const restoreVersion = catchAsync(async (req, res) => {
  const { versionId } = req.params;
  const userId = req.user?._id;

  const restoredNews = await ArticleVersionService.restoreVersion(
    versionId,
    userId,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Version restored successfully',
    data: restoredNews,
  });
});

// Delete a version
const deleteVersion = catchAsync(async (req, res) => {
  const { versionId } = req.params;

  await ArticleVersionService.deleteVersion(versionId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Version deleted successfully',
    data: null,
  });
});

export const ArticleVersionController = {
  getVersionsByNewsId,
  getVersionById,
  compareVersions,
  restoreVersion,
  deleteVersion,
};
