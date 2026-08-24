const { Attendance, Student, Batch, Course, User } = require('../models');
const { Op } = require('sequelize');
const { sendAbsentWhatsAppAlert } = require('../utils/whatsapp');

// Mark / Update Batch Attendance for a Date
exports.markAttendance = async (req, res) => {
  try {
    const { batchId, date, records } = req.body;

    if (!batchId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'batchId, date, and student records array are required' });
    }

    const batch = await Batch.findByPk(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const markedById = req.user?.id || null;
    const courseId = batch.courseId || null;

    const savedRecords = [];
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    const absentStudentIds = [];

    for (const r of records) {
      const status = ['present', 'absent', 'late'].includes(r.status) ? r.status : 'present';
      if (status === 'present') presentCount++;
      if (status === 'absent') {
        absentCount++;
        absentStudentIds.push(r.studentId);
      }
      if (status === 'late') lateCount++;

      // Check if existing record exists
      let existing = await Attendance.findOne({
        where: {
          date,
          studentId: r.studentId,
          batchId
        }
      });

      if (existing) {
        existing.status = status;
        existing.remarks = r.remarks || existing.remarks;
        existing.markedById = markedById;
        existing.courseId = courseId;
        await existing.save();
        savedRecords.push(existing);
      } else {
        const created = await Attendance.create({
          date,
          status,
          remarks: r.remarks || null,
          whatsappStatus: status === 'absent' ? 'pending' : 'not_applicable',
          studentId: r.studentId,
          batchId,
          courseId,
          markedById
        });
        savedRecords.push(created);
      }
    }

    // AUTOMATED BACKEND WHATSAPP & EMAIL DISPATCH FOR ABSENT STUDENTS
    let automatedAlertsCount = 0;
    if (absentStudentIds.length > 0) {
      const absentStudents = await Student.findAll({
        where: { id: { [Op.in]: absentStudentIds } }
      });

      // Run dispatches in background asynchronously
      Promise.allSettled(
        absentStudents.map(async (student) => {
          const studentRecord = records.find(r => Number(r.studentId) === Number(student.id));
          const alertResult = await sendAbsentWhatsAppAlert({
            student,
            batch,
            date,
            remarks: studentRecord?.remarks || ''
          });

          // Update attendance record status
          const att = savedRecords.find(sr => Number(sr.studentId) === Number(student.id));
          if (att) {
            att.whatsappStatus = alertResult?.whatsapp?.success ? 'sent' : (alertResult?.whatsapp?.simulated ? 'simulated' : 'failed');
            await att.save().catch(() => {});
          }
          return alertResult;
        })
      ).then(results => {
        console.log(`📢 [Automated Dispatch] Processed ${results.length} absent alerts for batch: ${batch.name}`);
      }).catch(err => {
        console.error('Error in background absent alerts:', err.message);
      });

      automatedAlertsCount = absentStudents.length;
    }

    res.json({
      message: 'Attendance saved successfully',
      date,
      batchId,
      batchName: batch.name,
      summary: {
        total: records.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        automatedWhatsAppTriggered: automatedAlertsCount
      },
      records: savedRecords
    });
  } catch (err) {
    console.error('markAttendance error:', err);
    res.status(500).json({ message: err.message || 'Failed to mark attendance' });
  }
};

