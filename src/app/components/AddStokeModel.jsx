"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

const AddStockModal = ({ isOpen, onClose, selectedProduct, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
  });

  // Reset form with default dates
  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const twoYearsLater = new Date();
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
    const defaultExpiryDate = twoYearsLater.toISOString().split('T')[0];
    setFormData({
      batchNumber: '',
      manufacturingDate: today,
      expiryDate: defaultExpiryDate,
    });
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
        resetForm();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting]);

  const handleCloseModal = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
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

    if (!formData.batchNumber) {
      toast.error('Please enter batch number');
      return;
    }

    if (!selectedProduct) {
      toast.error('No product selected');
      return;
    }

    if (!formData.manufacturingDate) {
      toast.error('Please enter manufacturing date');
      return;
    }

    if (!formData.expiryDate) {
      toast.error('Please enter expiry date');
      return;
    }

    const manufacturingDate = new Date(formData.manufacturingDate);
    const expiryDate = new Date(formData.expiryDate);
    if (manufacturingDate >= expiryDate) {
      toast.error('Expiry date must be after manufacturing date');
      return;
    }

    setIsSubmitting(true);

    try {
      const batchData = {
        productId: selectedProduct.productId,
        number: formData.batchNumber,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
      };

      const response = await api.createBatch(batchData);

      if (response.data.success) {
        toast.success(`Batch "${formData.batchNumber}" added successfully to ${selectedProduct.name}! 🎉`);
        handleCloseModal();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Add batch error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add batch';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={handleCloseModal}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm">
                  📦
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add New Batch</h3>
                  <p className="text-green-100 text-sm">For {selectedProduct?.name || 'Selected Product'}</p>
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
              {/* Selected Product Info */}
              {selectedProduct && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">{selectedProduct.name}</h4>
                      <p className="text-sm text-green-700">{selectedProduct.shortDescription || 'No description available'}</p>
                      <p className="text-xs text-green-600">Product ID: {selectedProduct.productId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Batch Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  Batch Details
                </h4>
                <p className="text-blue-700 text-sm mb-4">Enter the details for the new batch</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Batch Number *
                    </label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={formData.batchNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                      placeholder="e.g., FET/FP/000049"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Manufacturing Date *
                      </label>
                      <input
                        type="date"
                        name="manufacturingDate"
                        value={formData.manufacturingDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 text-xl">💡</span>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Important Notice</h4>
                    <p className="text-yellow-700 text-sm">
                      Ensure all batch information is accurate for tracking and quality control.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.batchNumber || isSubmitting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add Batch
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

export default AddStockModal;