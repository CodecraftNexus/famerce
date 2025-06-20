"use client";

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import PropTypes from 'prop-types';

const UpdateProductModal = ({ isOpen, onClose, product, onSuccess }) => {
    // State Management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [imagePreview, setImagePreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // Dynamic list states
    const [applicationSteps, setApplicationSteps] = useState(['']);
    const [ingredients, setIngredients] = useState(['']);
    const [advantages, setAdvantages] = useState(['']);
    const [recommendedCrops, setRecommendedCrops] = useState(['']);

    // Simplified PPE and Hygiene - just text arrays
    const [ppeInstructions, setPpeInstructions] = useState(['']);
    const [hygienePractices, setHygienePractices] = useState(['']);

    // Refs for file inputs
    const imageFileRef = useRef(null);
    const npsApprovalFilesRef = useRef(null);
    const msdsFilesRef = useRef(null);
    const certificationsFilesRef = useRef(null);

    // Form Data State
    const [formData, setFormData] = useState({
        productName: '',
        shortDescription: '',
        fullDescription: '',
        productImage: null,
        currentImageUrl: null,
        npsApprovalFiles: [],
        msdsFiles: [],
        certificationsFiles: [],
        ingredients: '',
        advantages: '',
        applicationInstructions: '',
        recommendedCrops: '',
        ppeInstructions: '',
        ppeTitle: 'Personal Protective Equipment',
        workHygienicPractices: '',
        hygieneTitle: 'Work Hygienic Practices',
        contactAddress: '',
        contactPhones: '',
        contactEmail: '',
        contactWebsite: '',
    });

    // Environment validation
    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!CLOUDINARY_CLOUD_NAME) {
        console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
    }

    // Update formData when dynamic lists change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            ingredients: ingredients.filter(item => item.trim()).join('\n'),
            advantages: advantages.filter(item => item.trim()).join('\n'),
            recommendedCrops: recommendedCrops.filter(item => item.trim()).join('\n'),
            applicationInstructions: applicationSteps.filter(step => step.trim()).join('\n'),
            ppeInstructions: ppeInstructions.filter(item => item.trim()).join('\n'),
            ppeTitle: 'Personal Protective Equipment',
            workHygienicPractices: hygienePractices.filter(item => item.trim()).join('\n'),
            hygieneTitle: 'Work Hygienic Practices',
        }));
    }, [ingredients, advantages, recommendedCrops, applicationSteps, ppeInstructions, hygienePractices]);

    // Initialize form data when product changes
    useEffect(() => {
        if (isOpen && product) {
            console.log('🔄 Initializing product data:', product);

            const getCloudinaryImageUrl = (imagePath) => {
                if (!imagePath) return null;
                const cleanPath = imagePath.split(',')[0].trim();

                if (!CLOUDINARY_CLOUD_NAME) {
                    toast.error('Cloudinary configuration missing');
                    return cleanPath;
                }

                if (cleanPath.startsWith('https://res.cloudinary.com/')) {
                    return cleanPath;
                }

                if (cleanPath.includes('/') && !cleanPath.startsWith('http')) {
                    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${cleanPath}`;
                }

                const publicId = cleanPath.replace(/\.[^/.]+$/, "");
                return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/products/${publicId}`;
            };

            // FIXED: Initialize dynamic arrays from product data
            const productIngredients = product.composition?.ingredients?.map(ing => `${ing.name}:${ing.percentage}`) || [''];
            const productAdvantages = product.composition?.advantages || [''];
            const productRecommendedCrops = product.application?.recommendedCrops || [''];

            // FIXED: Application Instructions Array Initialization
            const productApplicationSteps = product.application?.instructions || [''];
            console.log('📋 Application instructions from product:', product.application?.instructions);
            console.log('📋 Setting application steps to:', productApplicationSteps);

            const productPpeInstructions = product.safety?.ppe?.instructions || [''];
            const productHygienePractices = product.safety?.hygiene?.instructions || [''];

            // Set dynamic arrays - FIXED: Include Application Steps
            setIngredients(productIngredients.length > 0 ? productIngredients : ['']);
            setAdvantages(productAdvantages.length > 0 ? productAdvantages : ['']);
            setRecommendedCrops(productRecommendedCrops.length > 0 ? productRecommendedCrops : ['']);

            // FIXED: Set Application Steps
            setApplicationSteps(productApplicationSteps.length > 0 ? productApplicationSteps : ['']);
            console.log('✅ Application steps set to state:', productApplicationSteps);

            // Simplified initialization for PPE and Hygiene
            setPpeInstructions(productPpeInstructions.length > 0 ? productPpeInstructions : ['']);
            setHygienePractices(productHygienePractices.length > 0 ? productHygienePractices : ['']);

            setFormData({
                productName: product.name || '',
                shortDescription: product.shortDescription || '',
                fullDescription: product.fullDescription || '',
                productImage: null,
                currentImageUrl: getCloudinaryImageUrl(product.imagePath),
                npsApprovalFiles: [],
                msdsFiles: [],
                certificationsFiles: [],
                ingredients: '',
                advantages: '',
                applicationInstructions: '',
                recommendedCrops: '',
                ppeInstructions: '',
                ppeTitle: 'Personal Protective Equipment',
                workHygienicPractices: '',
                hygieneTitle: 'Work Hygienic Practices',
                contactAddress: 'Gonagodalla road, Pelwatte, Buttala.',
                contactPhones: '+94 557284040',
                contactEmail: 'info@farmersfert.com',
                contactWebsite: 'www.farmersfert.com',
            });

            setImagePreview(null);
            setCurrentStep(1);

            // Debug log for verification
            console.log('🔍 Final initialized arrays:', {
                ingredients: productIngredients,
                advantages: productAdvantages,
                recommendedCrops: productRecommendedCrops,
                applicationSteps: productApplicationSteps,
                ppeInstructions: productPpeInstructions,
                hygienePractices: productHygienePractices
            });
        }
    }, [isOpen, product, CLOUDINARY_CLOUD_NAME]);

    // Handle image preview
    useEffect(() => {
        if (formData.productImage) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(formData.productImage);
        } else {
            setImagePreview(null);
        }
    }, [formData.productImage]);

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            productName: '',
            shortDescription: '',
            fullDescription: '',
            productImage: null,
            currentImageUrl: null,
            npsApprovalFiles: [],
            msdsFiles: [],
            certificationsFiles: [],
            ingredients: '',
            advantages: '',
            applicationInstructions: '',
            recommendedCrops: '',
            ppeInstructions: '',
            ppeTitle: 'Personal Protective Equipment',
            workHygienicPractices: '',
            hygieneTitle: 'Work Hygienic Practices',
            contactAddress: '',
            contactPhones: '',
            contactEmail: '',
            contactWebsite: '',
        });

        // Reset dynamic arrays
        setApplicationSteps(['']);
        setIngredients(['']);
        setAdvantages(['']);
        setRecommendedCrops(['']);
        setPpeInstructions(['']);
        setHygienePractices(['']);

        setImagePreview(null);
        setCurrentStep(1);

        // Clear file inputs
        if (imageFileRef.current) imageFileRef.current.value = '';
        if (npsApprovalFilesRef.current) npsApprovalFilesRef.current.value = '';
        if (msdsFilesRef.current) msdsFilesRef.current.value = '';
        if (certificationsFilesRef.current) certificationsFilesRef.current.value = '';
    };

    // Handle modal close
    const handleCloseModal = () => {
        if (!isSubmitting) {
            onClose();
            resetForm();
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Dynamic list handlers
    const handleListChange = (index, value, setList, list) => {
        const newList = [...list];
        newList[index] = value;
        setList(newList);
    };

    // Simplified safety change handler for textareas
    const handleSafetyChange = (index, value, setList, list) => {
        const newList = [...list];
        newList[index] = value;
        setList(newList);
    };

    const addListItem = (setList) => {
        setList(prev => [...prev, '']);
    };

    // Simplified add safety item
    const addSafetyItem = (setList) => {
        setList(prev => [...prev, '']);
    };

    const removeListItem = (index, setList, list) => {
        const newList = list.filter((_, i) => i !== index);
        setList(newList);
    };

    // Simplified remove safety item
    const removeSafetyItem = (index, setList, list) => {
        const newList = list.filter((_, i) => i !== index);
        if (newList.length === 0) {
            setList(['']);
        } else {
            setList(newList);
        }
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    };

    // Image file validation and handling
    const handleImageFile = (file) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            toast.error('Only PNG, JPG, or JPEG images are allowed');
            return;
        }
        if (file.size > maxSize) {
            toast.error('Image size must be less than 5MB');
            return;
        }
        setFormData(prev => ({ ...prev, productImage: file }));
    };

    // Optimize Cloudinary URLs
    const getOptimizedCloudinaryUrl = (url, options = {}) => {
        if (!url || !url.includes('cloudinary.com')) return url;
        const { width = 400, height = 400, quality = 'auto', format = 'auto' } = options;
        const transformations = `w_${width},h_${height},c_fill,q_${quality},f_${format}`;
        return url.replace('/upload/', `/upload/${transformations}/`);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, productImage: null }));
        if (imageFileRef.current) imageFileRef.current.value = '';
        setImagePreview(null);
    };

    // File validation utility
    const validateFiles = (files) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        return files.filter(file => {
            if (!validTypes.includes(file.type)) {
                toast.error(`${file.name}: Only PDF, DOC, or DOCX files are allowed`);
                return false;
            }
            if (file.size > maxSize) {
                toast.error(`${file.name}: File size must be less than 5MB`);
                return false;
            }
            return true;
        });
    };

    // Handle file uploads
    const handleFileChange = (e, fieldName) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const validFiles = validateFiles(files);
            setFormData(prev => ({
                ...prev,
                [fieldName]: validFiles
            }));
        }
    };

    const removeFile = (fieldName, fileIndex) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: prev[fieldName].filter((_, index) => index !== fileIndex)
        }));
    };

    // Parse ingredients string into array of objects
    const parseIngredients = (ingredientString) => {
        if (!ingredientString.trim()) return [];
        return ingredientString
            .split('\n')
            .filter(line => line.trim() && line.includes(':'))
            .map(line => {
                const [name, percentage] = line.split(':').map(part => part.trim());
                return { name, percentage };
            });
    };

    const parseList = (listString) => {
        if (!listString.trim()) return [];
        return listString.split('\n').filter(item => item.trim());
    };

    // Step navigation
    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Step validation
    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.productName) {
                    toast.error('Product name is required');
                    return false;
                }
                return true;
            case 2:
                // Validate ingredients format
                const invalidIngredients = ingredients.filter(ing => ing.trim() && !ing.includes(':'));
                if (invalidIngredients.length > 0) {
                    toast.error('Invalid ingredients format. Use "Name:Percentage" format.');
                    return false;
                }
                return true;
            case 3:
                return true;
            case 4:
                if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
                    toast.error('Please provide a valid email address.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            nextStep();
        }
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productName) {
            toast.error('Product name is required');
            return;
        }

        if (!product) {
            toast.error('No product selected for update');
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            const productDefinition = {
                name: formData.productName,
                shortDescription: formData.shortDescription || 'No short description provided',
                fullDescription: formData.fullDescription || 'No full description provided',
                composition: {
                    title: "Composition",
                    ingredients: parseIngredients(formData.ingredients),
                    advantages: parseList(formData.advantages)
                },
                application: {
                    title: "Application Details",
                    instructions: parseList(formData.applicationInstructions),
                    recommendedCrops: parseList(formData.recommendedCrops)
                },
                safety: {
                    title: "Safety Instructions",
                    ppe: {
                        title: formData.ppeTitle,
                        instructions: parseList(formData.ppeInstructions)
                    },
                    hygiene: {
                        title: formData.hygieneTitle,
                        instructions: parseList(formData.workHygienicPractices)
                    }
                },
                contact: {
                    title: "Contact Details",
                    address: formData.contactAddress || 'No address provided',
                    phones: formData.contactPhones ? formData.contactPhones.split(',').map(p => p.trim()).filter(p => p) : [],
                    email: formData.contactEmail || 'No email provided',
                    website: formData.contactWebsite || 'No website provided'
                }
            };

            submitData.append('productData', JSON.stringify(productDefinition));
            if (formData.productImage) {
                submitData.append('image', formData.productImage);
            }
            formData.npsApprovalFiles.forEach(file => submitData.append('npsApprovalFiles[]', file));
            formData.msdsFiles.forEach(file => submitData.append('msdsFiles[]', file));
            formData.certificationsFiles.forEach(file => submitData.append('certificationsFiles[]', file));

            const response = await api.updateProduct(product.productId, submitData);

            if (response.data.success) {
                toast.success(`Product "${formData.productName}" updated successfully! 🎉`);
                handleCloseModal();
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error) {
            console.error('Update product error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update product';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Icon Components
    const StepIcon = ({ step }) => {
        const iconMap = {
            1: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            2: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            3: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            4: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            )
        };
        return iconMap[step] || iconMap[1];
    };

    const getStepTitle = (step) => {
        switch (step) {
            case 1: return "Basic Information";
            case 2: return "Composition & Details";
            case 3: return "Application & Safety";
            case 4: return "Documents & Contact";
            default: return "Basic Information";
        }
    };

    // Document Icons
    const DocumentIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const FlaskIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
    );

    const AwardIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    );

    // Document Upload Component
    const DocumentUpload = ({ title, fieldName, files, fileRef, description, Icon }) => (
        <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3" htmlFor={`${fieldName}-update-upload`}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Icon />
                </div>
                {title}
            </label>

            {product && (
                <div className="mb-4">
                    {fieldName === 'npsApprovalFiles' && product.npsApproval && product.npsApproval !== 'No documents uploaded' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium text-blue-800">Current: {product.npsApproval}</span>
                            </div>
                        </div>
                    )}

                    {fieldName === 'msdsFiles' && product.msds && product.msds !== 'No documents uploaded' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium text-green-800">Current: {product.msds}</span>
                            </div>
                        </div>
                    )}

                    {fieldName === 'certificationsFiles' && product.certifications?.qualityStandards && product.certifications.qualityStandards !== 'No documents uploaded' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <span className="text-sm font-medium text-purple-800">Current: {product.certifications.qualityStandards}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-all duration-200 bg-gray-50/50">
                {files.length > 0 ? (
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-green-700 mb-2">📁 New files to upload:</div>
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-green-200">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-sm font-medium text-gray-800 truncate block">{file.name}</span>
                                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span className="text-xs text-green-600 font-medium">New Upload</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(fieldName, index)}
                                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors ml-3"
                                    disabled={isSubmitting}
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <label htmlFor={`${fieldName}-update-upload`} className="cursor-pointer">
                            <span className="text-lg font-medium text-gray-800 block mb-1">
                                {files.length === 0 && product ? 'Upload new documents to replace current ones' : `Click to upload ${title.toLowerCase()}`}
                            </span>
                            <span className="text-sm text-gray-500">{description}</span>
                        </label>
                        <input
                            id={`${fieldName}-update-upload`}
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            multiple
                            onChange={(e) => handleFileChange(e, fieldName)}
                            className="hidden"
                            disabled={isSubmitting}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    DocumentUpload.propTypes = {
        title: PropTypes.string.isRequired,
        fieldName: PropTypes.string.isRequired,
        files: PropTypes.array.isRequired,
        fileRef: PropTypes.object.isRequired,
        description: PropTypes.string.isRequired,
        Icon: PropTypes.func.isRequired,
    };

    // Early return if modal is not open or no product
    if (!isOpen || !product) return null;

    // Main Render
    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                onClick={handleCloseModal}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                aria-label="Close modal"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-2 overflow-y-auto">
                <div className="
                    bg-white 
                    rounded-2xl 
                    shadow-2xl 
                    border border-gray-200 
                    w-full 
                    max-w-[95vw] 
                    sm:max-w-2xl 
                    md:max-w-3xl 
                    lg:max-w-4xl 
                    xl:max-w-5xl
                    min-h-[50vh]
                    max-h-[95vh] 
                    overflow-hidden
                    mx-auto
                    my-4
                ">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                                    <StepIcon step={currentStep} />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white">Update Product</h3>
                                    <p className="text-blue-100 font-medium text-sm sm:text-base">{getStepTitle(currentStep)}</p>
                                    <p className="text-blue-200 text-xs sm:text-sm">{product.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
                                disabled={isSubmitting}
                                aria-label="Close modal"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`
                                        w-8 h-8 sm:w-10 sm:h-10 
                                        rounded-full 
                                        flex items-center justify-center 
                                        font-bold text-sm 
                                        transition-all duration-300 
                                        ${step <= currentStep
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-500'
                                        }
                                    `}>
                                        {step}
                                    </div>
                                    {step < 4 && (
                                        <div className={`
                                            h-1 
                                            w-6 sm:w-12 md:w-16 lg:w-20 xl:w-24 
                                            mx-1 sm:mx-2 
                                            transition-all duration-300 
                                            ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                                        `}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="
                        px-4 sm:px-6 lg:px-8 
                        py-4 sm:py-6 
                        max-h-[50vh] sm:max-h-[55vh] lg:max-h-[60vh]
                        overflow-y-auto
                    ">
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            {/* Step 1: Basic Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    {/* Product Image Section */}
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3" htmlFor="update-image-upload">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            Product Image
                                        </label>
                                        <div
                                            className={`
            relative border-2 border-dashed rounded-xl 
            p-4 sm:p-6 lg:p-8 
            transition-all duration-300 
            bg-gray-50/50
            ${dragActive
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                                                }
        `}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {/* Current Image */}
                                                {formData.currentImageUrl && (
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-700 mb-2">Current Image:</div>
                                                        <img
                                                            src={getOptimizedCloudinaryUrl(formData.currentImageUrl)}
                                                            alt="Current Product Image"
                                                            className="w-24 h-24 object-cover rounded-xl shadow-lg border-2 border-blue-300"
                                                            onError={(e) => {
                                                                toast.error('Failed to load current product image');
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                        <div className="hidden w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                                                            <div className="text-center">
                                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span className="text-xs text-gray-500">Image Error</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* New Image Preview */}
                                                {formData.productImage ? (
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-green-700 mb-2">New Image Preview:</div>
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={imagePreview}
                                                                alt="New Product Preview"
                                                                className="w-24 h-24 object-cover rounded-xl shadow-lg border-2 border-green-300"
                                                            />
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-800 block">{formData.productImage.name}</span>
                                                                <span className="text-xs text-gray-500">{(formData.productImage.size / 1024 / 1024).toFixed(2)} MB</span>
                                                                <span className="text-xs text-green-600 font-medium block">New Image Selected</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={removeImage}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
                                                                disabled={isSubmitting}
                                                                aria-label="Remove new image"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 text-center">
                                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <label htmlFor="update-image-upload" className="cursor-pointer">
                                                            <span className="text-xl font-semibold text-gray-800 block mb-2">
                                                                {formData.currentImageUrl ? 'Upload new image to replace current one' : 'Drop new image here or click to browse'}
                                                            </span>
                                                            <span className="text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</span>
                                                        </label>
                                                        <input
                                                            id="update-image-upload"
                                                            ref={imageFileRef}
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/jpg"
                                                            onChange={handleImageChange}
                                                            className="hidden"
                                                            disabled={isSubmitting}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Name and Description Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3" htmlFor="productName">
                                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="productName"
                                                name="productName"
                                                value={formData.productName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                                placeholder="Enter product name"
                                                required
                                                disabled={isSubmitting}
                                                aria-required="true"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3" htmlFor="shortDescription">
                                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                    </svg>
                                                </div>
                                                Short Description
                                            </label>
                                            <input
                                                type="text"
                                                id="shortDescription"
                                                name="shortDescription"
                                                value={formData.shortDescription}
                                                onChange={handleInputChange}
                                                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                                                placeholder="Enter short description"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    {/* Full Description */}
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3" htmlFor="fullDescription">
                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            Full Description
                                        </label>
                                        <textarea
                                            id="fullDescription"
                                            name="fullDescription"
                                            value={formData.fullDescription}
                                            onChange={handleInputChange}
                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                                            rows="4"
                                            placeholder="Enter detailed description"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Composition Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 sm:p-6 border-2 border-purple-300">
                                        <h4 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                <FlaskIcon />
                                            </div>
                                            Product Composition
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Ingredients</label>
                                                {ingredients.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={item}
                                                            onChange={(e) => handleListChange(index, e.target.value, setIngredients, ingredients)}
                                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                                            placeholder={`Ingredient ${index + 1}: Name:Percentage (e.g., Nitrogen:6%)`}
                                                            disabled={isSubmitting}
                                                        />
                                                        {ingredients.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeListItem(index, setIngredients, ingredients)}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                                                                disabled={isSubmitting}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addListItem(setIngredients)}
                                                    className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center gap-2"
                                                    disabled={isSubmitting}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Ingredient
                                                </button>
                                                <small className="text-gray-600 mt-1 text-sm block">Format: Name:Percentage</small>
                                            </div>

                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Advantages</label>
                                                {advantages.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={item}
                                                            onChange={(e) => handleListChange(index, e.target.value, setAdvantages, advantages)}
                                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                                            placeholder={`Advantage ${index + 1}: Enter advantage`}
                                                            disabled={isSubmitting}
                                                        />
                                                        {advantages.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeListItem(index, setAdvantages, advantages)}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                                                                disabled={isSubmitting}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addListItem(setAdvantages)}
                                                    className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center gap-2"
                                                    disabled={isSubmitting}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Advantage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Application & Safety */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    {/* Application Details */}
                                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 sm:p-6 border-2 border-orange-300">
                                        <h4 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                </svg>
                                            </div>
                                            Application Details
                                        </h4>

                                        <div className="space-y-4">
                                            {/* FIXED: Application Instructions Section */}
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Application Instructions</label>
                                                {applicationSteps.map((step, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={step}
                                                            onChange={(e) => handleListChange(index, e.target.value, setApplicationSteps, applicationSteps)}
                                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                                            placeholder={`Step ${index + 1}: Enter instruction`}
                                                            disabled={isSubmitting}
                                                        />
                                                        {applicationSteps.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeListItem(index, setApplicationSteps, applicationSteps)}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                                                                disabled={isSubmitting}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addListItem(setApplicationSteps)}
                                                    className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center gap-2"
                                                    disabled={isSubmitting}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Step
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Recommended Crops</label>
                                                {recommendedCrops.map((crop, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={crop}
                                                            onChange={(e) => handleListChange(index, e.target.value, setRecommendedCrops, recommendedCrops)}
                                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                                            placeholder={`Crop ${index + 1}: Enter crop name`}
                                                            disabled={isSubmitting}
                                                        />
                                                        {recommendedCrops.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeListItem(index, setRecommendedCrops, recommendedCrops)}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                                                                disabled={isSubmitting}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addListItem(setRecommendedCrops)}
                                                    className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center gap-2"
                                                    disabled={isSubmitting}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Crop
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safety Instructions */}
                                    <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-4 sm:p-6 border-2 border-red-300">
                                        <h4 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            Safety Instructions
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Personal Protective Equipment (PPE)</label>
                                                {ppeInstructions.map((instruction, index) => (
                                                    <div key={index} className="flex items-start gap-2 mb-4">
                                                        <textarea
                                                            value={instruction}
                                                            onChange={(e) => handleSafetyChange(index, e.target.value, setPpeInstructions, ppeInstructions)}
                                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                                                            rows="4"
                                                            placeholder={`PPE Instructions ${index + 1}:
- Wear safety goggles when handling product
- Use protective gloves at all times  
- Ensure proper ventilation in work area
(One instruction per line)`}
                                                            disabled={isSubmitting}
                                                        />
                                                        {ppeInstructions.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSafetyItem(index, setPpeInstructions, ppeInstructions)}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 mt-2"
                                                                disabled={isSubmitting}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addSafetyItem(setPpeInstructions)}
                                                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center gap-2"
                                                    disabled={isSubmitting}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add PPE Instructions
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Work Hygienic Practices</label>
                                                {hygienePractices.map((instruction, index) => (
                                                    <div key={index} className="flex items-start gap-2 mb-4">
                                                        <textarea
                                                            value={instruction}
                                                            onChange={(e) => handleSafetyChange(index, e.target.value, setHygienePractices, hygienePractices)}
                                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                                                            rows="4"
                                                            placeholder={`Hygiene Instructions ${index + 1}:
- Wash hands thoroughly before and after use
- Clean all equipment after use
- Store in clean, dry environment
(One instruction per line)`}
                                                            disabled={isSubmitting}
                                                        />
                                                        {hygienePractices.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSafetyItem(index, setHygienePractices, hygienePractices)}
                                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 mt-2"
                                                                disabled={isSubmitting}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addSafetyItem(setHygienePractices)}
                                                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center gap-2"
                                                    disabled={isSubmitting}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Hygiene Instructions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Documents & Contact */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    {/* Documents Section */}
                                    <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-4 sm:p-6 border-2 border-indigo-300">
                                        <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                <DocumentIcon />
                                            </div>
                                            Document Updates
                                        </h4>

                                        <div className="space-y-6">
                                            <DocumentUpload
                                                title="NPS Marketing Approval"
                                                fieldName="npsApprovalFiles"
                                                files={formData.npsApprovalFiles}
                                                fileRef={npsApprovalFilesRef}
                                                description="PDF, DOC, DOCX up to 5MB each"
                                                Icon={DocumentIcon}
                                            />

                                            <DocumentUpload
                                                title="MSDS Documents"
                                                fieldName="msdsFiles"
                                                files={formData.msdsFiles}
                                                fileRef={msdsFilesRef}
                                                description="Material Safety Data Sheet files"
                                                Icon={FlaskIcon}
                                            />

                                            <DocumentUpload
                                                title="Quality Certifications"
                                                fieldName="certificationsFiles"
                                                files={formData.certificationsFiles}
                                                fileRef={certificationsFilesRef}
                                                description="Quality standard certification documents"
                                                Icon={AwardIcon}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="bg-gradient-to-r from-teal-100 to-green-100 rounded-xl p-4 sm:p-6 border-2 border-teal-300">
                                        <h4 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-green-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            Contact Information
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2" htmlFor="contactAddress">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    id="contactAddress"
                                                    name="contactAddress"
                                                    value={formData.contactAddress}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="Gonagodalla Road, Buttala"
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2" htmlFor="contactPhones">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    Phone Numbers
                                                </label>
                                                <input
                                                    type="text"
                                                    id="contactPhones"
                                                    name="contactPhones"
                                                    value={formData.contactPhones}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="+94 557284040, +94 771234567"
                                                    disabled={isSubmitting}
                                                />
                                                <small className="text-gray-500 mt-2 block">Comma-separated values</small>
                                            </div>

                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2" htmlFor="contactEmail">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="contactEmail"
                                                    name="contactEmail"
                                                    value={formData.contactEmail}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="info@farmersfert.com"
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2" htmlFor="contactWebsite">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                                                    </svg>
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    id="contactWebsite"
                                                    name="contactWebsite"
                                                    value={formData.contactWebsite}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="https://www.farmersfert.com"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer Section */}
                    <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center order-2 sm:order-1">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={isSubmitting}
                                        className="
                                            px-4 sm:px-6 py-3 
                                            bg-gray-200 hover:bg-gray-300 
                                            text-gray-800 
                                            rounded-xl 
                                            font-semibold 
                                            transition-colors duration-200 
                                            disabled:opacity-50 
                                            flex items-center gap-2
                                            text-sm sm:text-base
                                        "
                                        aria-label="Go to previous step"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                )}
                            </div>

                            <div className="text-sm text-gray-500 font-medium order-1 sm:order-2">
                                Step {currentStep} of 4
                            </div>

                            <div className="flex items-center order-3">
                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className="
                                            px-4 sm:px-6 py-3 
                                            bg-blue-600 hover:bg-blue-700 
                                            text-white 
                                            rounded-xl 
                                            font-semibold 
                                            transition-colors duration-200 
                                            disabled:opacity-50 
                                            flex items-center gap-2
                                            text-sm sm:text-base
                                        "
                                        aria-label="Go to next step"
                                    >
                                        Next
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={!formData.productName || isSubmitting}
                                        className="
                                            px-6 sm:px-8 py-3 
                                            bg-blue-600 hover:bg-blue-700 
                                            text-white 
                                            rounded-xl 
                                            font-semibold 
                                            transition-colors duration-200 
                                            disabled:opacity-50 
                                            flex items-center gap-2
                                            text-sm sm:text-base
                                        "
                                        aria-label="Update product"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Update Product
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// PropTypes validation
UpdateProductModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    product: PropTypes.shape({
        productId: PropTypes.string.isRequired,
        name: PropTypes.string,
        imagePath: PropTypes.string,
        shortDescription: PropTypes.string,
        fullDescription: PropTypes.string,
        composition: PropTypes.shape({
            ingredients: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string,
                    percentage: PropTypes.string,
                })
            ),
            advantages: PropTypes.arrayOf(PropTypes.string),
        }),
        application: PropTypes.shape({
            instructions: PropTypes.string,
            recommendedCrops: PropTypes.arrayOf(PropTypes.string),
        }),
        safety: PropTypes.shape({
            ppe: PropTypes.shape({
                instructions: PropTypes.arrayOf(PropTypes.string),
            }),
            hygiene: PropTypes.shape({
                instructions: PropTypes.arrayOf(PropTypes.string),
            }),
        }),
        contact: PropTypes.shape({
            address: PropTypes.string,
            phones: PropTypes.arrayOf(PropTypes.string),
            email: PropTypes.string,
            website: PropTypes.string,
        }),
        npsApproval: PropTypes.string,
        msds: PropTypes.string,
        certifications: PropTypes.shape({
            qualityStandards: PropTypes.string,
        }),
    }).isRequired,
    onSuccess: PropTypes.func,
};

export default UpdateProductModal;