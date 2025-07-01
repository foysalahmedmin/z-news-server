import mongoose, { Types } from 'mongoose';
import { TAcademicSemester } from '../academic-semester/academic-semester.type';
import { Student } from '../student/student.model';
const ObjectId = mongoose.Types.ObjectId;

const findLastStudentId = async (
  admission_semester_id: Types.ObjectId,
): Promise<string | undefined> => {
  const lastStudent = await Student.findOne(
    { admission_semester: new ObjectId(admission_semester_id) },
    { _id: 0, id: 1 },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastStudent?.id ? lastStudent.id : undefined;
};

export const generateStudentId = async (
  payload: Partial<TAcademicSemester>,
) => {
  let currentId = (0).toString();
  const lastStudentId = await findLastStudentId(payload._id as Types.ObjectId);

  const lastStudentSemesterCode = lastStudentId?.substring(4, 6);
  const lastStudentYear = lastStudentId?.substring(0, 4);

  const currentSemesterCode = payload.code;
  const currentYear = payload.year;

  if (
    lastStudentId &&
    lastStudentSemesterCode === currentSemesterCode &&
    lastStudentYear === currentYear
  ) {
    currentId = lastStudentId.substring(6);
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  const currentFullId = `${payload.year}${payload.code}${incrementId}`;

  return currentFullId;
};
