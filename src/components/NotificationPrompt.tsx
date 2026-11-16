'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, BellRing, Check, X, ShieldAlert, Loader2 } from 'lucide-react';

// Converts base64 URL safe VAPID key to Uint8Array required by pushManager.subscribe
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPrompt() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Register the service worker
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('ServiceWorker registration failed:', err);
      });
    }
  }, []);

  if (!isSupported) {
    return null;
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      // 1. Request Browser Permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setFeedback(perm === 'denied' ? 'Permission blocked in browser settings.' : 'Permission was not granted.');
        setIsLoading(false);
        return;
      }

      // 2. Wait for Service Worker registration
      const reg = await navigator.serviceWorker.ready;

      // 3. Obtain VAPID Public Key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFyy1-zz-cTGPcW1vHuqtLJ4J2fF05B59Fy3hUkAzrAb0pXvXlEmwT6Mc83kYlY-4Y4k2TkG6BPpuWtt-Bmb_ek';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Subscribe with PushManager
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // 5. Send subscription to backend
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (res.ok) {
        setFeedback('Job Alerts Activated Successfully!');
        setTimeout(() => {
          setIsOpen(false);
        }, 2200);
      } else {
        setFeedback('Failed to save subscription. Please try again.');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setFeedback('Error activating alerts: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setFeedback('You have unsubscribed from alerts.');
      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
      }, 1800);
    } catch (err) {
      console.error('Unsubscribe error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        {permission === 'granted' ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-lg border border-emerald-500 transition-all transform hover:scale-105"
            title="Govt Job Alerts Active"
          >
            <BellRing className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span className="hidden sm:inline">Job Alerts Active</span>
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-2xl border-2 border-amber-300 transition-all transform hover:scale-105 animate-bounce"
            title="Enable Govt Job Alerts"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span>Get Job Alerts</span>
          </button>
        )}
      </div>

      {/* Slide-Up Alert Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-2 border-red-700 rounded-sm shadow-2xl max-w-sm w-full overflow-hidden text-gray-900">
            {/* Modal Header with Circular Logo */}
            <div className="bg-[#8b0000] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.svg"
                  alt="Govt Job Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full border border-amber-300 shrink-0 bg-white"
                />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  Govt Job Notifications
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-amber-200 transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 text-xs space-y-3">
              {permission === 'denied' ? (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xs text-red-800 flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Notifications Blocked</p>
                    <p className="mt-1 text-gray-700">
                      You previously blocked notifications for GovtJob.site. To receive alerts, click the lock/settings icon next to the address bar in your browser and allow Notifications.
                    </p>
                  </div>
                </div>
              ) : permission === 'granted' ? (
                <div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xs text-emerald-900 flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">You are subscribed!</p>
                      <p className="text-[11px] text-gray-600">
                        You will receive instant alerts for new jobs, admit cards, and results directly on this browser.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleUnsubscribe}
                      disabled={isLoading}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded-xs text-xs transition-colors"
                    >
                      {isLoading ? 'Processing...' : 'Turn Off Alerts'}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xs text-xs transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    Never miss a government recruitment opportunity. Subscribe to free instant push alerts directly on your device.
                  </p>

                  <ul className="space-y-1.5 text-gray-700 border-y border-gray-100 py-2">
                    <li className="flex items-center gap-2">
                      <span className="text-red-700 font-bold">✓</span>
                      <span>Instant Railway, SSC, UPSC &amp; Police vacancies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-700 font-bold">✓</span>
                      <span>Immediate Hall Ticket / Admit Card releases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-700 font-bold">✓</span>
                      <span>100% Free • No phone number or account required</span>
                    </li>
                  </ul>

                  {feedback && (
                    <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 text-center font-bold text-xs rounded-xs">
                      {feedback}
                    </div>
                  )}

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xs transition-colors"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleSubscribe}
                      disabled={isLoading}
                      className="w-2/3 bg-[#b91c1c] hover:bg-[#8b0000] text-white font-extrabold py-2 px-3 rounded-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="w-3.5 h-3.5 text-amber-300" />
                          <span>Allow Alerts</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
