// Cloudinary utility functions for image handling

/**
 * Get optimized Cloudinary image URL with transformations
 * @param {string} imagePath - Original image path from database
 * @param {object} options - Transformation options
 * @returns {string|null} - Optimized Cloudinary URL or null
 */
export const getCloudinaryImageUrl = (imagePath, options = {}) => {
    if (!imagePath) return null;
    
    const {
        width = 400,
        height = 400,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
        folder = 'products'
    } = options;
    
    const cleanPath = imagePath.split(',')[0].trim();
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
        console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured');
        return cleanPath;
    }
    
    // If it's already a full Cloudinary URL
    if (cleanPath.startsWith('https://res.cloudinary.com/')) {
        // Add transformations if not present
        if (!cleanPath.includes('/upload/w_') && options.width) {
            const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
            return cleanPath.replace('/upload/', `/upload/${transformations}/`);
        }
        return cleanPath;
    }
    
    // If it's a Cloudinary public_id (without extension)
    if (cleanPath.includes('/') && !cleanPath.startsWith('http')) {
        const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
        return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${cleanPath}`;
    }
    
    // If it's just a filename, construct Cloudinary URL
    if (!cleanPath.startsWith('http')) {
        // Remove file extension for Cloudinary public_id
        const publicId = cleanPath.replace(/\.[^/.]+$/, "");
        const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
        return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${folder}/${publicId}`;
    }
    
    // Fallback for other HTTP URLs
    return cleanPath;
};

/**
 * Get thumbnail version of image for lists/cards
 * @param {string} imagePath - Original image path
 * @returns {string|null} - Thumbnail URL
 */
export const getCloudinaryThumbnail = (imagePath) => {
    return getCloudinaryImageUrl(imagePath, {
        width: 150,
        height: 150,
        quality: 'auto',
        format: 'auto',
        crop: 'fill'
    });
};

/**
 * Get high-quality image for detailed views
 * @param {string} imagePath - Original image path
 * @returns {string|null} - High-quality URL
 */
export const getCloudinaryHighQuality = (imagePath) => {
    return getCloudinaryImageUrl(imagePath, {
        width: 800,
        height: 600,
        quality: '90',
        format: 'auto',
        crop: 'fit'
    });
};

/**
 * Upload image to Cloudinary (if using unsigned uploads)
 * @param {File} file - Image file to upload
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
    const { folder = 'products', tags = [] } = options;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!uploadPreset || !cloudName) {
        throw new Error('Cloudinary configuration missing');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);
    
    if (tags.length > 0) {
        formData.append('tags', tags.join(','));
    }
    
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Generate Cloudinary URL for different responsive sizes
 * @param {string} imagePath - Original image path
 * @returns {object} - Object with different sized URLs
 */
export const getResponsiveCloudinaryUrls = (imagePath) => {
    const baseOptions = { quality: 'auto', format: 'auto', crop: 'fill' };
    
    return {
        thumbnail: getCloudinaryImageUrl(imagePath, { ...baseOptions, width: 150, height: 150 }),
        small: getCloudinaryImageUrl(imagePath, { ...baseOptions, width: 300, height: 300 }),
        medium: getCloudinaryImageUrl(imagePath, { ...baseOptions, width: 600, height: 400 }),
        large: getCloudinaryImageUrl(imagePath, { ...baseOptions, width: 1200, height: 800 }),
        original: getCloudinaryImageUrl(imagePath, { quality: '100', format: 'auto' })
    };
};

/**
 * Check if image path is a Cloudinary URL
 * @param {string} imagePath - Image path to check
 * @returns {boolean} - True if Cloudinary URL
 */
export const isCloudinaryUrl = (imagePath) => {
    return imagePath && imagePath.includes('res.cloudinary.com');
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
export const extractCloudinaryPublicId = (cloudinaryUrl) => {
    if (!isCloudinaryUrl(cloudinaryUrl)) return null;
    
    try {
        const urlParts = cloudinaryUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex === -1) return null;
        
        // Get everything after /upload/ and any transformations
        const afterUpload = urlParts.slice(uploadIndex + 1);
        
        // Remove transformations (they contain commas or start with v followed by numbers)
        const publicIdParts = afterUpload.filter(part => 
            !part.includes(',') && 
            !part.match(/^v\d+$/)
        );
        
        const publicIdWithExtension = publicIdParts.join('/');
        
        // Remove file extension
        return publicIdWithExtension.replace(/\.[^/.]+$/, "");
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
};