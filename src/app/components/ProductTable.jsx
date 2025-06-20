"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProductTable = ({ selectedProduct, onRefresh, modalHandlers }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log('ProductTable - selectedProduct:', selectedProduct);
        console.log('ProductTable - batches:', selectedProduct?.batches);
        if (selectedProduct?.batches?.length > 0) {
            console.log('ProductTable - first batch sample:', selectedProduct.batches[0]);
        }
    }, [selectedProduct]);

    // Auto scroll page to bottom when new data is added
    useEffect(() => {
        if (selectedProduct?.batches?.length > 0) {
            setTimeout(() => {
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                });
            }, 200);
        }
    }, [selectedProduct?.batches?.length]);

    const handleUpdate = (batch) => {
        if (modalHandlers?.onUpdateBatch) {
            modalHandlers.onUpdateBatch(batch);
        }
    };

    const handleDelete = (batch) => {
        if (modalHandlers?.onDeleteBatch) {
            modalHandlers.onDeleteBatch(batch.batchId);
        }
    };

    const handleViewDetails = (batch) => {
        if (!batch || !batch.batchId) {
            toast.error('Invalid batch information');
            console.error('No valid batch data:', batch);
            return;
        }
        
        const detailUrl = `/view/${batch.batchId}`;
        console.log('Opening view URL:', detailUrl);
        window.open(detailUrl, '_blank');
    };

    const handleViewQRCode = (batch) => {
        if (modalHandlers?.onViewQRCode) {
            modalHandlers.onViewQRCode(batch, selectedProduct?.name);
        }
    };

    const getStatusBadge = (batch) => {
        if (batch.isExpired) {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="px-3 py-1.5 text-sm font-semibold bg-red-100 text-red-800 rounded-full border border-red-200">
                        Expired
                    </span>
                </div>
            );
        }
        
        const expiryDate = new Date(batch.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30) {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="px-3 py-1.5 text-sm font-semibold bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                        Expires in {daysUntilExpiry} days
                    </span>
                </div>
            );
        }
        
        return (
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="px-3 py-1.5 text-sm font-semibold bg-green-100 text-green-800 rounded-full border border-green-200">
                    Active
                </span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!selectedProduct) {
        console.log('ProductTable - No product selected');
        return (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
                <div className="max-w-md mx-auto">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-sm">📦</span>
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">No Product Selected</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Please select a product from the dropdown above to view its batch information and manage inventory
                    </p>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-blue-800 mb-2">Getting Started:</h4>
                                <ul className="text-blue-700 space-y-1 text-sm">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        Use the dropdown above to select a fertilizer product
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        View detailed batch information and tracking data
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        Manage stock levels and expiry dates
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        Generate QR codes for product identification
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Batch Management</h3>
                        <p className="text-blue-100 font-medium">{selectedProduct.name}</p>
                        <p className="text-blue-200 text-sm">Product ID: {selectedProduct.productId}</p>
                    </div>
                    <div className="bg-white/20 rounded-2xl px-4 py-2 backdrop-blur-sm">
                        <div className="text-white text-sm font-medium">
                            {selectedProduct.batches?.length || 0} Batches
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                                <th className="text-left p-6 font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                                        </svg>
                                        Batch Information
                                    </div>
                                </th>
                                <th className="text-left p-6 font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Status
                                    </div>
                                </th>
                                <th className="text-left p-6 font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                        </svg>
                                        Actions
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedProduct.batches?.length > 0 ? (
                                selectedProduct.batches.map((batch, index) => (
                                    <tr key={batch.batchId} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${batch.isExpired ? 'opacity-75' : ''}`}>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-lg">#{index + 1}</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">{batch.number}</div>
                                                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-1 font-medium">
                                                        ID: {batch.batchId}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Created: {formatDate(batch.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-2">
                                                {getStatusBadge(batch)}
                                                {batch.manufacturingDate && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Mfg:</span> {formatDate(batch.manufacturingDate)}
                                                    </div>
                                                )}
                                                {batch.expiryDate && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Exp:</span> {formatDate(batch.expiryDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-2">
                                                <button 
                                                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    onClick={() => handleUpdate(batch)}
                                                    title="Update batch information"
                                                    disabled={isLoading}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Update
                                                </button>
                                                
                                                <button 
                                                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    onClick={() => handleDelete(batch)}
                                                    title="Delete batch"
                                                    disabled={isLoading}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                                
                                                <button 
                                                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    onClick={() => handleViewDetails(batch)}
                                                    title="View detailed information"
                                                    disabled={isLoading || !batch.batchId}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                                
                                                <button 
                                                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    onClick={() => handleViewQRCode(batch)}
                                                    title="Generate QR Code"
                                                    disabled={isLoading}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                    QR
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-16">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-700 mb-2">No Batches Found</h4>
                                                <p className="text-gray-500 mb-6">This product doesn't have any batches yet.</p>
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 inline-block">
                                                    <div className="flex items-center gap-2 text-blue-700">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Click "Add New Batch" to get started</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden">
                {selectedProduct.batches?.length > 0 ? (
                    <div className="p-4 space-y-4">
                        {selectedProduct.batches.map((batch, index) => (
                            <div key={batch.batchId} className={`bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg ${batch.isExpired ? 'opacity-75' : ''}`}>
                                {/* Batch Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-blue-600 font-bold text-xl">#{index + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 text-lg truncate">{batch.number}</div>
                                        <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block mt-1 font-medium">
                                            ID: {batch.batchId}
                                        </div>
                                        <div className="mt-2">
                                            {getStatusBadge(batch)}
                                        </div>
                                    </div>
                                </div>

                                {/* Batch Dates */}
                                {(batch.manufacturingDate || batch.expiryDate) && (
                                    <div className="bg-white/80 rounded-xl p-4 mb-4 border border-blue-100">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {batch.manufacturingDate && (
                                                <div>
                                                    <span className="text-gray-600 font-medium">Manufacturing:</span>
                                                    <div className="text-gray-800 font-semibold">{formatDate(batch.manufacturingDate)}</div>
                                                </div>
                                            )}
                                            {batch.expiryDate && (
                                                <div>
                                                    <span className="text-gray-600 font-medium">Expiry:</span>
                                                    <div className="text-gray-800 font-semibold">{formatDate(batch.expiryDate)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                                        onClick={() => handleUpdate(batch)}
                                        title="Update batch information"
                                        disabled={isLoading}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Update
                                    </button>
                                    
                                    <button 
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 border border-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                                        onClick={() => handleDelete(batch)}
                                        title="Delete batch"
                                        disabled={isLoading}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                    
                                    <button 
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 border border-green-600 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                                        onClick={() => handleViewDetails(batch)}
                                        title="View detailed information"
                                        disabled={isLoading || !batch.batchId}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View
                                    </button>
                                    
                                    <button 
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 border border-purple-600 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                        onClick={() => handleViewQRCode(batch)}
                                        title="Generate QR Code"
                                        disabled={isLoading}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        QR
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-700 mb-2">No Batches Found</h4>
                                <p className="text-gray-500 mb-4 text-sm">This product doesn't have any batches yet.</p>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 inline-block">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-xs font-medium">Click "Add New Batch" to get started</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTable;