"use client";

const items = [
  { emoji: "🍅", label: "Tomato" },
  { emoji: "🫑", label: "Pepper" },
  { emoji: "🧅", label: "Onion" },
  { emoji: "🌾", label: "Teff" },
];

export function FloatingProduce() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((item, i) => (
        <span
          key={item.label}
          className="absolute animate-floaty text-3xl opacity-80 drop-shadow-md sm:text-4xl"
          style={{
            left: `${18 + i * 20}%`,
            top: `${22 + (i % 2) * 18}%`,
            animationDelay: `${i * 0.35}s`,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
