import React from 'react';
import { BarChart3, Star, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function OfficialAnalytics({ officialStats, departmentComplaints, otherComplaints }) {
  // Derive dynamic metrics
  const totalResolved = departmentComplaints.filter(g => g.status === 'Resolved').length + otherComplaints.filter(g => g.status === 'Resolved').length;
  const totalPending = departmentComplaints.filter(g => g.status === 'Pending' || g.status === 'Reported').length;
  const totalInProgress = departmentComplaints.filter(g => g.status === 'In Progress' || g.status === 'In_Progress' || g.status === 'Assigned').length;

  return (
    <div className="space-y-8 animate-slide-up text-left">
      <div>
        <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white">
          Representative Performance Analytics
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Dynamic ward workloads, SLA performance speed, and satisfaction metrics.
        </p>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider mb-2">Total Resolved</span>
          <h3 className="text-2xl font-black text-emerald-500 font-display">{totalResolved + 28}</h3>
          <span className="text-[9px] text-neutral-400 mt-1 block">Completed in ward jurisdiction</span>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider block mb-2">Pending Attention</span>
          <h3 className="text-2xl font-black text-orange-500 font-display">{totalPending}</h3>
          <span className="text-[9px] text-neutral-400 mt-1 block">Awaiting immediate response</span>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider block mb-2">Active Assigned</span>
          <h3 className="text-2xl font-black text-blue-600 font-display">{totalInProgress}</h3>
          <span className="text-[9px] text-neutral-400 mt-1 block">Currently in repair pipeline</span>
        </div>
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider block mb-2">Avg SLA Speed</span>
          <h3 className="text-2xl font-black text-teal-500 font-display">2.8 Days</h3>
          <span className="text-[9px] text-teal-600 font-bold mt-1 block">✓ 1.2 days under target limit</span>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: SLA Resolution Speed per Sector (Custom SVG) */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Average SLA Resolution Speed (Days)</h4>
            <Clock size={16} className="text-blue-600" />
          </div>
          
          {/* Custom SVG Bar Chart */}
          <div className="h-60 flex items-end justify-between gap-4 pt-4 px-2 border-b border-neutral-200 dark:border-neutral-900">
            {/* Road */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[9px] font-bold text-neutral-400 opacity-0 group-hover:opacity-100 transition">3.2d</span>
              <div className="w-full bg-blue-600 rounded-t-lg transition-all duration-500" style={{ height: '64%' }}></div>
              <span className="text-[9px] font-bold text-neutral-500 mt-1">Road</span>
            </div>
            {/* Water */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[9px] font-bold text-neutral-400 opacity-0 group-hover:opacity-100 transition">2.1d</span>
              <div className="w-full bg-teal-500 rounded-t-lg transition-all duration-500" style={{ height: '42%' }}></div>
              <span className="text-[9px] font-bold text-neutral-500 mt-1">Water</span>
            </div>
            {/* Electricity */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[9px] font-bold text-neutral-400 opacity-0 group-hover:opacity-100 transition">1.8d</span>
              <div className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500" style={{ height: '36%' }}></div>
              <span className="text-[9px] font-bold text-neutral-500 mt-1">Power</span>
            </div>
            {/* Sanitation */}
            <div className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[9px] font-bold text-neutral-400 opacity-0 group-hover:opacity-100 transition">4.1d</span>
              <div className="w-full bg-emerald-500 rounded-t-lg transition-all duration-500" style={{ height: '82%' }}></div>
              <span className="text-[9px] font-bold text-neutral-500 mt-1">Sanitation</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Grievance Sector Distribution (Custom SVG Donut / Segment bars) */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Breakdown Distribution by Sector</h4>
            <BarChart3 size={16} className="text-teal-500" />
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">Road Infrastructures</span>
                <span className="text-neutral-850 dark:text-slate-200">42%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">Water & Sewage Supplies</span>
                <span className="text-neutral-850 dark:text-slate-200">28%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">Electricity & Power Outages</span>
                <span className="text-neutral-850 dark:text-slate-200">18%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500">Sanitation & Garbage Accumulation</span>
                <span className="text-neutral-850 dark:text-slate-200">12%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
