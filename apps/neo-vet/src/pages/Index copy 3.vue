<template>
  <q-page class="able-dashboard">
    <!-- Header / Brand Area -->
    <div class="dashboard-header-bg"></div>
    
    <div class="dashboard-container">
      
      <!-- Top Header Content -->
      <div class="row items-center q-mb-lg text-white header-content">
        <div class="col">
          <h1 class="text-h5 text-weight-bold q-my-none">Dashboard Analytics</h1>
          <div class="breadcrumbs text-grey-4 text-caption q-mt-xs">
            <q-icon name="home" /> / Dashboard Analytics
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row q-col-gutter-lg">
        
        <!-- LEFT COLUMN: Large Analytics Cards (Wave) -->
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-lg">
            
            <!-- Card 1: Mascotas (Support Requests Style) -->
            <div class="col-12 col-md-6">
              <q-card class="able-card wave-card">
                <q-card-section>
                  <div class="text-h3 text-weight-bold text-grey-9">{{ mainStats[0].value }}</div>
                  <div class="text-subtitle1 text-primary q-mb-sm">{{ mainStats[0].title }}</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Total de mascotas atendidas este mes.
                  </div>
                </q-card-section>
                
                <!-- Mini Chart Container -->
                <div class="wave-chart-container">
                  <canvas ref="waveChart1"></canvas>
                </div>

                <q-card-section class="bg-primary text-white row text-center q-py-sm footer-stats">
                  <div class="col">
                    <div class="text-h6">10</div>
                    <div class="text-caption">Nuevos</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-h6">5</div>
                    <div class="text-caption">En Proceso</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-h6">3</div>
                    <div class="text-caption">Alta</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Card 2: Ingresos (Support Requests Style Green) -->
            <div class="col-12 col-md-6">
              <q-card class="able-card wave-card">
                <q-card-section>
                  <div class="text-h3 text-weight-bold text-grey-9">{{ mainStats[2].value }}</div> <!-- Vacunas as proxy -->
                  <div class="text-subtitle1 text-positive q-mb-sm">{{ mainStats[2].title }}</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Total de vacunas aplicadas en el periodo.
                  </div>
                </q-card-section>
                
                <!-- Mini Chart Container -->
                <div class="wave-chart-container">
                  <canvas ref="waveChart2"></canvas>
                </div>

                <q-card-section class="bg-positive text-white row text-center q-py-sm footer-stats">
                  <div class="col">
                    <div class="text-h6">15</div>
                    <div class="text-caption">Perros</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-h6">8</div>
                    <div class="text-caption">Gatos</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-h6">2</div>
                    <div class="text-caption">Otros</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

          </div>
        </div>

        <!-- RIGHT COLUMN: Small Stats Cards (2x2) -->
        <div class="col-12 col-md-4">
          <div class="row q-col-gutter-md">
            
            <!-- Card Small 1: Earnings (Yellow) -->
            <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card">
                <q-card-section class="row items-center justify-between q-pb-none">
                  <div>
                    <div class="text-h6 text-warning text-weight-bold">${{ stats.ingresos_mes }}</div>
                    <div class="text-caption text-grey-7">Ingresos Totales</div>
                  </div>
                  <q-icon name="bar_chart" color="grey-4" size="md" />
                </q-card-section>
                <q-card-section class="q-pt-sm">
                  <div class="bg-warning text-white q-px-sm q-py-xs rounded-borders text-caption text-weight-bold d-inline-block" style="border-radius: 4px;">
                    % change
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Card Small 2: Page Views (Green) -->
            <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card">
                <q-card-section class="row items-center justify-between q-pb-none">
                  <div>
                    <div class="text-h6 text-positive text-weight-bold">290+</div>
                    <div class="text-caption text-grey-7">Citas Nuevas</div>
                  </div>
                  <q-icon name="description" color="grey-4" size="md" />
                </q-card-section>
                <q-card-section class="q-pt-sm">
                  <div class="bg-positive text-white q-px-sm q-py-xs rounded-borders text-caption text-weight-bold d-inline-block" style="border-radius: 4px;">
                    % change
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Card Small 3: Task (Red) -->
            <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card">
                <q-card-section class="row items-center justify-between q-pb-none">
                  <div>
                    <div class="text-h6 text-negative text-weight-bold">{{ tasks.length }}</div>
                    <div class="text-caption text-grey-7">Tareas Activas</div>
                  </div>
                  <q-icon name="calendar_today" color="grey-4" size="md" />
                </q-card-section>
                <q-card-section class="q-pt-sm">
                  <div class="bg-negative text-white q-px-sm q-py-xs rounded-borders text-caption text-weight-bold d-inline-block" style="border-radius: 4px;">
                    % change
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Card Small 4: Downloads (Blue) -->
            <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card">
                <q-card-section class="row items-center justify-between q-pb-none">
                  <div>
                    <div class="text-h6 text-primary text-weight-bold">500</div>
                    <div class="text-caption text-grey-7">Clientes</div>
                  </div>
                  <q-icon name="thumb_up" color="grey-4" size="md" />
                </q-card-section>
                <q-card-section class="q-pt-sm">
                  <div class="bg-primary text-white q-px-sm q-py-xs rounded-borders text-caption text-weight-bold d-inline-block" style="border-radius: 4px;">
                    % change
                  </div>
                </q-card-section>
              </q-card>
            </div>

          </div>
        </div>

      </div> <!-- End Top Row -->

      <!-- Bottom Row: Projects & Updates -->
      <div class="row q-col-gutter-lg q-mt-sm">
        
        <!-- Projects Table (Tasks) -->
        <div class="col-12 col-md-8">
          <q-card class="able-card">
            <q-card-section class="row items-center justify-between border-bottom">
              <div class="text-subtitle1 text-weight-bold text-grey-9">Projects (Tasks)</div>
              <q-btn flat round dense icon="more_horiz" color="grey" />
            </q-card-section>
            
            <q-card-section class="q-pa-none">
              <div class="custom-table">
                <!-- Header -->
                <div class="row q-px-md q-py-sm bg-grey-1 text-grey-7 text-caption text-weight-bold text-uppercase">
                  <div class="col-1"></div>
                  <div class="col-5">Tarea / Responsable</div>
                  <div class="col-3">Fecha</div>
                  <div class="col-3 text-right">Prioridad</div>
                </div>
                
                <!-- Rows -->
                <div 
                  v-for="task in tasks.slice(0, 5)" 
                  :key="task.id" 
                  class="row items-center q-px-md q-py-md border-bottom hover-bg"
                  @click="toggleTask(task.id)"
                >
                  <div class="col-1">
                    <q-checkbox :model-value="task.completed" @update:model-value="toggleTask(task.id)" size="sm" color="grey-6" />
                  </div>
                  <div class="col-5">
                    <div class="row items-center">
                      <q-avatar size="32px" class="q-mr-md">
                        <img :src="`https://i.pravatar.cc/150?u=${task.id}`">
                      </q-avatar>
                      <div>
                        <div class="text-subtitle2 text-grey-9" :class="{ 'text-strike text-grey': task.completed }">{{ task.text }}</div>
                        <div class="text-caption text-grey-6">{{ task.category }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-3 text-grey-8 text-body2">
                    {{ formatDate(new Date()) }}
                  </div>
                  <div class="col-3 text-right">
                    <q-badge 
                      :color="getPriorityColor(task.priority)" 
                      :label="task.priority" 
                      outline 
                      class="text-uppercase" 
                    />
                  </div>
                </div>

              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Latest Updates (Feed) -->
        <div class="col-12 col-md-4">
          <q-card class="able-card full-height">
            <q-card-section class="row items-center justify-between border-bottom">
              <div class="text-subtitle1 text-weight-bold text-grey-9">Latest Updates</div>
              <q-btn flat round dense icon="more_horiz" color="grey" />
            </q-card-section>

            <q-card-section>
              <div class="feed-list">
                
                <div v-for="(alert, index) in alerts" :key="alert.id" class="row q-mb-lg no-wrap">
                  <div class="col-auto q-mr-md column items-center">
                    <div class="text-caption text-grey-6 q-mb-xs">{{ alert.time.split(' ')[0] }}</div>
                    <q-avatar 
                      size="36px" 
                      :color="getAlertColor(alert.type)" 
                      text-color="white" 
                      :icon="alert.icon" 
                      font-size="16px"
                    />
                  </div>
                  <div class="col">
                     <div class="text-subtitle2 text-grey-9 text-weight-bold">{{ alert.title }}</div>
                     <div class="text-body2 text-grey-7">{{ alert.message }}</div>
                     <div v-if="index === 0" class="q-mt-xs text-primary text-caption text-weight-bold pointer">
                       View more details
                     </div>
                  </div>
                </div>

              </div>
            </q-card-section>
          </q-card>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useDashboard } from '../composables/useDashboard'

