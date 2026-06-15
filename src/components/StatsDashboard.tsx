import React, { useState, useEffect } from 'react';
import { ParticipantStats, PARTICIPANTS, ParticipantName } from '../types';
import { motion } from 'motion/react';
import { Award, TrendingUp, Sparkles, AlertCircle, ShoppingBag, Vote } from 'lucide-react';
import { db, isFirebaseActive, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

interface StatsDashboardProps {
  stats: ParticipantStats[];
  totalMatches: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, totalMatches }) => {
  // Participant selected to vote (starts with empty string)
  const [participantSelected, setParticipantSelected] = useState<ParticipantName | ''>('');

  // Local state to store votes mapping (participant -> food option)
  const [votesMap, setVotesMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('porra_food_votes_map_v2');
    return saved ? JSON.parse(saved) : {};
  });

  // Listen to Firebase collection for food votes in real-time
  useEffect(() => {
    if (isFirebaseActive && db) {
      const unsub = onSnapshot(
        collection(db, 'food_votes'),
        (snapshot) => {
          const map: Record<string, string> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.participant && data.food) {
              map[data.participant] = data.food;
            }
          });
          setVotesMap(map);
          localStorage.setItem('porra_food_votes_map_v2', JSON.stringify(map));
        },
        (error) => {
          console.error("Error fetching food votes from Firebase:", error);
        }
      );
      return () => unsub();
    }
  }, []);

  const hasVoted = participantSelected ? (votesMap[participantSelected] || null) : null;

  const handleVote = async (food: string) => {
    if (!participantSelected) {
      alert('Por favor, selecciona quién eres antes de votar.');
      return;
    }

    const participant = participantSelected;

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'food_votes', participant), {
          participant,
          food,
          votedAt: Date.now()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `food_votes/${participant}`);
      }
    } else {
      // Fallback: LocalStorage
      const nextMap = { ...votesMap, [participant]: food };
      setVotesMap(nextMap);
      localStorage.setItem('porra_food_votes_map_v2', JSON.stringify(nextMap));
    }
  };

  // Dynamically compute the foodVotes counts based on the votesMap
  const foodVotes: Record<string, number> = {
    'Burger King 🍔': 0,
    'McDonalds 🍟': 0,
    'Telepizza 🍕': 0
  };

  Object.values(votesMap).forEach((food) => {
    const foodStr = food as string;
    if (foodVotes[foodStr] !== undefined) {
      foodVotes[foodStr]++;
    }
  });

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

        {/* Participant identification for food voting */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 bg-white border border-slate-200/60 p-3 rounded-xl shadow-xs" id="voter-selector-container">
          <label htmlFor="participant-select-food" className="text-xs font-bold text-slate-700 shrink-0">
            ¿Quién eres? Selecciona tu nombre:
          </label>
          <select
            id="participant-select-food"
            value={participantSelected}
            onChange={(e) => setParticipantSelected(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-semibold text-slate-850 cursor-pointer"
          >
            <option value="">-- Elige quién eres --</option>
            {PARTICIPANTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {Object.entries(foodVotes).map(([food, votes]) => {
            const votesNum = votes as number;
            const pct = totalVotes > 0 ? Math.round((votesNum / totalVotes) * 100) : 0;
            
            // Extract participants who voted for this option
            const votersForThisFood = Object.entries(votesMap)
              .filter(([_, votedFood]) => votedFood === food)
              .map(([voterName]) => voterName);

            const isCurrentUsersChoice = hasVoted === food;

            return (
              <div key={food} className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-150/80 shadow-xs" id={`voting-option-card-${food}`}>
                <div className="flex justify-between items-center text-xs">
                  <button 
                    type="button"
                    disabled={!participantSelected || isCurrentUsersChoice}
                    onClick={() => handleVote(food)}
                    className={`flex items-center gap-1 font-extrabold text-left transition-colors duration-250 ${
                      !participantSelected
                        ? 'text-slate-400 cursor-not-allowed opacity-60'
                        : isCurrentUsersChoice 
                        ? 'text-emerald-700 cursor-default' 
                        : 'text-slate-700 hover:text-emerald-600 cursor-pointer'
                    }`}
                    title={!participantSelected ? "Selecciona quién eres para votar" : isCurrentUsersChoice ? "Ya has elegido esta opción" : "Votar o cambiar mi voto a esta opción"}
                  >
                    <span>{food}</span>
                    {isCurrentUsersChoice && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold ml-1.5">
                        Mi opción
                      </span>
                    )}
                  </button>
                  <span className="text-slate-550 text-[11px] font-mono font-bold">
                    {votesNum} {votesNum === 1 ? 'voto' : 'votos'} ({pct}%)
                  </span>
                </div>

                <div className="relative w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-full bg-emerald-600 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" 
                  />
                </div>

                {/* Voter participant badges */}
                {votersForThisFood.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-semibold mr-1 self-center">Elegido por:</span>
                    {votersForThisFood.map(v => (
                      <span 
                        key={v} 
                        className={`text-[9px] border px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                          participantSelected === v 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {participantSelected ? (
          <p className="text-[10px] text-slate-500 mt-3 text-center">
            {hasVoted 
              ? `✔ Tienes seleccionado para comer: ${hasVoted}. ¡Puedes cambiarlo cuando desees!`
              : "💡 Elige una de las opciones arriba para registrar tu voto oficial."}
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 mt-3 text-center italic font-medium">
            💡 Escoge tu nombre arriba para desbloquear los botones de votación en tiempo real.
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
