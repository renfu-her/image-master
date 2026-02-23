import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, ShieldCheck, CreditCard, Lock, Award } from 'lucide-react';

const Upgrade: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('paypal');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { upgradeToPremium, user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        navigate('/login');
        return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      upgradeToPremium();
      setIsProcessing(false);
      navigate('/');
    }, 1500);
  };

  // Card input formatter
  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(\d{4})(?=\d)/g, "$1 ");
      setCardNumber(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center py-12 px-4 transition-colors duration-300">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">Upgrade to Premium</h1>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Monthly */}
            <div 
                onClick={() => setBillingCycle('monthly')}
                className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all bg-white shadow-sm ${
                    billingCycle === 'monthly' ? 'border-orange-400 shadow-xl shadow-orange-500/10 z-10' : 'border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
                {billingCycle === 'monthly' && (
                    <div className="absolute inset-0 rounded-2xl border-4 border-orange-300/30 pointer-events-none"></div>
                )}
                <div className="text-center">
                    <p className="text-gray-500 font-medium mb-1">Monthly</p>
                    <p className="text-3xl font-extrabold text-gray-900">NT$230</p>
                </div>
            </div>

            {/* Yearly */}
            <div 
                onClick={() => setBillingCycle('yearly')}
                className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all bg-white shadow-sm ${
                    billingCycle === 'yearly' ? 'border-orange-400 shadow-xl shadow-orange-500/10 z-10' : 'border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
                {/* Discount Badge */}
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    -41%
                </div>
                 {billingCycle === 'yearly' && (
                    <div className="absolute inset-0 rounded-2xl border-4 border-orange-300/30 pointer-events-none"></div>
                )}
                <div className="text-center">
                    <p className="text-gray-500 font-medium mb-1">Yearly</p>
                    <p className="text-3xl font-extrabold text-gray-900">NT$1,608</p>
                    <p className="text-xs text-gray-400 mt-1">NT$134 / month</p>
                </div>
            </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-300 dark:border-gray-700 pl-2">
            {/* Card Tab */}
            <button 
                onClick={() => setPaymentMethod('card')}
                className={`relative pb-4 px-2 transition-all outline-none ${
                    paymentMethod === 'card' ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                }`}
            >
                <div className="flex items-center gap-2">
                     <div className="bg-[#0070BA] p-1 rounded text-white shadow-sm">
                        <CreditCard className="w-6 h-6" />
                     </div>
                </div>
                {paymentMethod === 'card' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600 rounded-t-full"></div>
                )}
            </button>

             {/* PayPal Tab */}
             <button 
                onClick={() => setPaymentMethod('paypal')}
                className={`relative pb-4 px-2 transition-all outline-none ${
                    paymentMethod === 'paypal' ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                }`}
            >
                <div className="flex items-center gap-1 italic font-bold text-xl select-none">
                    <span className="text-[#003087]">Pay</span><span className="text-[#009cde]">Pal</span>
                </div>
                {paymentMethod === 'paypal' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600 rounded-t-full"></div>
                )}
            </button>
        </div>

        {/* Payment Form Content */}
        <div className="min-h-[220px]">
            {paymentMethod === 'card' ? (
                <form onSubmit={handleUpgrade} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   {/* Card Inputs */}
                   <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Card details</label>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-colors">
                            <CreditCard className="text-gray-400 w-5 h-5 mr-3" />
                            <input 
                                type="text" 
                                placeholder="Card number" 
                                value={cardNumber}
                                onChange={handleCardInput}
                                className="flex-grow bg-transparent text-gray-900 dark:text-white outline-none placeholder-gray-400"
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="MM / YY" 
                                maxLength={5}
                                className="w-16 bg-transparent text-gray-900 dark:text-white outline-none placeholder-gray-400 text-center ml-2 border-l border-gray-200 dark:border-gray-700"
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="CVC" 
                                maxLength={3}
                                className="w-12 bg-transparent text-gray-900 dark:text-white outline-none placeholder-gray-400 text-center ml-2 border-l border-gray-200 dark:border-gray-700"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-4 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Processing...' : 'Go Premium'}
                    </button>
                </form>
            ) : (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 py-4">
                    <button 
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className="w-full max-w-md bg-[#009cde] hover:bg-[#008bc3] text-white font-bold py-3.5 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 text-2xl italic select-none"
                    >
                        {isProcessing ? (
                            <span className="text-lg not-italic">Processing...</span>
                        ) : (
                             // Using text to simulate logo inside button
                             <span className="flex items-center gap-0.5">
                                 <span className="font-bold">Pay</span><span className="font-bold">Pal</span>
                             </span>
                        )}
                    </button>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 text-center">
                        You will be redirected to PayPal to complete your purchase securely.
                    </p>
                </div>
            )}
        </div>

        {/* Guarantee Info */}
        <div className="flex justify-center gap-6 mt-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> Cancel anytime
            </div>
            <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> Money back guarantee
            </div>
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 my-8 w-full"></div>

        {/* Security Footer */}
        <div className="text-center w-full">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-6 text-sm">
                Secure. Private. In your control <span className="w-4 h-4 rounded-full border border-gray-400 dark:border-gray-500 flex items-center justify-center text-[10px] cursor-help">i</span>
            </div>
            
            <div className="flex justify-center items-center gap-8 grayscale opacity-60 dark:invert-[0.2]">
                 <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <Award className="w-8 h-8" />
                    <span className="text-xs font-bold text-center">ISO<br/>27001</span>
                 </div>
                 <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <Lock className="w-6 h-6" />
                    <div className="text-left leading-none">
                        <span className="text-[10px] block font-bold">Secure</span>
                        <span className="text-[8px] block">Payment</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <ShieldCheck className="w-6 h-6" />
                    <div className="text-left leading-none">
                         <span className="text-[10px] block font-bold">SECURE</span>
                        <span className="text-[8px] block">SSL ENCRYPTION</span>
                    </div>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Upgrade;