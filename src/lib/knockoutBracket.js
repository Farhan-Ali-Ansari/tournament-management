/** Build full knockout tree with empty future slots that fill as winners advance. */

function cloneRounds(rounds) {
  return rounds.map((round) => round.map((m) => ({ ...m })));
}

export function advanceWinner(rounds, roundIndex, matchIndex, winner) {
  const nextRound = roundIndex + 1;
  if (!rounds[nextRound] || !winner) return;
  const nextMatchIndex = Math.floor(matchIndex / 2);
  const slot = matchIndex % 2 === 0 ? "teamA" : "teamB";
  rounds[nextRound][nextMatchIndex][slot] = winner;
}

export function replayAdvances(rounds) {
  const updated = cloneRounds(rounds);

  // Keep user-picked winners on rounds 1+; only rebuild who feeds into each slot.
  const preservedWinners = updated.map((round) =>
    round.map((match) => match.winner)
  );

  for (let r = 1; r < updated.length; r++) {
    updated[r] = updated[r].map((match, matchIndex) => ({
      ...match,
      teamA: "",
      teamB: "",
      winner: preservedWinners[r][matchIndex],
    }));
  }

  for (let r = 0; r < updated.length; r++) {
    updated[r].forEach((match, matchIndex) => {
      let winner = match.winner;
      if (!winner && match.teamB === "BYE" && match.teamA) {
        match.winner = match.teamA;
        winner = match.teamA;
      }
      if (winner) advanceWinner(updated, r, matchIndex, winner);
    });
  }

  return updated;
}

/** Build knockout tree from user-defined first-round pairings. */
export function buildBracketFromRound0(round0Matches) {
  if (!round0Matches?.length) return [];

  const round0 = round0Matches.map((m, i) => ({
    id: m.id || `r0-m${i}`,
    teamA: m.teamA || "",
    teamB: m.teamB || "",
    winner: m.winner || "",
  }));

  const rounds = [round0];
  let matchCount = round0.length;

  let roundIdx = 1;
  while (matchCount > 1) {
    const nextCount = Math.ceil(matchCount / 2);
    const round = [];
    for (let m = 0; m < nextCount; m++) {
      round.push({
        id: `r${roundIdx}-m${m}`,
        teamA: "",
        teamB: "",
        winner: "",
      });
    }
    rounds.push(round);
    matchCount = nextCount;
    roundIdx += 1;
  }

  return replayAdvances(rounds);
}

export function buildFullBracket(teams) {
  const names = teams.map((t) => t.name);
  if (names.length < 2) return [];

  const shuffled = [...names].sort(() => Math.random() - 0.5);
  let bracketSize = 1;
  while (bracketSize < names.length) bracketSize *= 2;

  const slots = Array(bracketSize).fill(null);
  shuffled.forEach((name, i) => {
    slots[i] = name;
  });

  const rounds = [];
  let matchCount = bracketSize / 2;

  const round0 = [];
  for (let m = 0; m < matchCount; m++) {
    const teamA = slots[m * 2];
    const teamB = slots[m * 2 + 1];
    if (teamA && teamB) {
      round0.push({
        id: `r0-m${m}`,
        teamA,
        teamB,
        winner: "",
      });
    } else if (teamA) {
      round0.push({
        id: `r0-m${m}`,
        teamA,
        teamB: "BYE",
        winner: teamA,
      });
    } else if (teamB) {
      round0.push({
        id: `r0-m${m}`,
        teamA: teamB,
        teamB: "BYE",
        winner: teamB,
      });
    } else {
      round0.push({
        id: `r0-m${m}`,
        teamA: "",
        teamB: "",
        winner: "",
      });
    }
  }
  rounds.push(round0);

  matchCount /= 2;
  let roundIdx = 1;
  while (matchCount >= 1) {
    const round = [];
    for (let m = 0; m < matchCount; m++) {
      round.push({
        id: `r${roundIdx}-m${m}`,
        teamA: "",
        teamB: "",
        winner: "",
      });
    }
    rounds.push(round);
    matchCount = Math.floor(matchCount / 2);
    roundIdx += 1;
  }

  return replayAdvances(rounds);
}

export function setMatchWinner(rounds, roundIndex, matchId, winner) {
  const updated = cloneRounds(rounds);
  const matchIndex = updated[roundIndex].findIndex((m) => m.id === matchId);
  if (matchIndex < 0) return updated;

  updated[roundIndex][matchIndex].winner = winner;
  return replayAdvances(updated);
}

export function clearMatchWinner(rounds, roundIndex, matchId) {
  const updated = cloneRounds(rounds);
  const matchIndex = updated[roundIndex].findIndex((m) => m.id === matchId);
  if (matchIndex < 0) return updated;

  updated[roundIndex][matchIndex].winner = "";
  return replayAdvances(updated);
}

export function getRoundLabel(roundIndex, totalRounds, matchCount) {
  if (matchCount === 1 && roundIndex === totalRounds - 1) return "Final";
  if (matchCount === 2 && roundIndex === totalRounds - 2) return "Semi-final";
  if (matchCount === 4 && roundIndex === totalRounds - 3) return "Quarter-final";
  return `Round ${roundIndex + 1}`;
}

export function getChampion(rounds) {
  const final = rounds.at(-1);
  if (!final || final.length !== 1) return null;
  return final[0].winner || null;
}
