import axios from 'axios';

// Get API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

console.log('🌱 Farmers Ferts API URL:', API_BASE_URL);

// API configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// API endpoints
export const endpoints = {
  // Authentication
  signin: '/signin',
  signout: '/signout',
  authCheck: '/auth/check',
  
  // Products
  products: '/api/products',
  productById: (id) => `/api/products/${id}`,
  
  // Batches
  batches: '/api/batches',
  batchById: (id) => `/api/batches/${id}`,
  
  // Public product view (for QR codes)
  productView: (batchId) => `/api/product-view/${batchId}`,
  
  // Analytics
  analytics: '/api/analytics/dashboard',
  
  // Utility
  storageInfo: '/api/storage-info',
  health: '/health',
  
  // File handling
  files: {
    image: (filename) => `/api/files/image/${filename}`,
    documentSignedUrl: '/api/documents/get-signed-url',
    documentDownload: (type, filename) => `/api/documents/download/${type}/${filename}`
  }
};

// Create axios instance
export const apiClient = axios.create(apiConfig);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('🌱 API Request:', {
      method: config.method?.toUpperCase(),
      endpoint: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      origin: typeof window !== 'undefined' ? window.location.origin : 'server'
    });

    // Add auth token from storage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', {
      status: response.status,
      endpoint: response.config.url,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      endpoint: error.config?.url,
      data: error.response?.data
    });

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('🔴 NETWORK ERROR - Check if backend is running on', API_BASE_URL);
      return Promise.reject({
        ...error,
        message: 'Network error. Please check if the server is running.'
      });
    }

    // Handle CORS errors
    if (error.code === 'ERR_BLOCKED_BY_CLIENT' || error.message.includes('CORS')) {
      console.error('🔴 CORS ERROR - Backend not allowing frontend origin');
      return Promise.reject({
        ...error,
        message: 'CORS error. Please check server configuration.'
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('🔐 Authentication failed, clearing tokens');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/') || window.location.pathname === '/dashboard') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Test API connection
export const testConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ API Connection failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ API Connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Enhanced API methods
export const api = {
  // Test connection
  testConnection,
  
  // Authentication
  async signin(credentials) {
    try {
      console.log('🔐 Attempting login...');
      const response = await apiClient.post(endpoints.signin, credentials);
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      console.error('🔐 Login failed:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  async signout() {
    try {
      console.log('🔐 Signing out...');
      const response = await apiClient.post(endpoints.signout);
      
      // Clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
      
      console.log('✅ Signout successful');
      return response;
    } catch (error) {
      console.error('🔐 Signout failed:', error);
      // Clear tokens anyway
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
      throw error;
    }
  },

  async checkAuth() {
    try {
      const response = await apiClient.get(endpoints.authCheck);
      return response;
    } catch (error) {
      console.error('🔐 Auth check failed:', error);
      throw error;
    }
  },

  // Products
  async getProducts(params = {}) {
    try {
      console.log('📦 Fetching products...');
      const response = await apiClient.get(endpoints.products, { params });
      console.log(`✅ Fetched ${response.data.products?.length || 0} products`);
      return response;
    } catch (error) {
      console.error('📦 Failed to fetch products:', error);
      throw error;
    }
  },

  async createProduct(formData) {
    try {
      console.log('📦 Creating product...');
      const response = await apiClient.post(endpoints.products, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minutes for file uploads
      });
      console.log('✅ Product created successfully');
      return response;
    } catch (error) {
      console.error('📦 Failed to create product:', error);
      throw error;
    }
  },

  async updateProduct(productId, data) {
    try {
      console.log('📦 Updating product:', productId);
      const response = await apiClient.put(endpoints.productById(productId), data, {
        headers: data instanceof FormData ? {
          'Content-Type': 'multipart/form-data'
        } : {
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes for file uploads
      });
      console.log('✅ Product updated successfully');
      return response;
    } catch (error) {
      console.error('📦 Failed to update product:', error);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      console.log('📦 Deleting product:', productId);
      const response = await apiClient.delete(endpoints.productById(productId));
      console.log('✅ Product deleted successfully');
      return response;
    } catch (error) {
      console.error('📦 Failed to delete product:', error);
      throw error;
    }
  },

  // Batches
  async getBatches(params = {}) {
    try {
      console.log('🏷️ Fetching batches...');
      const response = await apiClient.get(endpoints.batches, { params });
      console.log(`✅ Fetched ${response.data.batches?.length || 0} batches`);
      return response;
    } catch (error) {
      console.error('🏷️ Failed to fetch batches:', error);
      throw error;
    }
  },

  async createBatch(data) {
    try {
      console.log('🏷️ Creating batch...');
      const response = await apiClient.post(endpoints.batches, data);
      console.log('✅ Batch created successfully');
      return response;
    } catch (error) {
      console.error('🏷️ Failed to create batch:', error);
      throw error;
    }
  },

  async updateBatch(batchId, data) {
    try {
      console.log('🏷️ Updating batch:', batchId);
      const response = await apiClient.put(endpoints.batchById(batchId), data);
      console.log('✅ Batch updated successfully');
      return response;
    } catch (error) {
      console.error('🏷️ Failed to update batch:', error);
      throw error;
    }
  },

  async deleteBatch(batchId) {
    try {
      console.log('🏷️ Deleting batch:', batchId);
      const response = await apiClient.delete(endpoints.batchById(batchId));
      console.log('✅ Batch deleted successfully');
      return response;
    } catch (error) {
      console.error('🏷️ Failed to delete batch:', error);
      throw error;
    }
  },

  // Public product view (for QR codes)
  async getProductView(batchId) {
    try {
      console.log('👁️ Fetching product view for batch:', batchId);
      const response = await apiClient.get(endpoints.productView(batchId));
      console.log('✅ Product view fetched successfully');
      return response;
    } catch (error) {
      console.error('👁️ Failed to fetch product view:', error);
      throw error;
    }
  },

  // Analytics
  async getAnalytics() {
    try {
      console.log('📊 Fetching analytics...');
      const response = await apiClient.get(endpoints.analytics);
      console.log('✅ Analytics fetched successfully');
      return response;
    } catch (error) {
      console.error('📊 Failed to fetch analytics:', error);
      throw error;
    }
  },

  // Utility
  async getStorageInfo() {
    try {
      const response = await apiClient.get(endpoints.storageInfo);
      return response;
    } catch (error) {
      console.error('💾 Failed to get storage info:', error);
      throw error;
    }
  },

  async getHealth() {
    try {
      const response = await apiClient.get(endpoints.health);
      return response;
    } catch (error) {
      console.error('🏥 Health check failed:', error);
      throw error;
    }
  }
};

// Helper functions
export const fileHelpers = {
  // Get optimized image URL
  getImageUrl: (imagePath, options = {}) => {
    if (!imagePath) return null;
    
    // Clean path
    const cleanPath = imagePath.split(',')[0].trim();
    
    // If it's already a full URL
    if (cleanPath.startsWith('http')) {
      return cleanPath;
    }
    
    // If it's a local path
    if (cleanPath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${cleanPath}`;
    }
    
    // If it's just a filename
    return `${API_BASE_URL}/api/files/image/${cleanPath}`;
  },

  // Get document download URL
  getDocumentDownloadUrl: async (docPath, type = 'documents') => {
    try {
      const response = await apiClient.post(endpoints.files.documentSignedUrl, {
        filePath: docPath,
        type: type
      });
      
      if (response.data.success) {
        return response.data.signedUrl;
      }
      
      throw new Error(response.data.message || 'Failed to get download URL');
    } catch (error) {
      console.error('📄 Failed to get document URL:', error);
      
      // Fallback to direct download
      const filename = docPath.split('/').pop().split(',')[0].trim();
      return `${API_BASE_URL}${endpoints.files.documentDownload(type, filename)}`;
    }
  },

  // Download file helper
  downloadFile: async (url, filename) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('⬇️ Download failed:', error);
      return false;
    }
  }
};

// Connection test on module load (only in browser)
if (typeof window !== 'undefined') {
  // Test connection after a short delay
  setTimeout(() => {
    testConnection().then(result => {
      if (!result.success) {
        console.warn('⚠️ Initial API connection test failed. Please ensure backend is running.');
      }
    });
  }, 1000);
}

export default api;
