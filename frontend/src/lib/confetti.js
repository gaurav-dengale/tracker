import confetti from 'canvas-confetti';
import { playSuccessChime, playTaskCheckSound } from './soundUtils';

// Celebration burst when a single task is checked
export function triggerTaskCelebration(originEventOrCoords = null) {
  playTaskCheckSound();

  let origin = { x: 0.5, y: 0.6 };
  if (originEventOrCoords && typeof originEventOrCoords === 'object') {
    if ('clientX' in originEventOrCoords && 'clientY' in originEventOrCoords && window.innerWidth > 0) {
      origin = {
        x: Math.max(0.1, Math.min(0.9, originEventOrCoords.clientX / window.innerWidth)),
        y: Math.max(0.1, Math.min(0.9, originEventOrCoords.clientY / window.innerHeight)),
      };
    } else if ('x' in originEventOrCoords && 'y' in originEventOrCoords) {
      origin = originEventOrCoords;
    }
  }

  // Crisp, vibrant burst of multi-color confetti particles
  confetti({
    particleCount: 50,
    spread: 75,
    origin,
    zIndex: 9999,
    startVelocity: 35,
    ticks: 200,
    colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'],
    shapes: ['circle', 'square'],
    scalar: 0.95,
    gravity: 1.1,
  });
}

// Grand celebration when all tasks or quiz is finished
export function triggerCelebration() {
  playSuccessChime();

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

