const Course = require('../models/Course');
const Subject = require('../models/Subject');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({ 
      where: { isActive: true },
      include: ['subjects']
    });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await course.update(req.body);
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const where = req.query.course ? { courseId: req.query.course } : {};
    const subjects = await Subject.findAll({
      where,
      include: ['course']
    });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, code, course, description } = req.body;
    const subject = await Subject.create({
      name, code, courseId: course, description
    });
    res.status(201).json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await subject.destroy();
    res.json({ message: 'Subject deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
