import confetti from "canvas-confetti";

export const useConfetti = () => {
  const fireConfetti = (options?: confetti.Options) => {
    const defaults: confetti.Options = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#A69061", "#FFDFA6", "#8B0027", "#F2F1EF"],
    };

    confetti({
      ...defaults,
      ...options,
    });
  };

  const fireGoldConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ["#A69061", "#FFDFA6", "#D4AF37"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const fireSuccessConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.7 },
      colors: ["#22c55e", "#16a34a", "#A69061", "#FFDFA6"],
    });
  };

  const fireCelebration = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ["#A69061", "#FFDFA6", "#8B0027", "#22c55e"],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  return {
    fireConfetti,
    fireGoldConfetti,
    fireSuccessConfetti,
    fireCelebration,
  };
};
