<template>
  <div class="modern-stat-card">
    <div class="card-content">
      <div class="stat-header">
        <div class="icon-container" :style="{ background: gradient }">
          <q-icon :name="icon" size="24px" color="white" />
        </div>
        <div v-if="trend" class="trend-indicator">
          <q-icon name="trending_up" size="16px" />
          <span>{{ trend }}</span>
        </div>
      </div>

      <div class="stat-body">
        <div class="stat-value">
          {{ prefix }}{{ formatNumber(value) }}
        </div>
        <div class="stat-title">{{ title }}</div>
        <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>
      </div>
    </div>

    <!-- Elemento decorativo -->
    <div class="decorative-element" :style="{ background: gradient }"></div>
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.modern-stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-content {
  position: relative;
  z-index: 2;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-body {
  text-align: left;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.stat-subtitle {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.decorative-element {
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 1;
}

@media (max-width: 768px) {
  .modern-stat-card {
    padding: 1rem;
  }

  .icon-container {
    width: 50px;
    height: 50px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .trend-indicator {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
}
</style>
