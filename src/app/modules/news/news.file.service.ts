import fs from 'fs';
import httpStatus from 'http-status';
import { ClientSession, ObjectId } from 'mongodb';
import AppError from '../../builder/AppError';
import { slugify } from '../../utils/slugify';
import { News } from './news.model';
import { TNews, TNewsInput } from './news.type';

// Configuration constants
const CONFIG = {
  BATCH_SIZE: 500,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BASE_URL: 'https://www.dainikeidin.com/wp-content/uploads/',
  NEW_URL: 'https://admin.dainikeidin.com/uploads/news/images/',
  REMOVE_CATEGORIES: new Set([
    '101',
    '86',
    '94',
    '4785',
    '27285',
    '27421',
    '24911',
    '24907',
    '28238',
  ]),
  AUTHOR_ID: new ObjectId('000000000000000000000001'),
} as const;

// Utility functions (optimized)
const getImagePath = (url: string): string =>
  url?.startsWith(CONFIG.BASE_URL) ? url.replace(CONFIG.BASE_URL, '') : url;

const getContent = (content: string): string =>
  content.replace(new RegExp(CONFIG.BASE_URL, 'g'), CONFIG.NEW_URL);

const getCategoryID = (categories: string): ObjectId => {
  if (!categories) return new ObjectId('000000000000000000000065');

  const ids = categories
    .split(',')
    .filter((id) => !CONFIG.REMOVE_CATEGORIES.has(id));
  const targetId = ids.length > 0 ? ids[ids.length - 1] : '101';

  return new ObjectId(Number(targetId).toString(16).padStart(24, '0'));
};

const getCategoryIDs = (categories: string): ObjectId[] => {
  if (!categories) return [];

  const ids = categories
    .split(',')
    .filter((id) => !CONFIG.REMOVE_CATEGORIES.has(id));
  return ids.map(
    (id) => new ObjectId(Number(id).toString(16).padStart(24, '0')),
  );
};

export const getDescription = (content: string): string => {
  if (!content) return '';

  // Remove HTML tags
  let text = content.replace(/<[^>]*>/g, ' ');

  // Keep Bangla letters, punctuation, numbers, English letters, spaces
  text = text.replace(/[^\u0980-\u09FF0-9a-zA-Z.,!?। ]+/g, ' ');

  // Collapse multiple spaces
  text = text.replace(/\s+/g, ' ');

  // Split into sentences (including Bangla "।")
  const sentences = text.match(/[^.!?।]+[.!?।]?/g) || [];
  let description = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if ((description + trimmed).length <= 250) {
      description += trimmed + ' ';
    } else break;
  }

  return description.trim() || '';
};

// Optimized batch processor
const processBatch = (batch: TNewsInput[]): TNews[] => {
  return batch.map((news) => {
    const publishedAt = new Date(news.post_date);
    const updatedAt = new Date(news.post_modified_gmt || news.post_date);

    return {
      _id: new ObjectId(Number(news.post_id).toString(16).padStart(24, '0')),
      title: news.post_title,
      slug: news.post_slug_bn || slugify(news.post_title),
      status: news.post_status === 'publish' ? 'published' : 'draft',
      category: getCategoryID(news?.category_ids),
      categories: getCategoryIDs(news?.category_ids),
      thumbnail: getImagePath(news?.image_url),
      caption: news.image_caption || '',
      // description: getDescription(news?.post_content || ''),
      content: getContent(news?.post_content || 'সংবাদ লিপিবদ্ধ হয়নি।'),
      author: CONFIG.AUTHOR_ID,
      published_at: publishedAt,
      created_at: publishedAt,
      updated_at: updatedAt,
      is_featured: false,
      is_deleted: false,
      is_premium: false,
      views: 0,
      layout: 'default',
      tags: [],
    } as TNews;
  });
};

