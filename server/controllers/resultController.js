const Result = require('../models/Result');
const Student = require('../models/Student');

exports.getResults = async (req, res) => {
  try {
    const { exam, student, course } = req.query;
    let where = {};
    if (exam) where.examId = exam;
    if (student) where.studentId = student;
    if (course) where.courseId = course;

    // Students can only see their own
    if (req.user.role === 'student') {
      const s = await Student.findOne({ where: { email: req.user.email } });
      if (!s) return res.json([]);
      where.studentId = s.id;
    }

    const results = await Result.findAll({
      where,
      include: [
        { association: 'student', attributes: ['name', 'enrollmentNo', 'photo'], required: false },
        { association: 'exam', attributes: ['title', 'duration'], required: false },
        { association: 'course', attributes: ['name'], required: false },
        { association: 'subject', attributes: ['name'], required: false }
      ],
      order: [['submittedAt', 'DESC']]
    });
    res.json(results);
  } catch (err) {
    console.error('Error in getResults:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id, {
      include: [
        { association: 'student', required: false },
        { association: 'exam', required: false },
        { association: 'course', required: false },
        { association: 'subject', required: false }
      ]
    });
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    console.error('Error in getResult:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { exam, course } = req.query;
    let where = {};
    if (exam) where.examId = exam;
    if (course) where.courseId = course;

    const results = await Result.findAll({
      where,
      include: [
        { association: 'student', attributes: ['name', 'enrollmentNo', 'photo'], required: false },
        { association: 'exam', attributes: ['title'], required: false }
      ],
      order: [['marksObtained', 'DESC'], ['percentage', 'DESC']],
      limit: 50
    });

    const leaderboard = results.map((r, i) => ({ ...r.toJSON(), rank: i + 1 }));
    res.json(leaderboard);
  } catch (err) {
    console.error('Error in getLeaderboard:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const { studentId, examId, courseId, subjectId, marksObtained, totalMarks, grade, status, answers } = req.body;
    const total = parseFloat(totalMarks || 100);
    const marks = parseFloat(marksObtained || 0);
    const pct = total > 0 ? (marks / total) * 100 : 0;
    const calcGrade = grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F');
    const calcStatus = status || (pct >= 50 ? 'pass' : 'fail');

    const result = await Result.create({
      studentId: studentId || null,
      examId: examId || null,
      courseId: courseId || null,
      subjectId: subjectId || null,
      marksObtained: marks,
      totalMarks: total,
      percentage: pct,
      grade: calcGrade,
      status: calcStatus,
      answers: answers || [],
      submittedAt: new Date()
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('Error in createResult:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });

    const { marksObtained, totalMarks, grade, status } = req.body;
    const total = parseFloat(totalMarks ?? result.totalMarks ?? 100);
    const marks = parseFloat(marksObtained ?? result.marksObtained ?? 0);
    const pct = total > 0 ? (marks / total) * 100 : 0;
    const calcGrade = grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F');
    const calcStatus = status || (pct >= 50 ? 'pass' : 'fail');

    await result.update({
      ...req.body,
      marksObtained: marks,
      totalMarks: total,
      percentage: pct,
      grade: calcGrade,
      status: calcStatus
    });

    res.json(result);
  } catch (err) {
    console.error('Error in updateResult:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });

    await result.destroy();
    res.json({ message: 'Result deleted successfully' });
  } catch (err) {
    console.error('Error in deleteResult:', err);
    res.status(500).json({ message: err.message });
  }
};