Chart.register(...registerables)

const {
  mainStats,
  upcomingAppointments,
  alerts,
  tasks,
  stats,
  toggleTask
} = useDashboard()

const waveChart1 = ref(null)
const waveChart2 = ref(null)
let chartInstance1 = null
let chartInstance2 = null

const getPriorityColor = (p) => {
  if (p === 'high') return 'negative'
  if (p === 'medium') return 'primary' // Blue in Able Pro
  return 'positive'
}

const getAlertColor = (type) => {
  if (type === 'urgent') return 'negative'
  if (type === 'info') return 'primary'
  if (type === 'success') return 'positive'
  return 'warning'
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const initCharts = () => {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 }
    },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4, borderWidth: 2 }
    }
  }

  // Wave Chart 1 (Blue)
  if (waveChart1.value) {
    const ctx = waveChart1.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 150)
    gradient.addColorStop(0, 'rgba(68, 138, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(68, 138, 255, 0)')

    chartInstance1 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [1,2,3,4,5,6,7],
        datasets: [{
          data: [10, 25, 15, 30, 20, 45, 30],
          borderColor: '#448aff',
          backgroundColor: gradient,
          fill: true
        }]
      },
      options: commonOptions
    })
  }

  // Wave Chart 2 (Green)
  if (waveChart2.value) {
    const ctx = waveChart2.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 150)
    gradient.addColorStop(0, 'rgba(0, 200, 83, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 200, 83, 0)')

    chartInstance2 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [1,2,3,4,5,6,7],
        datasets: [{
          data: [15, 20, 25, 10, 30, 20, 40],
          borderColor: '#00e676',
          backgroundColor: gradient,
          fill: true
        }]
      },
      options: commonOptions
    })
  }
}

