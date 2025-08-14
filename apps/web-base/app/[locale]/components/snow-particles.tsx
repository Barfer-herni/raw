'use client';

import { useEffect, useState } from 'react';

type Particle = {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    twinkleSpeed: number;
    twinkleDirection: boolean;
};

type SnowParticlesProps = {
    count?: number;
    isDarkMode?: boolean;
};

export const SnowParticles = ({ count = 50, isDarkMode = false }: SnowParticlesProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Generate initial particles
    useEffect(() => {
        if (typeof window === 'undefined') return;

        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });

        const initialParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            initialParticles.push(createParticle(i));
        }
        setParticles(initialParticles);

        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [count]);

    // Update particles position and twinkle effect
    useEffect(() => {
        if (particles.length === 0 || dimensions.width === 0) return;

        const animationFrame = requestAnimationFrame(() => {
            setParticles(prevParticles =>
                prevParticles.map(particle => {
                    // Update position
                    let y = particle.y + particle.speed;
                    if (y > dimensions.height) {
                        y = -10;
                    }

                    // Update twinkle effect (opacity)
                    let opacity = particle.opacity;
                    if (particle.twinkleDirection) {
                        opacity += particle.twinkleSpeed;
                        if (opacity >= 0.8) {
                            opacity = 0.8;
                            particle.twinkleDirection = false;
                        }
                    } else {
                        opacity -= particle.twinkleSpeed;
                        if (opacity <= 0.1) {
                            opacity = 0.1;
                            particle.twinkleDirection = true;
                        }
                    }

                    return {
                        ...particle,
                        y,
                        opacity
                    };
                })
            );
        });

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [particles, dimensions]);

    // Helper function to create a particle
    const createParticle = (id: number): Particle => ({
        id,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
        size: Math.random() * 4 + 1,
        speed: Math.random() * 1 + 0.1,
        opacity: Math.random() * 0.7 + 0.1,
        twinkleSpeed: Math.random() * 0.01 + 0.001,
        twinkleDirection: Math.random() > 0.5
    });

    // Determine color based on background
    const particleColor = isDarkMode ? 'rgba(34, 197, 94, ' : 'rgba(21, 128, 61, ';

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: `${particleColor}${particle.opacity})`,
                        boxShadow: `0 0 ${particle.size * 2}px ${particleColor}${particle.opacity * 0.5})`,
                        transition: 'opacity 0.5s ease'
                    }}
                />
            ))}
        </div>
    );
}; 