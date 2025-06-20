"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

const Header = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const userDropdownRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        checkAuthStatus();

        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await api.checkAuth();
            
            if (response.data.authenticated) {
                setUser(response.data.user);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/');
        }
    };

    const handleLogout = async () => {
        try {
            await api.signout();
            
            // Clear tokens
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            
            toast.success('Logged out successfully! See you again! 👋');
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
    };

    const getUserInitial = () => {
        return user?.username ? user.username.charAt(0).toUpperCase() : 'A';
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅 Good Morning';
        if (hour < 17) return '☀️ Good Afternoon';
        return '🌙 Good Evening';
    };

    return (
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-4">
                        <div className="h-12 lg:h-16 w-auto relative">
                            <Image
                                src="/LOGO.png" 
                                width={200} 
                                height={80} 
                                alt='Farmers Fertilizer Logo'
                                priority
                                className="h-full w-auto object-contain"
                            />
                        </div>
                        <div className="hidden md:block">
                            <div className="text-lg lg:text-xl font-bold text-gray-800">
                                Farmers Fertilizer
                            </div>
                            <div className="text-sm text-gray-600">
                                Management System
                            </div>
                        </div>
                    </div>

                    {/* User Section */}
                    <div className="flex items-center space-x-4">
                        {/* Greeting (hidden on mobile) */}
                        <div className="hidden lg:block text-right">
                            <div className="text-sm text-gray-600">
                                {getGreeting()}
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                                {user?.username || 'Admin'}
                            </div>
                        </div>

                        {/* User Dropdown */}
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="group flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-2xl p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                title="User Menu"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {getUserInitial()}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                
                                {/* User Info (hidden on mobile) */}
                                <div className="hidden sm:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-gray-800 leading-tight">
                                        {user?.username || 'Admin'}
                                    </span>
                                    <span className="text-xs text-blue-600 capitalize leading-tight font-medium">
                                        {user?.role || 'Administrator'}
                                    </span>
                                </div>
                                
                                {/* Dropdown Arrow */}
                                <svg 
                                    className={`w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:text-blue-600 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 overflow-hidden">
                                    {/* User Info Header */}
                                    <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {getUserInitial()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-base font-semibold text-gray-900 truncate">
                                                    {user?.username || 'Admin'}
                                                </p>
                                                <p className="text-sm text-blue-600 capitalize truncate font-medium">
                                                    {user?.role || 'Administrator'}
                                                </p>
                                                {user?.lastLogin && (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">System Status: Online</span>
                                            </div>
                                        </div>
                                        
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    {new Date().toLocaleDateString('en-US', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logout Button */}
                                    <div className="border-t border-gray-100 py-2">
                                        <button 
                                            className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 flex items-center gap-3 text-red-600 hover:text-red-700 group"
                                            onClick={handleLogout}
                                        >
                                            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold">Sign Out</span>
                                                <div className="text-xs text-red-500">Logout securely</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;