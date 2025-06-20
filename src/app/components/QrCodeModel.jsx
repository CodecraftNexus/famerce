"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { downloadQRCode } from '../utils/qrUtils';

const QRCodeModal = ({ isOpen, onClose, batch, productName }) => {
  const [qrDataURL, setQrDataURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && batch) {
      generateQRCode();
    }
  }, [isOpen, batch]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const qrData = `${window.location.origin}/view/${batch.batchId}`;
      const QRCode = (await import('qrcode')).default;
      const dataURL = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrDataURL(dataURL);
    } catch (error) {
      console.error('QR Code generation error:', error);
      generateSimpleQR();
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimpleQR = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Create border
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, 20);
    ctx.fillRect(0, 0, 20, size);
    ctx.fillRect(size - 20, 0, 20, size);
    ctx.fillRect(0, size - 20, size, 20);

    // Add text
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', size / 2, size / 2 - 20);
    ctx.fillText(batch.number, size / 2, size / 2);
    ctx.fillText(productName, size / 2, size / 2 + 20);

    setQrDataURL(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    if (qrDataURL) {
      const filename = `QR_${productName}_${batch.number}.png`;
      downloadQRCode(qrDataURL, filename);
      toast.success('QR code downloaded successfully!');
    }
  };

  const handleCopyURL = () => {
    const url = `${window.location.origin}/view/${batch.batchId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard!');
    });
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={handleCloseModal}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl text-purple-600 backdrop-blur-sm">
                  📱
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">QR Code Generator</h3>
                  <p className="text-purple-200 text-sm">For {productName}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-200"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Product Info */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">{productName}</h4>
                  <p className="text-sm text-purple-700">Batch: {batch.number}</p>
                  <p className="text-xs text-purple-600">ID: {batch.batchId}</p>
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-md">
                {isLoading ? (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Generating...</p>
                    </div>
                  </div>
                ) : (
                  <img src={qrDataURL} alt="QR Code" className="w-48 h-48 rounded-lg" />
                )}
              </div>
            </div>

            {/* URL Display */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-gray-500 text-lg">🔗</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 mb-1">Product View URL</h4>
                  <p className="text-sm text-gray-600 break-all font-mono bg-white p-2 rounded border">
                    {`${window.location.origin}/view/${batch.batchId}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-lg">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">How to Use</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Scan the QR code with a smartphone camera</li>
                    <li>• Copy the URL to share directly</li>
                    <li>• Download the QR code for printing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                disabled={isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
              <button
                onClick={handleCopyURL}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                disabled={isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy URL
              </button>
              <button
                onClick={handleDownload}
                disabled={isLoading || !qrDataURL}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;