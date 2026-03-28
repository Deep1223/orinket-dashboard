import React, { useEffect, useRef } from 'react';

const G = 52;
const CX = 160, CY = 118;
const T = 56;
const MOVE_MS = 380;
const WAIT_MS = 90;
const FADE_MS = 1800;
const HOLD_MS = 2500;

const POS = [
  { x: CX, y: CY - G * 1.73 },
  { x: CX - G, y: CY - G * 0.87 },
  { x: CX + G, y: CY - G * 0.87 },
  { x: CX - G * 2, y: CY },
  { x: CX, y: CY },
  { x: CX + G * 2, y: CY },
  { x: CX - G, y: CY + G * 0.87 },
  { x: CX + G, y: CY + G * 0.87 },
];

const CHAIN_POS = [5, 2, 0, 1, 3, 6, 4, 7];

const THEMES = [
  ['#C8006E', '#CC0078', '#D40082', '#DC008C', '#E400A0', '#EC00AA', '#F200B4', '#F500BE'],
  ['#5A00B4', '#6400BC', '#6E00C4', '#7800CC', '#8200D4', '#8C00DC', '#9600E4', '#A000EC'],
  ['#1260B0', '#1870C0', '#1E82D2', '#2494E4', '#3AAAF5', '#55BCF7', '#78CEF9', '#A0E0FB'],
];

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16)
];

const lerpRgb = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

const rgbStr = ([r, g, b]) => `rgb(${r},${g},${b})`;

const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const TileLoader = () => {
  const sceneRef = useRef(null);
  const tileRefs = useRef([]);
  const stateRef = useRef({
    themeIdx: 0,
    liveColors: THEMES[0].map(hexToRgb),
    slotContent: [null, 0, 1, 2, 3, 4, 5, 6],
    emptySlot: 0,
    isFading: false,
    fadeStart: null,
    fadeFrom: null,
    fadeTo: null,
  });

  useEffect(() => {
    const state = stateRef.current;
    let fadeTimeout;
    let stepTimeout;
    let animationFrameId;

    const startFade = () => {
      state.themeIdx = (state.themeIdx + 1) % THEMES.length;
      state.fadeFrom = state.liveColors.map(c => [...c]);
      state.fadeTo = THEMES[state.themeIdx].map(hexToRgb);
      state.fadeStart = performance.now();
      state.isFading = true;
    };

    const tickColors = (now) => {
      if (!state.isFading) return;
      const t = Math.min((now - state.fadeStart) / FADE_MS, 1);
      const e = ease(t);
      state.liveColors = state.fadeFrom.map((f, i) => lerpRgb(f, state.fadeTo[i], e));
      if (t >= 1) {
        state.liveColors = state.fadeTo.map(c => [...c]);
        state.isFading = false;
        fadeTimeout = setTimeout(startFade, HOLD_MS);
      }
    };

    const applyColors = () => {
      state.slotContent.forEach((elIdx, slotIdx) => {
        if (elIdx !== null && tileRefs.current[elIdx]) {
          tileRefs.current[elIdx].style.background = rgbStr(state.liveColors[slotIdx]);
        }
      });
    };

    const animateEl = (el, toPosIdx, cb) => {
      if (!el) return;
      const fromX = parseFloat(el.style.left);
      const fromY = parseFloat(el.style.top);
      const toX = POS[toPosIdx].x - T / 2;
      const toY = POS[toPosIdx].y - T / 2;
      el.style.zIndex = '10';
      const t0 = performance.now();

      const frame = (now) => {
        let p = Math.min((now - t0) / MOVE_MS, 1);
        const e = ease(p);
        el.style.left = fromX + (toX - fromX) * e + 'px';
        el.style.top = fromY + (toY - fromY) * e + 'px';
        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          el.style.zIndex = '2';
          cb();
        }
      };
      requestAnimationFrame(frame);
    };

    const doStep = () => {
      const filledSlot = (state.emptySlot + 1) % 8;
      const tileElIdx = state.slotContent[filledSlot];
      if (tileElIdx === null) {
        stepTimeout = setTimeout(doStep, WAIT_MS);
        return;
      }
      const destPosIdx = CHAIN_POS[state.emptySlot];
      state.slotContent[state.emptySlot] = tileElIdx;
      state.slotContent[filledSlot] = null;
      state.emptySlot = filledSlot;

      animateEl(tileRefs.current[tileElIdx], destPosIdx, () => {
        stepTimeout = setTimeout(doStep, WAIT_MS);
      });
    };

    const masterLoop = (now) => {
      tickColors(now);
      applyColors();
      animationFrameId = requestAnimationFrame(masterLoop);
    };

    // Initial positioning
    state.slotContent.forEach((elIdx, slotIdx) => {
      if (elIdx !== null && tileRefs.current[elIdx]) {
        const posIdx = CHAIN_POS[slotIdx];
        const pos = POS[posIdx];
        tileRefs.current[elIdx].style.left = (pos.x - T / 2) + 'px';
        tileRefs.current[elIdx].style.top = (pos.y - T / 2) + 'px';
        tileRefs.current[elIdx].style.background = rgbStr(state.liveColors[slotIdx]);
      }
    });

    animationFrameId = requestAnimationFrame(masterLoop);
    stepTimeout = setTimeout(doStep, 400);
    fadeTimeout = setTimeout(startFade, HOLD_MS);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(fadeTimeout);
      clearTimeout(stepTimeout);
    };
  }, []);

  return (
    <>
      <style>{`
        .loader-scene {
          position: relative;
          width: 320px;
          height: 280px;
          transform: scale(0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        @media (max-width: 768px) {
          .loader-scene {
            transform: scale(0.3);
          }
        }
        @media (max-width: 480px) {
          .loader-scene {
            transform: scale(0.25);
          }
        }
        .loader-tile {
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 13px;
          transform: rotate(45deg);
          will-change: left, top;
        }
      `}</style>
      <div className="loader-scene" ref={sceneRef}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="loader-tile"
            ref={(el) => (tileRefs.current[i] = el)}
          />
        ))}
      </div>
    </>
  );
};

export default TileLoader;
