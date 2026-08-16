import { useEffect, useRef, useMemo } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoContains, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import type { Footprint } from '../utils/globe';

// world-atlas JSON 无类型定义
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const worldTopo = worldData as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const worldFeatures: any[] = (feature(worldTopo as any, worldTopo.objects.countries) as any).features as any[];

interface GlobeProps {
  footprints: Footprint[];
  onHover?: (fp: Footprint | null) => void;
}

/** 按足迹类型取色：仅可可→绿，仅增味→棕，两者兼有→金 */
function footprintColor(kinds: Set<string>): [number, number, number] {
  const hasCocoa = kinds.has('cocoa');
  const hasFlavor = kinds.has('flavor');
  if (hasCocoa && hasFlavor) return [232, 185, 58];  // 金
  if (hasCocoa) return [52, 211, 153];               // 祖母绿
  return [196, 155, 108];                            // 可可棕
}

export default function Globe({ footprints, onHover }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 交互状态（用 ref 避免重渲染）
  const stateRef = useRef({
    rotation: [20, 8] as [number, number], // [lambda, phi]
    targetRotation: [20, 8] as [number, number],
    scale: 1,
    targetScale: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
    velocity: [0, 0] as [number, number],
    autoRotate: true,
    hovered: null as Footprint | null,
    time: 0,
    dpr: 1,
  });

  const footprintsRef = useRef(footprints);
  footprintsRef.current = footprints;
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  // 国家按 atlasName 匹配 footprint
  const footprintByAtlas = useMemo(() => {
    const map = new Map<string, Footprint>();
    for (const fp of footprints) {
      if (fp.info.atlasName) map.set(fp.info.atlasName, fp);
    }
    return map;
  }, [footprints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const st = stateRef.current;
    let raf = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      st.dpr = dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // ---- 交互事件 ----
    const toClient = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });

    const onPointerDown = (e: PointerEvent) => {
      st.dragging = true;
      st.autoRotate = false;
      st.velocity = [0, 0];
      const { x, y } = toClient(e);
      st.lastX = x;
      st.lastY = y;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const { x, y } = toClient(e);
      if (st.dragging) {
        const dx = x - st.lastX;
        const dy = y - st.lastY;
        st.lastX = x;
        st.lastY = y;
        const sens = 0.25 / st.scale;
        st.targetRotation[0] += dx * sens;
        st.targetRotation[1] -= dy * sens;
        st.targetRotation[1] = Math.max(-85, Math.min(85, st.targetRotation[1]));
        st.velocity = [dx * sens * 0.6, -dy * sens * 0.6];
      } else {
        // 悬停检测
        const rect = canvas.getBoundingClientRect();
        const cx = (x - rect.left) * st.dpr;
        const cy = (y - rect.top) * st.dpr;
        const w = canvas.width;
        const h = canvas.height;
        const scale = st.scale * Math.min(w, h) / 2 * 0.92;
        const centerX = w / 2;
        const centerY = h / 2;
        const dxp = (cx - centerX) / scale;
        const dyp = (cy - centerY) / scale;
        const dist2 = dxp * dxp + dyp * dyp;
        let hovered: Footprint | null = null;
        if (dist2 <= 1.02) {
          const proj = geoOrthographic().rotate(st.rotation).scale(scale).translate([centerX, centerY]);
          const inv = proj.invert?.([cx, cy]);
          if (inv) {
            const [lon, lat] = inv;
            // 第一层：精确多边形包含检测
            for (const fp of footprintsRef.current) {
              const en = fp.info.atlasName;
              if (!en) continue;
              const feat = worldFeatures.find((f: any) => f.properties?.name === en);
              if (feat && geoContains(feat, [lon, lat])) {
                hovered = fp;
                break;
              }
            }
          }
          // 第二层：小国家兜底 —— 光标距标记点足够近即选中
          if (!hovered) {
            let best: Footprint | null = null;
            let bestDist = Infinity;
            for (const fp of footprintsRef.current) {
              const { lat, lon } = fp.info;
              // 背面剔除
              if (geoDistance([lon, lat], [-st.rotation[0], -st.rotation[1]]) >= Math.PI / 2) continue;
              const p = proj([lon, lat]);
              if (!p) continue;
              const baseR = 3 + Math.min(fp.count, 5) * 0.8;
              // 命中容差随标记大小自适应（至少 20 设备像素）
              const threshold = Math.max(20, baseR * 5) * st.dpr;
              const d = Math.hypot(p[0] - cx, p[1] - cy);
              if (d < threshold && d < bestDist) {
                bestDist = d;
                best = fp;
              }
            }
            hovered = best;
          }
        }
        if (hovered !== st.hovered) {
          st.hovered = hovered;
          onHoverRef.current?.(hovered);
          canvas.style.cursor = hovered ? 'pointer' : 'grab';
        }
      }
    };

    const onPointerUp = () => {
      st.dragging = false;
      // 拖动结束后 3 秒恢复自动旋转
      setTimeout(() => {
        if (!st.dragging) st.autoRotate = true;
      }, 3000);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.09;
      st.targetScale = Math.max(0.6, Math.min(4, st.targetScale * factor));
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // ---- 渲染循环 ----
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const t = performance.now() / 1000;
      st.time = t;

      // 惯性
      if (!st.dragging) {
        st.targetRotation[0] += st.velocity[0];
        st.targetRotation[1] += st.velocity[1];
        st.velocity[0] *= 0.94;
        st.velocity[1] *= 0.94;
      }
      // 自动旋转
      if (st.autoRotate && !st.dragging) {
        st.targetRotation[0] += 0.018;
      }
      // 平滑插值
      st.rotation[0] += (st.targetRotation[0] - st.rotation[0]) * 0.12;
      st.rotation[1] += (st.targetRotation[1] - st.rotation[1]) * 0.12;
      st.scale += (st.targetScale - st.scale) * 0.12;

      const scale = st.scale * Math.min(w, h) / 2 * 0.92;
      const centerX = w / 2;
      const centerY = h / 2;

      // 清屏
      ctx.clearRect(0, 0, w, h);

      // 大气光晕（多层径向渐变）
      const glowR = scale * 1.35;
      const glow = ctx.createRadialGradient(centerX, centerY, scale * 0.95, centerX, centerY, glowR);
      glow.addColorStop(0, 'rgba(196, 155, 108, 0.0)');
      glow.addColorStop(0.55, 'rgba(196, 155, 108, 0.07)');
      glow.addColorStop(0.78, 'rgba(196, 155, 108, 0.14)');
      glow.addColorStop(0.92, 'rgba(196, 155, 108, 0.05)');
      glow.addColorStop(1, 'rgba(196, 155, 108, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowR, 0, Math.PI * 2);
      ctx.fill();

      // 投影
      const proj = geoOrthographic()
        .rotate(st.rotation)
        .scale(scale)
        .translate([centerX, centerY])
        .clipAngle(90);
      const path = geoPath(proj, ctx);

      // 球体底
      const sphereGrad = ctx.createRadialGradient(
        centerX - scale * 0.35, centerY - scale * 0.4, scale * 0.1,
        centerX, centerY, scale * 1.02,
      );
      sphereGrad.addColorStop(0, '#241c16');
      sphereGrad.addColorStop(0.55, '#191310');
      sphereGrad.addColorStop(1, '#0d0907');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale, 0, Math.PI * 2);
      ctx.fill();

      // 经纬网
      ctx.strokeStyle = 'rgba(196, 155, 108, 0.10)';
      ctx.lineWidth = 0.6 * st.dpr;
      ctx.beginPath();
      path(geoGraticule10());
      ctx.stroke();

      // 陆地
      ctx.beginPath();
      path({ type: 'Sphere' } as any);
      ctx.fillStyle = 'rgba(50, 38, 28, 0.85)';
      ctx.fill();

      // 每个国家单独绘制（用于高亮）
      for (const feat of worldFeatures) {
        const name = feat.properties?.name;
        if (!name) continue;
        const fp = footprintByAtlas.get(name);
        ctx.beginPath();
        path(feat);
        if (fp) {
          // 已访问：按可可/增味着色（两者兼有则金色）
          const c = footprintColor(fp.kinds);
          const pulse = 0.65 + 0.35 * Math.sin(t * 2.2 + fp.code.charCodeAt(0) * 0.7);
          ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.16 + pulse * 0.18})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.45 + pulse * 0.4})`;
          ctx.lineWidth = 0.9 * st.dpr;
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(66, 50, 37, 0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(240, 230, 218, 0.14)';
          ctx.lineWidth = 0.8 * st.dpr;
          ctx.stroke();
        }
      }

      // 已访问国家的涟漪标记（仅渲染面向视角的一侧）
      // d3 rotate([λ, φ]) 使 [-λ, -φ] 位于投影中心，球面距离 < 90° 即为可见半球
      const viewCenter: [number, number] = [-st.rotation[0], -st.rotation[1]];

      for (const fp of footprintsRef.current) {
        const { lat, lon } = fp.info;
        // 背面剔除：标记点与视角中心的球面距离 ≥ 90° 表示在不可见面
        if (geoDistance([lon, lat], viewCenter) >= Math.PI / 2) continue;

        const p = proj([lon, lat]);
        if (!p) continue;

        const pulse = 0.65 + 0.35 * Math.sin(t * 2.2 + fp.code.charCodeAt(0) * 0.7);
        const baseR = 3 + Math.min(fp.count, 5) * 0.8;
        const c = footprintColor(fp.kinds);

        // 光点
        const dotGrad = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], baseR * 4);
        dotGrad.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.95)`);
        dotGrad.addColorStop(0.25, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.55)`);
        dotGrad.addColorStop(1, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`);
        ctx.fillStyle = dotGrad;
        ctx.beginPath();
        ctx.arc(p[0], p[1], baseR * 4, 0, Math.PI * 2);
        ctx.fill();

        // 核心点
        ctx.fillStyle = `rgb(${Math.min(255, c[0] + 40)}, ${Math.min(255, c[1] + 40)}, ${Math.min(255, c[2] + 40)})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], baseR * st.dpr * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // 涟漪环
        ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${(1 - pulse) * 0.7})`;
        ctx.lineWidth = 1.2 * st.dpr;
        ctx.beginPath();
        ctx.arc(p[0], p[1], baseR * (1 + pulse * 1.8) * st.dpr, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [footprintByAtlas]);

  return (
    <div ref={wrapRef} className="relative w-full h-full select-none">
      <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
    </div>
  );
}
