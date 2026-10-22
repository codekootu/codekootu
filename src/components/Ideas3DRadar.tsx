'use client';

import { useEffect, useRef } from 'react';

export function Ideas3DRadar() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Nodes representing concepts in telemetry space
    const NUM_POINTS = 38;
    interface Point3D {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      tag: string;
    }

    const tags = ['SW', 'HW', 'OPS', 'AI', 'IOT'];
    const points: Point3D[] = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push({
        x: (Math.random() - 0.5) * width * 1.3,
        y: (Math.random() - 0.5) * height * 1.3,
        z: Math.random() * 700 + 100,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.6,
        tag: tags[Math.floor(Math.random() * tags.length)],
      });
    }

    let radarAngle = 0;
    const focalLength = 380;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ox = (mouse.x - width / 2) * 0.06;
      const oy = (mouse.y - height / 2) * 0.06;

      // 1. Perspective Depth Grid (Floor + Ceiling Horizon)
      const horizonY = height * 0.65 + oy * 0.4;
      ctx.save();
      ctx.strokeStyle = 'rgba(224, 35, 28, 0.05)';
      ctx.lineWidth = 1;

      for (let x = -width * 0.8; x <= width * 1.8; x += 120) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + ox, horizonY);
        ctx.lineTo(x + ox * 2, height);
        ctx.stroke();
      }
      ctx.restore();

      // 2. 3D Project Nodes Projection
      const projected: { px: number; py: number; scale: number; alpha: number; tag: string }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z <= 60) p.z = 800;
        if (p.z > 850) p.z = 80;

        const scale = focalLength / p.z;
        const px = width / 2 + (p.x + ox) * scale;
        const py = height / 2 + (p.y + oy) * scale;
        const alpha = Math.min(Math.max((1 - p.z / 850) * 0.5, 0.05), 0.7);

        projected.push({ px, py, scale, alpha, tag: p.tag });

        // Node Glow
        ctx.beginPath();
        ctx.arc(px, py, 2.8 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#2dd4bf';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Constellation Links
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = `rgba(223, 231, 224, ${(1 - dist / 110) * 0.06})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 3. 3D Rotating Telemetry Compass (Top Right Corner)
      radarAngle += 0.012;
      const compassX = width > 768 ? width - 160 : width / 2;
      const compassY = width > 768 ? 160 : 120;

      ctx.save();
      ctx.translate(compassX, compassY);

      // Rotating Outer Ring
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224, 35, 28, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Sweeping Beam
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 65, radarAngle, radarAngle + 0.5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(224, 35, 28, 0.08)';
      ctx.fill();

      // Gyro Ellipses
      ctx.beginPath();
      ctx.ellipse(0, 0, 75, 25, radarAngle * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