// Batch processing with retry and memory management
const processBatchWithRetry = async (
  batch: TNewsInput[],
  session: ClientSession,
  batchNumber: number,
  retryCount = 0,
): Promise<{ successful: number; failed: number; error?: string }> => {
  try {
    const formattedBatch = processBatch(batch);

    const result = await News.insertMany(formattedBatch, {
      ordered: false,
      rawResult: true,
    });
    const insertedCount = result.insertedCount || formattedBatch.length;
    console.log(
      `✅ Batch ${batchNumber}: ${insertedCount}/${batch.length} inserted`,
    );

    return { successful: insertedCount, failed: batch.length - insertedCount };
  } catch (error: any) {
    if (error.code === 11000) {
      // Handle duplicates gracefully
      const insertedCount = error.result?.insertedCount || 0;
      const failedCount = batch.length - insertedCount;

      console.log(
        `⚠️  Batch ${batchNumber}: ${insertedCount} inserted, ${failedCount} duplicates`,
      );
      return {
        successful: insertedCount,
        failed: failedCount,
        error: `${failedCount} duplicates found`,
      };
    }

    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(
        `🔄 Retrying batch ${batchNumber}, attempt ${retryCount + 1}`,
      );
      await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return processBatchWithRetry(batch, session, batchNumber, retryCount + 1);
    }

    console.error(
      `❌ Batch ${batchNumber} failed after ${CONFIG.MAX_RETRIES} retries:`,
      error.message,
    );
    return {
      successful: 0,
      failed: batch.length,
      error: `Failed after ${CONFIG.MAX_RETRIES} retries: ${error.message}`,
    };
  }
};

// Force garbage collection
const forceGC = (): void => {
  if (global.gc) {
    global.gc();
    console.log('🧹 Garbage collection triggered');
  }
};

// Main optimized function with per-batch transaction
export const insertBulkNewsFromFile = async (
  file?: Express.Multer.File,
): Promise<{
  count: number;
  successful: number;
  failed: number;
  errors?: string[];
  processingTime: number;
}> => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const startTime = Date.now();
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // File validation
    const fileStats = fs.statSync(file.path);
    const fileSizeMB = fileStats.size / 1024 / 1024;

    console.log(`📁 Processing file: ${fileSizeMB.toFixed(2)}MB`);

    if (fileSizeMB > 500) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'File too large. Maximum 500MB supported.',
      );
    }

    // Memory-efficient file reading
    let allNews: TNewsInput[];
    if (fileSizeMB > 50) {
      console.log('🌊 Using streaming mode for large file...');
      const chunks: Buffer[] = [];
      const readStream = fs.createReadStream(file.path, {
        highWaterMark: 1024 * 1024,
      });
      for await (const chunk of readStream) {
        chunks.push(chunk);
      }
      const rawData = Buffer.concat(chunks).toString('utf-8');
      allNews = JSON.parse(rawData);
      chunks.length = 0;
    } else {
      const rawData = fs.readFileSync(file.path, 'utf-8');
      allNews = JSON.parse(rawData);
    }

    if (!Array.isArray(allNews) || allNews.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or empty JSON file');
    }

    console.log(`📊 Total records to process: ${allNews.length}`);

    // Process in batches
    const totalBatches = Math.ceil(allNews.length / CONFIG.BATCH_SIZE);

    for (let i = 0; i < allNews.length; i += CONFIG.BATCH_SIZE) {
      const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
      const batch = allNews.slice(i, i + CONFIG.BATCH_SIZE);

      console.log(
        `⚡ Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`,
      );

      try {
        const batchResult = await processBatchWithRetry(
          batch,
          null as any,
          batchNumber,
        );

        successful += batchResult.successful;
        failed += batchResult.failed;

        if (batchResult.error) {
          errors.push(`Batch ${batchNumber}: ${batchResult.error}`);
        }
      } catch (batchError: any) {
        failed += batch.length;
        errors.push(`Batch ${batchNumber}: ${batchError.message}`);
        console.error(`❌ Batch ${batchNumber} failed:`, batchError.message);
      }

      // Memory management every 10 batches
      if (batchNumber % 10 === 0) forceGC();
    }

    const processingTime = Date.now() - startTime;
    const successRate = ((successful / allNews.length) * 100).toFixed(2);

    console.log(`🎉 Import completed in ${processingTime}ms`);
    console.log(
      `📈 Success rate: ${successRate}% (${successful}/${allNews.length})`,
    );

    return {
      count: allNews.length,
      successful,
      failed,
      processingTime,
      ...(errors.length > 0 && { errors }),
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Import failed: ${error.message}`,
    );
  } finally {
    // Cleanup file
    try {
      fs.unlinkSync(file.path);
      console.log('🗑️  Temporary file cleaned up');
    } catch (unlinkError) {
      console.warn('Failed to delete temporary file:', unlinkError);
    }

    // Final garbage collection
    forceGC();
  }
};
