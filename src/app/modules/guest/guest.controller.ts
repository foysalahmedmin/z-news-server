import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as GuestServices from './guest.service';

export const getSelf = catchAsync(async (req, res) => {
  const result = await GuestServices.getSelf(req.guest);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guest retrieved successfully',
    data: result,
  });
});

export const getGuest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GuestServices.getGuest(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guest retrieved successfully',
    data: result,
  });
});

export const getGuests = catchAsync(async (req, res) => {
  const result = await GuestServices.getGuests(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guests retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelf = catchAsync(async (req, res) => {
  const result = await GuestServices.updateSelf(req.guest, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guest updated successfully',
    data: result,
  });
});

export const updateGuest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GuestServices.updateGuest(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guest updated successfully',
    data: result,
  });
});

export const updateGuests = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await GuestServices.updateGuests(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guests updated successfully',
    data: result,
  });
});

export const deleteGuest = catchAsync(async (req, res) => {
  const { id } = req.params;
  await GuestServices.deleteGuest(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guest soft deleted successfully',
    data: null,
  });
});

export const deleteGuestPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await GuestServices.deleteGuestPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guest permanently deleted successfully',
    data: null,
  });
});

export const deleteGuests = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await GuestServices.deleteGuests(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Guests soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteGuestsPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await GuestServices.deleteGuestsPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Guests permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreGuest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GuestServices.restoreGuest(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Guest restored successfully',
    data: result,
  });
});

export const restoreGuests = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await GuestServices.restoreGuests(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} guests restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
