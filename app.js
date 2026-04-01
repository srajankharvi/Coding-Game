(function () {
  const REGISTRY_KEY = "coding-game-registry-v2";
  const SESSION_KEY = "coding-game-session-v1";
  const LEGACY_PROGRESS_KEY = "coding-game-progress-v1";
  const BATTLE_KEY = "coding-game-battle-v1";

  const BATTLE_PLAYER_MAX = 100;
  const BATTLE_DAMAGE_PLAYER_WRONG = 14;

  function battleChapterKey(divisionId, chapterId) {
    return `${divisionId}|${chapterId}`;
  }

  function loadBattleRoot() {
    try {
      const raw = localStorage.getItem(BATTLE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }

  function saveBattleRoot(root) {
    localStorage.setItem(BATTLE_KEY, JSON.stringify(root));
  }

  function getBattleState(username, divisionId, chapterId) {
    if (!username || !divisionId || !chapterId) return null;
    const root = loadBattleRoot();
    const u = root[username];
    if (!u || typeof u !== "object") return null;
    return u[battleChapterKey(divisionId, chapterId)] || null;
  }

  function setBattleState(username, divisionId, chapterId, state) {
    if (!username || !divisionId || !chapterId) return;
    const root = loadBattleRoot();
    if (!root[username] || typeof root[username] !== "object") root[username] = {};
    root[username][battleChapterKey(divisionId, chapterId)] = state;
    saveBattleRoot(root);
  }

  function isBossChapter(division, chapter) {
    const list = division && Array.isArray(division.chapters) ? division.chapters : [];
    if (list.length === 0) return false;
    return list[list.length - 1].id === chapter.id;
  }

  /**
   * One unique enemy per non-boss chapter (index = position in `challenges.js`; last chapter per language is the boss).
   */
  const REGULAR_ENEMIES_BY_DIVISION = {
    python: [
      { name: "Ninja Hattori", emoji: "🥷" },
      { name: "Zombie", emoji: "🧟‍♂️" },
      { name: "Monster Snake", emoji: "🐍" },
    ],
    c: [
      { name: "Jadugar", emoji: "👤" },
      { name: "Makdi Man", emoji: "🕷️" },
      { name: "Octopus", emoji: "🪼" },
    ],
    java: [
      { name: "Skeleton King", emoji: "☠️" },
      { name: "Dragon", emoji: "🐉" },
      { name: "Alien", emoji: "👽" },
    ],
  };

  function chapterIndexInDivision(division, chapter) {
    if (!division || !chapter || !Array.isArray(division.chapters)) return 0;
    const i = division.chapters.findIndex((ch) => ch.id === chapter.id);
    return i >= 0 ? i : 0;
  }

  function enemyDisplay(division, chapter, boss) {
    const divId = division && division.id;
    if (boss) {
      const m = {
        python: { name: "The Interpreter", emoji: "🐍" },
        c: { name: "Segmentation Fiend", emoji: "💀" },
        java: { name: "Garbage Colossus", emoji: "☕" },
      };
      return m[divId] || { name: "Final boss", emoji: "👹" };
    }
    const table = divId ? REGULAR_ENEMIES_BY_DIVISION[divId] : null;
    const idx = chapterIndexInDivision(division, chapter);
    if (table && table[idx]) return table[idx];
    if (table && table.length) return table[idx % table.length];
    return { name: "Syntax Sprite", emoji: "👾" };
  }

  function computeEnemyMaxHp(chapter, boss) {
    const n = Array.isArray(chapter && chapter.challenges) ? chapter.challenges.length : 1;
    if (boss) {
      return Math.min(320, 130 + 28 * n);
    }
    return Math.min(120, 42 + 12 * n);
  }

  function computeDamageToEnemy(enemyMaxHp, boss) {
    const hits = boss ? 8 : 5;
    return Math.max(16, Math.ceil(enemyMaxHp / hits));
  }

  function chapterFullySolved(chapter) {
    if (!chapter || !Array.isArray(chapter.challenges)) return false;
    if (chapter.challenges.length === 0) return true;
    return chapter.challenges.every((c) => progress.solved[c.id]);
  }

  function createFreshBattleState(enemyMax, playerMax) {
    return {
      playerHp: playerMax,
      playerMax,
      enemyHp: enemyMax,
      enemyMax,
      defeated: false,
      wiped: false,
    };
  }

  function ensureBattleState(username, division, chapter) {
    if (!username || !division || !chapter) return null;
    const boss = isBossChapter(division, chapter);
    const enemyMax = computeEnemyMaxHp(chapter, boss);
    const existing = getBattleState(username, division.id, chapter.id);

    if (chapterFullySolved(chapter)) {
      return {
        ...createFreshBattleState(enemyMax, BATTLE_PLAYER_MAX),
        defeated: true,
        enemyHp: 0,
        playerHp: BATTLE_PLAYER_MAX,
        wiped: false,
      };
    }

    if (existing && typeof existing.enemyMax === "number") {
      const rawEnemy = Number(existing.enemyHp);
      const enemyHpSafe = Number.isFinite(rawEnemy) ? Math.max(0, rawEnemy) : enemyMax;
      const merged = {
        playerHp: Math.min(BATTLE_PLAYER_MAX, Math.max(0, Number(existing.playerHp) || 0)),
        playerMax: BATTLE_PLAYER_MAX,
        enemyHp: enemyHpSafe,
        enemyMax: Math.max(enemyMax, Number(existing.enemyMax) || enemyMax),
        defeated: !!existing.defeated,
        wiped: !!existing.wiped,
      };
      if (merged.defeated) {
        merged.enemyHp = 0;
        merged.playerHp = Math.min(merged.playerMax, merged.playerHp || merged.playerMax);
      }
      if (!merged.defeated && merged.playerHp <= 0) {
        merged.wiped = true;
      }
      if (merged.wiped && !merged.defeated) {
        merged.playerHp = Math.min(merged.playerHp, merged.playerMax);
      }
      return merged;
    }

    return createFreshBattleState(enemyMax, BATTLE_PLAYER_MAX);
  }

  function applyBattleOnAnswer(username, division, chapter, state, correct) {
    if (!username || !state) return state;
    if (chapterFullySolved(chapter) || state.defeated) return state;
    const boss = isBossChapter(division, chapter);
    const dmg = computeDamageToEnemy(state.enemyMax, boss);
    const next = { ...state };
    if (correct) {
      next.enemyHp = Math.max(0, next.enemyHp - dmg);
      if (next.enemyHp <= 0) {
        next.enemyHp = 0;
        next.defeated = true;
      }
    } else {
      next.playerHp = Math.max(0, next.playerHp - BATTLE_DAMAGE_PLAYER_WRONG);
      if (next.playerHp <= 0) next.wiped = true;
    }
    setBattleState(username, division.id, chapter.id, next);
    return next;
  }

  function resetChapterBattle(username, division, chapter) {
    if (!username || !division || !chapter) return null;
    if (chapterFullySolved(chapter)) return ensureBattleState(username, division, chapter);
    const boss = isBossChapter(division, chapter);
    const enemyMax = computeEnemyMaxHp(chapter, boss);
    const fresh = createFreshBattleState(enemyMax, BATTLE_PLAYER_MAX);
    setBattleState(username, division.id, chapter.id, fresh);
    return fresh;
  }

  /**
   * Player level from total XP (stored as progress.exp). Each level needs more XP than the last.
   */
  function getLevelMeta(totalXp) {
    const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
    let level = 1;
    let floorXp = 0;
    let needForNext = 30;
    while (xp >= floorXp + needForNext) {
      floorXp += needForNext;
      level += 1;
      needForNext = Math.floor(30 + (level - 1) * 10);
    }
    const intoLevel = xp - floorXp;
    const expToNext = needForNext - intoLevel;
    const pct = needForNext > 0 ? Math.min(100, Math.round((intoLevel / needForNext) * 1000) / 10) : 100;
    return {
      level,
      xpIntoLevel: intoLevel,
      xpForLevel: needForNext,
      xpToNext: expToNext,
      pct,
      totalXp: xp,
    };
  }

  function normalizeAnswer(s) {
    if (typeof s !== "string") return "";
    return s
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.replace(/[ \t]+$/g, ""))
      .join("\n")
      .trim();
  }

  function answersMatch(userInput, challenge) {
    const u = normalizeAnswer(userInput);
    const candidates = [
      challenge.expectedAnswer,
      ...(challenge.acceptableAnswers || []),
    ].map(normalizeAnswer);
    return candidates.some((c) => c === u);
  }

  function loadRegistry() {
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      if (!raw) return { users: {} };
      const data = JSON.parse(raw);
      return { users: data.users && typeof data.users === "object" ? data.users : {} };
    } catch {
      return { users: {} };
    }
  }

  function saveRegistry(reg) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify({ users: reg.users }));
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return s && typeof s.username === "string" ? s : null;
    } catch {
      return null;
    }
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function userRecordToProgress(rec) {
    if (!rec) return { solved: {}, exp: 0, points: 0 };
    return {
      solved: rec.solved && typeof rec.solved === "object" ? rec.solved : {},
      exp: Number(rec.exp) || 0,
      points: Number(rec.points) || 0,
    };
  }

  function persistProgress(username) {
    const reg = loadRegistry();
    const existing = reg.users[username];
    if (!existing || typeof existing.password !== "string") return;
    reg.users[username] = {
      password: existing.password,
      exp: progress.exp,
      points: progress.points,
      solved: { ...progress.solved },
    };
    saveRegistry(reg);
  }

  function importLegacyProgressIfNeeded(username) {
    try {
      const raw = localStorage.getItem(LEGACY_PROGRESS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const reg = loadRegistry();
      const u = reg.users[username];
      if (!u) return;
      const hasAny = u.exp > 0 || Object.keys(u.solved || {}).length > 0;
      if (hasAny) return;
      const solved = data.solved || {};
      const exp = Number(data.exp) || 0;
      const points = Number(data.points) || 0;
      if (exp === 0 && Object.keys(solved).length === 0) return;
      u.solved = solved;
      u.exp = exp;
      u.points = points;
      saveRegistry(reg);
      localStorage.removeItem(LEGACY_PROGRESS_KEY);
    } catch {
      /* ignore */
    }
  }

  function renderMarkdownish(text) {
    const esc = (t) =>
      t
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const chunks = [];
    let rest = text;
    while (rest.length) {
      const fence = rest.indexOf("```");
      if (fence === -1) {
        chunks.push({ type: "text", content: rest });
        break;
      }
      if (fence > 0) chunks.push({ type: "text", content: rest.slice(0, fence) });
      rest = rest.slice(fence + 3);
      const lineBreak = rest.indexOf("\n");
      rest = lineBreak === -1 ? "" : rest.slice(lineBreak + 1);
      const close = rest.indexOf("```");
      if (close === -1) {
        chunks.push({ type: "code", content: rest.trimEnd() });
        break;
      }
      chunks.push({ type: "code", content: rest.slice(0, close).trimEnd() });
      rest = rest.slice(close + 3).replace(/^\n/, "");
    }
    return chunks
      .map((c) => {
        if (c.type === "code") {
          return `<pre class="prompt-block"><code>${esc(c.content)}</code></pre>`;
        }
        let h = esc(c.content);
        h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        h = h.replace(/`([^`]+)`/g, (_, inner) => `<code>${esc(inner)}</code>`);
        return h.replace(/\n/g, "<br>");
      })
      .join("");
  }

  const course = window.CODE_ARENA_COURSE || { divisions: [] };
  const challenges = window.CODING_CHALLENGES || [];
  let progress = { solved: {}, exp: 0, points: 0 };
  let currentId = null;
  let authMode = "login";
  /** Browse: null,null = pick language; division set = pick chapter; both set = pick challenge */
  let browseDivisionId = null;
  let browseChapterId = null;

  const el = {
    authView: document.getElementById("auth-view"),
    gameShell: document.getElementById("game-shell"),
    tabLogin: document.getElementById("tab-login"),
    tabRegister: document.getElementById("tab-register"),
    formLogin: document.getElementById("form-login"),
    formRegister: document.getElementById("form-register"),
    loginUser: document.getElementById("login-user"),
    loginPass: document.getElementById("login-pass"),
    regUser: document.getElementById("reg-user"),
    regPass: document.getElementById("reg-pass"),
    authMsgLogin: document.getElementById("auth-msg-login"),
    authMsgRegister: document.getElementById("auth-msg-register"),
    navChallenges: document.getElementById("nav-challenges"),
    navLeaderboard: document.getElementById("nav-leaderboard"),
    listView: document.getElementById("list-view"),
    listHeading: document.getElementById("list-heading"),
    listLead: document.getElementById("list-lead"),
    browseBackBtn: document.getElementById("browse-back-btn"),
    leaderboardView: document.getElementById("leaderboard-view"),
    leaderboardBody: document.getElementById("leaderboard-body"),
    leaderboardEmpty: document.getElementById("leaderboard-empty"),
    detailView: document.getElementById("detail-view"),
    challengeList: document.getElementById("challenge-list"),
    statLevel: document.getElementById("stat-level"),
    statLevelFill: document.getElementById("stat-level-fill"),
    statLevelSub: document.getElementById("stat-level-sub"),
    statLevelBar: document.getElementById("stat-level-bar"),
    statPoints: document.getElementById("stat-points"),
    sessionUser: document.getElementById("session-user"),
    btnLogout: document.getElementById("btn-logout"),
    backBtn: document.getElementById("back-btn"),
    detailTitle: document.getElementById("detail-title"),
    detailMeta: document.getElementById("detail-meta"),
    detailPrompt: document.getElementById("detail-prompt"),
    answerInput: document.getElementById("answer-input"),
    submitBtn: document.getElementById("submit-btn"),
    feedback: document.getElementById("feedback"),
    battleArena: document.getElementById("battle-arena"),
    battleChapterLabel: document.getElementById("battle-chapter-label"),
    battleBossTag: document.getElementById("battle-boss-tag"),
    heroHpFill: document.getElementById("hero-hp-fill"),
    heroHpText: document.getElementById("hero-hp-text"),
    heroHpBar: document.getElementById("hero-hp-bar"),
    enemyHpFill: document.getElementById("enemy-hp-fill"),
    enemyHpText: document.getElementById("enemy-hp-text"),
    enemyHpBar: document.getElementById("enemy-hp-bar"),
    enemyName: document.getElementById("enemy-name"),
    enemyAvatar: document.getElementById("enemy-avatar"),
    battleStatus: document.getElementById("battle-status"),
    battleRetryBtn: document.getElementById("battle-retry-btn"),
    feedbackRetryWrap: document.getElementById("feedback-retry-wrap"),
    feedbackRetryBtn: document.getElementById("feedback-retry-btn"),
  };

  function renderBattle(division, chapter, state) {
    if (!el.battleArena || !state) return;
    const boss = isBossChapter(division, chapter);
    const foe = enemyDisplay(division, chapter, boss);
    el.battleArena.classList.toggle("boss-arena", boss);
    el.battleBossTag.classList.toggle("hidden", !boss);
    el.battleChapterLabel.textContent = chapter
      ? `${division.name} · Level ${chapter.level}`
      : "";
    el.enemyName.textContent = foe.name;
    if (el.enemyAvatar) el.enemyAvatar.textContent = foe.emoji;

    const pMax = Math.max(1, state.playerMax);
    const eMax = Math.max(1, state.enemyMax);
    const pHp = Math.max(0, state.playerHp);
    const eHp = state.defeated ? 0 : Math.max(0, state.enemyHp);
    const pPct = Math.min(100, Math.round((pHp / pMax) * 1000) / 10);
    const ePct = state.defeated ? 0 : Math.min(100, Math.round((eHp / eMax) * 1000) / 10);

    el.heroHpFill.style.width = `${pPct}%`;
    el.enemyHpFill.style.width = `${ePct}%`;
    el.heroHpText.textContent = `${Math.round(pHp)} / ${pMax}`;
    el.enemyHpText.textContent = state.defeated ? `0 / ${eMax} (defeated)` : `${Math.round(eHp)} / ${eMax}`;

    el.heroHpBar.setAttribute("aria-valuemax", String(pMax));
    el.heroHpBar.setAttribute("aria-valuenow", String(Math.round(pHp)));
    el.enemyHpBar.setAttribute("aria-valuemax", String(eMax));
    el.enemyHpBar.setAttribute("aria-valuenow", String(Math.round(eHp)));

    el.battleStatus.classList.remove("win", "lose");
    const cleared = chapterFullySolved(chapter);
    if (cleared || state.defeated) {
      el.battleStatus.classList.add("win");
      el.battleStatus.textContent = cleared
        ? "Level cleared — you conquered this arena!"
        : `You defeated ${foe.name}! Keep solving to mop up XP.`;
    } else if (!state.defeated && pHp <= 0) {
      el.battleStatus.classList.add("lose");
      el.battleStatus.textContent =
        "You're out of HP — tap Retry fight below to reset your HP and the enemy for this level.";
    } else {
      el.battleStatus.textContent = boss
        ? "Boss HP is massive — chain correct answers to win."
        : "Correct answers hurt the enemy. Wrong answers hurt you.";
    }

    const outOfHp = !cleared && !state.defeated && pHp <= 0;
    el.battleRetryBtn.classList.toggle("hidden", !outOfHp);
    if (el.feedbackRetryWrap) el.feedbackRetryWrap.classList.toggle("hidden", !outOfHp);
    el.submitBtn.disabled = !!outOfHp;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function showAuthMessage(form, text, isError) {
    const node = form === "login" ? el.authMsgLogin : el.authMsgRegister;
    node.textContent = text;
    node.classList.remove("hidden", "ok", "bad");
    node.classList.add(isError ? "bad" : "ok");
  }

  function clearAuthMessages() {
    [el.authMsgLogin, el.authMsgRegister].forEach((n) => {
      n.textContent = "";
      n.classList.add("hidden");
      n.classList.remove("ok", "bad");
    });
  }

  function setAuthMode(mode) {
    authMode = mode;
    const isLogin = mode === "login";
    el.tabLogin.classList.toggle("active", isLogin);
    el.tabRegister.classList.toggle("active", !isLogin);
    el.formLogin.classList.toggle("hidden", !isLogin);
    el.formRegister.classList.toggle("hidden", isLogin);
    clearAuthMessages();
  }

  function enterGame(username) {
    importLegacyProgressIfNeeded(username);
    const reg = loadRegistry();
    progress = userRecordToProgress(reg.users[username]);

    el.authView.classList.add("hidden");
    el.gameShell.classList.remove("hidden");
    el.sessionUser.textContent = username;
    updateStats();
    showChallengesSection();
    renderLeaderboard();
  }

  function leaveGame() {
    clearSession();
    el.gameShell.classList.add("hidden");
    el.authView.classList.remove("hidden");
    currentId = null;
    setAuthMode("login");
  }

  function updateStats() {
    const m = getLevelMeta(progress.exp);
    el.statLevel.textContent = String(m.level);
    el.statLevelFill.style.width = `${m.pct}%`;
    el.statLevelBar.setAttribute("aria-valuenow", String(Math.round(m.pct)));
    el.statLevelBar.setAttribute("aria-valuemax", "100");
    el.statLevelSub.textContent = `${m.xpIntoLevel} / ${m.xpForLevel} XP → level ${m.level + 1}`;
    el.statPoints.textContent = String(progress.points);
  }

  function showChallengesSection() {
    el.navChallenges.classList.add("active");
    el.navLeaderboard.classList.remove("active");
    el.listView.classList.remove("hidden");
    el.leaderboardView.classList.add("hidden");
    el.detailView.classList.add("hidden");
    currentId = null;
    resetBrowse();
    renderBrowse();
  }

  function showLeaderboardSection() {
    el.navLeaderboard.classList.add("active");
    el.navChallenges.classList.remove("active");
    el.listView.classList.add("hidden");
    el.leaderboardView.classList.remove("hidden");
    el.detailView.classList.add("hidden");
    currentId = null;
    renderLeaderboard();
  }

  function solvedCount(solved) {
    return Object.keys(solved || {}).filter((k) => solved[k]).length;
  }

  function getDivision(divId) {
    return course.divisions.find((d) => d.id === divId) || null;
  }

  function getChapter(divId, chapterId) {
    const div = getDivision(divId);
    if (!div) return null;
    const ch = div.chapters.find((c) => c.id === chapterId);
    return ch ? { division: div, chapter: ch } : null;
  }

  function findChallengeContext(challengeId) {
    for (const div of course.divisions) {
      for (const ch of div.chapters) {
        const c = ch.challenges.find((x) => x.id === challengeId);
        if (c) return { division: div, chapter: ch, challenge: c };
      }
    }
    return null;
  }

  /** Next challenge in course order (within chapter → next chapters → next divisions), or null */
  function getNextChallengeId(currentId) {
    const ctx = findChallengeContext(currentId);
    if (!ctx) return null;
    const { division, chapter } = ctx;
    const idx = chapter.challenges.findIndex((x) => x.id === currentId);
    if (idx === -1) return null;
    if (idx + 1 < chapter.challenges.length) {
      return chapter.challenges[idx + 1].id;
    }
    const chIdx = division.chapters.findIndex((ch) => ch.id === chapter.id);
    for (let i = chIdx + 1; i < division.chapters.length; i++) {
      const nextCh = division.chapters[i];
      if (nextCh.challenges && nextCh.challenges.length > 0) {
        return nextCh.challenges[0].id;
      }
    }
    const divIdx = course.divisions.findIndex((d) => d.id === division.id);
    for (let d = divIdx + 1; d < course.divisions.length; d++) {
      const div = course.divisions[d];
      for (const ch of div.chapters || []) {
        if (ch.challenges && ch.challenges.length > 0) {
          return ch.challenges[0].id;
        }
      }
    }
    return null;
  }

  function syncBrowseToChallenge(challengeId) {
    const ctx = findChallengeContext(challengeId);
    if (!ctx) return;
    browseDivisionId = ctx.division.id;
    browseChapterId = ctx.chapter.id;
  }

  function solvedInChallengeList(chList) {
    let n = 0;
    chList.forEach((c) => {
      if (progress.solved[c.id]) n += 1;
    });
    return n;
  }

  function resetBrowse() {
    browseDivisionId = null;
    browseChapterId = null;
  }

  function renderLeaderboard() {
    const reg = loadRegistry();
    const names = Object.keys(reg.users);
    if (names.length === 0) {
      el.leaderboardBody.innerHTML = "";
      el.leaderboardEmpty.classList.remove("hidden");
      return;
    }
    el.leaderboardEmpty.classList.add("hidden");
    const sess = getSession();
    const rows = names
      .map((name) => {
        const u = reg.users[name];
        const p = userRecordToProgress(u);
        const lv = getLevelMeta(p.exp);
        return {
          name,
          exp: p.exp,
          level: lv.level,
          points: p.points,
          nSolved: solvedCount(p.solved),
        };
      })
      .sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        if (b.exp !== a.exp) return b.exp - a.exp;
        if (b.points !== a.points) return b.points - a.points;
        return a.name.localeCompare(b.name);
      });

    el.leaderboardBody.innerHTML = rows
      .map((r, i) => {
        const rank = i + 1;
        const you = sess && r.name === sess.username ? ' class="lb-you"' : "";
        return `<tr${you}><td>${rank}</td><td>${escapeHtml(r.name)}</td><td><strong>${r.level}</strong></td><td>${r.points}</td><td>${r.nSolved}/${challenges.length}</td></tr>`;
      })
      .join("");
  }

  function renderBrowse() {
    el.challengeList.innerHTML = "";

    if (!browseDivisionId) {
      el.browseBackBtn.classList.add("hidden");
      el.listHeading.textContent = "Choose a language";
      el.listLead.classList.add("hidden");
      el.listLead.textContent = "";
      course.divisions.forEach((div) => {
        const total = div.chapters.reduce((s, ch) => s + ch.challenges.length, 0);
        const done = div.chapters.reduce((s, ch) => s + solvedInChallengeList(ch.challenges), 0);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "card card-division";
        btn.dataset.lang = div.id;
        btn.innerHTML = `
          <div class="card-header">
            <span class="card-title">${escapeHtml(div.name)}</span>
            <span class="badge">${done}/${total} solved</span>
          </div>
          <p class="card-desc">${escapeHtml(div.tagline)}</p>
        `;
        btn.addEventListener("click", () => {
          browseDivisionId = div.id;
          browseChapterId = null;
          renderBrowse();
        });
        el.challengeList.appendChild(btn);
      });
      return;
    }

    const div = getDivision(browseDivisionId);
    if (!div) {
      resetBrowse();
      renderBrowse();
      return;
    }

    if (!browseChapterId) {
      el.browseBackBtn.classList.remove("hidden");
      el.browseBackBtn.textContent = "← All languages";
      el.listHeading.textContent = div.name;
      el.listLead.textContent = div.tagline;
      el.listLead.classList.remove("hidden");
      div.chapters.forEach((ch) => {
        const total = ch.challenges.length;
        const done = solvedInChallengeList(ch.challenges);
        const complete = done === total && total > 0;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "card card-chapter" + (complete ? " done" : "");
        btn.innerHTML = `
          <div class="card-header">
            <span class="card-title">Level ${ch.level} — ${escapeHtml(ch.title)}</span>
            <span class="badge ${complete ? "solved" : ""}">${done}/${total}</span>
          </div>
          <p class="card-desc">${escapeHtml(ch.blurb)}</p>
        `;
        btn.addEventListener("click", () => {
          browseChapterId = ch.id;
          renderBrowse();
        });
        el.challengeList.appendChild(btn);
      });
      return;
    }

    const pair = getChapter(browseDivisionId, browseChapterId);
    if (!pair) {
      browseChapterId = null;
      renderBrowse();
      return;
    }

    const ch = pair.chapter;
    el.browseBackBtn.classList.remove("hidden");
    el.browseBackBtn.textContent = "← Chapters";
    el.listHeading.textContent = `Level ${ch.level} — ${ch.title}`;
    el.listLead.textContent = ch.blurb;
    el.listLead.classList.remove("hidden");

    ch.challenges.forEach((c) => {
      const solved = !!progress.solved[c.id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card" + (solved ? " done" : "");
      btn.innerHTML = `
        <div class="card-header">
          <span class="card-title">${escapeHtml(c.title)}</span>
          <span class="badge ${solved ? "solved" : ""}">${solved ? "Solved" : `+${c.exp} XP · ${c.points} pts`}</span>
        </div>
        <p class="card-desc">${escapeHtml(c.description)}</p>
      `;
      btn.addEventListener("click", () => openChallenge(c.id));
      el.challengeList.appendChild(btn);
    });
  }

  function openChallenge(id) {
    const c = challenges.find((x) => x.id === id);
    if (!c) return;
    currentId = id;
    el.listView.classList.add("hidden");
    el.leaderboardView.classList.add("hidden");
    el.detailView.classList.remove("hidden");
    el.detailTitle.textContent = c.title;
    const ctx = findChallengeContext(id);
    el.detailMeta.textContent = ctx
      ? `${ctx.division.name} · Level ${ctx.chapter.level} — ${ctx.chapter.title}`
      : c.description;
    el.detailPrompt.innerHTML = renderMarkdownish(c.question);
    el.answerInput.value = "";
    el.feedback.classList.add("hidden");
    el.feedback.textContent = "";
    el.submitBtn.disabled = false;
    const already = !!progress.solved[c.id];
    el.submitBtn.textContent = already ? "Submit again (no extra rewards)" : "Submit answer";
    el.backBtn.textContent = ctx ? `← Level ${ctx.chapter.level} — ${ctx.chapter.title}` : "← Back";

    const sess = getSession();
    if (sess && ctx) {
      const had = getBattleState(sess.username, ctx.division.id, ctx.chapter.id);
      const st = ensureBattleState(sess.username, ctx.division, ctx.chapter);
      if (!had && !chapterFullySolved(ctx.chapter)) {
        setBattleState(sess.username, ctx.division.id, ctx.chapter.id, st);
      }
      renderBattle(ctx.division, ctx.chapter, st);
    }
  }

  function closeDetail() {
    currentId = null;
    el.detailView.classList.add("hidden");
    el.listView.classList.remove("hidden");
    el.navChallenges.classList.add("active");
    el.navLeaderboard.classList.remove("active");
    renderBrowse();
  }

  function submitAnswer() {
    const sess = getSession();
    if (!sess) return;
    const c = challenges.find((x) => x.id === currentId);
    if (!c) return;
    const ctx = findChallengeContext(currentId);
    let battleSnap = sess && ctx ? ensureBattleState(sess.username, ctx.division, ctx.chapter) : null;

    if (
      battleSnap &&
      !battleSnap.defeated &&
      battleSnap.playerHp <= 0 &&
      ctx &&
      !chapterFullySolved(ctx.chapter)
    ) {
      el.feedback.classList.remove("hidden", "ok", "bad");
      el.feedback.classList.add("bad");
      el.feedback.textContent =
        "You're out of HP. Use the green “Retry fight” button under the battle bars to try again.";
      renderBattle(ctx.division, ctx.chapter, battleSnap);
      return;
    }

    const input = el.answerInput.value;
    const ok = answersMatch(input, c);
    el.feedback.classList.remove("hidden", "ok", "bad");

    if (ok) {
      el.feedback.classList.add("ok");
      const wasNew = !progress.solved[c.id];
      let justDefeated = false;
      if (sess && ctx && battleSnap) {
        const wasDef = battleSnap.defeated;
        battleSnap = applyBattleOnAnswer(sess.username, ctx.division, ctx.chapter, battleSnap, true);
        justDefeated = !wasDef && battleSnap.defeated;
        renderBattle(ctx.division, ctx.chapter, battleSnap);
      }
      if (wasNew) {
        progress.solved[c.id] = true;
        progress.exp += c.exp;
        progress.points += c.points;
        persistProgress(sess.username);
        updateStats();
      }
      const nextId = getNextChallengeId(c.id);
      if (nextId) {
        el.submitBtn.disabled = true;
        let msg = wasNew ? "Correct! XP applied — loading next question…" : "Correct — next question…";
        if (justDefeated) msg += " Enemy defeated!";
        el.feedback.textContent = msg;
        syncBrowseToChallenge(nextId);
        window.setTimeout(() => {
          openChallenge(nextId);
        }, 400);
      } else {
        el.submitBtn.textContent = wasNew ? "Submit again (no extra rewards)" : "Submit answer";
        let msg = wasNew
          ? "Correct! XP applied. That was the last question in the course."
          : "Correct! That was the last question in the course.";
        if (justDefeated) msg += " Enemy defeated!";
        el.feedback.textContent = msg;
      }
    } else {
      el.feedback.classList.add("bad");
      el.feedback.textContent =
        "Not quite. Double-check spacing, exact output, and the format your answer expects.";
      if (sess && ctx && battleSnap) {
        battleSnap = applyBattleOnAnswer(sess.username, ctx.division, ctx.chapter, battleSnap, false);
        renderBattle(ctx.division, ctx.chapter, battleSnap);
        if (!battleSnap.defeated && battleSnap.playerHp <= 0) {
          el.feedback.textContent =
            "That cost you HP — you're at 0. Tap Retry fight (under the battle bars or below) to reset and keep playing.";
        }
      }
    }
  }

  function tryLogin(username, password) {
    const reg = loadRegistry();
    const u = reg.users[username];
    if (!u) {
      showAuthMessage("login", "Unknown username.", true);
      return;
    }
    if (u.password !== password) {
      showAuthMessage("login", "Wrong password.", true);
      return;
    }
    setSession(username);
    enterGame(username);
  }

  function tryRegister(username, password) {
    const reg = loadRegistry();
    if (reg.users[username]) {
      showAuthMessage("register", "That username is already taken.", true);
      return;
    }
    reg.users[username] = {
      password,
      exp: 0,
      points: 0,
      solved: {},
    };
    saveRegistry(reg);
    setSession(username);
    enterGame(username);
  }

  el.tabLogin.addEventListener("click", () => setAuthMode("login"));
  el.tabRegister.addEventListener("click", () => setAuthMode("register"));

  el.formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = el.loginUser.value.trim();
    const p = el.loginPass.value;
    if (u.length < 2) {
      showAuthMessage("login", "Username is too short.", true);
      return;
    }
    tryLogin(u, p);
  });

  el.formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = el.regUser.value.trim();
    const p = el.regPass.value;
    if (!/^[a-zA-Z0-9_]+$/.test(u)) {
      showAuthMessage("register", "Username: letters, numbers, underscore only.", true);
      return;
    }
    if (u.length < 2 || u.length > 24) {
      showAuthMessage("register", "Username must be 2–24 characters.", true);
      return;
    }
    if (p.length < 4) {
      showAuthMessage("register", "Password must be at least 4 characters.", true);
      return;
    }
    tryRegister(u, p);
  });

  el.btnLogout.addEventListener("click", () => {
    const sess = getSession();
    if (sess) persistProgress(sess.username);
    leaveGame();
  });

  el.navChallenges.addEventListener("click", () => {
    showChallengesSection();
  });

  el.navLeaderboard.addEventListener("click", () => {
    showLeaderboardSection();
  });

  el.browseBackBtn.addEventListener("click", () => {
    if (browseChapterId) browseChapterId = null;
    else if (browseDivisionId) browseDivisionId = null;
    renderBrowse();
  });

  el.backBtn.addEventListener("click", closeDetail);
  el.submitBtn.addEventListener("click", submitAnswer);
  el.answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAnswer();
  });

  function retryCurrentChapterFight() {
    const sess = getSession();
    if (!sess || !currentId) return;
    const ctx = findChallengeContext(currentId);
    if (!ctx) return;
    const st = resetChapterBattle(sess.username, ctx.division, ctx.chapter);
    if (st) {
      renderBattle(ctx.division, ctx.chapter, st);
      el.feedback.classList.add("hidden");
      el.feedback.textContent = "";
    }
  }

  el.battleRetryBtn.addEventListener("click", retryCurrentChapterFight);
  if (el.feedbackRetryBtn) el.feedbackRetryBtn.addEventListener("click", retryCurrentChapterFight);

  const sess = getSession();
  if (sess && loadRegistry().users[sess.username]) {
    enterGame(sess.username);
  } else {
    if (sess) clearSession();
    el.authView.classList.remove("hidden");
    el.gameShell.classList.add("hidden");
    setAuthMode("login");
  }
})();
