import { VOCABULARY_DATA, SECTION_CONFIG, getWordsBySections, getWordById } from '../data.js';
import { store } from '../store.js';
import { evaluateAnswer } from '../evaluator.js';
import { speakText } from '../app.js';

export function renderTest(container, navigate, params = {}) {
  if (params.activeSession) {
    runActiveTest(container, navigate, params.activeSession);
    return;
  }
  renderTestSetup(container, navigate, params);
}

function renderTestSetup(container, navigate, params) {
  const initialSections = params.sections || [1];
  const isFavOnly = params.favoritesOnly === true;
  const isWrongOnly = params.wrongOnly === true;

  const favCount = store.getFavoriteIds().length;
  const wrongCount = store.getActiveWrongList().length;

  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <button id="btn-setup-back" class="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors">
          <i data-lucide="chevron-left" class="w-4 h-4"></i> 메인으로
        </button>
        <h2 class="text-base font-extrabold text-slate-800">단어 테스트 설정</h2>
        <div class="w-16"></div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">1</span>
              테스트 범위 선택
            </h3>
            <div class="flex items-center gap-2">
              <button id="btn-select-all-sec" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800">전체 선택</button>
              <span class="text-slate-300 text-xs">|</span>
              <button id="btn-clear-all-sec" class="text-xs font-semibold text-slate-400 hover:text-slate-600">해제</button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3" id="sec-checkbox-grid">
            ${SECTION_CONFIG.map(cfg => {
              const checked = !isFavOnly && !isWrongOnly && initialSections.includes(cfg.section);
              return `
                <label class="flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all ${checked ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'} hover:border-indigo-400">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" value="${cfg.section}" class="sec-cb rounded text-indigo-600 focus:ring-0 focus:ring-offset-0" ${checked ? 'checked' : ''}>
                    <span class="text-xs font-semibold">Section ${cfg.section}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-mono">${cfg.count}단어</span>
                </label>
              `;
            }).join('')}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <label class="flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all ${isFavOnly ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'} hover:border-amber-400">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="cb-fav-only" class="rounded text-amber-500 focus:ring-0" ${isFavOnly ? 'checked' : ''} ${favCount === 0 ? 'disabled' : ''}>
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <i data-lucide="star" class="w-3.5 h-3.5 text-amber-500 fill-current"></i> 즐겨찾기 단어만
                </span>
              </div>
              <span class="text-[11px] font-bold ${favCount > 0 ? 'text-amber-600' : 'text-slate-400'}">${favCount}단어</span>
            </label>

            <label class="flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all ${isWrongOnly ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'} hover:border-rose-400">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="cb-wrong-only" class="rounded text-rose-500 focus:ring-0" ${isWrongOnly ? 'checked' : ''} ${wrongCount === 0 ? 'disabled' : ''}>
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-500"></i> 오답노트 단어만
                </span>
              </div>
              <span class="text-[11px] font-bold ${wrongCount > 0 ? 'text-rose-600' : 'text-slate-400'}">${wrongCount}단어</span>
            </label>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">2</span>
            테스트 유형 선택 (주관식)
          </h3>

          <div class="space-y-2.5" id="test-type-options">
            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer transition-colors">
              <input type="radio" name="test-type" value="mixed" checked class="mt-1 text-indigo-600 focus:ring-0">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-indigo-900">🔀 혼합 테스트 (강력 추천)</span>
                  <span class="text-[10px] font-extrabold bg-indigo-600 text-white px-1.5 py-0.5 rounded">RANDOM</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">4가지 문제 유형(영영, 예문, 영한, 한영)과 단어 순서가 무작위로 섞여 출제됩니다.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="radio" name="test-type" value="english_def" class="mt-1 text-indigo-600 focus:ring-0">
              <div class="flex-1">
                <span class="text-xs font-bold text-slate-800">A. 영영 풀이 → 영어 단어 맞히기</span>
                <p class="text-[11px] text-slate-500 mt-0.5">영어 뜻 설명을 읽고 해당하는 영어 단어를 직접 입력합니다.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="radio" name="test-type" value="example_blank" class="mt-1 text-indigo-600 focus:ring-0">
              <div class="flex-1">
                <span class="text-xs font-bold text-slate-800">B. 예문 빈칸 → 영어 단어 맞히기</span>
                <p class="text-[11px] text-slate-500 mt-0.5">예시 문장 속 빈칸(________)에 알맞은 영어 단어/구동사를 입력합니다.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="radio" name="test-type" value="eng_to_kor" class="mt-1 text-indigo-600 focus:ring-0">
              <div class="flex-1">
                <span class="text-xs font-bold text-slate-800">C. 영어 단어 → 우리말 뜻 맞히기</span>
                <p class="text-[11px] text-slate-500 mt-0.5">제시된 영어 단어의 우리말 뜻을 입력합니다. (핵심 뜻 포함 시 정답 인정)</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="radio" name="test-type" value="kor_to_eng" class="mt-1 text-indigo-600 focus:ring-0">
              <div class="flex-1">
                <span class="text-xs font-bold text-slate-800">D. 우리말 뜻 → 영어 단어 맞히기</span>
                <p class="text-[11px] text-slate-500 mt-0.5">우리말 뜻을 보고 해당하는 영어 단어를 직접 입력합니다.</p>
              </div>
            </label>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
            <input type="checkbox" id="cb-hide-score" class="rounded text-indigo-600 focus:ring-0" ${store.getSettings().hideScoreDuringTest ? 'checked' : ''}>
            <span>시험 중 점수 비공개 (결과 화면에서만 표시)</span>
          </label>
        </div>

        <button id="btn-start-test-run" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2">
          <i data-lucide="play" class="w-4 h-4"></i> 테스트 시작하기
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-setup-back')?.addEventListener('click', () => navigate('home'));

  const secCbs = container.querySelectorAll('.sec-cb');
  const favCb = container.querySelector('#cb-fav-only');
  const wrongCb = container.querySelector('#cb-wrong-only');
  const btnSelectAll = container.querySelector('#btn-select-all-sec');
  const btnClearAll = container.querySelector('#btn-clear-all-sec');

  favCb?.addEventListener('change', () => {
    if (favCb.checked) {
      if (wrongCb) wrongCb.checked = false;
      secCbs.forEach(cb => cb.checked = false);
    }
  });

  wrongCb?.addEventListener('change', () => {
    if (wrongCb.checked) {
      if (favCb) favCb.checked = false;
      secCbs.forEach(cb => cb.checked = false);
    }
  });

  secCbs.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (favCb) favCb.checked = false;
        if (wrongCb) wrongCb.checked = false;
      }
    });
  });

  btnSelectAll?.addEventListener('click', () => {
    if (favCb) favCb.checked = false;
    if (wrongCb) wrongCb.checked = false;
    secCbs.forEach(cb => cb.checked = true);
  });

  btnClearAll?.addEventListener('click', () => {
    secCbs.forEach(cb => cb.checked = false);
  });

  container.querySelector('#btn-start-test-run')?.addEventListener('click', () => {
    const isFav = favCb?.checked;
    const isWr = wrongCb?.checked;
    let targetWords = [];
    let scopeLabel = '';
    let scopeSections = [];

    if (isFav) {
      targetWords = store.getFavoriteWords();
      scopeLabel = `즐겨찾기 단어 (${targetWords.length}단어)`;
    } else if (isWr) {
      targetWords = store.getActiveWrongList().map(i => i.wordObj);
      scopeLabel = `오답노트 단어 (${targetWords.length}단어)`;
    } else {
      const selectedSecs = Array.from(secCbs).filter(cb => cb.checked).map(cb => parseInt(cb.value));
      if (selectedSecs.length === 0) {
        alert('테스트할 Section을 최소 하나 이상 선택해 주세요.');
        return;
      }
      targetWords = getWordsBySections(selectedSecs);
      scopeSections = selectedSecs;
      scopeLabel = selectedSecs.length === 8 ? '전체 범위 (77단어)' : `Section ${selectedSecs.join(', ')}`;
    }

    if (targetWords.length === 0) {
      alert('테스트할 단어가 없습니다.');
      return;
    }

    const testType = container.querySelector('input[name="test-type"]:checked')?.value || 'mixed';
    const hideScore = container.querySelector('#cb-hide-score')?.checked || false;

    const session = createTestSession({
      words: targetWords,
      scopeLabel,
      scopeSections,
      testType,
      hideScore
    });

    runActiveTest(container, navigate, session);
  });

  if (window.lucide) window.lucide.createIcons();
}

