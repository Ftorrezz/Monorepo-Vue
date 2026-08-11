<template>
  <q-page class="able-dashboard">
    <!-- Header / Brand Area -->
    <div class="dashboard-header-bg"></div>
    
    <div class="dashboard-container">
      
      <!-- Top Header Content + Shortcuts -->
      <div class="row items-center justify-between q-mb-md text-white header-content relative-position">
        <div class="col-12 col-md-5">
          <h1 class="text-h5 text-weight-bold q-my-none">Dashboard General</h1>
          <div class="breadcrumbs text-grey-4 text-caption q-mt-xs">
            <q-icon name="home" /> / Vista General
          </div>
        </div>
        
        <!-- Shortcuts / Quick Access -->
        <div class="col-12 col-md-7 row justify-end q-gutter-x-sm module-shortcuts">
          <q-btn push color="white" text-color="primary" label="Nueva Cita" icon="add_circle" class="shortcut-btn" no-caps />
          <q-btn push color="white" text-color="primary" label="Paciente" icon="person_add" class="shortcut-btn" no-caps />
          <q-btn push color="white" text-color="primary" label="Venta" icon="point_of_sale" class="shortcut-btn" no-caps />
          <q-btn push color="white" text-color="primary" label="Agenda" icon="calendar_month" class="shortcut-btn" no-caps />
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row q-col-gutter-md">
        
        <!-- LEFT COLUMN: Large Analytics Cards (Wave) -->
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-md">
            
            <!-- Card 1: Control de Citas -->
            <div class="col-12 col-md-6">
              <q-card class="able-card wave-card">
                <q-card-section class="q-pa-sm">
                  <div class="text-h4 text-weight-bold text-grey-9">{{ mainStats[0].value }}</div>
                  <div class="text-subtitle2 text-primary">Citas del Mes</div>
                </q-card-section>
                
                <!-- Mini Chart Container -->
                <div class="wave-chart-container">
                  <canvas ref="waveChart1"></canvas>
                </div>

                <q-card-section class="bg-primary text-white row text-center q-py-xs footer-stats">
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold">12</div>
                    <div class="text-caption-xs">Hoy</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-subtitle1 text-weight-bold">5</div>
                    <div class="text-caption-xs">Pendientes</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-subtitle1 text-weight-bold">98%</div>
                    <div class="text-caption-xs">Asistencia</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Card 2: Servicios Aplicados -->
            <div class="col-12 col-md-6">
              <q-card class="able-card wave-card">
                <q-card-section class="q-pa-sm">
                  <div class="text-h4 text-weight-bold text-grey-9">{{ mainStats[2].value }}</div>
                  <div class="text-subtitle2 text-positive">Servicios Aplicados</div>
                </q-card-section>
                
                <!-- Mini Chart Container -->
                <div class="wave-chart-container">
                  <canvas ref="waveChart2"></canvas>
                </div>

                <q-card-section class="bg-positive text-white row text-center q-py-xs footer-stats">
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold">156</div>
                    <div class="text-caption-xs">Vacunas</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-subtitle1 text-weight-bold">45</div>
                    <div class="text-caption-xs">Consultas</div>
                  </div>
                  <div class="col border-left-white">
                    <div class="text-subtitle1 text-weight-bold">23</div>
                    <div class="text-caption-xs">Cirugías</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

          </div>
        </div>

        <!-- RIGHT COLUMN: Small Stats Cards (2x2) -->
        <div class="col-12 col-md-4">
          <div class="row q-col-gutter-sm">
            <!-- Small Cards -->
            <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card q-pa-sm">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-h6 text-warning text-weight-bold">${{ stats.ingresos_mes / 1000 }}k</div>
                    <div class="text-caption text-grey-7 line-height-tight">Ingresos</div>
                  </div>
                  <q-icon name="payments" color="grey-4" size="md" />
                </div>
                <div class="q-mt-sm">
                   <q-badge color="orange" text-color="white" label="+8%" />
                </div>
              </q-card>
            </div>

            <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card q-pa-sm">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-h6 text-positive text-weight-bold">847</div>
                    <div class="text-caption text-grey-7 line-height-tight">Pacientes</div>
                  </div>
                  <q-icon name="pets" color="grey-4" size="md" />
                </div>
                <div class="q-mt-sm">
                  <q-badge color="green" text-color="white" label="+12%" />
                </div>
              </q-card>
            </div>

            <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card q-pa-sm">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-h6 text-negative text-weight-bold">{{ lowStockItems.length }}</div>
                    <div class="text-caption text-grey-7 line-height-tight">Stock Bajo</div>
                  </div>
                  <q-icon name="inventory_2" color="grey-4" size="md" />
                </div>
                <div class="q-mt-sm">
                  <q-badge color="red" text-color="white" label="Atención" />
                </div>
              </q-card>
            </div>

             <div class="col-12 col-sm-6">
              <q-card class="able-card small-stat-card q-pa-sm">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-h6 text-primary text-weight-bold">{{ expiringItems.length }}</div>
                    <div class="text-caption text-grey-7 line-height-tight">Por Vencer</div>
                  </div>
                  <q-icon name="event_busy" color="grey-4" size="md" />
                </div>
                <div class="q-mt-sm">
                  <q-badge color="blue" text-color="white" label="Revisar" />
                </div>
              </q-card>
            </div>

          </div>
        </div>

      </div> <!-- End Top Row -->

      <!-- Bottom Row: Inventory & Tasks -->
      <div class="row q-col-gutter-md q-mt-xs">
        
        <!-- Inventory Statistics (Charts) -->
        <div class="col-12 col-md-8">
           <div class="row q-col-gutter-md full-height">
             
             <!-- Card 1: Stock Status -->
             <div class="col-12 col-md-6">
               <q-card class="able-card full-height">
                 <q-card-section class="border-bottom q-py-sm">
                   <div class="text-subtitle1 text-weight-bold text-grey-9">Estado de Inventario</div>
                 </q-card-section>
                 <q-card-section class="q-pa-md flex flex-center" style="min-height: 200px">
                   <div style="width: 160px; height: 160px;">
                      <canvas ref="stockChart"></canvas>
                   </div>
                 </q-card-section>
               </q-card>
             </div>

             <!-- Card 2: Expirations -->
             <div class="col-12 col-md-6">
               <q-card class="able-card full-height">
                 <q-card-section class="border-bottom q-py-sm">
                   <div class="text-subtitle1 text-weight-bold text-grey-9">Caducidad de Lotes</div>
                 </q-card-section>
                 <q-card-section class="q-pa-md flex flex-center" style="min-height: 200px">
                   <div style="width: 100%; height: 160px;">
                      <canvas ref="expireChart"></canvas>
                   </div>
                 </q-card-section>
               </q-card>
             </div>

           </div>
        </div>

        <!-- Tasks List (Restored) -->
        <div class="col-12 col-md-4">
          <q-card class="able-card full-height column">
            <q-card-section class="row items-center justify-between border-bottom q-py-sm">
              <div class="text-subtitle1 text-weight-bold text-grey-9">Tareas Pendientes</div>
              <q-btn flat round dense icon="add" color="primary" size="sm" />
            </q-card-section>

             <q-card-section class="q-pa-none col scroll">
              <q-list separator>
                 <q-item 
                  v-for="task in tasks" 
                  :key="task.id" 
                  clickable
                  v-ripple
                  class="hover-bg"
                  @click="toggleTask(task.id)"
                >
                  <q-item-section side top>
                    <q-checkbox :model-value="task.completed" @update:model-value="toggleTask(task.id)" size="xs" color="grey-6" />
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label class="text-body2 text-grey-9" :class="{ 'text-strike text-grey': task.completed }">
                        {{ task.text }}
                    </q-item-label>
                    <q-item-label caption>
                      <q-badge :color="getPriorityColor(task.priority)" rounded class="q-mr-xs" style="width: 8px; height: 8px; padding: 0;" />
                      {{ task.category }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
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
  stats,
  lowStockItems,
  expiringItems,
  tasks,
  toggleTask
} = useDashboard()

