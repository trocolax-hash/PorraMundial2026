import React from 'react';
import { ParticipantStats, FoodReward } from '../types';
import { motion } from 'motion/react';
import { Trophy, Crown, ArrowRight, Pizza, Flame, Award, HelpCircle } from 'lucide-react';

interface LeaderboardProps {
  stats: ParticipantStats[];
  totalMatchesPlayed: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ stats, totalMatchesPlayed }) => {
  const winner = stats[0];
  const runnerUp = stats[1];

  const getFoodIcon = (reward: FoodReward) => {
    switch (reward) {
      case 'Burger King': return '🍔';
      case 'McDonalds': return '🍟';
      case 'Telepizza': return '🍕';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="leaderboard-section">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2" id="leaderboard-title">
        <Trophy className="text-amber-500 w-6 h-6" />
        Leaderboard General
      </h2>

      {/* Playful Food Invitation Tracker Card */}
      {winner && winner.score > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-4 mb-6"
          id="reward-invitation-status"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="text-amber-400 font-semibold text-sm">El líder provisional es {winner.name}</p>
              <p className="text-gray-300 text-xs mt-0.5">
                ¡Los demás se preparan para invitarle a cenar en {winner.exactScores % 3 === 0 ? 'Burger King 🍔' : winner.exactScores % 3 === 1 ? 'McDonalds 🍟' : 'Telepizza 🍕'}!
              </p>
            </div>
          </div>
          <div className="mt-3 bg-slate-950 rounded-full h-2 overflow-hidden flex" id="reward-progress-bar">
            {stats.map((p, i) => {
              const share = totalMatchesPlayed > 0 ? Math.round((p.score / (totalMatchesPlayed * 3)) * 100) : 16.6;
              const colors = [
                'bg-amber-500', 
                'bg-emerald-500', 
                'bg-blue-500', 
                'bg-pink-500', 
                'bg-purple-500', 
                'bg-orange-500'
              ];
              return (
                <div 
                  key={p.name} 
                  className={`${colors[i % colors.length]} transition-all duration-300`} 
                  style={{ width: `${Math.max(5, share)}%` }}
                  title={`${p.name}: ${p.score} pts`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-400">
            {stats.slice(0, 3).map((p, idx) => (
              <span key={p.name} className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                {p.name} ({p.score} pts)
              </span>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 mb-6 text-center" id="no-bets-alert">
          <p className="text-gray-400 text-xs">Aún no hay puntos acumulados. ¡Registra resultados para calcular los puntos!</p>
          <p className="text-amber-400 font-semibold text-xs mt-1">Premio: ¡Cena en Burger King, McDonalds o Telepizza!</p>
        </div>
      )}

      {/* Table Rankings */}
      <div className="space-y-3" id="ranks-list-container">
        {stats.map((participant, index) => {
          const isFirst = index === 0 && participant.score > 0;
          const isSecond = index === 1 && participant.score > 0;
          const isThird = index === 2 && participant.score > 0;

          return (
            <motion.div
              key={participant.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-250 ${
                isFirst 
                  ? 'bg-slate-800/60 border-slate-700' 
                  : 'bg-slate-800/20 border-transparent hover:bg-slate-800/30 hover:border-slate-850'
              }`}
              id={`rank-row-${participant.name}`}
            >
              <div className="flex items-center gap-3">
                {/* Position Marker */}
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isFirst 
                    ? 'bg-yellow-500 text-slate-950' 
                    : isSecond 
                    ? 'bg-slate-600 text-white' 
                    : isThird 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {index + 1}
                </span>

                <div>
                  <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                    {participant.name}
                    {isFirst && <Crown className="text-amber-400 w-3.5 h-3.5 fill-amber-400 inline" />}
                  </span>
                  
                  {/* Accurate statistics */}
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                    <span className="text-emerald-400 font-medium" title="Plenos Exactos (5 pts / 10 si España)">
                      🎯 {participant.exactScores} <span className="text-gray-500">exacto</span>
                    </span>
                    <span className="text-blue-400 font-medium" title="Diferencia exacta o Tendencia (1-6 pts)">
                      ⚖️ {participant.correctOutcomes} <span className="text-gray-500">tendencia</span>
                    </span>
                    <span className="text-gray-400 font-medium" title="Porcentaje de acierto">
                      📊 {participant.totalBets > 0 ? Math.round(((participant.exactScores + participant.correctOutcomes) / participant.totalBets) * 100) : 0}% acierto
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Accumulated Points */}
              <div className="text-right">
                <span className="text-emerald-400 font-mono font-bold text-base">{participant.score} pts</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mini-legend */}
      <div className="mt-5 text-[10px] text-gray-400 border-t border-slate-800 pt-3 flex flex-col gap-1.5 sm:flex-row sm:justify-between px-1" id="leaderboard-[legend]">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-0.5 text-gray-300">🎯 Pleno Exacto: <strong>5 pts</strong></span>
          <span className="flex items-center gap-0.5 text-gray-300">⚖️ Diferencia Exacta: <strong>3 pts</strong></span>
          <span className="flex items-center gap-0.5 text-gray-300">📈 Tendencia: <strong>1 pt</strong></span>
        </div>
        <span className="text-rose-450 font-bold flex items-center gap-1 mt-1 sm:mt-0 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
          🇪🇸 x2 Puntos España
        </span>
      </div>
    </div>
  );
};
