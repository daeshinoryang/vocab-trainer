/**
 * 스마트 주관식 답안 채점 엔진
 */

export function normalizeEnglish(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[\.,?!\"\'\`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeKorean(text) {
  if (!text) return "";
  return text
    .replace(/^[a-z]+\.\s*/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[~····\.\?\!,\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractKoreanKeywords(meaningStr) {
  if (!meaningStr) return [];
  const list = [];
  const cleaned = meaningStr.replace(/^[a-z]+\.\s*/gi, "").trim();
  const rawParts = cleaned.split(/[,\/\n;]/);
  
  for (let part of rawParts) {
    let p = part.trim();
    if (!p) continue;
    const noParen = p.replace(/\([^)]*\)/g, "").trim();
    if (noParen) list.push(noParen);
    if (p !== noParen) list.push(p);

    const strippedAffix = noParen.replace(/^(~을|~를|~에|~에도\s*불구하고|막\s*~하려|~을\s*···으로)\s*/, "").trim();
    if (strippedAffix) {
      list.push(strippedAffix);
      if (strippedAffix.endsWith("의")) list.push(strippedAffix.slice(0, -1).trim());
      if (strippedAffix.endsWith("하다")) list.push(strippedAffix.slice(0, -2).trim());
      if (strippedAffix.endsWith("되다")) list.push(strippedAffix.slice(0, -2).trim());
    }
  }

  const results = new Set();
  for (let item of list) {
    const norm = item.replace(/\s+/g, " ").trim();
    if (norm.length > 0) {
      results.add(norm);
      results.add(norm.replace(/\s+/g, ""));
    }
  }
  return Array.from(results);
}

export function getAcceptableEnglishAnswers(wordObj) {
  const answers = new Set();
  
  const add = (str) => {
    if (!str) return;
    const n = normalizeEnglish(str);
    if (n) {
      answers.add(n);
      answers.add(n.replace(/\s+/g, ""));
    }
  };

  add(wordObj.word);
  add(wordObj.masked_target);
  add(wordObj.base_word);
  add(wordObj.full_expression);

  const w = wordObj.word.toLowerCase();
  if (w.includes("take away")) {
    add("take away"); add("takeaway"); add("takes away"); add("took away"); add("taken away");
  } else if (w.includes("show off")) {
    add("show off"); add("showoff"); add("shows off"); add("showed off"); add("shown off");
  } else if (w.includes("be about to")) {
    add("be about to"); add("about to"); add("was about to"); add("is about to"); add("am about to"); add("are about to");
  } else if (w.includes("recognize ~ as")) {
    add("recognize as"); add("recognize ~ as ..."); add("recognize ~ as"); add("recognize"); add("recognized"); add("recognized as");
  } else if (w.includes("bring about")) {
    add("bring about"); add("brought about"); add("brings about");
  } else if (w.includes("be engaged with")) {
    add("be engaged with"); add("engaged with"); add("engage with"); add("is engaged with"); add("was engaged with");
  } else if (w === "emerge") {
    add("emerge"); add("emerged"); add("emerges");
  } else if (w === "found") {
    add("found"); add("founded"); add("founds");
  } else if (w === "extend") {
    add("extend"); add("extended"); add("extends");
  } else if (w === "chant") {
    add("chant"); add("chanted"); add("chants");
  } else if (w === "boast") {
    add("boast"); add("boasts"); add("boasted");
  } else if (w === "overcome") {
    add("overcome"); add("overcame"); add("overcomes");
  } else if (w === "emphasize") {
    add("emphasize"); add("emphasized"); add("emphasizes");
  } else if (w === "imply") {
    add("imply"); add("implied"); add("implies");
  } else if (w === "immigrant") {
    add("immigrant"); add("immigrants");
  } else if (w === "lyric") {
    add("lyric"); add("lyrics");
  } else if (w === "hardship") {
    add("hardship"); add("hardships");
  }

  return Array.from(answers);
}

export function evaluateAnswer(questionType, userAnswer, wordObj) {
  if (!userAnswer || !userAnswer.trim()) {
    return {
      isCorrect: false,
      userAnswer: "",
      expectedAnswer: questionType === 'eng_to_kor' ? wordObj.meaning : wordObj.word,
      feedback: "답안을 입력하지 않았습니다."
    };
  }

  const rawUser = userAnswer.trim();

  if (questionType === 'english_def' || questionType === 'example_blank' || questionType === 'kor_to_eng') {
    const userNorm = normalizeEnglish(rawUser);
    const userNoSpace = userNorm.replace(/\s+/g, "");
    const acceptable = getAcceptableEnglishAnswers(wordObj);

    const isMatch = acceptable.some(ans => {
      const ansNorm = normalizeEnglish(ans);
      const ansNoSpace = ansNorm.replace(/\s+/g, "");
      return userNorm === ansNorm || userNoSpace === ansNoSpace;
    });

    let expected = wordObj.word;
    if (questionType === 'example_blank' && wordObj.masked_target) {
      expected = `${wordObj.word} (문장 형태: ${wordObj.masked_target})`;
    }

    return {
      isCorrect: isMatch,
      userAnswer: rawUser,
      expectedAnswer: expected,
      feedback: isMatch ? "정답입니다!" : "오답입니다."
    };
  }

  if (questionType === 'eng_to_kor') {
    const userClean = normalizeKorean(rawUser);
    const userNoSpace = userClean.replace(/\s+/g, "");
    const keywords = extractKoreanKeywords(wordObj.meaning);

    let isMatch = false;

    for (let kw of keywords) {
      const kwClean = normalizeKorean(kw);
      const kwNoSpace = kwClean.replace(/\s+/g, "");

      if (userClean === kwClean || userNoSpace === kwNoSpace) {
        isMatch = true;
        break;
      }

      if (kwNoSpace.length >= 2 && userNoSpace.length >= 2) {
        if (kwNoSpace.includes(userNoSpace) || userNoSpace.includes(kwNoSpace)) {
          isMatch = true;
          break;
        }
      }
    }

    return {
      isCorrect: isMatch,
      userAnswer: rawUser,
      expectedAnswer: wordObj.meaning,
      feedback: isMatch ? "정답입니다!" : "오답입니다."
    };
  }

  return { isCorrect: false, userAnswer: rawUser, expectedAnswer: "", feedback: "알 수 없는 문제 유형" };
}