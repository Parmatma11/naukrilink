'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        return;
      }

      // Check if user dismissed it recently
      const dismissed = localStorage.getItem('govtjob_pwa_dismissed');
      if (dismissed && Date.now() - parseInt(dismissed) < 3 * 24 * 60 * 60 * 1000) {
        return; // Don't show if dismissed within last 3 days
      }

      // Check for iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Listen for Android / Chrome / Edge install prompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      // Show iOS tip if on mobile Safari
      if (isIosDevice && !isStandalone) {
        setShowPrompt(true);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSTip(false);
    try {
      localStorage.setItem('govtjob_pwa_dismissed', Date.now().toString());
    } catch (e) {
      // Ignore localStorage restrictions
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="w-full bg-[#8b0000] text-white border-b-2 border-amber-300 py-2 px-3 sm:px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo.svg"
            alt="Govt Job Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-amber-300 shrink-0"
          />
          <div className="min-w-0 text-left">
            <span className="font-extrabold text-xs sm:text-sm text-white block sm:inline">
              Install Govt Job App
            </span>
            <span className="hidden sm:inline text-[11px] sm:text-xs text-amber-200">
              {' '}: Get instant job alerts, offline mode &amp; 1-tap fast loading
            </span>
            <span className="sm:hidden block text-[10px] text-amber-200 leading-none">
              Instant alerts &amp; offline access
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs px-3 py-1.5 rounded-xs shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-amber-300 p-1 transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Popover */}
      {showIOSTip && (
        <div className="max-w-7xl mx-auto mt-2 bg-white text-gray-900 p-3 rounded-xs border-2 border-amber-300 shadow-xl text-xs space-y-2">
          <div className="flex justify-between items-center font-bold text-red-800">
            <span>Install on iPhone / iPad:</span>
            <button onClick={() => setShowIOSTip(false)} className="text-gray-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li className="flex items-center gap-1.5">
              <span>1. Tap the Share button</span>
              <Share className="w-3.5 h-3.5 text-blue-600 inline" />
              <span>at the bottom of Safari.</span>
            </li>
            <li>2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
            <li>3. Tap <strong>&ldquo;Add&rdquo;</strong> in the top right corner.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
