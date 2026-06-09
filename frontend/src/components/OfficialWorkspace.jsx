import React, { useState } from 'react';
import { Briefcase, MapPin, Clock, Search, AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function OfficialWorkspace({ 
  user, departmentComplaints = [], otherComplaints = [], handleAcceptComplaint, handleRejectComplaint, 
  setShowUpdateDialogId, setShowResolveModal, viewTimeline, getStatusBadge 
}) {
  const [workspaceFocus, setWorkspaceFocus] = useState('focus'); // 'focus' (My Specialty) | 'ward' (Other Specialty)
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected'
  const [searchTerm, setSearchTerm] = useState('');

  const activeComplaintsList = workspaceFocus === 'focus' ? departmentComplaints : otherComplaints;

  // Filter list by selected column tab and search
  const filteredList = activeComplaintsList.filter(g => {
    const matchesSearch = (g.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (g.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = false;
    if (activeTab === 'Pending') {
      matchesTab = g.status === 'Pending' || g.status === 'Reported';
    } else if (activeTab === 'Assigned') {
      matchesTab = g.status === 'Assigned';
    } else if (activeTab === 'In Progress') {
      matchesTab = g.status === 'In Progress' || g.status === 'In_Progress';
    } else if (activeTab === 'Resolved') {
      matchesTab = g.status === 'Resolved';
    } else if (activeTab === 'Rejected') {
      matchesTab = g.status === 'Rejected';
    }
    
    return matchesSearch && matchesTab;
  });

  const tabs = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div className="space-y-8 animate-slide-up text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-6">
        <div>
          <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white flex items-center gap-2">
            <Briefcase className="text-blue-600" /> Ward Task Workspace
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Official Desk for resolving complaints in {user?.jurisdiction_name || 'your assigned ward'}.
          </p>
        </div>

        {/* Workspace Focus Selector */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-800 w-fit">
          <button 
            onClick={() => setWorkspaceFocus('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${workspaceFocus === 'focus' ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-350'}`}
          >
            My Specialty Focus ({departmentComplaints.length})
          </button>
          <button 
            onClick={() => setWorkspaceFocus('ward')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${workspaceFocus === 'ward' ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-350'}`}
          >
            Other Specialty Ward Cases ({otherComplaints.length})
          </button>
        </div>
      </div>

      {/* Kanban Column Selectors Tab menu */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-900 pb-3">
        {tabs.map(tab => {
          const count = activeComplaintsList.filter(g => {
            if (tab === 'Pending') return g.status === 'Pending' || g.status === 'Reported';
            if (tab === 'Assigned') return g.status === 'Assigned';
            if (tab === 'In Progress') return g.status === 'In Progress' || g.status === 'In_Progress';
            if (tab === 'Resolved') return g.status === 'Resolved';
            if (tab === 'Rejected') return g.status === 'Rejected';
            return false;
          }).length;

          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-350'
              }`}
            >
              {tab} <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input bar */}
      <div className="relative bg-white dark:bg-[#0c0c0e] p-3 rounded-xl border border-neutral-200 dark:border-neutral-900 shadow-sm max-w-md">
        <Search size={14} className="absolute left-6 top-5 text-neutral-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${activeTab} complaints...`}
          className="w-full pl-9 pr-4 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-xs focus:outline-none focus:border-blue-600 transition"
        />
      </div>

      {/* Grid listing */}
      {filteredList.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#0c0c0e] border border-dashed border-neutral-200 dark:border-neutral-900 rounded-2xl text-neutral-500 text-sm">
          No complaints inside the "{activeTab}" desk column matching search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((g) => {
            // Determine dynamic complaint age
            const created = new Date(g.created_at);
            const ageDays = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
            
            return (
              <div 
                key={g.id} 
                className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:border-neutral-350 hover:scale-[1.01] transition duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">ID: #{g.id}</span>
                    <div className="flex gap-2">
                      {ageDays > 7 && g.status !== 'Resolved' && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 text-[8px] font-black animate-pulse">
                          OVERDUE
                        </span>
                      )}
                      {getStatusBadge(g.status)}
                    </div>
                  </div>

                  <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 leading-snug font-display line-clamp-2">{g.title}</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4 leading-relaxed">{g.description}</p>

                  {/* Address landmark */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5 mb-4 bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200/40 dark:border-neutral-850">
                    <MapPin size={11} className="text-neutral-400 mt-0.5 shrink-0" />
                    <span className="truncate">{g.address}</span>
                  </p>

                  {/* Image preview */}
                  {g.image_url && (
                    <div className="w-full h-32 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950 mb-4 flex items-center justify-center">
                      <img src={g.image_url} alt="Evidence preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Citizen Contact card */}
                  <div className="mb-4 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200/30 pt-3 space-y-1">
                    <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase block mb-1">Citizen Details</span>
                    <p className="font-bold text-neutral-800 dark:text-white">{g.citizen_name}</p>
                    <p className="font-mono text-[10px] text-neutral-400">📞 {g.citizen_phone || 'Google Linked Auth'}</p>
                  </div>
                </div>

                {/* Action Buttons based on states */}
                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/30">
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => viewTimeline(g)}
                      className="flex-grow py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Clock size={11} /> Timeline Logs
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {(g.status === 'Pending' || g.status === 'Reported') && (
                      <>
                        <button 
                          type="button"
                          onClick={() => handleAcceptComplaint(g.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <CheckCircle2 size={11} /> Accept
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleRejectComplaint(g.id)}
                          className="flex-1 py-2 bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <X size={11} /> Reject
                        </button>
                      </>
                    )}

                    {(g.status === 'Assigned' || g.status === 'In Progress' || g.status === 'In_Progress') && (
                      <>
                        <button 
                          type="button"
                          onClick={() => setShowUpdateDialogId(g.id)}
                          className="flex-1 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <RefreshCw size={11} /> Update Log
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowResolveModal(g)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <CheckCircle2 size={11} /> Resolve Case
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
