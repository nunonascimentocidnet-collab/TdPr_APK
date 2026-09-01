import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface TrainingSeries {
  shots: number[];
  score: number;
  average: number;
  isWarmup?: boolean;
}

export interface TrainingSession {
  id?: string;
  userId: string;
  date: string;
  totalScore: number;
  averageScore: number;
  totalShots: number;
  officialShots: number;
  weaponType: string;
  caliber: string;
  distance: string;
  targetType: string;
  series: TrainingSeries[];
  targetPoints: number;
  notes: string;
  ammoBrand: string;
  weaponModel: string;
  numSeries: number;
  shotsPerSeries: number;
  sessionType: 'training' | 'competition';
  competitionName?: string;
}

export interface ScheduledEvent {
  id?: string;
  date: string; // ISO string or YYYY-MM-DD
  time?: string; // HH:mm
  type: 'training' | 'competition';
  name: string;
  weaponType: string;
  notes?: string;
  completed?: boolean;
}

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  targetScore: number;
  type: string;
  progress: number;
  deadline: string;
  completed: boolean;
  createdAt: string;
}

// src/services/db.ts
const LOCAL_STORAGE_KEY = 'precision_trainings_backup';

export const trainingService = {
  async saveTraining(session: TrainingSession) {
    // Save only to local storage
    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      
      // Ensure session has a unique stable ID if not present
      const sessionId = session.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const sessionWithId = { ...session, id: sessionId };
      
      const existingIndex = local.findIndex((t: any) => t.id === sessionId);
      if (existingIndex !== -1) {
        local[existingIndex] = sessionWithId;
        console.log("Training updated locally with ID:", sessionId);
      } else {
        local.unshift(sessionWithId);
        console.log("Training saved locally with ID:", sessionId);
      }
      
      // Keep a large history
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local.slice(0, 5000)));
      return sessionWithId;
    } catch (e) {
      console.error("Local storage save failed", e);
      return { ...session, id: session.date };
    }
  },

  async updateTraining(idOrDate: any, updatedSession: TrainingSession) {
    try {
      const targetId = typeof idOrDate === 'object' && idOrDate !== null && 'id' in idOrDate ? idOrDate.id : idOrDate;
      const targetStr = String(targetId);
      const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const existingIndex = local.findIndex((t: any) => 
        (t.id && (t.id === targetId || String(t.id) === targetStr)) ||
        (t.date && (t.date === targetId || String(t.date) === targetStr))
      );
      
      if (existingIndex !== -1) {
        // Preserve ID if it exists in the original
        const original = local[existingIndex];
        const sessionToSave = { 
          ...updatedSession, 
          id: updatedSession.id || original.id || targetId || `local_${Date.now()}`
        };
        local[existingIndex] = sessionToSave;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
        return sessionToSave;
      } else {
        // If not found, just save it as new
        return this.saveTraining(updatedSession);
      }
    } catch (e) {
      console.error("Local storage update failed", e);
      return updatedSession;
    }
  },

  async getUserTrainings(userId: string) {
    // Only use local storage
    try {
      const localString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!localString) return [];
      
      const local = JSON.parse(localString);
      // Unique by ID/Date to be safe
      const seen = new Set();
      const unique = local.filter((item: any) => {
        const identifier = item.id || item.date;
        if (!identifier || seen.has(identifier)) return false;
        seen.add(identifier);
        return true;
      });
      
      return unique.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("Local storage fetch failed", e);
      return [];
    }
  },

  async getTrainingById(id: any) {
    try {
      if (!id) return null;
      const targetId = typeof id === 'object' && id !== null && 'id' in id ? id.id : id;
      const targetStr = String(targetId);
      const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      return local.find((t: any) => 
        (t.id && (t.id === targetId || String(t.id) === targetStr)) ||
        (t.date && (t.date === targetId || String(t.date) === targetStr))
      ) || null;
    } catch (e) {
      return null;
    }
  },

  async deleteTraining(id: string, date?: string) {
    console.log(`[DB] Início da eliminação: ID=${id}, Data=${date}`);
    try {
      const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (rawLocal) {
        const local = JSON.parse(rawLocal);
        const beforeCount = local.length;
        
        // Filtro ultra-robusto: remove se coincidir ID OU Data
        const filtered = local.filter((t: any) => {
          const isIdMatch = t.id && id && t.id === id;
          const isDateMatch = (t.date && t.date === id) || (t.date && date && t.date === date);
          const isMatch = isIdMatch || isDateMatch;
          
          if (isMatch) console.log(`[DB] Item encontrado para remover: ${t.id || t.date}`);
          return !isMatch;
        });
        
        if (filtered.length < beforeCount) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
          console.log(`[DB] Sucesso: ${beforeCount - filtered.length} item(s) removido(s).`);
        } else {
          console.warn("[DB] Nenhum item corresponde aos critérios de eliminação.");
        }
      }
    } catch (e) {
      console.error("[DB] Falha crítica ao aceder ao LocalStorage para apagar", e);
      throw e;
    }
  }
};

