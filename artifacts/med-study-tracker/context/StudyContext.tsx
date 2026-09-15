import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Topic = {
  id: string;
  name: string;
  hoursNeeded: number;
  hoursDone: number;
  color: string;
};

export type ScheduleBlock = {
  id: string;
  type: 'shift' | 'lecture';
  label: string;
  start: number;
  end: number;
};

export type DayPlan = {
  fixed: ScheduleBlock[];
  studyBlock: { start: number; end: number } | null;
  overloaded: boolean;
  longestShift: number;
  topic: Topic;
  windows: { start: number; end: number }[];
};

const STORAGE_KEY = '@pulse-study-tracker';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type Day = (typeof DAYS)[number];

const INITIAL_TOPICS: Topic[] = [
  { id: 'cardio', name: 'Cardiology', hoursNeeded: 4, hoursDone: 3, color: '#1F6F6B' },
  { id: 'renal', name: 'Renal', hoursNeeded: 4, hoursDone: 1, color: '#B8722B' },
  { id: 'gi', name: 'GI', hoursNeeded: 3, hoursDone: 3, color: '#6379A6' },
  { id: 'endo', name: 'Endocrine', hoursNeeded: 3, hoursDone: 0, color: '#8D6C8C' },
  { id: 'psych', name: 'Psychiatry', hoursNeeded: 2, hoursDone: 0, color: '#4D8278' },
];

const SCHEDULE: Record<Day, ScheduleBlock[]> = {
  Mon: [{ id: 'mon-shift', type: 'shift', label: 'Surgery rotation', start: 6, end: 15 }],
  Tue: [{ id: 'tue-shift', type: 'shift', label: 'Surgery rotation', start: 6, end: 15 }],
  Wed: [{ id: 'wed-lecture', type: 'lecture', label: 'Pathophysiology lecture', start: 9, end: 11 }],
  Thu: [{ id: 'thu-shift', type: 'shift', label: 'Surgery rotation', start: 6, end: 18 }],
  Fri: [{ id: 'fri-shift', type: 'shift', label: 'Surgery rotation', start: 6, end: 15 }],
  Sat: [],
  Sun: [{ id: 'sun-lecture', type: 'lecture', label: 'Case review seminar', start: 10, end: 12 }],
};

type PersistedState = {
  topics: Topic[];
  completedBlocks: string[];
  totalMinutes: number;
};

type StudyContextValue = PersistedState & {
  hydrated: boolean;
  dayPlan: (day: Day) => DayPlan;
  logStudy: (topicId: string, hours?: number) => void;
  toggleBlock: (blockId: string) => void;
  isBlockComplete: (blockId: string) => boolean;
  totalHours: number;
  totalTargetHours: number;
  completionPercent: number;
};

const StudyContext = createContext<StudyContextValue | null>(null);

const getDayPlan = (day: Day, topics: Topic[]): DayPlan => {
  const fixed = [...SCHEDULE[day]].sort((a, b) => a.start - b.start);
  const dayStart = 6;
  const dayEnd = 23;
  const windows: { start: number; end: number }[] = [];
  let cursor = dayStart;

  fixed.forEach((block) => {
    if (block.start > cursor) windows.push({ start: cursor, end: block.start });
    cursor = Math.max(cursor, block.end);
  });
  if (cursor < dayEnd) windows.push({ start: cursor, end: dayEnd });

  const longestShift = fixed
    .filter((block) => block.type === 'shift')
    .reduce((max, block) => Math.max(max, block.end - block.start), 0);
  const overloaded = longestShift >= 10;

  let studyBlock: { start: number; end: number } | null = null;
  if (!overloaded) {
    const window = windows.find((item) => item.end - item.start >= 1.5);
    if (window) {
      const start = Math.min(window.start + 0.5, window.end - 1.5);
      studyBlock = { start, end: Math.min(start + 1.5, window.end) };
    }
  }

  const topic = [...topics].sort(
    (a, b) => a.hoursDone / a.hoursNeeded - b.hoursDone / b.hoursNeeded,
  )[0] ?? INITIAL_TOPICS[0];

  return { fixed, studyBlock, overloaded, longestShift, topic, windows };
};

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [completedBlocks, setCompletedBlocks] = useState<string[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) return;
        const saved = JSON.parse(value) as Partial<PersistedState>;
        if (saved.topics) setTopics(saved.topics);
        if (saved.completedBlocks) setCompletedBlocks(saved.completedBlocks);
        if (typeof saved.totalMinutes === 'number') setTotalMinutes(saved.totalMinutes);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = { topics, completedBlocks, totalMinutes };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [completedBlocks, hydrated, topics, totalMinutes]);

  const value = useMemo<StudyContextValue>(() => {
    const totalTargetHours = topics.reduce((sum, topic) => sum + topic.hoursNeeded, 0);
    const totalHours = topics.reduce((sum, topic) => sum + topic.hoursDone, 0);
    return {
      topics,
      completedBlocks,
      totalMinutes,
      hydrated,
      dayPlan: (day) => getDayPlan(day, topics),
      logStudy: (topicId, hours = 0.5) => {
        setTopics((current) =>
          current.map((topic) =>
            topic.id === topicId
              ? { ...topic, hoursDone: Math.min(topic.hoursNeeded, Number((topic.hoursDone + hours).toFixed(1))) }
              : topic,
          ),
        );
        setTotalMinutes((current) => current + Math.round(hours * 60));
      },
      toggleBlock: (blockId) => {
        setCompletedBlocks((current) =>
          current.includes(blockId) ? current.filter((id) => id !== blockId) : [...current, blockId],
        );
      },
      isBlockComplete: (blockId) => completedBlocks.includes(blockId),
      totalHours,
      totalTargetHours,
      completionPercent: Math.round((totalHours / totalTargetHours) * 100),
    };
  }, [completedBlocks, hydrated, topics, totalMinutes]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used inside StudyProvider');
  return context;
}

export function getToday(): Day {
  const day = new Date().getDay();
  return DAYS[(day + 6) % 7];
}

export function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);
  const normalized = wholeHour % 12 || 12;
  return `${normalized}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}