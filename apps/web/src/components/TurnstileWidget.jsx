import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const API_BASE = 'https://api.greatwildlifephotos.com';
let authConfigPromise = null;

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile-script]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function getAuthConfig() {
  if (!authConfigPromise) {
    authConfigPromise = fetch(API_BASE + '/auth/config', { cache: 'no-store' })
      .then(response => response.json())
      .catch(() => ({ turnstile: { enabled: false, siteKey: '' } }));
  }
  return authConfigPromise;
}

const TurnstileWidget = forwardRef(function TurnstileWidget({
  onVerify,
  className = '',
  theme = 'auto',
  size = 'normal'
}, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useImperativeHandle(ref, () => ({
    reset() {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
      onVerify('');
    },
    enabled
  }), [enabled, onVerify]);

  useEffect(() => {
    let cancelled = false;
    async function renderWidget() {
      const envSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
      const config = await getAuthConfig();
      const siteKey = envSiteKey || config?.turnstile?.siteKey || '';
      const shouldEnable = Boolean(siteKey && (envSiteKey || config?.turnstile?.enabled));
      if (cancelled || !shouldEnable) return;
      setEnabled(true);
      await loadTurnstileScript();
      if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: token => onVerify(token),
        'expired-callback': () => onVerify(''),
        'error-callback': () => onVerify('')
      });
    }
    renderWidget();
    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (_) {}
      }
    };
  }, [onVerify]);

  return <div ref={containerRef} className={className} />;
});

export default TurnstileWidget;
