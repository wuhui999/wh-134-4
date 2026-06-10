import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, BookOpen } from 'lucide-react';
import { BIRDS, BAND_COLOR_HEX, BAND_COLOR_MEANING, BandColor } from '@/data/birds';

export default function CodexPage() {
  const { unlockedBirds } = useGameStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-wetland-deep wetland-bg paper-texture flex flex-col">
      <div className="sticky top-0 z-20 bg-wetland-deep/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white hover:text-wetland-sand transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BookOpen className="w-5 h-5 text-wetland-sand" />
          <h2 className="font-display text-lg text-white font-bold">鸟类图鉴</h2>
          <span className="text-white/80 text-sm ml-auto font-medium">{unlockedBirds.length}/{BIRDS.length} 已解锁</span>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {BIRDS.map(bird => {
            const isUnlocked = unlockedBirds.includes(bird.id);
            return (
              <div
                key={bird.id}
                className={`card-game p-5 transition-all duration-300 ${
                  isUnlocked ? 'border-wetland-sky/20' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl ${isUnlocked ? '' : 'grayscale'}`}>
                    {isUnlocked ? bird.emoji : '❓'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-display text-lg font-bold ${isUnlocked ? 'text-white' : 'text-white/80'}`}>
                        {isUnlocked ? bird.name : '???'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bird.difficulty === 1 ? 'bg-green-500/20 text-green-400' :
                        bird.difficulty === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {'★'.repeat(bird.difficulty)}
                      </span>
                    </div>
                    {isUnlocked ? (
                      <>
                        <p className="text-white/70 text-xs italic mb-1 font-medium">{bird.scientificName}</p>
                        <p className="text-white/90 text-sm mb-2">{bird.description}</p>
                        <div className="space-y-1 text-xs">
                          <p className="text-white/80">🏠 {bird.habitat}</p>
                          <p className="text-white/80">🎯 {bird.behavior}</p>
                          <p className="text-white/80">📏 {bird.size}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-white/75 text-xs font-medium">环志：</span>
                          {bird.bandColors.map((c, i) => (
                            <div key={i} className="band-ring-sm" style={{ backgroundColor: BAND_COLOR_HEX[c] }}>
                              {c}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-wetland-sky">
                          🗺️ {bird.migrationRoute}（{bird.migrationStart} → {bird.migrationEnd}）
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <Lock className="w-4 h-4 text-white/65" />
                        <p className="text-white/65 text-sm">识别此鸟种后解锁</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-game p-5 mb-6">
          <h3 className="font-display text-lg text-white font-bold mb-3">🔗 环志颜色编码规则</h3>
          <p className="text-white/75 text-sm mb-4">
            每种环志颜色代表不同的含义，通过颜色组合可以推测鸟类的迁徙路线和栖息特征。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(BAND_COLOR_MEANING) as [BandColor, string][]).map(([color, meaning]) => (
              <div key={color} className="flex items-center gap-3 bg-wetland-dark/40 rounded-lg p-3">
                <div
                  className="band-ring-sm flex-shrink-0"
                  style={{ backgroundColor: BAND_COLOR_HEX[color] }}
                >
                  {color}
                </div>
                <span className="text-white/80 text-sm">{meaning}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-wetland-dark/30 rounded-lg p-3">
            <p className="text-white/65 text-xs">
              💡 提示：环志由2-3个颜色环组成。例如「红+蓝+白」= 东方迁徙路线 + 北方繁殖地 + 候鸟标记，
              表示这是一只在北方繁殖、沿东方路线迁徙的候鸟。
            </p>
          </div>
        </div>

        <div className="card-game p-5">
          <h3 className="font-display text-lg text-white font-bold mb-3">📋 观测站等级说明</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-wetland-dark/60 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-wetland-sky/25 flex items-center justify-center text-wetland-sky font-bold text-sm">1</div>
              <div>
                <p className="text-white text-sm font-semibold">基础观测点</p>
                <p className="text-white/75 text-xs">线索完整度 50%，可见部分环志颜色</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-wetland-dark/60 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-wetland-reed/25 flex items-center justify-center text-wetland-reed font-bold text-sm">2</div>
              <div>
                <p className="text-white text-sm font-semibold">进阶观测点</p>
                <p className="text-white/75 text-xs">线索完整度 75%，可见更多环志颜色</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-wetland-dark/60 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-wetland-dusk/25 flex items-center justify-center text-wetland-dusk font-bold text-sm">3</div>
              <div>
                <p className="text-white text-sm font-semibold">高级观测点</p>
                <p className="text-white/75 text-xs">线索完整度 100%，可见全部环志颜色</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
