import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { StarPicker, StarDisplay } from '../components/StarRating';

export default function StoresPage() {
  const [stores, setStores]   = useState([]);
  const [search, setSearch]   = useState({ name: '', address: '' });
  const [rateModal, setRateModal] = useState(null); // { store, mode: 'new'|'edit' }
  const [rateValue, setRateValue] = useState(0);
  const [msg, setMsg]         = useState({ type: '', text: '' });
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg]     = useState('');

  const fetchStores = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(search).filter(([,v]) => v));
    const { data } = await api.get('/stores', { params });
    setStores(data);
  }, [search]);

  useEffect(() => { fetchStores(); }, []); // Initial load

  const openRating = (store) => {
    setRateValue(store.userRating || 0);
    setRateModal({ store, mode: store.userRating ? 'edit' : 'new' });
    setMsg({ type: '', text: '' });
  };

  const submitRating = async () => {
    if (!rateValue) { setMsg({ type: 'error', text: 'Please select a rating.' }); return; }
    try {
      if (rateModal.mode === 'new') {
        await api.post('/ratings', { storeId: rateModal.store._id, value: rateValue });
      } else {
        await api.put(`/ratings/${rateModal.store._id}`, { value: rateValue });
      }
      setMsg({ type: 'success', text: 'Rating saved!' });
      fetchStores();
      setTimeout(() => setRateModal(null), 800);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error saving rating.' });
    }
  };

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

  return (
    <div className="app-container">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Stores</h1>
            <p className="page-subtitle">Browse and rate local stores.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setPwModal(true); setPwMsg(''); }}>
            Change password
          </button>
        </div>

        {/* Search filters */}
        <div className="filters-bar">
          <input
            className="form-input"
            placeholder="Search by name"
            value={search.name}
            onChange={e => setSearch(s => ({ ...s, name: e.target.value }))}
          />
          <input
            className="form-input"
            placeholder="Search by address"
            value={search.address}
            onChange={e => setSearch(s => ({ ...s, address: e.target.value }))}
          />
          <button className="btn btn-ghost btn-sm" onClick={fetchStores}>Search</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch({ name:'', address:'' }); fetchStores(); }}>
            Clear
          </button>
        </div>

        {/* Stores grid */}
        {stores.length === 0 ? (
          <div className="empty-state"><p>No stores found.</p></div>
        ) : (
          <div className="stores-grid">
            {stores.map(store => (
              <div className="store-card" key={store._id}>
                <div>
                  <div className="store-card-name">{store.name}</div>
                  <div className="store-card-address">{store.address}</div>
                </div>

                <div className="store-card-meta">
                  <div className="avg-rating">
                    <StarDisplay value={store.averageRating} />
                    <strong>{store.averageRating?.toFixed(1)}</strong>
                    <span>({store.totalRatings})</span>
                  </div>
                </div>

                {store.userRating !== null && (
                  <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                    Your rating: <strong style={{ color:'var(--star-active)' }}>{'★'.repeat(store.userRating)}</strong>
                  </div>
                )}

                <div className="store-card-actions">
                  {store.userRating === null ? (
                    <button className="btn btn-primary btn-sm" onClick={() => openRating(store)}>
                      Rate store
                    </button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => openRating(store)}>
                      Edit rating
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rating modal */}
      {rateModal && (
        <Modal
          title={rateModal.mode === 'new' ? 'Rate this store' : 'Update your rating'}
          onClose={() => setRateModal(null)}
        >
          <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', marginBottom:'1.25rem' }}>
            {rateModal.store.name}
          </p>

          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.25rem' }}>
            <StarPicker value={rateValue} onChange={setRateValue} />
          </div>

          {msg.text && (
            <div className={`alert alert-${msg.type}`} style={{ marginBottom:'1rem' }}>
              {msg.text}
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setRateModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitRating}>
              {rateModal.mode === 'new' ? 'Submit rating' : 'Update rating'}
            </button>
          </div>
        </Modal>
      )}

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
