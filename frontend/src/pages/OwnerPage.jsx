import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SortableTable from '../components/SortableTable';
import Modal from '../components/Modal';
import { StarDisplay } from '../components/StarRating';

export default function OwnerPage() {
  const [data, setData]       = useState(null);
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg]     = useState('');

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', pwForm);
      setPwMsg('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error';
      setPwMsg(msg);
    }
  };

  const columns = [
    { key: 'userName',  label: 'Customer Name' },
    { key: 'userEmail', label: 'Email' },
    {
      key: 'value', label: 'Rating',
      render: row => <StarDisplay value={row.value} />
    },
    {
      key: 'createdAt', label: 'Date',
      render: row => new Date(row.createdAt).toLocaleDateString()
    },
  ];

  if (!data) return (
    <div className="app-container">
      <Navbar />
      <div className="loading-page"><div className="spinner" /></div>
    </div>
  );

  return (
    <div className="app-container">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">{data.store.name}</h1>
            <p className="page-subtitle">{data.store.address}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setPwModal(true); setPwMsg(''); }}>
            Change password
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <span className="stat-label">Average Rating</span>
            <span className="stat-value">{data.store.averageRating?.toFixed(1)}</span>
            <StarDisplay value={data.store.averageRating} />
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Reviews</span>
            <span className="stat-value">{data.store.totalRatings}</span>
          </div>
        </div>

        <h2 className="section-title">Customer Ratings</h2>
        <SortableTable
          columns={columns}
          data={data.ratings}
          emptyMessage="No ratings yet."
        />
      </main>

      {/* Password change modal */}
      {pwModal && (
        <Modal title="Change password" onClose={() => setPwModal(false)}>
          {pwMsg && (
            <div
              className={`alert ${pwMsg.includes('updated') ? 'alert-success' : 'alert-error'}`}
              style={{ marginBottom:'1rem' }}
            >
              {pwMsg}
            </div>
          )}
          <form onSubmit={handlePasswordChange} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Current password</label>
              <input
                className="form-input" type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                className="form-input" type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                required
              />
              <span className="form-hint">8–16 chars, 1 uppercase, 1 special character</span>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setPwModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update password</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
