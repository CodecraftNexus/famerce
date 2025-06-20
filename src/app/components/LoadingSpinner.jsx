"use client";

const LoadingSpinner = ({ message = "Loading...", fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            {/* Main spinner */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent mx-auto mb-6" />
            
            {/* Inner spinner */}
            <div className="absolute top-3 left-3 animate-ping rounded-full h-14 w-14 border-4 border-purple-300 border-t-transparent" />
          </div>
          
          <div className="text-white text-xl font-semibold mb-4">{message}</div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-indigo-600 mx-auto mb-2" />
        <div className="text-gray-700 text-sm font-medium">{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;