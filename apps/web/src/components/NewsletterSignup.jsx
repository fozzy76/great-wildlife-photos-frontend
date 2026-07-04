import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import TurnstileWidget from '@/components/TurnstileWidget.jsx';
import { toast } from 'sonner';

const NewsletterSignup = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const handleTurnstileVerify = useCallback((token) => setTurnstileToken(token), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      if (turnstileRef.current?.enabled && !turnstileToken) {
        toast.error('Complete the security check first.');
        setLoading(false);
        return;
      }
      const response = await fetch('https://api.greatwildlifephotos.com/api/subscribe'
, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken })
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
      <TurnstileWidget
        ref={turnstileRef}
        onVerify={handleTurnstileVerify}
        theme="dark"
        size="flexible"
        className="min-h-[65px] w-full overflow-hidden"
      />
    </form>
  );
};

export default NewsletterSignup;
