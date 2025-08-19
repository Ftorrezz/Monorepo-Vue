// composables/useParticles.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useParticles(options = {}) {
  const particles = ref([])
  let animationId = null

  const {
    particleCount = 30,
    maxParticles = 50,
    particleSize = { min: 2, max: 6 },
    speed = { min: -0.3, max: 0.3 },
    colors = [
      'rgba(102, 126, 234, 0.08)',
      'rgba(118, 75, 162, 0.08)',
      'rgba(240, 147, 251, 0.08)',
      'rgba(79, 172, 254, 0.08)',
      'rgba(67, 233, 123, 0.08)'
    ],
    opacity = { min: 0.2, max: 0.6 }
  } = options

  const createParticle = (id) => {
    const width = window.innerWidth || 1200
    const height = window.innerHeight || 800

    return {
      id,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min,
      speedX: (Math.random() - 0.5) * (speed.max - speed.min) + speed.min,
      speedY: (Math.random() - 0.5) * (speed.max - speed.min) + speed.min,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * (opacity.max - opacity.min) + opacity.min,
      style: {}
    }
  }

  const updateParticles = () => {
    const width = window.innerWidth || 1200
    const height = window.innerHeight || 800

    particles.value.forEach(particle => {
      // Actualizar posición
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Rebotar en los bordes
      if (particle.x <= 0 || particle.x >= width) {
        particle.speedX *= -1
      }
      if (particle.y <= 0 || particle.y >= height) {
        particle.speedY *= -1
      }

      // Mantener dentro de los límites
      particle.x = Math.max(0, Math.min(width, particle.x))
      particle.y = Math.max(0, Math.min(height, particle.y))

      // Actualizar estilo
      particle.style = {
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: particle.color,
        opacity: particle.opacity,
        position: 'absolute',
        borderRadius: '50%',
        willChange: 'transform',
        transition: 'opacity 0.3s ease'
      }
    })
  }

  const animate = () => {
    updateParticles()
    animationId = requestAnimationFrame(animate)
  }

  const initParticles = () => {
    const width = window.innerWidth || 1200
    const actualCount = Math.min(
      particleCount,
      maxParticles,
      Math.floor(width / 40)
    )

    particles.value = []
    for (let i = 0; i < actualCount; i++) {
      particles.value.push(createParticle(i))
    }

    animate()
  }

  const destroyParticles = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    particles.value = []
  }

  const handleResize = () => {
    const width = window.innerWidth || 1200
    const height = window.innerHeight || 800

    particles.value.forEach(particle => {
      if (particle.x > width) particle.x = width - 10
      if (particle.y > height) particle.y = height - 10
    })
  }

  // Funciones de control
  const start = () => {
    initParticles()
    window.addEventListener('resize', handleResize)
  }

  const stop = () => {
    destroyParticles()
    window.removeEventListener('resize', handleResize)
  }

  const pause = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  const resume = () => {
    if (!animationId) {
      animate()
    }
  }

  // Auto-inicialización cuando se monta
  onMounted(() => {
    // Verificar preferencias de usuario
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 768px)').matches
    ) {
      return
    }

    setTimeout(start, 500)
  })

  onUnmounted(() => {
    stop()
  })

  return {
    particles,
    start,
    stop,
    pause,
    resume
  }
}
