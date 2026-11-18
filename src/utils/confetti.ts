// Yengil konfetti effekti (tashqi kutubxonasiz)

export function launchConfetti(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }

    const colors = ['#4F46E5', '#14B8A6', '#F43F5E', '#F59E0B', '#8B5CF6', '#10B981'];
    const particles = Array.from({ length: 65 }, () => ({
      x: canvas.width * (0.25 + Math.random() * 0.5),
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 11,
      vy: -4 - Math.random() * 8,
      size: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.25,
      alpha: 1,
    }));

    let frame = 0;
    const maxFrames = 95;

    const animate = () => {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, 1 - frame / maxFrames);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(animate);
  } catch {
    // Konfetti ishlamasa xato bermaslik
  }
}
