"use client";

import { useEffect, useState } from "react";

const phrases = [
  "vacations",
  "weekend trips",
  "campouts",
  "group dinners",
  "girls night",
  "family reunions",
  "road trips",
  "beach days",
  "ski trips",
  "birthday parties",
  "game nights",
  "potlucks",
];

export function CyclingText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setFade(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}
    >
      {phrases[index]}
    </span>
  );
}
