import fs from 'fs';
import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import AppError from '../../builder/AppError';
import { slugify } from '../../utils/slugify';
import { News } from './news.model';
import { TNews, TNewsInput } from './news.type';

const BASE_URL = 'https://www.dainikeidin.com/wp-content/uploads/';
const NEW_URL = 'https://www.admin.dainikeidin.com/uploads/news/images/';

const getImagePath = (url: string): string => {
  if (url?.startsWith(BASE_URL)) {
    return url.replace(BASE_URL, '');
  }

  return url;
};

const getContent = (content: string): string => {
  return content.replace(new RegExp(BASE_URL, 'g'), NEW_URL);
};

const getCategoryID = (categories: string): ObjectId => {
  const REMOVES = ['86', '94', '4785', '27285', '27421'];
  const ids = categories?.split(',').filter((id) => !REMOVES.includes(id));

  const id = ids.length > 0 ? ids[ids.length - 1] : '101';
  const objectId = new ObjectId(Number(id).toString(16).padStart(24, '0'));

  return objectId;
};

const getCategoryIDs = (categories: string): ObjectId[] => {
  const REMOVES = ['86', '94', '4785', '27285', '27421'];
  const ids = categories?.split(',').filter((id) => !REMOVES.includes(id));

  const objectIds = ids.map(
    (id) => new ObjectId(Number(id).toString(16).padStart(24, '0')),
  );

  return objectIds;
};

export const getDescription = (content: string): string => {
  if (!content) return '';

  // 1. Remove HTML tags
  let text = content.replace(/<[^>]*>/g, ' ');

  // 2. Remove newlines, carriage returns, extra spaces
  text = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');

  // 3. Remove unwanted special characters (keep only basic punctuation)
  text = text.replace(/[^অ-হa-zA-Z0-9.,!? ]+/g, '');

  // 4. Split into sentences (keep punctuation)
  const sentences = text.match(/[^.!?]+[.!?]?/g) || [];

  let description = '';
  for (const sentence of sentences) {
    if ((description + sentence).length <= 250) {
      description += sentence.trim() + ' ';
    } else {
      break;
    }
  }

  return description.trim();
};

export const insertBulkNewsFromFile = async (
  file?: Express.Multer.File,
): Promise<{
  count: number;
}> => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const rawData = fs.readFileSync(file.path, 'utf-8');
  const all_news: TNewsInput[] = JSON.parse(rawData);

  const formatted: TNews[] = all_news.map((news) => ({
    _id: new ObjectId(Number(news.post_id).toString(16).padStart(24, '0')),
    title: news.post_title,
    slug: news.post_slug_bn || slugify(news.post_title),
    status: news.post_status === 'publish' ? 'published' : 'draft',
    category: getCategoryID(news?.category_ids),
    categories: getCategoryIDs(news?.category_ids),
    thumbnail: getImagePath(news?.image_url),
    ...(news.image_caption ? { caption: news.image_caption } : {}),
    caption: '',
    description: getDescription(news?.post_content || ''),
    content: getContent(news?.post_content || 'সংবাদ লিপিবদ্ধ হয়নি।'),
    author: new ObjectId(Number('1').toString(16).padStart(24, '0')),
    published_at: new Date(news.post_date),
    created_at: new Date(news.post_date),
    updated_at: new Date(news.post_modified_gmt || news.post_date),
    is_featured: false,
    is_deleted: false,
    is_premium: false,
    is_news_break: false,
    is_news_headline: false,
    views: 0,
    layout: 'default',
    tags: [],
  }));

  await News.insertMany(formatted, { ordered: false });

  fs.unlinkSync(file.path);

  return {
    count: formatted.length,
  };
};
