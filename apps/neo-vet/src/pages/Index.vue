<template>
  <q-page class="vet-dashboard">
    <!-- Header Compacto -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <q-icon name="pets" size="32px" color="primary" class="header-icon" />
          <div class="header-info">
            <h1 class="dashboard-title">VetCare Dashboard</h1>
            <p class="dashboard-subtitle">Sistema de Gestión Veterinaria</p>
          </div>
        </div>
        <div class="header-right">
          <div class="time-display">
            <div class="current-time">{{ formatTime(currentTime) }}</div>
            <div class="current-date">{{ formatDate(currentTime) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Grid Principal - 4 columnas compactas -->
      <div class="stats-grid-main">
        <div v-for="stat in mainStats" :key="stat.id">
          <modern-stat-card v-bind="stat" />
        </div>
      </div>

      <!-- Contenido en Grid: Gráficos + Alertas -->
      <div class="content-grid">
        <!-- Columna Izquierda: Gráficos -->
        <div class="charts-column">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Citas por Hora</h3>
              <span class="chart-badge">Hoy</span>
            </div>
            <div class="chart-container">
              <canvas ref="appointmentsChart"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>Distribución de Servicios</h3>
              <span class="chart-badge">Este mes</span>
            </div>
            <div class="chart-container">
              <canvas ref="servicesChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Alertas + Próximas Citas -->
        <div class="sidebar-column">
          <div class="alerts-panel">
            <div class="panel-header">
              <h3>Alertas</h3>
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

          <div class="upcoming-panel">
            <div class="panel-header">
              <h3>Próximas Citas</h3>
              <q-badge color="primary" label="5" />
            </div>
            <div class="upcoming-list">
              <div v-for="appointment in upcomingAppointments" :key="appointment.id" class="appointment-item">
                <div class="appointment-time">{{ appointment.time }}</div>
                <div class="appointment-info">
                  <div class="appointment-pet">{{ appointment.pet }}</div>
                  <div class="appointment-owner">{{ appointment.owner }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Secundarias - Grid compacto 6 columnas -->
      <div class="stats-grid-secondary">
        <div v-for="stat in secondaryStats" :key="stat.id">
          <compact-stat-card v-bind="stat" />
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

// Próximas citas
const upcomingAppointments = ref([
  { id: 1, time: '09:00', pet: 'Max', owner: 'Juan Pérez' },
  { id: 2, time: '10:30', pet: 'Luna', owner: 'María García' },
  { id: 3, time: '11:00', pet: 'Rocky', owner: 'Carlos López' },
  { id: 4, time: '14:00', pet: 'Bella', owner: 'Ana Martínez' },
  { id: 5, time: '15:30', pet: 'Coco', owner: 'Luis Rodríguez' }
])

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
  { name: 'Consultas', value: 45, color: '#10b981' },
  { name: 'Vacunación', value: 25, color: '#3b82f6' },
  { name: 'Cirugías', value: 15, color: '#8b5cf6' },
  { name: 'Emergencias', value: 10, color: '#ef4444' },
  { name: 'Otros', value: 5, color: '#f59e0b' }
]

// Computed properties para las estadísticas organizadas
const mainStats = computed(() => [
  {
    id: 'mascotas',
    title: 'Mascotas Atendidas',
    value: stats.value.mascotas_atendidas,
    icon: 'pets',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    subtitle: 'Este mes',
    trend: '+12%'
  },
  {
    id: 'citas',
    title: 'Citas Asignadas',
    value: stats.value.citas_asignadas,
    icon: 'event',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    subtitle: 'Hoy',
    trend: '+5%'
  },
  {
    id: 'vacunas',
    title: 'Vacunas Aplicadas',
    value: stats.value.vacunas_aplicadas,
    icon: 'medical_services',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    subtitle: 'Este mes',
    trend: '+18%'
  },
  {
    id: 'ingresos',
    title: 'Ingresos del Mes',
    value: stats.value.ingresos_mes,
    icon: 'attach_money',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
    color: '#10b981'
  },
  {
    id: 'hospitalizaciones',
    title: 'Hospitalizaciones',
    value: stats.value.hospitalizaciones,
    icon: 'local_hospital',
    color: '#ef4444'
  },
  {
    id: 'cirugias',
    title: 'Cirugías',
    value: stats.value.cirugias_realizadas,
    icon: 'healing',
    color: '#8b5cf6'
  },
  {
    id: 'emergencias',
    title: 'Emergencias',
    value: stats.value.consultas_emergencia,
    icon: 'emergency',
    color: '#f59e0b'
  },
  {
    id: 'clientes',
    title: 'Clientes Nuevos',
    value: stats.value.clientes_nuevos,
    icon: 'group_add',
    color: '#3b82f6'
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
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5
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
              color: 'rgba(0, 0, 0, 0.05)'
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
            cutout: '70%'
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
              padding: 15,
              font: {
                size: 11
              }
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
/* Variables de colores veterinarios */
:root {
  --vet-primary: #10b981;
  --vet-secondary: #3b82f6;
  --vet-accent: #f59e0b;
  --vet-danger: #ef4444;
  --vet-purple: #8b5cf6;
}

.vet-dashboard {
  background: linear-gradient(135deg, #f0fdf4 0%, #dbeafe 50%, #fef3c7 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 0.5rem;
}

/* Header Compacto */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 0.625rem 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white !important;
  padding: 0.5rem;
  border-radius: 12px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.dashboard-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dashboard-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 500;
}

.time-display {
  text-align: right;
}

.current-time {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}

.current-date {
  color: #6b7280;
  font-size: 0.65rem;
  text-transform: capitalize;
}

/* Dashboard Content */
.dashboard-content {
  max-width: 100%;
  margin: 0;
}

/* Stats Grid Principal - 4 columnas */
.stats-grid-main {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Content Grid: 2 columnas (gráficos + sidebar) */
.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.charts-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Chart Cards */
.chart-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
}

.chart-badge {
  font-size: 0.7rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-weight: 500;
}

.chart-container {
  height: 200px;
}

/* Alerts Panel */
.alerts-panel,
.upcoming-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

/* Upcoming Appointments */
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 8px;
  border-left: 3px solid #10b981;
  transition: all 0.2s ease;
}

.appointment-item:hover {
  background: rgba(16, 185, 129, 0.1);
  transform: translateX(2px);
}

.appointment-time {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #10b981;
  min-width: 45px;
}

.appointment-info {
  flex: 1;
}

.appointment-pet {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}

.appointment-owner {
  font-size: 0.65rem;
  color: #6b7280;
}

/* Stats Secundarias - 6 columnas */
.stats-grid-secondary {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 1400px) {
  .stats-grid-main {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid-secondary {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid-secondary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .vet-dashboard {
    padding: 0.375rem;
  }

  .dashboard-header {
    padding: 0.75rem;
  }

  .header-content {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .time-display {
    text-align: left;
  }

  .stats-grid-main {
    grid-template-columns: 1fr;
  }

  .stats-grid-secondary {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 200px;
  }
}
</style>
