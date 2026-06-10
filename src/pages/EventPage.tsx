import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { Eye, Send, ArrowRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { BAND_COLOR_HEX } from '@/data/birds';
import { BIRDS } from '@/data/birds';
import { OBSERVER_COST } from '@/data/observation';

type EventStep = 'observe' | 'identify' | 'migrate' | 'result';

export default function EventPage() {
  const {
    currentEvents, currentEventIndex, budget, round, score,
    sendObserver, answerBird, guessMigration, nextEvent,
  } = useGameStore();
  const navigate = useNavigate();

  const event = currentEvents[currentEventIndex];
  const [step, setStep] = useState<EventStep>('observe');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; scoreChange: number; birdName: string } | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<{ correct: boolean; scoreChange: number } | null>(null);
  const [observerSent, setObserverSent] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen wetland-bg flex items-center justify-center">
        <div className="text-white/80 text-center">
          <p className="mb-4 text-lg">没有待处理的事件</p>
          <button onClick={() => navigate('/map')} className="btn-game bg-wetland-mid text-white">
            返回地图
          </button>
        </div>
      </div>
    );
  }

  const bird = BIRDS.find(b => b.id === event.birdId);

  const handleSendObserver = () => {
    if (budget >= OBSERVER_COST) {
      sendObserver();
      setObserverSent(true);
    }
  };

  const handleIdentify = () => {
    if (!selectedAnswer) return;
    const result = answerBird(selectedAnswer);
    setAnswerResult(result);
    setStep('result');
  };

  const handleGuessMigration = () => {
    if (!selectedRoute) return;
    const result = guessMigration(selectedRoute);
    setMigrationResult(result);
    setStep('migrate');
  };

  const handleSkipMigration = () => {
    setMigrationResult({ correct: false, scoreChange: 0 });
    setStep('migrate');
  };

  const handleNext = () => {
    const hasMore = nextEvent();
    if (!hasMore) {
      navigate('/map');
    } else {
      setStep('observe');
      setSelectedAnswer(null);
      setAnswerResult(null);
      setSelectedRoute(null);
      setMigrationResult(null);
      setObserverSent(false);
    }
  };

  return (
    <div className="min-h-screen bg-wetland-deep wetland-bg paper-texture flex flex-col">
      <div className="sticky top-0 z-20 bg-wetland-deep/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-white text-sm flex items-center gap-2">
            🔭 第 {round} 回合观测
          </span>
          <span className="text-white/90 text-sm flex items-center gap-1 font-medium">
            💰 {budget} · ⭐ {score}
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6">
        {step === 'observe' && (
          <div className="animate-fadeInUp">
            <div className="card-game p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-wetland-sky" />
                <h3 className="font-display text-lg text-white font-bold">观测事件</h3>
              </div>
              <p className="text-white text-sm mb-4">
                发现一只未知鸟类！观察线索后选择是否派出观测员获取更完整信息。
              </p>

              <div className="mb-4">
                <h4 className="text-wetland-sand text-sm font-semibold mb-2">鸟类线索</h4>
                <div className="space-y-2">
                  {event.clues.map((clue, i) => (
                    <div key={i} className="bg-wetland-dark/70 rounded-lg px-3 py-2 text-white text-sm">
                      {clue}
                    </div>
                  ))}
                  {event.interferenceClues.map((clue, i) => (
                    <div key={`intf-${i}`} className="bg-wetland-dusk/15 border border-wetland-dusk/30 rounded-lg px-3 py-2 text-wetland-dusk text-sm flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {clue}
                      <span className="text-xs text-wetland-dusk/70">（可疑线索）</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="text-wetland-sand text-sm font-semibold mb-3">可见环志</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  {event.visibleBands.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="band-ring"
                        style={{ backgroundColor: BAND_COLOR_HEX[color] }}
                      >
                        {color}
                      </div>
                    </div>
                  ))}
                  {event.hiddenBands.map((_, i) => (
                    <div key={`hidden-${i}`} className="flex flex-col items-center gap-1">
                      <div className="band-ring bg-white/10 border-dashed">
                        ?
                      </div>
                    </div>
                  ))}
                </div>
                {event.hiddenBands.length > 0 && (
                  <p className="text-white/60 text-xs mt-3">
                    还有 {event.hiddenBands.length} 个环志颜色未观测到
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!observerSent && event.hiddenBands.length > 0 && (
                  <button
                    onClick={handleSendObserver}
                    disabled={budget < OBSERVER_COST}
                    className="btn-game bg-wetland-sky text-wetland-deep hover:bg-wetland-sky/80 disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    派出观测员 ({OBSERVER_COST}预算)
                  </button>
                )}
                {observerSent && (
                  <span className="text-wetland-sky text-sm flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    已派出观测员，线索已补充
                  </span>
                )}
                <button
                  onClick={() => setStep('identify')}
                  className="btn-game bg-wetland-dusk text-white hover:bg-wetland-dusk/80 text-sm flex items-center gap-2"
                >
                  开始识别
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'identify' && (
          <div className="animate-fadeInUp">
            <div className="card-game p-5 mb-4">
              <h3 className="font-display text-lg text-white font-bold mb-1">识别鸟类</h3>
              <p className="text-white/90 text-sm mb-4">根据线索和环志颜色，选择你认为正确的鸟类</p>

              <div className="mb-4">
                <p className="text-wetland-sand text-xs mb-3 font-semibold">环志组合参考</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {event.visibleBands.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="band-ring" style={{ backgroundColor: BAND_COLOR_HEX[color] }}>
                        {color}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.options.map((option, i) => {
                  const optBird = BIRDS.find(b => b.name === option);
                  const isSelected = selectedAnswer === option;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedAnswer(option)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-wetland-sand bg-wetland-sand/15 shadow-lg'
                          : 'border-white/25 bg-wetland-dark/60 hover:border-white/40 hover:bg-wetland-dark/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{optBird?.emoji || '🐦'}</span>
                        <div>
                          <p className={`text-sm font-semibold ${isSelected ? 'text-wetland-sand' : 'text-white'}`}>
                            {option}
                          </p>
                          {optBird && (
                            <p className="text-xs text-white/70">{optBird.scientificName}</p>
                          )}
                        </div>
                      </div>
                      {optBird && (
                        <div className="mt-2 flex items-center gap-2">
                          {optBird.bandColors.map((c, ci) => (
                            <div
                              key={ci}
                              className="band-ring-sm"
                              style={{ backgroundColor: BAND_COLOR_HEX[c] }}
                              title={c}
                            >
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleIdentify}
                  disabled={!selectedAnswer}
                  className="btn-game bg-wetland-sand text-wetland-deep hover:bg-wetland-reed disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  确认识别
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && answerResult && (
          <div className="animate-fadeInUp">
            <div className={`card-game p-6 mb-4 ${answerResult.correct ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <div className="text-center mb-4">
                {answerResult.correct ? (
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                )}
                <h3 className="font-display text-2xl text-white font-bold">
                  {answerResult.correct ? '识别正确！' : '识别错误'}
                </h3>
                <p className={`text-lg font-semibold mt-1 ${answerResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {answerResult.scoreChange > 0 ? '+' : ''}{answerResult.scoreChange} 分
                </p>
              </div>

              {bird && (
                <div className="bg-wetland-dark/70 rounded-lg p-4 text-center">
                  <span className="text-4xl">{bird.emoji}</span>
                  <p className="text-white font-bold mt-2">{bird.name}</p>
                  <p className="text-white/75 text-sm italic">{bird.scientificName}</p>
                  <p className="text-white text-sm mt-2">{bird.description}</p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <span className="text-white/80 text-xs">环志：</span>
                    {bird.bandColors.map((c, i) => (
                      <div key={i} className="band-ring-sm" style={{ backgroundColor: BAND_COLOR_HEX[c] }}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-wetland-sand text-sm font-semibold mb-2">推测迁徙路线（可选）</h4>
                <p className="text-white/85 text-xs mb-3">
                  根据环志颜色含义推测这只鸟的迁徙路线，正确可额外获得 +15 分
                </p>
                <div className="space-y-2 mb-3">
                  {useGameStore.getState().migrationOptions.map((route, i) => {
                    const isSelected = selectedRoute === route;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedRoute(route)}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-sm font-medium ${
                          isSelected
                            ? 'border-wetland-sand bg-wetland-sand/15 text-wetland-sand'
                            : 'border-white/25 bg-wetland-dark/60 text-white/90 hover:border-white/40 hover:bg-wetland-dark/80'
                        }`}
                      >
                        {route}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleSkipMigration}
                    className="text-white/60 hover:text-white/80 text-sm transition-colors"
                  >
                    跳过
                  </button>
                  <button
                    onClick={handleGuessMigration}
                    disabled={!selectedRoute}
                    className="btn-game bg-wetland-mid text-white hover:bg-wetland-light disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    提交推测
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'migrate' && migrationResult && (
          <div className="animate-fadeInUp">
            <div className={`card-game p-6 mb-4 ${migrationResult.correct ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
              <div className="text-center">
                {migrationResult.correct ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <h3 className="font-display text-xl text-white font-bold mb-1">路线推测正确！</h3>
                    <p className="text-green-400 text-lg font-semibold">+{migrationResult.scoreChange} 分</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-display text-xl text-white font-bold mb-1">路线推测未命中</h3>
                    {bird && (
                      <p className="text-white/90 text-sm">正确路线：{bird.migrationRoute}</p>
                    )}
                    <p className="text-white/75 text-sm mt-1">（{bird?.migrationStart} → {bird?.migrationEnd}）</p>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleNext}
                  className="btn-game bg-wetland-sand text-wetland-deep hover:bg-wetland-reed text-sm flex items-center gap-2"
                >
                  继续观测
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
