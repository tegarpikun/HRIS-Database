// ==================== HRIS COMPONENTS ====================
// Berisi semua CRUD operations dan render functions

// ==================== EMPLOYEE CRUD ====================
function openEmployeeModal(emp) {
  const modal = document.getElementById('emp-modal');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  const form = document.getElementById('emp-form');
  if (form) form.reset();
  
  const editId = document.getElementById('emp-edit-id');
  const modalTitle = document.getElementById('modal-title');
  const submitBtn = document.getElementById('emp-submit-btn');
  
  if (editId) editId.value = '';
  if (modalTitle) modalTitle.textContent = 'Tambah Karyawan Baru';
  if (submitBtn) submitBtn.textContent = 'Simpan Karyawan';

  if (emp) {
    if (modalTitle) modalTitle.textContent = 'Edit Karyawan';
    if (submitBtn) submitBtn.textContent = 'Update Karyawan';
    if (editId) editId.value = emp.__backendId;
    
    const fields = ['emp-name', 'emp-email', 'emp-phone', 'emp-dept', 'emp-position', 'emp-status', 'emp-join', 'emp-salary', 'emp-notes'];
    const values = [emp.name, emp.email, emp.phone, emp.department, emp.position, emp.status, emp.join_date, emp.salary, emp.notes];
    
    fields.forEach((field, index) => {
      const el = document.getElementById(field);
      if (el) el.value = values[index] || '';
    });
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeEmployeeModal() {
  const modal = document.getElementById('emp-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleEmployeeSubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('emp-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
  }

  const data = {
    type: 'employee',
    name: document.getElementById('emp-name')?.value || '',
    email: document.getElementById('emp-email')?.value || '',
    phone: document.getElementById('emp-phone')?.value || '',
    department: document.getElementById('emp-dept')?.value || '',
    position: document.getElementById('emp-position')?.value || '',
    status: document.getElementById('emp-status')?.value || 'Aktif',
    join_date: document.getElementById('emp-join')?.value || '',
    salary: parseFloat(document.getElementById('emp-salary')?.value) || 0,
    leave_balance: 12,
    notes: document.getElementById('emp-notes')?.value || '',
    created_at: new Date().toISOString()
  };

  const editId = document.getElementById('emp-edit-id')?.value;
  let result;

  if (editId) {
    const existing = allEmployees.find(e => e.__backendId === editId);
    if (existing) result = await window.dataSdk.update({ ...existing, ...data });
  } else {
    if (allEmployees.length >= 999) {
      showToast('Batas 999 data tercapai!', true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Simpan Karyawan';
      }
      return;
    }
    result = await window.dataSdk.create(data);
  }

  if (result && result.isOk) {
    showToast(editId ? 'Karyawan diperbarui' : 'Karyawan ditambahkan');
    closeEmployeeModal();
    await refreshAllData();
  } else {
    showToast('Gagal menyimpan data: ' + (result?.error || 'Unknown error'), true);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = editId ? 'Update Karyawan' : 'Simpan Karyawan';
  }
}

function renderEmployeeTable() {
  const searchInput = document.getElementById('emp-search');
  const deptFilter = document.getElementById('emp-dept-filter');
  
  const search = searchInput?.value?.toLowerCase() || '';
  const deptFilterValue = deptFilter?.value || '';
  
  let filtered = allEmployees.filter(e => {
    const matchSearch = !search || (e.name || '').toLowerCase().includes(search) || (e.position || '').toLowerCase().includes(search);
    const matchDept = !deptFilterValue || e.department === deptFilterValue;
    return matchSearch && matchDept;
  });

  const tbody = document.getElementById('emp-table-body');
  if (!tbody) return;
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada data karyawan</td></tr>';
    return;
  }

  const statusColors = {
    Aktif: 'bg-green-100 text-green-700',
    Kontrak: 'bg-amber-100 text-amber-700',
    Probation: 'bg-blue-100 text-blue-700',
    Resign: 'bg-red-100 text-red-700'
  };

  tbody.innerHTML = filtered.map(e => `
    <tr class="border-t border-slate-100 hover:bg-slate-50">
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">${(e.name || '?')[0]}</div>
          <div>
            <p class="font-medium text-slate-800">${e.name || '-'}</p>
            <p class="text-xs text-slate-500">${e.email || '-'}</p>
          </div>
        </div>
      </td>
      <td class="px-4 py-3 text-slate-600">${e.department || '-'}</td>
      <td class="px-4 py-3 text-slate-600">${e.position || '-'}</td>
      <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full ${statusColors[e.status] || 'bg-slate-100 text-slate-600'}">${e.status || '-'}</span></td>
      <td class="px-4 py-3 text-slate-600">${e.join_date || '-'}</td>
      <td class="px-4 py-3">
        <div class="flex gap-1">
          <button onclick='openEmployeeModal(${JSON.stringify(e).replace(/'/g, "&#39;")})' class="p-1.5 hover:bg-slate-100 rounded text-slate-500">
            <i data-lucide="edit" class="w-4 h-4"></i>
          </button>
          <button onclick='openDeleteConfirm(${JSON.stringify(e).replace(/'/g, "&#39;")}, "employee")' class="p-1.5 hover:bg-red-50 rounded text-red-500">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==================== TRAINING CRUD ====================
function openTrainingModal(training) {
  const modal = document.getElementById('training-modal');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  const form = document.getElementById('training-form');
  if (form) form.reset();
  
  const editId = document.getElementById('training-edit-id');
  const modalTitle = document.getElementById('training-modal-title');
  const submitBtn = document.getElementById('training-submit-btn');
  
  if (editId) editId.value = '';
  if (modalTitle) modalTitle.textContent = 'Tambah Pelatihan';
  if (submitBtn) submitBtn.textContent = 'Simpan Pelatihan';

  if (training) {
    if (modalTitle) modalTitle.textContent = 'Edit Pelatihan';
    if (submitBtn) submitBtn.textContent = 'Update Pelatihan';
    if (editId) editId.value = training.__backendId;
    
    const fields = ['training-name', 'training-category', 'training-modules', 'training-hours', 'training-description'];
    const values = [training.training_name, training.training_category, training.training_modules, training.training_hours, training.training_description];
    
    fields.forEach((field, index) => {
      const el = document.getElementById(field);
      if (el) el.value = values[index] || '';
    });
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeTrainingModal() {
  const modal = document.getElementById('training-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleTrainingSubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('training-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
  }

  const data = {
    type: 'training',
    training_name: document.getElementById('training-name')?.value || '',
    training_category: document.getElementById('training-category')?.value || '',
    training_modules: parseInt(document.getElementById('training-modules')?.value) || 0,
    training_hours: parseInt(document.getElementById('training-hours')?.value) || 0,
    training_description: document.getElementById('training-description')?.value || '',
    created_at: new Date().toISOString()
  };

  const editId = document.getElementById('training-edit-id')?.value;
  let result;

  if (editId) {
    const existing = allTrainings.find(t => t.__backendId === editId);
    if (existing) result = await window.dataSdk.update({ ...existing, ...data });
  } else {
    if (allTrainings.length >= 999) {
      showToast('Batas 999 data tercapai!', true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Simpan Pelatihan';
      }
      return;
    }
    result = await window.dataSdk.create(data);
  }

  if (result && result.isOk) {
    showToast(editId ? 'Pelatihan diperbarui' : 'Pelatihan ditambahkan');
    closeTrainingModal();
    await refreshAllData();
  } else {
    showToast('Gagal menyimpan pelatihan: ' + (result?.error || 'Unknown error'), true);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = editId ? 'Update Pelatihan' : 'Simpan Pelatihan';
  }
}

function renderTrainings() {
  const grid = document.getElementById('training-grid');
  if (!grid) return;
  
  if (allTrainings.length === 0) {
    grid.innerHTML = '<p class="text-sm text-slate-400 text-center py-8 col-span-full">Belum ada pelatihan. Tambahkan pelatihan baru untuk memulai.</p>';
    return;
  }

  const categoryColors = {
    'Technical': 'from-indigo-400 to-purple-500',
    'Soft Skills': 'from-cyan-400 to-blue-500',
    'Leadership': 'from-amber-400 to-orange-500',
    'Compliance': 'from-rose-400 to-pink-500',
    'Personal Development': 'from-emerald-400 to-teal-500'
  };

  const categoryIcons = {
    'Technical': 'code',
    'Soft Skills': 'users',
    'Leadership': 'briefcase',
    'Compliance': 'shield',
    'Personal Development': 'target'
  };

  grid.innerHTML = allTrainings.map(t => {
    const color = categoryColors[t.training_category] || 'from-slate-400 to-slate-500';
    const icon = categoryIcons[t.training_category] || 'book-open';
    return `
      <div class="bg-white rounded-xl border border-slate-200 p-5 card-hover fade-in">
        <div class="w-full h-28 bg-gradient-to-br ${color} rounded-lg mb-4 flex items-center justify-center">
          <i data-lucide="${icon}" class="w-10 h-10 text-white"></i>
        </div>
        <h4 class="font-semibold text-sm text-slate-800 line-clamp-2">${escapeHtml(t.training_name)}</h4>
        <p class="text-xs text-slate-500 mt-1"><span class="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">${t.training_category}</span></p>
        <p class="text-xs text-slate-500 mt-2">${t.training_modules} modul • ${t.training_hours} jam</p>
        <p class="text-xs text-slate-600 mt-2 line-clamp-2">${escapeHtml(t.training_description || 'Tidak ada deskripsi')}</p>
        <div class="flex gap-2 mt-4">
          <button onclick='openTrainingModal(${JSON.stringify(t).replace(/'/g, "&#39;")})' class="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
            <i data-lucide="edit" class="w-4 h-4"></i> Edit
          </button>
          <button onclick='openDeleteConfirm(${JSON.stringify(t).replace(/'/g, "&#39;")}, "training")' class="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
            <i data-lucide="trash-2" class="w-4 h-4"></i> Hapus
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==================== APPLICANT CRUD ====================
function openApplicantModal(applicant) {
  const modal = document.getElementById('applicant-modal');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  const form = document.getElementById('applicant-form');
  if (form) form.reset();
  
  const editId = document.getElementById('applicant-edit-id');
  const modalTitle = document.getElementById('applicant-modal-title');
  const submitBtn = document.getElementById('applicant-submit-btn');
  
  if (editId) editId.value = '';
  if (modalTitle) modalTitle.textContent = 'Tambah Lamaran';
  if (submitBtn) submitBtn.textContent = 'Simpan Lamaran';

  if (applicant) {
    if (modalTitle) modalTitle.textContent = 'Edit Lamaran';
    if (submitBtn) submitBtn.textContent = 'Update Lamaran';
    if (editId) editId.value = applicant.__backendId;
    
    const fields = ['applicant-name', 'applicant-email', 'applicant-phone', 'applicant-position', 'applicant-status', 'applicant-date', 'applicant-notes'];
    const values = [applicant.applicant_name, applicant.applicant_email, applicant.applicant_phone, applicant.applicant_position, applicant.applicant_status, applicant.applicant_date, applicant.applicant_notes];
    
    fields.forEach((field, index) => {
      const el = document.getElementById(field);
      if (el) el.value = values[index] || '';
    });
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeApplicantModal() {
  const modal = document.getElementById('applicant-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleApplicantSubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('applicant-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
  }

  const data = {
    type: 'applicant',
    applicant_name: document.getElementById('applicant-name')?.value || '',
    applicant_email: document.getElementById('applicant-email')?.value || '',
    applicant_phone: document.getElementById('applicant-phone')?.value || '',
    applicant_position: document.getElementById('applicant-position')?.value || '',
    applicant_status: document.getElementById('applicant-status')?.value || '',
    applicant_date: document.getElementById('applicant-date')?.value || '',
    applicant_notes: document.getElementById('applicant-notes')?.value || '',
    created_at: new Date().toISOString()
  };

  const editId = document.getElementById('applicant-edit-id')?.value;
  let result;

  if (editId) {
    const existing = allApplicants.find(a => a.__backendId === editId);
    if (existing) result = await window.dataSdk.update({ ...existing, ...data });
  } else {
    if (allApplicants.length >= 999) {
      showToast('Batas 999 data tercapai!', true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Simpan Lamaran';
      }
      return;
    }
    result = await window.dataSdk.create(data);
  }

  if (result && result.isOk) {
    showToast(editId ? 'Lamaran diperbarui' : 'Lamaran ditambahkan');
    closeApplicantModal();
    await refreshAllData();
  } else {
    showToast('Gagal menyimpan lamaran: ' + (result?.error || 'Unknown error'), true);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = editId ? 'Update Lamaran' : 'Simpan Lamaran';
  }
}

function renderApplicants() {
  const pipeline = document.getElementById('recruitment-pipeline');
  if (!pipeline) return;
  
  if (allApplicants.length === 0) {
    pipeline.innerHTML = '<p class="text-sm text-slate-400 text-center py-6">Belum ada lamaran masuk</p>';
    updateRecStats();
    return;
  }

  const incoming = allApplicants.filter(a => a.applicant_status === 'Incoming').length;
  const screening = allApplicants.filter(a => a.applicant_status === 'Screening').length;
  const interview = allApplicants.filter(a => a.applicant_status === 'Interview').length;
  const accepted = allApplicants.filter(a => a.applicant_status === 'Accepted').length;

  const recIncoming = document.getElementById('rec-incoming');
  const recScreening = document.getElementById('rec-screening');
  const recInterview = document.getElementById('rec-interview');
  const recAccepted = document.getElementById('rec-accepted');
  
  if (recIncoming) recIncoming.textContent = incoming;
  if (recScreening) recScreening.textContent = screening;
  if (recInterview) recInterview.textContent = interview;
  if (recAccepted) recAccepted.textContent = accepted;

  const statusColors = {
    'Incoming': 'bg-blue-100 text-blue-700',
    'Screening': 'bg-amber-100 text-amber-700',
    'Interview': 'bg-purple-100 text-purple-700',
    'Accepted': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700'
  };

  pipeline.innerHTML = allApplicants.map(a => `
    <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
      <div class="flex-1">
        <p class="font-medium text-slate-800">${escapeHtml(a.applicant_name)}</p>
        <p class="text-xs text-slate-500">${escapeHtml(a.applicant_position)} • ${escapeHtml(a.applicant_email)}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs px-2 py-1 rounded-full ${statusColors[a.applicant_status] || 'bg-slate-100 text-slate-600'}">${a.applicant_status}</span>
        <button onclick='openApplicantModal(${JSON.stringify(a).replace(/'/g, "&#39;")})' class="p-1.5 hover:bg-slate-100 rounded text-slate-500">
          <i data-lucide="edit" class="w-4 h-4"></i>
        </button>
        <button onclick='openDeleteConfirm(${JSON.stringify(a).replace(/'/g, "&#39;")}, "applicant")' class="p-1.5 hover:bg-red-50 rounded text-red-500">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateRecStats() {
  const incoming = allApplicants.filter(a => a.applicant_status === 'Incoming').length;
  const screening = allApplicants.filter(a => a.applicant_status === 'Screening').length;
  const interview = allApplicants.filter(a => a.applicant_status === 'Interview').length;
  const accepted = allApplicants.filter(a => a.applicant_status === 'Accepted').length;
  
  const recIncoming = document.getElementById('rec-incoming');
  const recScreening = document.getElementById('rec-screening');
  const recInterview = document.getElementById('rec-interview');
  const recAccepted = document.getElementById('rec-accepted');
  
  if (recIncoming) recIncoming.textContent = incoming;
  if (recScreening) recScreening.textContent = screening;
  if (recInterview) recInterview.textContent = interview;
  if (recAccepted) recAccepted.textContent = accepted;
}

// ==================== ASSET CRUD ====================
function openAssetModal(asset) {
  const modal = document.getElementById('asset-modal');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  const form = document.getElementById('asset-form');
  if (form) form.reset();
  
  const editId = document.getElementById('asset-edit-id');
  const modalTitle = document.getElementById('asset-modal-title');
  const submitBtn = document.getElementById('asset-submit-btn');
  
  if (editId) editId.value = '';
  if (modalTitle) modalTitle.textContent = 'Tambah Aset';
  if (submitBtn) submitBtn.textContent = 'Simpan Aset';

  if (asset) {
    if (modalTitle) modalTitle.textContent = 'Edit Aset';
    if (submitBtn) submitBtn.textContent = 'Update Aset';
    if (editId) editId.value = asset.__backendId;
    
    const fields = ['asset-name', 'asset-type', 'asset-serial', 'asset-status', 'asset-assigned', 'asset-notes'];
    const values = [asset.asset_name, asset.asset_type, asset.asset_serial, asset.asset_status, asset.asset_assigned_to, asset.asset_notes];
    
    fields.forEach((field, index) => {
      const el = document.getElementById(field);
      if (el) el.value = values[index] || '';
    });
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeAssetModal() {
  const modal = document.getElementById('asset-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleAssetSubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('asset-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
  }

  const data = {
    type: 'asset',
    asset_name: document.getElementById('asset-name')?.value || '',
    asset_type: document.getElementById('asset-type')?.value || '',
    asset_serial: document.getElementById('asset-serial')?.value || '',
    asset_status: document.getElementById('asset-status')?.value || '',
    asset_assigned_to: document.getElementById('asset-assigned')?.value || '',
    asset_notes: document.getElementById('asset-notes')?.value || '',
    created_at: new Date().toISOString()
  };

  const editId = document.getElementById('asset-edit-id')?.value;
  let result;

  if (editId) {
    const existing = allAssets.find(a => a.__backendId === editId);
    if (existing) result = await window.dataSdk.update({ ...existing, ...data });
  } else {
    if (allAssets.length >= 999) {
      showToast('Batas 999 data tercapai!', true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Simpan Aset';
      }
      return;
    }
    result = await window.dataSdk.create(data);
  }

  if (result && result.isOk) {
    showToast(editId ? 'Aset diperbarui' : 'Aset ditambahkan');
    closeAssetModal();
    await refreshAllData();
  } else {
    showToast('Gagal menyimpan aset: ' + (result?.error || 'Unknown error'), true);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = editId ? 'Update Aset' : 'Simpan Aset';
  }
}

function renderAssets() {
  const tbody = document.getElementById('asset-table-body');
  if (!tbody) return;
  
  const laptop = allAssets.filter(a => a.asset_type === 'Laptop').length;
  const phone = allAssets.filter(a => a.asset_type === 'Handphone').length;
  const vehicle = allAssets.filter(a => a.asset_type === 'Kendaraan').length;
  const other = allAssets.filter(a => a.asset_type === 'Perangkat Lain').length;

  const assetLaptop = document.getElementById('asset-laptop');
  const assetPhone = document.getElementById('asset-phone');
  const assetVehicle = document.getElementById('asset-vehicle');
  const assetOther = document.getElementById('asset-other');
  
  if (assetLaptop) assetLaptop.textContent = laptop;
  if (assetPhone) assetPhone.textContent = phone;
  if (assetVehicle) assetVehicle.textContent = vehicle;
  if (assetOther) assetOther.textContent = other;

  if (allAssets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada aset terdaftar</td></tr>';
    return;
  }

  const statusColors = {
    'Available': 'bg-green-100 text-green-700',
    'Assigned': 'bg-blue-100 text-blue-700',
    'Damaged': 'bg-red-100 text-red-700',
    'Maintenance': 'bg-amber-100 text-amber-700'
  };

  tbody.innerHTML = allAssets.map(a => `
    <tr class="border-t border-slate-100 hover:bg-slate-50">
      <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(a.asset_name)}</td>
      <td class="px-4 py-3 text-slate-600">${a.asset_type}</td>
      <td class="px-4 py-3 text-slate-600 font-mono text-sm">${a.asset_serial}</td>
      <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full ${statusColors[a.asset_status] || 'bg-slate-100 text-slate-600'}">${a.asset_status}</span></td>
      <td class="px-4 py-3 text-slate-600">${a.asset_assigned_to || '-'}</td>
      <td class="px-4 py-3">
        <div class="flex gap-1">
          <button onclick='openAssetModal(${JSON.stringify(a).replace(/'/g, "&#39;")})' class="p-1.5 hover:bg-slate-100 rounded text-slate-500">
            <i data-lucide="edit" class="w-4 h-4"></i>
          </button>
          <button onclick='openDeleteConfirm(${JSON.stringify(a).replace(/'/g, "&#39;")}, "asset")' class="p-1.5 hover:bg-red-50 rounded text-red-500">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==================== LEAVE CRUD ====================
