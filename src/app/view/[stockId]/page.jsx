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
  const [downloadLoading, setDownloadLoading] = useState(false);

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

  // Enhanced image URL handler
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    console.log('🖼️ Processing image path:', imagePath);
    
    const cleanPath = imagePath.split(',')[0].trim();
    
    // If it's already a full Cloudinary URL, use it directly
    if (cleanPath.startsWith('https://res.cloudinary.com/')) {
      return cleanPath;
    }
    
    // If it's a full HTTP/HTTPS URL
    if (cleanPath.startsWith('http')) {
      return cleanPath;
    }
    
    // For relative paths, use backend proxy
    if (cleanPath.startsWith('/')) {
      return `${API_URL}${cleanPath}`;
    }
    
    // Use backend image serving route
    return `${API_URL}/api/images/${encodeURIComponent(cleanPath)}`;
  };

  // Enhanced file path processing to handle multiple files
  const processFilePaths = (docPath) => {
    if (!docPath || typeof docPath !== 'string') return [];
    
    // Split by comma to handle multiple files
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

  // Check if document is uploaded and available for download
  const isDocumentAvailable = (docPath) => {
    const validPaths = processFilePaths(docPath);
    return validPaths.length > 0;
  };

  // Extract filename from various path formats
  const extractFileName = (path, index = 0) => {
    if (!path) return '';
    
    const cleanPath = path.trim();
    
    // If it's a Cloudinary URL, extract filename
    if (cleanPath.startsWith('https://res.cloudinary.com/')) {
      const urlParts = cleanPath.split('/');
      let filename = urlParts[urlParts.length - 1];
      // Remove any query parameters
      filename = filename.split('?')[0];
      return filename;
    }
    
    // If it's a path with slashes, get the last part
    if (cleanPath.includes('/')) {
      const segments = cleanPath.split('/');
      let filename = segments[segments.length - 1];
      // Remove any query parameters
      filename = filename.split('?')[0];
      return filename;
    }
    
    return cleanPath;
  };

  // Helper function to get file extension
  const getFileExtensionFromPath = (path) => {
    const pathLower = path.toLowerCase();
    if (pathLower.includes('.pdf')) return 'pdf';
    if (pathLower.includes('.doc')) return 'doc';
    if (pathLower.includes('.docx')) return 'docx';
    if (pathLower.includes('.jpg') || pathLower.includes('.jpeg')) return 'jpg';
    if (pathLower.includes('.png')) return 'png';
    return 'pdf';
  };

  // Helper function to extract filename from URL
  const getFilenameFromPath = (path, defaultName = 'document', index = 0) => {
    try {
      const cleanPath = path.trim();
      
      // Extract filename from path
      let filename = extractFileName(cleanPath);
      
      if (filename && filename.includes('.')) {
        // If we have multiple files, add index to filename
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

  // Enhanced download notification system
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
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
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

  // Force download using alternative methods
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

  // Alternative download method using hidden iframe
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

  // Enhanced download handler for single file
  const downloadSingleFile = async (filePath, defaultFilename, index = 0) => {
    console.log(`⬇️ Downloading file ${index + 1}:`, filePath);
    
    try {
      const filename = getFilenameFromPath(filePath, defaultFilename, index);
      
      // Method 1: Use the new enhanced download route from backend
      const encodedPath = encodeURIComponent(filePath);
      const downloadUrl = `${API_URL}/api/download/${encodedPath}`;
      
      console.log('🔗 Using download URL:', downloadUrl);
      
      // Try downloading using fetch to handle errors properly
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
        
        // Get the blob data
        const blob = await response.blob();
        
        // Get filename from response headers or use provided filename
        let downloadFilename = filename;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            downloadFilename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        // Fallback filename generation
        if (!downloadFilename || downloadFilename === 'undefined') {
          const fileExtension = getFileExtensionFromPath(filePath) || 'pdf';
          const suffix = index > 0 ? `_${index + 1}` : '';
          downloadFilename = `${defaultFilename}${suffix}.${fileExtension}`;
        }
        
        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        return { success: true, filename: downloadFilename };
        
      } catch (fetchError) {
        console.error('❌ Fetch download failed:', fetchError);
        
        // Method 2: Fallback to direct window.open with download parameter
        const fallbackUrl = `${API_URL}/api/documents/${encodedPath}?download=true`;
        console.log('🔄 Trying fallback download URL:', fallbackUrl);
        
        // Try force download with fallback URL
        const forceDownloadSuccess = await forceDownload(fallbackUrl, filename);
        
        if (forceDownloadSuccess) {
          return { success: true, filename, method: 'fallback' };
        } else {
          // Use iframe method as last resort
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
      
      // Method 3: Last resort - try the old signed URL method but force download
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
          
          // Use the server download URL if available
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
            // Use signed URL but try to force download
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

  // Enhanced download handler with proper file download functionality for multiple files
  const handleDocumentDownload = async (docPath, defaultFilename, type = 'documents') => {
    const validPaths = processFilePaths(docPath);
    
    if (validPaths.length === 0) {
      showDownloadNotification('No documents available for download', 'error');
      return;
    }
    
    if (downloadLoading) {
      showDownloadNotification('Another download is in progress', 'warning');
      return;
    }
    
    console.log('⬇️ Starting download for paths:', validPaths);
    
    setDownloadLoading(true);
    const loadingElement = showLoadingIndicator();
    
    try {
      let successCount = 0;
      let failCount = 0;
      const downloadedFiles = [];
      
      // Download each file
      for (let i = 0; i < validPaths.length; i++) {
        const filePath = validPaths[i];
        console.log(`📥 Processing file ${i + 1}/${validPaths.length}:`, filePath);
        
        try {
          const result = await downloadSingleFile(filePath, defaultFilename, i);
          
          if (result.success) {
            successCount++;
            downloadedFiles.push(result.filename);
            console.log(`✅ Successfully downloaded: ${result.filename}`);
          } else {
            failCount++;
            console.log(`❌ Failed to download file ${i + 1}:`, result.error);
          }
        } catch (fileError) {
          failCount++;
          console.error(`❌ Error downloading file ${i + 1}:`, fileError);
        }
        
        // Add small delay between downloads to prevent overwhelming the server
        if (i < validPaths.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Show appropriate notification based on results
      if (successCount === validPaths.length) {
        if (validPaths.length === 1) {
          showDownloadNotification(`Download completed: ${downloadedFiles[0]}`, 'success');
        } else {
          showDownloadNotification(`All ${successCount} files downloaded successfully`, 'success');
        }
      } else if (successCount > 0) {
        showDownloadNotification(
          `${successCount} of ${validPaths.length} files downloaded successfully. ${failCount} failed.`, 
          'warning'
        );
      } else {
        showDownloadNotification('All download attempts failed. Please contact support.', 'error');
      }
      
    } catch (error) {
      console.error('❌ Download process failed:', error);
      showDownloadNotification('Download process failed. Please try again later.', 'error');
    } finally {
      setDownloadLoading(false);
      hideLoadingIndicator(loadingElement);
    }
  };

  // Show loading indicator
  const showLoadingIndicator = () => {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'download-loading';
    loadingElement.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100vw; 
        height: 100vh; 
        background: rgba(0,0,0,0.5); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        z-index: 9999;
      ">
        <div style="
          background: white; 
          padding: 30px; 
          border-radius: 15px; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 300px;
        ">
          <div style="
            width: 40px; 
            height: 40px; 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #2d5a27; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 20px;
          "></div>
          <div style="font-size: 18px; margin-bottom: 10px; color: #2d5a27;">📥 Preparing Download</div>
          <div style="font-size: 14px; color: #666;">Please wait while we fetch your documents...</div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingElement);
    return loadingElement;
  };

  // Hide loading indicator
  const hideLoadingIndicator = (loadingElement) => {
    setTimeout(() => {
      if (loadingElement && loadingElement.parentNode) {
        document.body.removeChild(loadingElement);
      }
    }, 500);
  };

  // Enhanced Ingredients Table Component
  const IngredientsTable = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          textAlign: 'center',
          color: '#6c757d'
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
          padding: '12px 16px',
          fontWeight: 'bold',
          fontSize: '16px'
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
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                color: '#495057',
                borderRight: '1px solid #dee2e6'
              }}>
                Ingredient Name
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '600',
                color: '#495057',
                width: '120px'
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
                  padding: '12px 16px',
                  borderRight: '1px solid #dee2e6',
                  color: '#212529'
                }}>
                  <span style={{
                    fontWeight: '500'
                  }}>
                    {ingredient.name}
                  </span>
                </td>
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  color: '#495057'
                }}>
                  <span style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '14px'
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

  // Enhanced Smart Download Button Component with file count display
  const SmartDownloadButton = ({ docPath, filename, type, label, disabled = false }) => {
    const validPaths = processFilePaths(docPath);
    
    if (validPaths.length === 0) {
      return null;
    }

    const handleClick = async () => {
      await handleDocumentDownload(docPath, filename, type);
    };

    const fileCount = validPaths.length;
    const isMultipleFiles = fileCount > 1;

    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              fontWeight: '600',
              color: '#212529',
              marginBottom: '4px'
            }}>
              {label}
              {isMultipleFiles && (
                <span style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  fontSize: '12px',
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
              fontSize: '14px',
              color: '#6c757d'
            }}>
              {isMultipleFiles 
                ? `Click to download all ${fileCount} documents to your device`
                : 'Click to download document to your device'
              }
            </div>
          </div>
          <button 
            onClick={handleClick}
            disabled={disabled || downloadLoading}
            style={{
              backgroundColor: disabled || downloadLoading ? '#6c757d' : '#2d5a27',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: disabled || downloadLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: disabled || downloadLoading ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              if (!disabled && !downloadLoading) {
                e.target.style.backgroundColor = '#1e3f1a';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (!disabled && !downloadLoading) {
                e.target.style.backgroundColor = '#2d5a27';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            {downloadLoading ? (
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
                <span>{isMultipleFiles ? 'Download All' : 'Download'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.pageLoadingContainer}>
        <div className={styles.pageLoadingContent}>
          <div className={styles.loadingLogo}>
            <div className={styles.logoIcon}>🧪</div>
            <h2>FARMER'S FERTILIZER</h2>
          </div>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading product information...</p>
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
          <div className={styles.notFound404}>Error</div>
          <div className={styles.notFoundIcon}>⚠️</div>
          <h1 className={styles.notFoundTitle}>Unable to Load Product</h1>
          <p className={styles.notFoundMessage}>{error}</p>
          <div className={styles.notFoundHelp}>
            <h3>Try Again?</h3>
            <div className="mt-4 flex gap-4 justify-center">
              <button
                onClick={loadProductData}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
          <div className={styles.notFound404}>404</div>
          <div className={styles.notFoundIcon}>🔍</div>
          <h1 className={styles.notFoundTitle}>Product Not Found</h1>
          <p className={styles.notFoundMessage}>
            Sorry, the product batch you're looking for doesn't exist or has been moved.
          </p>
          <div className={styles.notFoundHelp}>
            <h3>Need Help?</h3>
            <p>Check your QR code or contact our support team</p>
            <div className={styles.contactInfo}>
              <span>📧 info@farmersfert.com</span>
              <span>📞 +94 557284040</span>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={loadProductData}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
              <Image src="/LOGO.png" width={250} height={200} alt="Farmer's Fertilizer Logo" priority />
            </div>
            <div className={styles.headerDetails}>
              <div className={styles.headerContact}>
                Telephone No:{' '}
                {data.contact?.phones?.length > 0 ? data.contact.phones.join(' / ') : '+94 557284040'} | Web:{' '}
                {data.contact?.website || 'www.farmersfert.com'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.productImages}>
          <div className={styles.mainImage}>
            <div className={styles.mainImageContent}>
              {data.imagePath ? (
                <div className="relative w-full h-full">
                  <img
                    src={getImageUrl(data.imagePath)}
                    alt={data.name}
                    className="w-full h-full object-cover rounded-lg"
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
                    <div style={{ fontSize: '3rem' }}>🧪</div>
                    <div style={{ fontSize: '1rem', marginTop: '1rem', color: '#2d5a27' }}>{data.name}</div>
                  </div>
                  {data.batchInfo.isExpired && (
                    <div className={`${styles.expiredBadge} absolute top-4 right-4`}>EXPIRED</div>
                  )}
                  {expiryStatus && expiryStatus.status === 'expiring' && (
                    <div className={`${styles.expiredBadge} bg-orange-500 absolute top-4 right-4`}>
                      EXPIRING SOON
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div style={{ fontSize: '3rem' }}>🧪</div>
                  <div style={{ fontSize: '1rem', marginTop: '1rem', color: '#2d5a27' }}>{data.name}</div>
                  {data.batchInfo.isExpired && <div className={styles.expiredBadge}>EXPIRED</div>}
                  {expiryStatus && expiryStatus.status === 'expiring' && (
                    <div className={`${styles.expiredBadge} bg-orange-500`}>EXPIRING SOON</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.productInfo}>
          <div>
            <h1 className={styles.productTitle}>{data.name}</h1>
            {data.shortDescription && <p className={styles.productSubtitle}>{data.shortDescription}</p>}
            {data.fullDescription && data.fullDescription !== data.shortDescription && (
              <div className={styles.productDescription}>
                <p>{data.fullDescription}</p>
              </div>
            )}
          </div>

          <div className={styles.stockDetails}>
            <h3 className={styles.sectionTitle}>Product Information</h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Batch Number:</span>
              <span className={styles.batchHighlight}>{data.batchInfo.number}</span>
            </div>
            {data.batchInfo.sampleNo && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Sample Number:</span>
                <span>{data.batchInfo.sampleNo}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Manufacturing Date:</span>
              <span>{formatDate(data.batchInfo.manufacturingDate)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Expiry Date:</span>
              <span className={data.batchInfo.isExpired ? styles.expired : styles.valid}>
                {formatDate(data.batchInfo.expiryDate)}
              </span>
            </div>
            {data.batchInfo.availablePackageSizes && data.batchInfo.availablePackageSizes.length > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Available Package Sizes:</span>
                <span>{data.batchInfo.availablePackageSizes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.productDescription}>
          <div className={styles.descriptionContent}>
            <div className={styles.tabs}>
              <div
                className={`${styles.tab} ${currentTab === 'composition' ? styles.active : ''}`}
                onClick={() => changeTab('composition')}
              >
                Composition
              </div>
              <div
                className={`${styles.tab} ${currentTab === 'application' ? styles.active : ''}`}
                onClick={() => changeTab('application')}
              >
                Application
              </div>
              <div
                className={`${styles.tab} ${currentTab === 'benefits' ? styles.active : ''}`}
                onClick={() => changeTab('benefits')}
              >
                Advantages
              </div>
              <div
                className={`${styles.tab} ${currentTab === 'safety' ? styles.active : ''}`}
                onClick={() => changeTab('safety')}
              >
                Safety Instructions
              </div>
            </div>

            {currentTab === 'composition' && (
              <div className={styles.tabContent}>
                <h3>🧪 {data.composition?.title || 'Composition'}</h3>
                
                {/* Enhanced Ingredients Table */}
                <div style={{ marginBottom: '24px' }}>
                  <IngredientsTable ingredients={data.composition?.ingredients} />
                </div>

                {/* Smart MSDS Download Button */}
                <div style={{ marginBottom: '16px' }}>
                  <SmartDownloadButton 
                    docPath={data.msds}
                    filename="MSDS"
                    type="documents"
                    label="Material Safety Data Sheet (MSDS)"
                    disabled={downloadLoading}
                  />
                </div>

                {data.batchInfo.isExpired && (
                  <div className={styles.warningBox}>
                    ⚠️ <strong>WARNING:</strong> This batch has expired and should not be used.
                  </div>
                )}
                {expiryStatus?.status === 'expiring' && (
                  <div
                    className={styles.warningBox}
                    style={{ background: '#fff3cd', borderColor: '#ffeaa7', color: '#856404' }}
                  >
                    ⚠️ <strong>NOTICE:</strong> This batch is expiring soon. Use before{' '}
                    {formatDate(data.batchInfo.expiryDate)}.
                  </div>
                )}
              </div>
            )}

            {currentTab === 'application' && (
              <div className={styles.tabContent}>
                <h3>📋 {data.application?.title || 'Application Instructions'}</h3>
                {data.batchInfo.isExpired ? (
                  <div className={styles.warningBox}>
                    ⚠️ <strong>WARNING:</strong> This batch has expired and should not be used for agricultural
                    purposes. Please dispose of properly according to environmental regulations.
                  </div>
                ) : (
                  <div className={styles.instructionsSection}>
                    {data.application?.instructions?.length > 0 ? (
                      <ul className={styles.benefitsList}>
                        {data.application.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No application instructions available.</p>
                    )}
                  </div>
                )}
                <div className={styles.sectionHeader}>
                  <h4>📞 Contact Information</h4>
                </div>
                <div className={styles.contactCard}>
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
                      <h4>🌾 Recommended Crops</h4>
                    </div>
                    <div className={styles.cropsStack}>
                      {data.application.recommendedCrops.map((crop, index) => (
                        <div key={index} className={styles.cropCard}>
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
                <h3>✨ {data.composition?.title || 'Advantages'}</h3>
                {data.batchInfo.isExpired ? (
                  <div className={styles.warningBox}>
                    ⚠️ <strong>This batch has expired and should not be used</strong>
                  </div>
                ) : (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4>🎯 Key Benefits</h4>
                    </div>
                    <ul className={styles.benefitsList}>
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
                <h3>🛡️ {data.safety?.title || 'Safety Instructions'}</h3>
                {data.batchInfo.isExpired ? (
                  <>
                    <div className={styles.warningBox}>
                      ⚠️ <strong>EXPIRED BATCH - DO NOT USE</strong>
                    </div>
                    <div className={styles.sectionHeader}>
                      <h4>🗑️ Disposal Instructions</h4>
                    </div>
                    <ul className={styles.benefitsList}>
                      <li>Do not use this expired batch</li>
                      <li>Contact local environmental authorities for disposal guidelines</li>
                      <li>Do not pour down drains or dispose in regular waste</li>
                      <li>Contact manufacturer for safe disposal procedures</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4>🥽 {data.safety?.ppe?.title || 'Personal Protective Equipment (PPE):'}</h4>
                    </div>
                    <ul className={styles.benefitsList}>
                      {data.safety?.ppe?.instructions?.length > 0 ? (
                        data.safety.ppe.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))
                      ) : (
                        <li>No PPE instructions available</li>
                      )}
                    </ul>
                    <div className={styles.sectionHeader}>
                      <h4>🧼 {data.safety?.hygiene?.title || 'Work Hygiene Practices:'}</h4>
                    </div>
                    <ul className={styles.benefitsList}>
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

                {/* Smart Download Buttons for Documents */}
                <div style={{ marginTop: '24px' }}>
                  <div className={styles.sectionHeader}>
                    <h4>📋 Available Documents</h4>
                  </div>
                  
                  {/* Quality Standards Certifications */}
                  <SmartDownloadButton 
                    docPath={data.certifications?.qualityStandards}
                    filename="Quality-Certifications"
                    type="documents"
                    label="Quality Standard Certifications"
                    disabled={downloadLoading}
                  />

                  {/* NPS Marketing Approval */}
                  <SmartDownloadButton 
                    docPath={data.npsApproval}
                    filename="NPS-Marketing-Approval"
                    type="documents"
                    label="NPS Marketing Approval"
                    disabled={downloadLoading}
                  />

                  {/* Show message if no documents available */}
                  {!isDocumentAvailable(data.certifications?.qualityStandards) && 
                   !isDocumentAvailable(data.npsApproval) && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      textAlign: 'center',
                      color: '#6c757d'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
                      <div>No additional documents are available for download at this time.</div>
                      <div style={{ fontSize: '14px', marginTop: '4px' }}>
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
    </div>
  );
}
