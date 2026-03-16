"use client";

import React, { useState } from 'react';
import { 
    MapPin, 
    Phone, 
    Mail, 
    Clock,
    ChevronDown, 
    ChevronUp,
    MessageSquare,
    CheckCircle2,
    Loader2
} from 'lucide-react';

const faqs = [
    {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery across all major cities in Pakistan."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 7-day easy return policy for items in their original condition and packaging. Please visit our returns page for more details."
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to selected international locations. Shipping times and costs vary depending on the destination."
    }
];

const ContactPage = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsSubmitted(true);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    city: '',
                    subject: 'General Inquiry',
                    message: ''
                });
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to send message.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#f9fafb] min-h-screen py-16 px-4 transition-colors duration-300 dark:bg-neutral-950">
            {/* Boxed Container */}
            <div className="max-w-[1100px] mx-auto">
                
                {/* ── Title Section ── */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">Get in Touch</h1>
                    <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-neutral-400">
                        We'd love to hear from you. Our team is always here to help with any questions, styling advice, or feedback about our latest collections.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-24 items-stretch">
                    
                    {/* ── Left Column: Contact Form ── */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-neutral-800 flex flex-col min-h-[600px]">
                        {isSubmitted ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-500 dark:text-neutral-400 max-w-sm mb-8">
                                    Thank you for reaching out. Our team will get back to you shortly.
                                </p>
                                <button 
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="space-y-6">
                                        <div className="space-y-3.5">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                placeholder="Your full name" 
                                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3.5">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Email</label>
                                            <input 
                                                required
                                                type="email" 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                placeholder="hello@example.com" 
                                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3.5">
                                                <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Phone Number</label>
                                                <input 
                                                    type="tel" 
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    placeholder="e.g. 03xx-xxxxxxx" 
                                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3.5">
                                                <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300">City</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                    placeholder="Your City" 
                                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Subject</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.subject}
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                            >
                                                <option>General Inquiry</option>
                                                <option>Order Status</option>
                                                <option>Returns & Exchanges</option>
                                                <option>Wholesale</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3.5 flex-grow flex flex-col">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Message</label>
                                        <textarea 
                                            required
                                            rows={6} 
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            placeholder="How can we help you?" 
                                            className="w-full flex-grow bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full mt-10 bg-[#1d4ed8] hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    )}
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* ── Right Column: Info & FAQ ── */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-neutral-800 flex flex-col justify-between gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Information</h3>
                                <p className="text-gray-500 dark:text-neutral-400">Reach out directly via any of these channels.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Visit Our Studio</p>
                                        <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                                            Shams Colony H-13, Islamabad<br />
                                            Pindora Chungi Chowk, Rawalpindi
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Call Us</p>
                                        <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                                            0339-2255235<br />
                                            0349-2255235
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Email Us</p>
                                        <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                                            contact@lalafashion.store
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Business Hours</p>
                                        <div className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed space-y-1">
                                            <p><span className="font-medium text-gray-700 dark:text-gray-300">Mon - Sun (Excl. Fri):</span> 09:00 AM - 08:00 PM</p>
                                            <p><span className="font-medium text-gray-700 dark:text-gray-300">Friday:</span> 10:00 AM - 12:00 PM & 02:00 PM - 10:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                            <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="py-4">
                                        <button 
                                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                            className="w-full flex items-center justify-between text-left group"
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {faq.question}
                                            </span>
                                            {openFaq === idx ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-40 mt-3' : 'max-h-0'}`}>
                                            <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContactPage;
