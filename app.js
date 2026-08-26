import { store } from './store.js';
import { getWordById } from './data.js';
import { renderHome } from './components/home.js';
import { renderStudy } from './components/study.js';
import { renderTest } from './components/test.js';
import { renderResult } from './components/result.js';
import { renderWrongNotes } from './components/wrongNotes.js';
import { renderStats } from './components/stats.js';

let currentRoute = 'home';
let currentParams = {};

export function speakText(text, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const clean = text.replace(/^[a-z]+\.\s*/gi, '').replace(/[~····_]/g, ' ').trim();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function showWordDetailModal(wordId) {
  const wordObj = getWordById(Number(wordId));
  if (!wordObj) return;

  const wrongEntry = store.getWrongEntry(wordId);
  const isFav = store.isFavorite(wordId);
  const isLearned = store.isLearned(wordId);

  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContainer = document.getElementById('modal-content');

  const typeLabelMap = {
    english_def: '영영 풀이',
    example_blank: '예문 빈칸',
    eng_to_kor: '영어→우리말',
    kor_to_eng: '우리말→영어'
  };

  modalContainer.innerHTML = `
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative border border-slate-100 animate-in zoom-in-95 duration-200">
      <button id="btn-close-modal" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Section ${wordObj.section}</span>
          <span class="text-xs font-bold text-slate-400 font-mono">단어 #${wordObj.id}</span>
        </div>
        <div class="flex items-center gap-3">
          <h2 class="text-3xl font-black text-slate-800">${wordObj.word}</h2>
          <button id="btn-modal-tts" class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors" title="발음 듣기">
            <i data-lucide="volume-2" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="text-base font-bold text-indigo-700">${wordObj.meaning}</div>
      </div>

      <div class="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div>
          <span class="font-bold text-slate-400 uppercase text-[10px]">English Definition</span>
          <p class="text-slate-800 font-medium leading-relaxed mt-0.5">${wordObj.english_def}</p>
        </div>
        <div>
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-400 uppercase text-[10px]">Example Sentence</span>
            <button id="btn-modal-example-tts" class="text-indigo-600 hover:underline font-bold text-[10px] flex items-center gap-0.5">
              <i data-lucide="volume-2" class="w-3 h-3"></i> 문장 듣기
            </button>
          </div>
          <p class="text-slate-800 font-medium leading-relaxed mt-0.5">${wordObj.example}</p>
        </div>
      </div>

      <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2 text-xs">
        <div class="flex items-center justify-between font-bold">
          <span class="text-slate-700">오답 기록</span>
          <span class="${wrongEntry && wrongEntry.wrongCount > 0 ? 'text-rose-600' : 'text-slate-400'}">
            ${wrongEntry ? `총 ${wrongEntry.wrongCount}회 오답` : '오답 없음'}
          </span>
        </div>
        ${wrongEntry && wrongEntry.wrongCount > 0 ? `
          <div class="text-[11px] text-slate-600 space-y-1 pt-1">
            <div>최근 오답일시: ${wrongEntry.lastWrongDate || '-'}</div>
            <div>오답 졸업 연속 정답: <strong>${wrongEntry.correctStreak || 0} / ${store.getSettings().graduationStreak}회</strong></div>
            ${wrongEntry.wrongTypes && wrongEntry.wrongTypes.length > 0 ? `
              <div class="flex flex-wrap gap-1 mt-1">
                ${wrongEntry.wrongTypes.map(t => `
                  <span class="px-2 py-0.5 bg-white text-slate-700 rounded text-[10px] font-semibold border border-indigo-100">
                    ${typeLabelMap[t] || t}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>

      <div class="flex items-center justify-between gap-3 pt-2">
        <button id="btn-modal-toggle-fav" class="flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${isFav ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
          <i data-lucide="star" class="w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}"></i> 즐겨찾기 ${isFav ? '해제' : '추가'}
        </button>
        <button id="btn-modal-toggle-learned" class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${isLearned ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          <i data-lucide="check" class="w-3.5 h-3.5"></i> ${isLearned ? '학습 완료됨' : '학습 완료 체크'}
        </button>
      </div>
    </div>
  `;

  modalBackdrop.classList.remove('hidden');
  modalBackdrop.classList.add('flex');

  const closeModal = () => {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.classList.remove('flex');
  };

  modalContainer.querySelector('#btn-close-modal')?.addEventListener('click', closeModal);
  modalContainer.querySelector('#btn-modal-tts')?.addEventListener('click', () => speakText(wordObj.word));
  modalContainer.querySelector('#btn-modal-example-tts')?.addEventListener('click', () => speakText(wordObj.example));

  modalContainer.querySelector('#btn-modal-toggle-fav')?.addEventListener('click', () => {
    store.toggleFavorite(wordObj.id);
    showWordDetailModal(wordId);
  });

  modalContainer.querySelector('#btn-modal-toggle-learned')?.addEventListener('click', () => {
    store.toggleLearned(wordObj.id);
    showWordDetailModal(wordId);
  });

  modalBackdrop.onclick = (e) => {
    if (e.target === modalBackdrop) closeModal();
  };

  if (window.lucide) window.lucide.createIcons();
}

export function navigate(route, params = {}) {
  const container = document.getElementById('app-main-content');
  if (container._cleanup) {
    container._cleanup();
    container._cleanup = null;
  }

  currentRoute = route;
  currentParams = params;

  document.querySelectorAll('.header-nav-btn').forEach(btn => {
    const r = btn.dataset.route;
    if (r === route || (route === 'test-active' && r === 'test') || (route === 'result' && r === 'test')) {
      btn.className = 'header-nav-btn px-3 py-1.5 rounded-xl text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200/80 shadow-xs transition-all flex items-center gap-1.5';
    } else {
      btn.className = 'header-nav-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5';
    }
  });

  const wrongBadge = document.getElementById('header-wrong-badge');
  const activeWrongs = store.getActiveWrongList().length;
  if (wrongBadge) {
    if (activeWrongs > 0) {
      wrongBadge.textContent = activeWrongs;
      wrongBadge.classList.remove('hidden');
    } else {
      wrongBadge.classList.add('hidden');
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (route) {
    case 'home':
      renderHome(container, navigate);
      break;
    case 'study':
      renderStudy(container, navigate, params);
      break;
    case 'test':
      renderTest(container, navigate, params);
      break;
    case 'test-active':
      renderTest(container, navigate, { activeSession: params.session || null, ...params });
      break;
    case 'result':
      renderResult(container, navigate, params);
      break;
    case 'wrong-notes':
      renderWrongNotes(container, navigate);
      break;
    case 'stats':
      renderStats(container, navigate);
      break;
    default:
      renderHome(container, navigate);
      break;
  }

  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.header-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modalBackdrop = document.getElementById('modal-backdrop');
      if (modalBackdrop && !modalBackdrop.classList.contains('hidden')) {
        modalBackdrop.classList.add('hidden');
        modalBackdrop.classList.remove('flex');
      }
    }
  });

  store.subscribe(() => {
    const wrongBadge = document.getElementById('header-wrong-badge');
    const activeWrongs = store.getActiveWrongList().length;
    if (wrongBadge) {
      if (activeWrongs > 0) {
        wrongBadge.textContent = activeWrongs;
        wrongBadge.classList.remove('hidden');
      } else {
        wrongBadge.classList.add('hidden');
      }
    }
  });

  navigate('home');
});