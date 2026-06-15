import React, { useState } from 'react';
import { ParticipantStats, PARTICIPANTS, ParticipantName } from '../types';
import { motion } from 'motion/react';
import { Award, TrendingUp, Sparkles, AlertCircle, ShoppingBag, Vote } from 'lucide-react';

interface StatsDashboardProps {
  stats: ParticipantStats[];
  totalMatches: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, totalMatches }) => {
  // Local state to simulate food votes for fun!
  const [foodVotes, setFoodVotes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('porra_food_votes');
    return saved ? JSON.parse(saved) : { 'Burger King 🍔': 2, 'McDonalds 🍟': 3, 'Telepizza 🍕': 1 };
  });

  const [hasVoted, setHasVoted] = useState<string | null>(() => {
    return localStorage.getItem('porra_voted') || null;
  });

  const handleVote = (food: string) => {
    if (hasVoted) return;
    const nextVotes = { ...foodVotes, [food]: foodVotes[food] + 1 };
    setFoodVotes(nextVotes);
    localStorage.setItem('porra_food_votes', JSON.stringify(nextVotes));
    localStorage.setItem('porra_voted', food);
    setHasVoted(food);
  };

  // Find some premium roles
  // 1. Most exact scores
  const getMostExactScores = () => {
    const sorted = [...stats].sort((a, b) => b.exactScores - a.exactScores);
    return sorted[0]?.exactScores > 0 ? sorted[0] : null;
  };

  // 2. Highest hit rate
  const getHighestHitRate = () => {
    const sorted = [...stats].sort((a, b) => {
      const rateA = a.totalBets > 0 ? (a.exactScores + a.correctOutcomes) / a.totalBets : 0;
      const rateB = b.totalBets > 0 ? (b.exactScores + b.correctOutcomes) / b.totalBets : 0;
      return rateB - rateA;
    });
    return sorted[0]?.totalBets > 0 ? sorted[0] : null;
  };

  const mostExact = getMostExactScores();
  const highestHit = getHighestHitRate();

  const totalVotes = Object.values(foodVotes).reduce((sum: number, v: number) => sum + v, 0) as number;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative text-slate-800" id="stats-dashboard-container">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Sparkles className="text-emerald-600 w-6 h-6 animate-pulse" />
        Analíticas y Honor
      </h2>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: El Gurú de la Porra */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">El Nostradamus</span>
            <h3 className="text-lg font-bold text-slate-850 mt-1">Efectividad Exacta</h3>
            <p className="text-slate-500 text-xs mt-2">
              El integrante con más marcadores clavados (5 puntos netos por acierto, 10 si juega España).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            {mostExact ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span className="font-semibold text-slate-800 text-sm">{mostExact.name}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-855 text-xs font-bold px-2.5 py-1 rounded">
                  {mostExact.exactScores} Clavados
                </span>
              </>
            ) : (
              <span className="text-slate-400 text-xs">Sin registros aún</span>
            )}
          </div>
        </div>

        {/* Card 2: El Visionario */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">El Visionario</span>
            <h3 className="text-lg font-bold text-slate-850 mt-1">Éxito en Resultados</h3>
            <p className="text-slate-500 text-xs mt-2">
              Quien tiene mayor puntería de ganadores y empates sin importar goles exactos.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            {highestHit ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔮</span>
                  <span className="font-semibold text-slate-800 text-sm">{highestHit.name}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded">
                  {Math.round(((highestHit.exactScores + highestHit.correctOutcomes) / highestHit.totalBets) * 100)}% Aciertos
                </span>
              </>
            ) : (
              <span className="text-slate-400 text-xs">Sin registros aún</span>
            )}
          </div>
        </div>
      </div>

      {/* Mini Poll of Meal spots */}
      <div className="mt-6 bg-slate-50 border border-slate-150 rounded-xl p-5" id="meal-voting-container">
        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
          <Vote className="text-emerald-600 w-4 h-4" />
          ¿A dónde iremos a celebrarlo? (Votación Grupo)
        </h4>
        <p className="text-slate-500 text-xs mb-4">
          La porra dicta cena cortesía del grupo. ¡Votad vuestra preferencia! El perdedor paga su parte, la estrella del mundial come gratis.
        </p>

        <div className="space-y-3">
          {Object.entries(foodVotes).map(([food, votes]) => {
            const votesNum = votes as number;
            const pct = totalVotes > 0 ? Math.round((votesNum / totalVotes) * 100) : 0;
            return (
              <div key={food} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <button 
                    disabled={hasVoted !== null}
                    onClick={() => handleVote(food)}
                    className={`flex items-center gap-1 font-medium text-left transition-colors duration-200 ${
                      hasVoted === null 
                        ? 'text-slate-700 hover:text-emerald-600 cursor-pointer' 
                        : hasVoted === food 
                        ? 'text-emerald-700 font-semibold' 
                        : 'text-slate-400'
                    }`}
                  >
                    {food} {hasVoted === food && <span className="text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded text-emerald-800">Mi voto</span>}
                  </button>
                  <span className="text-slate-500 text-[11px] font-mono">{votesNum} votos ({pct}%)</span>
                </div>
                <div className="relative w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-full bg-emerald-600 rounded-full" 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {hasVoted && (
          <p className="text-[10px] text-emerald-600 mt-2 text-center font-bold">
            ✔ Voto registrado. ¡Que gane el mejor comensal!
          </p>
        )}
      </div>

      {/* Funny Footnote */}
      <div className="mt-4 flex items-start gap-2 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
        <AlertCircle className="text-slate-400 w-4 h-4 shrink-0 mt-0.5" />
        <span className="text-[11px] text-slate-500 leading-relaxed">
          <strong>Regla Máxima:</strong> El ganador final elegirá el menú y se sentará en la cabecera. Es obligatorio que Raúl, Paco Padre, David, Samuel, Héctor y PacBoy asistan a abonar la cuenta.
        </span>
      </div>
    </div>
  );
};
