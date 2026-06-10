import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Route, RotateCcw, BookOpen } from 'lucide-react';
import { BIRDS } from '@/data/birds';

export default function ResultPage() {
  const { score, eventHistory, budget, unlockedBirds, newGame } = useGameStore();
  const navigate = useNavigate();

  const totalEvents = eventHistory.length;
  const correctAnswers = eventHistory.filter(e => e.correct).length;
  const correctRoutes = eventHistory.filter(e => e.routeCorrect).length;
  const routeGuesses = eventHistory.filter(e => e.routeGuessed).length;
  const accuracy = totalEvents > 0 ? Math.round((correctAnswers / totalEvents) * 100) : 0;
  const routeAccuracy = routeGuesses > 0 ? Math.round((correctRoutes / routeGuesses) * 100) : 0;
  const budgetBonus = Math.floor(budget / 10) * 2;
  const totalScore = score + budgetBonus;

  const getGrade = () => {
    if (totalScore >= 150) return { grade: 'S', color: 'text-wetland-sand', label: '传奇观测家' };
    if (totalScore >= 120) return { grade: 'A', color: 'text-green-400', label: '资深观测家' };
    if (totalScore >= 80) return { grade: 'B', color: 'text-wetland-sky', label: '熟练观测家' };
    if (totalScore >= 50) return { grade: 'C', color: 'text-wetland-reed', label: '初级观测家' };
    return { grade: 'D', color: 'text-white/70', label: '实习观测家' };
  };

  const gradeInfo = getGrade();

  const handleNewGame = () => {
    newGame();
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-wetland-deep wetland-bg paper-texture flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6 py-8">
        <div className="text-center mb-8 animate-fadeInUp">
          <Trophy className="w-16 h-16 text-wetland-sand mx-auto mb-4" />
          <h1 className="font-display text-4xl text-white font-bold mb-1">观测报告</h1>
          <p className="text-white font-medium">湿地鸟类环志回收任务完成</p>
        </div>

        <div className="card-game p-6 mb-6 text-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className={`font-display text-7xl font-bold ${gradeInfo.color} mb-2`}>
            {gradeInfo.grade}
          </div>
          <p className="text-white font-semibold text-lg mb-1">{gradeInfo.label}</p>
          <div className="mt-4">
            <span className="font-display text-4xl font-bold text-wetland-sand">{totalScore}</span>
            <span className="text-white/80 text-lg ml-1 font-medium">分</span>
          </div>
          {budgetBonus > 0 && (
            <p className="text-wetland-sky text-sm mt-1 font-medium">
              含预算奖励 +{budgetBonus} 分（剩余 {budget} 预算）
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="card-game p-4 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{accuracy}%</p>
            <p className="text-white/80 text-xs font-medium">识别准确率</p>
            <p className="text-white/65 text-xs font-medium">{correctAnswers}/{totalEvents}</p>
          </div>
          <div className="card-game p-4 text-center">
            <Route className="w-6 h-6 text-wetland-sky mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{routeAccuracy}%</p>
            <p className="text-white/80 text-xs font-medium">路线推测率</p>
            <p className="text-white/65 text-xs font-medium">{correctRoutes}/{routeGuesses}</p>
          </div>
          <div className="card-game p-4 text-center">
            <BookOpen className="w-6 h-6 text-wetland-reed mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{unlockedBirds.length}</p>
            <p className="text-white/80 text-xs font-medium">解锁鸟种</p>
            <p className="text-white/65 text-xs font-medium">共{BIRDS.length}种</p>
          </div>
        </div>

        {eventHistory.length > 0 && (
          <div className="card-game p-5 mb-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-display text-lg text-white font-bold mb-3">📋 事件回顾</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {eventHistory.map((record, i) => {
                const bird = BIRDS.find(b => b.id === record.birdId);
                return (
                  <div key={i} className="flex items-center justify-between bg-wetland-dark/60 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{bird?.emoji || '🐦'}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{record.birdName}</p>
                        <p className="text-white/70 text-xs font-medium">
                          {record.routeGuessed && (record.routeCorrect ? '路线✓' : '路线✗')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${record.correct ? 'text-green-400' : 'text-red-400'}`}>
                        {record.correct ? '✓' : '✗'}
                      </span>
                      {record.routeScoreChange > 0 && (
                        <span className="text-wetland-sky text-xs ml-1">+{record.routeScoreChange}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={handleNewGame}
            className="btn-game bg-wetland-sand text-wetland-deep hover:bg-wetland-reed flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            再来一局
          </button>
          <button
            onClick={() => navigate('/codex')}
            className="btn-game bg-transparent border-2 border-wetland-sky text-wetland-sky hover:bg-wetland-sky/10 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            查看图鉴
          </button>
        </div>
      </div>
    </div>
  );
}
