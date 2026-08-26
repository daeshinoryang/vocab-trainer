import { getWordById } from '../data.js';
import { speakText } from '../app.js';

export function renderResult(container, navigate, params = {}) {
  const session = params.session;
  const record = params.record;

  if (!session || !record) {
    navigate('home');
    return;
  }

  const accuracy = record.accuracy;
  const wrongQuestions = session.questions.filter(q => !q.isCorrect);

  let scoreColorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (accuracy < 60) scoreColorClass = 'text-rose-600 bg-rose-50 border-rose-200';
  else if (accuracy < 80) scoreColorClass = 'text-amber-600 bg-amber-50 border-amber-200';

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-8">
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10 text-center space-y-6">
        <div class="space-y-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">
            TEST RESULT
          </span>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-800">${session.scopeLabel}</h1>
        </div>

        <div class="inline-block p-6 rounded-3xl border-2 ${scoreColorClass} shadow-sm">
          <div class="text-4xl sm:text-5xl font-black mb-1">${record.correctCount} / ${record.totalCount}</div>
          <div class="text-base font-extrabold">정답률 ${accuracy}%</div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-center">
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span class="text-[11px] text-slate-400 font-bold">정답 (Correct)</span>
            <div class="text-lg font-black text-emerald-600">${record.correctCount}개</div>
          </div>
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span class="text-[11px] text-slate-400 font-bold">오답 (Wrong)</span>
            <div class="text-lg font-black text-rose-500">${record.wrongCount}개</div>
          </div>
          <div class="col-span-2 sm:col-span-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span class="text-[11px] text-slate-400 font-bold">오답노트</span>
            <div class="text-xs font-extrabold text-indigo-600 mt-1">자동 저장 완료</div>
          </div>
        </div>

        ${wrongQuestions.length > 0 ? `
          <div class="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 text-left space-y-2">
            <div class="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <i data-lucide="alert-circle" class="w-4 h-4"></i> 틀린 단어 목록 (${wrongQuestions.length}개)
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${wrongQuestions.map(q => `
                <span class="px-2.5 py-1 bg-white text-rose-600 font-bold text-xs rounded-xl border border-rose-200 shadow-sm">
                  ${q.wordObj.word}
                </span>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-700 font-bold text-sm">
            🎉 축하합니다! 모든 문제를 완벽하게 맞혔습니다!
          </div>
        `}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          ${wrongQuestions.length > 0 ? `
            <button id="btn-retry-wrongs" class="py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> 틀린 문제만 다시 풀기
            </button>
          ` : ''}
          <button id="btn-retry-same" class="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5">
            <i data-lucide="repeat" class="w-3.5 h-3.5"></i> 같은 범위 다시 테스트
          </button>
          <button id="btn-go-wrong-notes" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5">
            <i data-lucide="file-x-2" class="w-3.5 h-3.5"></i> 오답노트 보러가기
          </button>
          <button id="btn-go-home" class="py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5">
            <i data-lucide="home" class="w-3.5 h-3.5"></i> 메인으로 돌아가기
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <i data-lucide="list-checks" class="w-5 h-5 text-indigo-600"></i> 문항별 상세 풀이 확인 (${session.questions.length}문항)
        </h3>

        <div class="space-y-3">
          ${session.questions.map((q, idx) => {
            const isCor = q.isCorrect;
            return `
              <div class="bg-white rounded-2xl p-5 border ${isCor ? 'border-slate-200' : 'border-rose-300 bg-rose-50/20'} shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg ${isCor ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} flex items-center justify-center text-xs font-black">
                      ${idx + 1}
                    </span>
                    <span class="text-xs font-bold text-slate-700">Section ${q.wordObj.section}</span>
                    <span class="text-xs font-bold ${isCor ? 'text-emerald-600' : 'text-rose-600'}">
                      ${isCor ? '✓ 정답' : '✕ 오답'}
                    </span>
                  </div>
                  <button class="btn-review-tts text-indigo-600 hover:text-indigo-800 p-1" data-word="${q.wordObj.word}" title="발음 듣기">
                    <i data-lucide="volume-2" class="w-4 h-4"></i>
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold">내 답:</span>
                    <div class="font-bold ${isCor ? 'text-emerald-700' : 'text-rose-600'}">${q.userAnswer || '(공백)'}</div>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold">정답:</span>
                    <div class="font-bold text-slate-800">${q.expectedAnswer}</div>
                  </div>
                </div>

                <div class="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <div class="flex items-center gap-2">
                    <strong class="text-slate-800 font-black text-sm">${q.wordObj.word}</strong>
                    <span class="text-indigo-600 font-bold">${q.wordObj.meaning}</span>
                  </div>
                  <div><span class="text-slate-400">Definition:</span> "${q.wordObj.english_def}"</div>
                  <div><span class="text-slate-400">Example:</span> ${q.wordObj.example}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-go-home')?.addEventListener('click', () => navigate('home'));
  container.querySelector('#btn-go-wrong-notes')?.addEventListener('click', () => navigate('wrong-notes'));

  container.querySelector('#btn-retry-same')?.addEventListener('click', () => {
    navigate('test', {
      sections: session.scopeSections,
      favoritesOnly: session.scopeLabel.includes('즐겨찾기'),
      wrongOnly: session.scopeLabel.includes('오답')
    });
  });

  container.querySelector('#btn-retry-wrongs')?.addEventListener('click', () => {
    const wrongWords = session.questions.filter(q => !q.isCorrect).map(q => q.wordObj);
    navigate('test-active', {
      words: wrongWords,
      scopeLabel: `틀린 단어 재시험 (${wrongWords.length}단어)`,
      testType: session.testType,
      hideScore: session.hideScore
    });
  });

  container.querySelectorAll('.btn-review-tts').forEach(btn => {
    btn.addEventListener('click', () => speakText(btn.dataset.word));
  });

  if (window.lucide) window.lucide.createIcons();
}