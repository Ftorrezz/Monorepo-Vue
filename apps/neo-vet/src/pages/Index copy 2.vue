<template>
  <q-page class="dashboard-page">
    <!-- Top Global Header - Very Discrete -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="text-h6 text-weight-bold">Dashboard</h1>
        <span class="text-caption text-grey-7">{{ formatDate(currentTime) }}</span>
      </div>
      <div class="header-right">
        <div class="server-status">
          <q-badge rounded color="positive" class="q-mr-xs" />
          <span class="text-caption text-grey-7">Sincronizado</span>
        </div>
        <div class="clock q-ml-md">
          <span class="text-weight-medium">{{ formatTime(currentTime) }}</span>
        </div>
      </div>
    </header>

    <div class="dashboard-grid">
      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Key Stats Section -->
        <section class="stats-overview">
          <div v-for="stat in mainStats" :key="stat.id" class="stat-item">
            <modern-stat-card v-bind="stat" />
          </div>
        </section>

        <!-- Charts Section -->
        <section class="charts-area">
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="text-subtitle2 text-weight-bold">Actividad de Citas</span>
              <q-btn flat round dense icon="more_vert" size="sm" color="grey-7" />
            </div>
            <div class="chart-body">
              <canvas ref="appointmentsChart"></canvas>
            </div>
          </div>
          
          <div class="chart-wrapper">
            <div class="chart-header">
              <span class="text-subtitle2 text-weight-bold">Servicios Populares</span>
              <q-btn flat round dense icon="more_vert" size="sm" color="grey-7" />
            </div>
            <div class="chart-body doughnut">
              <canvas ref="servicesChart"></canvas>
            </div>
          </div>
        </section>

        <!-- Secondary Stats - Discrete Grid -->
        <section class="secondary-stats">
          <div v-for="stat in secondaryStats" :key="stat.id">
            <compact-stat-card v-bind="stat" />
          </div>
        </section>
      </main>

      <!-- Sidebar / Right Column -->
      <aside class="dashboard-sidebar">
        <!-- Upcoming Appointments -->
        <div class="sidebar-section">
          <div class="section-header">
            <span class="text-subtitle2 text-weight-bold">Próximas Citas</span>
            <q-badge outline color="primary" :label="upcomingAppointments.length" />
          </div>
          <div class="appointments-list">
            <div v-for="apt in upcomingAppointments" :key="apt.id" class="apt-card">
              <div class="apt-time">{{ apt.time }}</div>
              <div class="apt-details">
                <div class="apt-pet">{{ apt.pet }}</div>
                <div class="apt-owner">{{ apt.owner }}</div>
              </div>
              <q-icon :name="getAptIcon(apt.type)" color="grey-5" size="xs" />
            </div>
          </div>
        </div>

        <!-- Real-time Alerts -->
        <div class="sidebar-section alerts-section">
          <div class="section-header">
            <span class="text-subtitle2 text-weight-bold">Actividad Reciente</span>
            <q-btn flat dense no-caps label="Ver todo" color="primary" size="sm" />
          </div>
          <div class="alerts-list">
            <modern-alert-card
              v-for="alert in alerts"
              :key="alert.id"
              v-bind="alert"
            />
          </div>
        </div>
      </aside>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useDashboard } from '../composables/useDashboard'
import ModernStatCard from './../components/card/ModernStatCard.vue'
import ModernAlertCard from './../components/card/ModernAlertCard.vue'
import CompactStatCard from './../components/card/CompactStatCard.vue'

Chart.register(...registerables)

const {
  mainStats,
  secondaryStats,
  upcomingAppointments,
  alerts
} = useDashboard()

// Time logic
const currentTime = ref(new Date())
let timeInterval = null

// Charts refs & instances
const appointmentsChart = ref(null)
const servicesChart = ref(null)
let appointmentsChartInstance = null
let servicesChartInstance = null

const appointmentsData = [
  { time: '08:00', citas: 3 }, { time: '10:00', citas: 8 },
  { time: '12:00', citas: 4 }, { time: '14:00', citas: 7 },
  { time: '16:00', citas: 6 }, { time: '18:00', citas: 3 }
]

const servicesData = [
  { name: 'Consultas', value: 45, color: '#6366f1' },
  { name: 'Vacunas', value: 25, color: '#10b981' },
  { name: 'Cirugías', value: 15, color: '#f59e0b' },
  { name: 'Otros', value: 15, color: '#94a3b8' }
]

const formatDate = (date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit'
  })
}

const getAptIcon = (type) => {
  switch(type) {
    case 'Cirugía': return 'healing'
    case 'Vacuna': return 'medical_services'
    default: return 'pets'
  }
}

const initCharts = () => {
  if (appointmentsChart.value) {
    const ctx = appointmentsChart.value.getContext('2d')
    appointmentsChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: appointmentsData.map(d => d.time),
        datasets: [{
          data: appointmentsData.map(d => d.citas),
          borderColor: '#6366f1',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.05)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } }
        }
      }
    })
  }

  if (servicesChart.value) {
    const ctx = servicesChart.value.getContext('2d')
    servicesChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: servicesData.map(d => d.name),
        datasets: [{
          data: servicesData.map(d => d.value),
          backgroundColor: servicesData.map(d => d.color),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 }, padding: 10 } }
        }
      }
    })
  }
}

onMounted(async () => {
  timeInterval = setInterval(() => { currentTime.value = new Date() }, 1000)
  await nextTick()
  initCharts()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (appointmentsChartInstance) appointmentsChartInstance.destroy()
  if (servicesChartInstance) servicesChartInstance.destroy()
})
</script>

<style scoped>
.dashboard-page {
  background-color: #f8fafc;
  color: #1e293b;
  padding: 1rem 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Charts Section */
.charts-area {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-body {
  height: 240px;
}

.chart-body.doughnut {
  height: 260px;
}

/* Secondary Stats */
.secondary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

/* Sidebar */
.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.apt-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.apt-card:hover {
  transform: translateX(4px);
}

.apt-time {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6366f1;
  min-width: 45px;
}

.apt-details {
  flex: 1;
}

.apt-pet {
  font-size: 0.85rem;
  font-weight: 600;
}

.apt-owner {
  font-size: 0.75rem;
  color: #64748b;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .charts-area {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 0.75rem;
  }
  .stats-overview {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
