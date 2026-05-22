type Dir = "up" | "down" | "left" | "right";

interface Props {
  onMove: (dir: Dir) => void;
  onAttack?: () => void;
}

/** On-screen D-pad (+ optional attack button) for touch devices. */
export default function TouchControls({ onMove, onAttack }: Props) {
  const press = (dir: Dir) => (e: React.PointerEvent) => {
    e.preventDefault();
    onMove(dir);
  };
  return (
    <div className="touch" aria-hidden="true">
      <div className="dpad">
        <button className="dpad-btn up" onPointerDown={press("up")}>
          ▲
        </button>
        <button className="dpad-btn left" onPointerDown={press("left")}>
          ◀
        </button>
        <button className="dpad-btn right" onPointerDown={press("right")}>
          ▶
        </button>
        <button className="dpad-btn down" onPointerDown={press("down")}>
          ▼
        </button>
      </div>
      {onAttack && (
        <button
          className="attack-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            onAttack();
          }}
        >
          ⚔
        </button>
      )}
    </div>
  );
}