function createTestSession({ words, scopeLabel, scopeSections, testType, hideScore }) {
  const shuffledWords = [...words];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  const typesPool = ['english_def', 'example_blank', 'eng_to_kor', 'kor_to_eng'];

  const questions = shuffledWords.map((wordObj, idx) => {
    let qType = testType;
    if (testType === 'mixed') {
      qType = typesPool[Math.floor(Math.random() * typesPool.length)];
    }
    return {
      index: idx,
      wordId: wordObj.id,
      wordObj,
      questionType: qType,
      userAnswer: null,
      isCorrect: null,
      feedback: null,
      expectedAnswer: null
    };
  });

  return {
    scopeLabel,
    scopeSections,
    testType,
    hideScore,
    questions,
    currentIndex: 0,
    correctCount: 0,
    wrongCount: 0,
    startTime: Date.now()
  };
}

function runActiveTest(container, navigate, session) {
  let isAnswerSubmitted = false;
  let nextKeyHandler = null;

  function cleanupNextKeyHandler() {
    if (nextKeyHandler) {
      window.removeEventListener('keydown', nextKeyHandler);
      nextKeyHandler = null;
    }
  }

  function renderQuestion() {
    cleanupNextKeyHandler();

    if (session.currentIndex >= session.questions.length) {
      finishTest(session, navigate);
      return;
    }

    const q = session.questions[session.currentIndex];
    const total = session.questions.length;
    const currNum = session.currentIndex + 1;
    const progressPercent = Math.round((session.currentIndex / total) * 100);

    let typeBadge = '';
    let promptTitle = '';
    let promptContent = '';
    let inputPlaceholder = '';

    if (q.questionType === 'english_def') {
      typeBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">영영 풀이</span>`;
      promptTitle = 'English Definition';
      promptContent = `"${q.wordObj.english_def}"`;
      inputPlaceholder = '영어 단어를 입력하세요 (예: recession)';
    } else if (q.questionType === 'example_blank') {
      typeBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">예문 빈칸</span>`;
      promptTitle = 'Fill in the Blank';
      
      let maskedSentence = q.wordObj.example;
      if (q.wordObj.masked_target) {
        const regex = new RegExp(`(${q.wordObj.masked_target})`, 'gi');
        maskedSentence = maskedSentence.replace(regex, '<span class="px-2 py-0.5 bg-amber-100 text-amber-900 font-black rounded border border-amber-300 underline tracking-wider font-mono">________</span>');
      } else {
        const regex = new RegExp(`(${q.wordObj.word})`, 'gi');
        maskedSentence = maskedSentence.replace(regex, '<span class="px-2 py-0.5 bg-amber-100 text-amber-900 font-black rounded border border-amber-300 underline tracking-wider font-mono">________</span>');
      }
      promptContent = maskedSentence;
      inputPlaceholder = '빈칸에 들어갈 영어 단어/표현을 입력하세요';
    } else if (q.questionType === 'eng_to_kor') {
      typeBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">영어 → 우리말</span>`;
      promptTitle = 'English Word';
      promptContent = `
        <div class="flex items-center justify-center gap-3">
          <span class="text-3xl font-black text-slate-800">${q.wordObj.word}</span>
          <button id="btn-prompt-tts" class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center" title="발음 듣기">
            <i data-lucide="volume-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      inputPlaceholder = '우리말 뜻을 입력하세요 (예: 경기 침체)';
    } else if (q.questionType === 'kor_to_eng') {
      typeBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">우리말 → 영어</span>`;
      promptTitle = '우리말 뜻';
      promptContent = `<span class="text-2xl font-black text-slate-800">${q.wordObj.meaning}</span>`;
      inputPlaceholder = '영어 단어를 입력하세요 (예: recession)';
    }

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold text-slate-800">${session.scopeLabel}</span>
              ${typeBadge}
            </div>
            <div class="flex items-center gap-3">
              ${!session.hideScore ? `
                <div class="text-xs font-bold text-slate-500">
                  <span class="text-emerald-600">✓ ${session.correctCount}</span> / 
                  <span class="text-rose-500">✕ ${session.wrongCount}</span>
                </div>
              ` : ''}
              <span class="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                ${currNum} / ${total}
              </span>
            </div>
          </div>

          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-indigo-600 h-full rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
          <div class="text-center space-y-3">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">${promptTitle}</span>
            <div class="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed py-2">
              ${promptContent}
            </div>
          </div>

          <form id="form-test-input" class="space-y-4" onsubmit="return false;">
            <div class="relative">
              <input type="text" id="test-answer-input" 
                class="w-full px-5 py-4 text-base sm:text-lg font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                placeholder="${inputPlaceholder}" 
                autocomplete="off" 
                autocorrect="off" 
                autocapitalize="off" 
                spellcheck="false">
            </div>

            <button type="submit" id="btn-submit-answer" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              답안 제출 (Enter)
            </button>
          </form>

          <div id="feedback-container" class="space-y-4 hidden"></div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#test-answer-input');
    const formEl = container.querySelector('#form-test-input');
    const btnSubmit = container.querySelector('#btn-submit-answer');
    const feedbackEl = container.querySelector('#feedback-container');
    const btnPromptTts = container.querySelector('#btn-prompt-tts');

    setTimeout(() => inputEl?.focus(), 50);

    btnPromptTts?.addEventListener('click', () => speakText(q.wordObj.word));

    const handleFormSubmit = () => {
      if (isAnswerSubmitted) return;

      const userAns = inputEl.value;
      const evalResult = evaluateAnswer(q.questionType, userAns, q.wordObj);

      q.userAnswer = userAns;
      q.isCorrect = evalResult.isCorrect;
      q.feedback = evalResult.feedback;
      q.expectedAnswer = evalResult.expectedAnswer;

      if (evalResult.isCorrect) {
        session.correctCount++;
      } else {
        session.wrongCount++;
      }

      store.recordAnswerResult(q.wordObj.id, q.questionType, evalResult.isCorrect, userAns);

      isAnswerSubmitted = true;
      inputEl.disabled = true;
      btnSubmit.classList.add('hidden');

      const goToNext = () => {
        cleanupNextKeyHandler();
        session.currentIndex++;
        isAnswerSubmitted = false;
        renderQuestion();
      };

      showImmediateFeedback(q, evalResult, feedbackEl, goToNext);

      // Enter key anywhere during feedback screen automatically advances to next question!
      nextKeyHandler = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          goToNext();
        }
      };
      window.addEventListener('keydown', nextKeyHandler);
    };

    formEl?.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmit();
    });

    btnSubmit?.addEventListener('click', (e) => {
      e.preventDefault();
      handleFormSubmit();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  container._cleanup = () => {
    cleanupNextKeyHandler();
  };

  renderQuestion();
}

function showImmediateFeedback(question, evalResult, container, onNext) {
  const isCorrect = evalResult.isCorrect;
  const wordObj = question.wordObj;

  container.classList.remove('hidden');
  container.classList.add('block');

  container.innerHTML = `
    <div class="rounded-2xl p-5 border ${isCorrect ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'} space-y-4 animate-in fade-in duration-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 font-black text-base ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}">
          <i data-lucide="${isCorrect ? 'check-circle-2' : 'x-circle'}" class="w-6 h-6"></i>
          <span>${isCorrect ? '✓ Correct! 정답입니다!' : '✕ Incorrect 오답입니다'}</span>
        </div>
        <button id="btn-feedback-tts" class="w-8 h-8 rounded-lg bg-white/80 text-slate-700 hover:bg-white flex items-center justify-center shadow-sm" title="발음 듣기">
          <i data-lucide="volume-2" class="w-4 h-4"></i>
        </button>
      </div>

      ${!isCorrect ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80 p-3 rounded-xl border border-rose-100 text-xs">
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase">Your Answer</span>
            <div class="font-bold text-rose-600">${evalResult.userAnswer || '(공백)'}</div>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase">Correct Answer</span>
            <div class="font-bold text-emerald-700">${evalResult.expectedAnswer}</div>
          </div>
        </div>
      ` : ''}

      <div class="bg-white/90 p-4 rounded-xl border border-slate-200/60 space-y-2 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="text-base font-black text-slate-800">${wordObj.word}</span>
          <span class="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">${wordObj.meaning}</span>
        </div>
        <div>
          <span class="font-bold text-slate-400 uppercase text-[10px]">English Definition</span>
          <p class="text-slate-700 font-medium">${wordObj.english_def}</p>
        </div>
        <div>
          <span class="font-bold text-slate-400 uppercase text-[10px]">Example</span>
          <p class="text-slate-700 font-medium">${wordObj.example}</p>
        </div>
      </div>

      <button id="btn-feedback-next" class="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]">
        다음 문제 (Enter) <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  const btnNext = container.querySelector('#btn-feedback-next');
  const btnTts = container.querySelector('#btn-feedback-tts');

  btnTts?.addEventListener('click', () => speakText(wordObj.word));
  btnNext?.addEventListener('click', (e) => {
    e.preventDefault();
    onNext();
  });
  
  setTimeout(() => btnNext?.focus(), 50);

  if (window.lucide) window.lucide.createIcons();
}

function finishTest(session, navigate) {
  const total = session.questions.length;
  const correct = session.correctCount;
  const wrong = session.wrongCount;
  const accuracy = Math.round((correct / total) * 100);
  const wrongWordIds = session.questions.filter(q => !q.isCorrect).map(q => q.wordId);

  const record = store.saveTestSession({
    title: session.scopeLabel,
    scopeSections: session.scopeSections,
    questionType: session.testType,
    totalCount: total,
    correctCount: correct,
    wrongCount: wrong,
    accuracy,
    wrongWordIds,
    questions: session.questions.map(q => ({
      wordId: q.wordId,
      questionType: q.questionType,
      userAnswer: q.userAnswer,
      expectedAnswer: q.expectedAnswer,
      isCorrect: q.isCorrect
    }))
  });

  navigate('result', { session, record });
}