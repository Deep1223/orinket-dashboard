import Config from '../config/config';
import StorageService from './StorageService';

// LocalStorage helper functions removed - using backend only

class ApiService {
  constructor() {
    this.timeout = Config.apiTimeout;
  }

  get baseUrl() {
    // Config.apiBaseUrl already contains '/api' from IISMethods
    return Config.apiBaseUrl;
  }

  // ============ CHECK MODE ============
  isLocalStorage() {
    // Always return false - localStorage mode removed
    return false;
  }

  normalizeSort(sort = {}) {
    if (!sort || typeof sort !== 'object') {
      return {};
    }

    if (Object.prototype.hasOwnProperty.call(sort, 'field')) {
      const field = sort.field;
      const order = Number(sort.order);

      if (!field) {
        return {};
      }

      if (order === 1 || order === -1 || order === 0) {
        return { [field]: order };
      }

      return { [field]: 0 };
    }

    const sortEntries = Object.entries(sort);
    if (sortEntries.length === 0) {
      return {};
    }

    const [field, rawOrder] = sortEntries[0];
    const order = Number(rawOrder);

    if (order === 1 || order === -1 || order === 0) {
      return { [field]: order };
    }

    return { [field]: 0 };
  }

  // ============ LOCAL STORAGE METHODS REMOVED ============

