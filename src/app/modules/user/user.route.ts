import express from 'express';
import validation from '../../middlewares/validation.middleware';
import { studentValidations } from '../student/student.validation';
import { userController } from './user.controller';

const router = express.Router();

router.post(
  '/student',
  validation(studentValidations.createStudentValidation),
  userController.createStudent,
);

router.post(
  '/faculty',
  validation(studentValidations.createStudentValidation),
  userController.createStudent,
);

export const userRoutes = router;
