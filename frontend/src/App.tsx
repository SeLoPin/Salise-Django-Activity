import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useParams,
} from 'react-router-dom';
import './App.css';
import InteractiveBackground from './InteractiveBackground';

/* ── Types ── */
interface Department { dept_id?: number; bldg_id: number; dept_name: string; }
interface Employee   { emp_id?: number;  dept_id: number; emp_name: string; emp_age: number; emp_sex: string; }
interface Project    { proj_id?: number; emp_id: number;  dept_id: number;  proj_name: string; }

const API_URL = 'http://127.0.0.1:8000/api';
type TabType = 'departments' | 'employees' | 'projects';
type Theme   = 'dark' | 'light';

/* ── Theme hook ── */
function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('gm-theme') as Theme | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gm-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);
  return [theme, toggle];
}

/* ── Piece SVGs ── */
const KingIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ flexShrink: 0 }}>
    <path d="M11 2h2v3h3v2h-3v3h3l1 1v8l-1 1H8l-1-1V11l1-1h3V7H8V5h3V2zm-2 11v6h6v-6H9z" />
  </svg>
);
const RookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ flexShrink: 0 }}>
    <path d="M5 3h3v3h2V3h4v3h2V3h3v4l-1 1H6L5 7V3zm1 6h12v10l-1 1H7l-1-1V9zm2 2v7h8v-7H8z" />
  </svg>
);
const KnightIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ flexShrink: 0 }}>
    <path d="M6 20l1-1h10l1 1v1H6v-1zm1-3l-1-1V9l2-5h2l1 2 2-1h3l1 1-1 4-2 1v5l-1 1H7zm2-2h6v-4l2-1 1-3h-2l-2 1-2-2H8L7 9v7h2z" />
  </svg>
);

/* Moon / Sun icons for toggle */
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1"  x2="12" y2="3"  />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"  />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1"  y1="12" x2="3"  y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
  </svg>
);

const TAB_CONFIG = {
  departments: { icon: <KingIcon />,   label: 'Departments', glyph: '♚' },
  employees:   { icon: <RookIcon />,   label: 'Employees',   glyph: '♞' },
  projects:    { icon: <KnightIcon />, label: 'Projects',    glyph: '♝' },
} as const;

const PIECE_PATH: Record<TabType, string> = {
  departments: 'M11 2h2v3h3v2h-3v3h3l1 1v8l-1 1H8l-1-1V11l1-1h3V7H8V5h3V2zm-2 11v6h6v-6H9z',
  employees:   'M5 3h3v3h2V3h4v3h2V3h3v4l-1 1H6L5 7V3zm1 6h12v10l-1 1H7l-1-1V9zm2 2v7h8v-7H8z',
  projects:    'M6 20l1-1h10l1 1v1H6v-1zm1-3l-1-1V9l2-5h2l1 2 2-1h3l1 1-1 4-2 1v5l-1 1H7zm2-2h6v-4l2-1 1-3h-2l-2 1-2-2H8L7 9v7h2z',
};

/* InteractiveBackground is imported from ./InteractiveBackground.tsx */

