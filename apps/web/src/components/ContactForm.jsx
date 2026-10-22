import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import TurnstileWidget from '@/components/TurnstileWidget.jsx';
import { toast } from 'sonner';
import { trackFormSubmit } from '@/lib/analytics.js';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const handleTurnstileVerify = useCallback((token) => setTurnstileToken(token), []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (turnstileRef.current?.enabled && !turnstileToken) {
        toast.error('Complete the security check first.');
        setLoading(false);
        return;
      }
      const response = await fetch('https://api.greatwildlifephotos.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      trackFormSubmit();
      toast.success("Message sent! Lynn will get back to you within 1–2 business days.");
      setFormData({ name: '', email: '', message: '' });
      turnstileRef.current?.reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again or email lynn@greatwildlifephotos.com directly.');
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-foreground">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="message" className="text-foreground">Message</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="mt-2 bg-white text-gray-900 placeholder:text-gray-500"
          disabled={loading}
        />
      </div>

      <TurnstileWidget ref={turnstileRef} onVerify={handleTurnstileVerify} />

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
};

export default ContactForm;
