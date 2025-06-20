"use client";

import { useState, useRef, useEffect } from 'react';
import { useModal } from './ModelContex';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AddProductModal = ({ onSuccess }) => {
    const { isOpen, closeModal } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const imageFileRef = useRef(null);
    const npsApprovalFilesRef = useRef(null);
    const msdsFilesRef = useRef(null);
    const certificationsFilesRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [applicationSteps, setApplicationSteps] = useState(['']);
    const [ingredients, setIngredients] = useState(['']);
    const [advantages, setAdvantages] = useState(['']);
    const [recommendedCrops, setRecommendedCrops] = useState(['']);

    // Simplified PPE and Hygiene - just text arrays
    const [ppeInstructions, setPpeInstructions] = useState(['']);
    const [hygienePractices, setHygienePractices] = useState(['']);

    const [formData, setFormData] = useState({
        productId: '',
        productName: '',
        productImage: null,
        shortDescription: '',
        fullDescription: '',
        npsApprovalFiles: [],
        msdsFiles: [],
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        ingredients: '',
        applicationInstructions: '',
        recommendedCrops: '',
        advantages: '',
        ppeInstructions: '',
        ppeTitle: 'Personal Protective Equipment',
        workHygienicPractices: '',
        hygieneTitle: 'Work Hygienic Practices',
        certificationsFiles: [],
        contactAddress: 'Gonagodalla road, Pelwatte, Buttala.',
        contactPhones: '+94 557284040',
        contactEmail: 'info@farmersfert.com',
        contactWebsite: 'www.farmersfert.com',
    });

    useEffect(() => {
        if (formData.productName && !formData.productId) {
            const id = formData.productName
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 30);
            setFormData(prev => ({ ...prev, productId: id }));
        } else if (!formData.productName && formData.productId) {
            setFormData(prev => ({ ...prev, productId: '' }));
        }
    }, [formData.productName]);

    useEffect(() => {
        if (formData.productImage) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(formData.productImage);
        } else {
            setImagePreview(null);
        }
    }, [formData.productImage]);

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
    }, [ingredients, recommendedCrops, applicationSteps, ppeInstructions, hygienePractices, advantages]);

    const resetForm = () => {
        setFormData({
            productId: '',
            productName: '',
            productImage: null,
            shortDescription: '',
            fullDescription: '',
            npsApprovalFiles: [],
            msdsFiles: [],
            batchNumber: '',
            manufacturingDate: '',
            expiryDate: '',
            ingredients: '',
            applicationInstructions: '',
            recommendedCrops: '',
            advantages: '',
            ppeInstructions: '',
            ppeTitle: 'Personal Protective Equipment',
            workHygienicPractices: '',
            hygieneTitle: 'Work Hygienic Practices',
            certificationsFiles: [],
            contactAddress: 'Gonagodalla road, Pelwatte, Buttala.',
            contactPhones: '+94 557284040',
            contactEmail: 'info@farmersfert.com',
            contactWebsite: 'www.farmersfert.com',
        });
        setApplicationSteps(['']);
        setIngredients(['']);
        setAdvantages(['']);
        setRecommendedCrops(['']);
        setPpeInstructions(['']);
        setHygienePractices(['']);
        setImagePreview(null);
        setCurrentStep(1);
        if (imageFileRef.current) imageFileRef.current.value = '';
        if (npsApprovalFilesRef.current) npsApprovalFilesRef.current.value = '';
        if (msdsFilesRef.current) msdsFilesRef.current.value = '';
        if (certificationsFilesRef.current) certificationsFilesRef.current.value = '';
    };

    const handleCloseModal = () => {
        if (!isSubmitting) {
            closeModal();
            resetForm();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const handleFileChange = (e, fieldName) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            const validFiles = files.filter(file => {
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

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.productName) {
                    toast.error('Product name is required');
                    return false;
                }
                if (!formData.productId) {
                    toast.error('Product ID is required');
                    return false;
                }
                return true;
            case 2:
                if (!formData.batchNumber) {
                    toast.error('Batch number is required');
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productName || !formData.productId || !formData.batchNumber) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();

            const productDefinition = {
                productId: formData.productId,
                name: formData.productName,
                image: formData.productImage ? formData.productImage.name : 'No image uploaded',
                shortDescription: formData.shortDescription || 'No short description provided',
                fullDescription: formData.fullDescription || 'No full description provided',
                npsApproval: formData.npsApprovalFiles.length > 0 ? formData.npsApprovalFiles.map(file => file.name).join(', ') : 'No documents uploaded',
                msds: formData.msdsFiles.length > 0 ? formData.msdsFiles.map(file => file.name).join(', ') : 'No documents uploaded',
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
                certifications: {
                    title: "Certifications",
                    qualityStandards: formData.certificationsFiles.length > 0 ? formData.certificationsFiles.map(file => file.name).join(', ') : 'No documents uploaded'
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
            if (formData.productImage) submitData.append('image', formData.productImage);
            formData.npsApprovalFiles.forEach(file => submitData.append('npsApprovalFiles[]', file));
            formData.msdsFiles.forEach(file => submitData.append('msdsFiles[]', file));
            formData.certificationsFiles.forEach(file => submitData.append('certificationsFiles[]', file));

            const productResponse = await axios.post(`${API_URL}/api/products`, submitData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (productResponse.data.success) {
                const batchData = {
                    productId: formData.productId,
                    number: formData.batchNumber,
                    manufacturingDate: formData.manufacturingDate || '',
                    expiryDate: formData.expiryDate || ''
                };

                const batchResponse = await axios.post(`${API_URL}/api/batches`, batchData, {
                    withCredentials: true
                });

                if (batchResponse.data.success) {
                    toast.success(`Product "${formData.productName}" created successfully! 🎉`);
                    handleCloseModal();
                    if (onSuccess) {
                        onSuccess();
                    }
                } else {
                    toast.error('Product created but failed to create batch');
                }
            }
        } catch (error) {
            console.error('Create product error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create product';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Enhanced icon components
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
            case 2: return "Composition & Batch";
            case 3: return "Application & Safety";
            case 4: return "Documents & Contact";
            default: return "Basic Information";
        }
    };

    const DocumentUpload = ({ title, fieldName, files, fileRef, description, Icon }) => (
        <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Icon />
                </div>
                {title}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-all duration-200 bg-gray-50/50">
                {files.length > 0 ? (
                    <div className="space-y-3">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-sm font-medium text-gray-800 truncate block">{file.name}</span>
                                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(fieldName, index)}
                                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors ml-3"
                                    disabled={isSubmitting}
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
                        <label htmlFor={`${fieldName}-upload`} className="cursor-pointer">
                            <span className="text-lg font-medium text-gray-800 block mb-1">
                                Click to upload {title.toLowerCase()}
                            </span>
                            <span className="text-sm text-gray-500">{description}</span>
                        </label>
                        <input
                            id={`${fieldName}-upload`}
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

    // Document icon components
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                onClick={handleCloseModal}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
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
                    max-h-[95vh] 
                    overflow-hidden
                    mx-auto
                    my-4
                ">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                                    <StepIcon step={currentStep} />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white">Add New Product</h3>
                                    <p className="text-green-100 font-medium text-sm sm:text-base">{getStepTitle(currentStep)}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
                                disabled={isSubmitting}
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
                                            ? 'bg-green-600 text-white shadow-lg'
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
                                            ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'}
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    {/* Product Image Upload */}
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
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
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                                                }
                                            `}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            {formData.productImage ? (
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Product Preview"
                                                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-lg border-2 border-green-300"
                                                        />
                                                        <div>
                                                            <span className="text-lg font-medium text-gray-800 block">{formData.productImage.name}</span>
                                                            <span className="text-sm text-gray-500">{(formData.productImage.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
                                                        disabled={isSubmitting}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <label htmlFor="image-upload" className="cursor-pointer">
                                                        <span className="text-xl font-semibold text-gray-800 block mb-2">
                                                            Drop your image here or click to browse
                                                        </span>
                                                        <span className="text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</span>
                                                    </label>
                                                    <input
                                                        id="image-upload"
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

                                    {/* Product Name and ID */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="productName"
                                                value={formData.productName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                                placeholder="Enter product name (e.g., K plus)"
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                Product ID *
                                            </label>
                                            <input
                                                type="text"
                                                name="productId"
                                                value={formData.productId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                                placeholder="Enter unique identifier (e.g., k-plus)"
                                                required
                                                disabled={isSubmitting}
                                            />
                                            <small className="text-gray-500 mt-2 text-sm block">Auto-generated from product name</small>
                                        </div>
                                    </div>

                                    {/* Descriptions */}
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                </svg>
                                            </div>
                                            Short Description
                                        </label>
                                        <textarea
                                            name="shortDescription"
                                            value={formData.shortDescription}
                                            onChange={handleInputChange}
                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 resize-none text-base"
                                            rows="2"
                                            placeholder="Enter brief product description"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            Full Description
                                        </label>
                                        <textarea
                                            name="fullDescription"
                                            value={formData.fullDescription}
                                            onChange={handleInputChange}
                                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none text-base"
                                            rows="4"
                                            placeholder="Enter detailed description"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    {/* Composition Section */}
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

                                    {/* Batch Details Section */}
                                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 sm:p-6 border-2 border-blue-300">
                                        <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </div>
                                            Initial Batch Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Batch Number *</label>
                                                <input
                                                    type="text"
                                                    name="batchNumber"
                                                    value={formData.batchNumber}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    placeholder="FET/FP/000049"
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Manufacturing Date</label>
                                                <input
                                                    type="date"
                                                    name="manufacturingDate"
                                                    value={formData.manufacturingDate}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    {/* Documents Section */}
                                    <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-4 sm:p-6 border-2 border-indigo-300">
                                        <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                <DocumentIcon />
                                            </div>
                                            Required Documents
                                        </h4>
                                        <div className="space-y-6">
                                            <DocumentUpload
                                                title="NPS Approval"
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
                                                description="Quality standard files"
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
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contactAddress"
                                                    value={formData.contactAddress}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="123 Main Street, City"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    Phone Numbers
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contactPhones"
                                                    value={formData.contactPhones}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="+1234567890, +0987654321"
                                                    disabled={isSubmitting}
                                                />
                                                <small className="text-gray-600 mt-1 text-sm block">Comma-separated values</small>
                                            </div>
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="contactEmail"
                                                    value={formData.contactEmail}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="contact@example.com"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                                                    </svg>
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    name="contactWebsite"
                                                    value={formData.contactWebsite}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                                                    placeholder="https://www.example.com"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer */}
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
                                            rounded-xl font-semibold 
                                            transition-colors duration-200 
                                            disabled:opacity-50 
                                            flex items-center gap-2
                                            text-sm sm:text-base"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 font-medium order-1 sm:order-2 sm:text-base">
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
                                            bg-green-600 hover:bg-green-700 
                                            text-white 
                                            rounded-xl font-semibold 
                                            transition-colors duration-200 
                                            disabled:opacity-50 
                                            flex items-center gap-2
                                            text-sm sm:text-base"
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
                                        disabled={!formData.productName || !formData.productId || !formData.batchNumber || isSubmitting}
                                        className="
                                            px-6 sm:px-8 py-3 
                                            bg-green-600 hover:bg-green-700 
                                            text-white rounded-xl 
                                            font-semibold 
                                            transition-colors duration-200 
                                            disabled:opacity-50 
                                            flex items-center gap-2
                                            text-sm sm:text-base"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Create Product
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

export default AddProductModal;