export const Storage = jest.fn().mockImplementation(() => ({
  bucket: jest.fn().mockReturnValue({
    file: jest.fn().mockReturnValue({
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(['https://mock-url']),
    }),
  }),
}));
