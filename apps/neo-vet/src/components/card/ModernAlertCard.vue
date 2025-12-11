<template>
  <div class="modern-alert-card" :class="alertClasses">
    <!-- Borde lateral colorido -->
    <div class="side-accent" :class="`accent-${type}`"></div>
    
    <div class="alert-content">
      <div class="alert-icon" :class="`icon-${type}`">
        <q-icon :name="icon" :size="iconSize" :color="iconColor" />
      </div>
      <div class="alert-body">
        <div class="alert-message">{{ message }}</div>
        <div class="alert-time">
          <q-icon name="access_time" size="10px" />
          {{ time }}
        </div>
      </div>
      <div class="alert-action">
        <q-btn
          round
          flat
          size="sm"
          icon="close"
          @click="$emit('dismiss')"
          :color="iconColor"
          class="dismiss-btn"
        />
      </div>
    </div>
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
  return props.type === 'urgent' ? '20px' : '18px'
})
</script>

<style scoped>
.modern-alert-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 0.625rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modern-alert-card:hover {
  transform: translateX(3px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.side-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 12px 0 0 12px;
  transition: width 0.3s ease;
}

.modern-alert-card:hover .side-accent {
  width: 4px;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  position: relative;
}

.alert-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.alert-icon::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  opacity: 0;
  filter: blur(8px);
  transition: opacity 0.3s ease;
}

.modern-alert-card:hover .alert-icon {
  transform: scale(1.05);
}

.modern-alert-card:hover .alert-icon::before {
  opacity: 0.3;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-message {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;
}

.alert-time {
  font-size: 0.6875rem;
  color: #9ca3af;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.alert-action {
  flex-shrink: 0;
}

.dismiss-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.dismiss-btn:hover {
  opacity: 1;
}

/* Estilos por tipo de alerta */
.accent-urgent {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.icon-urgent {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1));
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.icon-urgent::before {
  background: #ef4444;
}

.accent-success {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.icon-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.icon-success::before {
  background: #10b981;
}

.accent-warning {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.icon-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1));
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.icon-warning::before {
  background: #f59e0b;
}

.accent-info {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
}

.icon-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1));
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.icon-info::before {
  background: #3b82f6;
}

@media (max-width: 768px) {
  .modern-alert-card {
    padding: 0.75rem;
  }

  .alert-content {
    gap: 0.625rem;
  }

  .alert-icon {
    width: 32px;
    height: 32px;
  }

  .alert-message {
    font-size: 0.75rem;
  }
}
</style>
