import React, { useState, useEffect } from 'react';
import './App.css';

interface Department {
  dept_id?: number;
  bldg_id: number;
  dept_name: string;
}

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Form State
  const [bldgId, setBldgId] = useState('');
  const [deptName, setDeptName] = useState('');
  
  // UI & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch from Django on load
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/departments/`);
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      showMessage("Failed to connect to Django API.", "error");
    }
  };

  // Open modal specifically for editing
  const handleEditClick = (dept: Department) => {
    setBldgId(dept.bldg_id.toString());
    setDeptName(dept.dept_name);
    setEditingId(dept.dept_id!); // Store the ID we are editing
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setBldgId('');
    setDeptName('');
  };

  // Handle both Create (POST) and Update (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const deptData = {
      bldg_id: parseInt(bldgId),
      dept_name: deptName
    };

    try {
      let response;

      if (editingId) {
        // UPDATE: Send a PUT request if we have an editingId
        response = await fetch(`${API_URL}/departments/${editingId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deptData),
        });
      } else {
        // CREATE: Send a POST request if we are making a new one
        response = await fetch(`${API_URL}/departments/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deptData),
        });
      }

      if (response.ok) {
        fetchDepartments();
        closeModal();
        showMessage(editingId ? "Department updated!" : "Department added!", "success");
      } else {
        showMessage("Failed to save department.", "error");
      }
    } catch (error) {
      showMessage("Error connecting to server.", "error");
    }
  };

  // Handle Delete (DELETE)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    try {
      const response = await fetch(`${API_URL}/departments/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDepartments();
        showMessage("Department deleted.", "success");
      }
    } catch (error) {
      showMessage("Error deleting department.", "error");
    }
  };

  // Helper to show temporary messages
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <>
      <header className="site-header">
        <h1>DRF Act 1 Django + React</h1>
        <div className="tabs">
          <button className="tab active">Departments</button>
        </div>
      </header>

      <main className="container">
        {message && (
          <div className={`msg ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            <h2>Department Records</h2>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              + Add Department
            </button>
          </div>

          <div className="table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Dept ID</th>
                  <th>Building ID</th>
                  <th>Department Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">No departments found in Django database.</td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.dept_id}>
                      <td>{dept.dept_id}</td>
                      <td>{dept.bldg_id}</td>
                      <td>{dept.dept_name}</td>
                      <td className="actions-cell">
                        
                        {/* UPDATE BUTTON WIRING IS HERE */}
                        <button 
                          className="btn btn-sm btn-edit"
                          onClick={() => handleEditClick(dept)}
                        >
                          Edit
                        </button>

                        <button 
                          className="btn btn-sm btn-delete" 
                          onClick={() => dept.dept_id && handleDelete(dept.dept_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal for Creating / Updating */}
      {!isModalOpen ? null : (
        <div className="modal">
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              {/* Dynamic Modal Title */}
              <h2>{editingId ? "Edit Department" : "Add New Department"}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Building ID</label>
                  <input
                    type="number"
                    value={bldgId}
                    onChange={(e) => setBldgId(e.target.value)}
                    required
                    placeholder="e.g. 101"
                  />
                </div>
                <div className="form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                    placeholder="e.g. IT Department"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {/* Dynamic Submit Button */}
                    {editingId ? "Update Department" : "Save to Database"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;