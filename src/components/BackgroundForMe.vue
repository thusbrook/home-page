<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <!-- 光晕装饰 -->
    <div class="glow-orb glow-orb-1"></div>
    <div class="glow-orb glow-orb-2"></div>
    <div class="glow-orb glow-orb-3"></div>

    <!-- 粒子画布 -->
    <canvas id="particles-canvas" ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
// import { Error } from "@icon-park/vue-next";

const store = mainStore();
const imgTimeout = ref(null);

// 粒子画布
const canvasRef = ref(null);
let animationId = null;
let particles = [];
let ctx = null;

// 调整画布尺寸
const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

// 初始化粒子
const initParticles = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 1.6 + 0.4,
    alpha: Math.random() * 0.5 + 0.2,
  }));
};

// 渲染循环
const render = () => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.fill();
  }

  // 连线
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  animationId = requestAnimationFrame(render);
};

// 窗口尺寸变化
const handleResize = () => {
  resizeCanvas();
  initParticles();
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (canvas) {
    ctx = canvas.getContext("2d");
    resizeCanvas();
    initParticles();
    render();
    window.addEventListener("resize", handleResize);
  }
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 20% 20%, #1a1a40, #0d0d1f 60%, #06060f 100%);
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  // 光晕装饰
  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.55;
    will-change: transform;
    pointer-events: none;
  }
  .glow-orb-1 {
    top: -10%;
    left: -5%;
    width: 40vw;
    height: 40vw;
    background: radial-gradient(circle, #6a5cff, transparent 70%);
    animation: orb-float-1 18s ease-in-out infinite;
  }
  .glow-orb-2 {
    bottom: -15%;
    right: -10%;
    width: 45vw;
    height: 45vw;
    background: radial-gradient(circle, #ff5c8a, transparent 70%);
    animation: orb-float-2 22s ease-in-out infinite;
  }
  .glow-orb-3 {
    top: 30%;
    right: 20%;
    width: 30vw;
    height: 30vw;
    background: radial-gradient(circle, #2fd6c4, transparent 70%);
    animation: orb-float-3 26s ease-in-out infinite;
  }

  // 粒子画布
  #particles-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.45s;
  }
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}

// 光晕浮动动画
@keyframes orb-float-1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(6vw, 4vh) scale(1.15);
  }
}
@keyframes orb-float-2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-5vw, -6vh) scale(1.1);
  }
}
@keyframes orb-float-3 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-4vw, 5vh) scale(1.2);
  }
}
</style>
