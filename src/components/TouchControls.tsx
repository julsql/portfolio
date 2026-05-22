type Dir = "up" | "down" | "left" | "right";

interface Props {
  onMove: (dir: Dir) => void;
}

/** On-screen D-pad for touch devices. Hidden on pointer:fine screens via CSS. */
export default function TouchControls({ onMove }: Props) {
  const press = (dir: Dir) => (e: React.PointerEvent) => {
    e.preventDefault();
    onMove(dir);
  };
  return (
    <div className="dpad" aria-hidden="true">
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
  );
}
