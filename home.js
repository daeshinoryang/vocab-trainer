import { VOCABULARY_DATA, SECTION_CONFIG, TOTAL_WORDS_COUNT } from '../data.js';
import { store } from '../store.js';

export function renderHome(container, navigate) {
  const stats = store.getOverallStats();

  let sectionCardsHtml = '';
  SECTION_CONFIG.forEach(cfg => {
    const summary = store.getSectionSummary(cfg.section);
    const isCompleted = summary.isCompleted;
    const lastScoreText = summary.lastScore !== null ? `${summary.lastScore}%` : '-';
    const bestScoreText = summary.bestScore !== null ? `${summary.bestScore}%` : '-';
    const wrongCount = summary.activeWrongCount;

    sectionCardsHtml += `
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Section ${cfg.section}</span>
            <span class="text-xs font-medium ${isCompleted ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'} px-2 py-0.5 rounded-full">
              ${isCompleted ? '✓ 학습 완료' : `${summary.learnedCount}/${cfg.count} 단어`}
            </span>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">Section ${cfg.section}</h3>
          <p class="text-xs text-slate-500 mb-4 font-mono">단어 번호 ${cfg.range} (${cfg.count} Words)</p>

          <div class="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center mb-4 border border-slate-100">
            <div>
              <div class="text-[10px] text-slate-400 font-medium">최근 점수</div>
              <div class="text-xs font-bold ${summary.lastScore !== null ? 'text-indigo-600' : 'text-slate-400'}">${lastScoreText}</div>
            </div>
            <div>
              <div class="text-[10px] text-slate-400 font-medium">최고 점수</div>
              <div class="text-xs font-bold ${summary.bestScore !== null ? 'text-emerald-600' : 'text-slate-400'}">${bestScoreText}</div>
            </div>
            <div>
              <div class="text-[10px] text-slate-400 font-medium">오답</div>
              <div class="text-xs font-bold ${wrongCount > 0 ? 'text-rose-500' : 'text-slate-400'}">${wrongCount}개</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button class="btn-study-section px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1" data-section="${cfg.section}">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i> 학습
          </button>
          <button class="btn-test-section px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm" data-section="${cfg.section}">
            <i data-lucide="play" class="w-3.5 h-3.5"></i> 테스트
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="space-y-8 max-w-5xl mx-auto">
      <div class="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-2">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i> 대전대신고 2학년 단어장
              </span>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">영어 II Vocabulary Trainer</h1>
            </div>
            <div class="text-right">
              <span class="text-3xl sm:text-4xl font-black text-amber-300">${stats.progressPercent}%</span>
              <div class="text-xs text-indigo-200 font-medium">전체 학습 진행률</div>
            </div>
          </div>

          <div class="space-y-2 mb-6">
            <div class="flex justify-between text-xs font-medium text-indigo-200">
              <span>전체 ${stats.totalWords}단어 중 <strong>${stats.learnedWords}단어</strong> 학습 완료</span>
              <span>${stats.learnedWords} / ${stats.totalWords}</span>
            </div>
            <div class="w-full bg-indigo-950/60 rounded-full h-3.5 p-0.5 border border-indigo-700/50 overflow-hidden">
              <div class="bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-500" style="width: ${stats.progressPercent}%"></div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-lg font-black leading-tight">${stats.learnedWords}</div>
                <div class="text-[11px] text-indigo-200">학습 완료</div>
              </div>
            </div>

            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                <i data-lucide="alert-circle" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-lg font-black leading-tight">${stats.activeWrongCount}</div>
                <div class="text-[11px] text-indigo-200">오답 단어</div>
              </div>
            </div>

            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <i data-lucide="award" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-lg font-black leading-tight">${stats.masteredCount}</div>
                <div class="text-[11px] text-indigo-200">오답 졸업</div>
              </div>
            </div>

            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                <i data-lucide="bar-chart-2" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-lg font-black leading-tight">${stats.avgAccuracy}%</div>
                <div class="text-[11px] text-indigo-200">평균 정답률</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button class="nav-card text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group" data-route="study">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <i data-lucide="book-open" class="w-6 h-6"></i>
          </div>
          <h2 class="text-base font-bold text-slate-800 mb-1 flex items-center justify-between">
            단어 학습 <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all"></i>
          </h2>
          <p class="text-xs text-slate-500">Section별 단어 플래시카드 및 영영/예문 학습</p>
        </button>

        <button class="nav-card text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group" data-route="test">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <i data-lucide="edit-3" class="w-6 h-6"></i>
          </div>
          <h2 class="text-base font-bold text-slate-800 mb-1 flex items-center justify-between">
            단어 테스트 <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all"></i>
          </h2>
          <p class="text-xs text-slate-500">영영풀이, 예문빈칸, 한영/영한 4대 주관식 테스트</p>
        </button>

        <button class="nav-card text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-rose-300 transition-all group" data-route="wrong-notes">
          <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all relative">
            <i data-lucide="file-x-2" class="w-6 h-6"></i>
            ${stats.activeWrongCount > 0 ? `<span class="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full">${stats.activeWrongCount}</span>` : ''}
          </div>
          <h2 class="text-base font-bold text-slate-800 mb-1 flex items-center justify-between">
            오답노트 <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-rose-600 transition-all"></i>
          </h2>
          <p class="text-xs text-slate-500">틀린 단어 자동 수집, 맞춤 재시험 & 오답 졸업</p>
        </button>

        <button class="nav-card text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group" data-route="stats">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <i data-lucide="pie-chart" class="w-6 h-6"></i>
          </div>
          <h2 class="text-base font-bold text-slate-800 mb-1 flex items-center justify-between">
            학습 통계 <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all"></i>
          </h2>
          <p class="text-xs text-slate-500">섹션별 성적 분석 및 가장 많이 틀린 단어 TOP 10</p>
        </button>
      </div>

      <div class="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold flex items-center gap-2">
              <i data-lucide="zap" class="w-5 h-5 text-amber-400"></i> 빠른 범위 테스트
            </h2>
            <p class="text-xs text-slate-300">원하는 Section을 여러 개 선택하거나 전체 범위를 한 번에 시험 보세요.</p>
          </div>
          <div class="flex gap-2">
            <button id="btn-quick-select-all" class="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl transition-colors">전체 선택</button>
            <button id="btn-quick-clear-all" class="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl transition-colors">전체 해제</button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mb-4" id="quick-section-checkboxes">
          ${SECTION_CONFIG.map(cfg => `
            <label class="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-2.5 rounded-xl cursor-pointer border border-white/10 text-xs font-medium select-none transition-colors">
              <input type="checkbox" value="${cfg.section}" class="quick-sec-cb rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-white/20 border-transparent">
              <span>Sec ${cfg.section}</span>
            </label>
          `).join('')}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <span>테스트 방식:</span>
            <select id="quick-test-type" class="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="mixed" class="bg-slate-900 text-white">🔀 혼합 테스트 (강력 추천)</option>
              <option value="english_def" class="bg-slate-900 text-white">영영 풀이 → 단어</option>
              <option value="example_blank" class="bg-slate-900 text-white">예문 빈칸 → 단어</option>
              <option value="eng_to_kor" class="bg-slate-900 text-white">영어 단어 → 우리말 뜻</option>
              <option value="kor_to_eng" class="bg-slate-900 text-white">우리말 뜻 → 영어 단어</option>
            </select>
          </div>
          <button id="btn-start-quick-test" class="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:scale-105">
            <i data-lucide="play" class="w-4 h-4"></i> 선택한 범위로 시험 시작
          </button>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-800">단어장 Section (1~8)</h2>
            <p class="text-xs text-slate-500">10단어 단위로 구성된 섹션별 학습 및 테스트</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          ${sectionCardsHtml}
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.nav-card').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });

  container.querySelectorAll('.btn-study-section').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate('study', { section: parseInt(btn.dataset.section) });
    });
  });

  container.querySelectorAll('.btn-test-section').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate('test', { sections: [parseInt(btn.dataset.section)] });
    });
  });

  const cbList = container.querySelectorAll('.quick-sec-cb');
  const btnSelectAll = container.querySelector('#btn-quick-select-all');
  const btnClearAll = container.querySelector('#btn-quick-clear-all');
  const btnStartQuick = container.querySelector('#btn-start-quick-test');
  const quickTestType = container.querySelector('#quick-test-type');

  btnSelectAll?.addEventListener('click', () => cbList.forEach(cb => cb.checked = true));
  btnClearAll?.addEventListener('click', () => cbList.forEach(cb => cb.checked = false));

  btnStartQuick?.addEventListener('click', () => {
    const selectedSecs = Array.from(cbList).filter(cb => cb.checked).map(cb => parseInt(cb.value));
    if (selectedSecs.length === 0) {
      alert('테스트할 Section을 최소 하나 이상 선택해 주세요.');
      return;
    }
    navigate('test-active', {
      sections: selectedSecs,
      questionType: quickTestType.value,
      hideScore: false
    });
  });

  if (window.lucide) window.lucide.createIcons();
}