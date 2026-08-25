// src/context/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/common/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toastState, setToastState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    duration: 3200,
  });

  const showToast = useCallback(({ title, message, type = 'info', duration = 3200 }) => {
    setToastState({
      visible: true,
      title: title || '',
      message: message || '',
      type,
      duration,
    });
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    showToast({ title, message, type: 'success' });
  }, [showToast]);

  const showError = useCallback((message, title = 'Error') => {
    showToast({ title, message, type: 'error' });
  }, [showToast]);

  const showWarning = useCallback((message, title = 'Notice') => {
    showToast({ title, message, type: 'warning' });
  }, [showToast]);

  const showInfo = useCallback((message, title = 'Info') => {
    showToast({ title, message, type: 'info' });
  }, [showToast]);

  const handleDismiss = useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <Toast
        visible={toastState.visible}
        title={toastState.title}
        message={toastState.message}
        type={toastState.type}
        duration={toastState.duration}
        onDismiss={handleDismiss}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
    };
  }
  return context;
};
