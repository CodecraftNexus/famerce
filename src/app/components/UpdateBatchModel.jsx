"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.farmersferts.com';

const UpdateBatchModal = ({ isOpen, onClose, batch, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    manufacturingDate: '',
    expiryDate: '',
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && batch) {
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        number: batch.number || '',
        manufacturingDate: formatDate(batch.manufacturingDate),
        expiryDate: formatDate(batch.expiryDate),
      });
    }
  }, [isOpen, batch]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  const handleCloseModal = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!API_URL) {
      toast.error('API URL is not configured. Please contact support.');
      return;
    }

    if (!formData.number) {
      toast.error('Batch number is required');
      return;
    }

    if (!batch) {
      toast.error('No batch selected for update');
      return;
    }

    if (formData.manufacturingDate && formData.expiryDate) {
      const manufacturingDate = new Date(formData.manufacturingDate);
      const expiryDate = new Date(formData.expiryDate);
      if (manufacturingDate >= expiryDate) {
        toast.error('Expiry date must be after manufacturing date');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const batchData = {
        number: formData.number,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
      };

      const response = await axios.put(`${API_URL}/api/batches/${batch.batchId}`, batchData, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(`Batch "${formData.number}" updated successfully! 🎉`);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Update batch error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update batch';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm text-blue-600">
                  ✏️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Update Batch Information</h3>
                  <p className="text-blue-100 text-sm">Modify batch details for {batch.number}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Batch Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Batch: {batch.number}</h4>
                    <p className="text-sm text-blue-700">Batch ID: {batch.batchId}</p>
                    <p className="text-xs text-blue-600">Created: {new Date(batch.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 text-lg">ℹ️</span>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Update Information</h4>
                      <p className="text-blue-700 text-sm">Modify the batch number and dates below. Changes will be saved immediately.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Batch Number *
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm"
                      placeholder="e.g., FET/FP/000049"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Manufacturing Date
                      </label>
                      <input
                        type="date"
                        name="manufacturingDate"
                        value={formData.manufacturingDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.number || isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Batch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBatchModal;