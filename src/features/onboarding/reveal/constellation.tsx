// The quiet picture on the "Mapping your chart" screen: a thin circle, and a
// handful of points that appear one by one while a line slowly joins them up.
// Deliberately not a zodiac wheel or a starry sky. With reduced motion switched
// on, it simply shows the finished picture.

const points: [number, number][] = [
  [60, 62],
  [104, 40],
  [148, 70],
  [132, 118],
  [88, 104],
  [72, 148],
  [120, 162],
];

// pathLength="1" lets the drawing animation treat the whole line as length 1,
// however long it really is.
const line = `M${points.map(([x, y]) => `${x} ${y}`).join(" L")} M132 118 L120 162`;

export default function Constellation() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-52 w-52"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        strokeWidth="1"
        className="animate-breathe stroke-line motion-reduce:animate-none"
      />
      <path
        d={line}
        pathLength="1"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-line stroke-ink-soft/50 [stroke-dasharray:1] motion-reduce:animate-none"
      />
      {points.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="2.6"
          className="animate-star-in fill-ink [transform-box:fill-box] [transform-origin:center] motion-reduce:animate-none"
          style={{ animationDelay: `${index * 380}ms` }}
        />
      ))}
    </svg>
  );
}
