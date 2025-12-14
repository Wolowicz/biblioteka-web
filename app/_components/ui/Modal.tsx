"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// =============================================================================
// TYPY
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  dark?: boolean;
  showCloseButton?: boolean;
}

// =============================================================================
// KOMPONENT
// =============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  dark = false,
  showCloseButton = true,
}: ModalProps) {
  // Escape key handler
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const modalContent = (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`
          modal-content ${sizeClasses[size]} 
          ${dark ? "modal-dark" : ""}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            flex items-center justify-between p-5 border-b
            ${dark ? "border-gray-700" : "border-gray-100"}
          `}>
            {title && (
              <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-lg transition-colors
                  ${dark 
                    ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );

  // Render to portal
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  
  return null;
}

// =============================================================================
// CONFIRM MODAL
// =============================================================================

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Potwierdź",
  cancelText = "Anuluj",
  variant = "info",
  isLoading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      icon: "fa-exclamation-triangle",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "fa-exclamation-circle",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      icon: "fa-info-circle",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
          <i className={`fas ${styles.icon} text-2xl ${styles.iconColor}`} aria-hidden="true"></i>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-slate-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-colors disabled:opacity-50 ${styles.buttonBg}`}
          >
            {isLoading ? (
              <i className="fas fa-spinner animate-spin" aria-hidden="true"></i>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
