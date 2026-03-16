"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const timelineData = [
    {
        year: '2020',
        title: 'The Visionary Start',
        desc: 'Lala Fashion began as a small boutique with a big dream: to bring premium, hand-picked style to everyone. Our journey started with a focus on quality and authenticity.',
        subDesc: 'We started with a curated collection of local craftsmanship that quickly resonated with fashion enthusiasts looking for something unique and meaningful.',
        label: 'The Beginning',
        icon: '→'
    },
    {
        year: '2023',
        title: 'Digital Transformation',
        desc: 'As the world moved online, so did we. We launched our headless commerce platform to provide a seamless, modern shopping experience for our customers across Pakistan.',
        subDesc: 'By integrating advanced technology with our fashion roots, we expanded our product range from watches to electronics and luxury accessories.',
        label: 'Expanding Horizon',
        icon: '↗'
    },
    {
        year: '2026',
        title: 'Leading the Future',
        desc: 'Today, Lala Fashion stands as a premier destination for lifestyle and fashion. We continue to bridge the gap between traditional quality and modern trends.',
        subDesc: 'Our commitment to excellence remains unchanged. With thousands of happy customers and a growing global community, we are setting new standards in the fashion industry.',
        label: 'Lala Fashion Today',
        icon: '↗'
    }
];

