import { useState, useEffect } from 'react';
import { Match, ParticipantStats, PARTICIPANTS } from './types';
import { getInitialMatches, compileLeaderboard } from './utils/points';
import { db, isFirebaseActive, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Leaderboard } from './components/Leaderboard';
import { MatchList } from './components/MatchList';
import { MatchForm } from './components/MatchForm';
import { StatsDashboard } from './components/StatsDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Sparkles, 
  Compass, 
  Info, 
  Trophy, 
  Users, 
  BarChart3, 
  CloudLightning, 
  Database,
  Smartphone,
  Pizza,
  UtensilsCrossed,
  Settings,
  Lock,
  Unlock
} from 'lucide-react';

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard' | 'stats'>('matches');
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState('');

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setShowPinInput(false);
    } else {
      setShowPinInput(!showPinInput);
      setPinValue('');
      setPinError('');
    }
  };

  const handlePinSubmit = () => {
    if (pinValue === '1234') {
      setIsAdmin(true);
      setShowPinInput(false);
      setPinValue('');
      setPinError('');
    } else {
      setPinError('PIN incorrecto');
    }
  };

  // Hook up Database Listener (Firestore or LocalStorage fallback)
  useEffect(() => {
    if (isFirebaseActive && db) {
      const unsub = onSnapshot(
        collection(db, 'matches'),
        (snapshot) => {
          const list: Match[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Match);
          });
          setMatches(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'matches');
        }
      );
      return () => unsub();
    } else {
      // Fetch or seed LocalStorage
      const stored = localStorage.getItem('porra_mundial_matches');
      if (stored) {
        try {
          setMatches(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse matches from local storage:", e);
          const initial = getInitialMatches();
          setMatches(initial);
          localStorage.setItem('porra_mundial_matches', JSON.stringify(initial));
        }
      } else {
        const initial = getInitialMatches();
        setMatches(initial);
        localStorage.setItem('porra_mundial_matches', JSON.stringify(initial));
      }
    }
  }, []);

  // Compute stats based on current matches list
  const stats = compileLeaderboard(matches);
  const completedMatchesCount = matches.filter(m => m.isCompleted).length;

  const handleSaveMatch = async (matchData: Omit<Match, 'id' | 'createdAt'> & { id?: string }) => {
    const isEdit = !!matchData.id;
    const matchId = matchData.id || `match-${Date.now()}`;
    const createdAt = isEdit 
      ? (matches.find(m => m.id === matchId)?.createdAt || Date.now()) 
      : Date.now();

    const finalDoc: Match = {
      ...matchData,
      id: matchId,
      createdAt
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'matches', matchId), finalDoc);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `matches/${matchId}`);
      }
    } else {
      // Local storage update
      const nextMatches = isEdit
        ? matches.map(m => m.id === matchId ? finalDoc : m)
        : [finalDoc, ...matches];
      
      setMatches(nextMatches);
      localStorage.setItem('porra_mundial_matches', JSON.stringify(nextMatches));
    }

    setShowForm(false);
    setEditingMatch(null);
  };

  const handleDeleteMatch = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este partido?')) return;

    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, 'matches', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `matches/${id}`);
      }
    } else {
      const nextMatches = matches.filter((m) => m.id !== id);
      setMatches(nextMatches);
      localStorage.setItem('porra_mundial_matches', JSON.stringify(nextMatches));
    }
  };

  const handleEditInit = (match: Match) => {
    setEditingMatch(match);
    setShowForm(true);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white pb-20" id="main-applet-wrapper">
      
      {/* Visual Header Grid Panel */}
      <header className="relative bg-white border-b border-slate-200 overflow-hidden shadow-sm" id="world-cup-banner">
        {/* Discrete Admin Mode Button */}
        <button 
          onClick={handleAdminToggle}
          className={`absolute top-4 right-4 z-50 p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
            isAdmin 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 opacity-100 hover:bg-emerald-100' 
              : 'text-slate-400 opacity-40 hover:opacity-100 hover:text-slate-600'
          }`}
          title={isAdmin ? "Desactivar Modo Administrador" : "Activar Modo Administrador (Bypass de tiempo)"}
          id="admin-mode-trigger"
        >
          {isAdmin ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Settings className="w-3.5 h-3.5" />}
        </button>

        {showPinInput && (
          <div className="absolute top-12 right-4 z-50 bg-white border border-slate-200 rounded-xl p-3 shadow-lg flex flex-col gap-2 w-48">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">¿Contraseña Admin?</span>
            <div className="flex gap-1.5">
              <input
                type="password"
                placeholder="PIN"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePinSubmit();
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <button
                onClick={handlePinSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer transition"
              >
                OK
              </button>
            </div>
            {pinError && (
              <span className="text-[9px] text-rose-500 font-bold">{pinError}</span>
            )}
          </div>
        )}

        {/* Subtle decorative overlays */}
        <div className="absolute top-[-40%] left-[-10%] w-[60%] h-[120%] rounded-full bg-gradient-to-br from-emerald-500/5 via-teal-500/3 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40%] right-[-10%] w-[60%] h-[120%] rounded-full bg-gradient-to-tr from-blue-500/5 via-indigo-500/3 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Brand Titles */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                Mundial 2026
              </span>
              
              {/* Sync Badge */}
              <button 
                onClick={() => setShowSyncInfo(!showSyncInfo)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer transition ${
                  isFirebaseActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
                title="Click para ver info de sincronización"
              >
                {isFirebaseActive ? <Database className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                {isFirebaseActive ? 'Nube Sincronizada' : 'Modo Local (Tu Teléfono)'}
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              ⚽ Porra del Mundial 2026
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg leading-relaxed">
              La plataforma oficial de apuestas para <strong>Raúl, Paco Padre, David, Samuel, Héctor y PacBoy</strong>. No se admiten excusas: el último invita a Burger King, McDonalds o Telepizza.
            </p>
          </div>

          {/* Call to action & general scoreboard top */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {isAdmin && (
              <span className="text-[10px] bg-emerald-100 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded font-bold uppercase animate-pulse">
                Modo Admin Activo
              </span>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setEditingMatch(null);
                setShowForm(!showForm);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition duration-200 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              {showForm ? 'Cerrar Formulario' : 'Añadir Partido'}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Sync banner detail overlay */}
      <AnimatePresence>
        {showSyncInfo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-b border-slate-200 overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-600 flex items-start gap-4">
              <Info className="text-emerald-600 w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>
                  <strong>¿Cómo funciona el guardado?</strong> Actualmente estás en {isFirebaseActive ? 'modo de sincronización en la Nube (Firebase)' : 'modo Local (almacenamiento de tu navegador)'}.
                </p>
                <p>
                  {isFirebaseActive 
                    ? 'Cualquier participante del grupo que acceda a esta URL verá las mismas predicciones y partidos al instante.' 
                    : 'Los datos introducidos se quedan guardados en tu teléfono/computador. Para compartir la base de datos de manera coordinada con tus amigos, puedes activar la conexión permanente de Firebase aceptando el asistente en pantalla.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* Interactive MatchForm display */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-8"
              id="match-form-root-container"
            >
              <MatchForm 
                onSave={handleSaveMatch}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMatch(null);
                }}
                editingMatch={editingMatch}
                isAdmin={isAdmin}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2" id="navbar-tabs-trigger">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'matches'
                ? 'text-emerald-600 border-emerald-600'
                : 'text-slate-500 border-transparent hover:text-slate-850'
            }`}
          >
            <UtensilsCrossed className={`w-4 h-4 ${activeTab === 'matches' ? 'text-emerald-600' : 'text-slate-400'}`} />
            Porras de Partidos
          </button>
          
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'text-emerald-600 border-emerald-600'
                : 'text-slate-500 border-transparent hover:text-slate-850'
            }`}
          >
            <Trophy className={`w-4 h-4 ${activeTab === 'leaderboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
            Clasificación Oficial
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'stats'
                ? 'text-emerald-600 border-emerald-600'
                : 'text-slate-500 border-transparent hover:text-slate-850'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'stats' ? 'text-emerald-600' : 'text-slate-400'}`} />
            Estadísticas y Premios
          </button>
        </div>

        {/* View Switch */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Primary Panel (Responsive) */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'matches' && (
              <div className="space-y-4" id="view-matches-content">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-850">Todos los Pronósticos</h3>
                    <p className="text-xs text-slate-500">Verifica, introduce resultados reales y revisa los puntos ganados.</p>
                  </div>
                  
                  <span className="text-[11px] text-slate-400 shrink-0">
                    Sincronizados: <strong className="text-slate-650"> {matches.length} partidos</strong>
                  </span>
                </div>
                
                <MatchList 
                  matches={matches}
                  onEdit={handleEditInit}
                  onDelete={handleDeleteMatch}
                />
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div id="view-leaderboard-content" className="lg:hidden">
                <Leaderboard stats={stats} totalMatchesPlayed={completedMatchesCount} />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4" id="view-stats-content">
                <StatsDashboard stats={stats} totalMatches={completedMatchesCount} />
              </div>
            )}

          </div>

          {/* Secondary Panel: Keep persistent Dark Sidebar layout next to the main components */}
          <div className="hidden lg:block space-y-6 lg:col-span-1" id="desktop-sidebar-leaderboard">
            
            {/* Display Leaderboard persistently on desktop */}
            <Leaderboard stats={stats} totalMatchesPlayed={completedMatchesCount} />
            
            {/* Quick reminder box */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-slate-800">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                <Pizza className="text-emerald-600 w-3.5 h-3.5" />
                Botín Oficial
              </h4>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                El comensal estrella del mundial de Raúl, Paco Padre, David, Samuel, Héctor y PacBoy recibirá su invitación gratis a comer en Burger King, McDonalds o Telepizza sufragada equitativamente por los demás.
              </p>
              <div className="mt-3 flex gap-2 justify-around text-lg bg-slate-50 border border-slate-100 p-2 rounded-lg">
                <span title="Burger King">🍔</span>
                <span title="McDonalds">🍟</span>
                <span title="Telepizza">🍕</span>
              </div>
            </div>

          </div>

          {/* Helper for small screens */}
          {activeTab !== 'leaderboard' && (
            <div className="lg:hidden mt-8 border-t border-slate-200 pt-6" id="mobile-bottom-leaderboard">
              <Leaderboard stats={stats} totalMatchesPlayed={completedMatchesCount} />
            </div>
          )}

        </div>

      </main>

      {/* Footer credits and information */}
      <footer className="max-w-6xl mx-auto px-4 mt-20 text-center text-xs text-slate-400 border-t border-slate-200 pt-6" id="applet-footer">
        <p>⚽ Mundial 2026 - Raúl, Paco Padre, David, Samuel, Héctor y PacBoy Betting Pool</p>
        <p className="mt-1 text-[10px]">
          Desarrollado en una sesión de Google AI Studio con almacenamiento {isFirebaseActive ? 'en la Nube (Firestore)' : 'local seguro'}.
        </p>
      </footer>

    </div>
  );
}
