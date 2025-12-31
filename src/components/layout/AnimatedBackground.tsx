import { useEffect, useState } from 'react';

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  color: 'red' | 'blue';
  duration: number;
  delay: number;
  type: 'circle' | 'square' | 'triangle';
}

export function AnimatedBackground() {
  const [shapes, setShapes] = useState<FloatingShape[]>([]);

  useEffect(() => {
    const generateShapes = () => {
      const newShapes: FloatingShape[] = [];
      for (let i = 0; i < 15; i++) {
        newShapes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 80 + 40,
          color: Math.random() > 0.5 ? 'red' : 'blue',
          duration: Math.random() * 20 + 15,
          delay: Math.random() * -20,
          type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
        });
      }
      setShapes(newShapes);
    };

    generateShapes();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Floating shapes */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute opacity-10 blur-xl ${
            shape.color === 'red' ? 'bg-accent' : 'bg-primary'
          }`}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'square' ? '20%' : '0',
            clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
            animation: `float-${shape.id % 3} ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      ))}

      {/* Large ambient orbs */}
      <div 
        className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-primary/10 blur-3xl"
        style={{ animation: 'pulse-slow 8s ease-in-out infinite' }}
      />
      <div 
        className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-accent/10 blur-3xl"
        style={{ animation: 'pulse-slow 10s ease-in-out infinite', animationDelay: '-4s' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full bg-primary/5 blur-3xl"
        style={{ animation: 'pulse-slow 12s ease-in-out infinite', animationDelay: '-2s' }}
      />

      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line 
          x1="0" y1="20%" x2="100%" y2="80%" 
          stroke="url(#line-gradient-1)" 
          strokeWidth="1"
          style={{ animation: 'line-move 15s linear infinite' }}
        />
        <line 
          x1="100%" y1="10%" x2="0" y2="90%" 
          stroke="url(#line-gradient-2)" 
          strokeWidth="1"
          style={{ animation: 'line-move 18s linear infinite', animationDelay: '-5s' }}
        />
        <line 
          x1="50%" y1="0" x2="50%" y2="100%" 
          stroke="url(#line-gradient-1)" 
          strokeWidth="0.5"
          style={{ animation: 'line-move 20s linear infinite', animationDelay: '-10s' }}
        />
      </svg>

      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(90deg); }
          50% { transform: translate(-20px, 20px) rotate(180deg); }
          75% { transform: translate(20px, 30px) rotate(270deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 20px) rotate(120deg); }
          66% { transform: translate(30px, -40px) rotate(240deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05); }
        }
        @keyframes line-move {
          0% { opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
