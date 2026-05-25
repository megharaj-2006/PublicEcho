import React from 'react';
import { Compass, ShieldCheck, Heart, Users, Award, ShieldAlert, BarChart3 } from 'lucide-react';

export default function AboutView({ t = (key) => key, language = 'en' }) {
  return (
    <div className="space-y-16 animate-slide-up text-left max-w-4xl mx-auto py-6 font-sans">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
          Platform Mission
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-neutral-950 dark:text-white leading-none">
          {t('about_title')}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
          {t('about_desc')}
        </p>
      </div>

      {/* Grid: Why it matters */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6 border-t border-neutral-200/60 dark:border-neutral-900">
        <div className="space-y-4">
          <h3 className="text-xl font-display font-black text-neutral-900 dark:text-white">Why Civic Transparency Matters</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            In modern urban zones, communication gaps between citizens and public utility providers often delay repairs. Potholes on vital main roads and ruptured sewer blockages go unnoticed, resulting in traffic bottlenecks and public safety risks.
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            CivicSync solves this problem by creating an open, verifiable relational audit ledger. Every grievance reported is geo-tracked, automatically dispatched to the exact local engineer responsible, and backed by visible before/after photo proof.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-xl space-y-2">
            <Compass className="text-blue-600" size={20} />
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Geo-Auditing</h4>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Centroid-based ward pre-selection guarantees grievances map to correct representatives.</p>
          </div>
          <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-xl space-y-2">
            <ShieldCheck className="text-teal-500" size={20} />
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Verification</h4>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Officials must upload a verified Base64 solution proof photo to resolve a case.</p>
          </div>
        </div>
      </section>

      {/* Engagement Timeline */}
      <section className="space-y-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-900">
        <h3 className="text-xl font-display font-black text-neutral-900 dark:text-white text-center">Grievance Resolution Cycle</h3>
        
        <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 pl-8 space-y-8">
          <div className="relative">
            <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center font-bold text-[10px]">1</span>
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{t('step1_title')}</h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">{t('step1_desc')}</p>
          </div>

          <div className="relative">
            <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20 flex items-center justify-center font-bold text-[10px]">2</span>
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{t('step2_title')}</h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">{t('step2_desc')}</p>
          </div>

          <div className="relative">
            <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px]">3</span>
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{t('step3_title')}</h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">{t('step3_desc')}</p>
          </div>
        </div>
      </section>

      {/* Core Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-900">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Average SLA Resolution</span>
          <span className="text-2xl font-black text-blue-600">3.4 Days</span>
        </div>
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Audited Bengaluru Wards</span>
          <span className="text-2xl font-black text-teal-500">20 Active Wards</span>
        </div>
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Verification Standards</span>
          <span className="text-2xl font-black text-indigo-500">100% MFA Protected</span>
        </div>
      </section>
    </div>
  );
}
