"use client";

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';

const SubmitButton = ({ username, password, rememberMe }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async (e) => {
        e.preventDefault();
        
        if (!username?.trim()) {
            toast.error('Please enter your username');
            return;
        }
        
        if (!password?.trim()) {
            toast.error('Please enter your password');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await api.signin({
                username: username.trim(),
                password: password.trim(),
                rememberMe: Boolean(rememberMe),
            });

            if (response.data?.success || response.status === 200) {
                toast.success('Login successful! Welcome back! 🎉');
                
                // Store token if provided
                if (response.data?.token) {
                    if (rememberMe) {
                        localStorage.setItem('authToken', response.data.token);
                    } else {
                        sessionStorage.setItem('authToken', response.data.token);
                    }
                }

                // Redirect to dashboard with smooth transition
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                throw new Error(response.data?.message || 'Login failed');
            }

        } catch (error) {
            let errorMessage = 'Sign-in failed. Please try again.';
            
            if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
                errorMessage = 'Cannot connect to server. Please check your connection.';
            } else if (error.response?.status === 401) {
                errorMessage = error.response?.data?.message || 'Invalid username or password';
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 'Invalid request data';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="submit"
            className={`w-full relative overflow-hidden rounded-2xl py-4 px-6 font-semibold text-white transition-all duration-300 transform ${
                isLoading || !username?.trim() || !password?.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 hover:scale-105 hover:shadow-2xl active:scale-95'
            } shadow-lg`}
            onClick={handleSignIn}
            disabled={isLoading || !username?.trim() || !password?.trim()}
        >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <div className="relative flex items-center justify-center space-x-3">
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span className="text-lg">Signing In...</span>
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
                        </div>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-lg">Sign In</span>
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </>
                )}
            </div>

            {/* Ripple effect */}
            {!isLoading && (
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
            )}
        </button>
    );
};

export default SubmitButton;