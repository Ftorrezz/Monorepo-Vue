<template>
  <div class="modern-stat-card">
    <!-- Borde gradiente animado -->
    <div class="gradient-border" :style="{ background: gradient }"></div>
    
    <div class="card-content">
      <div class="stat-header">
        <div class="icon-wrapper">
          <div class="icon-glow" :style="{ background: gradient }"></div>
          <div class="icon-container" :style="{ background: gradient }">
            <q-icon :name="icon" size="28px" color="white" />
          </div>
        </div>
        <div v-if="trend" class="trend-indicator">
          <q-icon name="trending_up" size="14px" />
          <span>{{ trend }}</span>
        </div>
      </div>

      <div class="stat-body">
        <div class="stat-value" :style="{ backgroundImage: gradient }">
          {{ prefix }}{{ formatNumber(value) }}
        </div>
        <div class="stat-title">{{ title }}</div>
        <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>
      </div>
    </div>

    <!-- Patrón de puntos decorativo -->
    <div class="dot-pattern"></div>
    
    <!-- Elemento decorativo con gradiente -->
    <div class="decorative-circle" :style="{ background: gradient }"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  gradient: {
    type: String,
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  subtitle: {
    type: String,
    default: null
  },
  trend: {
    type: String,
    default: null
  },
  prefix: {
    type: String,
    default: ''
  }
})

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString('es-ES')
}
</script>

<style scoped>
.modern-stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 0.875rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.modern-stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

.modern-stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modern-stat-card:hover .icon-container {
  transform: scale(1.1) rotate(5deg);
}

.modern-stat-card:hover .icon-glow {
  opacity: 0.4;
  transform: scale(1.3);
}

.modern-stat-card:hover .decorative-circle {
  transform: scale(1.2) translate(10px, 10px);
  opacity: 0.15;
}

.gradient-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 20px 20px 0 0;
  opacity: 0.8;
}

.card-content {
  position: relative;
  z-index: 2;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.icon-wrapper {
  position: relative;
}

.icon-glow {
  position: absolute;
  inset: -8px;
  border-radius: 16px;
  opacity: 0.2;
  filter: blur(12px);
  transition: all 0.4s ease;
  z-index: 0;
}

.icon-container {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 1;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(56, 142, 60, 0.15));
  color: #2e7d32;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid rgba(76, 175, 80, 0.2);
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.1);
}

.stat-body {
  text-align: left;
}

.stat-value {
  font-size: 1.625rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.375rem;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.stat-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.125rem;
  letter-spacing: -0.01em;
}

.stat-subtitle {
  font-size: 0.6875rem;
  color: #9ca3af;
  font-weight: 500;
}

.dot-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  opacity: 0.03;
  background-image: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 8px 8px;
  z-index: 1;
}

.decorative-circle {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.08;
  z-index: 1;
  transition: all 0.4s ease;
  filter: blur(20px);
}

@media (max-width: 768px) {
  .modern-stat-card {
    padding: 1rem;
  }

  .icon-container {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .trend-indicator {
    font-size: 0.65rem;
    padding: 5px 8px;
  }
}
</style>
