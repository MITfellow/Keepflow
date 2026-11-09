"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = glowRef.current;
    if (!node) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reduceMotion.matches) return;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const render = () => {
      frame = 0;
      node.style.setProperty("--cursor-x", `${nextX}px`);
      node.style.setProperty("--cursor-y", `${nextY}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      nextX = event.clientX;
      nextY = event.clientY;
      node.dataset.visible = "true";

      if (frame === 0) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const hide = () => {
      node.dataset.visible = "false";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
