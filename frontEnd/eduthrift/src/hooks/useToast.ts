import { useState } from 'react';

export const useToast = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [color, setColor] = useState<'success' | 'warning' | 'danger'>('success');

  const showToast = (msg: string, toastColor: 'success' | 'warning' | 'danger' = 'success') => {
    setMessage(msg);
    setColor(toastColor);
    setIsOpen(true);
  };

  const hideToast = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    message,
    color,
    showToast,
    hideToast
  };
};