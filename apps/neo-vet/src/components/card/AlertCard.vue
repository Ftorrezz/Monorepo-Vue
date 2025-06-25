<template>
  <q-card
    flat
    bordered
    class="alert-card"
    :class="alertClasses"
  >
    <q-card-section class="q-pa-md">
      <div class="row items-start q-gutter-md">
        <q-icon
          :name="icon"
          size="20px"
          :color="iconColor"
        />
        <div class="col">
          <div class="text-body2 text-weight-medium q-mb-xs">
            {{ message }}
          </div>
          <div class="text-caption text-grey-6">
            {{ time }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['negative', 'positive', 'warning', 'info'].includes(value)
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

const alertClasses = computed(() => {
  const classes = {
    'negative': 'alert-negative',
    'positive': 'alert-positive',
    'warning': 'alert-warning',
    'info': 'alert-info'
  }
  return classes[props.type] || 'alert-info'
})

const iconColor = computed(() => {
  const colors = {
    'negative': 'negative',
    'positive': 'positive',
    'warning': 'warning',
    'info': 'info'
  }
  return colors[props.type] || 'info'
})
</script>

<style scoped>
.alert-card {
  border-radius: 8px;
  margin-bottom: 8px;
}

.alert-negative {
  border-left: 4px solid #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.alert-positive {
  border-left: 4px solid #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.alert-warning {
  border-left: 4px solid #ff9800;
  background: rgba(255, 152, 0, 0.05);
}

.alert-info {
  border-left: 4px solid #2196f3;
  background: rgba(33, 150, 243, 0.05);
}
</style>
