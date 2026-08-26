import { store } from '../store.js';
import { SECTION_CONFIG, TOTAL_WORDS_COUNT } from '../data.js';
import { speakText, showWordDetailModal } from '../app.js';

export function renderStats(container, navigate) {
  const stats = store.getOverallStats();
  const testRecords = store.getTestRecords();

  const rankIcons = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10'];

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="flex items-center justify-between">
        <button id="btn-stats-back" class="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors">
          <i data-lucide="chevron-left" class="w-4 h-4"></i> 메인으로
        </button>
        <h1 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <i data-lucide="bar-chart-2" class="w-6 h-6 text-indigo-600"></i> 학습 통계 & 성적 분석
        </h1>
        <div class="w-16"></div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span class="text-[11px] text-slate-400 font-bold">전체 단어</span>
          <div class="text-xl font-black text-slate-800 mt-1">${stats.totalWords}개</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span class="text-[11px] text-slate-400 font-bold">학습 완료</span>
          <div class="text-xl font-black text-emerald-600 mt-1">${stats.learnedWords}개</div>
          <span class="text-[10px] text-slate-400">${stats.progressPercent}%</span>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span class="text-[11px] text-slate-400 font-bold">오답 단어</span>
          <div class="text-xl font-black text-rose-500 mt-1">${stats.activeWrongCount}개</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span class="text-[11px] text-slate-400 font-bold">오답 졸업</span>
          <div class="text-xl font-black text-amber-500 mt-1">${stats.masteredCount}개</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span class="text-[11px] text-slate-400 font-bold">총 시험 횟수</span>
          <div class="text-xl font-black text-indigo-600 mt-1">${stats.totalTests}회</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span class="text-[11px] text-slate-400 font-bold">평균 정답률</span>
          <div class="text-xl font-black text-indigo-900 mt-1">${stats.avgAccuracy}%</div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <i data-lucide="layers" class="w-5 h-5 text-indigo-600"></i> Section별 학습 및 테스트 성적
        </h3>

        <div class="space-y-3">
          ${SECTION_CONFIG.map(cfg => {
            const summary = store.getSectionSummary(cfg.section);
            const completionRate = Math.round((summary.learnedCount / cfg.count) * 100);
            const scoreDisplay = summary.lastScore !== null ? `최근 ${summary.lastScore}% / 최고 ${summary.bestScore}%` : '시험 기록 없음';

            return `
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-800">Section ${cfg.section}</span>
                    <span class="text-slate-400 font-mono">(${cfg.range})</span>
                  </div>
                  <div class="text-slate-600 font-medium">
                    <span class="font-bold text-indigo-600">${scoreDisplay}</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between text-[11px] text-slate-500">
                    <span>학습 완료: ${summary.learnedCount}/${cfg.count}단어 (${completionRate}%)</span>
                    <span>오답: <strong class="${summary.activeWrongCount > 0 ? 'text-rose-500' : 'text-slate-400'}">${summary.activeWrongCount}개</strong></span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-600 h-full rounded-full transition-all duration-300" style="width: ${completionRate}%"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <i data-lucide="flame" class="w-5 h-5 text-rose-500"></i> 가장 많이 틀린 단어 TOP 10
          </h3>
          <span class="text-xs text-slate-400">클릭 시 단어 상세 확인</span>
        </div>

        ${stats.top10Wrongs.length > 0 ? `
          <div class="space-y-2.5">
            ${stats.top10Wrongs.map((item, idx) => {
              const maxWrong = stats.top10Wrongs[0].wrongCount || 1;
              const barPercent = Math.round((item.wrongCount / maxWrong) * 100);
              const rank = rankIcons[idx] || `${idx + 1}`;

              return `
                <div class="btn-top-word p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between gap-4 group" data-id="${item.wordId}">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="w-7 h-7 rounded-xl bg-white text-slate-700 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                      ${rank}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <strong class="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">${item.wordObj.word}</strong>
                        <span class="text-[11px] text-slate-500 truncate">${item.wordObj.meaning}</span>
                      </div>
                      <div class="text-[10px] text-slate-400">Section ${item.section}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 shrink-0">
                    <div class="w-24 sm:w-32 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                      <div class="bg-rose-500 h-full rounded-full" style="width: ${barPercent}%"></div>
                    </div>
                    <span class="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                      ${item.wrongCount}회 오답
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="p-8 text-center text-slate-400 text-xs">
            아직 오답 기록이 없습니다. 테스트를 치르면 취약한 단어가 이곳에 분석됩니다.
          </div>
        `}
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <i data-lucide="history" class="w-5 h-5 text-indigo-600"></i> 최근 테스트 기록 (${testRecords.length}회)
        </h3>

        ${testRecords.length > 0 ? `
          <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            ${testRecords.slice(0, 15).map(rec => `
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div class="space-y-0.5">
                  <div class="font-bold text-slate-800">${rec.title}</div>
                  <div class="text-[10px] text-slate-400">${rec.date} ${rec.time || ''}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <div class="font-black ${rec.accuracy >= 80 ? 'text-emerald-600' : 'text-rose-500'}">${rec.accuracy}%</div>
                    <div class="text-[10px] text-slate-400">${rec.correctCount}/${rec.totalCount} 정답</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="p-8 text-center text-slate-400 text-xs">
            아직 테스트 기록이 없습니다.
          </div>
        `}
      </div>

      <div class="bg-slate-900 text-white p-6 rounded-3xl space-y-4">
        <h3 class="text-sm font-extrabold flex items-center gap-2">
          <i data-lucide="database" class="w-4 h-4 text-indigo-400"></i> 학습 데이터 백업 및 관리
        </h3>
        <p class="text-xs text-slate-300">현재까지 학습한 진행률, 오답노트, 테스트 기록을 파일로 내보내거나 복원할 수 있습니다.</p>

        <div class="flex flex-wrap gap-2 pt-2">
          <button id="btn-export-json" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> 백업 파일 다운로드 (JSON)
          </button>
          <label class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="upload" class="w-3.5 h-3.5"></i> 백업 파일 복원
            <input type="file" id="input-import-json" accept=".json" class="hidden">
          </label>
          <button id="btn-reset-data" class="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ml-auto">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> 전체 데이터 초기화
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-stats-back')?.addEventListener('click', () => navigate('home'));

  container.querySelectorAll('.btn-top-word').forEach(btn => {
    btn.addEventListener('click', () => showWordDetailModal(btn.dataset.id));
  });

  container.querySelector('#btn-export-json')?.addEventListener('click', () => {
    const json = store.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const importInput = container.querySelector('#input-import-json');
  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = store.importBackup(event.target.result);
      if (res.success) {
        alert('성공적으로 데이터를 복원했습니다.');
        renderStats(container, navigate);
      } else {
        alert('데이터 복원에 실패했습니다: ' + res.error);
      }
    };
    reader.readAsText(file);
  });

  container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
    if (confirm('정말로 모든 학습 기록, 오답노트, 테스트 결과를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      store.resetAllData();
      alert('모든 데이터가 초기화되었습니다.');
      renderStats(container, navigate);
    }
  });

  if (window.lucide) window.lucide.createIcons();
}