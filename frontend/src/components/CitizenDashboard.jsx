import React, { useState } from 'react';
import { Plus, Award, AlertTriangle, ShieldCheck, MapPin, Clock, Search, RefreshCw, ChevronRight } from 'lucide-react';

export default function CitizenDashboard({ 
  user, setView, grievances, viewTimeline, handleUpvote, setSelectedFeedbackGrievance, 
  setShowFileModal, setNewLat, setNewLng, setNewAddress, getStatusBadge,
  t = (key) => key, language = 'en'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeCount = grievances.filter(g => g.status !== 'Resolved' && g.status !== 'Rejected').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  
  // Calculate dynamic Contribution Score: (filed complaints * 10) + (resolved feedbacks * 15)
  const contributionScore = (grievances.length * 10) + (resolvedCount * 15);

  const filteredGrievances = grievances.filter(g => {
    const matchSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-slide-up text-left relative font-sans">
      {/* Welcome & Analytics Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-6">
        <div>
          <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white">
            {t('welcome_back')}, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('monitor_timeline')}</p>
        </div>
        
        {/* Floating New Complaint Trigger */}
        <button 
          onClick={() => { 
            setNewLat('12.9304'); 
            setNewLng('77.6784'); 
            setNewAddress(''); 
            setShowFileModal(true); 
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={14} /> {t('new_complaint')}
        </button>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider">{t('active_complaints')}</span>
            <AlertTriangle className="text-blue-600" size={16} />
          </div>
          <h3 className="text-2xl font-black font-display text-neutral-900 dark:text-white">{activeCount}</h3>
          <span className="text-[9px] text-neutral-400 block mt-1">{t('pending_attention')}</span>
        </div>

        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider">{t('resolved_issues')}</span>
            <ShieldCheck className="text-teal-500" size={16} />
          </div>
          <h3 className="text-2xl font-black font-display text-neutral-900 dark:text-white">{resolvedCount}</h3>
          <span className="text-[9px] text-teal-600 font-bold block mt-1">✓ {grievances.length > 0 ? ((resolvedCount / grievances.length) * 100).toFixed(0) : 0}% {t('success_rate')}</span>
        </div>

        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider">{t('contribution_score')}</span>
            <Award className="text-teal-500" size={16} />
          </div>
          <h3 className="text-2xl font-black font-display text-neutral-900 dark:text-white">{contributionScore} <span className="text-xs font-bold text-neutral-400 font-sans">XP</span></h3>
          <span className="text-[9px] text-neutral-400 block mt-1">{t('earned_xp')}</span>
        </div>
      </div>

      {/* Issues Search/Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#0c0c0e] p-3 rounded-xl border border-neutral-200 dark:border-neutral-900 shadow-sm">
        <div className="relative flex-grow">
          <Search size={13} className="absolute left-3.5 top-2.5 text-neutral-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_complaints')}
            className="w-full pl-9 pr-4 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-xs focus:outline-none focus:border-blue-600 transition"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-transparent border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-600 transition text-neutral-700 dark:text-neutral-300 font-sans"
        >
          <option value="all">{t('all_statuses')}</option>
          <option value="Pending">{t('status_pending')}</option>
          <option value="Assigned">{t('status_assigned')}</option>
          <option value="In Progress">{t('status_progress')}</option>
          <option value="Resolved">{t('status_resolved')}</option>
          <option value="Rejected">{t('status_rejected')}</option>
        </select>
      </div>

      {/* Main complaint grid list */}
      {filteredGrievances.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#0c0c0e] border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-500 text-sm">
          {t('no_complaints')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
          {filteredGrievances.map((g) => (
            <div 
              key={g.id} 
              className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-850 hover:scale-[1.01] transition duration-200"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[9px] font-mono text-neutral-400">{t('status_pending') !== 'Pending' ? t('status_pending').split(' ')[0] : 'ID'}: #{g.id}</span>
                  <div className="flex gap-2">
                    {g.SLA_days && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[8px] font-bold">
                        {g.SLA_days}d SLA
                      </span>
                    )}
                    {getStatusBadge(g.status)}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-neutral-950 dark:text-white mb-2 leading-snug font-display">{g.title}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">{g.description}</p>

                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5 mb-4 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200/40 dark:border-neutral-850">
                  <MapPin size={11} className="text-neutral-400 mt-0.5 shrink-0" />
                  <span className="truncate">{g.address}</span>
                </p>

                {g.image_url && (
                  <div className="w-full h-28 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900 mb-4">
                    <img src={g.image_url} alt="Evidence preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-900/60 pt-4 mt-4 flex items-center justify-between gap-3">
                <button 
                  onClick={() => viewTimeline(g)}
                  className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs font-semibold hover:border-neutral-400 transition flex items-center gap-1"
                >
                  <Clock size={12} /> {t('audit_timeline')}
                </button>

                {g.status === 'Resolved' && (
                  <button 
                    onClick={() => setSelectedFeedbackGrievance(g)}
                    className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-600 hover:bg-teal-500/20 rounded-lg text-xs font-semibold transition"
                  >
                    {t('rate_work')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
