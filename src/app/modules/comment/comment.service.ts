import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { Comment } from './comment.model';
import { TComment, TCommentDocument } from './comment.type';

export const createComment = async (data: TComment): Promise<TComment> => {
  const result = await Comment.create(data);
  return result;
};

export const getComment = async (id: string): Promise<TCommentDocument> => {
  const result = await Comment.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  return result;
};

export const getComments = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCommentDocument[];
  meta: { total: number; page: number; limit: number };
}> => {
  const commentQuery = new AppQuery(Comment.find(), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await commentQuery.execute();

  return result;
};

export const updateComment = async (
  id: string,
  payload: Partial<Pick<TComment, 'name' | 'code' | 'sequence' | 'status'>>,
): Promise<TCommentDocument> => {
  const data = await Comment.findById(id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const result = await Comment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result!;
};

export const updateComments = async (
  ids: string[],
  payload: Partial<Pick<TComment, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const comments = await Comment.find({ _id: { $in: ids } });
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Comment.updateMany(
    { _id: { $in: foundIds } },
    { ...payload, updated_at: new Date() },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteComment = async (id: string): Promise<void> => {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await comment.softDelete();
};

export const deleteCommentPermanent = async (id: string): Promise<void> => {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await Comment.findByIdAndDelete(id);
};

export const deleteComments = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const comments = await Comment.find({ _id: { $in: ids } });
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Comment.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true, updated_at: new Date() },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteCommentsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const comments = await Comment.find({ _id: { $in: ids } });
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Comment.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreComment = async (id: string): Promise<TCommentDocument> => {
  const comment = await Comment.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false, updated_at: new Date() },
    { new: true },
  );

  if (!comment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Comment not found or not deleted',
    );
  }

  return comment;
};

export const restoreComments = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await Comment.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false, updated_at: new Date() },
  );

  const restoredComments = await Comment.find({ _id: { $in: ids } });
  const restoredIds = restoredComments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
