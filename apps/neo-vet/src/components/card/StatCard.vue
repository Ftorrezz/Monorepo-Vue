<template>
  <q-card class="stat-card" flat bordered>
    <q-card-section class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <q-avatar
          :color="color"
          text-color="white"
          size="48px"
          :icon="icon"
        />
        <div v-if="trend" class="trend-badge">
          <q-icon name="trending_up" size="16px" />
          <span class="text-body2 text-weight-medium">{{ trend }}</span>
        </div>
      </div>

      <div>
        <div class="text-h5 text-weight-bold text-grey-9 q-mb-xs">
          {{ formatNumber(value) }}
        </div>
        <div class="text-body1 text-weight-medium text-grey-7">
          {{ title }}
        </div>
        <div v-if="subtitle" class="text-caption text-grey-6 q-mt-xs">
          {{ subtitle }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

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
    default: 'primary'
  },
  subtitle: {
    type: String,
    default: null
  },
  trend: {
    type: String,
    default: null
  }
})

const formatNumber = (num) => {
  return num.toLocaleString('es-ES')
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.trend-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #388e3c;
  background: rgba(56, 142, 60, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}
</style>
