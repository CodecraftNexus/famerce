"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useModal } from './ModelContex';

const ProductSelector = ({ products = [], onProductSelect, onRefresh }) => {
  const { openModal } = useModal();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setIsOpen(false);
    setSearchTerm('');
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const handleAddProduct = () => {
    setIsOpen(false);
    openModal('add');
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    if (onRefresh) {
      await onRefresh();
    }
    setIsLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const name = product?.name || '';
    const productId = product?.productId || '';
    const subtitle = product?.shortDescription || '';
    const searchTermLower = (searchTerm || '').toLowerCase();
    
    return (
      name.toLowerCase().includes(searchTermLower) ||
      productId.toLowerCase().includes(searchTermLower) ||
      subtitle.toLowerCase().includes(searchTermLower)
    );
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('https://storage.googleapis.com/')) {
      return imagePath.split(',')[0].trim();
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath.split(',')[0].trim();
    }
    
    if (imagePath.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_API_URL}${imagePath.split(',')[0].trim()}`;
    }
    
    const fileName = imagePath.split(',')[0].trim();
    return `https://storage.googleapis.com/famerce/products/${fileName}`;
  };

  return (
    <div className="relative mb-8" ref={dropdownRef}>
      {/* Main Selector */}
      <div className="relative">
        <div 
          onClick={toggleDropdown}
          className={`relative w-full p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white shadow-lg hover:shadow-xl ${
            selectedProduct 
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          {selectedProduct ? (
            // Selected Product Display
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 flex-shrink-0 shadow-md">
                {selectedProduct.imagePath ? (
                  <>
                    <img 
                      src={getImageUrl(selectedProduct.imagePath)} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-blue-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-blue-900 truncate">
                  {selectedProduct.name}
                </h3>
                <p className="text-blue-700 text-sm truncate mt-1">
                  {selectedProduct.shortDescription || 'No description'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                    ID: {selectedProduct.productId}
                  </span>
                  <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                    {(selectedProduct.batches && selectedProduct.batches.length) || 0} batches
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Placeholder Display
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-700">
                  {isLoading ? "Loading products..." : "Select a fertilizer product"}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Click here to choose from available products
                </p>
              </div>
            </div>
          )}
          
          {/* Dropdown Arrow */}
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : (
              <svg 
                className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 backdrop-blur-lg">
          {/* Search Container */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-4 py-3 pl-12 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 bg-white"
                placeholder="🔍 Search fertilizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 p-4 border-b border-gray-100 bg-gray-50">
            <button 
              onClick={handleAddProduct} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              title="Refresh products"
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Products List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <button
                  key={product.productId || product.id}
                  onClick={() => selectProduct(product)}
                  className="w-full p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 group text-left"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 border border-blue-200 group-hover:border-blue-300 transition-all duration-200 shadow-sm">
                      {product.imagePath ? (
                        <>
                          <img 
                            src={getImageUrl(product.imagePath)} 
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center text-blue-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-500">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-left truncate text-lg group-hover:text-blue-700 transition-colors duration-200">
                            {product.name || 'Unnamed Product'}
                          </div>
                          <div className="text-sm text-gray-600 text-left truncate">
                            {product.shortDescription || 'No description'}
                          </div>
                          <div className="text-xs text-gray-400 text-left truncate mt-1 font-mono">
                            ID: {product.productId || 'No ID'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-3">
                          <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {(product.batches && product.batches.length) || 0} batches
                          </span>
                          {product.summary?.expiringSoon > 0 && (
                            <span className="text-xs bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                              {product.summary.expiringSoon} expiring
                            </span>
                          )}
                          {product.summary?.expiredBatches > 0 && (
                            <span className="text-xs bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-3 py-1 rounded-full font-medium">
                              {product.summary.expiredBatches} expired
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Batch Summary */}
                      {product.batches && product.batches.length > 0 && (
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Active: {product.summary?.activeBatches || 0}</span>
                          </span>
                          {product.summary?.expiringSoon > 0 && (
                            <span className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-gray-600">Expiring: {product.summary.expiringSoon}</span>
                            </span>
                          )}
                          {product.summary?.expiredBatches > 0 && (
                            <span className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-gray-600">Expired: {product.summary.expiredBatches}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchTerm ? 'No products found' : 'No products available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Click "Add New Product" to get started'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Footer Count */}
          {products.length > 0 && (
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 text-center">
              <span className="text-sm text-gray-600 font-medium">
                {filteredProducts.length === products.length 
                  ? `${products.length} total products`
                  : `${filteredProducts.length} of ${products.length} products`
                }
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;