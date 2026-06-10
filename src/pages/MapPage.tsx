import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, ChevronRight, Coins, Clock, Bird, BookOpen } from 'lucide-react';
import { OBSERVATION_SLOTS, PLACEMENT_COST, UPGRADE_COSTS } from '@/data/observation';

export default function MapPage() {
  const {
    round, maxRounds, budget, score, observationPoints, unlockedBirds,
    placeObservationPoint, upgradeObservationPoint, nextRound, goToPhase,
  } = useGameStore();
  const navigate = useNavigate();

  const placedCount = observationPoints.filter(p => p.placed).length;
  const canNextRound = placedCount > 0;

  const handlePlace = (id: string) => {
    placeObservationPoint(id);
  };

  const handleUpgrade = (id: string) => {
    upgradeObservationPoint(id);
  };

  const handleNextRound = () => {
    nextRound();
    navigate('/event');
  };

  return (
    <div className="min-h-screen bg-wetland-deep wetland-bg paper-texture flex flex-col">
      <div className="sticky top-0 z-20 bg-wetland-deep/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-white text-sm">
            <span className="flex items-center gap-1 bg-wetland-dark/60 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-wetland-sky" />
              回合 {round}/{maxRounds}
            </span>
            <span className="flex items-center gap-1 bg-wetland-dark/60 px-3 py-1.5 rounded-lg">
              <Coins className="w-4 h-4 text-wetland-sand" />
              预算 {budget}
            </span>
            <span className="flex items-center gap-1 bg-wetland-dark/60 px-3 py-1.5 rounded-lg">
              ⭐ {score}分
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { goToPhase('codex'); navigate('/codex'); }}
              className="text-white hover:text-wetland-sand transition-colors text-sm flex items-center gap-1 font-medium"
            >
              <BookOpen className="w-4 h-4" />
              图鉴({unlockedBirds.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl text-white font-bold mb-1">湿地观测站</h2>
          <p className="text-white text-sm font-medium">布置和升级观测点以获取更完整的鸟类线索</p>
        </div>

        <div className="relative card-game p-4 mb-6">
          <div className="relative w-full" style={{ paddingBottom: '56%' }}>
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2a6a6a" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1a4a4a" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="100" height="100" fill="url(#water)" />
                <ellipse cx="35" cy="40" rx="20" ry="12" fill="#3a8a8a" opacity="0.3" />
                <ellipse cx="65" cy="65" rx="15" ry="10" fill="#3a8a8a" opacity="0.25" />
                <path d="M0 70 Q25 65 50 72 Q75 78 100 70 L100 100 L0 100 Z" fill="#4a7a3a" opacity="0.3" />
                <path d="M0 80 Q30 75 60 82 Q85 88 100 80 L100 100 L0 100 Z" fill="#5a8a4a" opacity="0.25" />
                {observationPoints.map(p => {
                  const slot = OBSERVATION_SLOTS.find(s => s.id === p.id)!;
                  if (!p.placed) {
                    return (
                      <g key={p.id} className="cursor-pointer observation-point" onClick={() => handlePlace(p.id)}>
                        <circle cx={slot.position.x} cy={slot.position.y} r="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="2 1" />
                        <text x={slot.position.x} y={slot.position.y + 0.5} textAnchor="middle" fill="white" fontSize="3" opacity="0.6">+</text>
                      </g>
                    );
                  }
                  const colors = ['#6bb5c9', '#c9b458', '#e07a3a'];
                  return (
                    <g key={p.id} className="cursor-pointer observation-point" onClick={() => handleUpgrade(p.id)}>
                      <circle cx={slot.position.x} cy={slot.position.y} r="5" fill={colors[p.level - 1]} opacity="0.8" />
                      <circle cx={slot.position.x} cy={slot.position.y} r="5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                      <text x={slot.position.x} y={slot.position.y + 1.5} textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">
                        {p.level}
                      </text>
                      {p.level < 3 && (
                        <circle cx={slot.position.x} cy={slot.position.y} r="7" fill="none" stroke={colors[p.level]} strokeWidth="0.3" opacity="0.4" />
                      )}
                    </g>
                  );
                })}
                <text x="20" y="95" fill="white" opacity="0.2" fontSize="4" fontFamily="serif">湿地保护区</text>
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {observationPoints.map(p => {
            const slot = OBSERVATION_SLOTS.find(s => s.id === p.id)!;
            const upgradeCost = p.placed && p.level < 3 ? UPGRADE_COSTS[p.level] : null;
            return (
              <div key={p.id} className={`card-game p-3 flex items-center justify-between ${p.placed ? 'border-wetland-sky/30' : 'border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.placed ? 'bg-wetland-sky/25 text-wetland-sky' : 'bg-white/15 text-white/65'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${p.placed ? 'text-white' : 'text-white/80'}`}>{slot.name}</p>
                    <p className="text-xs text-white/75">
                      {p.placed ? `等级 ${p.level} · 线索完整度 ${p.level === 1 ? '50%' : p.level === 2 ? '75%' : '100%'}` : '未布置'}
                    </p>
                  </div>
                </div>
                <div>
                  {!p.placed && (
                    <button
                      onClick={() => handlePlace(p.id)}
                      disabled={budget < PLACEMENT_COST}
                      className="text-xs px-3 py-1.5 rounded-md bg-wetland-sand/25 text-wetland-sand hover:bg-wetland-sand/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
                    >
                      布置 ({PLACEMENT_COST})
                    </button>
                  )}
                  {p.placed && upgradeCost && (
                    <button
                      onClick={() => handleUpgrade(p.id)}
                      disabled={budget < upgradeCost}
                      className="text-xs px-3 py-1.5 rounded-md bg-wetland-reed/25 text-wetland-reed hover:bg-wetland-reed/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold"
                    >
                      <TrendingUp className="w-3 h-3" />
                      升级 ({upgradeCost})
                    </button>
                  )}
                  {p.placed && !upgradeCost && (
                    <span className="text-xs text-wetland-sand px-2 py-1 font-semibold">已满级 ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={handleNextRound}
            disabled={!canNextRound}
            className="btn-game bg-wetland-dusk text-white hover:bg-wetland-dusk/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
            {round === 1 ? '开始观测' : `第 ${round} 回合`}
            <Bird className="w-4 h-4 ml-1" />
          </button>
        </div>

        {!canNextRound && (
          <p className="text-center text-wetland-dusk text-sm mt-3 font-semibold">⚠️ 请先布置至少一个观测点</p>
        )}
      </div>
    </div>
  );
}