// Get Batch Attendance for a specific Date & Student Roster
exports.getBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const batch = await Batch.findByPk(batchId, {
      include: [{ association: 'course', attributes: ['id', 'name'] }]
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Get all students enrolled in this batch
    const students = await Student.findAll({
      where: { batchId },
      order: [['name', 'ASC']]
    });

    // Get attendance records for this batch and date
    const attendanceRecords = await Attendance.findAll({
      where: { batchId, date },
      include: [{ association: 'markedBy', attributes: ['id', 'name', 'email', 'role'] }]
    });

    const attMap = {};
    attendanceRecords.forEach(a => {
      attMap[a.studentId] = a;
    });

    // Calculate historical attendance percentage for each student in this batch
    const studentListWithStats = await Promise.all(
      students.map(async (st) => {
        const totalClasses = await Attendance.count({
          where: { studentId: st.id, batchId }
        });
        const presentClasses = await Attendance.count({
          where: { 
            studentId: st.id, 
            batchId,
            status: { [Op.in]: ['present', 'late'] }
          }
        });

        const attendancePercentage = totalClasses > 0 
          ? Math.round((presentClasses / totalClasses) * 100) 
          : 100;

        const currentRecord = attMap[st.id];

        return {
          id: st.id,
          name: st.name,
          enrollmentNo: st.enrollmentNo,
          email: st.email,
          phone: st.phone,
          parentName: st.parentName || 'Parent / Guardian',
          parentPhone: st.parentPhone || st.phone,
          parentEmail: st.parentEmail,
          photo: st.photo,
          status: currentRecord ? currentRecord.status : 'present', // default present
          remarks: currentRecord ? currentRecord.remarks : '',
          isMarked: !!currentRecord,
          whatsappStatus: currentRecord ? currentRecord.whatsappStatus : 'pending',
          historyStats: {
            totalClasses,
            presentClasses,
            percentage: attendancePercentage
          }
        };
      })
    );

    const isMarkedForDate = attendanceRecords.length > 0;
    const markedByInfo = isMarkedForDate ? attendanceRecords[0]?.markedBy : null;

    res.json({
      batch: {
        id: batch.id,
        name: batch.name,
        courseName: batch.course?.name || '',
        timing: batch.timing,
        instructor: batch.instructor
      },
      date,
      isMarkedForDate,
      markedBy: markedByInfo,
      totalStudents: students.length,
      students: studentListWithStats
    });
  } catch (err) {
    console.error('getBatchAttendance error:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch batch attendance' });
  }
};

// Get Single Student Attendance History
exports.getStudentAttendance = async (req, res) => {
  try {
    let { studentId } = req.params;

    let student = null;
    if (studentId === 'me') {
      student = await Student.findOne({ 
        where: { email: req.user.email },
        include: [
          { association: 'batch', attributes: ['id', 'name', 'timing'] },
          { association: 'course', attributes: ['id', 'name'] }
        ]
      });
      if (student) studentId = student.id;
    } else {
      student = await Student.findByPk(studentId, {
        include: [
          { association: 'batch', attributes: ['id', 'name', 'timing'] },
          { association: 'course', attributes: ['id', 'name'] }
        ]
      });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const records = await Attendance.findAll({
      where: { studentId },
      include: [
        { association: 'batch', attributes: ['id', 'name'] },
        { association: 'markedBy', attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC']]
    });

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    res.json({
      student,
      stats: { total, present, absent, late, percentage },
      records
    });
  } catch (err) {
    console.error('getStudentAttendance error:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch student attendance' });
  }
};

// Get Overall Attendance Dashboard Stats
exports.getAttendanceStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    let batchFilter = {};
    // If teacher, only stats for their assigned batches
    if (req.user?.role === 'teacher' && Array.isArray(req.user.assignedBatches) && req.user.assignedBatches.length > 0) {
      batchFilter = { id: { [Op.in]: req.user.assignedBatches } };
    }

    const batches = await Batch.findAll({
      where: batchFilter,
      include: [
        { association: 'course', attributes: ['id', 'name'] },
        { association: 'students', attributes: ['id'] }
      ]
    });

    const batchStats = await Promise.all(
      batches.map(async (b) => {
        const todayRecords = await Attendance.findAll({
          where: { batchId: b.id, date: today }
        });

        const present = todayRecords.filter(r => r.status === 'present').length;
        const absent = todayRecords.filter(r => r.status === 'absent').length;
        const late = todayRecords.filter(r => r.status === 'late').length;

        return {
          batchId: b.id,
          batchName: b.name,
          courseName: b.course?.name || '',
          totalStudents: b.students?.length || 0,
          isMarkedToday: todayRecords.length > 0,
          todaySummary: {
            present,
            absent,
            late,
            total: todayRecords.length
          }
        };
      })
    );

    const totalStudents = batches.reduce((acc, b) => acc + (b.students?.length || 0), 0);
    const totalMarkedToday = batchStats.reduce((acc, b) => acc + b.todaySummary.total, 0);
    const totalAbsentToday = batchStats.reduce((acc, b) => acc + b.todaySummary.absent, 0);
    const totalPresentToday = batchStats.reduce((acc, b) => acc + b.todaySummary.present, 0);

    res.json({
      today,
      totalBatches: batches.length,
      totalStudents,
      totalMarkedToday,
      totalPresentToday,
      totalAbsentToday,
      batches: batchStats
    });
  } catch (err) {
    console.error('getAttendanceStats error:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch attendance stats' });
  }
};

