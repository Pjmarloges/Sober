"use client";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-8 animate-float">
            <span className="w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700">🔐 Privacy-First Sobriety Platform</span>
          </div>

          {/* Main title */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 gradient-text leading-tight">
            Sober Journey
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-medium">
            Protect your privacy with fully homomorphic encryption<br />
            <span className="text-orange-500 font-semibold">Securely record your progress on the blockchain</span>
          </p>

          {/* Feature tags - horizontal layout */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-md border-2 border-orange-100">
              <div className="w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-md border-2 border-orange-100">
              <div className="w-2.5 h-2.5 bg-pink-400 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">FHE Encrypted</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-md border-2 border-orange-100">
              <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Community Support</span>
            </div>
          </div>

          {/* Action buttons - large rounded buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/journeys/new"
              className="orange-button text-lg px-10 py-5 rounded-2xl inline-flex items-center gap-2 group"
            >
              <span>Start My Journey</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/journeys"
              className="px-10 py-5 rounded-2xl bg-white text-gray-700 font-bold text-lg border-3 border-orange-300 shadow-lg hover:shadow-xl transition-all hover:bg-orange-50"
            >
              Explore Journeys
            </Link>
            <Link
              href="/rewards"
              className="px-10 py-5 rounded-2xl bg-white text-gray-700 font-bold text-lg border-3 border-orange-300 shadow-lg hover:shadow-xl transition-all hover:bg-orange-50"
            >
              Rewards
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-20">
          <path d="M0,40 Q300,0 600,40 T1200,40 L1200,80 L0,80 Z" fill="#FFF8F5" opacity="0.9"/>
        </svg>
      </div>
    </div>
  );
}
