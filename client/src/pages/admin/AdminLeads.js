import React, { useEffect, useState } from 'react';
import { FiPhoneCall, FiPlus, FiTrash2, FiSearch, FiFilter, FiX, FiSave, FiMail, FiCalendar, FiCheckCircle, FiCheck, FiUser, FiUploadCloud, FiFileText, FiClock } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_LEAD = {
  name: '',
  phone: '',
  email: '',
  courseName: '12th Commerce',
  status: 'New Lead',
  notes: '',
  callerName: 'Pooja (Telecaller)',
  nextFollowUpDate: ''
};

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'New Lead', 'Callback Requested', 'Interested', 'Enrolled', 'Busy / No Answer', 'Not Interested'

  // Excel Upload Modal State
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Single Add Lead Modal State
  const [addModal, setAddModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState(EMPTY_LEAD);
  const [savingNew, setSavingNew] = useState(false);

  // Inline remarks editing state: { [leadId]: 'text' }
  const [editingRemarks, setEditingRemarks] = useState({});
  const [savingLeadId, setSavingLeadId] = useState(null);
  const [emailingExcel, setEmailingExcel] = useState(false);

  const fetchLeads = async () => {
    try {
      const params = {};
      if (activeTab !== 'ALL') params.status = activeTab;
      if (search) params.search = search;
      const { data } = await api.get('/leads', { params });
      setLeads(data);

      // Initialize inline remarks state
      const initialRemarks = {};
      data.forEach(l => {
        initialRemarks[l.id] = l.notes || '';
      });
      setEditingRemarks(initialRemarks);
    } catch (err) {
      toast.error('Failed to load telecaller leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab, search]);

  // Quick Inline Status Change
  const handleInlineStatusChange = async (lead, newStatus) => {
    try {
      toast.loading('Updating status & sending Excel to email...', { id: 'status-update' });
      await api.put(`/leads/${lead.id}`, {
        ...lead,
        status: newStatus,
        notes: editingRemarks[lead.id] || lead.notes
      });
      toast.success(`Status updated to "${newStatus}" & Excel emailed!`, { id: 'status-update' });
      fetchLeads();
    } catch (err) {
      toast.error('Failed to update status', { id: 'status-update' });
    }
  };

  // Quick Inline Remarks Save
  const handleSaveRemarks = async (lead) => {
    setSavingLeadId(lead.id);
    try {
      await api.put(`/leads/${lead.id}`, {
        ...lead,
        notes: editingRemarks[lead.id]
      });
      toast.success(`Remarks updated for ${lead.name} & Excel emailed!`);
      fetchLeads();
    } catch (err) {
      toast.error('Failed to save remarks');
    } finally {
      setSavingLeadId(null);
    }
  };

  // Excel Bulk Import Handler
  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error('Please select an Excel file (.xlsx / .csv)');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const { data } = await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(data.message || 'Excel leads uploaded & Excel emailed!');
      setUploadModal(false);
      setUploadFile(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import Excel leads');
    } finally {
      setUploading(false);
    }
  };

  // Create Single New Lead
  const handleCreateNewLead = async () => {
    if (!newLeadForm.name || !newLeadForm.phone) {
      return toast.error('Lead name and phone number are required');
    }
    setSavingNew(true);
    try {
      await api.post('/leads', newLeadForm);
      toast.success('New lead added & Excel report emailed!');
      setAddModal(false);
      setNewLeadForm(EMPTY_LEAD);
      fetchLeads();
    } catch (err) {
      toast.error('Failed to create lead');
    } finally {
      setSavingNew(false);
    }
  };

  // Manual Email Excel Trigger
  const handleManualEmailExcel = async () => {
    setEmailingExcel(true);
    try {
      const { data } = await api.post('/leads/email-excel');
      toast.success(data.message || 'Excel report sent to email!');
    } catch (err) {
      toast.error('Failed to email Excel report');
    } finally {
      setEmailingExcel(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead record?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead removed');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const statusBg = {
    'New Lead': 'bg-slate-100 text-slate-800 border-slate-300',
    'Interested': 'bg-teal-50 text-teal-900 border-teal-300 font-bold',
    'Callback Requested': 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-sm',
    'Not Interested': 'bg-rose-50 text-rose-900 border-rose-300',
    'Enrolled': 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    'Busy / No Answer': 'bg-orange-50 text-orange-900 border-orange-300'
  };

  const TABS = [
    { id: 'ALL', label: '📋 All Leads' },
    { id: 'New Lead', label: '🆕 New Leads' },
    { id: 'Callback Requested', label: '📞 Re-Call Back Section' },
    { id: 'Interested', label: '👍 Interested' },
    { id: 'Enrolled', label: '🎓 Enrolled' },
    { id: 'Busy / No Answer', label: '⏳ Busy / No Answer' },
    { id: 'Not Interested', label: '❌ Not Interested' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Telecaller Calling CRM</h1>
          <p className="text-slate-500 text-sm">Upload Excel leads, log call responses, and track Re-Call Back dates automatically.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setUploadModal(true)}
            className="btn-secondary text-xs sm:text-sm flex items-center gap-2 border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <FiUploadCloud size={16} /> 📥 Upload Excel Leads
          </button>

          <button
            onClick={handleManualEmailExcel}
            disabled={emailingExcel}
            className="btn-secondary text-xs sm:text-sm flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <FiMail className={emailingExcel ? 'animate-spin' : ''} size={15} />
            {emailingExcel ? 'Sending Excel...' : '📧 Send Excel to Email'}
          </button>

          <button onClick={() => setAddModal(true)} className="btn-primary text-xs sm:text-sm flex items-center gap-2">
            <FiPlus /> Add Single Lead
          </button>
        </div>
      </div>

      {/* CATEGORY TABS (RE-CALL BACK HIGHLIGHTED) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {TABS.map(t => {
          const isActive = activeTab === t.id;
          const isReCallTab = t.id === 'Callback Requested';

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                isActive
                  ? isReCallTab
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                    : 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : isReCallTab
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* RE-CALL BACK BANNER ALERT (WHEN IN RE-CALL SECTION) */}
      {activeTab === 'Callback Requested' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow">
              <FiPhoneCall />
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm">📞 Re-Call Back & Follow-Up Section</div>
              <div className="text-xs text-amber-800">
                These leads require a re-call. See the exact date & time when the status was set to Callback.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="card p-3 flex items-center gap-3">
        <FiSearch className="text-slate-400 ml-2" size={16} />
        <input
          type="text"
          placeholder="Search leads by name, phone, email, course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input border-0 focus:ring-0 text-xs w-full p-1"
        />
      </div>

      {/* Direct Inline Leads Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-48">Lead Student</th>
              <th className="w-36">Phone</th>
              <th className="w-32">Course</th>
              <th className="w-48">Call Status & Date</th>
              <th>Call Remarks / Conversation Notes</th>
              <th className="text-right w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(l => {
              const isCallback = l.status === 'Callback Requested';
              const statusDateStr = l.statusUpdatedAt
                ? new Date(l.statusUpdatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                : (l.updatedAt ? new Date(l.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

              return (
                <tr key={l.id} className={`hover:bg-slate-50/80 transition-colors ${isCallback ? 'bg-amber-50/40' : ''}`}>
                  {/* Student Info */}
                  <td>
                    <div className="font-bold text-sm text-slate-900">{l.name}</div>
                    <div className="text-[11px] text-slate-400">Total Calls: {l.callCount || 1}</div>
                  </td>

                  {/* Phone */}
                  <td>
                    <a href={`tel:${l.phone}`} className="font-semibold text-xs text-primary-700 hover:underline flex items-center gap-1">
                      <FiPhoneCall size={12}/> {l.phone}
                    </a>
                  </td>

                  {/* Course */}
                  <td>
                    <span className="badge bg-slate-100 text-slate-700 text-xs">{l.courseName}</span>
                  </td>

                  {/* 1. DIRECT CALL STATUS UPDATE DROPDOWN WITH DATE STAMP */}
                  <td>
                    <div className="space-y-1">
                      <select
                        value={l.status}
                        onChange={e => handleInlineStatusChange(l, e.target.value)}
                        className={`input py-1.5 px-2 text-xs border rounded-lg w-full font-semibold transition-all ${statusBg[l.status] || ''}`}
                      >
                        <option value="New Lead">🆕 New Lead</option>
                        <option value="Interested">👍 Interested</option>
                        <option value="Callback Requested">📞 Re-Call Back</option>
                        <option value="Enrolled">🎓 Enrolled</option>
                        <option value="Busy / No Answer">⏳ Busy / No Answer</option>
                        <option value="Not Interested">❌ Not Interested</option>
                      </select>

                      {statusDateStr && (
                        <div className={`text-[11px] font-semibold flex items-center gap-1 ${isCallback ? 'text-amber-800' : 'text-slate-400'}`}>
                          <FiClock size={11} /> {isCallback ? 'Re-Call Set:' : 'Updated:'} {statusDateStr}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 2. DIRECT REMARKS / NOTES UPDATE INPUT */}
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingRemarks[l.id] !== undefined ? editingRemarks[l.id] : (l.notes || '')}
                        onChange={e => setEditingRemarks({ ...editingRemarks, [l.id]: e.target.value })}
                        placeholder="Type call response remarks here..."
                        className="input text-xs py-1.5 px-3 flex-1 bg-white border-slate-200 focus:border-primary-500"
                      />

                      <button
                        onClick={() => handleSaveRemarks(l)}
                        disabled={savingLeadId === l.id}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 flex-shrink-0"
                        title="Save Remarks & Send Excel"
                      >
                        {savingLeadId === l.id ? 'Saving...' : <><FiCheck size={14}/> Save</>}
                      </button>
                    </div>
                  </td>

                  {/* Delete */}
                  <td className="text-right">
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      title="Delete Lead"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <FiPhoneCall className="mx-auto text-3xl mb-2 text-slate-300" />
                  No leads found in this section. Click "📥 Upload Excel Leads" to import bulk leads!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EXCEL BULK UPLOAD MODAL */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FiUploadCloud className="text-primary-600" /> Upload Bulk Leads Excel
              </h2>
              <button onClick={() => setUploadModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg"><FiX /></button>
            </div>

            <form onSubmit={handleExcelUpload} className="p-6 space-y-4">
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-xs text-primary-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <FiFileText /> Accepted Excel Columns:
                </div>
                <p>Your Excel (.xlsx / .csv) should have header columns like:</p>
                <div className="font-mono bg-white p-2 rounded border text-[11px] text-primary-700">
                  Name | Phone | Course | Remarks
                </div>
              </div>

              <div>
                <label className="label">Select Excel File (.xlsx or .csv)</label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={e => setUploadFile(e.target.files[0])}
                  className="input w-full text-xs py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setUploadModal(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={uploading} className="btn-primary text-sm flex items-center gap-2">
                  {uploading ? 'Importing...' : <><FiUploadCloud /> Import Leads & Email Excel</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Single Lead Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg">Add Single Student Lead</h2>
              <button onClick={() => setAddModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg"><FiX /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Student Lead Name *</label>
                <input
                  type="text"
                  value={newLeadForm.name}
                  onChange={e => setNewLeadForm(p => ({ ...p, name: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. Rohan Malhotra"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm(p => ({ ...p, phone: e.target.value }))}
                    className="input w-full"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="label">Interested Course</label>
                  <select
                    value={newLeadForm.courseName}
                    onChange={e => setNewLeadForm(p => ({ ...p, courseName: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="10th Commerce">10th Commerce</option>
                    <option value="11th Commerce">11th Commerce</option>
                    <option value="12th Commerce">12th Commerce</option>
                    <option value="BCom / MCom">BCom / MCom</option>
                    <option value="BBA">BBA</option>
                    <option value="CA Foundation">CA Foundation</option>
                    <option value="CA Intermediate">CA Intermediate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Initial Call Remarks / Notes</label>
                <textarea
                  value={newLeadForm.notes}
                  onChange={e => setNewLeadForm(p => ({ ...p, notes: e.target.value }))}
                  className="input w-full h-20 text-xs"
                  placeholder="Enter initial call conversation notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t bg-slate-50">
              <button onClick={() => setAddModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleCreateNewLead} disabled={savingNew} className="btn-primary text-sm flex items-center gap-2">
                {savingNew ? 'Saving...' : <><FiSave /> Save Lead & Send Excel</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
