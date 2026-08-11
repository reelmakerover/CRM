import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FiCheckSquare, FiCalendar, FiClock, FiUsers, FiSave, FiAlertCircle, 
  FiCheck, FiX, FiMessageCircle, FiSend, FiChevronLeft, FiChevronRight,
  FiFilter, FiExternalLink, FiUserCheck, FiUserX, FiFolder, FiDownload,
  FiPrinter, FiTrendingUp, FiPieChart, FiSearch
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function TeacherAttendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'monthly'

  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(searchParams.get('batchId') || '');
  
  // Daily Attendance State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Monthly Register State
  const todayObj = new Date();
  const currentMonthStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlySearch, setMonthlySearch] = useState('');

  // WhatsApp Modal State
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [absentStudentsList, setAbsentStudentsList] = useState([]);
  const [customMsgTemplate, setCustomMsgTemplate] = useState(
    "Namaste {ParentName}, aapka ward {StudentName} (Roll: {RollNo}) aaj {Date} ko D's Education ke {BatchName} batch me ABSENT raha hai. Kripya bache ki niyamit upasthiti sunishchit karein. - D's Education (Vikram Rathore Sir)"
  );
  const [sentMap, setSentMap] = useState({});

  // 1. Fetch Teacher's Assigned Batches
  useEffect(() => {
    api.get('/teachers/my-data')
      .then(res => {
        const bList = res.data?.batches || [];
        setBatches(bList);
        if (!selectedBatchId && bList.length > 0) {
          setSelectedBatchId(String(bList[0].id));
        }
      })
      .catch(console.error);
  }, []);

  // 2. Fetch Daily Attendance
  const fetchAttendance = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    try {
      const res = await api.get(`/attendance/batch/${selectedBatchId}?date=${selectedDate}`);
      setAttendanceData(res.data);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load batch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId && activeTab === 'daily') {
      fetchAttendance();
    }
  }, [selectedBatchId, selectedDate, activeTab]);

  // 3. Fetch Monthly Attendance Register
  const fetchMonthlyAttendance = async () => {
    if (!selectedBatchId) return;
    setMonthlyLoading(true);
    try {
      const res = await api.get(`/attendance/monthly/${selectedBatchId}?month=${selectedMonth}`);
      setMonthlyData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load monthly attendance register');
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId && activeTab === 'monthly') {
      fetchMonthlyAttendance();
    }
  }, [selectedBatchId, selectedMonth, activeTab]);

  // Daily Status Change Handlers
  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, remarks } : s));
  };

  const handleMarkAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    toast.success(`Marked all as ${status.toUpperCase()}`);
  };

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const shiftMonth = (offset) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    const newMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  // Save Daily Attendance
  const handleSaveAttendance = async () => {
    if (!selectedBatchId || students.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        batchId: Number(selectedBatchId),
        date: selectedDate,
        records: students.map(s => ({
          studentId: s.id,
          status: s.status || 'present',
          remarks: s.remarks || ''
        }))
      };

      const res = await api.post('/attendance/mark', payload);
      const autoCount = res.data?.summary?.automatedWhatsAppTriggered || 0;
      if (autoCount > 0) {
        toast.success(`🚀 Attendance saved! Backend automatically sent WhatsApp & Email alerts to ${autoCount} absent students' parents.`);
      } else {
        toast.success('Attendance saved successfully!');
      }

      // Check absent students for manual fallback modal
      const absents = students.filter(s => s.status === 'absent');
      if (absents.length > 0) {
        setAbsentStudentsList(absents);
        setWhatsappModal(true);
      } else {
        fetchAttendance();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Build Personalized WhatsApp Link
  const getWhatsAppUrl = (student) => {
    const rawPhone = student.parentPhone || student.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const batchName = attendanceData?.batch?.name || 'Class';

    const text = customMsgTemplate
      .replace('{ParentName}', student.parentName || 'Parent')
      .replace('{StudentName}', student.name || 'Student')
      .replace('{RollNo}', student.enrollmentNo || `STU-${student.id}`)
      .replace('{Date}', formattedDate)
      .replace('{BatchName}', batchName);

    return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`;
  };

  const getStudentDirectWhatsAppUrl = (student, message) => {
    const rawPhone = student.parentPhone || student.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppClick = async (student) => {
    setSentMap(prev => ({ ...prev, [student.id]: true }));
    try {
      await api.post('/attendance/log-whatsapp', {
        studentId: student.id,
        batchId: selectedBatchId,
        date: selectedDate
      });
    } catch (e) {}
  };

  // Export Monthly Register as CSV / Excel
  const exportMonthlyRegister = () => {
    if (!monthlyData || !monthlyData.students || monthlyData.students.length === 0) {
      return toast.error('No monthly data to export');
    }

    const daysCount = monthlyData.daysInMonth;
    let header = 'Roll No,Student Name,Parent Name,Parent Phone,';
    for (let d = 1; d <= daysCount; d++) {
      header += `Day ${d},`;
    }
    header += 'Total Present,Total Absent,Total Late,Attendance %\n';

    let rows = '';
    monthlyData.students.forEach(st => {
      let row = `"${st.enrollmentNo || ''}","${st.name || ''}","${st.parentName || ''}","${st.parentPhone || ''}",`;
      for (let d = 1; d <= daysCount; d++) {
        const status = st.dailyStatus[d] || '—';
        const code = status === 'present' ? 'P' : (status === 'absent' ? 'A' : (status === 'late' ? 'L' : '—'));
        row += `"${code}",`;
      }
      row += `"${st.summary.present}","${st.summary.absent}","${st.summary.late}","${st.summary.percentage}%"\n`;
      rows += row;
    });

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Attendance_Register_${monthlyData.batch?.name || 'Batch'}_${monthlyData.month}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
    toast.success('Monthly Attendance Register exported successfully!');
  };

  // Print Monthly Register
  const printMonthlyRegister = () => {
    window.print();
  };

  // Filtered Monthly Students
  const filteredMonthlyStudents = useMemo(() => {
    if (!monthlyData?.students) return [];
    if (!monthlySearch.trim()) return monthlyData.students;
    const q = monthlySearch.toLowerCase().trim();
    return monthlyData.students.filter(st => 
      (st.name && st.name.toLowerCase().includes(q)) ||
      (st.enrollmentNo && st.enrollmentNo.toLowerCase().includes(q)) ||
      (st.parentName && st.parentName.toLowerCase().includes(q))
    );
  }, [monthlyData, monthlySearch]);

  // Daily Stats Counters
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiCheckSquare className="text-amber-600" /> Student Attendance & WhatsApp Alerts
          </h1>
          <p className="text-slate-500 text-sm">
            Mark daily attendance with auto WhatsApp alerts, and view full monthly attendance registers.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiCalendar size={14} className={activeTab === 'daily' ? 'text-amber-600' : ''} /> Daily Marking
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'monthly'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiPieChart size={14} /> Monthly Register
          </button>
        </div>
      </div>

      {/* Control Bar: Batch Selector & Date/Month Controls */}
      <div className="card p-4 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Batch Selection */}
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
            <FiFolder className="text-amber-600" /> Batch:
          </label>
          <select 
            value={selectedBatchId} 
            onChange={e => setSelectedBatchId(e.target.value)}
            className="input py-2 text-sm font-semibold bg-slate-50 border-slate-200 max-w-sm"
          >
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.courseName || b.course?.name || 'Class'}) — {b.timing || 'Regular'}
              </option>
            ))}
          </select>
        </div>

        {/* Date Controls (Daily Tab) */}
        {activeTab === 'daily' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-0.5">
              <button 
                onClick={() => shiftDate(-1)} 
                title="Previous Day"
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-800 px-2 py-1.5 focus:ring-0 focus:outline-none"
              />
              <button 
                onClick={() => shiftDate(1)} 
                title="Next Day"
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>

            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn-secondary text-xs py-2 px-3 hover:bg-slate-100"
            >
              Today
            </button>

            <button 
              onClick={handleSaveAttendance} 
              disabled={saving || loading || students.length === 0}
              className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5 shadow-md bg-amber-600 hover:bg-amber-700 font-bold"
            >
              <FiSave size={14} /> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}

        {/* Month Controls (Monthly Tab) */}
        {activeTab === 'monthly' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-0.5">
              <button 
                onClick={() => shiftMonth(-1)} 
                title="Previous Month"
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-800 px-3 py-1.5 focus:ring-0 focus:outline-none"
              />
              <button 
                onClick={() => shiftMonth(1)} 
                title="Next Month"
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>

            <button 
              onClick={exportMonthlyRegister} 
              disabled={monthlyLoading || !monthlyData}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 font-semibold"
            >
              <FiDownload size={14} className="text-emerald-600" /> Export Excel/CSV
            </button>

            <button 
              onClick={printMonthlyRegister} 
              disabled={monthlyLoading || !monthlyData}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 hover:bg-slate-100 font-semibold"
            >
              <FiPrinter size={14} /> Print
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. DAILY ATTENDANCE VIEW */}
      {/* ======================================================== */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Quick Stats & Bulk Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="card p-3.5 bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</div>
                <div className="font-display text-xl font-bold text-slate-900 mt-0.5">{students.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                <FiUsers />
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Present</div>
                <div className="font-display text-xl font-bold text-emerald-700 mt-0.5">{presentCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                <FiUserCheck />
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Absent</div>
                <div className="font-display text-xl font-bold text-rose-700 mt-0.5">{absentCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                <FiUserX />
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Late</div>
                <div className="font-display text-xl font-bold text-amber-700 mt-0.5">{lateCount}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                <FiClock />
              </div>
            </div>
          </div>

          {/* Quick Mark All Row */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="text-xs text-slate-500 font-medium">
              Mark individual student status below or use quick actions:
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleMarkAll('present')} 
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
              >
                <FiUserCheck size={13} className="text-emerald-600" /> All Present
              </button>
              <button 
                onClick={() => handleMarkAll('absent')} 
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
              >
                <FiUserX size={13} className="text-rose-600" /> All Absent
              </button>
            </div>
          </div>

          {/* Daily Attendance Table */}
          <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full"/>
              </div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                No students enrolled in this batch yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-12">#</th>
                      <th>Student Details</th>
                      <th>Parent Contact</th>
                      <th>Attendance Status</th>
                      <th>Overall Rate</th>
                      <th>Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st, idx) => {
                      const isAbsent = st.status === 'absent';
                      const isPresent = st.status === 'present';
                      const isLate = st.status === 'late';

                      return (
                        <tr key={st.id} className={isAbsent ? 'bg-rose-50/40' : ''}>
                          <td className="text-xs text-slate-400 font-mono">{idx + 1}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                                {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                                <div className="text-[11px] font-mono text-slate-400">{st.enrollmentNo || `STU-${st.id}`}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-xs text-slate-800 font-semibold">{st.parentName || 'Parent'}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{st.parentPhone || st.phone || 'No phone'}</div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'present')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <FiCheck size={12} /> Present
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'absent')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <FiX size={12} /> Absent
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'late')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                  isLate
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <FiClock size={12} /> Late
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`badge text-xs font-bold ${
                              (st.historyStats?.percentage || 100) >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {st.historyStats?.percentage || 100}%
                            </span>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={st.remarks || ''}
                              onChange={e => handleRemarksChange(st.id, e.target.value)}
                              placeholder="Reason / notes..."
                              className="input py-1 px-2.5 text-xs bg-slate-50 border-slate-200 w-44"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MONTHLY ATTENDANCE MATRIX REGISTER VIEW */}
      {/* ======================================================== */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Monthly KPI Overview Cards */}
          {monthlyData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
                <div className="flex items-center justify-between opacity-80 text-xs uppercase tracking-wider font-semibold">
                  <span>Batch Attendance Rate</span>
                  <FiTrendingUp size={16} />
                </div>
                <div className="font-display text-3xl font-bold mt-2">
                  {monthlyData.stats?.avgAttendanceRate || 100}%
                </div>
                <div className="text-amber-100 text-xs mt-1">
                  For {new Date(monthlyData.year, monthlyData.monthNumber - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="card p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <span>Classes Held</span>
                  <FiCalendar className="text-amber-600" size={16} />
                </div>
                <div className="font-display text-3xl font-bold text-slate-900 mt-2">
                  {monthlyData.totalClassDays || 0} <span className="text-sm font-normal text-slate-500">Days</span>
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  Out of {monthlyData.daysInMonth} calendar days
                </div>
              </div>

              <div className="card p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <span>Total Present Count</span>
                  <FiUserCheck className="text-emerald-600" size={16} />
                </div>
                <div className="font-display text-3xl font-bold text-emerald-700 mt-2">
                  {monthlyData.stats?.totalPresent || 0}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  Individual student attendances
                </div>
              </div>

              <div className="card p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <span>Total Absent Count</span>
                  <FiUserX className="text-rose-600" size={16} />
                </div>
                <div className="font-display text-3xl font-bold text-rose-700 mt-2">
                  {monthlyData.stats?.totalAbsent || 0}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  Automated absent alerts dispatched
                </div>
              </div>
            </div>
          )}

          {/* Search and Legend Bar */}
          <div className="card p-4 bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={monthlySearch}
                onChange={e => setMonthlySearch(e.target.value)}
                className="input pl-10 text-xs bg-slate-50 border-slate-200 w-full"
              />
            </div>

            {/* Attendance Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
              <span className="flex items-center gap-1 text-emerald-800">
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">P</span>
                Present
              </span>
              <span className="flex items-center gap-1 text-rose-800">
                <span className="w-5 h-5 rounded bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[10px]">A</span>
                Absent
              </span>
              <span className="flex items-center gap-1 text-amber-800">
                <span className="w-5 h-5 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">L</span>
                Late
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-normal">
                <span className="w-5 h-5 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px]">—</span>
                No Class
              </span>
            </div>
          </div>

          {/* Monthly Matrix Table */}
          <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm print:border-none print:shadow-none">
            {monthlyLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full"/>
              </div>
            ) : !monthlyData || filteredMonthlyStudents.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                No attendance records found for this batch and month.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[650px] relative">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-bold sticky top-0 z-20 border-b border-slate-200 shadow-xs">
                    <tr>
                      <th className="p-3 sticky left-0 bg-slate-50 z-30 min-w-[200px] border-r border-slate-200">
                        Student Name & Roll
                      </th>
                      {Array.from({ length: monthlyData.daysInMonth }).map((_, dIdx) => {
                        const dayNum = dIdx + 1;
                        const dateObj = new Date(monthlyData.year, monthlyData.monthNumber - 1, dayNum);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                        const isSunday = dateObj.getDay() === 0;

                        return (
                          <th 
                            key={dayNum} 
                            className={`p-1.5 text-center min-w-[28px] border-r border-slate-200 ${
                              isSunday ? 'bg-rose-50/60 text-rose-600' : ''
                            }`}
                          >
                            <div>{dayNum}</div>
                            <div className="text-[9px] font-normal text-slate-400 lowercase">{dayName}</div>
                          </th>
                        );
                      })}
                      <th className="p-2 text-center bg-emerald-50 text-emerald-800 font-bold border-r border-slate-200">P</th>
                      <th className="p-2 text-center bg-rose-50 text-rose-800 font-bold border-r border-slate-200">A</th>
                      <th className="p-2 text-center bg-amber-50 text-amber-800 font-bold border-r border-slate-200">L</th>
                      <th className="p-3 text-right bg-slate-100 text-slate-900 font-bold min-w-[90px]">Rate %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMonthlyStudents.map((st, sIdx) => {
                      const percent = st.summary.percentage;
                      const isLowAttendance = percent < 75;

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Sticky Student Profile Column */}
                          <td className="p-3 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200 shadow-xs">
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span>{st.enrollmentNo}</span>
                              <span>•</span>
                              <a
                                href={getStudentDirectWhatsAppUrl(st, `Namaste ${st.parentName || 'Parent'}, your ward ${st.name}'s monthly attendance at D's Education is ${percent}%.`)}
                                target="_blank"
                                rel="noreferrer"
                                title="Contact Parent on WhatsApp"
                                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-0.5"
                              >
                                <FiMessageCircle size={11} /> {st.parentPhone || st.phone}
                              </a>
                            </div>
                          </td>

                          {/* Day Status Cells */}
                          {Array.from({ length: monthlyData.daysInMonth }).map((_, dIdx) => {
                            const dayNum = dIdx + 1;
                            const status = st.dailyStatus[dayNum];
                            const dateObj = new Date(monthlyData.year, monthlyData.monthNumber - 1, dayNum);
                            const isSunday = dateObj.getDay() === 0;

                            let cellBadge = <span className="text-slate-300 font-mono text-[10px]">—</span>;
                            if (status === 'present') {
                              cellBadge = <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">P</span>;
                            } else if (status === 'absent') {
                              cellBadge = <span className="w-5 h-5 rounded bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px]">A</span>;
                            } else if (status === 'late') {
                              cellBadge = <span className="w-5 h-5 rounded bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">L</span>;
                            }

                            return (
                              <td 
                                key={dayNum} 
                                className={`p-1 text-center border-r border-slate-100 ${isSunday ? 'bg-rose-50/20' : ''}`}
                              >
                                <div className="flex items-center justify-center">
                                  {cellBadge}
                                </div>
                              </td>
                            );
                          })}

                          {/* Summary Totals */}
                          <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                            {st.summary.present}
                          </td>
                          <td className="p-2 text-center font-bold text-rose-700 bg-rose-50/30 border-r border-slate-100">
                            {st.summary.absent}
                          </td>
                          <td className="p-2 text-center font-bold text-amber-700 bg-amber-50/30 border-r border-slate-100">
                            {st.summary.late}
                          </td>
                          <td className="p-3 text-right">
                            <span className={`badge text-xs font-bold ${
                              percent >= 75 ? 'bg-emerald-100 text-emerald-800' : (percent >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                            }`}>
                              {percent}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WHATSAPP ABSENT PARENT NOTIFICATION MODAL */}
      {/* ======================================================== */}
      {whatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold shadow-inner">
                  <FiMessageCircle />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">📢 WhatsApp Absent Alerts</h3>
                  <p className="text-emerald-100 text-xs mt-0.5">
                    {absentStudentsList.length} student{absentStudentsList.length !== 1 ? 's' : ''} marked Absent today in {attendanceData?.batch?.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setWhatsappModal(false); fetchAttendance(); }}
                className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Automated Backend Dispatch Status Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  <FiCheck />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">⚡ Backend Automation Engine Triggered!</div>
                  <div className="text-emerald-700">
                    Automated absent WhatsApp messages and Email notifications have been dispatched directly from the server to parent contacts.
                  </div>
                </div>
              </div>

              {/* Message Template Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Customizable WhatsApp Message Template</span>
                  <span className="text-[10px] text-slate-400 lowercase font-normal">Supports {'{ParentName}'}, {'{StudentName}'}, {'{Date}'}, {'{BatchName}'}</span>
                </label>
                <textarea 
                  rows={3}
                  value={customMsgTemplate}
                  onChange={e => setCustomMsgTemplate(e.target.value)}
                  className="input text-xs leading-relaxed bg-slate-50 border-slate-200 resize-none font-sans"
                />
              </div>

              {/* Absent Students Dispatch Cards */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Absent Students & Parent WhatsApp ({absentStudentsList.length})
                </div>

                {absentStudentsList.map(st => {
                  const url = getWhatsAppUrl(st);
                  const isSent = sentMap[st.id];

                  return (
                    <div 
                      key={st.id} 
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 shadow-xs flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {st.enrollmentNo || `STU-${st.id}`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Parent: <strong>{st.parentName || 'Parent'}</strong></span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{st.parentPhone || st.phone || 'No phone'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSent ? (
                          <span className="badge bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 py-1 px-2.5">
                            <FiCheck size={12} /> Message Sent
                          </span>
                        ) : null}

                        <a 
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleWhatsAppClick(st)}
                          className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
                        >
                          <FiSend size={13} /> Direct Chat <FiExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                💡 Automated server WhatsApp is already active; "Direct Chat" is available as optional manual fallback.
              </div>
              <button 
                onClick={() => { setWhatsappModal(false); fetchAttendance(); }}
                className="btn-secondary text-xs py-2 px-4"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
