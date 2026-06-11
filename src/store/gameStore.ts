import { create } from 'zustand';
import { BandColor, BIRDS } from '@/data/birds';
import {
  ObservationPoint,
  OBSERVATION_SLOTS,
  PLACEMENT_COST,
  UPGRADE_COSTS,
  OBSERVER_COST,
  MAX_ROUNDS,
  INITIAL_BUDGET,
} from '@/data/observation';
import { GameEvent, generateEvent, checkAnswer, checkMigrationGuess } from '@/data/events';

export interface EventRecord {
  eventId: string;
  birdId: string;
  birdName: string;
  playerAnswer: string;
  correct: boolean;
  scoreChange: number;
  observerSent: boolean;
  routeGuessed: boolean;
  routeCorrect: boolean;
  routeScoreChange: number;
}

export interface GameState {
  round: number;
  maxRounds: number;
  budget: number;
  score: number;
  budgetBonus: number;
  observationPoints: ObservationPoint[];
  unlockedBirds: string[];
  eventHistory: EventRecord[];
  phase: 'start' | 'map' | 'event' | 'codex' | 'result';
  currentEvents: GameEvent[];
  currentEventIndex: number;
  migrationOptions: string[];
  usedBirdIds: string[];

  newGame: () => void;
  continueGame: () => boolean;
  placeObservationPoint: (id: string) => boolean;
  upgradeObservationPoint: (id: string) => boolean;
  nextRound: () => void;
  sendObserver: () => boolean;
  answerBird: (answer: string) => { correct: boolean; scoreChange: number; birdName: string };
  guessMigration: (guess: string) => { correct: boolean; scoreChange: number };
  nextEvent: () => boolean;
  goToPhase: (phase: GameState['phase']) => void;
  saveGame: () => void;
  hasSave: () => boolean;
  clearSave: () => void;
  getMaxObservationLevel: () => number;
  endGame: () => void;
}

const SAVE_KEY = 'wetland_bird_game_save';

function getMigrationOptions(): string[] {
  const routes = BIRDS.map(b => b.migrationRoute);
  const unique = [...new Set(routes)];
  return unique.sort(() => Math.random() - 0.5).slice(0, 4);
}

