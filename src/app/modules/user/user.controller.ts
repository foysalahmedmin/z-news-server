import catchAsync from '../../utils/catchAsync';
import { UserServices } from './user.service';

const createStudent = catchAsync(async (req, res, next) => {
  const { username, password, student: studentData } = req.body;
  const result = await UserServices.createStudentIntoDB(
    username,
    password,
    studentData,
  );

  res.status(200).json({
    success: true,
    message: 'Student is created successfully',
    data: result,
  });
});

export const userController = {
  createStudent,
};