const waveChart1 = ref(null)
const waveChart2 = ref(null)
const stockChart = ref(null)
const expireChart = ref(null)

let chartInstance1 = null
let chartInstance2 = null
let stockChartInstance = null
let expireChartInstance = null

const getPriorityColor = (p) => {
  if (p === 'high') return 'negative'
  if (p === 'medium') return 'primary'
  return 'positive'
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const initCharts = () => {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2 } },
    layout: { padding: 0 }
  }

  // Citas Chart (Blue)
  if (waveChart1.value) {
    const ctx = waveChart1.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 100)
    gradient.addColorStop(0, 'rgba(68, 138, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(68, 138, 255, 0)')

    chartInstance1 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [1,2,3,4,5,6,7],
        datasets: [{
          data: [12, 19, 15, 25, 22, 30, 28],
          borderColor: '#448aff',
          backgroundColor: gradient,
          fill: true
        }]
      },
      options: commonOptions
    })
  }

  // Servicios Chart (Green)
  if (waveChart2.value) {
    const ctx = waveChart2.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 100)
    gradient.addColorStop(0, 'rgba(0, 200, 83, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 200, 83, 0)')

    chartInstance2 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [1,2,3,4,5,6,7],
        datasets: [{
          data: [20, 25, 30, 28, 35, 40, 45],
          borderColor: '#00e676',
          backgroundColor: gradient,
          fill: true
        }]
      },
      options: commonOptions
    })
  }

  // Inventory Stock Chart (Doughnut)
  if (stockChart.value) {
    stockChartInstance = new Chart(stockChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Normal', 'Bajo', 'Crítico'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: ['#00e676', '#ffb300', '#ff5252'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } 
        },
        cutout: '70%'
      }
    })
  }

  // Inventory Expire Chart (Bar)
  if (expireChart.value) {
    expireChartInstance = new Chart(expireChart.value, {
      type: 'bar',
      data: {
        labels: ['< 30 Días', '30-60 Días', '> 60 Días'],
        datasets: [{
          label: 'Lotes',
          data: [5, 12, 28],
          backgroundColor: ['#ff5252', '#ffb300', '#448aff'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
          x: { grid: { display: false } }
        }
      }
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
  if (stockChartInstance) stockChartInstance.destroy()
  if (expireChartInstance) expireChartInstance.destroy()
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
  height: 140px;
  background: #448aff; /* Able Pro Blue */
  z-index: 0;
}

.dashboard-container {
  position: relative;
  z-index: 1;
  padding: 15px 20px;
}

.able-card {
  border-radius: 4px;
  box-shadow: 0 1px 10px 0 rgba(69,90,100,0.08);
  background: white;
  transition: all 0.3s ease-in-out;
  border: none;
}

.able-card:hover {
  box-shadow: 0 5px 15px 0 rgba(69,90,100,0.1);
}

/* Shortcuts */
.module-shortcuts { margin-top: -5px; }
.shortcut-btn { font-weight: 500; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* Wave Charts Section */
.wave-card {
  overflow: hidden;
  position: relative;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.wave-chart-container {
  height: 70px;
  width: 100%;
  margin-top: auto;
  padding-bottom: 0;
}

.footer-stats { z-index: 2; position: relative; }
.border-left-white { border-left: 1px solid rgba(255,255,255,0.3); }

/* Small Stats Cards */
.small-stat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.border-bottom { border-bottom: 1px solid #f1f3f4; }
.hover-bg:hover { background-color: #fafafa; cursor: pointer; }

.line-height-tight { line-height: 1.2; }
.text-caption-xs { font-size: 0.70rem; }
.text-xs { font-size: 0.7rem; }

/* Colors helpers matching Able Pro */
.text-primary { color: #448aff !important; }
.bg-primary { background-color: #448aff !important; }
.text-positive { color: #00e676 !important; }
.bg-positive { background-color: #00e676 !important; }
.text-warning { color: #ffb300 !important; }
.bg-warning { background-color: #ffb300 !important; }
.text-negative { color: #ff5252 !important; }
.bg-negative { background-color: #ff5252 !important; }
.text-grey-9 { color: #37474f !important; }

.full-height { height: 100%; }
</style>
