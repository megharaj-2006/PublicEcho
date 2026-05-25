import React from 'react';
import { Award, Star, Clock, ShieldAlert, ChevronRight, BarChart3 } from 'lucide-react';

export default function RankingsView({ leaderboard, loading, t = (key) => key, language = 'en' }) {
  return (
    <div className="space-y-8 animate-slide-up text-left font-sans">
      <div>
        <h2 className="text-2xl font-display font-black text-neutral-950 dark:text-white">
          {t('rankings_title')}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {t('rankings_desc')}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-neutral-500 text-xs">
          Calculating public feedback aggregates...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-neutral-950 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-2xl text-neutral-500 text-sm">
          <ShieldAlert className="mx-auto mb-3 text-neutral-400" size={32} />
          No rated official datasets available. Ratings populate dynamically as resolved complaints are rated by citizens.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podiums cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboard.slice(0, 3).map((item, idx) => {
              const medals = ['Gold Medalist', 'Silver Representative', 'Bronze Representative'];
              const borderColors = ['border-amber-400', 'border-slate-350', 'border-amber-700'];
              const textColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
              const bgColors = ['bg-amber-500/5', 'bg-slate-400/5', 'bg-amber-700/5'];

              return (
                <div 
                  key={item.official_id}
                  className={`bg-white dark:bg-[#0c0c0e] border ${borderColors[idx]} ${bgColors[idx]} rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${textColors[idx]}`}>
                        {medals[idx]}
                      </span>
                      <Award className={textColors[idx]} size={20} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-850 dark:text-white">
                        {item.official_name[0]}
                      </div>
                      <div className="leading-tight">
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white font-display">{item.official_name}</h4>
                        <span className="text-[10px] text-neutral-400 font-medium">{item.designation}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-2 border-t border-neutral-200/30 pt-3">
                      <p className="flex justify-between"><span>{t('ward')}:</span> <strong className="text-neutral-700 dark:text-neutral-350">{item.jurisdiction_name}</strong></p>
                      <p className="flex justify-between"><span>{t('cases_resolved')}:</span> <strong className="text-neutral-700 dark:text-neutral-350">{item.total_cases_rated}</strong></p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200/30 mt-4 flex justify-between items-end">
                    <div className="leading-none">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">{t('score_audit')}</span>
                      <span className="text-lg font-black text-neutral-900 dark:text-white font-display">{item.composite_rating}</span>
                      <span className="text-[10px] text-neutral-400 font-medium"> / 5.0</span>
                    </div>
                    
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={11} 
                          className={i < Math.round(item.composite_rating) ? 'text-amber-500 fill-amber-500' : 'text-neutral-300 dark:text-neutral-800'} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rankings Table */}
          <div className="bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50 text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center">Rank</th>
                    <th className="py-4 px-6">{t('official_name')}</th>
                    <th className="py-4 px-6">{t('ward')}</th>
                    <th className="py-4 px-6 text-center">{t('cases_resolved')}</th>
                    <th className="py-4 px-6 text-center">SLA Speed</th>
                    <th className="py-4 px-6 text-center">Quality</th>
                    <th className="py-4 px-6 text-center">Comm. Score</th>
                    <th className="py-4 px-6 text-right pr-8">{t('composite_rating')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-250 dark:divide-neutral-900 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 animate-slide-up">
                  {leaderboard.map((item, idx) => (
                    <tr key={item.official_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition">
                      <td className="py-4 px-6 text-center font-bold text-neutral-500">
                        #{idx + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center justify-center">
                            {item.official_name[0]}
                          </div>
                          <div>
                            <h5 className="font-bold text-neutral-900 dark:text-white text-sm leading-tight font-display">{item.official_name}</h5>
                            <p className="text-[10px] text-neutral-550 dark:text-neutral-450 font-medium">{item.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-neutral-600 dark:text-neutral-450">{item.jurisdiction_name}</td>
                      <td className="py-4 px-6 text-center font-bold text-neutral-900 dark:text-neutral-200">{item.total_cases_rated}</td>
                      <td className="py-4 px-6 text-center font-semibold text-neutral-600 dark:text-neutral-400">{item.avg_speed_score} / 5.0</td>
                      <td className="py-4 px-6 text-center font-semibold text-neutral-600 dark:text-neutral-400">{item.avg_quality_score} / 5.0</td>
                      <td className="py-4 px-6 text-center font-semibold text-neutral-600 dark:text-neutral-400">{item.avg_communication_score} / 5.0</td>
                      <td className="py-4 px-6 text-right pr-8">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 font-extrabold text-sm shadow-sm">
                          {item.composite_rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
