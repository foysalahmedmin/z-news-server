/**
 * ArticleVersion Repository
 *
 * Handles ALL direct database interactions for the ArticleVersion module.
 */

import { ArticleVersion } from './article-version.model';

export const deleteMany = async (
  filter: Record<string, unknown>,
): Promise<{ deletedCount: number }> => {
  return await ArticleVersion.deleteMany(filter);
};

export const deleteManyByNewsId = async (
  newsId: string,
): Promise<{ deletedCount: number }> => {
  return await ArticleVersion.deleteMany({ news: newsId });
};
