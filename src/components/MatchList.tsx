import React, { useState } from 'react';
import { Match, PARTICIPANTS, ParticipantName } from '../types';
import { calculateBetPoints, isMatchLocked } from '../utils/points';
import { Calendar, Clock, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchListProps {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (id: string) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ matches, onEdit, onDelete }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredMatches = matches.filter((match) => {
    if (filter === 'pending') return !match.isCompleted;
    if (filter === 'completed') return match.isCompleted;
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt); // Newest first

  const getPointsColor = (points: number) => {
    if (points >= 5) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (points >= 3) return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    if (points >= 1) return { bg: 'bg-blue-50/70', text: 'text-blue-700', border: 'border-blue-200' };
    return { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200' };
  };

  return (
    <div className="space-y-4" id="match-list-component">
      {/* Filters bar */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm" id="filter-tabs-container">
        <span className="text-xs font-bold text-slate-500 hidden sm:inline px-2">Partidos ({filteredMatches.length})</span>
        <div className="flex gap-1.5 w-full sm:w-auto justify-end">
          {(['all', 'pending', 'completed'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium capitalize transition-all duration-200 cursor-pointer ${
                filter === type
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {type === 'all' ? 'Todos' : type === 'pending' ? 'Pendientes' : 'Jugados'}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid/List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-500 text-sm shadow-sm">
          No hay partidos que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-4" id="match-cards-grid">
          {filteredMatches.map((match) => (
            <motion.div
              key={match.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden"
              id={`match-card-${match.id}`}
            >
              {/* Header info */}
              <div className="flex justify-between items-center text-[11px] text-slate-500 border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {match.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {match.time}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {(match.teamA.toLowerCase().includes('españa') || match.teamB.toLowerCase().includes('españa')) && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      🇪🇸 x2 Puntos España
                    </span>
                  )}
                  {isMatchLocked(match.date, match.time) && !match.isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Lock className="w-2.5 h-2.5 text-amber-600" /> Cerrado
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    match.isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {match.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Jugado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Pendiente
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Contenders Visual Display */}
              <div className="flex justify-between items-center px-2 py-2" id="teams-scores-grid">
                {/* Team Local */}
                <div className="flex-1 text-right pr-4 font-extrabold text-slate-800 text-sm sm:text-base truncate">
                  {match.teamA}
                </div>

                {/* Score badge / status */}
                <div className="flex items-center shrink-0 justify-center bg-slate-50 px-5 py-2 border border-slate-200 rounded-xl" id="score-block">
                  {match.isCompleted ? (
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-wider">
                      {match.scoreA} - {match.scoreB}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-bold uppercase tracking-wider font-sans">
                      VS
                    </span>
                  )}
                </div>

                {/* Team Visitor */}
                <div className="flex-1 text-left pl-4 font-extrabold text-slate-800 text-sm sm:text-base truncate">
                  {match.teamB}
                </div>
              </div>

              {/* Subtitle / result helper if manualWinner exists */}
              {match.isCompleted && match.manualWinner && (
                <div className="text-center text-[10px] text-amber-600 mt-2 italic font-semibold">
                  Ganador forzado manual: {match.manualWinner === 'Draw' ? 'Empate' : match.manualWinner}
                </div>
              )}

              {/* Participant Bets Grid */}
              <div className="mt-5 pt-4 border-t border-slate-100" id="participants-predictions-sec">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
                  Pronósticos del grupo:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {PARTICIPANTS.map((name) => {
                    const bet = match.bets[name];
                    const hasBet = bet !== null && bet !== undefined;
                    
                    let points = 0;
                    if (match.isCompleted && hasBet) {
                      points = calculateBetPoints(bet!.scoreA, bet!.scoreB, match.scoreA, match.scoreB, match.teamA, match.teamB);
                    }

                    const style = match.isCompleted && hasBet 
                      ? getPointsColor(points) 
                      : { bg: 'bg-slate-50/50', text: 'text-slate-400', border: 'border-slate-150' };

                    return (
                      <div 
                        key={name}
                        className={`p-2.5 rounded-xl border text-center transition-all ${style.bg} ${style.border}`}
                        id={`user-prediction-cell-${match.id}-${name}`}
                      >
                        <span className="text-[10px] text-slate-500 font-semibold block truncate mb-1">
                          {name}
                        </span>
                        
                        {hasBet ? (
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-800 font-mono block">
                              {bet!.scoreA} - {bet!.scoreB}
                            </span>
                            {match.isCompleted && (
                              <span className={`text-[10px] font-extrabold ${style.text} block`}>
                                {points >= 5 ? `🎯 +${points}` : (points === 3 || points === 6) ? `⚖️ +${points}` : points > 0 ? `📈 +${points}` : '❌ +0'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 block italic leading-5">Sin apuesta</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hover actions buttons for admin/updates */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-3 px-1">
                <button
                  onClick={() => onEdit(match)}
                  className="text-xs text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-slate-200/60 p-2 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Modificar
                </button>
                <button
                  onClick={() => onDelete(match.id)}
                  className="text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent p-2 rounded-lg font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
