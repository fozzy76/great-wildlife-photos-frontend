import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext.jsx';
import { Lock, ArrowLeft, MapPin } from 'lucide-react';

const stripePromise = fetch('https://api.greatwildlifephotos.com/catalog/config')
  .then(res => res.json())
  .then(data => loadStripe(data.stripe_public_key));

const API_BASE = 'https://api.greatwildlifephotos.com';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const STATE_ABBR = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
  'Ontario': 'ON', 'Quebec': 'QC', 'British Columbia': 'BC', 'Alberta': 'AB',
  'Manitoba': 'MB', 'Saskatchewan': 'SK', 'Nova Scotia': 'NS', 'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL', 'Prince Edward Island': 'PE',
  'Northwest Territories': 'NT', 'Nunavut': 'NU', 'Yukon': 'YT'
};

// ─── Address Autocomplete ────────────────────────────────────────────────────

const AddressAutocomplete = ({ value, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 5) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query, format: 'json', addressdetails: '1', limit: '5', countrycodes: 'us,ca'
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'GreatWildlifePhotos/1.0' }
      });
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error('Nominatim error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  const handleSelect = (item) => {
    const addr = item.address || {};
    const road = addr.road || addr.pedestrian || addr.footway || '';
    const houseNumber = addr.house_number || '';
    const line1 = houseNumber ? `${houseNumber} ${road}` : road;
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const stateFull = addr.state || '';
    const state = STATE_ABBR[stateFull] || stateFull.substring(0, 2).toUpperCase();
    const postal_code = addr.postcode || '';
    const country = addr.country_code ? addr.country_code.toUpperCase() : 'US';
    onSelect({ line1, city, state, postal_code, country });
    onChange(line1);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          id="line1" name="line1" type="text" value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          required className="mt-1 bg-white text-gray-900 pr-8"
          placeholder="Start typing your address..." autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li key={item.place_id} onMouseDown={() => handleSelect(item)}
              className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 text-gray-900 text-sm border-b border-gray-100 last:border-0">
              <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Inner Payment Form (rendered inside <Elements>) ─────────────────────────

const PaymentForm = ({ address, cartItems, amountTotalCents, displayTotal, processing, setProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [errorMessage, setErrorMessage] = useState('');
  const [elementsReady, setElementsReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !elementsReady) return;
    setProcessing(true);
    setErrorMessage('');

        try {
      // Required by Stripe deferred flow: submit elements before async work
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);

      // Create PaymentIntent with final tax-inclusive total
      const intentResponse = await fetch(API_BASE + '/checkout/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            photoId: item.photoId,
            variantId: item.variantId,
            material: item.material,
            quantity: item.quantity,
            image_url: item.photo_url || item.r2_url
          })),
          amountTotalCents: amountTotalCents || null
        })
      });

      const intentData = await intentResponse.json();
      if (!intentData.success) throw new Error(intentData.error || 'Failed to initialize payment');

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: intentData.clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/order-success',
          payment_method_data: {
            billing_details: {
              name: address.name,
              email: address.email,
              address: {
                line1: address.line1,
                line2: address.line2 || '',
                city: address.city,
                state: address.state,
                postal_code: address.postal_code,
                country: address.country
              }
            }
          },
          shipping: {
            name: address.name,
            address: {
              line1: address.line1,
              line2: address.line2 || '',
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) throw new Error(error.message);

      clearCart();
      navigate('/order-success?payment_intent=' + intentData.paymentIntentId);
    } catch (err) {
      setErrorMessage(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!elementsReady && (
        <div className="h-32 bg-muted rounded-lg animate-pulse flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Loading payment form...</p>
        </div>
      )}
      <PaymentElement onReady={() => setElementsReady(true)} />
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mt-4">
          {errorMessage}
        </div>
      )}
      {elementsReady && (
        <Button
          type="submit"
          disabled={!stripe || !elementsReady || processing}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
        >
          <Lock className="w-4 h-4 mr-2" />
          {processing ? 'Processing...' : `Place order · $${displayTotal}`}
        </Button>
      )}
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 mt-3">
        <Lock className="w-3 h-3" />
        Secured by Stripe. Your payment info is never stored on our servers.
      </p>
    </form>
  );
};

