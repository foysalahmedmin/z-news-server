/**
 * guest.service.test.ts
 *
 * Unit tests for the Guest Service layer.
 * The repository is fully mocked.
 */

import httpStatus from 'http-status';
import { Types } from 'mongoose';

// ── Mock dependencies ─────────────────────────────────────────────────────────
jest.mock('../guest.repository');

import * as GuestRepository from '../guest.repository';
import * as GuestService from '../guest.service';
import { TGuest } from '../guest.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockGuest = (overrides: Partial<TGuest> = {}): TGuest =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    token: 'mock-token',
    session_id: 'session-id',
    preferences: {},
    status: 'in-progress',
    is_deleted: false,
    ...overrides,
  }) as TGuest;

// ─── getSelf ──────────────────────────────────────────────────────────────────

describe('GuestService.getSelf', () => {
  it('should return guest if found', async () => {
    const guest = mockGuest();
    (GuestRepository.findByIdLean as jest.Mock).mockResolvedValue(guest);

    const result = await GuestService.getSelf(guest);

    expect(result).toEqual(guest);
    expect(GuestRepository.findByIdLean).toHaveBeenCalledWith(
      guest._id.toString(),
    );
  });

  it('should throw NOT_FOUND if guest not found', async () => {
    (GuestRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

    await expect(GuestService.getSelf(mockGuest())).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
      message: 'Guest not found',
    });
  });
});

// ─── getGuest ─────────────────────────────────────────────────────────────────

describe('GuestService.getGuest', () => {
  it('should return guest if found', async () => {
    const guest = mockGuest();
    (GuestRepository.findByIdLean as jest.Mock).mockResolvedValue(guest);

    const result = await GuestService.getGuest('id');

    expect(result).toEqual(guest);
    expect(GuestRepository.findByIdLean).toHaveBeenCalledWith('id');
  });

  it('should throw NOT_FOUND if guest not found', async () => {
    (GuestRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

    await expect(GuestService.getGuest('id')).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
    });
  });
});

// ─── getGuests ────────────────────────────────────────────────────────────────

describe('GuestService.getGuests', () => {
  it('should return paginated guests', async () => {
    const response = {
      data: [mockGuest()],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (GuestRepository.findPaginated as jest.Mock).mockResolvedValue(response);

    const result = await GuestService.getGuests({});

    expect(result).toEqual(response);
  });
});

// ─── updateSelf ───────────────────────────────────────────────────────────────

describe('GuestService.updateSelf', () => {
  it('should update and return guest', async () => {
    const guest = mockGuest();
    const updated = { ...guest, name: 'New Name' };
    (GuestRepository.findById as jest.Mock).mockResolvedValue(guest);
    (GuestRepository.updateByIdLean as jest.Mock).mockResolvedValue(updated);

    const result = await GuestService.updateSelf(guest, { name: 'New Name' });

    expect(result.name).toBe('New Name');
  });
});

// ─── deleteGuest ──────────────────────────────────────────────────────────────

describe('GuestService.deleteGuest', () => {
  it('should soft delete guest', async () => {
    const guest = {
      ...mockGuest(),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };
    (GuestRepository.findById as jest.Mock).mockResolvedValue(guest);

    await GuestService.deleteGuest('id');

    expect(guest.softDelete).toHaveBeenCalled();
  });
});

// ─── restoreGuest ─────────────────────────────────────────────────────────────

describe('GuestService.restoreGuest', () => {
  it('should restore deleted guest', async () => {
    const guest = mockGuest({ is_deleted: false });
    (GuestRepository.updateOne as jest.Mock).mockResolvedValue(guest);

    const result = await GuestService.restoreGuest('id');

    expect(result).toEqual(guest);
    expect(GuestRepository.updateOne).toHaveBeenCalledWith(
      { _id: 'id', is_deleted: true },
      { is_deleted: false },
    );
  });
});
