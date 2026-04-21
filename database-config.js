// ==================== KONFIGURASI DATABASE ====================
// Ganti dengan URL Web App Anda setelah deploy Google Apps Script
// Contoh: 'https://script.google.com/macros/s/ABC123XYZ/exec'
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxFDOU4cPG1bQTV_060SFDxxa6N6szWD8kbzfdyHIQNnKtNxf66L-KSmiIrxWGBXnCh/exec';

// ==================== DATA SDK WRAPPER ====================
class DataSDK {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.isConnected = false;
  }

  async request(method, data) {
    try {
      let url = this.apiUrl;
      const options = {
        method: method,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (method !== 'GET') {
        options.body = JSON.stringify(data);
      } else if (data) {
        const urlParams = new URLSearchParams();
        urlParams.append('data', JSON.stringify(data));
        const separator = url.includes('?') ? '&' : '?';
        url = url + separator + urlParams.toString();
      }
      
      console.log(`[DataSDK] ${method} request to:`, url);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`[DataSDK] Response:`, result);
      return result;
    } catch (error) {
      console.error('[DataSDK] Error:', error);
      return { isOk: false, error: error.message, success: false };
    }
  }

  async init(handler) {
    try {
      console.log('[DataSDK] Initializing...');
      
      // Test koneksi dengan mengambil data admin
      const testResult = await this.request('GET', { type: 'admin', action: 'getAll' });
      
      if (!testResult.success && !testResult.isOk) {
        console.error('[DataSDK] Connection test failed:', testResult.error);
        this.isConnected = false;
        return { isOk: false, error: 'Cannot connect to database. Please check your Web App URL.' };
      }
      
      console.log('[DataSDK] Connection successful');
      this.isConnected = true;
      
      // Fetch all data
      const data = await this.getAllData();
      console.log(`[DataSDK] Loaded ${data.length} records`);
      
      if (handler && handler.onDataChanged) {
        handler.onDataChanged(data);
      }
      
      return { isOk: true };
    } catch (error) {
      console.error('[DataSDK] Init error:', error);
      this.isConnected = false;
      return { isOk: false, error: error.message };
    }
  }

  async getAllData() {
    const types = ['employee', 'admin', 'training', 'applicant', 'asset', 'checkin', 'leave'];
    let allData = [];
    
    for (const type of types) {
      const result = await this.request('GET', { type: type, action: 'getAll' });
      if ((result.success || result.isOk) && result.data) {
        allData = allData.concat(result.data);
        console.log(`[DataSDK] Loaded ${result.data.length} ${type} records`);
      }
    }
    
    return allData;
  }

  async create(data) {
    console.log('[DataSDK] Creating record:', data.type);
    const result = await this.request('POST', { ...data, action: 'create' });
    return { isOk: result.success === true, data: result.data, error: result.error };
  }

  async update(data) {
    console.log('[DataSDK] Updating record:', data.type, data.__backendId);
    const result = await this.request('PUT', { ...data, action: 'update' });
    return { isOk: result.success === true, data: result.data, error: result.error };
  }

  async delete(data) {
    console.log('[DataSDK] Deleting record:', data.type, data.__backendId);
    const result = await this.request('DELETE', { ...data, action: 'delete' });
    return { isOk: result.success === true, error: result.error };
  }

  async getById(type, id) {
    console.log('[DataSDK] Getting record by ID:', type, id);
    const result = await this.request('GET', { type: type, id: id, action: 'getById' });
    return { isOk: result.success === true, data: result.data, error: result.error };
  }

  async getByType(type) {
    console.log('[DataSDK] Getting records by type:', type);
    const result = await this.request('GET', { type: type, action: 'getAll' });
    return { isOk: result.success === true, data: result.data, error: result.error };
  }
}

// Create global instance
window.dataSdk = new DataSDK(WEB_APP_URL);

// ==================== ELEMENT SDK PLACEHOLDER ====================
// Di database-config.js
window.elementSdk = {
  init: (config) => {
    console.log('[ElementSDK] Initialized', config);
    return { isOk: true };
  },
  setConfig: (config) => {
    console.log('[ElementSDK] Config updated', config);
  }
};
  getConfig: () => {
    return {
      app_title: 'HRIS Pro',
      company_name: 'PT Perusahaan Anda',
      bg_color: '#f8fafc',
      sidebar_color: '#0f172a'
    };
  }
};

console.log('[Database] SDK initialized with URL:', WEB_APP_URL);