// Goals fallback key
const GOALS_LOCAL_KEY = 'precision_goals_backup';

export const goalService = {
  async saveGoal(goal: Goal) {
    try {
      const local = JSON.parse(localStorage.getItem(GOALS_LOCAL_KEY) || '[]');
      local.unshift(goal);
      localStorage.setItem(GOALS_LOCAL_KEY, JSON.stringify(local));
      return { id: goal.createdAt, ...goal };
    } catch (e) {
      console.error("Goal local save failed", e);
    }
  },

  async getUserGoals(userId: string) {
    try {
      const local = JSON.parse(localStorage.getItem(GOALS_LOCAL_KEY) || '[]');
      return local.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      return [];
    }
  },

  async updateGoalProgress(id: string, progress: number, completed: boolean) {
    try {
      const local = JSON.parse(localStorage.getItem(GOALS_LOCAL_KEY) || '[]');
      const index = local.findIndex((g: any) => g.id === id || g.createdAt === id);
      if (index !== -1) {
        local[index].progress = progress;
        local[index].completed = completed;
        localStorage.setItem(GOALS_LOCAL_KEY, JSON.stringify(local));
      }
    } catch (e) {
      console.error("Goal local update failed", e);
    }
  },

  async deleteGoal(id: string, createdAt?: string) {
    try {
      const rawLocal = localStorage.getItem(GOALS_LOCAL_KEY);
      if (rawLocal) {
        const local = JSON.parse(rawLocal);
        const filtered = local.filter((g: any) => {
          const matchId = g.id && g.id === id;
          const matchCreated = g.createdAt === id || (createdAt && g.createdAt === createdAt);
          return !matchId && !matchCreated;
        });
        localStorage.setItem(GOALS_LOCAL_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error("Goal local delete failed", e);
    }
  }
};

const EVENTS_LOCAL_KEY = 'precision_events_backup';

export const eventService = {
  async saveEvent(event: ScheduledEvent) {
    try {
      const local = JSON.parse(localStorage.getItem(EVENTS_LOCAL_KEY) || '[]');
      const id = `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newEvent = { ...event, id: event.id || id };
      
      const existingIndex = local.findIndex((e: any) => e.id === newEvent.id);
      if (existingIndex !== -1) {
        local[existingIndex] = newEvent;
      } else {
        local.unshift(newEvent);
      }
      
      localStorage.setItem(EVENTS_LOCAL_KEY, JSON.stringify(local));
      return newEvent;
    } catch (e) {
      console.error("Event local save failed", e);
      return event;
    }
  },

  async getScheduledEvents() {
    try {
      const local = JSON.parse(localStorage.getItem(EVENTS_LOCAL_KEY) || '[]');
      return local.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (e) {
      return [];
    }
  },

  async deleteEvent(id: string) {
    try {
      const local = JSON.parse(localStorage.getItem(EVENTS_LOCAL_KEY) || '[]');
      const filtered = local.filter((e: any) => e.id !== id);
      localStorage.setItem(EVENTS_LOCAL_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error("Event local delete failed", e);
    }
  }
};
