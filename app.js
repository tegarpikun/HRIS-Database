// ==================== HRIS MAIN APPLICATION ====================
// Version: 2.0 - Google Sheets Backend

// ==================== GLOBAL STATE ====================
let allEmployees = [];
let allUsers = [];
let allTrainings = [];
let allApplicants = [];
let allAssets = [];
let allCheckins = [];
let allLeaves = [];
let currentPage = 'dashboard';
let deleteTarget = null;
let deleteType = null;
let currentUser = null;

// ==================== DEFAULT CONFIGURATION ====================
const defaultConfig = {
  app_title: 'HRIS Pro',
  company_name: 'PT Perusahaan Anda',
  bg_color: '#f8fafc',
  sidebar_color: '#0f172a',
  text_color: '#1e293b',
  accent_color: '#6366f1',
  surface_color: '#ffffff'
};

// ==================== AUTHENTICATION FUNCTIONS ====================
function switchToRegister() {
  document.getElementById('login-panel').classList.add('hidden');
  document.getElementById('register-panel').classList.remove('hidden');
  const errorDiv = document.getElementById('register-error');
  if (errorDiv) errorDiv.classList.add('hidden');
  clearRegisterForm();
}

function switchToLogin() {
  document.getElementById('register-panel').classList.add('hidden');
  document.getElementById('login-panel').classList.remove('hidden');
  const errorDiv = document.getElementById('login-error');
  if (errorDiv) errorDiv.classList.add('hidden');
}

