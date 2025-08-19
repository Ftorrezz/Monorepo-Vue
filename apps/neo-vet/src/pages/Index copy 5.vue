<template>
  <q-page class="modern-dashboard">
    <!-- Header compacto y elegante -->
    <div class="dashboard-header q-pa-lg q-mb-lg">
      <div class="row items-center justify-between">
        <div class="header-info">
          <h1 class="dashboard-title">VetCare Dashboard</h1>
          <p class="dashboard-subtitle">Sistema de Gestión Veterinaria</p>
        </div>
        <div class="time-display">
          <div class="current-time">{{ formatTime(currentTime) }}</div>
          <div class="current-date">{{ formatDate(currentTime) }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-content q-px-lg">
      <!-- Stats Grid Principal -->
      <div class="stats-grid q-mb-xl">
        <div v-for="stat in mainStats" :key="stat.id" class="stat-item">
          <modern-stat-card v-bind="stat" />
        </div>
      </div>

      <!-- Contenido en Grid -->
      <div class="content-grid">
        <!-- Gráficos -->
        <div class="chart-section">
          <div class="chart-card appointments-chart">
            <div class="chart-header">
              <h3>Citas por Hora</h3>
              <span class="chart-subtitle">Hoy</span>
            </div>
            <div class="chart-container">
              <canvas ref="appointmentsChart"></canvas>
            </div>
          </div>

          <div class="chart-card services-chart">
            <div class="chart-header">
              <h3>Distribución de Servicios</h3>
              <span class="chart-subtitle">Este mes</span>
            </div>
            <div class="chart-container">
              <canvas ref="servicesChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Panel de Alertas Moderno -->
        <div class="alerts-panel">
          <div class="panel-header">
            <h3>Alertas Recientes</h3>
            <q-badge color="negative" :label="alerts.length" />
          </div>
          <div class="alerts-container">
            <modern-alert-card
              v-for="alert in alerts"
              :key="alert.id"
              v-bind="alert"
            />
          </div>
        </div>
      </div>

      <!-- Stats Secundarias -->
      <div class="secondary-stats q-mt-xl">
        <h3 class="section-title">Métricas Adicionales</h3>
        <div class="secondary-grid">
          <div v-for="stat in secondaryStats" :key="stat.id" class="secondary-stat">
            <compact-stat-card v-bind="stat" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import ModernStatCard from './../components/card/ModernStatCard.vue'
import ModernAlertCard from './../components/card/ModernAlertCard.vue'
import CompactStatCard from './../components/card/CompactStatCard.vue'

Chart.register(...registerables)

// Refs reactivos
const currentTime = ref(new Date())
const appointmentsChart = ref(null)
const servicesChart = ref(null)

// Timer para actualizar hora
let timeInterval = null
let appointmentsChartInstance = null
let servicesChartInstance = null

// Datos de estadísticas
const stats = ref({
  mascotas_atendidas: 847,
  citas_asignadas: 34,
  vacunas_aplicadas: 156,
  desparasitaciones: 89,
  hospitalizaciones: 12,
  cirugias_realizadas: 23,
  consultas_emergencia: 18,
  ingresos_mes: 45750,
  clientes_nuevos: 67,
  medicamentos_dispensados: 234
})

// Datos para gráficos
const appointmentsData = [
  { time: '08:00', citas: 3 },
  { time: '09:00', citas: 5 },
  { time: '10:00', citas: 8 },
  { time: '11:00', citas: 6 },
  { time: '12:00', citas: 4 },
  { time: '13:00', citas: 2 },
  { time: '14:00', citas: 7 },
  { time: '15:00', citas: 9 },
  { time: '16:00', citas: 6 },
  { time: '17:00', citas: 4 },
  { time: '18:00', citas: 3 }
]

const servicesData = [
  { name: 'Consultas', value: 45, color: '#667eea' },
  { name: 'Vacunación', value: 25, color: '#764ba2' },
  { name: 'Cirugías', value: 15, color: '#f093fb' },
  { name: 'Emergencias', value: 10, color: '#4facfe' },
  { name: 'Otros', value: 5, color: '#43e97b' }
]

// Computed properties para las estadísticas organizadas
const mainStats = computed(() => [
  {
    id: 'mascotas',
    title: 'Mascotas Atendidas',
    value: stats.value.mascotas_atendidas,
    icon: 'pets',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    subtitle: 'Este mes',
    trend: '+12%'
  },
  {
    id: 'citas',
    title: 'Citas Asignadas',
    value: stats.value.citas_asignadas,
    icon: 'event',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    subtitle: 'Hoy',
    trend: '+5%'
  },
  {
    id: 'vacunas',
    title: 'Vacunas Aplicadas',
    value: stats.value.vacunas_aplicadas,
    icon: 'medical_services',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    subtitle: 'Este mes',
    trend: '+18%'
  },
  {
    id: 'ingresos',
    title: 'Ingresos del Mes',
    value: stats.value.ingresos_mes,
    icon: 'attach_money',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    subtitle: 'Pesos mexicanos',
    trend: '+8%',
    prefix: '$'
  }
])

const secondaryStats = computed(() => [
  {
    id: 'desparasitaciones',
    title: 'Desparasitaciones',
    value: stats.value.desparasitaciones,
    icon: 'shield',
    color: '#ff9500'
  },
  {
    id: 'hospitalizaciones',
    title: 'Hospitalizaciones',
    value: stats.value.hospitalizaciones,
    icon: 'local_hospital',
    color: '#ff6b6b'
  },
  {
    id: 'cirugias',
    title: 'Cirugías',
    value: stats.value.cirugias_realizadas,
    icon: 'healing',
    color: '#a855f7'
  },
  {
    id: 'emergencias',
    title: 'Emergencias',
    value: stats.value.consultas_emergencia,
    icon: 'emergency',
    color: '#ef4444'
  },
  {
    id: 'clientes',
    title: 'Clientes Nuevos',
    value: stats.value.clientes_nuevos,
    icon: 'group_add',
    color: '#06b6d4'
  },
  {
    id: 'medicamentos',
    title: 'Medicamentos',
    value: stats.value.medicamentos_dispensados,
    icon: 'medication',
    color: '#ec4899'
  }
])

const alerts = ref([
  {
    id: 1,
    type: 'urgent',
    icon: 'emergency',
    message: 'Paciente Rex requiere atención inmediata',
    time: 'Hace 5 min'
  },
  {
    id: 2,
    type: 'info',
    icon: 'schedule',
    message: 'Recordatorio: Vacunación de Luna mañana',
    time: 'Hace 15 min'
  },
  {
    id: 3,
    type: 'success',
    icon: 'check_circle',
    message: 'Cirugía de Max completada exitosamente',
    time: 'Hace 1 hora'
  },
  {
    id: 4,
    type: 'warning',
    icon: 'inventory_2',
    message: 'Stock bajo de vacuna antirrábica',
    time: 'Hace 2 horas'
  }
])

// Métodos
const formatDate = (date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const createAppointmentsChart = () => {
  if (appointmentsChart.value) {
    if (appointmentsChartInstance) {
      appointmentsChartInstance.destroy()
    }
    const ctx = appointmentsChart.value.getContext('2d')
    appointmentsChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: appointmentsData.map((d) => d.time),
        datasets: [
          {
            label: 'Citas',
            data: appointmentsData.map((d) => d.citas),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              borderDash: [2, 2],
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    })
  }
}

const createServicesChart = () => {
  if (servicesChart.value) {
    if (servicesChartInstance) {
      servicesChartInstance.destroy()
    }
    const ctx = servicesChart.value.getContext('2d')
    servicesChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: servicesData.map((d) => d.name),
        datasets: [
          {
            data: servicesData.map((d) => d.value),
            backgroundColor: servicesData.map((d) => d.color),
            borderWidth: 0,
            cutout: '65%'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    })
  }
}

// Lifecycle hooks
onMounted(async () => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  await nextTick()
  createAppointmentsChart()
  createServicesChart()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (appointmentsChartInstance) {
    appointmentsChartInstance.destroy()
  }
  if (servicesChartInstance) {
    servicesChartInstance.destroy()
  }
})
</script>

<style scoped>
.modern-dashboard {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dashboard-subtitle {
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.time-display {
  text-align: right;
}

.current-time {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.current-date {
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-section {
  display: grid;
  gap: 1.5rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chart-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.chart-container {
  height: 300px;
}

.alerts-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.secondary-stats {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.secondary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }

  .dashboard-content {
    padding: 0 1rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .secondary-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
