import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as NewsServices from './news.service';

export const uploadNewsFile = catchAsync(async (req, res) => {
  const { type } = req.params;
  const files = req.files as Record<string, Express.Multer.File[]>;

  // Get the uploaded file based on type
  const uploadedFile = files[type]?.[0];

  if (!uploadedFile) {
    throw new AppError(httpStatus.BAD_REQUEST, `No ${type} file uploaded`);
  }

  const filePath = uploadedFile.filename;
  const result = await NewsServices.uploadNewsFile(
    filePath,
    type as 'image' | 'video' | 'audio' | 'file',
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
    data: result,
  });
});

export const deleteNewsFile = catchAsync(async (req, res) => {
  const { url } = req.params;
  const result = await NewsServices.deleteNewsFile(url);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'File deleted successfully',
    data: result,
  });
});

export const createNews = catchAsync(async (req, res) => {
  // Multer files type casting
  const files = req.files as Record<string, Express.Multer.File[]>;

  // Thumbnail filename
  const thumbnailFile = files['thumbnail']?.[0] || '';
  const thumbnailPath = thumbnailFile ? thumbnailFile.filename : '';

  // Multiple images filenames
  const imagesFiles = files['images'] || [];
  const imagesPaths = imagesFiles.map((f) => f.filename);

  // SEO image(s)
  const seoFile = files['seo.image']?.[0] || '';
  const seoImagePath = seoFile ? seoFile.filename : '';

  const { seo = {}, ...rest } = req.body || {};

  const payload = {
    ...rest,
    thumbnail: thumbnailPath,
    ...(imagesPaths?.length > 0 && { images: imagesPaths }),
    seo: {
      ...seo,
      ...(seoImagePath && { image: seoImagePath }),
    },
  };

  const result = await NewsServices.createNews(req.user, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News created successfully',
    data: result,
  });
});

export const getPublicNews = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const result = await NewsServices.getPublicNews(slug);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getSelfNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.getSelfNews(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.getNews(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getPublicBulkNews = catchAsync(async (req, res) => {
  const result = await NewsServices.getPublicBulkNews(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getSelfBulkNews = catchAsync(async (req, res) => {
  const result = await NewsServices.getSelfBulkNews(req.user, req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getBulkNews = catchAsync(async (req, res) => {
  const result = await NewsServices.getBulkNews(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelfNews = catchAsync(async (req, res) => {
  // Multer files type casting
  const files = req.files as Record<string, Express.Multer.File[]>;

  // Thumbnail filename
  const thumbnailFile = files['thumbnail']?.[0] || '';
  const thumbnailPath = thumbnailFile ? thumbnailFile.filename : '';

  // Multiple images filenames
  const imagesFiles = files['images'] || [];
  const imagesPaths = imagesFiles.map((f) => f.filename);

  // SEO image(s)
  const seoFile = files['seo.image']?.[0] || '';
  const seoImagePath = seoFile ? seoFile.filename : '';

  const { seo = {}, ...rest } = req.body || {};

  const payload = {
    ...rest,
    ...(thumbnailFile && { thumbnail: thumbnailPath }),
    ...(imagesPaths?.length > 0 && { images: imagesPaths }),
    seo: {
      ...seo,
      ...(seoImagePath && { image: seoImagePath }),
    },
  };

  const { id } = req.params;
  const result = await NewsServices.updateSelfNews(req.user, id, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateNews = catchAsync(async (req, res) => {
  // Multer files type casting
  const files = req.files as Record<string, Express.Multer.File[]>;

  // Thumbnail filename
  const thumbnailFile = files['thumbnail']?.[0] || '';
  const thumbnailPath = thumbnailFile ? thumbnailFile.filename : '';

  // Multiple images filenames
  const imagesFiles = files['images'] || [];
  const imagesPaths = imagesFiles.map((f) => f.filename);

  // SEO image(s)
  const seoFile = files['seo.image']?.[0] || '';
  const seoImagePath = seoFile ? seoFile.filename : '';

  const { seo = {}, ...rest } = req.body || {};

  const payload = {
    ...rest,
    ...(thumbnailFile && { thumbnail: thumbnailPath }),
    ...(imagesPaths?.length > 0 && { images: imagesPaths }),
    seo: {
      ...seo,
      ...(seoImagePath && { image: seoImagePath }),
    },
  };

  const { id } = req.params;
  const result = await NewsServices.updateNews(id, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateSelfBulkNews = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsServices.updateSelfBulkNews(req.user, ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateBulkNews = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsServices.updateBulkNews(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are updated successfully',
    data: result,
  });
});

export const deleteSelfNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteSelfNews(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News soft deleted successfully',
    data: null,
  });
});

export const deleteNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteNews(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News soft deleted successfully',
    data: null,
  });
});

export const deleteNewsPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteNewsPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News permanently deleted successfully',
    data: null,
  });
});

export const deleteSelfBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteSelfBulkNews(req.user, ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} BulkNews soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteBulkNews(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} BulkNews soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteBulkNewsPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteBulkNewsPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreSelfNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.restoreSelfNews(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News restored successfully',
    data: result,
  });
});

export const restoreNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.restoreNews(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News restored successfully',
    data: result,
  });
});

export const restoreSelfBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.restoreSelfBulkNews(req.user, ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.restoreBulkNews(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