function clearRegisterForm() {
  const fields = ['reg-name', 'reg-email', 'reg-username', 'reg-password', 'reg-confirm'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');

  // Cari user di database
  const user = allUsers.find(u => 
    (u.username === username || u.user_email === username) && 
    u.password === password
  );

  if (user) {
    currentUser = user;
    localStorage.setItem('hris_user', JSON.stringify(user));
    const btn = document.getElementById('login-btn');
    if (btn) {
      btn.textContent = 'Masuk...';
      btn.disabled = true;
    }
    setTimeout(() => {
      if (btn) {
        btn.textContent = 'Masuk';
        btn.disabled = false;
      }
      showDashboard();
    }, 500);
  } else {
    if (errorDiv) {
      errorDiv.textContent = 'Username/Email atau password salah!';
      errorDiv.classList.remove('hidden');
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const username = document.getElementById('reg-username').value;
  const pwd = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errorDiv = document.getElementById('register-error');

  if (pwd.length < 6) {
    if (errorDiv) {
      errorDiv.textContent = 'Password minimal 6 karakter!';
      errorDiv.classList.remove('hidden');
    }
    return;
  }

  if (pwd !== confirm) {
    if (errorDiv) {
      errorDiv.textContent = 'Password tidak cocok!';
      errorDiv.classList.remove('hidden');
    }
    return;
  }

  if (allUsers.some(u => u.username === username)) {
    if (errorDiv) {
      errorDiv.textContent = 'Username sudah terdaftar!';
      errorDiv.classList.remove('hidden');
    }
    return;
  }

  const newUser = {
    type: 'admin',
    name: name,
    user_email: email,
    username: username,
    password: pwd,
    role: 'Admin',
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  };

  const result = await window.dataSdk.create(newUser);
  if (result.isOk) {
    showToast('Akun berhasil dibuat! Silakan masuk');
    clearRegisterForm();
    switchToLogin();
    // Refresh user list
    await refreshAllData();
  } else {
    if (errorDiv) {
      errorDiv.textContent = 'Gagal membuat akun. Coba lagi!';
      errorDiv.classList.remove('hidden');
    }
  }
}

function handleLogout() {
  localStorage.removeItem('hris_user');
  currentUser = null;
  closeProfileModal();
  showLogin();
  showToast('Berhasil logout');
}

function showLogin() {
  const loginScreen = document.getElementById('login-screen');
  const app = document.getElementById('app');
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (app) app.classList.add('hidden');
}

function showDashboard() {
  const loginScreen = document.getElementById('login-screen');
  const app = document.getElementById('app');
  if (loginScreen) loginScreen.classList.add('hidden');
  if (app) app.classList.remove('hidden');
  updateProfileDisplay();
  navigate('dashboard');
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// ==================== NAVIGATION ====================
function navigate(page) {
  currentPage = page;
  
  // Sembunyikan semua halaman
  document.querySelectorAll('.page').forEach(p => {
    p.classList.add('hidden');
  });
  
  // Tampilkan halaman yang dipilih
  const selectedPage = document.getElementById('page-' + page);
  if (selectedPage) {
    selectedPage.classList.remove('hidden');
    selectedPage.classList.add('fade-in');
  }

  // Update active state di sidebar
  document.querySelectorAll('[data-nav]').forEach(btn => {
    if (btn.dataset.nav === page) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update judul halaman
  const titles = { 
    dashboard: 'Dashboard', 
    employees: 'Database Karyawan', 
    organization: 'Struktur Organisasi', 
    attendance: 'Kehadiran', 
    leave: 'Cuti & Lembur', 
    payroll: 'Penggajian & Pajak', 
    recruitment: 'Rekrutmen', 
    performance: 'Kinerja', 
    learning: 'Pelatihan', 
    analytics: 'HR Analytics', 
    assets: 'Manajemen Aset' 
  };
  
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = titles[page] || 'Dashboard';
  }
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// ==================== UTILITY FUNCTIONS ====================
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = toast?.querySelector('i');
  
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    if (toastIcon) {
      if (isError) {
        toastIcon.setAttribute('data-lucide', 'alert-circle');
        toastIcon.classList.add('text-red-400');
        toastIcon.classList.remove('text-green-400');
      } else {
        toastIcon.setAttribute('data-lucide', 'check-circle');
        toastIcon.classList.add('text-green-400');
        toastIcon.classList.remove('text-red-400');
      }
    }
    toast.classList.remove('hidden');
    toast.classList.add('toast-show');
    
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('toast-show');
    }, 3000);
  }
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function openDeleteConfirm(item, type) {
  deleteTarget = item;
  deleteType = type;
  const messages = {
    'employee': 'Data karyawan akan dihapus permanen dan tidak dapat dikembalikan.',
    'training': 'Data pelatihan akan dihapus permanen dan tidak dapat dikembalikan.',
    'asset': 'Data aset akan dihapus permanen dan tidak dapat dikembalikan.',
    'applicant': 'Data lamaran akan dihapus permanen dan tidak dapat dikembalikan.',
    'leave': 'Data pengajuan cuti akan dihapus permanen dan tidak dapat dikembalikan.'
  };
  
  const deleteMsg = document.getElementById('delete-msg');
  if (deleteMsg) {
    deleteMsg.textContent = messages[type] || 'Data akan dihapus permanen.';
  }
  
  const deleteModal = document.getElementById('delete-confirm');
  if (deleteModal) {
    deleteModal.classList.remove('hidden');
  }
}

function closeDeleteConfirm() {
  const deleteModal = document.getElementById('delete-confirm');
  if (deleteModal) {
    deleteModal.classList.add('hidden');
  }
  deleteTarget = null;
  deleteType = null;
}

async function confirmDelete() {
  if (!deleteTarget || !deleteType) return;
  
  const btn = document.getElementById('delete-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Menghapus...';
  }
  
  const result = await window.dataSdk.delete(deleteTarget);
  
  if (result.isOk) {
    showToast(`${getTypeName(deleteType)} berhasil dihapus`);
    await refreshAllData();
  } else {
    showToast(`Gagal menghapus ${getTypeName(deleteType)}: ${result.error}`, true);
  }
  
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Hapus';
  }
  closeDeleteConfirm();
}

function getTypeName(type) {
  const names = {
    employee: 'Karyawan',
    training: 'Pelatihan',
    asset: 'Aset',
    applicant: 'Lamaran',
    leave: 'Pengajuan'
  };
  return names[type] || 'Data';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ==================== PROFILE MODALS ====================
function openProfileModal() {
  if (!currentUser) return;
  
  const avatar = document.getElementById('profile-avatar');
  const name = document.getElementById('profile-name');
  const email = document.getElementById('profile-email');
  const username = document.getElementById('profile-username');
  const lastLogin = document.getElementById('profile-lastlogin');
  
  if (avatar) avatar.textContent = (currentUser.name || 'A')[0].toUpperCase();
  if (name) name.textContent = currentUser.name || 'Admin';
  if (email) email.textContent = currentUser.user_email || '-';
  if (username) username.textContent = currentUser.username || '-';
  
  const lastLoginDate = currentUser.last_login ? 
    new Date(currentUser.last_login).toLocaleString('id-ID') : 
    'Baru pertama kali';
  if (lastLogin) lastLogin.textContent = lastLoginDate;
  
  const profileModal = document.getElementById('profile-modal');
  if (profileModal) {
    profileModal.classList.remove('hidden');
  }
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function closeProfileModal() {
  const profileModal = document.getElementById('profile-modal');
  if (profileModal) {
    profileModal.classList.add('hidden');
  }
}

function changePassword() {
  const passwordError = document.getElementById('password-error');
  if (passwordError) passwordError.classList.add('hidden');
  
  const oldPassword = document.getElementById('old-password');
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');
  
  if (oldPassword) oldPassword.value = '';
  if (newPassword) newPassword.value = '';
  if (confirmPassword) confirmPassword.value = '';
  
  const passwordModal = document.getElementById('password-modal');
  if (passwordModal) {
    passwordModal.classList.remove('hidden');
  }
}

function closePasswordModal() {
  const passwordModal = document.getElementById('password-modal');
  if (passwordModal) {
    passwordModal.classList.add('hidden');
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  
  const oldPwd = document.getElementById('old-password').value;
  const newPwd = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;
  const errorDiv = document.getElementById('password-error');

  if (oldPwd !== currentUser.password) {
    if (errorDiv) {
      errorDiv.textContent = 'Password lama tidak sesuai!';
      errorDiv.classList.remove('hidden');
    }
    return;
  }

  if (newPwd.length < 6) {
    if (errorDiv) {
      errorDiv.textContent = 'Password baru minimal 6 karakter!';
      errorDiv.classList.remove('hidden');
    }
    return;
  }

  if (newPwd !== confirm) {
    if (errorDiv) {
      errorDiv.textContent = 'Password baru tidak cocok!';
      errorDiv.classList.remove('hidden');
    }
    return;
  }

  const updated = { ...currentUser, password: newPwd };
  const result = await window.dataSdk.update(updated);

  if (result.isOk) {
    currentUser.password = newPwd;
    localStorage.setItem('hris_user', JSON.stringify(currentUser));
    showToast('Password berhasil diubah');
    closePasswordModal();
  } else {
    if (errorDiv) {
      errorDiv.textContent = 'Gagal mengubah password!';
      errorDiv.classList.remove('hidden');
    }
  }
}

function updateProfileDisplay() {
  if (currentUser) {
    const sidebarTitle = document.getElementById('sidebar-title');
    if (sidebarTitle) {
      sidebarTitle.textContent = currentUser.name || 'Admin';
    }
  }
}

// ==================== ATTENDANCE GPS ====================
function openCheckinModal() {
  const checkinModal = document.getElementById('checkin-modal');
  if (checkinModal) {
    checkinModal.classList.remove('hidden');
  }
  getLocationAndCheckIn();
}

function closeCheckinModal() {
  const checkinModal = document.getElementById('checkin-modal');
  if (checkinModal) {
    checkinModal.classList.add('hidden');
  }
}

function getLocationAndCheckIn() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      
      const currentLocation = document.getElementById('current-location');
      if (currentLocation) {
        currentLocation.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
      
      const officeLat = -6.2088;
      const officeLon = 106.8456;
      const dist = calculateDistance(lat, lon, officeLat, officeLon);
      const inRange = dist <= 0.1;
      
      const officeDistance = document.getElementById('office-distance');
      if (officeDistance) {
        officeDistance.textContent = `${dist.toFixed(3)} km ${inRange ? '✓ Dalam Area' : '✗ Diluar Area'}`;
      }
      
      const checkinBtn = document.getElementById('checkin-btn');
      if (checkinBtn) {
        checkinBtn.disabled = !inRange;
      }
    }, error => {
      console.error('Geolocation error:', error);
      const currentLocation = document.getElementById('current-location');
      if (currentLocation) {
        currentLocation.textContent = 'Gagal mengambil lokasi';
      }
    });
  } else {
    const currentLocation = document.getElementById('current-location');
    if (currentLocation) {
      currentLocation.textContent = 'GPS tidak didukung browser ini';
    }
  }
}

async function performCheckin() {
  if (!currentUser) return;
  
  const btn = document.getElementById('checkin-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Checking in...';
  }

  const emp = allEmployees.find(e => e.name === currentUser.name);
  if (!emp) {
    showToast('Data karyawan tidak ditemukan', true);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Confirm Check-In';
    }
    return;
  }

  const locText = document.getElementById('current-location')?.textContent.split(',') || ['0', '0'];
  const data = {
    type: 'checkin',
    checkin_employee_id: emp.__backendId,
    checkin_employee_name: emp.name,
    checkin_time: new Date().toLocaleTimeString('id-ID'),
    checkin_latitude: parseFloat(locText[0]) || 0,
    checkin_longitude: parseFloat(locText[1]) || 0,
    checkin_date: new Date().toISOString().split('T')[0],
    checkin_status: 'Present',
    created_at: new Date().toISOString()
  };

  const result = await window.dataSdk.create(data);
  if (result.isOk) {
    showToast('Check-in berhasil!');
    closeCheckinModal();
    await refreshAllData();
  } else {
    showToast('Gagal check-in: ' + result.error, true);
  }
  
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Confirm Check-In';
  }
}