/* ── Dashboard ── */
function DashboardContent({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
  const { tab }   = useParams<{ tab: string }>();
  const activeTab = (tab as TabType) || 'departments';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees,   setEmployees]   = useState<Employee[]>([]);
  const [projects,    setProjects]    = useState<Project[]>([]);

  const [bldgId,     setBldgId]     = useState('');
  const [deptName,   setDeptName]   = useState('');
  const [empDeptId,  setEmpDeptId]  = useState('');
  const [empName,    setEmpName]    = useState('');
  const [empAge,     setEmpAge]     = useState('');
  const [empSex,     setEmpSex]     = useState('');
  const [projEmpId,  setProjEmpId]  = useState('');
  const [projDeptId, setProjDeptId] = useState('');
  const [projName,   setProjName]   = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [message,     setMessage]     = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [rowsIn,      setRowsIn]      = useState(false);

  const prevTab = useRef(activeTab);

  useEffect(() => {
    prevTab.current = activeTab;
    setLoading(true);
    setRowsIn(false);
    const load = async () => {
      await fetchResource(activeTab);
      setLoading(false);
      setTimeout(() => setRowsIn(true), 30);
    };
    load();
    closeModal();
  }, [activeTab]);

  const fetchResource = async (resource: string) => {
    try {
      const r    = await fetch(`${API_URL}/${resource}/`);
      const data = await r.json();
      if (resource === 'departments') setDepartments(data);
      else if (resource === 'employees') setEmployees(data);
      else setProjects(data);
    } catch { showMsg('Failed to connect to API.', 'error'); }
  };

  const handleEditClick = (item: any) => {
    if (activeTab === 'departments') {
      setBldgId(item.bldg_id.toString()); setDeptName(item.dept_name); setEditingId(item.dept_id);
    } else if (activeTab === 'employees') {
      setEmpDeptId(item.dept_id.toString()); setEmpName(item.emp_name);
      setEmpAge(item.emp_age.toString());    setEmpSex(item.emp_sex); setEditingId(item.emp_id);
    } else {
      setProjEmpId(item.emp_id.toString()); setProjDeptId(item.dept_id.toString());
      setProjName(item.proj_name);          setEditingId(item.proj_id);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingId(null);
    setBldgId(''); setDeptName(''); setEmpDeptId(''); setEmpName('');
    setEmpAge(''); setEmpSex('');   setProjEmpId(''); setProjDeptId(''); setProjName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let endpoint = ''; let payload: Record<string, unknown> = {};
    if (activeTab === 'departments') {
      endpoint = `${API_URL}/departments/`;
      payload  = { bldg_id: parseInt(bldgId), dept_name: deptName };
    } else if (activeTab === 'employees') {
      endpoint = `${API_URL}/employees/`;
      payload  = { dept_id: parseInt(empDeptId), emp_name: empName, emp_age: parseInt(empAge), emp_sex: empSex };
    } else {
      endpoint = `${API_URL}/projects/`;
      payload  = { emp_id: parseInt(projEmpId), dept_id: parseInt(projDeptId), proj_name: projName };
    }
    try {
      const res = editingId
        ? await fetch(`${endpoint}${editingId}/`, { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch(endpoint,                    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        await fetchResource(activeTab);
        closeModal();
        const n = activeTab === 'employees' ? 'Employee' : activeTab === 'projects' ? 'Project' : 'Department';
        showMsg(editingId ? `${n} updated.` : `${n} created.`, 'success');
      } else {
        showMsg('Save failed — check foreign key constraints.', 'error');
      }
    } catch { showMsg('Connection error.', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this record?')) return;
    const ep = activeTab === 'employees' ? `${API_URL}/employees/`
      : activeTab === 'projects'         ? `${API_URL}/projects/`
      :                                    `${API_URL}/departments/`;
    try {
      const r = await fetch(`${ep}${id}/`, { method: 'DELETE' });
      if (r.ok) { await fetchResource(activeTab); showMsg('Record deleted.', 'success'); }
    } catch { showMsg('Error deleting record.', 'error'); }
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const getTitle = () => activeTab === 'departments' ? 'Department' : activeTab === 'employees' ? 'Employee' : 'Project';
  const rowData  = activeTab === 'departments' ? departments : activeTab === 'employees' ? employees : projects;
  const { glyph } = TAB_CONFIG[activeTab];

  return (
    <>
      {/* ── HEADER ── */}
      <header className="site-header animate-slideDown">
        <div className="header-inner">

          {/* Logo */}
          <div className="logo">
            <span className="logo-king animate-iconFloat">♚</span>
            <div className="logo-text">
              <span className="logo-title">Grandmaster</span>
              <span className="logo-sub">Data Registry</span>
            </div>
          </div>

          {/* Right side: tabs + toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <nav className="nav-tabs">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((t) => (
                <NavLink
                  key={t}
                  to={`/${t}`}
                  className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
                >
                  {TAB_CONFIG[t].icon}
                  <span className="tab-label">{TAB_CONFIG[t].label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="main-container">

        {/* Toast */}
        {message && (
          <div key={message.text} className={`toast animate-toastIn ${message.type}`}>
            <span>{message.type === 'success' ? '♟' : '✕'}</span>
            {message.text}
          </div>
        )}

        {/* Panel header */}
        <div className="panel-header">
          <div className="panel-left">
            <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d={PIECE_PATH[activeTab]} />
              </svg>
            </span>
            <h2 className="panel-title">{TAB_CONFIG[activeTab].label}</h2>
            <span className="record-badge">{rowData.length} records</span>
          </div>
          <button className="btn-new" onClick={() => setIsModalOpen(true)}>
            <span style={{ fontSize: '1rem', lineHeight: 1, fontWeight: 400 }}>+</span>
            New {getTitle()}
          </button>
        </div>

        {/* Table */}
        <div className="table-wrap animate-riseIn">
          <table className="crud-table">
            <thead>
              <tr>
                {activeTab === 'departments' && ['#', 'Bldg ID', 'Department Name', 'Actions'].map(h => <th key={h}>{h}</th>)}
                {activeTab === 'employees'   && ['#', 'Dept', 'Name', 'Age', 'Sex', 'Actions'].map(h => <th key={h}>{h}</th>)}
                {activeTab === 'projects'    && ['#', 'Emp ID', 'Dept ID', 'Project Name', 'Actions'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="loading-cell">
                    <span className="animate-spin" style={{ display: 'inline-block', marginRight: '0.5rem' }}>♟</span>
                    Loading…
                  </td>
                </tr>
              ) : rowData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <span className="empty-glyph animate-iconFloat">♙</span>
                    No {activeTab} found.
                  </td>
                </tr>
              ) : activeTab === 'departments' ? (
                (departments as Department[]).map((d, i) => (
                  <tr key={d.dept_id} className={rowsIn ? 'animate-rowIn' : ''} style={{ animationDelay: `${i * 40}ms`, opacity: rowsIn ? undefined : 0 }}>
                    <td><span className="cell-id">{d.dept_id}</span></td>
                    <td>{d.bldg_id}</td>
                    <td><span className="cell-name">♜ {d.dept_name}</span></td>
                    <td><div className="cell-actions">
                      <button className="btn-edit"   onClick={() => handleEditClick(d)}>Edit</button>
                      <button className="btn-delete" onClick={() => d.dept_id && handleDelete(d.dept_id)}>Delete</button>
                    </div></td>
                  </tr>
                ))
              ) : activeTab === 'employees' ? (
                (employees as Employee[]).map((e, i) => (
                  <tr key={e.emp_id} className={rowsIn ? 'animate-rowIn' : ''} style={{ animationDelay: `${i * 40}ms`, opacity: rowsIn ? undefined : 0 }}>
                    <td><span className="cell-id">{e.emp_id}</span></td>
                    <td>{e.dept_id}</td>
                    <td><span className="cell-name">♞ {e.emp_name}</span></td>
                    <td>{e.emp_age}</td>
                    <td>{e.emp_sex}</td>
                    <td><div className="cell-actions">
                      <button className="btn-edit"   onClick={() => handleEditClick(e)}>Edit</button>
                      <button className="btn-delete" onClick={() => e.emp_id && handleDelete(e.emp_id)}>Delete</button>
                    </div></td>
                  </tr>
                ))
              ) : (
                (projects as Project[]).map((p, i) => (
                  <tr key={p.proj_id} className={rowsIn ? 'animate-rowIn' : ''} style={{ animationDelay: `${i * 40}ms`, opacity: rowsIn ? undefined : 0 }}>
                    <td><span className="cell-id">{p.proj_id}</span></td>
                    <td>{p.emp_id}</td>
                    <td>{p.dept_id}</td>
                    <td><span className="cell-name">♝ {p.proj_name}</span></td>
                    <td><div className="cell-actions">
                      <button className="btn-edit"   onClick={() => handleEditClick(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => p.proj_id && handleDelete(p.proj_id)}>Delete</button>
                    </div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-backdrop animate-fadeIn" onClick={closeModal} />
          <div className="modal-card animate-modalIn">
            <div className="chess-stripe" style={{ height: 3, borderRadius: '16px 16px 0 0' }} />
            <div className="modal-header">
              <div className="modal-title-row">
                <span className="modal-glyph">{glyph}</span>
                <span className="modal-title">{editingId ? `Edit ${getTitle()}` : `New ${getTitle()}`}</span>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="modal-form">

                {activeTab === 'departments' && (<>
                  <div className="form-field">
                    <label className="form-label">Building ID</label>
                    <input type="number" value={bldgId} onChange={e => setBldgId(e.target.value)} required placeholder="e.g. 101" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Department Name</label>
                    <input type="text" value={deptName} onChange={e => setDeptName(e.target.value)} required placeholder="e.g. IT Department" className="form-input" />
                  </div>
                </>)}

                {activeTab === 'employees' && (<>
                  <div className="form-field">
                    <label className="form-label">Department ID</label>
                    <input type="number" value={empDeptId} onChange={e => setEmpDeptId(e.target.value)} required placeholder="e.g. 1" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Employee Name</label>
                    <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} required placeholder="e.g. Jane Doe" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Age</label>
                    <input type="number" value={empAge} onChange={e => setEmpAge(e.target.value)} required placeholder="e.g. 30" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Sex</label>
                    <input type="text" value={empSex} onChange={e => setEmpSex(e.target.value)} required placeholder="e.g. Female" className="form-input" />
                  </div>
                </>)}

                {activeTab === 'projects' && (<>
                  <div className="form-field">
                    <label className="form-label">Employee ID</label>
                    <input type="number" value={projEmpId} onChange={e => setProjEmpId(e.target.value)} required placeholder="e.g. 1" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Department ID</label>
                    <input type="number" value={projDeptId} onChange={e => setProjDeptId(e.target.value)} required placeholder="e.g. 2" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Project Name</label>
                    <input type="text" value={projName} onChange={e => setProjName(e.target.value)} required placeholder="e.g. Website Redesign" className="form-input" />
                  </div>
                </>)}

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-submit">{editingId ? '♟ Update' : '♟ Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Root ── */
function App() {
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="app-root">
      <InteractiveBackground />
      <div className="app-layer">
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/departments" replace />} />
            <Route path="/:tab" element={<DashboardContent theme={theme} toggleTheme={toggleTheme} />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;