// ─── Main Checkout Page ──────────────────────────────────────────────────────

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getSubtotal, getShipping, getTotal } = useCart();

  const [address, setAddress] = useState({
    name: '', email: '', line1: '', line2: '',
    city: '', state: '', postal_code: '', country: 'US'
  });

  const [taxAmount, setTaxAmount] = useState(null);
  const [amountTotalCents, setAmountTotalCents] = useState(null);
  const [displayTotal, setDisplayTotal] = useState(null);
  const [calculatingTax, setCalculatingTax] = useState(false);
  const [taxVerified, setTaxVerified] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Estimate amount in cents for Elements deferred mode (subtotal + shipping, no tax yet)
  const estimatedAmountCents = Math.round(getTotal() * 100);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (['city', 'state', 'postal_code', 'country'].includes(name)) {
      setTaxVerified(false);
      setTaxAmount(null);
    }
  };

  const calculateTax = useCallback(async (addr) => {
    const a = addr || address;
    if (!a.line1 || !a.city || !a.state || !a.postal_code || !a.country) return;
    setCalculatingTax(true);
    setTaxVerified(false);
    try {
      const res = await fetch(API_BASE + '/checkout/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(i => ({ photoId: i.photoId, variantId: i.variantId, quantity: i.quantity })),
          address: {
            line1: a.line1, line2: a.line2 || '',
            city: a.city, state: a.state,
            postal_code: a.postal_code, country: a.country
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setTaxAmount(data.taxAmount);
        setAmountTotalCents(data.amountTotalCents);
        setDisplayTotal(data.amountTotal.toFixed(2));
        setTaxVerified(true);
      } else {
        toast.error('Could not calculate tax. Please verify your address.');
      }
    } catch (err) {
      console.error('Tax error:', err);
    } finally {
      setCalculatingTax(false);
    }
  }, [address, cartItems]);

  const handleAddressSelect = (filled) => {
    const merged = { ...address, ...filled };
    setAddress(merged);
    calculateTax(merged);
  };

  // Debounce tax recalc on manual field edits
  useEffect(() => {
    if (!address.line1 || !address.city || !address.state || !address.postal_code) return;
    const t = setTimeout(() => calculateTax(), 1000);
    return () => clearTimeout(t);
  }, [address.city, address.state, address.postal_code, address.country]);

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#f59e0b', colorBackground: '#1a1a1a',
      colorText: '#ffffff', colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif', borderRadius: '8px'
    }
  };

  // Deferred mode options, no clientSecret needed on mount
  const elementsOptions = {
    mode: 'payment',
    amount: amountTotalCents || estimatedAmountCents,
    currency: 'usd',
    appearance,
    loader: 'always'
  };

  const showTotal = displayTotal !== null ? displayTotal : getTotal().toFixed(2);
  const addressComplete = !!(address.name && address.email && address.line1 && address.city && address.state && address.postal_code);

  if (cartItems.length === 0) return null;

  return (
    <>
      <Helmet>
        <title>Checkout - Great Wildlife Photos</title>
        <meta name="description" content="Complete your wildlife photography print order." />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to cart
          </Button>

          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Address + Payment */}
            <div className="space-y-8">

              {/* Contact */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full name *</Label>
                    <Input id="name" name="name" type="text" value={address.name}
                      onChange={handleFieldChange} required
                      className="mt-1 bg-white text-gray-900" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={address.email}
                      onChange={handleFieldChange} required
                      className="mt-1 bg-white text-gray-900" placeholder="jane@example.com" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Shipping address</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="line1">Address *</Label>
                    <AddressAutocomplete
                      value={address.line1}
                      onChange={(val) => setAddress(prev => ({ ...prev, line1: val }))}
                      onSelect={handleAddressSelect}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Start typing to search, fields fill automatically</p>
                  </div>
                  <div>
                    <Label htmlFor="line2">Apartment, suite, etc.</Label>
                    <Input id="line2" name="line2" type="text" value={address.line2}
                      onChange={handleFieldChange}
                      className="mt-1 bg-white text-gray-900" placeholder="Apt 4B" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" type="text" value={address.city}
                        onChange={handleFieldChange} required
                        className="mt-1 bg-white text-gray-900" placeholder="Las Vegas" />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input id="state" name="state" type="text" value={address.state}
                        onChange={handleFieldChange} required
                        className="mt-1 bg-white text-gray-900" placeholder="NV" maxLength={2} />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">ZIP *</Label>
                      <Input id="postal_code" name="postal_code" type="text" value={address.postal_code}
                        onChange={handleFieldChange} required
                        className="mt-1 bg-white text-gray-900" placeholder="89101" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <select id="country" name="country" value={address.country}
                      onChange={handleFieldChange}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-white text-gray-900 px-3 py-1 text-sm shadow-sm">
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 h-5">
                  {calculatingTax && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                      Calculating tax...
                    </p>
                  )}
                  {taxVerified && !calculatingTax && (
                    <p className="text-xs text-green-500">✓ Tax calculated for your address</p>
                  )}
                </div>
              </div>

              {/* Payment, always mounted in deferred mode, hidden until address complete */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Payment details</h2>
                {!addressComplete ? (
                  <p className="text-sm text-muted-foreground">Complete your shipping address above to enter payment details.</p>
                ) : (
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <PaymentForm
                      address={address}
                      cartItems={cartItems}
                      amountTotalCents={amountTotalCents}
                      displayTotal={showTotal}
                      processing={processing}
                      setProcessing={setProcessing}
                    />
                  </Elements>
                )}
              </div>

            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-card rounded-xl p-6 shadow-lg sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order summary</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.photo_url || 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'}
                        alt={item.title} className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'; }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.material.charAt(0).toUpperCase() + item.material.slice(1)} • {item.size}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${getShipping().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sales tax</span>
                    {taxAmount !== null
                      ? <span>${taxAmount.toFixed(2)}</span>
                      : <span className="text-muted-foreground text-xs italic">Enter address above</span>
                    }
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-xl text-primary">${showTotal}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;