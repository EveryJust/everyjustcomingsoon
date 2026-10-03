'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  Check, 
  Search, 
  X, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  Building, 
  Loader2, 
  Plus, 
  CheckCircle2,
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Tag
} from 'lucide-react';
import { 
  COUNTRY_CODES, 
  CountryCode, 
  INDIAN_STATES, 
  fetchCitiesForState, 
  lookupPostalPincode 
} from '@/utils/geoData';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  // Step 1 = Review Your Order (Address & Items)
  // Step 2 = Payment Method & Place Order
  const [step, setStep] = useState<1 | 2>(1);

  // Address Modal Open State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Address Saved Status
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  // Address Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>(COUNTRY_CODES[0]); // Default: India +91

  // Alternate mobile
  const [showAlternatePhone, setShowAlternatePhone] = useState(false);
  const [alternatePhone, setAlternatePhone] = useState('');
  const [altCountryCode, setAltCountryCode] = useState<CountryCode>(COUNTRY_CODES[0]);

  // Address fields
  const [country] = useState('India');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('Kerala');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');

  // Dropdown States for Modal
  const [openCountryDropdown, setOpenCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [openAltCountryDropdown, setOpenAltCountryDropdown] = useState(false);
  const [altCountrySearch, setAltCountrySearch] = useState('');
  const [openStateDropdown, setOpenStateDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // API loading states
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [pincodeLookingUp, setPincodeLookingUp] = useState(false);

  // Order submission
  const [submitting, setSubmitting] = useState(false);

  // UI Accordions
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(true);

  // Payment Selection: strictly Free Cash on Delivery
  const [paymentOption, setPaymentOption] = useState<'cod' | 'online'>('cod');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Refs for closing dropdowns on outside click
  const countryCodeRef = useRef<HTMLDivElement>(null);
  const altCountryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const priceDetailsRef = useRef<HTMLDivElement>(null);

  // Price calculations
  const rawSubtotal = getSubtotal();
  // Simulated original MRP (15% higher to show discount)
  const mrpTotal = Math.round(rawSubtotal * 1.15);
  const baseDiscount = mrpTotal - rawSubtotal;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalDiscount = baseDiscount + couponDiscount;
  const finalPayable = Math.max(0, rawSubtotal - couponDiscount);

  // Estimated delivery date (5 days ahead)
  const deliveryDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  })();

  // Load existing saved address & available coupons on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved_shipping_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName && parsed.phone && parsed.pincode && parsed.street) {
          setFullName(parsed.fullName || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setAlternatePhone(parsed.alternatePhone || '');
          setShowAlternatePhone(!!parsed.alternatePhone);
          setPincode(parsed.pincode || '');
          setState(parsed.state || 'Kerala');
          setCity(parsed.city || '');
          setStreet(parsed.street || '');
          setLandmark(parsed.landmark || '');
          setHasSavedAddress(true);
        }
      } else {
        const storedAddrs = localStorage.getItem('everyjust_user_addresses');
        if (storedAddrs) {
          const addrs = JSON.parse(storedAddrs);
          const def = addrs.find((a: any) => a.isDefault) || addrs[0];
          if (def && def.fullName && def.phone && def.street) {
            setFullName(def.fullName || '');
            setEmail(def.email || '');
            setPhone(def.phone || '');
            setPincode(def.pincode || '');
            setState(def.state || 'Kerala');
            setCity(def.city || '');
            setStreet(def.street || '');
            setLandmark(def.landmark || '');
            setHasSavedAddress(true);
          }
        }
      }
    } catch {
      // ignore
    }

    // Fetch live available coupons
    fetch('/api/coupons/available')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.coupons) {
          setAvailableCoupons(data.coupons);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setOpenCountryDropdown(false);
      }
      if (altCountryRef.current && !altCountryRef.current.contains(event.target as Node)) {
        setOpenAltCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setOpenStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setOpenCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!state) return;
    let isCurrent = true;
    setLoadingCities(true);

    fetchCitiesForState(state).then((cities) => {
      if (isCurrent) {
        setCitiesList(cities);
        setLoadingCities(false);
        if (cities.length > 0 && !cities.includes(city)) {
          setCity(cities[0]);
        }
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [state]);

  // Handle PIN code auto-lookup
  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);

    if (clean.length === 6) {
      setPincodeLookingUp(true);
      const res = await lookupPostalPincode(clean);
      setPincodeLookingUp(false);
      if (res && res.state) {
        const matchedState = INDIAN_STATES.find(
          s => s.toLowerCase() === res.state?.toLowerCase()
        ) || res.state;
        setState(matchedState);

        if (res.city) {
          setCity(res.city);
        }
        toast.success(`PIN verified: ${res.city || res.district || ''}, ${matchedState}`);
      } else {
        toast.error('Could not auto-detect PIN code. Please select State & City manually.');
      }
    }
  };

  // Save address from Modal
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (showAlternatePhone && alternatePhone.trim()) {
      const cleanAlt = alternatePhone.replace(/\D/g, '');
      if (cleanAlt.length < 10) {
        toast.error('Please enter a valid 10-digit alternate mobile number');
        return;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }
    if (!state.trim()) {
      toast.error('Please select your state');
      return;
    }
    if (!city.trim()) {
      toast.error('Please enter or select your city');
      return;
    }
    if (!street.trim()) {
      toast.error('Please enter flat/house number and street address');
      return;
    }

    const addressObj = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim().slice(-10),
      alternatePhone: showAlternatePhone && alternatePhone.trim() ? alternatePhone.trim() : '',
      country,
      pincode: pincode.trim(),
      state: state.trim(),
      city: city.trim(),
      street: street.trim(),
      landmark: landmark.trim(),
    };

    try {
      localStorage.setItem('saved_shipping_address', JSON.stringify(addressObj));
      localStorage.setItem('last_customer_email', email.trim());
      localStorage.setItem('last_customer_phone', phone.trim().slice(-10));

      // Also persist to everyjust_user_addresses so it appears on Account/Addresses
      let currentAddresses: any[] = [];
      const stored = localStorage.getItem('everyjust_user_addresses');
      if (stored) {
        currentAddresses = JSON.parse(stored);
      }
      const newAddrItem = {
        id: `addr_${Date.now()}`,
        fullName: addressObj.fullName,
        email: addressObj.email,
        phone: addressObj.phone,
        pincode: addressObj.pincode,
        street: addressObj.street,
        city: addressObj.city,
        state: addressObj.state,
        landmark: addressObj.landmark,
        addressType: 'Home',
        isDefault: true
      };

      const filtered = currentAddresses.filter(
        (a) =>
          `${a.street?.toLowerCase().replace(/[^a-z0-9]/g, '')}_${a.pincode?.replace(/\D/g, '')}` !==
          `${newAddrItem.street.toLowerCase().replace(/[^a-z0-9]/g, '')}_${newAddrItem.pincode.replace(/\D/g, '')}`
      );
      const updatedList = [newAddrItem, ...filtered.map((a) => ({ ...a, isDefault: false }))];
      localStorage.setItem('everyjust_user_addresses', JSON.stringify(updatedList));

      // Trigger background sync
      fetch('/api/user/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addressObj.email,
          phone: addressObj.phone,
          clientAddresses: updatedList
        })
      }).catch(() => {});
    } catch {
      // ignore
    }

    setHasSavedAddress(true);
    setIsAddressModalOpen(false);
    toast.success('Delivery address saved successfully!');
  };

  // Step 1: Proceed to Step 2
  const handleStep1Continue = () => {
    if (!hasSavedAddress || !fullName.trim() || !phone.trim() || !street.trim()) {
      toast.error('Please add your delivery address to continue');
      setIsAddressModalOpen(true);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(2);
  };

  // Coupon Handlers with Real-Time Database Validation
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (rawSubtotal <= 0) {
      toast.error('Your cart is empty');
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: rawSubtotal })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid coupon code');
      }

      setAppliedCoupon({ 
        code: data.coupon.code, 
        discount: data.coupon.calculatedDiscount 
      });
      setCouponInput('');
      toast.success(`Coupon '${data.coupon.code}' applied! Saved ₹${data.coupon.calculatedDiscount}`);
    } catch (err: any) {
      toast.error(err.message || 'Error validating coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (!appliedCoupon) return;
    const removedCode = appliedCoupon.code;
    setAppliedCoupon(null);
    toast.success(`Coupon '${removedCode}' removed`);
  };

  // Step 2: Final Order Placement
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty. Please add products to checkout.');
      return;
    }

    if (!hasSavedAddress || !fullName.trim() || !phone.trim() || !street.trim()) {
      toast.error('Please add your delivery address before placing order');
      setStep(1);
      setIsAddressModalOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const fullPrimaryPhone = `${countryCode.dialCode} ${phone.trim()}`;
      const fullAlternatePhone = showAlternatePhone && alternatePhone.trim()
        ? `${altCountryCode.dialCode} ${alternatePhone.trim()}`
        : undefined;

      const orderPayload = {
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: fullPrimaryPhone,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: fullPrimaryPhone,
          alternatePhone: fullAlternatePhone,
          country,
          street: street.trim(),
          landmark: landmark.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        items: items.map((item) => ({
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty
        })),
        subtotal: rawSubtotal,
        discountAmount: couponDiscount,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        totalAmount: finalPayable
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      try {
        localStorage.setItem('last_placed_order_number', data.orderNumber);
        localStorage.setItem('last_customer_email', email.trim());
        localStorage.setItem('last_customer_phone', phone.trim().slice(-10));
        sessionStorage.setItem('lastOrder', JSON.stringify({
          ...orderPayload,
          orderNumber: data.orderNumber
        }));

        fetch('/api/user/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            phone: phone.trim().slice(-10)
          })
        }).catch(() => {});
      } catch {
        // ignore storage errors
      }

      clearCart();
      toast.success('Order placed successfully! Redirecting...');
      router.push(`/order-confirmation?orderNumber=${encodeURIComponent(data.orderNumber)}`);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      toast.error(err.message || 'Something went wrong while placing your order. Please try again.');
      setSubmitting(false);
    }
  };

  // Scroll to Price details accordion on mobile
  const scrollToPriceDetails = () => {
    setIsPriceDetailsOpen(true);
    if (priceDetailsRef.current) {
      priceDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filter country codes
  const filteredCountryCodes = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch)
  );

  const filteredAltCountryCodes = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(altCountrySearch.toLowerCase()) ||
    c.dialCode.includes(altCountrySearch)
  );

  const filteredStates = INDIAN_STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = citiesList.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Empty cart fallback
  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white max-w-sm w-full p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6 text-xs leading-relaxed">
            Add items to your cart to proceed with Free Cash on Delivery.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f4] min-h-screen pb-28 lg:pb-16 flex justify-center">
      {/* 
        Responsive Container:
        - Mobile (< lg): constrained to w-full max-w-md, white background, single column with bottom bar
        - Desktop (>= lg): expands to max-w-6xl, full 2-column e-commerce checkout with desktop header & sidebar
      */}
      <div className="w-full max-w-md lg:max-w-6xl bg-white lg:bg-transparent min-h-screen shadow-sm lg:shadow-none flex flex-col relative border-x border-gray-100 lg:border-none lg:px-6 lg:py-8">

        {/* ========================================================================= */}
        {/* DESKTOP SECURE CHECKOUT HEADER (>= lg)                                    */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div>
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tight text-gray-950">
                every<span className="text-primary">just</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              256-Bit SSL Encrypted &amp; Verified Checkout
            </p>
          </div>

          {/* Desktop Stepper */}
          <div className="flex items-center gap-4">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2.5 text-sm cursor-pointer ${
                step === 1 ? 'text-primary font-bold' : 'text-gray-600 font-medium hover:text-gray-900'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step > 1 ? 'bg-primary text-white' : step === 1 ? 'bg-primary text-white shadow-sm' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <span>Review Order &amp; Address</span>
            </button>

            <div className={`w-12 h-0.5 ${step > 1 ? 'bg-primary' : 'bg-gray-200'}`} />

            {/* Step 2 */}
            <div className={`flex items-center gap-2.5 text-sm ${
              step === 2 ? 'text-primary font-bold' : 'text-gray-400 font-medium'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 2 ? 'bg-primary text-white shadow-sm' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span>Payment Method</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE HEADER BAR (< lg, MEESHO STYLE)                                    */}
        {/* ========================================================================= */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (step === 2) {
                  setStep(1);
                } else {
                  router.back();
                }
              }}
              className="p-1 -ml-1 text-gray-700 hover:text-black transition-colors cursor-pointer"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="text-sm font-extrabold tracking-wider text-gray-900 uppercase">
              {step === 1 ? 'REVIEW YOUR ORDER' : 'PAYMENT METHOD'}
            </h1>
          </div>

          {/* Step Pill */}
          <div className="px-2.5 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px] font-bold font-mono tracking-tight">
            STEP {step}/2
          </div>
        </header>

        {/* Brand Green Offer Ribbon Banner (Only shown when coupon is applied) */}
        {appliedCoupon && (
          <div className="bg-[#E8F5E9] text-[#2E7D32] px-4 py-2 text-center text-xs font-bold border-b border-[#C8E6C9] lg:rounded-xl lg:border lg:mb-6 flex items-center justify-center gap-1.5 shadow-2xs animate-in fade-in">
            <span>🎉 Coupon &apos;{appliedCoupon.code}&apos; applied! Reduced ₹{appliedCoupon.discount} on this order • Free Cash on Delivery</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN RESPONSIVE CONTENT AREA (Mobile: Stack / Desktop: 2-Column Grid)    */}
        {/* ========================================================================= */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start flex-1 flex flex-col p-4 lg:p-0">

          {/* LEFT COLUMN: Main step content (col-span-8 on desktop) */}
          <div className="lg:col-span-8 space-y-4">

            {/* SCREEN 1: REVIEW YOUR ORDER (STEP 1/2) */}
            {step === 1 && (
              <>
                {/* 1. Products Card (Ordered Items on Top) */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                    Order Items ({items.length})
                  </h3>

                  {items.map((item, idx) => (
                    <div key={item.id} className={`flex gap-3.5 ${idx > 0 ? 'pt-3.5 border-t border-gray-100' : ''}`}>
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.image || '/dash_camera.png'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-gray-950">₹{item.price}</span>
                          <span className="text-xs text-gray-400 line-through">₹{Math.round(item.price * 1.15)}</span>
                          <span className="text-[11px] font-bold text-primary">11% Off</span>
                        </div>

                        <p className="text-[11px] text-gray-500 mt-1">All issue easy returns</p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                          <span>Size: Free Size</span>
                          <span>•</span>
                          <span>Qty: {item.qty}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Sold by: <strong className="text-gray-800">EveryJust Official</strong></span>
                  </div>
                </div>

                {/* 2. Estimated Delivery & Delivery Address Card (Below Ordered Items) */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                  {/* Delivery ETA Header */}
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 pb-3 border-b border-gray-100">
                    <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <span>Estimated Delivery by {deliveryDateStr}</span>
                  </div>

                  {/* Address details */}
                  <div className="pt-3">
                    {hasSavedAddress && fullName && phone && street ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs text-gray-700 space-y-1 pr-2">
                          <div className="font-bold text-gray-950 flex items-center gap-1.5 text-sm">
                            <span>{fullName}</span>
                            <span className="text-gray-400">•</span>
                            <span>{phone}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed text-xs">
                            {street}{landmark ? `, ${landmark}` : ''}, {city}, {state} - {pincode}
                          </p>
                          {showAlternatePhone && alternatePhone && (
                            <p className="text-gray-500 text-[11px]">
                              Alt Mobile: {alternatePhone}
                            </p>
                          )}
                        </div>

                        {/* Change Button */}
                        <button
                          type="button"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="px-4 py-2 rounded-lg border border-primary/40 text-primary text-xs font-bold hover:bg-primary/5 transition-colors flex-shrink-0 shadow-2xs cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <MapPin className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
                        <p className="text-xs font-semibold text-gray-700 mb-1">No Delivery Address Added</p>
                        <p className="text-[11px] text-gray-500 mb-3">Please provide your address so we can deliver your package</p>
                        <button
                          type="button"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Add Delivery Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Apply Coupon Option Card (Below Delivery Address) */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Apply Coupon
                      </h3>
                    </div>
                    {appliedCoupon && (
                      <span className="text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                        ₹{appliedCoupon.discount} Saved
                      </span>
                    )}
                  </div>

                  <div className="pt-3">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50/70 border border-green-200 rounded-xl p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-green-900 tracking-wider font-mono">
                                {appliedCoupon.code}
                              </span>
                              <span className="text-[10px] font-bold bg-green-200/80 text-green-900 px-1.5 py-0.5 rounded">
                                APPLIED
                              </span>
                            </div>
                            <p className="text-[11px] text-green-700 font-medium mt-0.5">
                              Extra ₹{appliedCoupon.discount} discount applied to your order
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleApplyCoupon();
                          }}
                          className="flex items-center gap-2"
                        >
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="ENTER COUPON CODE"
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal uppercase tracking-wider focus:outline-none focus:border-primary focus:bg-white transition-all"
                            />
                            {couponInput && (
                              <button
                                type="button"
                                onClick={() => setCouponInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={validatingCoupon}
                            onClick={() => handleApplyCoupon()}
                            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex-shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {validatingCoupon ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              'Apply'
                            )}
                          </button>
                        </form>

                        {/* Quick Clickable Dynamic Suggestions */}
                        {availableCoupons.length > 0 && (
                          <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                            <span className="text-gray-500 font-medium">Available:</span>
                            {availableCoupons.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                disabled={validatingCoupon}
                                onClick={() => handleApplyCoupon(c.code)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-700 rounded-lg border border-dashed border-gray-300 hover:border-primary font-mono font-bold transition-all cursor-pointer"
                              >
                                <span>{c.code}</span>
                                <span className="text-[10px] font-normal text-gray-500">
                                  • {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                                  {c.min_order_amount > 0 ? ` (Min ₹${c.min_order_amount})` : ''}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop-only continue button under left column */}
                <div className="hidden lg:flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleStep1Continue}
                    className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* SCREEN 2: PAYMENT METHOD (STEP 2/2) */}
            {step === 2 && (
              <>
                {/* 1. Payment Option: Cash on Delivery Card (Active & Selected on Top) */}
                <div 
                  onClick={() => setPaymentOption('cod')}
                  className={`rounded-2xl border-2 p-5 cursor-pointer transition-all bg-white relative ${
                    paymentOption === 'cod' 
                      ? 'border-primary bg-primary/5 shadow-xs' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-gray-950">₹{finalPayable}</span>
                      <div className="h-4 w-px bg-gray-200" />
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <span>Cash on Delivery (Free COD)</span>
                        <span className="text-base">💵</span>
                      </div>
                    </div>

                    {/* Radio Circle */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentOption === 'cod' ? 'border-primary bg-white' : 'border-gray-300'
                    }`}>
                      {paymentOption === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Zero advance payment required. Pay in Cash or scan UPI QR code upon arrival at your doorstep.
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-200/70 flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <CheckCircle2 className="w-4 h-4" /> 100% Free Delivery in India
                    </span>
                    <span className="text-gray-500">Pay Cash / UPI on Delivery</span>
                  </div>
                </div>

                {/* 2. Delivery Destination Summary Card (Below Payment Method) */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-900 text-sm">Delivering to</span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Change Address
                    </button>
                  </div>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm pt-1">{fullName} • {phone}</p>
                  <p className="text-gray-600 text-xs">
                    {street}, {city}, {state} - {pincode}
                  </p>
                  {showAlternatePhone && alternatePhone && (
                    <p className="text-gray-500 text-[11px]">Alt Contact: {alternatePhone}</p>
                  )}
                </div>

                {/* Desktop-only back & place order button under left column */}
                <div className="hidden lg:flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 text-gray-600 hover:text-gray-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Order Review</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                    className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Placing Your Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Confirm &amp; Place Order (₹{finalPayable})</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>

          {/* RIGHT COLUMN: Sidebar (Order Summary & Price Details) (col-span-4 on desktop) */}
          <div className="lg:col-span-4 space-y-4 mt-4 lg:mt-0 lg:sticky lg:top-6">
            
            {/* Price Details Card Accordion */}
            <div ref={priceDetailsRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setIsPriceDetailsOpen(!isPriceDetailsOpen)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-gray-900 bg-white hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <span>Price Details ({items.length} {items.length === 1 ? 'Item' : 'Items'})</span>
                {isPriceDetailsOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {isPriceDetailsOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-xs space-y-2.5">
                  <div className="flex justify-between text-gray-600">
                    <span>Product Price</span>
                    <span className="font-semibold text-gray-800">+ ₹{mrpTotal}</span>
                  </div>

                  <div className="flex justify-between text-primary font-medium">
                    <span>Total Discounts</span>
                    <span>- ₹{totalDiscount > 0 ? totalDiscount : 28}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#2E7D32] font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Coupon ({appliedCoupon.code})
                      </span>
                      <span>- ₹{appliedCoupon.discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="font-bold text-primary">FREE</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-950">
                    <span>Order Total</span>
                    <span>₹{finalPayable}</span>
                  </div>
                </div>
              )}

              {/* Desktop Direct CTA inside sidebar */}
              <div className="hidden lg:block p-4 bg-gray-50 border-t border-gray-100">
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleStep1Continue}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm shadow-primary/20 cursor-pointer"
                  >
                    Continue to Payment
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing...
                      </>
                    ) : (
                      'Confirm & Place Order'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Trust & Guarantee Box */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>EveryJust Trust &amp; Safety</span>
              </div>
              <ul className="text-gray-600 space-y-1.5 text-[11px] leading-relaxed pl-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />
                  <span>Free Cash on Delivery on all orders</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />
                  <span>Inspect package before paying</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />
                  <span>Pay via Cash or UPI at doorstep</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* MOBILE STICKY BOTTOM BAR (< lg only)                                      */}
        {/* ========================================================================= */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 shadow-lg flex justify-center">
          <div className="w-full max-w-md flex items-center justify-between">
            {/* Price info on left */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-gray-950">₹{finalPayable}</span>
                {totalDiscount > 0 && (
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    ₹{totalDiscount} OFF
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={scrollToPriceDetails}
                className="text-[11px] font-bold text-primary hover:underline uppercase tracking-tight block text-left cursor-pointer"
              >
                VIEW PRICE DETAILS
              </button>
            </div>

            {/* Action button on right */}
            {step === 1 ? (
              <button
                type="button"
                onClick={handleStep1Continue}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-lg transition-colors shadow-sm shadow-primary/20 cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handlePlaceOrder}
                className="px-7 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-lg transition-colors shadow-sm shadow-primary/20 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Placing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ADD / EDIT ADDRESS MODAL (POPUP BOTTOM SHEET ON MOBILE, CENTER ON DESKTOP) */}
        {/* ========================================================================= */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
              
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900">
                    {hasSavedAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Scrollable Body */}
              <form onSubmit={handleSaveAddress} noValidate className="p-5 space-y-4 overflow-y-auto flex-1">
                
                {/* Country (India default) */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800">
                    <span className="text-base">🇮🇳</span>
                    <span>India</span>
                    <span className="ml-auto text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">All pincodes deliverable</span>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Shamveel"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Mobile Number with Country Code Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    
                    {/* Country Code Picker */}
                    <div ref={countryCodeRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenCountryDropdown(!openCountryDropdown)}
                        className="h-full flex items-center gap-1.5 px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-100 cursor-pointer"
                      >
                        <span>{countryCode.flag}</span>
                        <span>{countryCode.dialCode}</span>
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      </button>

                      {openCountryDropdown && (
                        <div className="absolute z-50 left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              type="text"
                              autoFocus
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country..."
                              className="w-full px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCountryCodes.map((item) => (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => {
                                  setCountryCode(item);
                                  setOpenCountryDropdown(false);
                                  setCountrySearch('');
                                }}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>{item.flag}</span>
                                  <span>{item.name}</span>
                                </span>
                                <span className="text-gray-400 font-mono">{item.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div className="relative flex-grow">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Alternate Mobile Number Toggle */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">
                        Add Alternate Mobile Number
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Helpful if main number is unreachable
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={showAlternatePhone}
                      onClick={() => setShowAlternatePhone(!showAlternatePhone)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        showAlternatePhone ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          showAlternatePhone ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {showAlternatePhone && (
                    <div className="mt-3 pt-2.5 border-t border-gray-200 flex gap-2">
                      <div ref={altCountryRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenAltCountryDropdown(!openAltCountryDropdown)}
                          className="h-full flex items-center gap-1 px-2 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 cursor-pointer"
                        >
                          <span>{altCountryCode.flag}</span>
                          <span>{altCountryCode.dialCode}</span>
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>

                        {openAltCountryDropdown && (
                          <div className="absolute z-50 left-0 top-full mt-1 w-60 bg-white rounded-xl shadow-xl border border-gray-200 py-1">
                            <input
                              type="text"
                              autoFocus
                              value={altCountrySearch}
                              onChange={(e) => setAltCountrySearch(e.target.value)}
                              placeholder="Search country..."
                              className="w-full px-2 py-1 bg-gray-50 border-b border-gray-200 text-xs"
                            />
                            <div className="max-h-40 overflow-y-auto">
                              {filteredAltCountryCodes.map((item) => (
                                <button
                                  key={item.code}
                                  type="button"
                                  onClick={() => {
                                    setAltCountryCode(item);
                                    setOpenAltCountryDropdown(false);
                                    setAltCountrySearch('');
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1 text-left text-xs hover:bg-gray-50 cursor-pointer"
                                >
                                  <span>{item.flag} {item.name}</span>
                                  <span className="text-gray-400">{item.dialCode}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        type="tel"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                        placeholder="Alternate 10-digit number"
                        className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. shamveel@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* PIN code, State, City row */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* PIN Code */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="6 Digits"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-bold"
                      />
                      {pincodeLookingUp && (
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  {/* State Search & Select */}
                  <div ref={stateRef} className="relative">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenStateDropdown(!openStateDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 text-left cursor-pointer"
                    >
                      <span className="truncate">{state || 'Select State'}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    </button>

                    {openStateDropdown && (
                      <div className="absolute z-50 left-0 right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 py-1">
                        <div className="p-2 border-b border-gray-100">
                          <input
                            type="text"
                            autoFocus
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                            placeholder="Search state..."
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredStates.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                setState(st);
                                setOpenStateDropdown(false);
                                setStateSearch('');
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                            >
                              <span>{st}</span>
                              {state === st && <Check className="w-3 h-3 text-primary" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* City Search & Select */}
                  <div ref={cityRef} className="relative">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>City <span className="text-red-500">*</span></span>
                      {loadingCities && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={city}
                        onClick={() => setOpenCityDropdown(true)}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setCitySearch(e.target.value);
                          setOpenCityDropdown(true);
                        }}
                        placeholder="City"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setOpenCityDropdown(!openCityDropdown)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {openCityDropdown && (
                      <div className="absolute z-50 left-0 right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 py-1">
                        <div className="p-2 border-b border-gray-100">
                          <input
                            type="text"
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            placeholder="Filter cities..."
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs"
                          />
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {filteredCities.length > 0 ? (
                            filteredCities.map((ct) => (
                              <button
                                key={ct}
                                type="button"
                                onClick={() => {
                                  setCity(ct);
                                  setOpenCityDropdown(false);
                                  setCitySearch('');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                              >
                                <span>{ct}</span>
                                {city === ct && <Check className="w-3 h-3 text-primary" />}
                              </button>
                            ))
                          ) : (
                            <div className="p-2 text-center text-xs text-gray-400">
                              Type city name in input above
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Flat, House No., Building, Street */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    House No. / Building / Street <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Kuvvappuram, Palakkalvetta, Star Plus"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium resize-none"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Star Plus, School Road"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium"
                  />
                </div>

                {/* Modal Action Button */}
                <div className="pt-2 sticky bottom-0 bg-white">
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-xl transition-colors shadow-sm shadow-primary/20 cursor-pointer"
                  >
                    Save Address &amp; Deliver Here
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
