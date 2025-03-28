
import React, { useEffect, useRef } from "react";

interface Ball {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
  multiplier: number;
  opacity: number;
}

const GameBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Create an array of balls
    const balls: Ball[] = [];
    const colors = ["#9b87f5", "#7E69AB", "#D946EF", "#F97316", "#0EA5E9"];
    const multipliers = [1.5, 2.0, 3.0, 5.0, 10.0];
    
    // Create 20 balls with random properties
    for (let i = 0; i < 20; i++) {
      const radius = Math.random() * 12 + 8;
      const ball: Ball = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3, // Start in the top 30% of the screen
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 1 + 0.5,
        multiplier: multipliers[Math.floor(Math.random() * multipliers.length)],
        opacity: Math.random() * 0.5 + 0.3
      };
      balls.push(ball);
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(26, 31, 44, 0.8)");
      gradient.addColorStop(1, "rgba(13, 15, 22, 0.4)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw all balls
      balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color + Math.floor(ball.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Draw multiplier text
        ctx.font = "bold 10px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${ball.multiplier}x`, ball.x, ball.y);
        
        // Update ball position
        ball.y += ball.speed;
        
        // Reset ball when it reaches bottom
        if (ball.y > canvas.height + ball.radius) {
          // Display a "win" indicator
          const winAmount = (1000 + Math.random() * 1000).toFixed(2);
          
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillText(`+$${winAmount}`, ball.x, canvas.height - 50);
          
          ball.y = -ball.radius;
          ball.x = Math.random() * canvas.width;
          ball.speed = Math.random() * 1 + 0.5;
          ball.multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default GameBackground;
