import {
  getRoundLabel,
} from "../lib/knockoutBracket";

const TBD = "TBD";

function displayName(name) {
  if (!name || name === TBD) return TBD;
  return name;
}

function TeamSlot({
  name,
  isWinner,
  isLoser,
  isTbd,
  isBye,
  canPick,
  onPick,
}) {
  const label = isBye ? "BYE" : displayName(name);

  if (canPick && !isBye) {
    return (
      <button
        type="button"
        className={`bracket-team ${isWinner ? "bracket-team--winner" : ""} ${
          isLoser ? "bracket-team--loser" : ""
        } ${isTbd ? "bracket-team--tbd" : ""}`}
        onClick={onPick}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={`bracket-team bracket-team--static ${isWinner ? "bracket-team--winner" : ""} ${
        isLoser ? "bracket-team--loser" : ""
      } ${isTbd ? "bracket-team--tbd" : ""} ${isBye ? "bracket-team--bye" : ""}`}
    >
      {label}
    </div>
  );
}

function BracketMatch({ match, matchIndex, onSelectWinner, onUndo }) {
  const hasBye = match.teamB === "BYE";
  const slotA = (match.teamA || "").trim();
  const slotB = (match.teamB || "").trim();
  const teamA = slotA || TBD;
  const teamB = hasBye ? TBD : slotB || TBD;
  const ready = Boolean(slotA && slotB && !hasBye);
  const decided = Boolean(match.winner);
  const waiting = !ready && !hasBye;

  return (
    <div
      className={`bracket-match ${decided ? "bracket-match--done" : ""} ${
        waiting ? "bracket-match--waiting" : ""
      } ${ready && !decided ? "bracket-match--ready" : ""}`}
    >
      <span className="bracket-match__index">M{matchIndex + 1}</span>
      <div className="bracket-match__teams">
        <TeamSlot
          name={teamA}
          isWinner={match.winner === slotA}
          isLoser={decided && match.winner !== slotA && slotA}
          isTbd={teamA === TBD}
          isBye={false}
          canPick={ready && !decided}
          onPick={() => onSelectWinner(slotA)}
        />
        <span className="bracket-match__vs">vs</span>
        <TeamSlot
          name={hasBye ? "—" : teamB}
          isWinner={match.winner === slotB}
          isLoser={decided && match.winner !== slotB && slotB}
          isTbd={!hasBye && teamB === TBD}
          isBye={hasBye}
          canPick={ready && !decided}
          onPick={() => onSelectWinner(slotB)}
        />
      </div>
      {hasBye && match.winner && (
        <p className="bracket-match__note">Advances automatically</p>
      )}
      {waiting && (
        <p className="bracket-match__note">Waiting for previous winners</p>
      )}
      {decided && !hasBye && (
        <button
          type="button"
          className="bracket-match__undo btn-undo"
          onClick={onUndo}
        >
          Undo
        </button>
      )}
    </div>
  );
}

export default function KnockoutBracket({ rounds, onSelectWinner, onUndoWinner }) {
  if (!rounds?.length) return null;

  const totalRounds = rounds.length;

  return (
    <div className="bracket-tree" role="tree" aria-label="Knockout bracket">
      <div className="bracket-tree__track">
        {rounds.map((round, roundIndex) => {
          const isLast = roundIndex === totalRounds - 1;
          return (
            <div
              key={roundIndex}
              className="bracket-tree__round"
              style={{ "--round-index": roundIndex }}
              role="group"
              aria-label={getRoundLabel(roundIndex, totalRounds, round.length)}
            >
              <h3 className="bracket-tree__round-label">
                {getRoundLabel(roundIndex, totalRounds, round.length)}
              </h3>
              <div className="bracket-tree__slots">
                {round.map((match, matchIndex) => (
                  <div
                    key={match.id}
                    className="bracket-tree__slot"
                    style={{ "--round-index": roundIndex }}
                  >
                    {!isLast && <span className="bracket-tree__connector" aria-hidden="true" />}
                    <BracketMatch
                      match={match}
                      matchIndex={matchIndex}
                      onSelectWinner={(winner) =>
                        onSelectWinner(roundIndex, match.id, winner)
                      }
                      onUndo={() => onUndoWinner(roundIndex, match.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