onMounted(async () => {
  await nextTick()
  initCharts()
})

onUnmounted(() => {
  if (chartInstance1) chartInstance1.destroy()
  if (chartInstance2) chartInstance2.destroy()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

.able-dashboard {
  background-color: #f4f7fa;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  position: relative;
}

.dashboard-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: #448aff; /* Able Pro Blue */
  z-index: 0;
}

.dashboard-container {
  position: relative;
  z-index: 1;
  padding: 20px 30px;
}

.able-card {
  border-radius: 4px;
  box-shadow: 0 1px 20px 0 rgba(69,90,100,0.08); /* Soft shadow */
  background: white;
  transition: all 0.3s ease-in-out;
  border: none;
}

.able-card:hover {
  box-shadow: 0 10px 30px 0 rgba(69,90,100,0.15); /* Hover shadow */
}

/* Wave Charts Section */
.wave-card {
  overflow: hidden;
  position: relative;
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.wave-chart-container {
  height: 100px;
  width: 100%;
  margin-top: auto; /* Push to bottom before footer */
  padding-bottom: 0; /* Align with footer */
}

.footer-stats {
  z-index: 2;
  position: relative;
}

.border-left-white {
  border-left: 1px solid rgba(255,255,255,0.3);
}

/* Small Stats Cards */
.small-stat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Table Styles */
.custom-table {
  width: 100%;
}

.border-bottom {
  border-bottom: 1px solid #f1f3f4;
}

.hover-bg:hover {
  background-color: #fafafa;
  cursor: pointer;
}

/* Colors helpers matching Able Pro */
.text-primary { color: #448aff !important; }
.bg-primary { background-color: #448aff !important; }

.text-positive { color: #00e676 !important; } /* Green */
.bg-positive { background-color: #00e676 !important; }

.text-warning { color: #ffb300 !important; } /* Amber */
.bg-warning { background-color: #ffb300 !important; }

.text-negative { color: #ff5252 !important; } /* Red */
.bg-negative { background-color: #ff5252 !important; }

.text-grey-9 { color: #37474f !important; }
</style>
