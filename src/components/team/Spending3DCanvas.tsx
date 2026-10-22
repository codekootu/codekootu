'use client';

import { useEffect, useRef } from 'react';

export function Spending3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles
    const NUM_NODES = 50;
    interface Node3D {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
    }

    const nodes: Node3D[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 150,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    // 3D Cube Vertices
    const cubeSize = 80;
    const cubeVertices = [
      [-cubeSize, -cubeSize, -cubeSize],
      [cubeSize, -cubeSize, -cubeSize],
      [cubeSize, cubeSize, -cubeSize],
      [-cubeSize, cubeSize, -cubeSize],
      [-cubeSize, -cubeSize, cubeSize],
      [cubeSize, -cubeSize, cubeSize],
      [cubeSize, cubeSize, cubeSize],
      [-cubeSize, cubeSize, cubeSize],
    ];

    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    let rotX = 0.4;
    let rotY = 0.6;
    let ringAngle = 0;
    let gridOffset = 0;
    const focalLength = 420;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      const offsetX = (mouse.x - width / 2) * 0.07;
      const offsetY = (mouse.y - height / 2) * 0.07;

      // 1. 3D Perspective Floor Grid
      gridOffset = (gridOffset + 0.3) % 40;
      const horizonY = height * 0.75 + offsetY * 0.5;
      const gridWidth = width * 1.8;

      ctx.save();
      ctx.strokeStyle = 'rgba(224, 35, 28, 0.07)';
      ctx.lineWidth = 1;

      // Radial perspective vanishing lines
      for (let x = -gridWidth / 2; x <= gridWidth / 2; x += 90) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + offsetX * 2, horizonY);
        ctx.lineTo(width / 2 + x * 2.8, height);
        ctx.stroke();
      }

      // Horizontal depth lines
      for (let z = 20; z <= 400; z += 35) {
        const lineZ = (z + gridOffset) % 400;
        const screenY = horizonY + (lineZ * (height - horizonY)) / 400;
        const alpha = Math.min((lineZ / 400) * 0.12, 0.1);
        ctx.strokeStyle = `rgba(224, 35, 28, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
        ctx.stroke();
      }
      ctx.restore();

      // 2. 3D Ambient Constellation Nodes
      const projectedNodes: { px: number; py: number; scale: number; alpha: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (n.z <= 60) n.z = 850;
        if (n.z > 900) n.z = 80;

        const scale = focalLength / n.z;
        const px = width / 2 + (n.x + offsetX) * scale;
        const py = height / 2 + (n.y + offsetY) * scale;
        const alpha = Math.min(Math.max((1 - n.z / 900) * 0.5, 0.05), 0.7);

        projectedNodes.push({ px, py, scale, alpha });

        ctx.beginPath();
        ctx.arc(px, py, n.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 35, 28, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#e0231c';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Faint Connections
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].px - projectedNodes[j].px;
          const dy = projectedNodes[i].py - projectedNodes[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(projectedNodes[i].px, projectedNodes[i].py);
            ctx.lineTo(projectedNodes[j].px, projectedNodes[j].py);
            ctx.strokeStyle = `rgba(223, 231, 224, ${(1 - dist / 110) * 0.07})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 3. Rotating 3D Hologram Cube & Gyroscopic Rings
      rotX += 0.006;
      rotY += 0.009;
      ringAngle += 0.015;

      const cubeCenterX = width > 768 ? width - 200 : width / 2;
      const cubeCenterY = width > 768 ? 160 : 130;

      const rotatedVertices = cubeVertices.map(([x, y, z]) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const distance = 350;
        const projScale = focalLength / (distance + z2);
        return {
          px: cubeCenterX + x1 * projScale,
          py: cubeCenterY + y2 * projScale,
          z: z2,
        };
      });

      // 3D Gyroscope Ring 1
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cubeCenterX, cubeCenterY, 115, 45, ringAngle, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 3D Gyroscope Ring 2
      ctx.beginPath();
      ctx.ellipse(cubeCenterX, cubeCenterY, 125, 55, -ringAngle * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224, 35, 28, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Render Cube Edges
      cubeEdges.forEach(([startIdx, endIdx]) => {
        const v1 = rotatedVertices[startIdx];
        const v2 = rotatedVertices[endIdx];

        ctx.beginPath();
        ctx.moveTo(v1.px, v1.py);
        ctx.lineTo(v2.px, v2.py);
        ctx.strokeStyle = 'rgba(224, 35, 28, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(224, 35, 28, 0.7)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Render Cube Nodes
      rotatedVertices.forEach((v) => {
        ctx.beginPath();
        ctx.arc(v.px, v.py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#2dd4bf';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#2dd4bf';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-85"
    />
  );
}
