(function () {
  const API = '/api';
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

  function headers(extra = {}) {
    const h = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extra
    };
    if (csrfToken) h['X-CSRFToken'] = csrfToken;
    return h;
  }

  async function get(url) {
    const r = await fetch(url, { method: 'GET', headers: headers() });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async function post(url, data) {
    const r = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error(await r.text());
    return r.status === 204 ? null : r.json();
  }

  async function put(url, data) {
    const r = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error(await r.text());
    return r.status === 204 ? null : r.json();
  }

  async function del(url) {
    const r = await fetch(url, { method: 'DELETE', headers: headers() });
    if (!r.ok) throw new Error(await r.text());
  }

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  function showModal(title, bodyHtml) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
  }

  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  modal.querySelector('.modal-close').addEventListener('click', closeModal);

  function showMessage(el, msg, isError) {
    el.innerHTML = '<div class="msg ' + (isError ? 'error' : 'success') + '">' + escapeHtml(msg) + '</div>';
    el.scrollIntoView({ behavior: 'smooth' });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // Tabs
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => { p.classList.remove('active'); p.hidden = true; });
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + btn.dataset.tab);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
      if (btn.dataset.tab === 'departments') loadDepartments();
      if (btn.dataset.tab === 'employees') loadEmployees();
      if (btn.dataset.tab === 'projects') loadProjects();
    });
  });

  // Departments
  async function loadDepartments() {
    const tbody = document.getElementById('departments-tbody');
    try {
      const list = await get(API + '/departments/');
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">No departments yet. Click "Add Department".</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(d =>
        '<tr><td>' + d.dept_id + '</td><td>' + escapeHtml(String(d.bldg_id)) + '</td><td>' + escapeHtml(d.dept_name) +
        '</td><td class="actions-cell"><button type="button" class="btn btn-sm btn-edit" data-entity="department" data-action="edit" data-id="' + d.dept_id + '">Edit</button>' +
        '<button type="button" class="btn btn-sm btn-delete" data-entity="department" data-id="' + d.dept_id + '">Delete</button></td></tr>'
      ).join('');
      bindRowButtons();
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">Error: ' + escapeHtml(e.message) + '</td></tr>';
    }
  }

  function renderDepartmentForm(item) {
    const isEdit = !!item;
    return (
      '<div id="form-message"></div>' +
      '<form id="entity-form">' +
      '<div class="form-group"><label>Building ID</label><input type="number" name="bldg_id" value="' + (item ? item.bldg_id : '') + '" required></div>' +
      '<div class="form-group"><label>Department Name</label><input type="text" name="dept_name" maxlength="50" value="' + (item ? escapeHtml(item.dept_name) : '') + '" required></div>' +
      '<div class="form-actions">' +
      '<button type="button" class="btn" onclick="document.getElementById(\'modal\').hidden=true">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update' : 'Create') + '</button>' +
      '</div></form>'
    );
  }

  // Employees
  async function loadEmployees() {
    const tbody = document.getElementById('employees-tbody');
    try {
      const list = await get(API + '/employees/');
      const depts = await get(API + '/departments/');
      const deptMap = Object.fromEntries(depts.map(d => [d.dept_id, d.dept_name]));
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No employees yet. Click "Add Employee".</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(e =>
        '<tr><td>' + e.emp_id + '</td><td>' + escapeHtml(deptMap[e.dept_id] || e.dept_id) + '</td><td>' + escapeHtml(e.emp_name) +
        '</td><td>' + e.emp_age + '</td><td>' + escapeHtml(e.emp_sex) +
        '</td><td class="actions-cell"><button type="button" class="btn btn-sm btn-edit" data-entity="employee" data-action="edit" data-id="' + e.emp_id + '">Edit</button>' +
        '<button type="button" class="btn btn-sm btn-delete" data-entity="employee" data-id="' + e.emp_id + '">Delete</button></td></tr>'
      ).join('');
      bindRowButtons();
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">Error: ' + escapeHtml(e.message) + '</td></tr>';
    }
  }

  async function renderEmployeeForm(item) {
    const depts = await get(API + '/departments/');
    const isEdit = !!item;
    let opts = depts.map(d => '<option value="' + d.dept_id + '"' + (item && item.dept_id === d.dept_id ? ' selected' : '') + '>' + escapeHtml(d.dept_name) + '</option>').join('');
    return (
      '<div id="form-message"></div>' +
      '<form id="entity-form">' +
      '<div class="form-group"><label>Department</label><select name="dept_id" required>' + opts + '</select></div>' +
      '<div class="form-group"><label>Name</label><input type="text" name="emp_name" maxlength="50" value="' + (item ? escapeHtml(item.emp_name) : '') + '" required></div>' +
      '<div class="form-group"><label>Age</label><input type="number" name="emp_age" value="' + (item ? item.emp_age : '') + '" required></div>' +
      '<div class="form-group"><label>Sex</label><input type="text" name="emp_sex" maxlength="50" value="' + (item ? escapeHtml(item.emp_sex) : '') + '" required></div>' +
      '<div class="form-actions">' +
      '<button type="button" class="btn" onclick="document.getElementById(\'modal\').hidden=true">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update' : 'Create') + '</button>' +
      '</div></form>'
    );
  }

  // Projects
  async function loadProjects() {
    const tbody = document.getElementById('projects-tbody');
    try {
      const [list, depts, employees] = await Promise.all([
        get(API + '/projects/'),
        get(API + '/departments/'),
        get(API + '/employees/')
      ]);
      const deptMap = Object.fromEntries(depts.map(d => [d.dept_id, d.dept_name]));
      const empMap = Object.fromEntries(employees.map(e => [e.emp_id, e.emp_name]));
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No projects yet. Click "Add Project".</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(p =>
        '<tr><td>' + p.proj_id + '</td><td>' + escapeHtml(empMap[p.emp_id] || p.emp_id) + '</td><td>' + escapeHtml(deptMap[p.dept_id] || p.dept_id) +
        '</td><td>' + escapeHtml(p.proj_name) +
        '</td><td class="actions-cell"><button type="button" class="btn btn-sm btn-edit" data-entity="project" data-action="edit" data-id="' + p.proj_id + '">Edit</button>' +
        '<button type="button" class="btn btn-sm btn-delete" data-entity="project" data-id="' + p.proj_id + '">Delete</button></td></tr>'
      ).join('');
      bindRowButtons();
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">Error: ' + escapeHtml(e.message) + '</td></tr>';
    }
  }

  async function renderProjectForm(item) {
    const [depts, employees] = await Promise.all([get(API + '/departments/'), get(API + '/employees/')]);
    const isEdit = !!item;
    const deptOpts = depts.map(d => '<option value="' + d.dept_id + '"' + (item && item.dept_id === d.dept_id ? ' selected' : '') + '>' + escapeHtml(d.dept_name) + '</option>').join('');
    const empOpts = employees.map(e => '<option value="' + e.emp_id + '"' + (item && item.emp_id === e.emp_id ? ' selected' : '') + '>' + escapeHtml(e.emp_name) + '</option>').join('');
    return (
      '<div id="form-message"></div>' +
      '<form id="entity-form">' +
      '<div class="form-group"><label>Employee</label><select name="emp_id" required>' + empOpts + '</select></div>' +
      '<div class="form-group"><label>Department</label><select name="dept_id" required>' + deptOpts + '</select></div>' +
      '<div class="form-group"><label>Project Name</label><input type="text" name="proj_name" maxlength="50" value="' + (item ? escapeHtml(item.proj_name) : '') + '" required></div>' +
      '<div class="form-actions">' +
      '<button type="button" class="btn" onclick="document.getElementById(\'modal\').hidden=true">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Update' : 'Create') + '</button>' +
      '</div></form>'
    );
  }

  function bindRowButtons() {
    document.querySelectorAll('[data-entity][data-id]').forEach(btn => {
      if (btn.dataset.action === 'edit') {
        btn.addEventListener('click', () => openEditForm(btn.dataset.entity, btn.dataset.id));
      } else {
        btn.addEventListener('click', () => confirmDelete(btn.dataset.entity, btn.dataset.id));
      }
    });
  }

  document.querySelectorAll('[data-action="create"]').forEach(btn => {
    btn.addEventListener('click', () => openCreateForm(btn.dataset.entity));
  });

  async function openCreateForm(entity) {
    let title, body;
    if (entity === 'department') {
      title = 'Add Department';
      body = renderDepartmentForm(null);
    } else if (entity === 'employee') {
      title = 'Add Employee';
      body = await renderEmployeeForm(null);
    } else {
      title = 'Add Project';
      body = await renderProjectForm(null);
    }
    showModal(title, body);
    modalBody.querySelector('#entity-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submitCreateForm(entity, this);
    });
  }

  async function openEditForm(entity, id) {
    let title, body, item;
    if (entity === 'department') {
      item = await get(API + '/departments/' + id + '/');
      title = 'Edit Department';
      body = renderDepartmentForm(item);
    } else if (entity === 'employee') {
      item = await get(API + '/employees/' + id + '/');
      title = 'Edit Employee';
      body = await renderEmployeeForm(item);
    } else {
      item = await get(API + '/projects/' + id + '/');
      title = 'Edit Project';
      body = await renderProjectForm(item);
    }
    showModal(title, body);
    modalBody.querySelector('#entity-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submitEditForm(entity, id, this);
    });
  }

  function getFormData(form) {
    const fd = new FormData(form);
    const o = {};
    for (const [k, v] of fd) {
      if (k === 'emp_age' || k === 'emp_id' || k === 'dept_id' || k === 'bldg_id' || k === 'proj_id') o[k] = parseInt(v, 10);
      else o[k] = v;
    }
    return o;
  }

  async function submitCreateForm(entity, form) {
    const msgEl = modalBody.querySelector('#form-message');
    const data = getFormData(form);
    try {
      if (entity === 'department') await post(API + '/departments/', { bldg_id: data.bldg_id, dept_name: data.dept_name });
      else if (entity === 'employee') await post(API + '/employees/', { dept_id: data.dept_id, emp_name: data.emp_name, emp_age: data.emp_age, emp_sex: data.emp_sex });
      else await post(API + '/projects/', { emp_id: data.emp_id, dept_id: data.dept_id, proj_name: data.proj_name });
      closeModal();
      if (entity === 'department') loadDepartments();
      else if (entity === 'employee') loadEmployees();
      else loadProjects();
    } catch (e) {
      showMessage(msgEl, e.message || 'Request failed', true);
    }
  }

  async function submitEditForm(entity, id, form) {
    const msgEl = modalBody.querySelector('#form-message');
    const data = getFormData(form);
    try {
      if (entity === 'department') await put(API + '/departments/' + id + '/', { bldg_id: data.bldg_id, dept_name: data.dept_name });
      else if (entity === 'employee') await put(API + '/employees/' + id + '/', { dept_id: data.dept_id, emp_name: data.emp_name, emp_age: data.emp_age, emp_sex: data.emp_sex });
      else await put(API + '/projects/' + id + '/', { emp_id: data.emp_id, dept_id: data.dept_id, proj_name: data.proj_name });
      closeModal();
      if (entity === 'department') loadDepartments();
      else if (entity === 'employee') loadEmployees();
      else loadProjects();
    } catch (e) {
      showMessage(msgEl, e.message || 'Request failed', true);
    }
  }

  async function confirmDelete(entity, id) {
    const name = entity === 'department' ? 'Department' : entity === 'employee' ? 'Employee' : 'Project';
    if (!confirm('Delete this ' + name.toLowerCase() + '? This cannot be undone.')) return;
    try {
      if (entity === 'department') await del(API + '/departments/' + id + '/');
      else if (entity === 'employee') await del(API + '/employees/' + id + '/');
      else await del(API + '/projects/' + id + '/');
      if (entity === 'department') loadDepartments();
      else if (entity === 'employee') loadEmployees();
      else loadProjects();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  }

  // Initial load
  loadDepartments();
})();
