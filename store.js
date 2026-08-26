/**
 * LocalStorage 기반 반응형 스토리지 & 상태 관리 엔진
 */
import { VOCABULARY_DATA, SECTION_CONFIG, TOTAL_WORDS_COUNT, getWordById } from './data.js';

const STORAGE_KEYS = {
  LEARNED: 'vocab_learned_ids_v1',
  FAVORITES: 'vocab_favorites_v1',
  WRONG_ANSWERS: 'vocab_wrong_answers_v1',
  TEST_RECORDS: 'vocab_test_records_v1',
  SECTION_STATS: 'vocab_section_stats_v1',
  SETTINGS: 'vocab_settings_v1'
};

const DEFAULT_SETTINGS = {
  graduationStreak: 2,
  hideScoreDuringTest: false,
  ttsSpeed: 1.0,
  ttsAutoPlay: true
};

class VocabStore {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    this.learnedIds = new Set(this.loadJSON(STORAGE_KEYS.LEARNED, []));
    this.favoriteIds = new Set(this.loadJSON(STORAGE_KEYS.FAVORITES, []));
    this.wrongAnswers = this.loadJSON(STORAGE_KEYS.WRONG_ANSWERS, {});
    this.testRecords = this.loadJSON(STORAGE_KEYS.TEST_RECORDS, []);
    this.sectionStats = this.loadJSON(STORAGE_KEYS.SECTION_STATS, {});
    this.settings = { ...DEFAULT_SETTINGS, ...this.loadJSON(STORAGE_KEYS.SETTINGS, {}) };
  }

  loadJSON(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.error(`Error loading ${key} from localStorage`, e);
      return defaultVal;
    }
  }

  saveJSON(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch (e) { console.error('Store listener error:', e); }
    });
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  isLearned(wordId) {
    return this.learnedIds.has(Number(wordId));
  }

  setLearned(wordId, learned = true) {
    const id = Number(wordId);
    if (learned) {
      this.learnedIds.add(id);
    } else {
      this.learnedIds.delete(id);
    }
    this.saveJSON(STORAGE_KEYS.LEARNED, Array.from(this.learnedIds));
    this.notify();
  }

  toggleLearned(wordId) {
    this.setLearned(wordId, !this.isLearned(wordId));
  }

  getLearnedCount() {
    return this.learnedIds.size;
  }

  isFavorite(wordId) {
    return this.favoriteIds.has(Number(wordId));
  }

  setFavorite(wordId, fav = true) {
    const id = Number(wordId);
    if (fav) {
      this.favoriteIds.add(id);
    } else {
      this.favoriteIds.delete(id);
    }
    this.saveJSON(STORAGE_KEYS.FAVORITES, Array.from(this.favoriteIds));
    this.notify();
  }

  toggleFavorite(wordId) {
    this.setFavorite(wordId, !this.isFavorite(wordId));
  }

  getFavoriteIds() {
    return Array.from(this.favoriteIds);
  }

  getFavoriteWords() {
    return VOCABULARY_DATA.filter(w => this.favoriteIds.has(w.id));
  }

  recordAnswerResult(wordId, questionType, isCorrect, userAnswer) {
    const id = Number(wordId);
    const wordObj = getWordById(id);
    if (!wordObj) return;

    const todayStr = new Date().toISOString().split('T')[0];
    let entry = this.wrongAnswers[id];

    if (!isCorrect) {
      if (!entry) {
        entry = {
          wordId: id,
          section: wordObj.section,
          wrongCount: 0,
          correctStreak: 0,
          isMastered: false,
          firstWrongDate: todayStr,
          lastWrongDate: todayStr,
          wrongTypes: [],
          history: []
        };
      }

      entry.wrongCount += 1;
      entry.correctStreak = 0;
      entry.isMastered = false;
      entry.lastWrongDate = todayStr;
      
      if (!entry.wrongTypes.includes(questionType)) {
        entry.wrongTypes.push(questionType);
      }

      entry.history.push({
        date: new Date().toISOString(),
        questionType,
        isCorrect: false,
        userAnswer
      });

      this.wrongAnswers[id] = entry;
    } else {
      if (entry) {
        entry.correctStreak = (entry.correctStreak || 0) + 1;
        if (entry.correctStreak >= this.settings.graduationStreak) {
          entry.isMastered = true;
          entry.masteredDate = todayStr;
        }

        entry.history.push({
          date: new Date().toISOString(),
          questionType,
          isCorrect: true,
          userAnswer
        });

        this.wrongAnswers[id] = entry;
      }
    }

    this.saveJSON(STORAGE_KEYS.WRONG_ANSWERS, this.wrongAnswers);
    this.notify();
  }

  getActiveWrongList() {
    return Object.values(this.wrongAnswers)
      .filter(item => !item.isMastered && item.wrongCount > 0)
      .map(item => ({
        ...item,
        wordObj: getWordById(item.wordId)
      }))
      .filter(item => item.wordObj);
  }

  getMasteredList() {
    return Object.values(this.wrongAnswers)
      .filter(item => item.isMastered)
      .map(item => ({
        ...item,
        wordObj: getWordById(item.wordId)
      }))
      .filter(item => item.wordObj);
  }

  getWrongEntry(wordId) {
    return this.wrongAnswers[Number(wordId)] || null;
  }

  saveTestSession(sessionRecord) {
    const record = {
      id: 'test_' + Date.now(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('ko-KR'),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      ...sessionRecord
    };

    this.testRecords.unshift(record);
    if (this.testRecords.length > 100) this.testRecords.pop();
    this.saveJSON(STORAGE_KEYS.TEST_RECORDS, this.testRecords);

    if (sessionRecord.scopeSections && sessionRecord.scopeSections.length > 0) {
      sessionRecord.scopeSections.forEach(sec => {
        if (!this.sectionStats[sec]) {
          this.sectionStats[sec] = {
            totalTests: 0,
            lastScore: 0,
            bestScore: 0
          };
        }
        const st = this.sectionStats[sec];
        st.totalTests += 1;
        st.lastScore = sessionRecord.accuracy;
        st.bestScore = Math.max(st.bestScore || 0, sessionRecord.accuracy);
      });
      this.saveJSON(STORAGE_KEYS.SECTION_STATS, this.sectionStats);
    }

    this.notify();
    return record;
  }

  getTestRecords() {
    return this.testRecords;
  }

  getSectionSummary(sectionNum) {
    const words = VOCABULARY_DATA.filter(w => w.section === sectionNum);
    const totalCount = words.length;
    let learnedCount = 0;
    let activeWrongCount = 0;
    let masteredCount = 0;

    words.forEach(w => {
      if (this.learnedIds.has(w.id)) learnedCount++;
      const wrong = this.wrongAnswers[w.id];
      if (wrong) {
        if (wrong.isMastered) masteredCount++;
        else if (wrong.wrongCount > 0) activeWrongCount++;
      }
    });

    const stats = this.sectionStats[sectionNum] || { totalTests: 0, lastScore: null, bestScore: null };

    return {
      section: sectionNum,
      totalCount,
      learnedCount,
      isCompleted: learnedCount === totalCount,
      activeWrongCount,
      masteredCount,
      lastScore: stats.lastScore,
      bestScore: stats.bestScore,
      totalTests: stats.totalTests
    };
  }

  getOverallStats() {
    const totalWords = TOTAL_WORDS_COUNT;
    const learnedWords = this.learnedIds.size;
    const progressPercent = Math.round((learnedWords / totalWords) * 100);
    const activeWrongCount = this.getActiveWrongList().length;
    const masteredCount = this.getMasteredList().length;
    const totalTests = this.testRecords.length;

    let avgAccuracy = 0;
    if (totalTests > 0) {
      const sum = this.testRecords.reduce((acc, cur) => acc + (cur.accuracy || 0), 0);
      avgAccuracy = Math.round(sum / totalTests);
    }

    const allWrongs = Object.values(this.wrongAnswers)
      .map(item => ({
        ...item,
        wordObj: getWordById(item.wordId)
      }))
      .filter(item => item.wordObj && item.wrongCount > 0)
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 10);

    return {
      totalWords,
      learnedWords,
      progressPercent,
      activeWrongCount,
      masteredCount,
      totalTests,
      avgAccuracy,
      top10Wrongs: allWrongs
    };
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveJSON(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }

  exportBackup() {
    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      learned: Array.from(this.learnedIds),
      favorites: Array.from(this.favoriteIds),
      wrongAnswers: this.wrongAnswers,
      testRecords: this.testRecords,
      sectionStats: this.sectionStats,
      settings: this.settings
    }, null, 2);
  }

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.learned) this.learnedIds = new Set(data.learned);
      if (data.favorites) this.favoriteIds = new Set(data.favorites);
      if (data.wrongAnswers) this.wrongAnswers = data.wrongAnswers;
      if (data.testRecords) this.testRecords = data.testRecords;
      if (data.sectionStats) this.sectionStats = data.sectionStats;
      if (data.settings) this.settings = { ...DEFAULT_SETTINGS, ...data.settings };

      this.saveJSON(STORAGE_KEYS.LEARNED, Array.from(this.learnedIds));
      this.saveJSON(STORAGE_KEYS.FAVORITES, Array.from(this.favoriteIds));
      this.saveJSON(STORAGE_KEYS.WRONG_ANSWERS, this.wrongAnswers);
      this.saveJSON(STORAGE_KEYS.TEST_RECORDS, this.testRecords);
      this.saveJSON(STORAGE_KEYS.SECTION_STATS, this.sectionStats);
      this.saveJSON(STORAGE_KEYS.SETTINGS, this.settings);

      this.notify();
      return { success: true };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, error: e.message };
    }
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.LEARNED);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.WRONG_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.TEST_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.SECTION_STATS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    this.init();
    this.notify();
  }
}

export const store = new VocabStore();