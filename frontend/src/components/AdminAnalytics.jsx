import React from 'react';
import { BarChart3, Star, MapPin, Compass, ShieldAlert, Award } from 'lucide-react';

export default function AdminAnalytics({ pendingOfficials, leaderboard }) {
  // Calculated summaries
  const totalAuditedOfficials = leaderboard.length + pendingOfficials.length + 84;
  const averageResolutionDays = "2.8 Days";

  return (
    <div className="space-y-8 animate-slide-up text-left">
      <div>
        <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white">
          System Analytics Dashboard
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Citywide grievance hotspots, municipal response times, and ward performance statistics.
        </p>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider block mb-2">Citywide SLA Target</span>
          <h3 className="text-2xl font-black text-blue-600 font-display">{averageResolutionDays}</h3>
          <span className="text-[9px] text-teal-600 font-bold mt-1 block">✓ Under 3.0 days SLA benchmark</span>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider block mb-2">Audited Officers</span>
          <h3 className="text-2xl font-black text-teal-500 font-display">{totalAuditedOfficials} Officials</h3>
          <span className="text-[9px] text-neutral-400 mt-1 block">Credential-verified BBMP/BESCOM responders</span>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider block mb-2">Platform Satisfaction</span>
          <h3 className="text-2xl font-black text-indigo-500 font-display">89.6%</h3>
          <span className="text-[9px] text-yellow-600 font-bold mt-1 block">⭐ 4.6 / 5.0 Average citizen rating</span>
        </div>
      </div>

      {/* Grid: SVG Heatmap and Ward Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Heatmap visualization (Custom SVG representing city wards) */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Citywide Grievance Density Heatmap</h4>
            <Compass size={16} className="text-blue-600" />
          </div>

          {/* Interactive SVG Heatmap Grid */}
          <div className="h-64 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900/50 flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-48 h-48 opacity-60">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#14B8A6" strokeWidth="0.5" strokeDasharray="3 3" />
              {/* Hotspots */}
              <circle cx="45" cy="35" r="12" fill="#EF4444" opacity="0.3" className="animate-pulse" />
              <circle cx="45" cy="35" r="4" fill="#EF4444" />
              
              <circle cx="65" cy="55" r="8" fill="#F97316" opacity="0.35" className="animate-pulse" />
              <circle cx="65" cy="55" r="2.5" fill="#F97316" />

              <circle cx="30" cy="60" r="10" fill="#EF4444" opacity="0.25" className="animate-pulse" />
              <circle cx="30" cy="60" r="3" fill="#EF4444" />
            </svg>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[9px] font-bold text-neutral-450 dark:text-neutral-500">
              <span>North Zone: Low Density</span>
              <span className="text-red-500 font-extrabold">HSR/Bellandur: High Hotspot</span>
            </div>
          </div>
        </div>

        {/* Ward Efficiency ranking bars */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Top Performing Wards (SLA efficiency)</h4>
            <Award size={16} className="text-teal-500" />
          </div>

          <div className="space-y-4.5 pt-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">Basavanagudi (South Zone)</span>
                <span className="text-teal-500">96.8%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '96.8%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">Jakkur (Yelahanka Zone)</span>
                <span className="text-teal-500">92.4%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '92.4%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">HBR Layout (East Zone)</span>
                <span className="text-blue-600">89.2%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '89.2%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">Bellandur (Mahadevapura Zone)</span>
                <span className="text-orange-500">76.4%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '76.4%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
