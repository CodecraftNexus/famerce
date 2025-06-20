// QR Code utility functions

export const downloadQRCode = (dataURL, filename = 'qr-code.png') => {
  try {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading QR code:', error);
    return false;
  }
};

export const generateQRCodeDataURL = async (text, options = {}) => {
  try {
    // Dynamic import of qrcode library
    const QRCode = (await import('qrcode')).default;
    
    const defaultOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };
    
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

export const generateQRCodeSVG = async (text, options = {}) => {
  try {
    const QRCode = (await import('qrcode')).default;
    
    const defaultOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };
    
    return await QRCode.toString(text, { 
      type: 'svg',
      ...defaultOptions 
    });
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    return null;
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
};