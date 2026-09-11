'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'kenya-govdash-pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed/standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissTime = parseInt(dismissed, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 3s delay for non-intrusive UX
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If no beforeinstallprompt event after 10s, show iOS instructions for Safari users
    const iosTimer = setTimeout(() => {
      if (!deferredPrompt) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
          setShow(true);
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(iosTimer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShow(false);
        setDeferredPrompt(null);
      }
    } else {
      // iOS — show instructions
      setShow(false);
      alert('To install on iOS:\n\n1. Tap the Share button (📋)\n2. Select "Add to Home Screen"\n3. Tap "Add"');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!show || isStandalone) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-emerald-200 bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Smartphone className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Install Kenya GovDash</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Add to your home screen for quick access — works offline with cached county data.
          </p>
          <Button onClick={handleInstall} size="sm" className="mt-2 w-full">
            <Download className="mr-2 h-3 w-3" />
            Install app
          </Button>
        </div>
      </div>
    </div>
  );
}
