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

    // Mouse tracking for 3D parallax
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Nodes
    const NUM_NODES = 42;
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
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 800 + 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1,
      });
    }

    // 3D Cube Vertices for the ledger node
    const cubeSize = 75;
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
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
    ];

    let rotX = 0.4;
    let rotY = 0.6;
    const focalLength = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      const offsetX = (mouse.x - width / 2) * 0.08;
      const offsetY = (mouse.y - height / 2) * 0.08;

      // 1. Draw 3D Ambient Constellation Nodes
      const projectedNodes: { px: number; py: number; scale: number; alpha: number }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (n.z <= 50) n.z = 800;
        if (n.z > 900) n.z = 100;

        const scale = focalLength / n.z;
        const px = width / 2 + (n.x + offsetX) * scale;
        const py = height / 2 + (n.y + offsetY) * scale;
        const alpha = Math.min(Math.max((1 - n.z / 900) * 0.45, 0.05), 0.6);

        projectedNodes.push({ px, py, scale, alpha });

        ctx.beginPath();
        ctx.arc(px, py, n.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 35, 28, ${alpha})`; // Crimson theme glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#e0231c';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw faint connections between nearby 3D points
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].px - projectedNodes[j].px;
          const dy = projectedNodes[i].py - projectedNodes[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(projectedNodes[i].px, projectedNodes[i].py);
            ctx.lineTo(projectedNodes[j].px, projectedNodes[j].py);
            ctx.strokeStyle = `rgba(223, 231, 224, ${(1 - dist / 120) * 0.08})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // 2. Draw 3D Rotating Ledger Hologram Cube in upper corner
      rotX += 0.007;
      rotY += 0.01;

      const cubeCenterX = width > 768 ? width - 180 : width / 2;
      const cubeCenterY = width > 768 ? 160 : 130;

      const rotatedVertices = cubeVertices.map(([x, y, z]) => {
        // Rotate around Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const distance = 340;
        const projScale = focalLength / (distance + z2);
        return {
          px: cubeCenterX + x1 * projScale,
          py: cubeCenterY + y2 * projScale,
          z: z2,
        };
      });

      // Render Cube Edges with Red / Cyberpunk Neon gradient
      cubeEdges.forEach(([startIdx, endIdx]) => {
        const v1 = rotatedVertices[startIdx];
        const v2 = rotatedVertices[endIdx];

        ctx.beginPath();
        ctx.moveTo(v1.px, v1.py);
        ctx.lineTo(v2.px, v2.py);
        ctx.strokeStyle = 'rgba(224, 35, 28, 0.45)';
        ctx.lineWidth = 1.3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(224, 35, 28, 0.6)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Render vertex dots
      rotatedVertices.forEach((v) => {
        ctx.beginPath();
        ctx.arc(v.px, v.py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#2dd4bf'; // Emerald-teal accent node
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
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
