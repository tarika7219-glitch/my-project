import React, { useMemo, useState } from 'react';
import '../styles/JobApplicationTracker.css';
import { FiBriefcase, FiTrash2 } from 'react-icons/fi';

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

function JobApplicationTracker({
  applications,
  isLoading,
  analyses,
  onCreate,
  onStatusChange,
  onDelete,
}) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    status: 'Applied',
    application_date: '',
    analysis_session_id: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const appList = Array.isArray(applications) ? applications : [];
  const analysisList = Array.isArray(analyses) ? analyses : [];

  const analysisLookup = useMemo(() => {
    const map = new Map();
    analysisList.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [analysisList]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      company: '',
      role: '',
      status: 'Applied',
      application_date: '',
      analysis_session_id: '',
      notes: '',
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      alert('Company and role are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        company: form.company.trim(),
        role: form.role.trim(),
        status: form.status,
        application_date: form.application_date || null,
        analysis_session_id: form.analysis_session_id ? Number(form.analysis_session_id) : null,
        notes: form.notes.trim() || null,
      });
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;
    return parsed.toLocaleDateString();
  };

  return (
    <div className="job-tracker">
      <div className="job-tracker-header">
        <h2>Job Application Tracker</h2>
        <p>Track applications and update progress in one place.</p>
      </div>

      <form className="job-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Company"
          value={form.company}
          onChange={(e) => handleChange('company', e.target.value)}
        />
        <input
          type="text"
          placeholder="Role"
          value={form.role}
          onChange={(e) => handleChange('role', e.target.value)}
        />
        <select
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.application_date}
          onChange={(e) => handleChange('application_date', e.target.value)}
        />
        <select
          value={form.analysis_session_id}
          onChange={(e) => handleChange('analysis_session_id', e.target.value)}
        >
          <option value="">No linked analysis</option>
          {analysisList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title || `Analysis #${item.id}`}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Application'}
        </button>
      </form>

      {isLoading ? (
        <div className="job-empty">Loading applications...</div>
      ) : appList.length === 0 ? (
        <div className="job-empty">No applications yet. Add your first one.</div>
      ) : (
        <div className="job-list">
          {appList.map((application) => {
            const linkedAnalysis = analysisLookup.get(application.analysis_session_id);
            return (
              <div key={application.id} className="job-card">
                <div className="job-main">
                  <div className="job-title-row">
                    <FiBriefcase />
                    <strong>{application.role}</strong>
                    <span className="job-company">@ {application.company}</span>
                  </div>
                  <div className="job-meta">
                    <span>Applied: {formatDate(application.application_date)}</span>
                    {linkedAnalysis && (
                      <span>
                        Linked: {linkedAnalysis.title || `Analysis #${linkedAnalysis.id}`}
                      </span>
                    )}
                  </div>
                  {application.notes && <p className="job-notes">{application.notes}</p>}
                </div>

                <div className="job-actions">
                  <select
                    value={application.status}
                    onChange={(e) => onStatusChange(application.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="job-delete-btn"
                    onClick={() => onDelete(application.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobApplicationTracker;
