"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../../components/Header';
import ProductSelector from '../../components/ProductSelector';
import AddProductModal from '../../components/AddProductModal';
import UpdateProductModal from '../../components/UpdateProductModel';
import ProductTable from '../../components/ProductTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import QRCodeModal from '../../components/QrCodeModel';
import UpdateBatchModal from '../../components/UpdateBatchModel';
import { ModalProvider } from '../../components/ModelContex';
import AddStockModal from '../../components/AddStokeModel';
import { api } from '../../utils/api';

const Dashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBatches: 0,
    expiredBatches: 0,
    expiringSoon: 0
  });
  
  // Modal states
  const [updateProductModal, setUpdateProductModal] = useState({ isOpen: false, product: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, product: null });
  const [addStockModal, setAddStockModal] = useState({ isOpen: false });
  const [qrModal, setQrModal] = useState({ isOpen: false, batch: null, productName: '' });
  const [updateBatchModal, setUpdateBatchModal] = useState({ isOpen: false, batch: null });
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    confirmText: 'Confirm', 
    cancelText: 'Cancel',
    type: 'info',
    onConfirm: null 
  });

  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadProducts();
    }
  }, [isLoading]);

  const checkAuthentication = async () => {
    try {
      const response = await api.checkAuth();

      if (!response.data.authenticated) {
        router.push('/');
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Authentication check failed:', error);
      toast.error('Authentication failed');
      router.push('/');
    }
  };

  const loadProducts = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.getProducts();

      if (response.data.success) {
        setAllProducts(response.data.products);
        calculateStats(response.data.products);

        // Update selected product if it exists
        if (selectedProduct) {
          const updatedProduct = response.data.products.find(
            p => p.productId === selectedProduct.productId
          );
          if (updatedProduct) {
            setSelectedProduct(updatedProduct);
          } else {
            setSelectedProduct(null);
            toast.info('Selected product was deleted');
          }
        }
      }
    } catch (error) {
      console.error('Load products error:', error);
      toast.error('Failed to load products');
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateStats = (products) => {
    let totalProducts = products.length;
    let totalBatches = 0;
    let expiredBatches = 0;
    let expiringSoon = 0;

    const now = new Date();
    
    products.forEach(product => {
      if (product.batches) {
        totalBatches += product.batches.length;
        product.batches.forEach(batch => {
          if (batch.isExpired || (batch.expiryDate && new Date(batch.expiryDate) <= now)) {
            expiredBatches++;
          } else if (batch.expiryDate) {
            const daysUntilExpiry = Math.ceil((new Date(batch.expiryDate) - now) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 30) {
              expiringSoon++;
            }
          }
        });
      }
    });

    setStats({
      totalProducts,
      totalBatches,
      expiredBatches,
      expiringSoon
    });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  // Modal handlers
  const handleAddStock = () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }
    setAddStockModal({ isOpen: true });
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }
    setUpdateProductModal({ isOpen: true, product: selectedProduct });
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }
    setDeleteConfirmModal({
      isOpen: true,
      product: selectedProduct,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${selectedProduct.name}"?\n\nThis will also delete all ${selectedProduct.batches?.length || 0} batches associated with this product.\n\nThis action cannot be undone.`,
      confirmText: 'Delete Product',
      type: 'danger'
    });
  };

  const handleViewQRCode = (batch, productName) => {
    setQrModal({ 
      isOpen: true, 
      batch, 
      productName: productName || selectedProduct?.name || 'Unknown Product' 
    });
  };

  const handleUpdateBatch = (batch) => {
    setUpdateBatchModal({ isOpen: true, batch });
  };

  const showConfirmation = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info', onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const confirmDeleteProduct = async () => {
    const { product } = deleteConfirmModal;
    try {
      const response = await api.deleteProduct(product.productId);

      if (response.data.success) {
        toast.success('Product deleted successfully!');
        setSelectedProduct(null);
        setDeleteConfirmModal({ isOpen: false, product: null });
        loadProducts();
      }
    } catch (error) {
      console.error('Delete product error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    showConfirmation({
      title: 'Delete Batch',
      message: 'Are you sure you want to delete this batch? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await api.deleteBatch(batchId);

          if (response.data.success) {
            toast.success('Batch deleted successfully!');
            loadProducts();
          }
        } catch (error) {
          console.error('Delete batch error:', error);
          const errorMessage = error.response?.data?.message || 'Failed to delete batch';
          toast.error(errorMessage);
        }
      }
    });
  };

  const getModalHandlers = () => ({
    onViewQRCode: handleViewQRCode,
    onUpdateBatch: handleUpdateBatch,
    onDeleteBatch: handleDeleteBatch,
    onShowConfirmation: showConfirmation
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <ModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">Active products</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBatches}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">Production batches</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-orange-600 font-medium">Next 30 days</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-3xl font-bold text-red-600">{stats.expiredBatches}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-red-600 font-medium">Requires attention</span>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Product Management Dashboard
                  </h1>
                  <p className="text-blue-100">
                    Manage your fertilizer products and batch information
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadProducts}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                  >
                    {isRefreshing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* Product Selector */}
              <div className="mb-8">
                <ProductSelector
                  products={allProducts}
                  onProductSelect={handleProductSelect}
                  onRefresh={loadProducts}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <button
                  className={`group flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 min-h-[80px] ${
                    !selectedProduct 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-500' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 hover:shadow-lg hover:-translate-y-1'
                  }`}
                  onClick={handleAddStock}
                  disabled={!selectedProduct}
                >
                  <div className={`rounded-full p-3 ${!selectedProduct ? 'bg-gray-200' : 'bg-green-200 group-hover:bg-green-300'} transition-colors`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Add New Batch</div>
                    <div className="text-sm opacity-75">Create production batch</div>
                  </div>
                </button>

                <button
                  className={`group flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 min-h-[80px] ${
                    !selectedProduct 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-500' 
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                  }`}
                  onClick={handleUpdateProduct}
                  disabled={!selectedProduct}
                >
                  <div className={`rounded-full p-3 ${!selectedProduct ? 'bg-gray-200' : 'bg-blue-200 group-hover:bg-blue-300'} transition-colors`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Update Product</div>
                    <div className="text-sm opacity-75">Edit product details</div>
                  </div>
                </button>

                <button
                  className={`group flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 min-h-[80px] sm:col-span-2 lg:col-span-1 ${
                    !selectedProduct 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-500' 
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700 hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:shadow-lg hover:-translate-y-1'
                  }`}
                  onClick={handleDeleteProduct}
                  disabled={!selectedProduct}
                >
                  <div className={`rounded-full p-3 ${!selectedProduct ? 'bg-gray-200' : 'bg-red-200 group-hover:bg-red-300'} transition-colors`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Delete Product</div>
                    <div className="text-sm opacity-75">Remove permanently</div>
                  </div>
                </button>
              </div>

              {/* Product Table */}
              <ProductTable
                selectedProduct={selectedProduct}
                onRefresh={loadProducts}
                modalHandlers={getModalHandlers()}
              />
            </div>
          </div>
        </main>

        {/* All Modals */}
        <AddProductModal onSuccess={loadProducts} />
        
        <UpdateProductModal
          isOpen={updateProductModal.isOpen}
          onClose={() => setUpdateProductModal({ isOpen: false, product: null })}
          product={updateProductModal.product}
          onSuccess={() => {
            setUpdateProductModal({ isOpen: false, product: null });
            loadProducts();
          }}
        />

        <AddStockModal
          isOpen={addStockModal.isOpen}
          onClose={() => setAddStockModal({ isOpen: false })}
          selectedProduct={selectedProduct}
          onSuccess={() => {
            setAddStockModal({ isOpen: false });
            loadProducts();
          }}
        />

        <QRCodeModal
          isOpen={qrModal.isOpen}
          onClose={() => setQrModal({ isOpen: false, batch: null, productName: '' })}
          batch={qrModal.batch}
          productName={qrModal.productName}
        />

        <UpdateBatchModal
          isOpen={updateBatchModal.isOpen}
          onClose={() => setUpdateBatchModal({ isOpen: false, batch: null })}
          batch={updateBatchModal.batch}
          onSuccess={() => {
            setUpdateBatchModal({ isOpen: false, batch: null });
            loadProducts();
          }}
        />

        <ConfirmationModal
          isOpen={deleteConfirmModal.isOpen}
          onClose={() => setDeleteConfirmModal({ isOpen: false, product: null })}
          onConfirm={confirmDeleteProduct}
          title={deleteConfirmModal.title}
          message={deleteConfirmModal.message}
          confirmText={deleteConfirmModal.confirmText}
          type={deleteConfirmModal.type}
        />

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={handleConfirmAction}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          type={confirmModal.type}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-16 sm:mt-20"
        />
      </div> 
    </ModalProvider>
  );
};

export default Dashboard;