const AboutPage = () => {
    const [activeIndex, setActiveIndex] = useState(2);

    return (
        <div className="bg-[#f9fafb] min-h-screen py-16 px-4 transition-colors duration-300 dark:bg-neutral-950">
            {/* Boxed Container */}
            <div className="max-w-[1100px] mx-auto space-y-20">
                
                {/* ── Section 1: Our Journey ── */}
                <section className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 md:p-12 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
                    <div className="text-center mb-12">
                        <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Evolution & Growth</h2>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Our Historical Timeline</h1>
                        <p className="text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
                            Explore how Lala Fashion transformed from a visionary boutique into a premier digital lifestyle destination.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 border-t border-gray-100 dark:border-neutral-800 pt-12">
                        {/* Left Column */}
                        <div className="lg:w-5/12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-outfit">The Legacy</h2>
                            <p className="text-gray-500 dark:text-neutral-400 text-xs md:text-sm leading-relaxed mb-10">
                                Discover the key milestones that defined our growth. Every chapter of our story is built on a foundation of trust, quality, and innovation.
                            </p>
                            <div className="space-y-4">
                                {timelineData.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setActiveIndex(idx)}
                                        className={`flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800 cursor-pointer transition-all ${activeIndex === idx ? 'text-gray-900 dark:text-white bg-blue-50/50 dark:bg-blue-900/20 rounded-xl' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-xl'}`}
                                    >
                                        <span className="text-base md:text-lg font-medium">{item.label}</span>
                                        <span className="text-xl">{activeIndex === idx ? '→' : '↗'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:w-7/12">
                            <div className="bg-blue-50/30 dark:bg-neutral-800/50 rounded-3xl p-6 md:p-8 h-full flex flex-col justify-start border border-blue-50 dark:border-neutral-700">
                                <div className="mb-6">
                                    <span className="bg-white dark:bg-neutral-900 px-4 py-1 rounded-full text-[10px] font-bold text-gray-700 dark:text-neutral-300 shadow-sm border dark:border-neutral-800">
                                        {timelineData[activeIndex].year}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">{timelineData[activeIndex].title}</h3>
                                <p className="text-gray-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-6">
                                    {timelineData[activeIndex].desc}
                                </p>
                                <p className="text-gray-400 dark:text-neutral-500 text-xs md:text-sm leading-relaxed">
                                    {timelineData[activeIndex].subDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Section 2: Core Values ── */}
                <section className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 md:p-12 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
                    <div className="text-center mb-12">
                        <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Core Values</h2>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">The Lala Advantage</h1>
                        <p className="text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
                            We combine premium quality with ethical responsibility to ensure that every product you buy tells a story of care and perfection.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto mb-16 text-center border-t border-gray-100 dark:border-neutral-800 pt-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Why <span className="text-blue-600">Choose</span> Lala Fashion?</h2>
                        <p className="text-gray-500 dark:text-neutral-400 text-sm">Experience the Future of Lifestyle</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-3xl p-8 flex flex-col items-center group hover:bg-white dark:hover:bg-neutral-800 hover:shadow-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-neutral-700">
                            <div className="w-10 h-10 bg-gray-800 dark:bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.16 1.16a2 2 0 002.828 2.828l1.16-1.16a2 2 0 01.517-.386l2.387-.477a6 6 0 013.86.517l.618.309a6 6 0 003.86.517l2.387-.477a2 2 0 01.517.386l1.16 1.16a2 2 0 002.828-2.828l-1.16-1.16z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Authentic Sourcing</h4>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-neutral-400">Directly sourced premium brands and products.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-3xl p-8 flex flex-col items-center group hover:bg-white dark:hover:bg-neutral-800 hover:shadow-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-neutral-700">
                            <div className="w-10 h-10 bg-gray-800 dark:bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Curated Collections</h4>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-neutral-400">Hand-picked styles for the modern lifestyle.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-3xl p-8 flex flex-col items-center group hover:bg-white dark:hover:bg-neutral-800 hover:shadow-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-neutral-700">
                            <div className="w-10 h-10 bg-gray-800 dark:bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Nationwide Delivery</h4>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-neutral-400">Reliable shipping to every corner of the country.</p>
                        </div>
                    </div>
                </section>

                {/* ── Section 3: Impact & Community ── */}
                <section className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 md:p-12 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
                    <div className="text-center mb-12">
                        <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Community</h2>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Our Growing Reach</h1>
                        <p className="text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
                            From our first order to a nationwide network, we are proud of the impact we've made in the lives of our customers.
                        </p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-neutral-800 pt-12">
                        <div className="max-w-3xl mx-auto mb-12 text-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Lala Fashion by the <span className="text-blue-600">Numbers</span></h2>
                            <p className="text-gray-500 dark:text-neutral-400 text-sm italic">Building trust through quality products and exceptional service since 2020.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            <div className="border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col group hover:border-blue-200 transition-colors">
                                <div className="p-6 pb-4 text-left text-xs md:text-sm text-gray-500 dark:text-neutral-400 flex-grow">
                                    Trusted by fashion enthusiasts for over half a decade, delivering excellence with every package.
                                </div>
                                <div className="bg-blue-50/50 dark:bg-neutral-800/50 p-6 pt-4 text-left group-hover:bg-blue-50 dark:group-hover:bg-neutral-800 transition-colors">
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">+50k</div>
                                    <div className="text-xs md:text-sm text-gray-600 dark:text-neutral-400 font-medium">Delighted Customers</div>
                                </div>
                            </div>
                            <div className="border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col group hover:border-blue-200 transition-colors">
                                <div className="p-6 pb-4 text-left text-xs md:text-sm text-gray-500 dark:text-neutral-400 flex-grow">
                                    A wide range of hand-picked products across various categories like watches, gadgets, and more.
                                </div>
                                <div className="bg-blue-50/50 dark:bg-neutral-800/50 p-6 pt-4 text-left group-hover:bg-blue-50 dark:group-hover:bg-neutral-800 transition-colors">
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">+1000</div>
                                    <div className="text-xs md:text-sm text-gray-600 dark:text-neutral-400 font-medium">Hand-picked Items</div>
                                </div>
                            </div>
                            <div className="border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col group hover:border-blue-200 transition-colors">
                                <div className="p-6 pb-4 text-left text-xs md:text-sm text-gray-500 dark:text-neutral-400 flex-grow">
                                    Serving style and quality to major cities and remote areas across the entire country.
                                </div>
                                <div className="bg-blue-50/50 dark:bg-neutral-800/50 p-6 pt-4 text-left group-hover:bg-blue-50 dark:group-hover:bg-neutral-800 transition-colors">
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">ALL</div>
                                    <div className="text-xs md:text-sm text-gray-600 dark:text-neutral-400 font-medium">Cities Covered</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Section 4: Founder ── */}
                <section className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 md:p-12 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
                    <div className="text-center mb-12">
                        <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Leadership</h2>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">A Note from Our Founder</h1>
                        <p className="text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
                            Hear directly from the mind behind Lala Fashion about our commitment to excellence and our vision for the future.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 border-t border-gray-100 dark:border-neutral-800 pt-12">
                        <div className="md:w-1/3 w-full">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-neutral-800 relative group shadow-inner">
                                <Image 
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" 
                                    alt="Founder" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-outfit">Empowering Lifestyle Through Quality</h3>
                            <div className="space-y-4 text-gray-600 dark:text-neutral-400 leading-relaxed text-sm md:text-base">
                                <p>
                                    At Lala Fashion, we believe that every product you use is a reflection of your personality. Our mission has always been to provide high-quality, authentic products that empower individuals to look and feel their best.
                                </p>
                                <p>
                                    As we look to the future, we remain dedicated to expanding our reach and enhancing our technology to provide you with the best shopping experience possible. Thank you for choosing Lala Fashion.
                                </p>
                            </div>
                            <div className="mt-8 border-t border-gray-100 dark:border-neutral-800 pt-6">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">Naveed Ahmed</p>
                                <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Founder & Creative Director</p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AboutPage;
