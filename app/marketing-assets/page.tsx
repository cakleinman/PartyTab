"use client";

import { useState } from "react";
import Script from "next/script";

// --- Components for Assets ---

function DebtSimplification() {
    return (
        <div id="debt_simplification" className="w-[1080px] h-[1080px] bg-sand-50 p-16 flex flex-col items-center justify-center relative overflow-hidden text-ink-900">
            <div className="text-center mb-12">
                <h2 className="text-7xl font-bold mb-6 font-display">Stop the Payment Chaos</h2>
            </div>

            <div className="grid grid-cols-2 gap-12 w-full h-[700px]">
                {/* Old Way */}
                <div className="bg-sand-100 rounded-[3rem] p-12 flex flex-col items-center relative border border-sand-200">
                    <h3 className="text-3xl font-bold text-ink-500 uppercase tracking-widest mb-16">The Old Way</h3>

                    <div className="relative w-full flex-1">
                        <div className="absolute top-10 left-10 text-8xl opacity-70 grayscale">😫</div>
                        <div className="absolute top-10 right-10 text-8xl opacity-70 grayscale">😖</div>
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-8xl opacity-70 grayscale">😤</div>

                        {/* Messy Arrows */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <defs>
                                <marker id="arrow-grey" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#a8a29a" />
                                </marker>
                            </defs>
                            <path d="M120,80 L320,80" stroke="#a8a29a" strokeWidth="4" strokeDasharray="12 12" markerEnd="url(#arrow-grey)" />
                            <text x="220" y="60" fill="#6f6a61" fontSize="28" textAnchor="middle" fontWeight="bold">$20</text>
                            <path d="M350,120 L250,300" stroke="#a8a29a" strokeWidth="4" strokeDasharray="12 12" markerEnd="url(#arrow-grey)" />
                            <text x="320" y="220" fill="#6f6a61" fontSize="28" textAnchor="middle" fontWeight="bold">$15</text>
                            <path d="M200,300 L100,120" stroke="#a8a29a" strokeWidth="4" strokeDasharray="12 12" markerEnd="url(#arrow-grey)" />
                            <text x="130" y="220" fill="#6f6a61" fontSize="28" textAnchor="middle" fontWeight="bold">$45</text>
                        </svg>
                    </div>
                    <p className="text-ink-500 text-2xl font-medium mt-8">Confusing & stressful</p>
                </div>

                {/* PartyTab Way */}
                <div className="bg-white rounded-[3rem] p-12 flex flex-col items-center relative border-4 border-teal-100 shadow-xl">
                    <h3 className="text-3xl font-bold text-teal-600 uppercase tracking-widest mb-16">The PartyTab Way</h3>

                    <div className="relative w-full flex-1 flex flex-col items-center justify-center">
                        <div className="flex justify-between w-full px-12 items-center mb-16">
                            <div className="text-9xl">🥳</div>
                            <div className="text-9xl">😎</div>
                        </div>
                        <div className="text-9xl mb-8">😌</div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center pointer-events-none">
                            <div className="h-4 bg-teal-100 w-2/3 rounded-full relative">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-8 py-3 rounded-full border-2 border-teal-200 shadow-md z-10">
                                    <span className="text-4xl font-bold text-teal-600">$5.00</span>
                                </div>
                                <svg className="absolute top-0 left-0 w-full h-4 overflow-visible">
                                    <defs>
                                        <marker id="arrow-teal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L9,3 z" fill="#14b8a6" />
                                        </marker>
                                    </defs>
                                    <path d="M0,8 L360,8" stroke="#14b8a6" strokeWidth="8" markerEnd="url(#arrow-teal)" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <p className="text-teal-700 text-2xl font-bold mt-8 bg-teal-50 px-8 py-4 rounded-full border border-teal-200">One simple payment.</p>
                </div>
            </div>
        </div>
    );
}

function LiveBalance() {
    return (
        <div id="live_balance" className="w-[1080px] h-[1080px] bg-sand-50 flex items-center justify-center text-ink-900">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-sand-200 w-[800px] flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-4 bg-teal-600"></div>
                <div className="mt-12 mb-6">
                    <span className="bg-ink-900 text-white px-6 py-2 rounded-full text-xl font-bold tracking-wider uppercase">Your Net Balance</span>
                </div>
                <div className="my-16">
                    <h2 className="text-[11rem] leading-none font-bold text-teal-600 tracking-tight">+$127.50</h2>
                    <div className="w-64 h-2 bg-teal-100 mx-auto rounded-full mt-8"></div>
                    <p className="text-4xl text-ink-500 font-medium mt-8">Others owe you</p>
                </div>
                <div className="w-full border-t border-sand-200 pt-12 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="text-6xl">🎿</span>
                        <div className="text-left">
                            <p className="text-4xl font-bold text-ink-900">Ski Weekend</p>
                            <p className="text-2xl text-ink-400 mt-1">4 participants</p>
                        </div>
                    </div>
                    <div className="flex -space-x-6">
                        {['JD', 'AL', 'MS', 'RK'].map((init, i) => (
                            <div key={i} className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white ${['bg-teal-600 text-white', 'bg-orange-500 text-white', 'bg-ink-900 text-white', 'bg-sand-300 text-ink-700'][i]
                                }`}>
                                {init}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ShareLink() {
    return (
        <div id="share_link" className="w-[1080px] h-[1080px] bg-sand-50 flex flex-col items-center justify-center p-12 relative overflow-hidden text-ink-900">
            {/* Background Elements */}
            <div className="absolute w-[800px] h-[800px] bg-teal-100 rounded-full blur-3xl opacity-30"></div>

            <div className="relative z-10 text-center mb-16">
                <h2 className="text-7xl font-bold text-ink-900 mb-6 font-display">Share with a link.</h2>
                <span className="text-5xl font-bold text-teal-600 bg-teal-50 px-8 py-3 rounded-full border border-teal-200">No App Required</span>
            </div>

            <div className="relative z-10 bg-white p-8 rounded-[3rem] shadow-xl border-2 border-teal-500 flex items-center gap-6 max-w-[900px]">
                <div className="bg-sand-50 px-8 py-6 rounded-2xl flex-1 border border-sand-200">
                    <span className="text-4xl text-ink-700 tracking-wide font-medium">partytab.app/t/ski-weekend</span>
                </div>
                <div className="bg-teal-600 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-5xl text-white">🔗</span>
                </div>
            </div>

            <div className="relative z-0 mt-16 w-full flex justify-center gap-32 opacity-80">
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-orange-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-6xl">🧑‍🦰</div>
                    <div className="mt-4 bg-white px-4 py-2 rounded-xl text-xl font-bold text-ink-700 shadow-sm border border-sand-100">Opened in Chrome</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-blue-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-6xl">🧔</div>
                    <div className="mt-4 bg-white px-4 py-2 rounded-xl text-xl font-bold text-ink-700 shadow-sm border border-sand-100">Opened in Safari</div>
                </div>
            </div>
        </div>
    )
}

function SettleUp() {
    return (
        <div id="settle_up" className="w-[1080px] h-[1080px] bg-sand-50 flex flex-col items-center justify-center p-12 text-ink-900">
            <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-sand-200 w-[900px] text-center relative overflow-hidden">
                <div className="mb-12">
                    <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-7xl text-teal-600">✓</span>
                    </div>
                    <h2 className="text-6xl font-bold text-ink-900 mb-4">Minimum Payments</h2>
                    <p className="text-3xl text-ink-500">We did the math.</p>
                </div>

                <div className="space-y-6 bg-sand-50 p-12 rounded-[3rem] border border-sand-100">
                    <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-sand-200">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-3xl font-bold text-orange-800">AL</div>
                            <span className="text-3xl font-bold text-ink-700">Alex</span>
                        </div>
                        <div className="flex flex-col items-center px-8">
                            <span className="text-2xl font-bold text-teal-600 mb-1">$45.00</span>
                            <div className="w-32 h-2 bg-teal-200 rounded-full relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-teal-600 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-800">SA</div>
                            <span className="text-3xl font-bold text-ink-700">Sam</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-sand-200 opacity-60">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-800">JA</div>
                            <span className="text-3xl font-bold text-ink-700">Jamie</span>
                        </div>
                        <div className="flex flex-col items-center px-8">
                            <span className="text-2xl font-bold text-teal-600 mb-1">$12.50</span>
                            <div className="w-32 h-2 bg-teal-200 rounded-full relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-teal-600 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-800">SA</div>
                            <span className="text-3xl font-bold text-ink-700">Sam</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <span className="bg-teal-600 text-white px-10 py-4 rounded-full text-3xl font-bold shadow-lg">One Simple Payment 💸</span>
                </div>
            </div>
        </div>
    )
}

// --- Main Page ---

export default function MarketingGenerator() {
    const [status, setStatus] = useState("Loading...");
    const [isLoaded, setIsLoaded] = useState(false);

    const saveAsset = async (id: string) => {
        setStatus(`Generating ${id}...`);
        const element = document.getElementById(id);

        if (!element) {
            setStatus(`Error: Element ${id} not found`);
            return;
        }

        // @ts-ignore
        if (!window.html2canvas) {
            setStatus("Error: html2canvas not loaded");
            return;
        }

        try {
            // @ts-ignore
            const canvas = await window.html2canvas(element, {
                scale: 1,
                backgroundColor: '#fbf7f0',
                logging: true,
                useCORS: true
            });

            const image = canvas.toDataURL('image/png');

            const res = await fetch('/api/save-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image, filename: id })
            });

            const data = await res.json();
            if (data.success) {
                setStatus(`Saved ${id} successfully!`);
            } else {
                setStatus(`Failed to save ${id}: ${data.error}`);
                console.error(data.error);
            }

        } catch (e: any) {
            console.error(e);
            setStatus("Error generating " + id + ": " + e.message);
        }
    };

    const saveAll = async () => {
        const assets = ['debt_simplification', 'live_balance', 'share_link', 'settle_up'];
        for (const asset of assets) {
            await saveAsset(asset);
            await new Promise(r => setTimeout(r, 1000));
        }
        setStatus("All Assets Saved!");
    }

    return (
        <div className="min-h-screen bg-neutral-900 p-8 space-y-24">
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
                onLoad={() => {
                    setIsLoaded(true);
                    setStatus("Ready");
                }}
            />

            <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50 flex justify-between items-center shadow-lg">
                <h1 className="text-xl font-bold">Marketing Asset Generator (CDN Mode)</h1>
                <div className="flex gap-4 items-center">
                    <span className="text-gray-500 font-mono font-bold">{status}</span>
                    <button
                        onClick={saveAll}
                        disabled={!isLoaded}
                        className="px-6 py-3 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate All Assets
                    </button>
                </div>
            </div>

            <div className="pt-20 space-y-24 flex flex-col items-center transform scale-50 origin-top">
                {/* 1. Debt Simplification */}
                <div className="relative group">
                    <div className="absolute -top-16 left-0 text-white font-mono text-4xl">1. Debt Simplification</div>
                    <DebtSimplification />
                </div>

                {/* 2. Live Balance */}
                <div className="relative group">
                    <div className="absolute -top-16 left-0 text-white font-mono text-4xl">2. Live Balance</div>
                    <LiveBalance />
                </div>

                {/* 3. Share Link */}
                <div className="relative group">
                    <div className="absolute -top-16 left-0 text-white font-mono text-4xl">3. Share Link</div>
                    <ShareLink />
                </div>

                {/* 4. Settle Up */}
                <div className="relative group">
                    <div className="absolute -top-16 left-0 text-white font-mono text-4xl">4. Settle Up</div>
                    <SettleUp />
                </div>
            </div>
        </div>
    );
}
