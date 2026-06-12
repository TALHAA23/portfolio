"use client";

import { Fragment } from "react";

/**
 * Renders text split into per-character spans (grouped by word so lines
 * never break mid-word). Chars start translated below their clip wrapper;
 * animate `.split-char` within a parent ref to reveal.
 */
export default function SplitText({ text, charClass = "" }) {
  const words = String(text).split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
            {[...word].map((ch, ci) => (
              <span
                key={ci}
                className={`split-char ${charClass}`}
                style={{ transform: "translateY(120%)" }}
              >
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
