import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = '确认', cancelLabel = '取消',
  variant = 'default', onConfirm, onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative glass-card p-6 max-w-sm w-full"
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-noir-500 hover:text-noir-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              {variant === 'danger' && (
                <div className="p-2 rounded-full bg-red-500/10 text-red-400">
                  <AlertTriangle size={20} />
                </div>
              )}
              <div>
                <h3 className="font-display text-lg font-semibold text-noir-100 mb-1">{title}</h3>
                <p className="text-sm text-noir-400 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={onCancel} className="btn-ghost text-sm">{cancelLabel}</button>
              <button
                onClick={onConfirm}
                className={variant === 'danger'
                  ? 'px-5 py-2 rounded-xl font-medium text-white bg-red-500/80 hover:bg-red-500 transition-colors text-sm'
                  : 'btn-gold text-sm'
                }
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
