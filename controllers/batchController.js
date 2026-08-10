const Batch = require('../models/Batch');

exports.getAllBatches = async (req, res) => {
  try {
    const where = req.query.status ? { status: req.query.status } : {};
    const batches = await Batch.findAll({
      where,
      include: [
        { association: 'course' },
        { association: 'students', attributes: ['id', 'name', 'email', 'enrollmentNo'] }
      ]
    });
    res.json(batches);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createBatch = async (req, res) => {
  try {
    const { course, ...rest } = req.body;
    const batch = await Batch.create({ ...rest, courseId: course });
    res.status(201).json(batch);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    
    const { course, ...rest } = req.body;
    await batch.update({ ...rest, courseId: course || batch.courseId });
    
    const updated = await Batch.findByPk(req.params.id, { include: ['course'] });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    await batch.destroy();
    res.json({ message: 'Batch deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
