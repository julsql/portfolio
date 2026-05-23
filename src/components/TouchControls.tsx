type Dir = "up" | "down" | "left" | "right";

interface Props {
  onMove: (dir: Dir) => void;
  onAttack?: () => void;
  onShoot?: () => void;
  onBomb?: () => void;
}

/** On-screen D-pad + optional combat buttons for touch devices. */
export default function TouchControls({ onMove, onAttack, onShoot, onBomb }: Props) {
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
      <div className="action-stack">
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
        {onShoot && (
          <button
            className="attack-btn bow-btn"
            onPointerDown={(e) => {
              e.preventDefault();
              onShoot();
            }}
          >
            🏹
          </button>
        )}
        {onBomb && (
          <button
            className="attack-btn bomb-btn"
            onPointerDown={(e) => {
              e.preventDefault();
              onBomb();
            }}
          >
            💣
          </button>
        )}
      </div>
    </div>
  );
}
