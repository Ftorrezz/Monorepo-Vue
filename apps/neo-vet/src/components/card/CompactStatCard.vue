<template>
  <div class="compact-stat-card" @click="$emit('click')">
    <div class="compact-content">
      <div class="compact-icon" :style="{ backgroundColor: color + '20', color: color }">
        <q-icon :name="icon" size="20px" />
      </div>
      <div class="compact-info">
        <div class="compact-value">{{ formatNumber(value) }}</div>
        <div class="compact-title">{{ title }}</div>
      </div>
      <div class="compact-arrow">
        <q-icon name="chevron_right" size="16px" color="grey-5" />
      </div>
    </div>
    <div class="compact-glow" :style="{ backgroundColor: color + '10' }"></div>
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-height: 80px;
}

.compact-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.compact-stat-card:hover .compact-glow {
  opacity: 1;
}

.compact-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.compact-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.compact-info {
  flex: 1;
  min-width: 0;
}

.compact-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.compact-title {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-arrow {
  flex-shrink: 0;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.compact-stat-card:hover .compact-arrow {
  opacity: 1;
  transform: translateX(2px);
}

.compact-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(20px);
  z-index: 1;
}

@media (max-width: 768px) {
  .compact-stat-card {
    padding: 0.75rem;
    min-height: 70px;
  }

  .compact-content {
    gap: 0.5rem;
  }

  .compact-icon {
    width: 32px;
    height: 32px;
  }

  .compact-value {
    font-size: 1rem;
  }

  .compact-title {
    font-size: 0.7rem;
  }
}
</style>
