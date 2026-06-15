import React, { useState, useEffect } from 'react';
import { Match, ParticipantBet, PARTICIPANTS, ParticipantName } from '../types';
import { Plus, Check, Calendar, Clock, Sword, Users, ShieldAlert, Award, Lock } from 'lucide-react';
import { isMatchLocked } from '../utils/points';

interface MatchFormProps {
  onSave: (matchData: Omit<Match, 'id' | 'createdAt'> & { id?: string }) => void;
  onCancel: () => void;
  editingMatch?: Match | null;
  isAdmin?: boolean;
}

export const MatchForm: React.FC<MatchFormProps> = ({ onSave, onCancel, editingMatch, isAdmin = false }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  
  // Real scores (can be empty/null initially)
  const [hasPlayed, setHasPlayed] = useState(false);
  const [scoreA, setScoreA] = useState<string>('');
  const [scoreB, setScoreB] = useState<string>('');
  const [manualWinner, setManualWinner] = useState<ParticipantName | 'Draw' | ''>('');

  // Individual bets mapped by participant name
  const [bets, setBets] = useState<Record<string, { scoreA: string; scoreB: string }>>(() => {
    const initialBets: Record<string, { scoreA: string; scoreB: string }> = {};
    PARTICIPANTS.forEach((name) => {
      initialBets[name] = { scoreA: '', scoreB: '' };
    });
    return initialBets;
  });

  // Pre-fill parameters when editing
  useEffect(() => {
    if (editingMatch) {
      setDate(editingMatch.date);
      setTime(editingMatch.time);
      setTeamA(editingMatch.teamA);
      setTeamB(editingMatch.teamB);
      setHasPlayed(editingMatch.isCompleted);
      setScoreA(editingMatch.scoreA !== null ? String(editingMatch.scoreA) : '');
      setScoreB(editingMatch.scoreB !== null ? String(editingMatch.scoreB) : '');
      setManualWinner(editingMatch.manualWinner || '');
      
      const nextBets: Record<string, { scoreA: string; scoreB: string }> = {};
      PARTICIPANTS.forEach((name) => {
        const bet = editingMatch.bets[name];
        nextBets[name] = {
          scoreA: bet !== null && bet !== undefined ? String(bet.scoreA) : '',
          scoreB: bet !== null && bet !== undefined ? String(bet.scoreB) : ''
        };
      });
      setBets(nextBets);
    } else {
      // Default to today's date
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setTime('20:00');
    }
  }, [editingMatch]);

  const handleBetChange = (participant: ParticipantName, field: 'scoreA' | 'scoreB', val: string) => {
    // Only allow positive numbers or empty string
    if (val !== '' && !/^\d+$/.test(val)) return;
    setBets((prev) => ({
      ...prev,
      [participant]: {
        ...prev[participant],
        [field]: val
      }
    }));
  };

  const handleScoreChange = (field: 'A' | 'B', val: string) => {
    if (val !== '' && !/^\d+$/.test(val)) return;
    if (field === 'A') setScoreA(val);
    else setScoreB(val);
  };

  const incrementBet = (participant: ParticipantName, field: 'scoreA' | 'scoreB') => {
    const current = bets[participant][field];
    const num = current === '' ? 0 : parseInt(current, 10);
    setBets((prev) => ({
      ...prev,
      [participant]: {
        ...prev[participant],
        [field]: String(num + 1)
      }
    }));
  };

  const decrementBet = (participant: ParticipantName, field: 'scoreA' | 'scoreB') => {
    const current = bets[participant][field];
    if (current === '' || current === '0') return;
    const num = parseInt(current, 10);
    setBets((prev) => ({
      ...prev,
      [participant]: {
        ...prev[participant],
        [field]: String(num - 1)
      }
    }));
  };

  const incrementRealScore = (field: 'A' | 'B') => {
    const current = field === 'A' ? scoreA : scoreB;
    const num = current === '' ? 0 : parseInt(current, 10);
    if (field === 'A') setScoreA(String(num + 1));
    else setScoreB(String(num + 1));
  };

  const decrementRealScore = (field: 'A' | 'B') => {
    const current = field === 'A' ? scoreA : scoreB;
    if (current === '' || current === '0') return;
    const num = parseInt(current, 10);
    if (field === 'A') setScoreA(String(num - 1));
    else setScoreB(String(num - 1));
  };

  const isLocked = isMatchLocked(date, time) && !isAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !date || !time) {
      alert('Por favor introduce equipos contrincantes, fecha y hora.');
      return;
    }

    // Prepare bets object
    const finalBets: Record<string, ParticipantBet | null> = {};
    PARTICIPANTS.forEach((name) => {
      const b = bets[name];
      if (b.scoreA !== '' && b.scoreB !== '') {
        finalBets[name] = {
          scoreA: parseInt(b.scoreA, 10),
          scoreB: parseInt(b.scoreB, 10)
        };
      } else {
        finalBets[name] = null;
      }
    });

    onSave({
      id: editingMatch?.id,
      date,
      time,
      teamA: teamA.trim(),
      teamB: teamB.trim(),
      scoreA: hasPlayed && scoreA !== '' ? parseInt(scoreA, 10) : null,
      scoreB: hasPlayed && scoreB !== '' ? parseInt(scoreB, 10) : null,
      isCompleted: hasPlayed,
      manualWinner: manualWinner ? (manualWinner as ParticipantName | 'Draw') : null,
      bets: finalBets
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6 text-slate-800" id="match-form-root">
      <div className="border-b border-slate-150 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {editingMatch ? 'Editar Partido y Pronósticos' : 'Registrar Nuevo Partido'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ingresa los detalles del partido y las predicciones de cada uno del grupo.
          </p>
        </div>
      </div>

      {/* Grid of basic info: Contenders, Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teams block */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <Sword className="w-3.5 h-3.5" />
            Contrincantes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-bold block mb-1">Local / Equipo A</label>
              <input
                type="text"
                placeholder="Ej. España 🇪🇸"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-600 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-bold block mb-1">Visitante / Equipo B</label>
              <input
                type="text"
                placeholder="Ej. Alemania 🇩🇪"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-600 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Date and Time block */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Programación
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-bold block mb-1">Fecha</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-600 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-bold block mb-1">Hora</label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-emerald-600 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional real match scores */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="match-played-toggle"
              checked={hasPlayed}
              onChange={(e) => setHasPlayed(e.target.checked)}
              className="w-4 h-4 text-emerald-600 bg-white border-slate-300 focus:ring-emerald-500 rounded cursor-pointer"
            />
            <label htmlFor="match-played-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
              ¿Ya se ha jugado este partido? Introduce el Resultado Final
            </label>
          </div>
          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${hasPlayed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-150 text-slate-500'}`}>
            {hasPlayed ? 'Jugado' : 'Pendiente'}
          </span>
        </div>

        {hasPlayed && (
          <div className="border-t border-slate-200/60 pt-3 flex flex-col md:flex-row items-center gap-6 justify-around">
            <div className="flex items-center gap-6">
              {/* Home goals */}
              <div className="text-center">
                <span className="text-xs text-slate-500 block mb-1.5 truncate max-w-[100px]">{teamA || 'Local'}</span>
                <div className="flex items-center gap-1.5 justify-center">
                  <button 
                    type="button"
                    onClick={() => decrementRealScore('A')}
                    className="w-8 h-8 rounded bg-slate-150 text-slate-700 hover:bg-slate-200 active:bg-slate-350 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={scoreA}
                    onChange={(e) => handleScoreChange('A', e.target.value)}
                    className="w-12 bg-white border border-slate-200 rounded text-center text-lg font-black text-slate-800 h-8 focus:outline-none focus:border-emerald-600 font-mono"
                    placeholder="-"
                  />
                  <button 
                    type="button"
                    onClick={() => incrementRealScore('A')}
                    className="w-8 h-8 rounded bg-slate-150 text-slate-700 hover:bg-slate-200 active:bg-slate-350 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-lg font-bold text-slate-400 mt-5">:</span>

              {/* Visitor goals */}
              <div className="text-center">
                <span className="text-xs text-slate-500 block mb-1.5 truncate max-w-[100px]">{teamB || 'Visitante'}</span>
                <div className="flex items-center gap-1.5 justify-center">
                  <button 
                    type="button"
                    onClick={() => decrementRealScore('B')}
                    className="w-8 h-8 rounded bg-slate-155 text-slate-700 hover:bg-slate-200 active:bg-slate-350 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={scoreB}
                    onChange={(e) => handleScoreChange('B', e.target.value)}
                    className="w-12 bg-white border border-slate-200 rounded text-center text-lg font-black text-slate-800 h-8 focus:outline-none focus:border-emerald-600 font-mono"
                    placeholder="-"
                  />
                  <button 
                    type="button"
                    onClick={() => incrementRealScore('B')}
                    className="w-8 h-8 rounded bg-slate-155 text-slate-700 hover:bg-slate-200 active:bg-slate-350 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Optional winner selector ties/overrides */}
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <label className="text-[11px] text-slate-500 block mb-1 font-bold">
                Ganador del Partido (Opcional)
              </label>
              <select
                value={manualWinner}
                onChange={(e) => setManualWinner(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-200 focus:border-emerald-600 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="">Automático por goles</option>
                <option value="Draw">Empate</option>
                {PARTICIPANTS.map((p) => (
                  <option key={p} value={p}>Manual: {p}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Predictions for each of the 6 friends */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 border-b border-slate-150 pb-2">
          <Users className="w-4 h-4" />
          Apuestas de los Participantes (Raúl, Paco Padre, Co.)
        </h3>

        {isLocked && (
          <div className="bg-slate-100 rounded-xl p-3 flex items-start gap-2 text-slate-600 border border-slate-200/60 transition" id="anti-cheat-lock-alert">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="text-[11px] leading-relaxed">
              <strong>Apuestas bloqueadas (Antitrampas):</strong> Este partido comenzó hace más de 10 minutos (el {date} a las {time}). No se permiten cambios en los pronósticos grupales para evitar trucos.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTICIPANTS.map((name) => (
            <div 
              key={name}
              className="bg-white border border-slate-200 hover:border-slate-300 p-3.5 rounded-xl space-y-2 flex flex-col justify-between shadow-xs transition duration-150"
              id={`betting-box-${name}`}
            >
              <span className="text-xs font-extrabold text-slate-800 block border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-slate-300 animate-pulse' : 'bg-emerald-600'}`} />
                  {name}
                </span>
                {isLocked && (
                  <span className="text-[10px] text-amber-605 font-bold flex items-center gap-1" id={`lock-badge-${name}`}>
                    <Lock className="w-3 h-3 text-amber-600" />
                    Cerrado
                  </span>
                )}
              </span>

              <div className="flex items-center justify-between gap-2 mt-2">
                {/* Predictions Team A */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1 truncate max-w-[65px]">{teamA || 'Local'}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => !isLocked && decrementBet(name, 'scoreA')}
                      disabled={isLocked}
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition ${
                        isLocked 
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 cursor-pointer'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={bets[name].scoreA}
                      onChange={(e) => handleBetChange(name, 'scoreA', e.target.value)}
                      disabled={isLocked}
                      className={`w-8 text-center text-xs text-slate-800 rounded font-bold h-6 focus:outline-none focus:border-emerald-600 font-mono transition ${
                        isLocked 
                          ? 'bg-slate-50 border border-slate-150 cursor-not-allowed text-slate-400' 
                          : 'bg-white border border-slate-200'
                      }`}
                      placeholder="-"
                    />
                    <button 
                      type="button"
                      onClick={() => !isLocked && incrementBet(name, 'scoreA')}
                      disabled={isLocked}
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition ${
                        isLocked 
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 cursor-pointer'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-300 mt-4">-</span>

                {/* Predictions Team B */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1 truncate max-w-[65px]">{teamB || 'Visitante'}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => !isLocked && decrementBet(name, 'scoreB')}
                      disabled={isLocked}
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition ${
                        isLocked 
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 cursor-pointer'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={bets[name].scoreB}
                      onChange={(e) => handleBetChange(name, 'scoreB', e.target.value)}
                      disabled={isLocked}
                      className={`w-8 text-center text-xs text-slate-800 rounded font-bold h-6 focus:outline-none focus:border-emerald-600 font-mono transition ${
                        isLocked 
                          ? 'bg-slate-50 border border-slate-150 cursor-not-allowed text-slate-400' 
                          : 'bg-white border border-slate-200'
                      }`}
                      placeholder="-"
                    />
                    <button 
                      type="button"
                      onClick={() => !isLocked && incrementBet(name, 'scoreB')}
                      disabled={isLocked}
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition ${
                        isLocked 
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 cursor-pointer'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-650 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 rounded-lg font-extrabold transition duration-200 cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          {editingMatch ? 'Guardar Cambios' : 'Registrar Partido'}
        </button>
      </div>
    </form>
  );
};
