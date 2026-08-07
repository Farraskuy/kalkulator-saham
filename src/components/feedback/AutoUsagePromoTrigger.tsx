'use client';

import React, { useEffect, useState } from 'react';
import LoginPromoModal from './LoginPromoModal';

export default function AutoUsagePromoTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me-user')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          // Already logged in
          return;
        }

        // Count calculator usage
        const count = parseInt(localStorage.getItem('calc_use_count') || '0', 10) + 1;
        localStorage.setItem('calc_use_count', count.toString());

        // Trigger promo on 3rd calculation
        if (count >= 3 && !sessionStorage.getItem('promo_dismissed')) {
          setIsOpen(true);
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('promo_dismissed', 'true');
    setIsOpen(false);
  };

  return <LoginPromoModal isOpen={isOpen} onClose={handleClose} />;
}
