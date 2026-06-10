import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { Bird, Map, BookOpen, Play, RotateCcw } from 'lucide-react';

export default function StartPage() {
  const { newGame, continueGame, hasSave } = useGameStore();
  const navigate = useNavigate();

  const handleNewGame = () => {
    newGame();
    navigate('/map');
  };

  const handleContinue = () => {
    if (continueGame()) {
      navigate('/map');
    }
  };

  const handleCodex = () => {
    navigate('/codex');
  };

  const saveExists = hasSave();

  return (
    <div className="min-h-screen wetland-bg paper-texture flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {['🦅', '🦆', '🦢', '🪶', '🐦'].map((bird, i) => (
          <span
            key={i}
            className="absolute text-3xl opacity-20 animate-drift"
            style={{
              top: `${15 + i * 18}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${12 + i * 2}s`,
            }}
          >
            {bird}
          </span>
        ))}
      </div>

      <div className="relative z-10 text-center animate-fadeInUp">
        <div className="mb-4">
          <Bird className="w-16 h-16 text-wetland-sand mx-auto mb-4" />
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-3 tracking-tight">
          湿地鸟类环志回收
        </h1>
        <p className="font-display text-xl md:text-2xl text-wetland-sky mb-2 italic">
          Wetland Bird Banding Recovery
        </p>
        <p className="text-white/80 text-sm max-w-md mx-auto mb-10">
          布置观测点，识别环志颜色组合，推测迁徙路线——在有限预算内成为最优秀的湿地鸟类观测站
        </p>

        <div className="flex flex-col gap-4 items-center">
          <button onClick={handleNewGame} className="btn-game bg-wetland-sand text-wetland-deep hover:bg-wetland-reed flex items-center gap-2 min-w-[220px] justify-center">
            <Play className="w-5 h-5" />
            新游戏
          </button>

          {saveExists && (
            <button onClick={handleContinue} className="btn-game bg-wetland-mid text-white hover:bg-wetland-light flex items-center gap-2 min-w-[220px] justify-center">
              <RotateCcw className="w-5 h-5" />
              继续游戏
            </button>
          )}

          <button onClick={handleCodex} className="btn-game bg-transparent border-2 border-wetland-sky text-wetland-sky hover:bg-wetland-sky/10 flex items-center gap-2 min-w-[220px] justify-center">
            <BookOpen className="w-5 h-5" />
            图鉴
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-white/80 text-sm font-medium">
          <span className="flex items-center gap-1"><Map className="w-4 h-4" /> 策略布置</span>
          <span className="flex items-center gap-1">🎯 环志识别</span>
          <span className="flex items-center gap-1">🌍 路线推测</span>
        </div>
      </div>
    </div>
  );
}
