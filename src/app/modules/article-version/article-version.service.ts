import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { News } from '../news/news.model';
import { ArticleVersion } from './article-version.model';

// Create a new version snapshot
const createVersion = async (
  newsId: string,
  userId: string,
  changeSummary?: string,
) => {
  // Check if news exists
  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News article not found');
  }

  // Get the latest version number
  const latestVersion = await ArticleVersion.findOne({ news: newsId })
    .sort({ version_number: -1 })
    .select('version_number');

  const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

  // Create metadata snapshot
  const metadataSnapshot = {
    title: news.title,
    sub_title: news.sub_title,
    description: news.description,
    tags: news.tags,
    category: news.category,
    categories: news.categories,
    thumbnail: news.thumbnail,
    video: news.video,
    youtube: news.youtube,
  };

  // Create version
  const version = await ArticleVersion.create({
    news: newsId,
    version_number: newVersionNumber,
    content_snapshot: news.content,
    metadata_snapshot: metadataSnapshot,
    changed_by: userId,
    change_summary: changeSummary,
  });

  return version;
};

// Get all versions for a news article
const getVersionsByNewsId = async (newsId: string) => {
  const versions = await ArticleVersion.getVersionsByNewsId(newsId);
  return versions;
};

// Get a specific version
const getVersionById = async (versionId: string) => {
  const version = await ArticleVersion.findById(versionId).populate(
    'changed_by',
    'name email',
  );

  if (!version) {
    throw new AppError(httpStatus.NOT_FOUND, 'Version not found');
  }

  return version;
};

// Compare two versions
const compareVersions = async (
  newsId: string,
  version1Number: number,
  version2Number: number,
) => {
  const version1 = await ArticleVersion.findOne({
    news: newsId,
    version_number: version1Number,
  });

  const version2 = await ArticleVersion.findOne({
    news: newsId,
    version_number: version2Number,
  });

  if (!version1 || !version2) {
    throw new AppError(httpStatus.NOT_FOUND, 'One or both versions not found');
  }

  // Simple diff - in production, use a proper diff library like 'diff'
  const diff = {
    version1: {
      number: version1.version_number,
      created_at: version1.created_at,
      changed_by: version1.changed_by,
      content: version1.content_snapshot,
      metadata: version1.metadata_snapshot,
    },
    version2: {
      number: version2.version_number,
      created_at: version2.created_at,
      changed_by: version2.changed_by,
      content: version2.content_snapshot,
      metadata: version2.metadata_snapshot,
    },
  };

  return diff;
};

// Restore a specific version
const restoreVersion = async (versionId: string, userId: string) => {
  const version = await ArticleVersion.findById(versionId);

  if (!version) {
    throw new AppError(httpStatus.NOT_FOUND, 'Version not found');
  }

  // Update the news article with the version's content
  const news = await News.findById(version.news);

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News article not found');
  }

  // Create a new version before restoring (to preserve current state)
  await createVersion(
    news._id.toString(),
    userId,
    `Restored to version ${version.version_number}`,
  );

  // Restore content and metadata
  news.content = version.content_snapshot;
  news.title = version.metadata_snapshot.title;
  news.sub_title = version.metadata_snapshot.sub_title;
  news.description = version.metadata_snapshot.description;
  news.tags = version.metadata_snapshot.tags;
  news.category = version.metadata_snapshot.category;
  news.categories = version.metadata_snapshot.categories || [];
  news.thumbnail = version.metadata_snapshot.thumbnail;
  news.video = version.metadata_snapshot.video;
  news.youtube = version.metadata_snapshot.youtube;

  await news.save();

  return news;
};

// Delete a version (soft delete)
const deleteVersion = async (versionId: string) => {
  const version = await ArticleVersion.findById(versionId);

  if (!version) {
    throw new AppError(httpStatus.NOT_FOUND, 'Version not found');
  }

  await version.softDelete();

  return version;
};

export const ArticleVersionService = {
  createVersion,
  getVersionsByNewsId,
  getVersionById,
  compareVersions,
  restoreVersion,
  deleteVersion,
};
