import { VOCABULARY_DATA, SECTION_CONFIG, getWordsBySection } from '../data.js';
import { store } from '../store.js';
import { speakText } from '../app.js';

export function renderStudy(container, navigate, params = {}) {
  let currentSection = params.section || 1;
  let isFavoritesMode = params.favorites === true;
  let wordList = [];

  function loadWordList() {
    if (isFavoritesMode) {
      wordList = store.getFavoriteWords();
    } else {
      wordList = getWordsBySection(currentSection);
    }
  }

  loadWordList();

  if (wordList.length === 0 && isFavoritesMode) {
    container.innerHTML = `
      <div class="max-w-xl mx-auto text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">★</div>
        <h2 class="text-xl font-bold text-slate-800">즐겨찾기한 단어가 없습니다</h2>
        <p class="text-xs text-slate-500">단어 학습 또는 오답노트에서 어려운 단어의 별표(★)를 눌러 추가해 보세요.</p>
        <button id="btn-back-to-sec1" class="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
          Section 1 학습하기
        </button>
      </div>
    `;
    container.querySelector('#btn-back-to-sec1')?.addEventListener('click', () => {
      renderStudy(container, navigate, { section: 1 });
    });
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let currentIndex = 0;
  let showMeaning = false;
  let showDefinition = false;
  let showExample = false;

  function renderCard() {
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= wordList.length) currentIndex = wordList.length - 1;

    const currentWord = wordList[currentIndex];
    const isLearned = store.isLearned(currentWord.id);
    const isFav = store.isFavorite(currentWord.id);
    const wrongEntry = store.getWrongEntry(currentWord.id);

    const sectionTabsHtml = SECTION_CONFIG.map(cfg => {
      const isSel = !isFavoritesMode && currentSection === cfg.section;
      return `
        <button class="btn-tab-sec px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isSel ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-section="${cfg.section}">
          Sec ${cfg.section}
        </button>
      `;
    }).join('');

    let highlightedExample = currentWord.example;
    if (currentWord.masked_target) {
      const regex = new RegExp(`(${currentWord.masked_target})`, 'gi');
      highlightedExample = highlightedExample.replace(regex, '<span class="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">$1</span>');
    }

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <button id="btn-study-back" class="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors">
            <i data-lucide="chevron-left" class="w-4 h-4"></i> 메인으로
          </button>
          
          <div class="flex items-center gap-2">
            <button id="btn-toggle-fav-mode" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${isFavoritesMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
              <i data-lucide="star" class="w-3.5 h-3.5 ${isFavoritesMode ? 'fill-current' : ''}"></i> 즐겨찾기 (${store.getFavoriteIds().length})
            </button>
            <button id="btn-test-this-section" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1">
              <i data-lucide="play" class="w-3.5 h-3.5"></i> 이 범위 시험
            </button>
          </div>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          ${sectionTabsHtml}
        </div>

        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 relative overflow-hidden transition-all">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Section ${currentWord.section}
              </span>
              <span class="text-xs font-bold text-slate-400 font-mono">#${currentWord.id}</span>
              ${wrongEntry && wrongEntry.wrongCount > 0 ? `
                <span class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  오답 ${wrongEntry.wrongCount}회
                </span>
              ` : ''}
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-card-tts" class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors" title="발음 듣기">
                <i data-lucide="volume-2" class="w-4 h-4"></i>
              </button>
              <button id="btn-card-fav" class="w-9 h-9 rounded-xl ${isFav ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400 hover:text-amber-500'} flex items-center justify-center transition-colors" title="즐겨찾기">
                <i data-lucide="star" class="w-4 h-4 ${isFav ? 'fill-current' : ''}"></i>
              </button>
              <button id="btn-card-learned" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isLearned ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}">
                <i data-lucide="check" class="w-3.5 h-3.5"></i> ${isLearned ? '학습 완료' : '학습 체크'}
              </button>
            </div>
          </div>

          <div class="text-center py-4 sm:py-6">
            <h2 class="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-2 select-all">${currentWord.word}</h2>
            <p class="text-xs text-slate-400 font-medium">탭하거나 아래 버튼을 눌러 뜻과 예문을 확인하세요</p>
          </div>

          <div class="space-y-3 mt-4">
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 transition-all">
              <div class="flex items-center justify-between cursor-pointer select-none" id="toggle-meaning-box">
                <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <i data-lucide="languages" class="w-3.5 h-3.5 text-indigo-500"></i> 우리말 뜻
                </span>
                <span class="text-xs font-semibold text-indigo-600">${showMeaning ? '숨기기' : '보기'}</span>
              </div>
              <div class="mt-2 text-base font-bold text-slate-800 ${showMeaning ? 'block' : 'hidden'} select-all">
                ${currentWord.meaning}
              </div>
            </div>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 transition-all">
              <div class="flex items-center justify-between cursor-pointer select-none" id="toggle-def-box">
                <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <i data-lucide="book" class="w-3.5 h-3.5 text-emerald-500"></i> English Definition
                </span>
                <span class="text-xs font-semibold text-indigo-600">${showDefinition ? '숨기기' : '보기'}</span>
              </div>
              <div class="mt-2 text-sm text-slate-700 font-medium leading-relaxed ${showDefinition ? 'block' : 'hidden'} select-all">
                "${currentWord.english_def}"
              </div>
            </div>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 transition-all">
              <div class="flex items-center justify-between cursor-pointer select-none" id="toggle-example-box">
                <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <i data-lucide="quote" class="w-3.5 h-3.5 text-amber-500"></i> Example Sentence
                </span>
                <div class="flex items-center gap-2">
                  <button id="btn-example-tts" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 ${showExample ? 'inline-flex' : 'hidden'}">
                    <i data-lucide="volume-2" class="w-3 h-3"></i> 문장 듣기
                  </button>
                  <span class="text-xs font-semibold text-indigo-600">${showExample ? '숨기기' : '보기'}</span>
                </div>
              </div>
              <div class="mt-2 text-sm text-slate-700 font-medium leading-relaxed ${showExample ? 'block' : 'hidden'} select-all">
                ${highlightedExample}
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-center">
            <button id="btn-toggle-all" class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> ${(showMeaning && showDefinition && showExample) ? '전체 내용 숨기기' : '전체 내용 펼쳐보기 (Space)'}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <button id="btn-prev-card" class="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-1" ${currentIndex === 0 ? 'disabled' : ''}>
            <i data-lucide="arrow-left" class="w-4 h-4"></i> 이전 단어
          </button>

          <div class="text-center">
            <span class="text-sm font-extrabold text-slate-800">${currentIndex + 1} / ${wordList.length}</span>
            <div class="text-[10px] text-slate-400">단축키: ← / → 이동, Space 펼치기</div>
          </div>

          <button id="btn-next-card" class="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-1 shadow-sm" ${currentIndex === wordList.length - 1 ? 'disabled' : ''}>
            다음 단어 <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-bold text-slate-700">이 섹션 단어 목록 (클릭하여 이동)</h4>
            <span class="text-[11px] text-slate-400 font-medium">${wordList.filter(w => store.isLearned(w.id)).length}개 완료</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            ${wordList.map((w, idx) => {
              const isCurr = idx === currentIndex;
              const isL = store.isLearned(w.id);
              const isF = store.isFavorite(w.id);
              return `
                <button class="btn-jump-word text-left p-2 rounded-xl border text-xs transition-all ${isCurr ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700'}" data-idx="${idx}">
                  <div class="flex items-center justify-between">
                    <span class="truncate font-semibold">${w.word}</span>
                    <div class="flex items-center gap-0.5">
                      ${isF ? '<span class="text-amber-400 text-[10px]">★</span>' : ''}
                      ${isL ? '<span class="text-emerald-500 text-[10px]">✓</span>' : ''}
                    </div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-study-back')?.addEventListener('click', () => navigate('home'));
    
    container.querySelectorAll('.btn-tab-sec').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSection = parseInt(btn.dataset.section);
        isFavoritesMode = false;
        loadWordList();
        currentIndex = 0;
        showMeaning = false; showDefinition = false; showExample = false;
        renderCard();
      });
    });

    container.querySelector('#btn-toggle-fav-mode')?.addEventListener('click', () => {
      isFavoritesMode = !isFavoritesMode;
      loadWordList();
      currentIndex = 0;
      showMeaning = false; showDefinition = false; showExample = false;
      renderCard();
    });

    container.querySelector('#btn-test-this-section')?.addEventListener('click', () => {
      if (isFavoritesMode) {
        navigate('test', { favoritesOnly: true });
      } else {
        navigate('test', { sections: [currentSection] });
      }
    });

    container.querySelector('#btn-card-tts')?.addEventListener('click', () => speakText(currentWord.word));
    container.querySelector('#btn-example-tts')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speakText(currentWord.example);
    });

    container.querySelector('#btn-card-fav')?.addEventListener('click', () => {
      store.toggleFavorite(currentWord.id);
      renderCard();
    });

    container.querySelector('#btn-card-learned')?.addEventListener('click', () => {
      store.toggleLearned(currentWord.id);
      renderCard();
    });

    container.querySelector('#toggle-meaning-box')?.addEventListener('click', () => {
      showMeaning = !showMeaning;
      renderCard();
    });

    container.querySelector('#toggle-def-box')?.addEventListener('click', () => {
      showDefinition = !showDefinition;
      renderCard();
    });

    container.querySelector('#toggle-example-box')?.addEventListener('click', () => {
      showExample = !showExample;
      renderCard();
    });

    container.querySelector('#btn-toggle-all')?.addEventListener('click', () => {
      const allOpen = showMeaning && showDefinition && showExample;
      showMeaning = !allOpen;
      showDefinition = !allOpen;
      showExample = !allOpen;
      renderCard();
    });

    container.querySelector('#btn-prev-card')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        showMeaning = false; showDefinition = false; showExample = false;
        renderCard();
      }
    });

    container.querySelector('#btn-next-card')?.addEventListener('click', () => {
      if (currentIndex < wordList.length - 1) {
        currentIndex++;
        showMeaning = false; showDefinition = false; showExample = false;
        renderCard();
      }
    });

    container.querySelectorAll('.btn-jump-word').forEach(btn => {
      btn.addEventListener('click', () => {
        currentIndex = parseInt(btn.dataset.idx);
        showMeaning = false; showDefinition = false; showExample = false;
        renderCard();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        currentIndex--;
        showMeaning = false; showDefinition = false; showExample = false;
        renderCard();
      }
    } else if (e.key === 'ArrowRight') {
      if (currentIndex < wordList.length - 1) {
        currentIndex++;
        showMeaning = false; showDefinition = false; showExample = false;
        renderCard();
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      const allOpen = showMeaning && showDefinition && showExample;
      showMeaning = !allOpen;
      showDefinition = !allOpen;
      showExample = !allOpen;
      renderCard();
    } else if (e.key === 'Enter') {
      const currentWord = wordList[currentIndex];
      if (currentWord) {
        store.toggleLearned(currentWord.id);
        renderCard();
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown);
  container._cleanup = () => {
    window.removeEventListener('keydown', handleKeyDown);
  };

  renderCard();
}