function populateLeaveEmployeeDropdown() {
  const select = document.getElementById('leave-employee');
  if (!select) return;
  
  select.innerHTML = '<option value="">Pilih Karyawan</option>';
  allEmployees.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.__backendId;
    opt.textContent = e.name;
    opt.dataset.name = e.name;
    select.appendChild(opt);
  });
}

function openLeaveModal(leave) {
  const modal = document.getElementById('leave-modal');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  const form = document.getElementById('leave-form');
  if (form) form.reset();
  
  const editId = document.getElementById('leave-edit-id');
  const modalTitle = document.getElementById('leave-modal-title');
  const submitBtn = document.getElementById('leave-submit-btn');
  
  if (editId) editId.value = '';
  if (modalTitle) modalTitle.textContent = 'Tambah Pengajuan Cuti';
  if (submitBtn) submitBtn.textContent = 'Simpan Pengajuan';

  if (leave) {
    if (modalTitle) modalTitle.textContent = 'Edit Pengajuan Cuti';
    if (submitBtn) submitBtn.textContent = 'Update Pengajuan';
    if (editId) editId.value = leave.__backendId;
    
    const leaveEmployee = document.getElementById('leave-employee');
    if (leaveEmployee) leaveEmployee.value = leave.leave_employee_id || '';
    
    const fields = ['leave-type', 'leave-start', 'leave-end', 'leave-days', 'leave-reason', 'leave-status'];
    const values = [leave.leave_type, leave.leave_start_date, leave.leave_end_date, leave.leave_days, leave.leave_reason, leave.leave_approval_status];
    
    fields.forEach((field, index) => {
      const el = document.getElementById(field);
      if (el) el.value = values[index] || '';
    });
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeLeaveModal() {
  const modal = document.getElementById('leave-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleLeaveSubmit(e) {
  e.preventDefault();
  
  const btn = document.getElementById('leave-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
  }

  const empSelect = document.getElementById('leave-employee');
  const empId = empSelect?.value || '';
  const empName = empSelect?.options[empSelect.selectedIndex]?.dataset.name || '';

  const data = {
    type: 'leave',
    leave_employee_id: empId,
    leave_employee_name: empName,
    leave_type: document.getElementById('leave-type')?.value || '',
    leave_start_date: document.getElementById('leave-start')?.value || '',
    leave_end_date: document.getElementById('leave-end')?.value || '',
    leave_days: parseInt(document.getElementById('leave-days')?.value) || 0,
    leave_reason: document.getElementById('leave-reason')?.value || '',
    leave_approval_status: document.getElementById('leave-status')?.value || 'Pending',
    created_at: new Date().toISOString()
  };

  const editId = document.getElementById('leave-edit-id')?.value;
  let result;

  if (editId) {
    const existing = allLeaves.find(l => l.__backendId === editId);
    if (existing) result = await window.dataSdk.update({ ...existing, ...data });
  } else {
    if (allLeaves.length >= 999) {
      showToast('Batas 999 data tercapai!', true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Simpan Pengajuan';
      }
      return;
    }
    result = await window.dataSdk.create(data);
  }

  if (result && result.isOk) {
    showToast(editId ? 'Pengajuan diperbarui' : 'Pengajuan ditambahkan');
    closeLeaveModal();
    await refreshAllData();
  } else {
    showToast('Gagal menyimpan pengajuan: ' + (result?.error || 'Unknown error'), true);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = editId ? 'Update Pengajuan' : 'Simpan Pengajuan';
  }
}

function renderLeaves() {
  const tbody = document.getElementById('leave-table-body');
  if (!tbody) return;
  
  const pending = allLeaves.filter(l => l.leave_approval_status === 'Pending').length;
  const approved = allLeaves.filter(l => l.leave_approval_status === 'Approved').length;
  const rejected = allLeaves.filter(l => l.leave_approval_status === 'Rejected').length;
  
  const leavePending = document.getElementById('leave-pending');
  const leaveApproved = document.getElementById('leave-approved');
  const leaveRejected = document.getElementById('leave-rejected');
  const leaveTotal = document.getElementById('leave-total');
  
  if (leavePending) leavePending.textContent = pending;
  if (leaveApproved) leaveApproved.textContent = approved;
  if (leaveRejected) leaveRejected.textContent = rejected;
  if (leaveTotal) leaveTotal.textContent = allLeaves.length;

  if (allLeaves.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400">Belum ada pengajuan cuti atau lembur</td></tr>';
    return;
  }

  const statusColors = {
    'Pending': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700'
  };

  tbody.innerHTML = allLeaves.map(l => `
    <tr class="border-t border-slate-100 hover:bg-slate-50">
      <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(l.leave_employee_name || 'N/A')}</td>
      <td class="px-4 py-3 text-slate-600">${l.leave_type}</td>
      <td class="px-4 py-3 text-slate-600">${l.leave_start_date || '-'}</td>
      <td class="px-4 py-3 text-slate-600">${l.leave_end_date || '-'}</td>
      <td class="px-4 py-3 text-slate-600">${l.leave_days || 0}</td>
      <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full ${statusColors[l.leave_approval_status] || 'bg-slate-100 text-slate-600'}">${l.leave_approval_status}</span></td>
      <td class="px-4 py-3">
        <div class="flex gap-1">
          <button onclick='openLeaveModal(${JSON.stringify(l).replace(/'/g, "&#39;")})' class="p-1.5 hover:bg-slate-100 rounded text-slate-500">
            <i data-lucide="edit" class="w-4 h-4"></i>
          </button>
          <button onclick='openDeleteConfirm(${JSON.stringify(l).replace(/'/g, "&#39;")}, "leave")' class="p-1.5 hover:bg-red-50 rounded text-red-500">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==================== DASHBOARD RENDER FUNCTIONS ====================
function renderDashboard() {
  const active = allEmployees.filter(e => e.status !== 'Resign');
  const statTotal = document.getElementById('stat-total');
  const statPresent = document.getElementById('stat-present');
  const statLeave = document.getElementById('stat-leave');
  const statJobs = document.getElementById('stat-jobs');
  
  if (statTotal) statTotal.textContent = active.length;
  if (statPresent) statPresent.textContent = Math.floor(active.length * 0.85);
  if (statLeave) statLeave.textContent = allLeaves.filter(l => l.leave_approval_status === 'Pending').length;
  if (statJobs) statJobs.textContent = allApplicants.filter(a => a.applicant_status === 'Incoming').length;

  // Department chart
  const deptChart = document.getElementById('dept-chart');
  const deptEmpty = document.getElementById('dept-empty');
  
  if (deptChart && deptEmpty) {
    const depts = {};
    active.forEach(e => { depts[e.department] = (depts[e.department] || 0) + 1; });
    const colors = { Engineering: 'bg-indigo-500', HR: 'bg-cyan-500', Finance: 'bg-amber-500', Marketing: 'bg-emerald-500', Operations: 'bg-rose-500', Sales: 'bg-violet-500' };

    if (Object.keys(depts).length === 0) {
      deptChart.innerHTML = '';
      deptEmpty.classList.remove('hidden');
    } else {
      deptEmpty.classList.add('hidden');
      const max = Math.max(...Object.values(depts));
      deptChart.innerHTML = Object.entries(depts).map(([d, c]) => `
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-600 w-24 text-right">${d}</span>
          <div class="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div class="${colors[d] || 'bg-indigo-500'} h-full rounded-full progress-bar flex items-center justify-end pr-2" style="width:${(c / max) * 100}%">
              <span class="text-xs text-white font-medium">${c}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Recent activity
  const recent = document.getElementById('recent-activity');
  if (recent) {
    const sorted = [...allEmployees].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    if (sorted.length === 0) {
      recent.innerHTML = '<p class="text-sm text-slate-400 text-center py-8">Belum ada aktivitas</p>';
    } else {
      recent.innerHTML = sorted.map(e => `
        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">${(e.name || '?')[0]}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-800 truncate">${escapeHtml(e.name)}</p>
            <p class="text-xs text-slate-500">${e.department || '-'} • ${e.position || '-'}</p>
          </div>
        </div>
      `).join('');
    }
  }
}

function renderOrganization() {
  const deptMap = {};
  allEmployees.filter(e => e.status !== 'Resign').forEach(e => { deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
  
  const ids = { Engineering: 'org-engineering', HR: 'org-hr', Finance: 'org-finance', Marketing: 'org-marketing', Operations: 'org-operations', Sales: 'org-sales' };
  Object.entries(ids).forEach(([dept, id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `${deptMap[dept] || 0} karyawan`;
  });
}

function renderPayroll() {
  const active = allEmployees.filter(e => e.status !== 'Resign' && e.salary > 0);
  const total = active.reduce((s, e) => s + (e.salary || 0), 0);
  
  const payrollTotal = document.getElementById('payroll-total');
  if (payrollTotal) payrollTotal.textContent = 'Rp ' + total.toLocaleString('id-ID');
  
  const payrollList = document.getElementById('payroll-list');
  const payrollEmpty = document.getElementById('payroll-empty');
  
  if (payrollList && payrollEmpty) {
    if (active.length === 0) {
      payrollList.innerHTML = '';
      payrollEmpty.classList.remove('hidden');
    } else {
      payrollEmpty.classList.add('hidden');
      payrollList.innerHTML = active.slice(0, 10).map(e => {
        const pph = Math.round(e.salary * 0.05);
        const bpjs = Math.round(e.salary * 0.04);
        const net = e.salary - pph - bpjs;
        return `
          <div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">${(e.name || '?')[0]}</div>
              <div>
                <p class="text-sm font-medium text-slate-800">${escapeHtml(e.name)}</p>
                <p class="text-xs text-slate-500">${e.position || '-'}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-800">Rp ${net.toLocaleString('id-ID')}</p>
              <p class="text-xs text-slate-500">PPh: ${pph.toLocaleString('id-ID')} | BPJS: ${bpjs.toLocaleString('id-ID')}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function renderAnalytics() {
  const active = allEmployees.filter(e => e.status !== 'Resign');
  const half = Math.ceil(active.length / 2);
  
  const demoMale = document.getElementById('demo-male');
  const demoFemale = document.getElementById('demo-female');
  const demoPermanent = document.getElementById('demo-permanent');
  const demoContract = document.getElementById('demo-contract');
  
  if (demoMale) demoMale.textContent = half;
  if (demoFemale) demoFemale.textContent = active.length - half;
  if (demoPermanent) demoPermanent.textContent = active.filter(e => e.status === 'Aktif').length;
  if (demoContract) demoContract.textContent = active.filter(e => e.status === 'Kontrak').length;
}

function renderAttendance() {
  const today = new Date().toISOString().split('T')[0];
  const todayCheckins = allCheckins.filter(c => c.checkin_date === today);
  
  const attendanceTodayCount = document.getElementById('attendance-today-count');
  if (attendanceTodayCount) attendanceTodayCount.textContent = todayCheckins.length;

  const log = document.getElementById('attendance-log');
  if (log) {
    if (todayCheckins.length === 0) {
      log.innerHTML = '<p class="text-sm text-slate-400 text-center py-6">Belum ada check-in hari ini</p>';
    } else {
      log.innerHTML = todayCheckins.map(c => {
        const emp = allEmployees.find(e => e.__backendId === c.checkin_employee_id);
        const isLate = c.checkin_time > '08:15';
        return `
          <div class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full ${isLate ? 'bg-amber-100' : 'bg-green-100'} flex items-center justify-center">
                <i data-lucide="${isLate ? 'alert-circle' : 'check-circle'}" class="w-4 h-4 ${isLate ? 'text-amber-600' : 'text-green-600'}"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">${escapeHtml(c.checkin_employee_name)}</p>
                <p class="text-xs text-slate-500">${emp ? emp.department : 'N/A'}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-slate-800">${c.checkin_time}</p>
              <p class="text-xs ${isLate ? 'text-amber-600' : 'text-green-600'}">${isLate ? 'Terlambat' : 'Tepat Waktu'}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Attendance history
  const historyBody = document.getElementById('attendance-history-body');
  if (historyBody) {
    if (todayCheckins.length === 0) {
      historyBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada data absensi</td></tr>';
    } else {
      historyBody.innerHTML = todayCheckins.map(c => {
        const checkInTime = new Date(`${c.checkin_date}T${c.checkin_time}`);
        const checkOutTime = new Date(checkInTime.getTime() + 9 * 60 * 60 * 1000);
        const duration = '09:00';
        const isLate = c.checkin_time > '08:15';
        const statusColors = { 'Present': 'bg-green-100 text-green-700', 'Late': 'bg-amber-100 text-amber-700', 'Absent': 'bg-red-100 text-red-700' };
        const status = isLate ? 'Late' : 'Present';
        
        return `
          <tr class="border-t border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(c.checkin_employee_name)}</td>
            <td class="px-4 py-3 text-slate-600">${c.checkin_date}</td>
            <td class="px-4 py-3 text-slate-600 font-mono">${c.checkin_time}</td>
            <td class="px-4 py-3 text-slate-600 font-mono">${checkOutTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
            <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full ${statusColors[status]}">${status}</span></td>
            <td class="px-4 py-3 text-slate-600">${duration}</td>
          </tr>
        `;
      }).join('');
    }
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==================== UTILITY FUNCTIONS ====================
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==================== REFRESH FUNCTION ====================
async function refreshAllData() {
  try {
    const data = await window.dataSdk.getAllData();
    
    allEmployees = data.filter(d => d.type === 'employee');
    allUsers = data.filter(d => d.type === 'admin');
    allTrainings = data.filter(d => d.type === 'training');
    allApplicants = data.filter(d => d.type === 'applicant');
    allAssets = data.filter(d => d.type === 'asset');
    allCheckins = data.filter(d => d.type === 'checkin');
    allLeaves = data.filter(d => d.type === 'leave');
    
    renderDashboard();
    renderEmployeeTable();
    renderOrganization();
    renderPayroll();
    renderAnalytics();
    renderAttendance();
    renderTrainings();
    renderApplicants();
    renderAssets();
    renderLeaves();
    populateLeaveEmployeeDropdown();
    
    console.log(`Data refreshed: ${allEmployees.length} employees, ${allUsers.length} users`);
  } catch (error) {
    console.error('Refresh data error:', error);
    showToast('Gagal memuat data', true);
  }
}

// ==================== EXPOSE FUNCTIONS ====================
window.openEmployeeModal = openEmployeeModal;
window.closeEmployeeModal = closeEmployeeModal;
window.handleEmployeeSubmit = handleEmployeeSubmit;

window.openTrainingModal = openTrainingModal;
window.closeTrainingModal = closeTrainingModal;
window.handleTrainingSubmit = handleTrainingSubmit;

window.openApplicantModal = openApplicantModal;
window.closeApplicantModal = closeApplicantModal;
window.handleApplicantSubmit = handleApplicantSubmit;

window.openAssetModal = openAssetModal;
window.closeAssetModal = closeAssetModal;
window.handleAssetSubmit = handleAssetSubmit;

window.openLeaveModal = openLeaveModal;
window.closeLeaveModal = closeLeaveModal;
window.handleLeaveSubmit = handleLeaveSubmit;
window.populateLeaveEmployeeDropdown = populateLeaveEmployeeDropdown;

window.renderDashboard = renderDashboard;
window.renderEmployeeTable = renderEmployeeTable;
window.renderOrganization = renderOrganization;
window.renderPayroll = renderPayroll;
window.renderAnalytics = renderAnalytics;
window.renderAttendance = renderAttendance;
window.renderTrainings = renderTrainings;
window.renderApplicants = renderApplicants;
window.renderAssets = renderAssets;
window.renderLeaves = renderLeaves;
window.refreshAllData = refreshAllData;