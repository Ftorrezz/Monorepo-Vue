<template>
  <div class="modern-alert-card" :class="alertClasses">
    <div class="alert-content">
      <div class="alert-icon">
        <q-icon :name="icon" :size="iconSize" :color="iconColor" />
      </div>
      <div class="alert-body">
        <div class="alert-message">{{ message }}</div>
        <div class="alert-time">{{ time }}</div>
      </div>
      <div class="alert-action">
        <q-btn
          round
          flat
          size="sm"
          icon="close"
          @click="$emit('dismiss')"
          :color="iconColor"
        />
      </div>
    </div>
    <div class="progress-bar" :class="typeClass"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['urgent', 'success', 'warning', 'info'].includes(value)
  },
  icon: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['dismiss'])

const alertClasses = computed(() => {
  return `alert-${props.type}`
})

const typeClass = computed(() => {
  return `progress-${props.type}`
})

const iconColor = computed(() => {
  const colors = {
    'urgent': 'negative',
    'success': 'positive',
    'warning': 'warning',
    'info': 'info'
  }
  return colors[props.type] || 'info'
})

const iconSize = computed(() => {
  return props.type === 'urgent' ? '24px' : '20px'
})
</script>

<style scoped>
.modern-alert-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.modern-alert-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-message {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.alert-time {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.alert-action {
  flex-shrink: 0;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  border-radius: 0 0 16px 16px;
}

/* Colores específicos por tipo */
.alert-urgent {
  border-left: 4px solid #ef4444;
}

.alert-urgent .alert-icon {
  background: rgba(239, 68, 68, 0.1);
}

.progress-urgent {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.alert-success {
  border-left: 4px solid #10b981;
}

.alert-success .alert-icon {
  background: rgba(16, 185, 129, 0.1);
}

.progress-success {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.alert-warning {
  border-left: 4px solid #f59e0b;
}

.alert-warning .alert-icon {
  background: rgba(245, 158, 11, 0.1);
}

.progress-warning {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.alert-info {
  border-left: 4px solid #3b82f6;
}

.alert-info .alert-icon {
  background: rgba(59, 130, 246, 0.1);
}

.progress-info {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

@media (max-width: 768px) {
  .modern-alert-card {
    padding: 0.75rem;
  }

  .alert-content {
    gap: 0.5rem;
  }

  .alert-icon {
    width: 32px;
    height: 32px;
  }

  .alert-message {
    font-size: 0.8rem;
  }
}
</style>
