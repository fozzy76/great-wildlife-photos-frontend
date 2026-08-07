import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import TurnstileWidget from '@/components/TurnstileWidget.jsx';
import { trackNewsletterSignup } from '@/lib/analytics.js';
import { toast } from 'sonner';

const NewsletterSignup = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  // Mirror the token in a ref as well as state: the wait below runs inside an
  // event handler and would otherwise only ever see the token captured when
  // this render closed over it.
  const tokenRef = useRef('');
  const handleTurnstileVerify = useCallback((token) => {
    tokenRef.current = token;
    setTurnstileToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // The widget is interaction-only here, so it is invisible and issues its
      // token silently a moment after load. Telling someone to "complete the
      // security check" would point at something they cannot see — so wait
      // briefly for the token instead, and only fail if it never arrives.
      let token = tokenRef.current || turnstileToken;
      if (turnstileRef.current?.enabled && !token) {
        const deadline = Date.now() + 5000;
        while (!tokenRef.current && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 150));
        }
        token = tokenRef.current;
      }
      if (turnstileRef.current?.enabled && !token) {
        toast.error('Security check could not complete. Please try again.');
        turnstileRef.current?.reset();
        setLoading(false);
        return;
      }
      const response = await fetch('https://api.greatwildlifephotos.com/api/subscribe'
, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: token })
      });

      const data = await response.json();

      if (response.status === 409) {
        toast.info("You're already subscribed, keep an eye out for new releases!");
        setEmail('');
        turnstileRef.current?.reset();
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      toast.success("You're subscribed! Welcome to Great Wildlife Photos.");
      trackNewsletterSignup();
      setEmail('');
      turnstileRef.current?.reset();
    } catch (error) {
      toast.error('Subscription failed. Please try again.');
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-w-0 flex-1 bg-white text-gray-900 placeholder:text-gray-500"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading}
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
      {/* Footer subscribe is a small, single-field form — a full Turnstile
          widget dominates it. interaction-only stays invisible and issues a
          token silently, only surfacing if Cloudflare decides a challenge is
          warranted. No reserved height, so there is no empty gap when it is
          invisible; it sizes itself if a challenge does appear. */}
      <TurnstileWidget
        ref={turnstileRef}
        onVerify={handleTurnstileVerify}
        theme="dark"
        size="flexible"
        appearance="interaction-only"
        className="w-full overflow-hidden empty:hidden"
      />
    </form>
  );
};

export default NewsletterSignup;