// ==================== DATA REFRESH ====================
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
    
    // Render semua halaman
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderEmployeeTable === 'function') renderEmployeeTable();
    if (typeof renderOrganization === 'function') renderOrganization();
    if (typeof renderPayroll === 'function') renderPayroll();
    if (typeof renderAnalytics === 'function') renderAnalytics();
    if (typeof renderAttendance === 'function') renderAttendance();
    if (typeof renderTrainings === 'function') renderTrainings();
    if (typeof renderApplicants === 'function') renderApplicants();
    if (typeof renderAssets === 'function') renderAssets();
    if (typeof renderLeaves === 'function') renderLeaves();
    if (typeof populateLeaveEmployeeDropdown === 'function') populateLeaveEmployeeDropdown();
    
    console.log(`Data refreshed: ${allEmployees.length} employees, ${allUsers.length} users`);
  } catch (error) {
    console.error('Refresh data error:', error);
    showToast('Gagal memuat data', true);
  }
}

// ==================== FILTER FUNCTIONS ====================
function filterEmployees() {
  if (typeof renderEmployeeTable === 'function') {
    renderEmployeeTable();
  }
}

// ==================== SDK INITIALIZATION ====================
function applyConfig(config) {
  const c = { ...defaultConfig, ...config };
  
  const sidebarTitle = document.getElementById('sidebar-title');
  const sidebarCompany = document.getElementById('sidebar-company');
  const app = document.getElementById('app');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarTitle) sidebarTitle.textContent = c.app_title;
  if (sidebarCompany) sidebarCompany.textContent = c.company_name;
  if (app) app.style.backgroundColor = c.bg_color;
  if (sidebar) sidebar.style.backgroundColor = c.sidebar_color;
}

