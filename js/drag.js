/** Pointer drag / hold helpers. Mouse and touch via Pointer Events. */

export function pointIn(el, clientX, clientY) {
  const r = el.getBoundingClientRect();
  return {
    x: clientX - r.left,
    y: clientY - r.top,
    w: r.width,
    h: r.height,
    r,
  };
}

export function overlapRatio(a, b) {
  const A = a.getBoundingClientRect();
  const B = b.getBoundingClientRect();
  const ix = Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left));
  const iy = Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
  const inter = ix * iy;
  const smaller = Math.min(A.width * A.height, B.width * B.height);
  return smaller > 0 ? inter / smaller : 0;
}

export function hits(a, b, min = 0.28) {
  return overlapRatio(a, b) >= min;
}

export function centerDist(a, b) {
  const A = a.getBoundingClientRect();
  const B = b.getBoundingClientRect();
  const dx = A.left + A.width / 2 - (B.left + B.width / 2);
  const dy = A.top + A.height / 2 - (B.top + B.height / 2);
  return Math.hypot(dx, dy);
}

/**
 * Drag an absolutely-positioned element inside container.
 * onMove(x, y, ev, meta) — x/y are top-left relative to container.
 */
export function bindDrag(el, {
  container,
  axis = null,
  onStart,
  onMove,
  onEnd,
  handle,
} = {}) {
  const target = handle || el;
  const box = container || el.parentElement;
  let live = null;

  function coords(ev) {
    const r = box.getBoundingClientRect();
    return {
      x: ev.clientX - r.left,
      y: ev.clientY - r.top,
      w: r.width,
      h: r.height,
    };
  }

  function down(ev) {
    if (ev.isPrimary === false) return;
    if (ev.button != null && ev.button !== 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    target.setPointerCapture(ev.pointerId);
    const c = coords(ev);
    const er = el.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    live = {
      id: ev.pointerId,
      ox: ev.clientX - er.left,
      oy: ev.clientY - er.top,
      x0: c.x,
      y0: c.y,
      sl: er.left - br.left,
      st: er.top - br.top,
      moved: false,
    };
    el.classList.add("dragging");
    onStart?.(ev, live, c);
  }

  function move(ev) {
    if (!live || ev.pointerId !== live.id) return;
    ev.preventDefault();
    const c = coords(ev);
    const dx = c.x - live.x0;
    const dy = c.y - live.y0;
    if (Math.hypot(dx, dy) > 6) live.moved = true;
    let x = c.x - live.ox;
    let y = c.y - live.oy;
    if (axis === "x") y = live.st;
    if (axis === "y") x = live.sl;
    onMove?.(x, y, ev, { ...live, ...c });
  }

  function up(ev) {
    if (!live || ev.pointerId !== live.id) return;
    const c = coords(ev);
    const meta = { ...live, ...c };
    live = null;
    el.classList.remove("dragging");
    try { target.releasePointerCapture(ev.pointerId); } catch { /* already */ }
    onEnd?.(ev, meta);
  }

  target.addEventListener("pointerdown", down);
  target.addEventListener("pointermove", move);
  target.addEventListener("pointerup", up);
  target.addEventListener("pointercancel", up);

  return () => {
    target.removeEventListener("pointerdown", down);
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerup", up);
    target.removeEventListener("pointercancel", up);
  };
}

/** Hold while pointer is down. onProgress(t 0-1), onDone(), onCancel(). */
export function bindHold(el, { ms = 1400, onProgress, onDone, onCancel, enabled } = {}) {
  let raf = 0;
  let start = 0;
  let holding = false;

  function tick(now) {
    if (!holding) return;
    const t = Math.min(1, (now - start) / ms);
    onProgress?.(t);
    if (t >= 1) {
      holding = false;
      onDone?.();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function down(ev) {
    if (ev.isPrimary === false) return;
    if (ev.button != null && ev.button !== 0) return;
    if (enabled && !enabled()) return;
    ev.preventDefault();
    el.setPointerCapture(ev.pointerId);
    holding = true;
    start = performance.now();
    onProgress?.(0);
    raf = requestAnimationFrame(tick);
  }

  function up(ev) {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    onCancel?.();
    try { el.releasePointerCapture(ev.pointerId); } catch { /* already */ }
  }

  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);

  return () => {
    holding = false;
    cancelAnimationFrame(raf);
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
  };
}

export function place(el, x, y) {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/** Tap vs drag: tap if little movement, else follow a ghost and drop. */
export function bindPickDrag(el, { onTap, onDrop, add }) {
  let live = null;
  let ghost = null;

  function down(ev) {
    if (ev.isPrimary === false) return;
    if (ev.button != null && ev.button !== 0) return;
    ev.preventDefault();
    el.setPointerCapture(ev.pointerId);
    live = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, moved: false };
  }

  function move(ev) {
    if (!live || ev.pointerId !== live.id) return;
    ev.preventDefault();
    if (Math.hypot(ev.clientX - live.x, ev.clientY - live.y) > 8) live.moved = true;
    if (live.moved && !ghost) {
      ghost = el.cloneNode(true);
      ghost.classList.add("dragging");
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "30";
      ghost.style.margin = "0";
      ghost.style.width = `${el.getBoundingClientRect().width}px`;
      document.body.appendChild(ghost);
      el.style.opacity = "0.35";
    }
    if (ghost) {
      const r = ghost.getBoundingClientRect();
      ghost.style.left = `${ev.clientX - r.width / 2}px`;
      ghost.style.top = `${ev.clientY - r.height / 2}px`;
    }
  }

  function up(ev) {
    if (!live || ev.pointerId !== live.id) return;
    const moved = live.moved;
    const g = ghost;
    el.style.opacity = "";
    if (g) g.remove();
    ghost = null;
    live = null;
    try { el.releasePointerCapture(ev.pointerId); } catch { /* already */ }
    if (!moved) onTap?.(ev);
    else onDrop?.(ev, g);
  }

  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  const off = () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    if (ghost) ghost.remove();
    el.style.opacity = "";
  };
  add?.(off);
  return off;
}
