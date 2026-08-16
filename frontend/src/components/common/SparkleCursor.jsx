import React, { useEffect, useRef } from 'react';

export default function SparkleCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const maxParticles = 60;

    // Resize canvas to cover full window viewport
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle schema
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        // Random velocities
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5 - 0.4; // slight upward drift
        // Size
        this.size = Math.random() * 4 + 2;
        // Maximum frame lifetime
        this.maxLife = Math.random() * 20 + 20;
        this.life = this.maxLife;
        // Rotation metrics
        this.rot = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 0.08;
        // Emerald green hue ranges
        const green = Math.floor(Math.random() * 70 + 185); // 185 to 255
        this.color = `rgba(16, ${green}, 129, `;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.rot += this.rotSpeed;
        if (this.size > 0.1) this.size -= 0.08;
      }

      draw(c) {
        const opacity = this.life / this.maxLife;
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rot);
        c.fillStyle = this.color + opacity + ')';
        
        // Draw a 4-pointed sparkling star
        c.beginPath();
        for (let i = 0; i < 4; i++) {
          c.rotate(Math.PI / 2);
          c.lineTo(0, this.size);
          c.lineTo(this.size * 0.22, 0);
        }
        c.closePath();
        c.fill();
        c.restore();
      }
    }

    const handleMouseMove = (e) => {
      // Spawn sparkle particles on movement
      if (particles.length < maxParticles) {
        particles.push(new Particle(e.clientX, e.clientY));
        if (Math.random() > 0.6) {
          particles.push(new Particle(e.clientX, e.clientY));
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Animation render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw(ctx);

        // Splice dead particles
        if (p.life <= 0 || p.size <= 0.1) {
          particles.splice(i, 1);
          i--;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup listeners
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
