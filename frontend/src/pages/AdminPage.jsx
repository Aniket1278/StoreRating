import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SortableTable from '../components/SortableTable';
import Modal from '../components/Modal';

const TABS = ['Dashboard', 'Users', 'Stores'];

export default function AdminPage() {
  const [tab, setTab]           = useState('Dashboard');
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [stores, setStores]     = useState([]);
  const [userFilters, setUF]    = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilters, setSF]   = useState({ name: '', email: '', address: '' });
  const [showUserModal, setSUM] = useState(false);
  const [showStoreModal, setSSM]= useState(false);
  const [formMsg, setFormMsg]   = useState({ type: '', text: '' });

  // ── New user form state
  const [newUser, setNewUser] = useState({ name:'', email:'', address:'', password:'', role:'user' });
  // ── New store form state
  const [newStore, setNewStore] = useState({ name:'', email:'', address:'', ownerEmail:'' });

  const fetchStats = useCallback(async () => {
    const { data } = await api.get('/admin/dashboard');
    setStats(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(userFilters).filter(([,v]) => v));
    const { data } = await api.get('/admin/users', { params });
    setUsers(data);
  }, [userFilters]);

  const fetchStores = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(storeFilters).filter(([,v]) => v));
    const { data } = await api.get('/admin/stores', { params });
    setStores(data);
  }, [storeFilters]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === 'Users')  fetchUsers(); }, [tab, fetchUsers]);
  useEffect(() => { if (tab === 'Stores') fetchStores(); }, [tab, fetchStores]);

  // ── Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setFormMsg({ type: 'success', text: 'User created successfully.' });
      setNewUser({ name:'', email:'', address:'', password:'', role:'user' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error';
      setFormMsg({ type: 'error', text: msg });
    }
  };

  // ── Create store
  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/stores', newStore);
      setFormMsg({ type: 'success', text: 'Store created successfully.' });
      setNewStore({ name:'', email:'', address:'', ownerEmail:'' });
      fetchStores();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error';
      setFormMsg({ type: 'error', text: msg });
    }
  };

  const userColumns = [
    { key: 'name',    label: 'Name' },
    { key: 'email',   label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'role', label: 'Role',
      render: row => <span className={`badge badge-${row.role}`}>{row.role.replace('_',' ')}</span>
    },
    {
      key: 'storeRating', label: 'Store Rating', sortable: false,
      render: row => row.role === 'store_owner' ? (row.storeRating ?? '–') : '—'
    },
  ];

  const storeColumns = [
    { key: 'name',          label: 'Name' },
    { key: 'email',         label: 'Email' },
    { key: 'address',       label: 'Address' },
    { key: 'averageRating', label: 'Rating', render: r => r.averageRating?.toFixed(1) ?? '0.0' },
    { key: 'totalRatings',  label: 'Reviews' },
  ];

  return (
    <div className="app-container">
      <Navbar />
      <main className="page-content">
        {/* Tab nav */}
        <div className="tab-nav">
          {TABS.map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Dashboard ── */}
        {tab === 'Dashboard' && stats && (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">Overview</h1>
                <p className="page-subtitle">Platform statistics at a glance.</p>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button className="btn btn-ghost" onClick={() => { setSUM(true); setFormMsg({}); }}>+ Add User</button>
                <button className="btn btn-primary" onClick={() => { setSSM(true); setFormMsg({}); }}>+ Add Store</button>
              </div>
            </div>

            <div className="stats-grid">
              {[
                { label: 'Total Users',   value: stats.totalUsers },
                { label: 'Total Stores',  value: stats.totalStores },
                { label: 'Total Ratings', value: stats.totalRatings },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-value">{s.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Users ── */}
        {tab === 'Users' && (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">Users</h1>
                <p className="page-subtitle">{users.length} registered users</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setSUM(true); setFormMsg({}); }}>
                + Add User
              </button>
            </div>

            <div className="filters-bar">
              {[
                { key:'name',    ph:'Filter by name' },
                { key:'email',   ph:'Filter by email' },
                { key:'address', ph:'Filter by address' },
              ].map(f => (
                <input
                  key={f.key}
                  className="form-input"
                  placeholder={f.ph}
                  value={userFilters[f.key]}
                  onChange={e => setUF(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              ))}
              <select
                className="form-input"
                value={userFilters.role}
                onChange={e => setUF(prev => ({ ...prev, role: e.target.value }))}
                style={{ maxWidth: '160px' }}
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
              <button className="btn btn-ghost btn-sm" onClick={fetchUsers}>Search</button>
            </div>

            <SortableTable columns={userColumns} data={users} emptyMessage="No users match your filters." />
          </>
        )}

        {/* ── Stores ── */}
        {tab === 'Stores' && (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">Stores</h1>
                <p className="page-subtitle">{stores.length} registered stores</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setSSM(true); setFormMsg({}); }}>
                + Add Store
              </button>
            </div>

            <div className="filters-bar">
              {[
                { key:'name',    ph:'Filter by name' },
                { key:'email',   ph:'Filter by email' },
                { key:'address', ph:'Filter by address' },
              ].map(f => (
                <input
                  key={f.key}
                  className="form-input"
                  placeholder={f.ph}
                  value={storeFilters[f.key]}
                  onChange={e => setSF(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              ))}
              <button className="btn btn-ghost btn-sm" onClick={fetchStores}>Search</button>
            </div>

            <SortableTable columns={storeColumns} data={stores} emptyMessage="No stores found." />
          </>
        )}
      </main>

      {/* ── Add User Modal ── */}
      {showUserModal && (
        <Modal title="Add new user" onClose={() => setSUM(false)}>
          {formMsg.text && (
            <div className={`alert alert-${formMsg.type}`} style={{ marginBottom:'1rem' }}>
              {formMsg.text}
            </div>
          )}
          <form onSubmit={handleCreateUser} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            {[
              { field:'name',     label:'Full Name',  type:'text',     hint:'20–60 chars' },
              { field:'email',    label:'Email',       type:'email',    hint:'' },
              { field:'address',  label:'Address',     type:'text',     hint:'Max 400 chars' },
              { field:'password', label:'Password',    type:'password', hint:'8–16 chars, 1 uppercase, 1 special' },
            ].map(({ field, label, type, hint }) => (
              <div className="form-group" key={field}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  type={type}
                  value={newUser[field]}
                  onChange={e => setNewUser(u => ({ ...u, [field]: e.target.value }))}
                  required
                />
                {hint && <span className="form-hint">{hint}</span>}
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={newUser.role}
                onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
              >
                <option value="user">Normal User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSUM(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Add Store Modal ── */}
      {showStoreModal && (
        <Modal title="Add new store" onClose={() => setSSM(false)}>
          {formMsg.text && (
            <div className={`alert alert-${formMsg.type}`} style={{ marginBottom:'1rem' }}>
              {formMsg.text}
            </div>
          )}
          <form onSubmit={handleCreateStore} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            {[
              { field:'name',       label:'Store Name',       hint:'20–60 chars' },
              { field:'email',      label:'Email',             hint:'' },
              { field:'address',    label:'Address',           hint:'Max 400 chars' },
              { field:'ownerEmail', label:'Owner Email (opt)', hint:'Must be a registered store_owner' },
            ].map(({ field, label, hint }) => (
              <div className="form-group" key={field}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  type={field === 'email' || field === 'ownerEmail' ? 'email' : 'text'}
                  value={newStore[field]}
                  onChange={e => setNewStore(s => ({ ...s, [field]: e.target.value }))}
                  required={field !== 'ownerEmail'}
                />
                {hint && <span className="form-hint">{hint}</span>}
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSSM(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Store</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
