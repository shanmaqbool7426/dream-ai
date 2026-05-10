import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface DreamSymbol {
  symbol: string;
  meaning: string;
}

export interface DreamInterpretation {
  title: string;
  interpretation: string;
  symbols: DreamSymbol[];
  emotions: string[];
  insights: string;
  advice: string;
}

export interface Dream {
  id: string;
  title: string;
  text: string;
  date: string;
  emotions: string[];
  visualStyle?: string;
  interpretation?: DreamInterpretation;
  imageBase64?: string;
  sleepQuality?: number;
}

interface DreamContextType {
  dreams: Dream[];
  loading: boolean;
  addDream: (dream: Omit<Dream, "id" | "date">) => Promise<Dream>;
  updateDream: (id: string, updates: Partial<Dream>) => Promise<void>;
  deleteDream: (id: string) => Promise<void>;
  getDream: (id: string) => Dream | undefined;
}

const DreamContext = createContext<DreamContextType | null>(null);

const STORAGE_KEY = "dreamscape_dreams";

export function DreamProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDreams();
  }, []);

  async function loadDreams() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setDreams(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }

  async function saveDreams(updated: Dream[]) {
    setDreams(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  const addDream = useCallback(async (dream: Omit<Dream, "id" | "date">): Promise<Dream> => {
    const newDream: Dream = {
      ...dream,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    await saveDreams([newDream, ...dreams]);
    return newDream;
  }, [dreams]);

  const updateDream = useCallback(async (id: string, updates: Partial<Dream>) => {
    const updated = dreams.map((d) => (d.id === id ? { ...d, ...updates } : d));
    await saveDreams(updated);
  }, [dreams]);

  const deleteDream = useCallback(async (id: string) => {
    const updated = dreams.filter((d) => d.id !== id);
    await saveDreams(updated);
  }, [dreams]);

  const getDream = useCallback((id: string) => dreams.find((d) => d.id === id), [dreams]);

  return (
    <DreamContext.Provider value={{ dreams, loading, addDream, updateDream, deleteDream, getDream }}>
      {children}
    </DreamContext.Provider>
  );
}

export function useDreams() {
  const ctx = useContext(DreamContext);
  if (!ctx) throw new Error("useDreams must be used inside DreamProvider");
  return ctx;
}
