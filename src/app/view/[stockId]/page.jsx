'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../../styles/view.module.css';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.farmersferts.com';

export default function ProductPage() {
  const params = useParams();
  const batchId = params.stockId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentTab, setCurrentTab] = useState('composition');
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    loadProductData();
  }, [batchId]);

  const loadProductData = async () => {
    if (!batchId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await axios.get(`${API_URL}/api/product-view/${batchId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setData(response.data.data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Load product error:', error);
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(error.response?.data?.message || 'Failed to load product information');
      }
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (tab) => {
    setCurrentTab(tab);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getExpiryStatus = () => {
    if (!data?.batchInfo?.expiryDate) return null;

    const expiryDate = new Date(data.batchInfo.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (data.batchInfo.isExpired || daysUntilExpiry <= 0) {
      return { status: 'expired', message: 'EXPIRED', color: 'red' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', message: `Expires in ${daysUntilExpiry} days`, color: 'orange' };
    } else {
      return { status: 'active', message: `Valid for ${daysUntilExpiry} days`, color: 'green' };
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    console.log('🖼️ Processing image path:', imagePath);
    
    const cleanPath = imagePath.split(',')[0].trim();
    
    if (cleanPath.startsWith('https://res.cloudinary.com/')) {
      return cleanPath;
    }
    
    if (cleanPath.startsWith('http')) {
      return cleanPath;
    }
    
    if (cleanPath.startsWith('/')) {
      return `${API_URL}${cleanPath}`;
    }
    
    return `${API_URL}/api/images/${encodeURIComponent(cleanPath)}`;
  };

  const processFilePaths = (docPath) => {
    if (!docPath || typeof docPath !== 'string') return [];
    
    const paths = docPath.split(',').map(path => path.trim()).filter(path => path);
    
    return paths.filter(path => 
      path && 
      path !== 'No documents uploaded' && 
      path !== 'No document uploaded' &&
      path !== '' &&
      !path.toLowerCase().includes('no document') &&
      !path.toLowerCase().includes('not available')
    );
  };

  const isDocumentAvailable = (docPath) => {
    const validPaths = processFilePaths(docPath);
    return validPaths.length > 0;
  };

  const extractFileName = (path, index = 0) => {
    if (!path) return '';
    
    const cleanPath = path.trim();
    
    if (cleanPath.startsWith('https://res.cloudinary.com/')) {
      const urlParts = cleanPath.split('/');
      let filename = urlParts[urlParts.length - 1];
      filename = filename.split('?')[0];
      return filename;
    }
    
    if (cleanPath.includes('/')) {
      const segments = cleanPath.split('/');
      let filename = segments[segments.length - 1];
      filename = filename.split('?')[0];
      return filename;
    }
    
    return cleanPath;
  };

  const getFileExtensionFromPath = (path) => {
    const pathLower = path.toLowerCase();
    if (pathLower.includes('.pdf')) return 'pdf';
    if (pathLower.includes('.doc')) return 'doc';
    if (pathLower.includes('.docx')) return 'docx';
    if (pathLower.includes('.jpg') || pathLower.includes('.jpeg')) return 'jpg';
    if (pathLower.includes('.png')) return 'png';
    return 'pdf';
  };

  const getFilenameFromPath = (path, defaultName = 'document', index = 0) => {
    try {
      const cleanPath = path.trim();
      let filename = extractFileName(cleanPath);
      
      if (filename && filename.includes('.')) {
        if (index > 0) {
          const lastDotIndex = filename.lastIndexOf('.');
          const name = filename.substring(0, lastDotIndex);
          const extension = filename.substring(lastDotIndex);
          return `${name}_${index + 1}${extension}`;
        }
        return decodeURIComponent(filename);
      }
      
      const extension = getFileExtensionFromPath(cleanPath) || 'pdf';
      const suffix = index > 0 ? `_${index + 1}` : '';
      return `${defaultName}${suffix}.${extension}`;
    } catch (error) {
      const suffix = index > 0 ? `_${index + 1}` : '';
      return `${defaultName}${suffix}.pdf`;
    }
  };

  const showDownloadNotification = (message, type = 'info', duration = 4000) => {
    const colors = {
      success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '✅' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '❌' },
      warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404', icon: '⚠️' },
      info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460', icon: 'ℹ️' },
      downloading: { bg: '#e3f2fd', border: '#bbdefb', text: '#0d47a1', icon: '📥' }
    };
    
    const color = colors[type] || colors.info;
    
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        border: 1px solid ${color.border};
        color: ${color.text};
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 90vw;
        width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 18px; flex-shrink: 0;">${color.icon}</span>
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: 500; margin-bottom: 2px;">
              ${type === 'downloading' ? 'Download Started' : 
                type === 'success' ? 'Download Complete' : 
                type === 'error' ? 'Download Failed' : 'Download Info'}
            </div>
            <div style="font-size: 13px; opacity: 0.9;">${message}</div>
          </div>
        </div>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @media (max-width: 600px) {
          div[style*="position: fixed"] {
            top: 10px;
            right: 10px;
            width: 90vw;
            max-width: 300px;
            padding: 12px 16px;
          }
        }
      </style>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
    
    return notification;
  };

  const forceDownload = async (url, filename) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Fetch failed');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'document.pdf';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Force download failed:', error);
      return false;
    }
  };

  const downloadViaIframe = (url, filename) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      if (filename) {
        iframe.setAttribute('download', filename);
      }
      
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('Iframe download failed:', error);
      return false;
    }
  };

  const downloadSingleFile = async (filePath, defaultFilename, index = 0) => {
    console.log(`⬇️ Downloading file ${index + 1}:`, filePath);
    
    try {
      const filename = getFilenameFromPath(filePath, defaultFilename, index);
      const encodedPath = encodeURIComponent(filePath);
      const downloadUrl = `${API_URL}/api/download/${encodedPath}`;
      
      console.log('🔗 Using download URL:', downloadUrl);
      
      try {
        const response = await fetch(downloadUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/octet-stream, application/pdf, */*'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        let downloadFilename = filename;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            downloadFilename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        if (!downloadFilename || downloadFilename === 'undefined') {
          const fileExtension = getFileExtensionFromPath(filePath) || 'pdf';
          const suffix = index > 0 ? `_${index + 1}` : '';
          downloadFilename = `${defaultFilename}${suffix}.${fileExtension}`;
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        return { success: true, filename: downloadFilename };
        
      } catch (fetchError) {
        console.error('❌ Fetch download failed:', fetchError);
        
        const fallbackUrl = `${API_URL}/api/documents/${encodedPath}?download=true`;
        console.log('🔄 Trying fallback download URL:', fallbackUrl);
        
        const forceDownloadSuccess = await forceDownload(fallbackUrl, filename);
        
        if (forceDownloadSuccess) {
          return { success: true, filename, method: 'fallback' };
        } else {
          const iframeSuccess = downloadViaIframe(fallbackUrl, filename);
          if (iframeSuccess) {
            return { success: true, filename, method: 'iframe' };
          } else {
            throw new Error('All download methods failed');
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Download failed completely:', error);
      
      try {
        console.log('🔄 Trying signed URL method as last resort');
        
        const response = await axios.post(`${API_URL}/api/documents/get-signed-url`, {
          filePath: filePath,
          type: 'download'
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data.success) {
          const filename = getFilenameFromPath(filePath, defaultFilename, index);
          
          if (response.data.serverDownloadUrl) {
            const serverUrl = `${API_URL}${response.data.serverDownloadUrl}`;
            const downloadSuccess = await forceDownload(serverUrl, filename);
            
            if (downloadSuccess) {
              return { success: true, filename, method: 'server' };
            } else {
              window.open(serverUrl, '_blank');
              return { success: true, filename, method: 'new_tab' };
            }
          } else {
            const signedUrl = response.data.signedUrl;
            
            try {
              const fetchResponse = await fetch(signedUrl);
              const blob = await fetchResponse.blob();
              
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              link.click();
              
              window.URL.revokeObjectURL(url);
              return { success: true, filename, method: 'signed' };
            } catch (signedFetchError) {
              window.open(signedUrl, '_blank');
              return { success: true, filename, method: 'signed_tab' };
            }
          }
        } else {
          throw new Error('Failed to get signed URL');
        }
      } catch (signedUrlError) {
        console.error('❌ Signed URL method also failed:', signedUrlError);
        return { success: false, error: 'All download methods failed' };
      }
    }
  };

  const handleDocumentDownload = async (filePath, defaultFilename, index = 0) => {
    if (downloadLoading[filePath]) {
      showDownloadNotification('Another download is in progress for this file', 'warning');
      return;
    }

    setDownloadLoading(prev => ({ ...prev, [filePath]: true }));
    showDownloadNotification(`Starting download for ${getFilenameFromPath(filePath, defaultFilename, index)}`, 'downloading');

    try {
      const result = await downloadSingleFile(filePath, defaultFilename, index);
      
      if (result.success) {
        showDownloadNotification(`Successfully downloaded ${result.filename}`, 'success');
      } else {
        showDownloadNotification(`Failed to download ${getFilenameFromPath(filePath, defaultFilename, index)}: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      showDownloadNotification(`Failed to download ${getFilenameFromPath(filePath, defaultFilename, index)}: ${error.message}`, 'error');
    } finally {
      setDownloadLoading(prev => ({ ...prev, [filePath]: false }));
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SmartDownloadButton = ({ docPath, filename, type, label }) => {
    const validPaths = processFilePaths(docPath);
    
    if (validPaths.length === 0) {
      return null;
    }

    const isExpanded = expandedSections[label] || false;
    const fileCount = validPaths.length;

    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: fileCount > 1 ? 'pointer' : 'default',
          flexWrap: 'wrap',
          gap: '8px'
        }} onClick={() => fileCount > 1 && toggleSectionatians}>
          <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
            <div style={{
              fontWeight: '600',
              color: '#212529',
              marginBottom: '4px',
              fontSize: 'clamp(14px, 4vw, 16px)'
            }}>
              {label}
              {fileCount > 1 && (
                <span style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  fontSize: 'clamp(10px, 3vw, 12px)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginLeft: '8px',
                  fontWeight: '500'
                }}>
                  {fileCount} files
                </span>
              )}
            </div>
            <div style={{
              fontSize: 'clamp(12px, 3.5vw, 14px)',
              color: '#6c757d'
            }}>
              {fileCount > 1 
                ? `Tap to ${isExpanded ? 'collapse' : 'expand'} and view ${fileCount} documents`
                : 'Tap to download document to your device'
              }
            </div>
          </div>
          {fileCount === 1 && (
            <button 
              onClick={() => handleDocumentDownload(validPaths[0], filename, 0)}
              disabled={downloadLoading[validPaths[0]]}
              style={{
                backgroundColor: downloadLoading[validPaths[0]] ? '#6c757d' : '#2d5a27',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                fontWeight: '600',
                cursor: downloadLoading[validPaths[0]] ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: downloadLoading[validPaths[0]] ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                flex: '0 0 auto'
              }}
              onMouseOver={(e) => {
                if (!downloadLoading[validPaths[0]]) {
                  e.target.style.backgroundColor = '#1e3f1a';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (!downloadLoading[validPaths[0]]) {
                  e.target.style.backgroundColor = '#2d5a27';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
            >
              {downloadLoading[validPaths[0]] ? (
                <>
                  <span style={{ 
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block'
                  }}>⏳</span>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Download</span>
                </>
              )}
            </button>
          )}
          {fileCount > 1 && (
            <span style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              color: '#2d5a27',
              flex: '0 0 auto'
            }}>
              {isExpanded ? '▲' : '▼'}
            </span>
          )}
        </div>
        {fileCount > 1 && isExpanded && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            {validPaths.map((path, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < validPaths.length - 1 ? '1px solid #eee' : 'none',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: '1 1 auto',
                  minWidth: '150px'
                }}>
                  <span style={{ color: '#2d5a27', fontSize: 'clamp(14px, 4vw, 16px)' }}>
                    {getFileExtensionFromPath(path) === 'pdf' ? '📄' : '📎'}
                  </span>
                  <span style={{ 
                    fontSize: 'clamp(12px, 3.5vw, 14px)', 
                    color: '#212529',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {getFilenameFromPath(path, filename, index)}
                  </span>
                </div>
                <button 
                  onClick={() => handleDocumentDownload(path, filename, index)}
                  disabled={downloadLoading[path]}
                  style={{
                    backgroundColor: downloadLoading[path] ? '#6c757d' : '#2d5a27',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: 'clamp(11px, 3vw, 13px)',
                    fontWeight: '600',
                    cursor: downloadLoading[path] ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    flex: '0 0 auto'
                  }}
                  onMouseOver={(e) => {
                    if (!downloadLoading[path]) {
                      e.target.style.backgroundColor = '#1e3f1a';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!downloadLoading[path]) {
                      e.target.style.backgroundColor = '#2d5a27';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                  onTouchStart={(e) => {
                    if (!downloadLoading[path]) {
                      e.target.style.backgroundColor = '#1e3f1a';
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (!downloadLoading[path]) {
                      e.target.style.backgroundColor = '#2d5a27';
                    }
                  }}
                >
                  {downloadLoading[path] ? (
                    <>
                      <span style={{ 
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block'
                      }}>⏳</span>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
        <style jsx>{`
          @media (max-width: 600px) {
            div[style*="background-color: #f8f9fa"] {
              padding: 10px;
            }
            button {
              padding: 8px 16px;
              font-size: clamp(11px, 3vw, 13px);
            }
            div[style*="flex-wrap: wrap"] {
              flex-direction: column;
              align-items: stretch;
            }
            button[style*="flex: 0 0 auto"] {
              width: 100%;
              justify-content: center;
            }
          }
          @media (min-width: 601px) and (max-width: 1024px) {
            div[style*="background-color: #f8f9fa"] {
              padding: 12px;
            }
            button {
              padding: 9px 18px;
              font-size: clamp(12px, 3vw, 14px);
            }
          }
        `}</style>
      </div>
    );
  };

  const IngredientsTable = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) {
      return (
        <div style={{
          padding: 'clamp(16px, 5vw, 20px)',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          textAlign: 'center',
          color: '#6c757d',
          fontSize: 'clamp(12px, 4vw, 14px)'
        }}>
          No ingredients information available
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          backgroundColor: '#2d5a27',
          color: 'white',
          padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
          fontWeight: 'bold',
          fontSize: 'clamp(14px, 4vw, 16px)'
        }}>
          🧪 Ingredients Composition
        </div>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6'
            }}>
              <th style={{
                padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
                textAlign: 'left',
                fontWeight: '600',
                color: '#495057',
                borderRight: '1px solid #dee2e6',
                fontSize: 'clamp(12px, 3.5vw, 14px)'
              }}>
                Ingredient Name
              </th>
              <th style={{
                padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
                textAlign: 'center',
                fontWeight: '600',
                color: '#495057',
                width: 'clamp(100px, 30vw, 120px)',
                fontSize: 'clamp(12px, 3.5vw, 14px)'
              }}>
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => (
              <tr key={index} style={{
                borderBottom: index < ingredients.length - 1 ? '1px solid #dee2e6' : 'none',
                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
              }}>
                <td style={{
                  padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
                  borderRight: '1px solid #dee2e6',
                  color: '#212529',
                  fontSize: 'clamp(12px, 3.5vw, 14px)'
                }}>
                  <span style={{
                    fontWeight: '500'
                  }}>
                    {ingredient.name}
                  </span>
                </td>
                <td style={{
                  padding: 'clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)',
                  textAlign: 'center',
                  color: '#495057',
                  fontSize: 'clamp(12px, 3.5vw, 14px)'
                }}>
                  <span style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: 'clamp(11px, 3vw, 13px)'
                  }}>
                    {ingredient.percentage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.pageLoadingContainer}>
        <div className={styles.pageLoadingContent}>
          <div className={styles.loadingLogo}>
            <div className={styles.logoIcon}>🧪</div>
            <h2 style={{ fontSize: 'clamp(18px, 5vw, 24px)' }}>FARMER'S FERTILIZER</h2>
          </div>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText} style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>
            Loading product information...
          </p>
          <div className={styles.loadingBar}>
            <div className={styles.loadingProgress}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.fullScreenNotFound}>
        <div className={styles.notFoundContent}>
          <div className={styles.notFound404} style={{ fontSize: 'clamp(48px, 10vw, 64px)' }}>Error</div>
          <div className={styles.notFoundIcon} style={{ fontSize: 'clamp(32px, 8vw, 48px)' }}>⚠️</div>
          <h1 className={styles.notFoundTitle} style={{ fontSize: 'clamp(20px, 6vw, 28px)' }}>
            Unable to Load Product
          </h1>
          <p className={styles.notFoundMessage} style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>{error}</p>
          <div className={styles.notFoundHelp}>
            <h3 style={{ fontSize: 'clamp(16px, 4.5vw, 20px)' }}>Try Again?</h3>
            <div className="mt-4 flex gap-4 justify-center flex-wrap">
              <button
                onClick={loadProductData}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', padding: 'clamp(8px, 2.5vw, 12px) clamp(16px, 4vw, 24px)' }}
              >
                Retry
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', padding: 'clamp(8px, 2.5vw, 12px) clamp(16px, 4vw, 24px)' }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className={styles.fullScreenNotFound}>
        <div className={styles.notFoundContent}>
          <div className={styles.notFound404} style={{ fontSize: 'clamp(48px, 10vw, 64px)' }}>404</div>
          <div className={styles.notFoundIcon} style={{ fontSize: 'clamp(32px, 8vw, 48px)' }}>🔍</div>
          <h1 className={styles.notFoundTitle} style={{ fontSize: 'clamp(20px, 6vw, 28px)' }}>
            Product Not Found
          </h1>
          <p className={styles.notFoundMessage} style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>
            Sorry, the product batch you're looking for doesn't exist or has been moved.
          </p>
          <div className={styles.notFoundHelp}>
            <h3 style={{ fontSize: 'clamp(16px, 4.5vw, 20px)' }}>Need Help?</h3>
            <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
              Check your QR code or contact our support team
            </p>
            <div className={styles.contactInfo} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
              <span>📧 info@farmersfert.com</span>
              <span>📞 +94 557284040</span>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', padding: 'clamp(8px, 2.5vw, 12px) clamp(16px, 4vw, 24px)' }}
            >
              Go Back
            </button>
            <button
              onClick={loadProductData}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', padding: 'clamp(8px, 2.5vw, 12px) clamp(16px, 4vw, 24px)' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const expiryStatus = getExpiryStatus();

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.logo}>
              <Image 
                src="/LOGO.png" 
                width={250} 
                height={200} 
                alt="Farmer's Fertilizer Logo" 
                priority 
                sizes="(max-width: 600px) 150px, 250px"
              />
            </div>
            <div className={styles.headerDetails}>
              <div className={styles.headerContact} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                Telephone No:{' '}
                {data.contact?.phones?.length > 0 ? data.contact.phones.join(' / ') : '+94 557284040'} | Web:{' '}
                {data.contact?.website || 'www.farmersfert.com'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container} style={{ padding: 'clamp(16px, 5vw, 24px)' }}>
        <div className={styles.productImages}>
          <div className={styles.mainImage}>
            <div className={styles.mainImageContent}>
              {data.imagePath ? (
                <div className="relative w-full h-full">
                  <img
                    src={getImageUrl(data.imagePath)}
                    alt={data.name}
                    className="w-full h-full object-cover rounded-lg"
                    style={{ maxHeight: '400px' }}
                    sizes="(max-width: 600px) 100vw, 50vw"
                    onError={(e) => {
                      console.log('Image load error, showing fallback');
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                    }}
                  />
                  <div className="hidden w-full h-full flex flex-col items-center justify-center text-center">
                    <div style={{ fontSize: 'clamp(24px, 8vw, 36px)' }}>🧪</div>
                    <div style={{ fontSize: 'clamp(12px, 3.5vw, 16px)', marginTop: '1rem', color: '#2d5a27' }}>
                      {data.name}
                    </div>
                  </div>
                  {data.batchInfo.isExpired && (
                    <div 
                      className={`${styles.expiredBadge} absolute top-4 right-4`} 
                      style={{ fontSize: 'clamp(10px, 3vw, 12px)' }}
                    >
                      EXPIRED
                    </div>
                  )}
                  {expiryStatus && expiryStatus.status === 'expiring' && (
                    <div 
                      className={`${styles.expiredBadge} bg-orange-500 absolute top-4 right-4`} 
                      style={{ fontSize: 'clamp(10px, 3vw, 12px)' }}
                    >
                      EXPIRING SOON
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div style={{ fontSize: 'clamp(24px, 8vw, 36px)' }}>🧪</div>
                  <div style={{ fontSize: 'clamp(12px, 3.5vw, 16px)', marginTop: '1rem', color: '#2d5a27' }}>
                    {data.name}
                  </div>
                  {data.batchInfo.isExpired && (
                    <div 
                      className={styles.expiredBadge} 
                      style={{ fontSize: 'clamp(10px, 3vw, 12px)' }}
                    >
                      EXPIRED
                    </div>
                  )}
                  {expiryStatus && expiryStatus.status === 'expiring' && (
                    <div 
                      className={`${styles.expiredBadge} bg-orange-500`} 
                      style={{ fontSize: 'clamp(10px, 3vw, 12px)' }}
                    >
                      EXPIRING SOON
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.productInfo}>
          <div>
            <h1 className={styles.productTitle} style={{ fontSize: 'clamp(20px, 6vw, 28px)' }}>
              {data.name}
            </h1>
            {data.shortDescription && (
              <p className={styles.productSubtitle} style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>
                {data.shortDescription}
              </p>
            )}
            {data.fullDescription && data.fullDescription !== data.shortDescription && (
              <div className={styles.productDescription}>
                <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>{data.fullDescription}</p>
              </div>
            )}
          </div>

          <div className={styles.stockDetails}>
            <h3 className={styles.sectionTitle} style={{ fontSize: 'clamp(16px, 4.5vw, 20px)' }}>
              Product Information
            </h3>
            <div className={styles.detailRow} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
              <span className={styles.detailLabel}>Batch Number:</span>
              <span className={styles.batchHighlight}>{data.batchInfo.number}</span>
            </div>
            {data.batchInfo.sampleNo && (
              <div className={styles.detailRow} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                <span className={styles.detailLabel}>Sample Number:</span>
                <span>{data.batchInfo.sampleNo}</span>
              </div>
            )}
            <div className={styles.detailRow} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
              <span className={styles.detailLabel}>Manufacturing Date:</span>
              <span>{formatDate(data.batchInfo.manufacturingDate)}</span>
            </div>
            <div className={styles.detailRow} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
              <span className={styles.detailLabel}>Expiry Date:</span>
              <span className={data.batchInfo.isExpired ? styles.expired : styles.valid}>
                {formatDate(data.batchInfo.expiryDate)}
              </span>
            </div>
            {data.batchInfo.availablePackageSizes && data.batchInfo.availablePackageSizes.length > 0 && (
              <div className={styles.detailRow} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                <span className={styles.detailLabel}>Available Package Sizes:</span>
                <span>{data.batchInfo.availablePackageSizes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.productDescription}>
          <div className={styles.descriptionContent}>
            <div className={styles.tabs} style={{ flexWrap: 'wrap', gap: '8px' }}>
              {['composition', 'application', 'benefits', 'safety'].map((tab) => (
                <div
                  key={tab}
                  className={`${styles.tab} ${currentTab === tab ? styles.active : ''}`}
                  onClick={() => changeTab(tab)}
                  style={{
                    fontSize: 'clamp(12px, 3.5vw, 14px)',
                    padding: 'clamp(8px, 2.5vw, 10px) clamp(16px, 4vw, 20px)',
                    flex: '1 1 auto',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>

            {currentTab === 'composition' && (
              <div className={styles.tabContent}>
                <h3 style={{ fontSize: 'clamp(16px, 4.5vw, 20px)' }}>
                  🧪 {data.composition?.title || 'Composition'}
                </h3>
                
                <div style={{ marginBottom: 'clamp(16px, 5vw, 24px)' }}>
                  <IngredientsTable ingredients={data.composition?.ingredients} />
                </div>

                <div style={{ marginBottom: 'clamp(12px, 4vw, 16px)' }}>
                  <SmartDownloadButton 
                    docPath={data.msds}
                    filename="MSDS"
                    type="documents"
                    label="Material Safety Data Sheet (MSDS)"
                  />
                </div>

                {data.batchInfo.isExpired && (
                  <div 
                    className={styles.warningBox} 
                    style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}
                  >
                    ⚠️ <strong>WARNING:</strong> This batch has expired and should not be used.
                  </div>
                )}
                {expiryStatus?.status === 'expiring' && (
                  <div
                    className={styles.warningBox}
                    style={{ 
                      background: '#fff3cd', 
                      borderColor: '#ffeaa7', 
                      color: '#856404', 
                      fontSize: 'clamp(12px, 3.5vw, 14px)' 
                    }}
                  >
                    ⚠️ <strong>NOTICE:</strong> This batch is expiring soon. Use before{' '}
                    {formatDate(data.batchInfo.expiryDate)}.
                  </div>
                )}
              </div>
            )}

            {currentTab === 'application' && (
              <div className={styles.tabContent}>
                <h3 style={{ fontSize: 'clamp(16px, 4.5vw, 20px)' }}>
                  📋 {data.application?.title || 'Application Instructions'}
                </h3>
                {data.batchInfo.isExpired ? (
                  <div 
                    className={styles.warningBox} 
                    style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}
                  >
                    ⚠️ <strong>WARNING:</strong> This batch has expired and should not be used for agricultural
                    purposes. Please dispose of properly according to environmental regulations.
                  </div>
                ) : (
                  <div className={styles.instructionsSection}>
                    {data.application?.instructions?.length > 0 ? (
                      <ul className={styles.benefitsList} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                        {data.application.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                        No application instructions available.
                      </p>
                    )}
                  </div>
                )}
                <div className={styles.sectionHeader}>
                  <h4 style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>📞 Contact Information</h4>
                </div>
                <div className={styles.contactCard} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>📍 Address:</span>
                    <span>{data.contact?.address || 'Gonagodalla road, Pelwatte, Buttala.'}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>📞 Phone:</span>
                    <span>
                      {data.contact?.phones?.length > 0
                        ? data.contact.phones.join(' / ')
                        : '+94 557284040'}
                    </span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>✉️ Email:</span>
                    <span>{data.contact?.email || 'info@farmersfert.com'}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>🌐 Website:</span>
                    <span>{data.contact?.website || 'www.farmersfert.com'}</span>
                  </div>
                </div>
                {!data.batchInfo.isExpired && data.application?.recommendedCrops?.length > 0 && (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>🌾 Recommended Crops</h4>
                    </div>
                    <div className={styles.cropsStack} style={{ flexWrap: 'wrap', gap: '8px' }}>
                      {data.application.recommendedCrops.map((crop, index) => (
                        <div 
                          key={index} 
                          className={styles.cropCard} 
                          style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}
                        >
                          <span className={styles.cropIcon}>🌱</span>
                          <span className={styles.cropName}>{crop}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {currentTab === 'benefits' && (
              <div className={styles.tabContent}>
                <h3 style={{ fontSize: 'clamp(16px, 4.5vw, 20px)' }}>
                  ✨ {data.composition?.title || 'Advantages'}
                </h3>
                {data.batchInfo.isExpired ? (
                  <div 
                    className={styles.warningBox} 
                    style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}
                  >
                    ⚠️ <strong>This batch has expired and should not be used</strong>
                  </div>
                ) : (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>🎯 Key Benefits</h4>
                    </div>
                    <ul className={styles.benefitsList} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                      {data.composition?.advantages?.length > 0 ? (
                        data.composition.advantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))
                      ) : (
                        <li>No advantages information available</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            )}

            {currentTab === 'safety' && (
              <div className={styles.tabContent}>
                <h3 style={{ fontSize: 'clamp(16px, 4.5vw, 20px)' }}>
                  🛡️ {data.safety?.title || 'Safety Instructions'}
                </h3>
                {data.batchInfo.isExpired ? (
                  <>
                    <div 
                      className={styles.warningBox} 
                      style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}
                    >
                      ⚠️ <strong>EXPIRED BATCH - DO NOT USE</strong>
                    </div>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>🗑️ Disposal Instructions</h4>
                    </div>
                    <ul className={styles.benefitsList} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                      <li>Do not use this expired batch</li>
                      <li>Contact local environmental authorities for disposal guidelines</li>
                      <li>Do not pour down drains or dispose in regular waste</li>
                      <li>Contact manufacturer for safe disposal procedures</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>
                        🥽 {data.safety?.ppe?.title || 'Personal Protective Equipment (PPE):'}
                      </h4>
                    </div>
                    <ul className={styles.benefitsList} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                      {data.safety?.ppe?.instructions?.length > 0 ? (
                        data.safety.ppe.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))
                      ) : (
                        <li>No PPE instructions available</li>
                      )}
                    </ul>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>
                        🧼 {data.safety?.hygiene?.title || 'Work Hygiene Practices:'}
                      </h4>
                    </div>
                    <ul className={styles.benefitsList} style={{ fontSize: 'clamp(12px, 3.5vw, 14px)' }}>
                      {data.safety?.hygiene?.instructions?.length > 0 ? (
                        data.safety.hygiene.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))
                      ) : (
                        <li>No hygiene instructions available</li>
                      )}
                    </ul>
                  </>
                )}

                <div style={{ marginTop: 'clamp(16px, 5vw, 24px)' }}>
                  <div className={styles.sectionHeader}>
                    <h4 style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>📋 Available Documents</h4>
                  </div>
                  
                  <SmartDownloadButton 
                    docPath={data.certifications?.qualityStandards}
                    filename="Quality-Certifications"
                    type="documents"
                    label="Quality Standard Certifications"
                  />

                  <SmartDownloadButton 
                    docPath={data.nfsApproval}
                    filename="NFS-Marketing-Approval"
                    type="documents"
                    label="NFS Marketing Approval"
                  />

                  {!isDocumentAvailable(data.certifications?.qualityStandards) && 
                   !isDocumentAvailable(data.nfsApproval) && (
                    <div style={{
                      padding: 'clamp(16px, 5vw, 20px)',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      textAlign: 'center',
                      color: '#6c757d',
                      fontSize: 'clamp(12px, 3.5vw, 14px)'
                    }}>
                      <div style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: '8px' }}>📄</div>
                      <div>No additional documents are available for download at this time.</div>
                      <div style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', marginTop: '4px' }}>
                        This product meets all required quality standards and certifications.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .${styles.container} {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(16px, 5vw, 24px);
        }
        .${styles.productImages} {
          width: 100%;
          margin-bottom: clamp(16px, 5vw, 24px);
        }
        .${styles.mainImage} {
          width: 100%;
          max-height: 400px;
          overflow: hidden;
        }
        .${styles.productInfo} {
          width: 100%;
          margin-bottom: clamp(16px, 5vw, 24px);
        }
        .${styles.productDescription} {
          width: 100%;
        }
        .${styles.tabs} {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: clamp(12px, 4vw, 16px);
        }
        .${styles.tab} {
          flex: 1 1 auto;
          min-width: 80px;
          text-align: center;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .${styles.container} {
            padding: 12px;
          }
          .${styles.mainImage} {
            max-height: 300px;
          }
          .${styles.tab} {
            min-width: 70px;
            padding: 6px 12px;
          }
        }
        @media (min-width: 601px) and (max-width: 1024px) {
          .${styles.container} {
            padding: 16px;
          }
          .${styles.mainImage} {
            max-height: 350px;
          }
        }
      `}</style>
    </div>
  );
}
