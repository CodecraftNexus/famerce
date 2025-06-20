"use client";

import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [modalData, setModalData] = useState(null);

    const openModal = (type = 'add', data = null) => {
        setModalType(type);
        setModalData(data);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalType('add');
        setModalData(null);
    };

    return (
        <ModalContext.Provider value={{ 
            isOpen, 
            modalType, 
            modalData, 
            openModal, 
            closeModal 
        }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};