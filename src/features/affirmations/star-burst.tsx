import type { CSSProperties } from "react";

// How far out each star flies (px) and where around the circle it goes. Fixed
// rather than random, so it looks the same (and balanced) every time.
const STARS = [
  { angle: -90, distance: 118, size: 14, delay: 0 },
  { angle: -58, distance: 100, size: 9, delay: 60 },
  { angle: -24, distance: 124, size: 12, delay: 30 },
  { angle: 8, distance: 104, size: 8, delay: 90 },
  { angle: 40, distance: 120, size: 13, delay: 20 },
  { angle: 72, distance: 98, size: 9, delay: 70 },
  { angle: 104, distance: 122, size: 11, delay: 40 },
  { angle: 138, distance: 102, size: 8, delay: 100 },
  { angle: 170, distance: 118, size: 13, delay: 10 },
  { angle: 202, distance: 100, size: 9, delay: 80 },
  { angle: 234, distance: 124, size: 11, delay: 50 },
];

// A four-pointed star, the same shape as the app's ✦ sign-off.
function Star({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 0c.6 5.6 3.4 8.4 12 12-8.6 3.6-11.4 6.4-12 12-.6-5.6-3.4-8.4-12-12 8.6-3.6 11.4-6.4 12-12Z"
        fill="var(--color-gold)"
      />
    </svg>
  );
}

// The moment a session is finished: gold stars scatter out from the centre of
// the ring and fade, over a soft gold glow. Plays once, then leaves nothing
// behind. Drawn over the counter, never catching taps, and skipped entirely
// for anyone who has asked their phone for less motion.
export default function StarBurst() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center motion-reduce:hidden">
      <span
        className="absolute h-52 w-52 animate-gold-glow rounded-full"
        style={{ background: "radial-gradient(circle, rgb(194 154 98 / 0.28), transparent 68%)" }}
      />
      {STARS.map((star, index) => {
        const radians = (star.angle * Math.PI) / 180;
        const style = {
          "--dx": `${Math.round(Math.cos(radians) * star.distance)}px`,
          "--dy": `${Math.round(Math.sin(radians) * star.distance)}px`,
          "--spin": `${index % 2 === 0 ? 90 : -90}deg`,
          animationDelay: `${star.delay}ms`,
        } as CSSProperties;
        return (
          <span key={index} className="absolute animate-star-burst" style={style}>
            <Star size={star.size} />
          </span>
        );
      })}
    </div>
  );
}