// Log WhatsApp Dispatch
exports.logWhatsAppDispatch = async (req, res) => {
  try {
    const { studentId, batchId, date } = req.body;
    if (!studentId || !date) {
      return res.status(400).json({ message: 'studentId and date are required' });
    }

    const where = { studentId, date };
    if (batchId) where.batchId = batchId;

    const record = await Attendance.findOne({ where });
    if (record) {
      record.whatsappStatus = 'sent';
      await record.save();
    }

    res.json({ message: 'WhatsApp dispatch logged successfully', record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Monthly Attendance Matrix for Batch
exports.getMonthlyBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    let year, month;
    if (req.query.month && req.query.month.includes('-')) {
      const parts = req.query.month.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    } else {
      year = parseInt(req.query.year, 10) || new Date().getFullYear();
      month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
    }

    const batch = await Batch.findByPk(batchId, {
      include: [{ association: 'course', attributes: ['id', 'name'] }]
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-${daysInMonth < 10 ? '0' + daysInMonth : daysInMonth}`;

    const students = await Student.findAll({
      where: { batchId },
      order: [['name', 'ASC']]
    });

    const attendanceRecords = await Attendance.findAll({
      where: {
        batchId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const studentDayMap = {};
    const markedDatesSet = new Set();

    attendanceRecords.forEach(att => {
      markedDatesSet.add(att.date);
      const dayNum = parseInt(att.date.split('-')[2], 10);
      if (!studentDayMap[att.studentId]) {
        studentDayMap[att.studentId] = {};
      }
      studentDayMap[att.studentId][dayNum] = att.status;
    });

    const activeClassDaysCount = markedDatesSet.size;

    let grandTotalPresent = 0;
    let grandTotalAbsent = 0;
    let grandTotalLate = 0;

    const studentMatrix = students.map(st => {
      const dayMap = studentDayMap[st.id] || {};
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const stStatus = dayMap[d];
        if (stStatus === 'present') presentCount++;
        else if (stStatus === 'absent') absentCount++;
        else if (stStatus === 'late') lateCount++;
      }

      const totalMarkedForStudent = presentCount + absentCount + lateCount;
      const percentage = totalMarkedForStudent > 0
        ? Math.round(((presentCount + lateCount) / totalMarkedForStudent) * 100)
        : (activeClassDaysCount > 0 ? 0 : 100);

      grandTotalPresent += presentCount;
      grandTotalAbsent += absentCount;
      grandTotalLate += lateCount;

      return {
        id: st.id,
        name: st.name,
        enrollmentNo: st.enrollmentNo || `STU-${st.id}`,
        email: st.email,
        phone: st.phone,
        parentName: st.parentName || 'Parent / Guardian',
        parentPhone: st.parentPhone || st.phone,
        parentEmail: st.parentEmail,
        photo: st.photo,
        dailyStatus: dayMap,
        summary: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          totalMarked: totalMarkedForStudent,
          percentage
        }
      };
    });

    const totalStudents = students.length;
    const totalPossibleSlots = totalStudents * activeClassDaysCount;
    const avgAttendanceRate = totalPossibleSlots > 0
      ? Math.round(((grandTotalPresent + grandTotalLate) / totalPossibleSlots) * 100)
      : 100;

    res.json({
      batch: {
        id: batch.id,
        name: batch.name,
        courseName: batch.course?.name || '',
        timing: batch.timing,
        instructor: batch.instructor
      },
      month: `${year}-${monthStr}`,
      year,
      monthNumber: month,
      daysInMonth,
      activeClassDays: Array.from(markedDatesSet).sort(),
      totalClassDays: activeClassDaysCount,
      totalStudents,
      stats: {
        totalPresent: grandTotalPresent,
        totalAbsent: grandTotalAbsent,
        totalLate: grandTotalLate,
        avgAttendanceRate
      },
      students: studentMatrix
    });
  } catch (err) {
    console.error('getMonthlyBatchAttendance error:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch monthly attendance' });
  }
};