function loadSave(): Partial<GameState> | null {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  round: 1,
  maxRounds: MAX_ROUNDS,
  budget: INITIAL_BUDGET,
  score: 0,
  budgetBonus: 0,
  observationPoints: OBSERVATION_SLOTS.map(s => ({ ...s })),
  unlockedBirds: [],
  eventHistory: [],
  phase: 'start',
  currentEvents: [],
  currentEventIndex: 0,
  migrationOptions: [],
  usedBirdIds: [],

  newGame: () => {
    localStorage.removeItem(SAVE_KEY);
    set({
      round: 1,
      maxRounds: MAX_ROUNDS,
      budget: INITIAL_BUDGET,
      score: 0,
      budgetBonus: 0,
      observationPoints: OBSERVATION_SLOTS.map(s => ({ ...s })),
      unlockedBirds: [],
      eventHistory: [],
      phase: 'map',
      currentEvents: [],
      currentEventIndex: 0,
      migrationOptions: [],
      usedBirdIds: [],
    });
  },

  continueGame: () => {
    const save = loadSave();
    if (!save) return false;
    set({
      round: save.round ?? 1,
      maxRounds: save.maxRounds ?? MAX_ROUNDS,
      budget: save.budget ?? INITIAL_BUDGET,
      score: save.score ?? 0,
      budgetBonus: save.budgetBonus ?? 0,
      observationPoints: save.observationPoints ?? OBSERVATION_SLOTS.map(s => ({ ...s })),
      unlockedBirds: save.unlockedBirds ?? [],
      eventHistory: save.eventHistory ?? [],
      phase: 'map',
      currentEvents: [],
      currentEventIndex: 0,
      migrationOptions: [],
      usedBirdIds: save.usedBirdIds ?? [],
    });
    return true;
  },

  placeObservationPoint: (id: string) => {
    const state = get();
    if (state.budget < PLACEMENT_COST) return false;
    const point = state.observationPoints.find(p => p.id === id);
    if (!point || point.placed) return false;
    set({
      budget: state.budget - PLACEMENT_COST,
      observationPoints: state.observationPoints.map(p =>
        p.id === id ? { ...p, placed: true, level: 1 as const } : p
      ),
    });
    get().saveGame();
    return true;
  },

  upgradeObservationPoint: (id: string) => {
    const state = get();
    const point = state.observationPoints.find(p => p.id === id);
    if (!point || !point.placed || point.level >= 3) return false;
    const cost = UPGRADE_COSTS[point.level];
    if (state.budget < cost) return false;
    set({
      budget: state.budget - cost,
      observationPoints: state.observationPoints.map(p =>
        p.id === id ? { ...p, level: (p.level + 1) as 1 | 2 | 3 } : p
      ),
    });
    get().saveGame();
    return true;
  },

  nextRound: () => {
    const state = get();
    if (state.round > state.maxRounds || state.budget <= 0) {
      get().endGame();
      return;
    }
    const placedPoints = state.observationPoints.filter(p => p.placed);
    if (placedPoints.length === 0) return;

    const maxLevel = get().getMaxObservationLevel();
    const event = generateEvent(state.round, maxLevel, false, state.usedBirdIds);
    const routes = getMigrationOptions();
    const bird = BIRDS.find(b => b.id === event.birdId);
    if (bird && !routes.includes(bird.migrationRoute)) {
      routes[0] = bird.migrationRoute;
    }

    set({
      currentEvents: [event],
      currentEventIndex: 0,
      phase: 'event',
      migrationOptions: routes.sort(() => Math.random() - 0.5),
    });
  },

  sendObserver: () => {
    const state = get();
    if (state.budget < OBSERVER_COST) return false;
    set({ budget: state.budget - OBSERVER_COST });

    const event = state.currentEvents[state.currentEventIndex];
    if (!event) return false;

    const maxLevel = get().getMaxObservationLevel();
    const updatedEvent = generateEvent(state.round, maxLevel, true, state.usedBirdIds);
    updatedEvent.id = event.id;

    set({
      currentEvents: state.currentEvents.map((e, i) =>
        i === state.currentEventIndex ? updatedEvent : e
      ),
    });
    get().saveGame();
    return true;
  },

  answerBird: (answer: string) => {
    const state = get();
    const event = state.currentEvents[state.currentEventIndex];
    if (!event) return { correct: false, scoreChange: 0, birdName: '' };

    const result = checkAnswer(event, answer);
    const bird = BIRDS.find(b => b.id === event.birdId)!;
    const newUnlocked = result.correct && !state.unlockedBirds.includes(event.birdId)
      ? [...state.unlockedBirds, event.birdId]
      : state.unlockedBirds;
    const newUsed = [...state.usedBirdIds, event.birdId];

    set({
      score: state.score + result.scoreChange,
      unlockedBirds: newUnlocked,
      usedBirdIds: newUsed,
    });

    return { correct: result.correct, scoreChange: result.scoreChange, birdName: bird.name };
  },

  guessMigration: (guess: string) => {
    const state = get();
    const event = state.currentEvents[state.currentEventIndex];
    if (!event) return { correct: false, scoreChange: 0 };

    const correct = checkMigrationGuess(event.birdId, guess);
    const scoreChange = correct ? 15 : 0;
    const bird = BIRDS.find(b => b.id === event.birdId)!;

    const record: EventRecord = {
      eventId: event.id,
      birdId: event.birdId,
      birdName: bird.name,
      playerAnswer: event.options.find(o => true) || '',
      correct: true,
      scoreChange: 0,
      observerSent: event.observerSent,
      routeGuessed: true,
      routeCorrect: correct,
      routeScoreChange: scoreChange,
    };

    set({
      score: state.score + scoreChange,
      eventHistory: [...state.eventHistory, record],
    });

    return { correct, scoreChange };
  },

  nextEvent: () => {
    const state = get();
    const nextIdx = state.currentEventIndex + 1;
    if (nextIdx < state.currentEvents.length) {
      set({ currentEventIndex: nextIdx });
      return true;
    }

    const nextRound = state.round + 1;
    if (nextRound > state.maxRounds || state.budget <= 0) {
      get().endGame();
      return false;
    }

    set({
      round: nextRound,
      phase: 'map',
      currentEvents: [],
      currentEventIndex: 0,
    });
    get().saveGame();
    return false;
  },

  goToPhase: (phase) => set({ phase }),

  endGame: () => {
    const state = get();
    const budgetBonus = Math.floor(state.budget / 10) * 2;
    set({
      budgetBonus,
      score: state.score + budgetBonus,
      phase: 'result',
    });
    get().clearSave();
  },

  saveGame: () => {
    const state = get();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        round: state.round,
        maxRounds: state.maxRounds,
        budget: state.budget,
        score: state.score,
        budgetBonus: state.budgetBonus,
        observationPoints: state.observationPoints,
        unlockedBirds: state.unlockedBirds,
        eventHistory: state.eventHistory,
        usedBirdIds: state.usedBirdIds,
      }));
    } catch { }
  },

  hasSave: () => {
    return localStorage.getItem(SAVE_KEY) !== null;
  },

  clearSave: () => {
    localStorage.removeItem(SAVE_KEY);
  },

  getMaxObservationLevel: () => {
    const state = get();
    const placed = state.observationPoints.filter(p => p.placed);
    if (placed.length === 0) return 1;
    return Math.max(...placed.map(p => p.level));
  },
}));
