'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../../styles/view.module.css';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.farmersferts.com';
const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';

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
      filename = filename.split('🗂️ filename = ')[1] || filename;
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
      let filename = extractFileName(cleanPath, index);
      
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
      console.log('Filename error:', error);
      const suffix = index > 0 ? `_${index + 1}` : '';
      return `${defaultName}${suffix}.pdf`;
    }
  };

  const showDownloadNotification = (message, type = 'info', duration = 6000) => {
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

  const downloadSingleFile = async (filePath, defaultFilename, index = 0) => {
    const filename = getFilenameFromPath(filePath, defaultFilename, index);
    console.log(`⬇️ Downloading file ${index + 1}:`, filename);
    
    try {
      const encodedPath = encodeURIComponent(filePath);
      const downloadUrl = `${FLASK_API_URL}/download/${encodedPath}`;
      
      console.log('🔗 Using download URL:', downloadUrl);
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream, application/pdf, */*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      return { success: true, filename };
    } catch (error) {
      console.error('❌ Download failed:', error);
      return { success: false, error: error.message || 'All download methods failed' };
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
        padding: '16px',
        marginBottom: '16px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          cursor: fileCount > 1 ? 'pointer' : 'default',
          gap: '8px'
        }} onClick={() => fileCount > 1 && toggleSection(label)}>
          <div style={{
            flex: '1 1 auto',
            minWidth: '200px'
          }}>
            <div style={{
              fontWeight: '600',
              color: '#212529',
              marginBottom: '4px',
              fontSize: '16px'
            }}>
              {label}
              {fileCount > 1 && (
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
              {fileCount > 1 
                ? `Click to ${isExpanded ? 'collapse' : 'expand'} and view ${fileCount} documents`
                : 'Click to download document to your device'
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
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: downloadLoading[validPaths[0]] ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: downloadLoading[validPaths[0]] ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                flexShrink: 0,
                minWidth: '120px'
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
                  <span>📚</span>
                  <span>Download</span>
                </>
              )}
            </button>
          )}
          {fileCount > 1 && (
            <span style={{
              fontSize: '20px',
              color: '#2d5a27',
              flexShrink: 0
            }}>
              {isExpanded ? '▲' : '▼'}
            </span>
          )}
        </div>
        {fileCount > 1 && isExpanded && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            {validPaths.map((path, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                padding: '10px 0',
                borderBottom: index < validPaths.length - 1 ? '1px solid #eee' : 'none',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: '1 1 auto',
                  gap: '8px',
                  minWidth: '200px'
                }}>
                  <span style={{ color: '#2d5a27', fontSize: '18px' }}>
                    {getFileExtensionFromPath(path) === 'pdf' ? '📜' : '📎'}
                  </span>
                  <span style={{ fontSize: '14px', color: '#212529', wordBreak: 'break-word' }}>
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
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: downloadLoading[path] ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    minWidth: '100px'
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
      </div>
    );
  };

  const IngredientsTable = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          textAlign: 'center',
          color: '#6c757d',
          width: '100%'
        }}>
          No ingredients information available
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '10px',
        overflowX: 'auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%'
      }}>
        <div style={{
          backgroundColor: '#2d5a27',
          color: '#fff',
          padding: '12px 16px',
          fontWeight: '600',
          fontSize: 'clamp(14px, 16px, 2vw)'
        }}>
          🧪 Ingredients Composition
        </div>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '300px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6'
            }}>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontWeight: '600',
                color: '#495057',
                borderRight: '1px solid #dee2e6',
                fontSize: 'clamp(13px, 14px, 1.8vw)'
              }}>
                Ingredient Name
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'center',
                fontWeight: '600',
                color: '#495057',
                width: '120px',
                fontSize: 'clamp(13px, 14px, 1.8vw)'
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
                  padding: '12px',
                  borderRight: '1px solid #dee2e6',
                  color: '#212529',
                  fontSize: 'clamp(13px, 14px, 1.8vw)'
                }}>
                  <span style={{
                    fontWeight: '500'
                  }}>
                    {ingredient.name}
                  </span>
                </td>
                <td style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: '#495057',
                  fontSize: 'clamp(12px, 13px, 1.6vw)'
                }}>
                  <span style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: 'clamp(12px, 13px, 14px)'
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
            <div className="mt-4 flex gap-4 justify-center flex-wrap">
              <button
                onClick={loadProductData}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
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
          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Go Back
            </button>
            <button
              onClick={loadProductData}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
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
    <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <header className={styles.header}>
        <div className={styles.headerContent} style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div className={styles.headerInfo} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div className={styles.logo}>
              <Image
                src="/LOGO.png"
                width={200}
                height={160}
                alt="Farmer's Fertilizer Logo"
                priority
                style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
              />
            </div>
            <div className={styles.headerDetails} style={{ flex: '1', minWidth: '200px' }}>
              <div className={styles.headerContact} style={{
                fontSize: 'clamp(12px, 14px, 1.5vw)',
                wordBreak: 'break-word'
              }}>
                Telephone No:{' '}
                {data.contact?.phones?.length > 0 ? data.contact.phones.join(' / ') : '+94 557284040'} | Web:{' '}
                {data.contact?.website || 'www.farmersfert.com'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container} style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div className={styles.productImages} style={{ width: '100%' }}>
          <div className={styles.mainImage} style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            borderRadius: '12px'
          }}>
            <div className={styles.mainImageContent}>
              {data.imagePath ? (
                <div className="relative w-full h-full">
                  <img
                    src={getImageUrl(data.imagePath)}
                    alt={data.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                    onError={(e) => {
                      console.log('Image load error, showing fallback');
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
                  />
                  <div style={{
                    display: 'none',
                    width: '100%',
                    height: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>🧪</div>
                    <div style={{
                      fontSize: 'clamp(14px, 16px, 1vw)',
                      marginTop: '1rem',
                      color: '#2d5a27'
                    }}>{data.name}</div>
                  </div>
                  {data.batchInfo.isExpired && (
                    <div className={`${styles.expiredBadge} absolute top-4 right-4`} style={{
                      fontSize: 'clamp(12px, 14px, 1.5vw)'
                    }}>
                      EXPIRED
                    </div>
                  )}
                  {expiryStatus && expiryStatus.status === 'expiring' && (
                    <div className={`${styles.expiredBadge} bg-orange-600 absolute top-4 right-4`} style={{
                      fontSize: 'clamp(12px, 14px, 1.5vw)'
                    }}>
                      EXPIRED SOON
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>🧪</div>
                  <div style={{
                    fontSize: 'clamp(14px, 16px, 1vw)',
                    marginTop: '1rem',
                    color: '#2d5a27'
                  }}>{data.name}</div>
                  {data.batchInfo.isExpired && (
                    <div className={styles.expiredBadge} style={{
                      fontSize: 'clamp(12px, 14px, 1.5vw)'
                    }}>
                      EXPIRED
                    </div>
                  )}
                  {expiryStatus && expiryStatus.status === 'expiring' && (
                    <div className={`${styles.expiredBadge} bg-orange-600`} style={{
                      fontSize: 'clamp(12px, 14px, 1.5vw)'
                    }}>
                      EXPIRING SOON
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.productInfo} style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h1 className={styles.productTitle} style={{
              fontSize: 'clamp(20px, 28px, 3vw)',
              wordBreak: 'break-word'
            }}>{data.name}</h1>
            {data.shortDescription && (
              <p className={styles.productSubtitle} style={{
                fontSize: 'clamp(14px, 16px, 1.8vw)'
              }}>{data.shortDescription}</p>
            )}
            {data.fullDescription && data.fullDescription !== data.shortDescription && (
              <div className={styles.productDescription}>
                <p style={{ fontSize: 'clamp(13px, 15px, 1.6vw)' }}>{data.fullDescription}</p>
              </div>
            )}
          </div>

          <div className={styles.stockDetails} style={{
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #dee2e6'
          }}>
            <h3 className={styles.sectionTitle} style={{
              fontSize: 'clamp(16px, 18px, 2vw)',
              marginBottom: '12px'
            }}>Product Information</h3>
            <div className={styles.detailRow} style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span className={styles.detailLabel} style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                Batch Number:
              </span>
              <span className={styles.batchHighlight} style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                {data.batchInfo.number}
              </span>
            </div>
            {data.batchInfo.sampleNo && (
              <div className={styles.detailRow} style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span className={styles.detailLabel} style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                  Sample Number:
                </span>
                <span style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>{data.batchInfo.sampleNo}</span>
              </div>
            )}
            <div className={styles.detailRow} style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span className={styles.detailLabel} style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                Manufacturing Date:
              </span>
              <span style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                {formatDate(data.batchInfo.manufacturingDate)}
              </span>
            </div>
            <div className={styles.detailRow} style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span className={styles.detailLabel} style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                Expiry Date:
              </span>
              <span className={data.batchInfo.isExpired ? styles.expired : styles.valid} style={{
                fontSize: 'clamp(13px, 14px, 1.5vw)'
              }}>
                {formatDate(data.batchInfo.expiryDate)}
              </span>
            </div>
            {data.batchInfo.availablePackageSizes && data.batchInfo.availablePackageSizes.length > 0 && (
              <div className={styles.detailRow} style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span className={styles.detailLabel} style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                  Available Package Sizes:
                </span>
                <span style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                  {data.batchInfo.availablePackageSizes.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.productDescription} style={{ width: '100%' }}>
          <div className={styles.descriptionContent}>
            <div className={styles.tabs} style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {['composition', 'application', 'benefits', 'safety'].map((tab) => (
                <div
                  key={tab}
                  className={`${styles.tab} ${currentTab === tab ? styles.active : ''}`}
                  onClick={() => changeTab(tab)}
                  style={{
                    padding: '10px 16px',
                    fontSize: 'clamp(13px, 14px, 1.5vw)',
                    flex: '1 1 auto',
                    minWidth: '100px',
                    textAlign: 'center'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>

            {currentTab === 'composition' && (
              <div className={styles.tabContent} style={{ padding: '16px 0' }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 18px, 2vw)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🧪 {data.composition?.title || 'Composition'}
                </h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <IngredientsTable ingredients={data.composition?.ingredients} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <SmartDownloadButton 
                    docPath={data.msds}
                    filename="MSDS"
                    type="documents"
                    label="Material Safety Data Sheet (MSDS)"
                  />
                </div>

                {data.batchInfo.isExpired && (
                  <div className={styles.warningBox} style={{
                    fontSize: 'clamp(13px, 14px, 1.5vw)'
                  }}>
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
                      fontSize: 'clamp(13px, 14px, 1.5vw)'
                    }}
                  >
                    ⚠️ <strong>NOTICE:</strong> This batch is expiring soon. Use before{' '}
                    {formatDate(data.batchInfo.expiryDate)}.
                  </div>
                )}
              </div>
            )}

            {currentTab === 'application' && (
              <div className={styles.tabContent} style={{ padding: '16px 0' }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 18px, 2vw)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📋 {data.application?.title || 'Application Instructions'}
                </h3>
                {data.batchInfo.isExpired ? (
                  <div className={styles.warningBox} style={{
                    fontSize: 'clamp(13px, 14px, 1.5vw)'
                  }}>
                    ⚠️ <strong>WARNING:</strong> This batch has expired and should not be used for agricultural
                    purposes. Please dispose properly according to environmental regulations.
                  </div>
                ) : (
                  <div className={styles.instructionsSection}>
                    {data.application?.instructions?.length > 0 ? (
                      <ul className={styles.benefitsList} style={{
                        fontSize: 'clamp(13px, 14px, 1.5vw)'
                      }}>
                        {data.application.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: 'clamp(13px, 14px, 1.5vw)' }}>
                        No application instructions available.
                      </p>
                    )}
                  </div>
                )}
                <div className={styles.sectionHeader}>
                  <h4 style={{ fontSize: 'clamp(15px, 16px, 1.8vw)' }}>📞 Contact Information</h4>
                </div>
                <div className={styles.contactCard} style={{
                  padding: '16px',
                  fontSize: 'clamp(13px, 14px, 1.5vw)'
                }}>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>📍 Address:</span>
                    <span>{data.contact?.name || 'Gonagodalla road, Pelwatta, Buttala.'}</span>
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
                      <h4 style={{ fontSize: 'clamp(15px, 16px, 1.8vw)' }}>🌾 Recommended Crops</h4>
                    </div>
                    <div className={styles.cropsStack} style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {data.application.recommendedCrops.map((crop, index) => (
                        <div key={index} className={styles.cropCard} style={{
                          fontSize: 'clamp(13px, 14px, 1.5vw)'
                        }}>
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
              <div className={styles.tabContent} style={{ padding: '16px 0' }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 18px, 2vw)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✨ {data.composition?.title || 'Advantages'}
                </h3>
                {data.batchInfo.isExpired ? (
                  <div className={styles.warningBox} style={{
                    fontSize: 'clamp(13px, 14px, 1.5vw)'
                  }}>
                    ⚠️ This batch has expired and should not be used
                  </div>
                ) : (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(15px, 16px, 1.8vw)' }}>🎯 Key Benefits</h4>
                    </div>
                    <ul className={styles.benefitsList} style={{
                      fontSize: 'clamp(13px, 14px, 1.5vw)'
                    }}>
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
              <div className={styles.tabContent} style={{ padding: '16px 0' }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 18px, 2vw)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🛡️ {data.safety?.title || 'Safety Instructions'}
                </h3>
                {data.batchInfo.isExpired ? (
                  <>
                    <div className={styles.warningBox} style={{
                      fontSize: 'clamp(13px, 14px, 1.5vw)'
                    }}>
                      ❌ <strong>EXPIRED BATCH - DO NOT USE</strong>
                    </div>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(15px, 16px, 1.8vw)' }}>🗑️ Disposal Instructions</h4>
                    </div>
                    <ul className={styles.benefitsList} style={{
                      fontSize: 'clamp(13px, 14px, 1.5vw)'
                    }}>
                      <li>Do not use this expired batch</li>
                      <li>Contact local environmental authorities for disposal guidelines</li>
                      <li>Do not pour down drains or dispose in regular waste</li>
                      <li>Contact manufacturer for safe disposal procedures</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(15px, 16px, 1.8vw)' }}>
                        🥽 {data.safety?.ppe?.title || 'Personal Protective Equipment (PPE):'}
                      </h4>
                    </div>
                    <ul className={styles.benefitsList} style={{
                      fontSize: 'clamp(13px, 14px, 1.5vw)'
                    }}>
                      {data.safety?.ppe?.instructions?.length > 0 ? (
                        data.safety.ppe.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))
                      ) : (
                        <li>No PPE instructions available</li>
                      )}
                    </ul>
                    <div className={styles.sectionHeader}>
                      <h4 style={{ fontSize: 'clamp(15px, 16px, 1.8vw)' }}>
                        🧼 {data.safety?.hygiene?.title || 'Work Hygiene Practices:'}
                      </h4>
                    </div>
                    <ul className={styles.benefitsList} style={{
                      fontSize: 'clamp(13px, 14px, 1.5vw)'
                    }}>
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

                <div style={{ marginTop: '24px' }}>
                  <div className={styles.sectionHeader}>
                    <h4 style={{ fontSize: 'clamp(16px, 18px, 2vw)' }}>📋 Available Documents</h4>
                  </div>
                  
                  <SmartDownloadButton 
                    docPath={data.certifications?.qualityStandards}
                    filename="Quality-Certifications"
                    type="documents"
                    label="Quality Standard Certifications"
                  />

                  <SmartDownloadButton 
                    docPath={data.npsApproval}
                    filename="NPS-Marketing-Approval"
                    type="documents"
                    label="NPS Marketing Approval"
                  />

                  {!isDocumentAvailable(data.certifications?.qualityStandards) && 
                   !isDocumentAvailable(data.npsApproval) && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '10px',
                      border: '1px solid #dee2e6',
                      textAlign: 'center',
                      color: '#6c757d',
                      fontSize: 'clamp(13px, 14px, 1.5vw)'
                    }}>
                      <div style={{ fontSize: 'clamp(1.5rem, 2rem, 2.5vw)', marginBottom: '8px' }}>📄</div>
                      <div>No additional documents are available for download at this time.</div>
                      <div style={{ fontSize: 'clamp(12px, 13px, 1.4vw)', marginTop: '4px' }}>
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
