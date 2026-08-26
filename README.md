# 📚 영어 II Vocabulary Trainer

> 대전대신고등학교 2학년 영단어장 기반 영어 단어 학습 & 테스트 웹앱

**Made by 김민준** · 25_kmj0504@dshs.kr

---

## 🌐 사이트 바로가기

**👉 [vocab-trainer 바로 열기](https://[YOUR-GITHUB-USERNAME].github.io/vocab-trainer/)**

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📖 **단어 학습** | Section 1~8 플래시카드, 우리말 뜻 / 영영 풀이 / 예문 단계별 펼치기, TTS 발음 |
| ✏️ **4대 주관식 테스트** | 영영풀이→단어, 예문빈칸→단어, 영어→우리말, 우리말→영어 |
| 🔀 **혼합 테스트** | 4가지 유형 + 단어 순서 완전 무작위 셔플 |
| 📝 **자동 오답노트** | 틀린 단어 자동 누적, 누적 횟수·일시·유형 기록 |
| 🎓 **오답 졸업 시스템** | 연속 2회 정답 시 오답 졸업(Mastered) 처리 |
| 📊 **학습 통계** | 섹션별 성적, 가장 많이 틀린 단어 TOP 10 |
| ⌨️ **키보드 중심 조작** | Enter로 채점 및 다음 문제, ←/→로 단어 이동 |

---

## 📦 단어 데이터

- **총 77개 단어** (Section 1~7: 각 10단어, Section 8: 7단어)
- 각 단어: 영어 단어 + 우리말 뜻(품사 포함) + 영영 풀이 + 예시 문장
- 구동사/표현 포함: 	ake away, show off, e about to, ecognize ~ as ... 등

---

## 🚀 로컬에서 실행하기

`ash
git clone https://github.com/[YOUR-GITHUB-USERNAME]/vocab-trainer.git
cd vocab-trainer
python launch_server.py
`

혹은 index.html을 브라우저로 바로 열어도 됩니다.

---

## 🛠️ 기술 스택

- **Vanilla JS** (ES Modules, SPA 라우터)
- **Tailwind CSS** (CDN)
- **Lucide Icons** (CDN)
- **Web Speech API** (TTS 발음)
- **LocalStorage** (학습 데이터 영구 저장)
