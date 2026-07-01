import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { toast } from 'sonner';

const NewsletterSignup = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('https://api.greatwildlifephotos.com/api/subscribe'
, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.status === 409) {
        toast.info("You're already subscribed, keep an eye out for new releases!");
        setEmail('');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      toast.success("You're subscribed! Welcome to Great Wildlife Photos.");
      setEmail('');
    } catch (error) {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 bg-white text-gray-900 placeholder:text-gray-500"
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={loading}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
};

export default NewsletterSignup;