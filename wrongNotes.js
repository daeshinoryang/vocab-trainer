import { store } from '../store.js';
import { SECTION_CONFIG, getWordById } from '../data.js';
import { speakText, showWordDetailModal } from '../app.js';

export function renderWrongNotes(container, navigate) {
  let activeTab = 'active';
  let currentSort = 'recent';
  let filterSection = 'all';
  let filterType = 'all';
  let searchQuery = '';

  function render() {
    const rawList = activeTab === 'active' ? store.getActiveWrongList() : store.getMasteredList();
    const activeCount = store.getActiveWrongList().length;
    const masteredCount = store.getMasteredList().length;

    let filtered = rawList.filter(item => {
      if (filterSection !== 'all' && item.section !== parseInt(filterSection)) return false;
      if (filterType !== 'all') {
        if (!item.wrongTypes || !item.wrongTypes.includes(filterType)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const w = item.wordObj.word.toLowerCase();
        const m = item.wordObj.meaning.toLowerCase();
        if (!w.includes(q) && !m.includes(q)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (currentSort === 'recent') {
        return (b.lastWrongDate || '').localeCompare(a.lastWrongDate || '');
      } else if (currentSort === 'wrong_count') {
        return b.wrongCount - a.wrongCount;
      } else if (currentSort === 'section') {
        return a.section - b.section || a.wordId - b.wordId;
      } else if (currentSort === 'alpha') {
        return a.wordObj.word.localeCompare(b.wordObj.word);
      }
      return 0;
    });

    const typeLabelMap = {
      english_def: '영영 풀이',
      example_blank: '예문 빈칸',
      eng_to_kor: '영어→우리말',
      kor_to_eng: '우리말→영어'
    };

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button id="btn-wrong-back" class="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors">
              <i data-lucide="chevron-left" class="w-4 h-4"></i> 메인
            </button>
            <h1 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <i data-lucide="file-x-2" class="w-6 h-6 text-rose-500"></i> 오답노트
            </h1>
          </div>

          ${activeCount > 0 ? `
            <button id="btn-retry-all-wrongs" class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 hover:scale-105">
              <i data-lucide="play" class="w-4 h-4"></i> 오답만 모아서 재시험 (${activeCount}단어)
            </button>
          ` : ''}
        </div>

        <div class="flex gap-2 p-1 bg-slate-200/80 rounded-2xl max-w-md">
          <button id="tab-active" class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            <span>📝 집중 복습 단어</span>
            <span class="px-2 py-0.5 text-[10px] rounded-full ${activeTab === 'active' ? 'bg-rose-100 text-rose-700' : 'bg-slate-300/60 text-slate-700'}">${activeCount}</span>
          </button>

          <button id="tab-mastered" class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'mastered' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            <span>🎓 오답 졸업 단어</span>
            <span class="px-2 py-0.5 text-[10px] rounded-full ${activeTab === 'mastered' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-300/60 text-slate-700'}">${masteredCount}</span>
          </button>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="relative">
              <input type="text" id="wrong-search" placeholder="단어 또는 뜻 검색..." value="${searchQuery}" class="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-bold whitespace-nowrap">정렬:</span>
              <select id="wrong-sort" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
                <option value="recent" ${currentSort === 'recent' ? 'selected' : ''}>최근 틀린 순</option>
                <option value="wrong_count" ${currentSort === 'wrong_count' ? 'selected' : ''}>많이 틀린 순</option>
                <option value="section" ${currentSort === 'section' ? 'selected' : ''}>Section 순</option>
                <option value="alpha" ${currentSort === 'alpha' ? 'selected' : ''}>알파벳 순 (A-Z)</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-bold whitespace-nowrap">Section:</span>
              <select id="wrong-filter-sec" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
                <option value="all" ${filterSection === 'all' ? 'selected' : ''}>전체 Section</option>
                ${SECTION_CONFIG.map(cfg => `
                  <option value="${cfg.section}" ${filterSection === String(cfg.section) ? 'selected' : ''}>Section ${cfg.section}</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
          <i data-lucide="info" class="w-4 h-4 text-indigo-600 shrink-0 mt-0.5"></i>
          <div>
            <strong>오답 졸업(Mastered) 시스템:</strong> 오답노트에 등록된 단어를 시험에서 <strong>연속 2회 이상 정답</strong>을 맞히면 '오답 졸업' 상태로 자동 변경됩니다. 나중에 다시 틀리면 오답노트로 복귀합니다.
          </div>
        </div>

        ${filtered.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${filtered.map(item => {
              const isFav = store.isFavorite(item.wordId);
              const streak = item.correctStreak || 0;
              const streakPercent = Math.min(100, Math.round((streak / store.getSettings().graduationStreak) * 100));

              return `
                <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">Section ${item.section}</span>
                        <span class="text-xs font-extrabold ${item.isMastered ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-0.5 rounded-full">
                          ${item.isMastered ? '🎓 졸업 완료' : `누적 ${item.wrongCount}회 오답`}
                        </span>
                      </div>

                      <div class="flex items-center gap-1">
                        <button class="btn-item-tts p-1 text-indigo-600 hover:text-indigo-800" data-word="${item.wordObj.word}" title="발음 듣기">
                          <i data-lucide="volume-2" class="w-4 h-4"></i>
                        </button>
                        <button class="btn-item-fav p-1 ${isFav ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}" data-id="${item.wordId}" title="즐겨찾기">
                          <i data-lucide="star" class="w-4 h-4 ${isFav ? 'fill-current' : ''}"></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 class="text-xl font-black text-slate-800 select-all">${item.wordObj.word}</h3>
                      <p class="text-xs font-bold text-indigo-700 mt-0.5">${item.wordObj.meaning}</p>
                    </div>

                    <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      "${item.wordObj.english_def}"
                    </p>
                  </div>

                  <div class="space-y-3 pt-3 border-t border-slate-100">
                    <div>
                      <div class="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>졸업 연속 정답: <strong>${streak} / ${store.getSettings().graduationStreak}회</strong></span>
                        <span class="text-[10px] text-slate-400">최근 오답: ${item.lastWrongDate || '-'}</span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-emerald-500 h-full rounded-full transition-all" style="width: ${streakPercent}%"></div>
                      </div>
                    </div>

                    ${item.wrongTypes && item.wrongTypes.length > 0 ? `
                      <div class="flex flex-wrap gap-1 items-center">
                        <span class="text-[10px] text-slate-400 font-medium">틀린 유형:</span>
                        ${item.wrongTypes.map(t => `
                          <span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                            ${typeLabelMap[t] || t}
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}

                    <button class="btn-show-detail w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1" data-id="${item.wordId}">
                      <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-500"></i> 단어 상세 및 예문 보기
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              <i data-lucide="${activeTab === 'active' ? 'check-circle' : 'award'}" class="w-7 h-7"></i>
            </div>
            <h3 class="text-base font-bold text-slate-700">
              ${activeTab === 'active' ? '오답노트에 등록된 단어가 없습니다.' : '아직 오답을 졸업한 단어가 없습니다.'}
            </h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">
              ${activeTab === 'active' ? '테스트를 치르면 틀린 단어가 자동으로 이곳에 누적되어 맞춤 복습을 도와줍니다.' : '오답노트의 단어를 연속 2회 이상 맞히면 이곳으로 졸업 처리됩니다.'}
            </p>
          </div>
        `}
      </div>
    `;

    container.querySelector('#btn-wrong-back')?.addEventListener('click', () => navigate('home'));
    container.querySelector('#tab-active')?.addEventListener('click', () => { activeTab = 'active'; render(); });
    container.querySelector('#tab-mastered')?.addEventListener('click', () => { activeTab = 'mastered'; render(); });
    container.querySelector('#btn-retry-all-wrongs')?.addEventListener('click', () => navigate('test', { wrongOnly: true }));

    const searchInput = container.querySelector('#wrong-search');
    searchInput?.addEventListener('input', (e) => { searchQuery = e.target.value; render(); });

    const sortSelect = container.querySelector('#wrong-sort');
    sortSelect?.addEventListener('change', (e) => { currentSort = e.target.value; render(); });

    const secFilter = container.querySelector('#wrong-filter-sec');
    secFilter?.addEventListener('change', (e) => { filterSection = e.target.value; render(); });

    container.querySelectorAll('.btn-item-tts').forEach(btn => {
      btn.addEventListener('click', () => speakText(btn.dataset.word));
    });

    container.querySelectorAll('.btn-item-fav').forEach(btn => {
      btn.addEventListener('click', () => {
        store.toggleFavorite(btn.dataset.id);
        render();
      });
    });

    container.querySelectorAll('.btn-show-detail').forEach(btn => {
      btn.addEventListener('click', () => showWordDetailModal(btn.dataset.id));
    });

    if (window.lucide) window.lucide.createIcons();
  }

  render();
}