  async upload(file, options = {}) {
    const { allowedtypes, maxfilesize } = options;

    // localStorage mode removed - always use backend
    const formData = new FormData();
    formData.append('image', file);
    if (allowedtypes) formData.append('allowedtypes', allowedtypes);
    if (maxfilesize) formData.append('maxfilesize', maxfilesize);

    const token = StorageService.getToken();
    console.log('Upload Debug - Token:', token ? 'Present' : 'Missing');
    console.log('Upload Debug - Token Length:', token?.length || 0);
    
    const headers = {};
    
    // Add Authorization header only if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Upload Debug - No token found, trying without Authorization header');
    }

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include', // Support HttpOnly cookies
      });
      
      console.log('Upload Debug - Response Status:', response.status);
      console.log('Upload Debug - Response OK:', response.ok);
      
      const data = await response.json();
      console.log('Upload Debug - Response Data:', data);
      
      if (response.ok) {
        return { status: 200, data: data.data };
      } else {
        return { status: response.status, message: data.message };
      }
    } catch (error) {
      console.log('Upload Debug - Error:', error);
      return { status: 500, message: error.message };
    }
  }

  // ============ API METHODS ============
  async makeApiRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Authorization header is no longer needed as we use HttpOnly cookies.
    // The browser automatically attaches 'token' cookie if credentials: 'include'.

    try {
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
        credentials: 'include', // Send cookies with every request
        ...options,
      });
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        const isPublicEndpoint = 
          url.endsWith('/config') || 
          url.includes('/auth/login') || 
          url.includes('/auth/signup') ||
          url.includes('/auth/google');
        
        if (!isPublicEndpoint) {
          StorageService.clearAuth();
          window.location.href = '/login';
        }
        
        // If we have a body for 401 (like "Invalid credentials"), parse and return it
        try {
          const data = await response.json();
          return { status: 401, success: false, message: data.message || Config.MESSAGES.unauthorized, ...data };
        } catch (e) {
          return { status: 401, success: false, message: Config.MESSAGES.unauthorized };
        }
      }
      
      const data = await response.json();
      if (!response.ok) {
        return { 
          status: response.status, 
          success: false, 
          message: data.message || `HTTP error! status: ${response.status}`,
          ...data 
        };
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error(Config.MESSAGES.timeout);
      throw error;
    }
  }

  // ============ GENERIC METHODS ============
  async get(endpoint) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await this.makeApiRequest(url, {
        method: 'GET',
      });
      return { status: 200, success: true, data: response };
    } catch (error) {
      return { status: 500, success: false, data: null, message: error.message };
    }
  }

  async put(endpoint, data) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await this.makeApiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { status: response.success ? 200 : 500, success: response.success, data: response.data, message: response.message };
    } catch (error) {
      return { status: 500, success: false, data: null, message: error.message };
    }
  }

  // ============ PUBLIC METHODS (AUTO SWITCH) ============
  async create(entity, data) {
    // localStorage mode removed - always use backend
    try {
      // For create, we use /entity/create as per new router structure
      const url = `${this.baseUrl}/${entity}/create`;
      const response = await this.makeApiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { status: response.success ? 200 : 500, success: response.success, data: response.data, message: response.message };
    } catch (error) {
      return { status: 500, success: false, data: null, message: error.message };
    }
  }

  async read(entity, options = {}) {
    // localStorage mode removed - always use backend

    try {
      // payload structure as requested
      const payload = {
        paginationinfo: {
          pageno: options.pagination?.page || 1,
          pagelimit: options.pagination?.limit || 1000,
          filter: options.filters || {},
          sort: this.normalizeSort(options.sort),
          projection: options.projection || {}
        },
        searchtext: options.search || '' // Moved outside paginationinfo
      };

      const url = `${this.baseUrl}/${entity}`;
      const response = await this.makeApiRequest(url, {
        method: 'POST', // Changed to POST for listing as requested
        body: JSON.stringify(payload),
      });

      if (response.success) {
        return { status: 200, ...response };
      }
      throw new Error(response.message || `Failed to fetch ${entity}`);
    } catch (error) {
      console.error(`Read error for ${entity}:`, error);
      throw error;
    }
  }

  async update(entity, id, data) {
    // localStorage mode removed - always use backend
    try {
      const url = `${this.baseUrl}/${entity}/update`;
      // Ensure _id is in the payload
      const payload = { ...data, _id: id };
      const response = await this.makeApiRequest(url, {
        method: 'POST', // Changed to POST for payload support
        body: JSON.stringify(payload),
      });
      return { status: response.success ? 200 : 500, success: response.success, data: response.data, message: response.message };
    } catch (error) {
      return { status: 500, success: false, data: null, message: error.message };
    }
  }

  async delete(entity, id) {
    // localStorage mode removed - always use backend
    try {
      const url = `${this.baseUrl}/${entity}/delete`;
      const response = await this.makeApiRequest(url, { 
        method: 'POST', // Changed to POST to send _id in payload
        body: JSON.stringify({ _id: id }) 
      });
      return { status: response.success ? 200 : 500, success: response.success, message: response.message };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  /**
   * Fetch single record by ID from API
   * @param {string} entity - Entity name
   * @param {string} id - Record ID to fetch
   * @returns {Promise<Object>} - Single record data
   */
  async getDataById(entity, id) {
    // localStorage mode removed - always use backend

    try {
      const payload = {
        paginationinfo: {
          pageno: 1,
          pagelimit: 1,
          filter: { _id: id },
          sort: {},
          projection: {}
        },
        searchtext: ''
      };

      const url = `${this.baseUrl}/${entity}`;
      const response = await this.makeApiRequest(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.success && response.data && response.data.length > 0) {
        return response.data[0];
      } else {
        console.error('Data not found for ID:', id);
        return null;
      }
    } catch (error) {
      console.error('Error fetching data by ID:', error);
      return null;
    }
  }

  // ============ AUTH METHODS ============
  async register(data) {
    try {
      const response = await this.makeApiRequest(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { status: response.success ? 200 : 500, success: response.success, message: response.message };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  async login(data) {
    try {
      const response = await this.makeApiRequest(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  async googleLogin(idToken) {
    try {
      const response = await this.makeApiRequest(`${this.baseUrl}/auth/google`, {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      return response;
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.makeApiRequest(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  async resetPassword(data) {
    try {
      const response = await this.makeApiRequest(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  async verify2FA(data) {
    try {
      const response = await this.makeApiRequest(`${this.baseUrl}/auth/2fa/verify`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  async setup2FA(userId) {
    try {
      const response = await this.makeApiRequest(`${this.baseUrl}/auth/2fa/setup`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return response;
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }

  async generateUsercode() {
    try {
      const url = `${this.baseUrl}/generateusercode`;
      const response = await this.makeApiRequest(url, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  }
}

const apiService = new ApiService();
export default apiService;
