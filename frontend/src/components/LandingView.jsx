import React from 'react';
import { ChevronRight, MapPin, BarChart3, Star, AlertTriangle, ShieldCheck, Flame, Users } from 'lucide-react';

export default function LandingView({ 
  user, setView, setRegisterRole, popularGrievances, userLocation, handleUpvote, leaderboard,
  t = (key) => key, language = 'en'
}) {
  const trendingIssues = [...popularGrievances].slice(0, 3);
  const topOfficials = [...leaderboard].slice(0, 3);

  // Total Complaints & Resolved stats
  const totalComplaints = popularGrievances.length + 342;
  const totalResolved = leaderboard.reduce((acc, val) => acc + (val.total_cases_rated || 0), 0) + 184;

  return (
    <div className="space-y-24 animate-slide-up text-left font-sans">
      {/* 1. HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6 lg:py-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
            {t('hub_badge')}
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight leading-[1.05] text-neutral-950 dark:text-white">
            {language === 'en' ? (
              <>
                Make Your <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">City Heard</span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{t('hero_title')}</span>
            )}
          </h2>
          
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl">
            {t('hero_desc')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={() => {
                if (user) {
                  setView(user.role === 'citizen' ? 'citizen-dash' : user.role === 'admin' ? 'admin-dash' : 'official-dash');
                } else {
                  setView('register');
                  setRegisterRole('citizen');
                }
              }}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t('report_issue')} <ChevronRight size={13} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => setView('explore')}
              className="px-6 py-3 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-all"
            >
              {t('explore_hub')}
            </button>
          </div>
        </div>

        {/* Hero Interactive Visualization Mockup */}
        <div className="lg:col-span-5 relative w-full h-[360px] rounded-2xl overflow-hidden border border-neutral-250 dark:border-neutral-900 shadow-xl bg-white dark:bg-neutral-950 p-6 flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-teal-500/5 pointer-events-none"></div>
          
          {/* Smart City dashboard preview item */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-150 dark:border-neutral-900 pb-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Live Ward Analytics</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Zone-Wise SLA Efficiency</span>
                <span className="font-bold text-blue-600">92.4%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-teal-500 h-full rounded-full" style={{ width: '92.4%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200/40 dark:border-neutral-850">
                <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest block">{t('response')}</span>
                <span className="text-sm font-black text-neutral-800 dark:text-white mt-1 block">4.8 hours</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200/40 dark:border-neutral-850">
                <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest block">{t('resolution')}</span>
                <span className="text-sm font-black text-neutral-800 dark:text-white mt-1 block">2.3 days</span>
              </div>
            </div>
          </div>

          {/* Cityscape Background Graphic */}
          <div className="h-28 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900 relative">
            <img 
              src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop" 
              alt="Bengaluru Grid" 
              className="w-full h-full object-cover grayscale opacity-40 dark:opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[9px] uppercase font-bold text-neutral-500 tracking-wider">
              <MapPin size={10} className="text-teal-500" /> Bengaluru Municipal Grid
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE STATS SECTION */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{t('total_complaints')}</span>
            <AlertTriangle className="text-blue-600 shrink-0" size={16} />
          </div>
          <h3 className="text-3xl font-black font-display text-neutral-900 dark:text-white tracking-tight">{totalComplaints}</h3>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ 12 reported today</p>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{t('resolved_issues')}</span>
            <ShieldCheck className="text-teal-500 shrink-0" size={16} />
          </div>
          <h3 className="text-3xl font-black font-display text-neutral-900 dark:text-white tracking-tight">{totalResolved}</h3>
          <p className="text-[10px] text-teal-600 font-bold mt-1">✓ 94.2% Resolution Rate</p>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{t('active_officials')}</span>
            <Users className="text-neutral-400 shrink-0" size={16} />
          </div>
          <h3 className="text-3xl font-black font-display text-neutral-900 dark:text-white tracking-tight">{leaderboard.length + 12}</h3>
          <p className="text-[10px] text-neutral-400 mt-1">Across 20 Bengaluru Wards</p>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{t('citizen_satisfaction')}</span>
            <Star className="text-yellow-500 shrink-0" size={16} />
          </div>
          <h3 className="text-3xl font-black font-display text-neutral-900 dark:text-white tracking-tight">89.4%</h3>
          <p className="text-[10px] text-yellow-600 font-bold mt-1">Based on composite speed audits</p>
        </div>
      </section>

      {/* 3. TRENDING ISSUES SECTION */}
      <section className="space-y-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-900">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-display font-black text-neutral-950 dark:text-white flex items-center gap-2">
              <Flame className="text-orange-500" size={20} /> {t('trending_grievances')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('trending_desc')}</p>
          </div>
          <button 
            onClick={() => setView('explore')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all"
          >
            {t('all_issues')} <ChevronRight size={12} />
          </button>
        </div>

        {trendingIssues.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl text-neutral-500 text-sm">
            {t('no_trending')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingIssues.map((g) => (
              <div 
                key={g.id} 
                className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition duration-200"
              >
                <div>
                  <div className="flex justify-between items-center gap-2 mb-3">
                    <span className="text-[9px] font-mono text-neutral-400">ID: #{g.id}</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-[9px] font-bold border border-neutral-200 dark:border-neutral-800">
                      {g.department_name}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-950 dark:text-white mb-2 leading-snug line-clamp-2 font-display">{g.title}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4 leading-relaxed">{g.description}</p>

                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5 mb-4 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200/40 dark:border-neutral-850">
                    <MapPin size={11} className="text-neutral-400 mt-0.5 shrink-0" />
                    <span className="truncate">{g.address}</span>
                  </p>

                  {g.image_url && (
                    <div className="w-full h-28 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900 mb-4">
                      <img src={g.image_url} alt="Grievance evidence" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition duration-300" />
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-900/60 pt-4 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-neutral-400">{t('status')}: <strong className="text-neutral-600 dark:text-neutral-300 uppercase">{g.status}</strong></span>

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
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="space-y-12 pt-4 border-t border-neutral-200/60 dark:border-neutral-900">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl font-display font-black text-neutral-950 dark:text-white">{t('how_it_works')}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('seamless_gov')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-6 rounded-2xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 font-black flex items-center justify-center mx-auto text-sm">1</div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{t('step1_title')}</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{t('step1_desc')}</p>
          </div>

          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-6 rounded-2xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-500 font-black flex items-center justify-center mx-auto text-sm">2</div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{t('step2_title')}</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{t('step2_desc')}</p>
          </div>

          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-6 rounded-2xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 font-black flex items-center justify-center mx-auto text-sm">3</div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{t('step3_title')}</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{t('step3_desc')}</p>
          </div>
        </div>
      </section>

      {/* 5. TOP OFFICIALS PREVIEW */}
      <section className="space-y-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-900 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-display font-black text-neutral-950 dark:text-white">{t('top_wards')}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('top_wards_desc')}</p>
          </div>
          <button 
            onClick={() => setView('leaderboard')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all"
          >
            {t('full_leaderboard')} <ChevronRight size={12} />
          </button>
        </div>

        {topOfficials.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl text-neutral-500 text-sm">
            No rated officials cataloged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topOfficials.map((item, idx) => (
              <div 
                key={item.official_id} 
                className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-600 font-bold text-xs flex items-center justify-center">
                      {item.official_name[0]}
                    </div>
                    <div className="leading-tight">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{item.official_name}</h4>
                      <span className="text-[10px] text-neutral-400 font-medium">{item.designation}</span>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-2 border-t border-neutral-100 dark:border-neutral-900/60 pt-3">
                    <p className="flex justify-between"><span>{t('ward')}:</span> <strong className="text-neutral-700 dark:text-neutral-350">{item.jurisdiction_name}</strong></p>
                    <p className="flex justify-between"><span>{t('cases_resolved')}:</span> <strong className="text-neutral-700 dark:text-neutral-350">{item.total_cases_rated}</strong></p>
                  </div>
                </div>
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900/60 mt-4 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">{t('score_audit')}</span>
                  <span className="text-xs font-black text-teal-500">{item.composite_rating} / 5.0</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
