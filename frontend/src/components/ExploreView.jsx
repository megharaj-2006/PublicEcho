import React, { useState, useEffect } from 'react';
import { Search, MapPin, Grid, List, Map, Compass, ShieldAlert, Award, Clock, Megaphone, ArrowUpRight, ChevronRight } from 'lucide-react';

export default function ExploreView({ 
  user, setView, popularGrievances = [], handleUpvote, departments = [], jurisdictions = [], getStatusBadge,
  t = (key) => key, language = 'en'
}) {
  const [exploreGridView, setExploreGridView] = useState(true);
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreWardFilter, setExploreWardFilter] = useState('all');
  const [exploreDeptFilter, setExploreDeptFilter] = useState('all');
  const [exploreStatusFilter, setExploreStatusFilter] = useState('all');
  const [exploreSort, setExploreSort] = useState('newest'); // 'newest' | 'upvotes'
  const [exploreMapView, setExploreMapView] = useState(false);

  // Render Leaflet explore map when map view toggle is enabled
  useEffect(() => {
    if (exploreMapView && window.L && popularGrievances.length > 0) {
      setTimeout(() => {
        const container = document.getElementById('explore-map-view');
        if (!container) return;

        if (window.exploreMapInstance) {
          window.exploreMapInstance.remove();
        }

        const map = window.L.map('explore-map-view').setView([12.9304, 77.6784], 12);
        window.exploreMapInstance = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // Add markers for all visible complaints that have valid coordinates
        filteredGrievances.forEach(g => {
          const lat = parseFloat(g.latitude);
          const lng = parseFloat(g.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            const popupHtml = `
              <div style="font-family: sans-serif; text-align: left; padding: 4px;">
                <h5 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #111827;">${g.title}</h5>
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #6b7280;">${g.address}</p>
                <span style="display: inline-block; padding: 2px 6px; border-radius: 9999px; font-size: 9px; font-weight: bold; background: #e5e7eb; color: #374151;">${g.status}</span>
              </div>
            `;
            window.L.marker([lat, lng])
              .addTo(map)
              .bindPopup(popupHtml);
          }
        });
      }, 300);
    }
  }, [exploreMapView, exploreSearch, exploreWardFilter, exploreDeptFilter, exploreStatusFilter]);

  // Unique list of ward names for the filter dropdown
  const uniqueWards = jurisdictions.map(j => (j.name || '').split(' (')[0]).filter((v, i, a) => v && a.indexOf(v) === i);

  // Local filtering & sorting logic
  const filteredGrievances = popularGrievances
    .filter(g => {
      const matchSearch = (g.title || '').toLowerCase().includes(exploreSearch.toLowerCase()) || 
                          (g.description || '').toLowerCase().includes(exploreSearch.toLowerCase()) ||
                          (g.address || '').toLowerCase().includes(exploreSearch.toLowerCase());
      const matchWard = exploreWardFilter === 'all' || 
                        (g.jurisdiction_name || '').toLowerCase().includes(exploreWardFilter.toLowerCase()) || 
                        (g.address || '').toLowerCase().includes(exploreWardFilter.toLowerCase());
      const matchDept = exploreDeptFilter === 'all' || g.department_name === exploreDeptFilter;
      const matchStatus = exploreStatusFilter === 'all' || g.status === exploreStatusFilter;
      return matchSearch && matchWard && matchDept && matchStatus;
    })
    .sort((a, b) => {
      if (exploreSort === 'upvotes') {
        return b.upvote_count - a.upvote_count;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Sidebar trending list
  const trendingList = [...popularGrievances].sort((a, b) => b.upvote_count - a.upvote_count).slice(0, 4);

  return (
    <div className="space-y-8 animate-slide-up text-left font-sans">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-6">
        <div>
          <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white flex items-center gap-2">
            <Compass className="text-blue-600" /> {t('explore_title')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('explore_desc')}</p>
        </div>

        {/* List/Grid/Map Layout Toggles */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-800 w-fit">
          <button 
            onClick={() => { setExploreMapView(false); setExploreGridView(true); }}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${!exploreMapView && exploreGridView ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
            title="Grid View"
          >
            <Grid size={14} /> <span className="hidden sm:inline">{language === 'kn' ? 'ಗ್ರಿಡ್' : language === 'hi' ? 'ग्रिड' : 'Grid'}</span>
          </button>
          <button 
            onClick={() => { setExploreMapView(false); setExploreGridView(false); }}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${!exploreMapView && !exploreGridView ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
            title="List View"
          >
            <List size={14} /> <span className="hidden sm:inline">{language === 'kn' ? 'ಪಟ್ಟಿ' : language === 'hi' ? 'सूची' : 'List'}</span>
          </button>
          <button 
            onClick={() => setExploreMapView(true)}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${exploreMapView ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
            title="Map View"
          >
            <Map size={14} /> <span className="hidden sm:inline">{language === 'kn' ? 'ನಕ್ಷೆ' : language === 'hi' ? 'मानचित्र' : 'Map'}</span>
          </button>
        </div>
      </div>

      {/* Query Search Filter Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-center bg-white dark:bg-[#0c0c0e] p-4 rounded-xl border border-neutral-200 dark:border-neutral-900 shadow-sm">
        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-3 text-neutral-400 dark:text-neutral-500" />
          <input 
            type="text" 
            value={exploreSearch}
            onChange={(e) => setExploreSearch(e.target.value)}
            placeholder={t('search_title_addr')}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:focus:border-blue-600 transition"
          />
        </div>

        {/* Ward Filter */}
        <select 
          value={exploreWardFilter}
          onChange={(e) => setExploreWardFilter(e.target.value)}
          className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-600 transition text-neutral-700 dark:text-neutral-300"
        >
          <option value="all">{t('all_wards')}</option>
          {uniqueWards.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        {/* Department Filter */}
        <select 
          value={exploreDeptFilter}
          onChange={(e) => setExploreDeptFilter(e.target.value)}
          className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-600 transition text-neutral-700 dark:text-neutral-300"
        >
          <option value="all">{t('all_categories')}</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select 
          value={exploreStatusFilter}
          onChange={(e) => setExploreStatusFilter(e.target.value)}
          className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-600 transition text-neutral-700 dark:text-neutral-300 animate-slide-up"
        >
          <option value="all">{t('all_statuses')}</option>
          <option value="Pending">{t('status_pending')}</option>
          <option value="Assigned">{t('status_assigned')}</option>
          <option value="In Progress">{t('status_progress')}</option>
          <option value="Resolved">{t('status_resolved')}</option>
          <option value="Rejected">{t('status_rejected')}</option>
        </select>

        {/* Sorting controls */}
        <select 
          value={exploreSort}
          onChange={(e) => setExploreSort(e.target.value)}
          className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-600 transition text-neutral-700 dark:text-neutral-300 sm:col-span-2 md:col-span-1"
        >
          <option value="newest">{language === 'en' ? 'Newest First' : language === 'kn' ? 'ಇತ್ತೀಚಿನವುಗಳು ಮೊದಲು' : 'नवीनतम पहले'}</option>
          <option value="upvotes">{language === 'en' ? 'Most Upvotes' : language === 'kn' ? 'ಹೆಚ್ಚಿನ ಅಪ್‌ವೋಟ್‌ಗಳು' : 'सर्वाधिक अपवोट'}</option>
        </select>
      </div>

      {/* Main Grid Content Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Grievance Feeds / Map */}
        <div className="lg:col-span-9 space-y-6">
          {exploreMapView ? (
            <div className="space-y-4">
              <div id="explore-map-view" className="w-full h-[460px] rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-950 z-10 shadow-sm relative"></div>
              <p className="text-[10px] text-neutral-400 italic text-center">Interactive Leaflet markers active. Click any marker node to audit local reported coordinates.</p>
            </div>
          ) : (
            <>
              {filteredGrievances.length === 0 ? (
                <div className="p-16 text-center bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl text-neutral-500 text-sm">
                  <ShieldAlert className="mx-auto mb-3 text-neutral-400" size={32} />
                  {t('no_complaints')}
                </div>
              ) : (
                <div className={exploreGridView ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                  {filteredGrievances.map((g) => (
                    <div 
                      key={g.id} 
                      className={`bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-800 rounded-2xl shadow-sm transition duration-200 flex ${exploreGridView ? "flex-col justify-between p-5 h-full" : "flex-row p-4 gap-4 items-center justify-between"}`}
                    >
                      {/* Left Block (Text and image details) */}
                      <div className={exploreGridView ? "space-y-3" : "flex-grow flex gap-4 items-center min-w-0"}>
                        {exploreGridView ? (
                          <>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[9px] font-mono text-neutral-400">{t('status_pending') !== 'Pending' ? t('status_pending').split(' ')[0] : 'ID'}: #{g.id}</span>
                              <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-[9px] font-bold border border-neutral-200 dark:border-neutral-800">
                                {g.department_name}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white leading-snug line-clamp-2 font-display">{g.title}</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">{g.description}</p>
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-350 flex items-start gap-1.5 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-250/30">
                              <MapPin size={11} className="text-neutral-400 mt-0.5 shrink-0" />
                              <span className="truncate">{g.address}</span>
                            </p>
                            {g.image_url && (
                              <div className="w-full h-28 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900">
                                <img src={g.image_url} alt="Evidence" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition duration-300" />
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {g.image_url ? (
                              <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900 shrink-0">
                                <img src={g.image_url} alt="Evidence" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-255/40 text-neutral-400 flex items-center justify-center shrink-0">
                                <ShieldAlert size={20} />
                              </div>
                            )}
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-neutral-400">ID: #{g.id}</span>
                                <span className="text-[9px] font-bold text-blue-600">{g.department_name}</span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white truncate font-display">{g.title}</h4>
                              <p className="text-[11px] text-neutral-550 truncate flex items-center gap-1">
                                <MapPin size={10} className="text-neutral-400 shrink-0" /> {g.address}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right Block (Upvote controls & badge status) */}
                      <div className={exploreGridView ? "border-t border-neutral-100 dark:border-neutral-900/60 pt-4 mt-4 flex items-center justify-between gap-3" : "flex items-center gap-6 shrink-0"}>
                        {!exploreGridView && (
                          <div className="hidden sm:flex flex-col text-right items-end gap-1">
                            <span className="text-[10px] text-neutral-400 font-medium">SLA: {g.SLA_days || 7}d limit</span>
                            <span className="text-[9px] text-neutral-500">{new Date(g.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className={exploreGridView ? "flex flex-col" : "flex items-center gap-3"}>
                          {getStatusBadge(g.status)}
                        </div>

                        <button
                          onClick={() => handleUpvote(g.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                            g.user_has_upvoted
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                          }`}
                        >
                          {t('upvote')} <span className="font-extrabold">{g.upvote_count}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Trending Wards Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold uppercase font-display tracking-widest text-neutral-950 dark:text-white border-b border-neutral-100 dark:border-neutral-900/60 pb-3">
              {t('trending_grievances')}
            </h4>
            
            <div className="space-y-3.5">
              {trendingList.map((item, idx) => (
                <div key={item.id} className="flex gap-2 text-left cursor-pointer group" onClick={() => setExploreSearch(item.title)}>
                  <div className="w-5 h-5 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="leading-tight min-w-0">
                    <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-blue-600 transition">
                      {item.title}
                    </h5>
                    <span className="text-[9px] text-neutral-400 block mt-0.5">{item.upvote_count} {t('upvote')} • {item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl p-6 text-white text-left space-y-4 shadow-md">
            <h4 className="font-display font-black text-lg leading-tight">
              {language === 'en' ? 'Need Immediate Assistance?' : language === 'kn' ? 'ತಕ್ಷಣದ ಸಹಾಯ ಬೇಕೇ?' : 'तत्काल सहायता की आवश्यकता है?'}
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              {language === 'en' ? 'Log in to unlock direct message capabilities, detailed resolution milestones, and official escalation triggers.' : language === 'kn' ? 'ಅಧಿಕೃತ ಎಸ್ಕಲೇಷನ್ ಟ್ರಿಗರ್‌ಗಳನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.' : 'आधिकारिक वृद्धि ट्रिगर्स को अनलॉक करने के लिए साइन इन करें।'}
            </p>
            <button 
              onClick={() => setView(user ? 'citizen-dash' : 'login')}
              className="w-full py-2 bg-white text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow active:scale-[0.98] transition-all"
            >
              {t('enter_dashboard')} <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
