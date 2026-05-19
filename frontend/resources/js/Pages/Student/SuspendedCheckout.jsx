import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// Handcrafted SVG Icons (strictly no emojis)
const SVGShieldAlert = () => (
    <svg className="w-12 h-12 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.3c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const SVGCheck = () => (
    <svg className="w-5 h-5 stroke-white" fill="none" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const SVGArrowRight = () => (
    <svg className="w-5 h-5 stroke-[#1E1E1E] ml-2 inline" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const SVGCreditCard = () => (
    <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);

export default function SuspendedCheckout({ student, programFee }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardName, setCardName] = useState(student.name || '');

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!cardNumber || !expiry || !cvc) {
            alert('Please fill in all card details.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(route('student.payment.settle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = route('dashboard');
                }, 2000);
            } else {
                alert('Payment processing failed. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('A connection error occurred. Settle payment successfully.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8E7] text-[#1E1E1E] font-sans flex flex-col items-center justify-center p-4 md:p-8 selection:bg-[#E9D5FF]">
            <Head title="Tuition Payment Overdue - Access Suspended" />

            <div className="w-full max-w-4xl bg-white border-[4px] border-[#1E1E1E] shadow-[10px_10px_0px_0px_#1E1E1E] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
                
                {/* Left Panel: Invoice Details & Warning Alert */}
                <div className="md:col-span-5 bg-[#FFE5D9] p-8 border-b-[4px] md:border-b-0 md:border-r-[4px] border-[#1E1E1E] flex flex-col justify-between">
                    <div>
                        {/* Shield icon */}
                        <div className="bg-[#FFC6B0] p-3 border-[3px] border-[#1E1E1E] rounded-2xl inline-block mb-6 shadow-[3px_3px_0px_0px_#1E1E1E]">
                            <SVGShieldAlert />
                        </div>

                        <h1 className="font-fredoka font-black text-3xl leading-tight uppercase tracking-wider mb-4">
                            Portal Suspended
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-6">
                            Notice: 7-Day Trial Overdue
                        </p>

                        <div className="space-y-4">
                            <div className="bg-white border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] rounded-2xl p-4">
                                <span className="block text-xs font-black text-gray-500 uppercase tracking-widest">Enrolled Package</span>
                                <span className="font-fredoka font-black text-xl text-[#1E1E1E]">{student.package_name || 'Basic Boost Plan'}</span>
                            </div>

                            <div className="bg-white border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] rounded-2xl p-4">
                                <span className="block text-xs font-black text-gray-500 uppercase tracking-widest">Enrollment Total</span>
                                <span className="font-fredoka font-black text-2xl text-[#1E1E1E]">₹{programFee.toLocaleString('en-IN')}</span>
                                <span className="block text-xs font-bold text-gray-400 mt-0.5">One-Month Course Fee</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t-[3px] border-[#1E1E1E]">
                        <button 
                            onClick={handleLogout}
                            className="bg-white hover:bg-gray-50 font-fredoka font-black text-sm px-4 py-2.5 border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl w-full"
                        >
                            Sign Out Account
                        </button>
                    </div>
                </div>

                {/* Right Panel: Neo-Brutalist Secured Card Form */}
                <div className="md:col-span-7 p-8 flex flex-col justify-center">
                    {success ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-20 h-20 bg-[#D1F2EB] border-[4px] border-[#1E1E1E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#1E1E1E] animate-bounce">
                                <div className="bg-[#1E1E1E] p-2 rounded-full">
                                    <SVGCheck />
                                </div>
                            </div>
                            <h2 className="font-fredoka font-black text-3xl mb-3">Payment Confirmed!</h2>
                            <p className="font-medium text-gray-600">Your classroom portal is reactivating. Get ready to speak confidently!</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                            <div>
                                <h2 className="font-fredoka font-black text-2xl uppercase tracking-wider mb-2">Secure Checkout</h2>
                                <p className="text-sm font-medium text-gray-500">Settle your Spoken English tuition to instantly unlock your dashboard, active schedules, and learning materials.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Card Name */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-black uppercase tracking-widest mb-1.5">Cardholder Name</label>
                                    <input 
                                        type="text" 
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="Somya Kashyap" 
                                        className="border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-[#E9D5FF] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all"
                                        required
                                    />
                                </div>

                                {/* Card Number */}
                                <div className="flex flex-col">
                                    <label className="text-xs font-black uppercase tracking-widest mb-1.5">Card Number</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={cardNumber}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                                const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                                setCardNumber(formatted);
                                            }}
                                            placeholder="4111 2222 3333 4444" 
                                            className="w-full border-[3px] border-[#1E1E1E] rounded-xl pl-12 pr-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-[#E9D5FF] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all"
                                            required
                                        />
                                        <div className="absolute left-4 top-3.5">
                                            <SVGCreditCard />
                                        </div>
                                    </div>
                                </div>

                                {/* Expiry and CVC */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-xs font-black uppercase tracking-widest mb-1.5">Expiry Date</label>
                                        <input 
                                            type="text" 
                                            value={expiry}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                const formatted = val.length >= 3 ? val.substring(0, 2) + '/' + val.substring(2) : val;
                                                setExpiry(formatted);
                                            }}
                                            placeholder="MM/YY" 
                                            className="border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-[#E9D5FF] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all text-center"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-xs font-black uppercase tracking-widest mb-1.5">CVC Code</label>
                                        <input 
                                            type="password" 
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                            placeholder="•••" 
                                            className="border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-[#E9D5FF] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all text-center tracking-widest"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#D1F2EB] hover:bg-[#bbf0e5] disabled:bg-gray-200 disabled:cursor-not-allowed font-fredoka font-black text-lg px-6 py-4 border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_#1E1E1E] transition-all rounded-2xl flex items-center justify-center"
                            >
                                {loading ? 'Processing Transaction...' : (
                                    <>
                                        Complete Enrollment Payment <SVGArrowRight />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                🔒 Secured Mock Payment Gateway Integration
                            </p>
                        </form>
                    )}
                </div>

            </div>
            
            <p className="text-sm font-bold text-gray-500 mt-8 uppercase tracking-wider text-center max-w-md leading-relaxed">
                Struggling to make payment? Drop a message to <span className="underline">info.boloacademy@gmail.com</span> for instant admin assistance.
            </p>
        </div>
    );
}
