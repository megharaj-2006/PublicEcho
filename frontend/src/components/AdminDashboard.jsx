import React, { useState } from 'react';
import { ShieldAlert, Check, X, Search, FileText, CheckCircle2, UserCheck, Users } from 'lucide-react';

export default function AdminDashboard({ pendingOfficials, handleAdminApproval }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOfficials = pendingOfficials.filter(off => 
    off.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    off.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    off.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-slide-up text-left">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-6">
        <div>
          <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white">
            Administrative Control panel
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Audit pending municipal official registrations and map ward specialties.
          </p>
        </div>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">Pending Approvals</span>
            <ShieldAlert className="text-orange-500" size={16} />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white font-display">{pendingOfficials.length}</h3>
          <span className="text-[9px] text-neutral-400 block mt-1">Official credentials awaiting verification</span>
        </div>

        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">System Audits</span>
            <CheckCircle2 className="text-teal-500" size={16} />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white font-display">100% MFA</h3>
          <span className="text-[9px] text-teal-600 font-bold block mt-1">✓ Secure raw SQL parameters enforced</span>
        </div>

        <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">Active Wards</span>
            <Users className="text-neutral-400" size={16} />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white font-display">20 Wards</h3>
          <span className="text-[9px] text-neutral-400 block mt-1">Covering entire Bengaluru BBMP zones</span>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative bg-white dark:bg-[#0c0c0e] p-3 rounded-xl border border-neutral-200 dark:border-neutral-900 shadow-sm max-w-md">
        <Search size={14} className="absolute left-6 top-5 text-neutral-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search pending officials..."
          className="w-full pl-9 pr-4 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-xs focus:outline-none focus:border-blue-600 transition"
        />
      </div>

      {/* Pendings Grid list */}
      {filteredOfficials.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#0c0c0e] border border-dashed border-neutral-200 dark:border-neutral-900 rounded-2xl text-neutral-500 text-sm">
          No pending verification requests cataloged under this criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOfficials.map((off) => (
            <div 
              key={off.id}
              className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-neutral-350 transition duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 font-bold text-sm flex items-center justify-center">
                    {off.name[0]}
                  </div>
                  <div className="leading-tight">
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white font-display">{off.name}</h4>
                    <span className="text-[10px] text-neutral-400 font-medium">{off.email}</span>
                  </div>
                </div>

                <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-2 border-t border-neutral-200/30 pt-3">
                  <p className="flex justify-between"><span>Designation:</span> <strong className="text-neutral-700 dark:text-neutral-300">{off.designation}</strong></p>
                  <p className="flex justify-between"><span>Specialty Department:</span> <strong className="text-neutral-700 dark:text-neutral-300">{off.department_name}</strong></p>
                  <p className="flex justify-between"><span>Administrative Ward:</span> <strong className="text-neutral-700 dark:text-neutral-300">{off.jurisdiction_name}</strong></p>
                  <p className="flex justify-between"><span>Office Location:</span> <strong className="text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]">{off.office_address}</strong></p>
                </div>

                {/* Proof images row */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="border border-neutral-200 dark:border-neutral-850 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/50">
                    <span className="text-[8px] uppercase font-bold text-neutral-400 block mb-1.5">Office ID Card</span>
                    <div className="h-28 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-250/20">
                      {off.office_id_proof ? (
                        <img src={off.office_id_proof} alt="Office ID Proof" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-neutral-450 italic">No Upload</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-neutral-200 dark:border-neutral-850 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/50">
                    <span className="text-[8px] uppercase font-bold text-neutral-400 block mb-1.5">Self Portrait</span>
                    <div className="h-28 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-250/20">
                      {off.photo_proof ? (
                        <img src={off.photo_proof} alt="Self Portrait" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-neutral-450 italic">No Capture</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-neutral-200/30 pt-4 mt-6">
                <button 
                  onClick={() => handleAdminApproval(off.id, 'Approve')}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check size={13} /> Approve credentials
                </button>
                <button 
                  onClick={() => handleAdminApproval(off.id, 'Reject')}
                  className="flex-1 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <X size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
