import React, { useState } from 'react';
import { Clock, MapPin, Phone, Mail, Building, CheckCircle2, ChevronRight, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function MyComplaintsView({ 
  grievances, viewTimeline, handleEscalate, getStatusBadge,
  t = (key) => key, language = 'en'
}) {
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  // Status mapping to step indices
  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending':
      case 'Reported':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
      case 'In_Progress':
        return 3;
      case 'Resolved':
        return 4;
      default:
        return 0;
    }
  };

  const steps = [
    { label: t('status_pending'), desc: 'Case recorded in database ledger' },
    { label: t('status_assigned'), desc: 'Dispatched to administrative queue' },
    { label: language === 'en' ? 'Accepted' : language === 'kn' ? 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : 'स्वीकार किया गया', desc: 'Officer locked in as primary responder' },
    { label: t('status_progress'), desc: 'Ground crew dispatched to location' },
    { label: t('status_resolved'), desc: 'Before/after verified solution proof filed' }
  ];

  return (
    <div className="space-y-8 animate-slide-up text-left font-sans">
      <div>
        <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white">
          {t('my_complaints')}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('monitor_timeline')}</p>
      </div>

      {grievances.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl text-neutral-500 text-sm">
          {t('no_complaints')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Grievances List */}
          <div className="lg:col-span-5 space-y-4">
            {grievances.map(g => (
              <div 
                key={g.id}
                onClick={() => setSelectedGrievance(g)}
                className={`p-4 bg-white dark:bg-[#0c0c0e] border rounded-xl cursor-pointer transition flex items-center justify-between ${
                  selectedGrievance?.id === g.id 
                    ? 'border-blue-600 dark:border-blue-600 shadow-sm' 
                    : 'border-neutral-200 dark:border-neutral-900 hover:border-neutral-350'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <span className="text-[9px] font-mono text-neutral-400">{t('status_pending') !== 'Pending' ? t('status_pending').split(' ')[0] : 'ID'}: #{g.id}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate font-display">{g.title}</h4>
                  <p className="text-[10px] text-neutral-500 truncate">{g.address}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {getStatusBadge(g.status)}
                  <ChevronRight size={14} className="text-neutral-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Detailed tracking Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm">
            {selectedGrievance ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-neutral-100 dark:border-neutral-900/60 pb-4 flex-wrap gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-display">{selectedGrievance.title}</h3>
                    <p className="text-[10px] text-neutral-500 font-mono mt-1">{t('category')}: {selectedGrievance.department_name} • {t('ward')} ID: #{selectedGrievance.ward_id}</p>
                  </div>
                  {getStatusBadge(selectedGrievance.status)}
                </div>

                {/* Progress horizontal steps tracker */}
                <div className="space-y-4 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200/40 dark:border-neutral-900/50">
                  <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider">{t('status')}</span>
                  
                  <div className="relative pl-6 border-l border-neutral-200 dark:border-neutral-800 space-y-5 text-left">
                    {steps.map((step, idx) => {
                      const activeIdx = getStepIndex(selectedGrievance.status);
                      const isCompleted = idx <= activeIdx;
                      
                      return (
                        <div key={step.label} className="relative">
                          <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                            isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 dark:bg-brand-success dark:border-brand-success shadow-sm' 
                              : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800'
                          }`}></span>
                          <div className="leading-tight">
                            <h5 className={`text-xs font-bold ${isCompleted ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>{step.label}</h5>
                            <p className="text-[10px] text-neutral-550 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Representative Details */}
                {selectedGrievance.assigned_official_name ? (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/40 dark:border-neutral-900/50 rounded-xl space-y-3">
                    <span className="text-[9px] uppercase font-bold text-neutral-450 dark:text-neutral-500 tracking-wider block">{t('active_officials')}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 font-bold text-xs flex items-center justify-center">
                        {selectedGrievance.assigned_official_name[0]}
                      </div>
                      <div className="leading-tight">
                        <h5 className="font-bold text-xs text-neutral-800 dark:text-white">{selectedGrievance.assigned_official_name}</h5>
                        <p className="text-[10px] text-neutral-400 font-medium">{selectedGrievance.assigned_official_designation}</p>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-neutral-500 space-y-1.5 border-t border-neutral-200/30 pt-3">
                      <p className="flex items-center gap-1.5"><Phone size={10} className="text-neutral-400" /> 📞 {selectedGrievance.assigned_official_phone || 'N/A'}</p>
                      <p className="flex items-center gap-1.5"><Mail size={10} className="text-neutral-400" /> ✉️ {selectedGrievance.assigned_official_email || 'N/A'}</p>
                      <p className="flex items-center gap-1.5"><Building size={10} className="text-neutral-400" /> 🏢 {selectedGrievance.assigned_official_address || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/40 dark:border-neutral-900/50 rounded-xl text-center text-xs text-neutral-400 italic">
                    {t('pending_attention')}
                  </div>
                )}

                {/* SLA Escalation Button */}
                {selectedGrievance.status !== 'Resolved' && selectedGrievance.status !== 'Rejected' && (
                  <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900/60 pt-4">
                    <span className="text-[10px] text-neutral-400 italic">Overdue SLA limit? Trigger senior official review.</span>
                    <button 
                      onClick={() => handleEscalate(selectedGrievance.id)}
                      className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-650 hover:bg-red-650/20 rounded-lg text-xs font-bold transition flex items-center gap-1 active:scale-[0.98]"
                    >
                      Escalate Case <ArrowUpRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-neutral-400 italic">
                Select a grievance complaint from the left panel to inspect its real-time resolution timeline.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
