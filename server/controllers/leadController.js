const Lead = require('../models/Lead');
const { sendLeadExcelReport } = require('../utils/mailer');
const xlsx = require('xlsx');

exports.getAllLeads = async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = {};
    if (status) where.status = status;
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { courseName: { [Op.like]: `%${search}%` } }
      ];
    }

    const leads = await Lead.findAll({
      where,
      order: [['updatedAt', 'DESC']]
    });

    res.json(leads);
  } catch (err) {
    console.error('Error in getAllLeads:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { name, phone, email, courseName, status, notes, callerName, nextFollowUpDate } = req.body;

    const lead = await Lead.create({
      name,
      phone,
      email: email || '',
      courseName: courseName || '12th Commerce',
      status: status || 'New Lead',
      notes: notes || '',
      callerName: callerName || req.user.name || 'Telecaller',
      callCount: 1,
      lastCalledAt: new Date(),
      statusUpdatedAt: new Date(),
      nextFollowUpDate: nextFollowUpDate || null
    });

    // Automatically send updated Excel report to email in background
    Lead.findAll().then(allLeads => {
      sendLeadExcelReport({
        toEmail: req.user.email,
        leads: allLeads,
        triggerReason: `New Lead Created: ${name}`
      });
    }).catch(e => console.error(e.message));

    res.status(201).json(lead);
  } catch (err) {
    console.error('Error in createLead:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateLeadResponse = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const { status, notes, callerName, nextFollowUpDate, name, phone, email, courseName } = req.body;

    const isStatusChanged = status && status !== lead.status;

    await lead.update({
      name: name || lead.name,
      phone: phone || lead.phone,
      email: email !== undefined ? email : lead.email,
      courseName: courseName || lead.courseName,
      status: status || lead.status,
      notes: notes !== undefined ? notes : lead.notes,
      callerName: callerName || req.user.name || lead.callerName,
      callCount: (lead.callCount || 0) + 1,
      lastCalledAt: new Date(),
      statusUpdatedAt: isStatusChanged ? new Date() : (lead.statusUpdatedAt || new Date()),
      nextFollowUpDate: nextFollowUpDate !== undefined ? (nextFollowUpDate || null) : lead.nextFollowUpDate
    });

    // Automatically send updated Excel report to email in background
    Lead.findAll().then(allLeads => {
      sendLeadExcelReport({
        toEmail: req.user.email,
        leads: allLeads,
        triggerReason: `Call Response Updated for ${lead.name} (${status})`
      });
    }).catch(e => console.error(e.message));

    res.json(lead);
  } catch (err) {
    console.error('Error in updateLeadResponse:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.bulkImportLeads = async (req, res) => {
  try {
    let rows = [];

    if (req.file) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (req.body.leads && Array.isArray(req.body.leads)) {
      rows = req.body.leads;
    } else {
      return res.status(400).json({ message: 'Please upload a valid Excel file (.xlsx / .csv)' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: 'The uploaded Excel file contains no lead rows' });
    }

    let createdCount = 0;
    const callerName = req.user.name || 'Telecaller';

    for (const r of rows) {
      // Flexible column headers matching
      const name = r.Name || r.name || r['Student Name'] || r['Lead Name'] || r['Full Name'];
      const phone = r.Phone || r.phone || r['Phone Number'] || r.Mobile || r['Mobile Number'] || r.Contact || r['Contact No'];
      const email = r.Email || r.email || r['Email Address'] || '';
      const courseName = r.Course || r.course || r['Course Interested'] || r.Subject || '12th Commerce';
      const notes = r.Notes || r.notes || r.Remarks || r.remarks || r.Comments || '';

      if (name && phone) {
        await Lead.create({
          name: String(name).trim(),
          phone: String(phone).trim(),
          email: String(email).trim(),
          courseName: String(courseName).trim(),
          status: 'New Lead',
          notes: String(notes).trim(),
          callerName,
          callCount: 0,
          statusUpdatedAt: new Date()
        });
        createdCount++;
      }
    }

    // Automatically send updated Excel report to email in background
    const allLeads = await Lead.findAll({ order: [['updatedAt', 'DESC']] });
    sendLeadExcelReport({
      toEmail: req.user.email,
      leads: allLeads,
      triggerReason: `Bulk Excel Import of ${createdCount} New Leads`
    }).catch(e => console.error(e.message));

    res.status(201).json({
      message: `Successfully imported ${createdCount} new leads from Excel!`,
      count: createdCount
    });
  } catch (err) {
    console.error('Error in bulkImportLeads:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await lead.destroy();
    res.json({ message: 'Lead removed' });
  } catch (err) {
    console.error('Error in deleteLead:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.emailExcelReport = async (req, res) => {
  try {
    const leads = await Lead.findAll({ order: [['updatedAt', 'DESC']] });
    await sendLeadExcelReport({
      toEmail: req.user.email,
      leads,
      triggerReason: 'Manual Excel Report Request from CRM'
    });

    res.json({ message: `Excel report generated & sent to ${req.user.email} successfully!` });
  } catch (err) {
    console.error('Error in emailExcelReport:', err);
    res.status(500).json({ message: err.message });
  }
};