const dataHandler = {
  onDataChanged(data) {
    allEmployees = data.filter(d => d.type === 'employee');
    allUsers = data.filter(d => d.type === 'admin');
    allTrainings = data.filter(d => d.type === 'training');
    allApplicants = data.filter(d => d.type === 'applicant');
    allAssets = data.filter(d => d.type === 'asset');
    allCheckins = data.filter(d => d.type === 'checkin');
    allLeaves = data.filter(d => d.type === 'leave');
    
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderEmployeeTable === 'function') renderEmployeeTable();
    if (typeof renderOrganization === 'function') renderOrganization();
    if (typeof renderPayroll === 'function') renderPayroll();
    if (typeof renderAnalytics === 'function') renderAnalytics();
    if (typeof renderAttendance === 'function') renderAttendance();
    if (typeof renderTrainings === 'function') renderTrainings();
    if (typeof renderApplicants === 'function') renderApplicants();
    if (typeof renderAssets === 'function') renderAssets();
    if (typeof renderLeaves === 'function') renderLeaves();
    if (typeof populateLeaveEmployeeDropdown === 'function') populateLeaveEmployeeDropdown();
  }
};

window.initApp = async () => {
  // Cek apakah dataSdk tersedia
  if (!window.dataSdk || !window.dataSdk.apiUrl) {
    console.error('DataSDK not configured!');
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
      errorDiv.textContent = '⚠️ Database tidak terkonfigurasi. Pastikan database-config.js sudah diisi dengan URL Web App yang benar.';
      errorDiv.classList.remove('hidden');
    }
    showLogin();
    return;
  }
  
  console.log('Connecting to database at:', window.dataSdk.apiUrl);
  
  const stored = localStorage.getItem('hris_user');
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      // Validasi user masih ada di database
      const userCheck = await window.dataSdk.getById('admin', currentUser.__backendId);
      if (userCheck.isOk && userCheck.data) {
        currentUser = userCheck.data;
        showDashboard();
      } else {
        localStorage.removeItem('hris_user');
        showLogin();
      }
    } catch {
      showLogin();
    }
  } else {
    showLogin();
  }
  
  // Initialize SDKs
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (config) => applyConfig(config),
      mapToCapabilities: (config) => ({
        recolorables: [
          { get: () => config.bg_color || defaultConfig.bg_color, set: v => { config.bg_color = v; window.elementSdk.setConfig({ bg_color: v }); } },
          { get: () => config.surface_color || defaultConfig.surface_color, set: v => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
          { get: () => config.text_color || defaultConfig.text_color, set: v => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
          { get: () => config.accent_color || defaultConfig.accent_color, set: v => { config.accent_color = v; window.elementSdk.setConfig({ accent_color: v }); } },
          { get: () => config.sidebar_color || defaultConfig.sidebar_color, set: v => { config.sidebar_color = v; window.elementSdk.setConfig({ sidebar_color: v }); } }
        ],
        borderables: [],
        fontEditable: { get: () => config.font_family || defaultConfig.font_family || '', set: v => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } },
        fontSizeable: { get: () => config.font_size || 14, set: v => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } }
      }),
      mapToEditPanelValues: (config) => new Map([
        ['app_title', config.app_title || defaultConfig.app_title],
        ['company_name', config.company_name || defaultConfig.company_name]
      ])
    });
  }
};

// ==================== EXPOSE GLOBAL FUNCTIONS ====================
window.navigate = navigate;
window.filterEmployees = filterEmployees;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.changePassword = changePassword;
window.closePasswordModal = closePasswordModal;
window.handleChangePassword = handleChangePassword;
window.handleLogout = handleLogout;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.switchToLogin = switchToLogin;
window.switchToRegister = switchToRegister;
window.openDeleteConfirm = openDeleteConfirm;
window.confirmDelete = confirmDelete;
window.closeDeleteConfirm = closeDeleteConfirm;
window.openCheckinModal = openCheckinModal;
window.closeCheckinModal = closeCheckinModal;
window.performCheckin = performCheckin;
window.showToast = showToast;