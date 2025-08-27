import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as MediaServices from './media.service';

export const getMedias = catchAsync(async (req, res) => {
  const { folder = '' } = req.query;
  const base = req.protocol + '://' + req.get('host');

  const result = await MediaServices.getMedias(folder.toString(), base);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break retrieved successfully',
    data: result,
  });
});
