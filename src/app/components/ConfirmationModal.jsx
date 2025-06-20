"use client";

import React from 'react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger", // danger, warning, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "⚠️",
          headerGradient: "from-red-600 to-rose-600",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          confirmBg: "bg-red-600 hover:bg-red-700",
          borderColor: "border-red-200",
          alertBg: "from-red-50 to-rose-50",
          alertIcon: "🚨",
          alertText: "text-red-700",
          alertTitle: "text-red-800",
        };
      case "warning":
        return {
          icon: "⚡",
          headerGradient: "from-orange-600 to-amber-600",
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
          confirmBg: "bg-orange-600 hover:bg-orange-700",
          borderColor: "border-orange-200",
          alertBg: "from-orange-50 to-amber-50",
          alertIcon: "⚠️",
          alertText: "text-orange-700",
          alertTitle: "text-orange-800",
        };
      default:
        return {
          icon: "ℹ️",
          headerGradient: "from-blue-600 to-cyan-600",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          borderColor: "border-blue-200",
          alertBg: "from-blue-50 to-cyan-50",
          alertIcon: "ℹ️",
          alertText: "text-blue-700",
          alertTitle: "text-blue-800",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${typeStyles.headerGradient} px-6 py-5 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${typeStyles.iconBg} rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm ${typeStyles.iconColor}`}>
                  {typeStyles.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            <div className={`bg-gradient-to-r ${typeStyles.alertBg} rounded-xl p-4 border-2 ${typeStyles.borderColor}`}>
              <p className="text-gray-700 leading-relaxed text-center whitespace-pre-line text-sm">
                {message}
              </p>
            </div>

            {type === "danger" && (
              <div className={`mt-4 bg-gradient-to-r ${typeStyles.alertBg} rounded-xl p-4 border-2 ${typeStyles.borderColor}`}>
                <div className="flex items-start gap-3">
                  <span className={`text-lg ${typeStyles.iconColor}`}>{typeStyles.alertIcon}</span>
                  <div>
                    <h4 className={`font-semibold ${typeStyles.alertTitle} mb-1`}>Warning</h4>
                    <p className={`${typeStyles.alertText} text-sm`}>
                      This action cannot be undone. Please make sure you want to proceed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 ${typeStyles.confirmBg} text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;