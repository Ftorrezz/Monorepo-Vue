<template>
  <div class="compact-stat-card" @click="$emit('click')">
    <!-- Indicador de color superior -->
    <div class="color-indicator" :style="{ background: color }"></div>
    
    <div class="compact-content">
      <div class="compact-icon-wrapper">
        <div class="icon-bg" :style="{ backgroundColor: color + '15' }"></div>
        <div class="compact-icon" :style="{ color: color }">
          <q-icon :name="icon" size="22px" />
        </div>
      </div>
      <div class="compact-info">
        <div class="compact-value">{{ formatNumber(value) }}</div>
        <div class="compact-title">{{ title }}</div>
      </div>
      <div class="compact-arrow">
        <q-icon name="arrow_forward" size="18px" :color="color" />
      </div>
    </div>
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
  color: {
    type: String,
    default: '#667eea'
  }
})

const emit = defineEmits(['click'])

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
.compact-stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 0.625rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-height: 60px;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.compact-stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.compact-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.compact-stat-card:hover::before {
  opacity: 1;
}

.compact-stat-card:hover .compact-arrow {
  opacity: 1;
  transform: translateX(3px);
}

.compact-stat-card:hover .compact-icon {
  transform: scale(1.1);
}

.color-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 12px 12px 0 0;
  opacity: 0.7;
}

.compact-content {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  position: relative;
  z-index: 2;
}

.compact-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.icon-bg {
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  opacity: 0.5;
}

.compact-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
}

.compact-info {
  flex: 1;
  min-width: 0;
}

.compact-value {
  font-size: 1.0625rem;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.compact-title {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 600;
  margin-top: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.compact-arrow {
  flex-shrink: 0;
  opacity: 0.5;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .compact-stat-card {
    padding: 0.75rem;
    min-height: 65px;
  }

  .compact-content {
    gap: 0.625rem;
  }

  .compact-icon {
    width: 36px;
    height: 36px;
  }

  .compact-value {
    font-size: 1.125rem;
  }

  .compact-title {
    font-size: 0.65rem;
  }
}
</style>
