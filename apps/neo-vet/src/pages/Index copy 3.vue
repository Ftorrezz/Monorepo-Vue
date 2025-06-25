<template>
  <q-page class="bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="container-fluid px-4 py-3">
        <div class="row items-center">
          <div class="col">
            <div class="row items-center q-gutter-md">
              <!--<q-avatar size="48px" color="primary" text-color="white" icon="favorite" />-->
              <div>
                <!--<h1 class="text-h4 text-weight-bold text-grey-9 q-ma-none">Tablero</h1>-->
                <!--<p class="text-body2 text-grey-6 q-ma-none">Sistema de Gestión Veterinaria</p>-->
              </div>
            </div>
          </div>
          <div class="col-auto text-right">
            <p class="text-body2 text-weight-medium text-grey-9 q-ma-none">
              {{ formatDate(currentTime) }}
            </p>
            <p class="text-body2 text-grey-6 q-ma-none">
              {{ formatTime(currentTime) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid q-pt-lg q-px-md">
      <div class="row q-col-gutter-xl items-start">
        <!-- Columna Principal (Izquierda) -->
        <div class="col-12 col-md-8">
            <!-- Estadísticas principales -->
            <div class="row q-gutter-md">
              <div class="col-12 col-sm-6 col-md-3" v-for="stat in mainStats" :key="stat.id">
                <stat-card v-bind="stat" />
              </div>
            </div>

            <!-- Estadísticas adicionales -->
            <!--<div class="row q-gutter-md">
              <div class="col-12 col-md-4" v-for="stat in additionalStats" :key="stat.id">
                <stat-card v-bind="stat" />
              </div>
            </div>-->
            
            <!-- Gráfico de citas -->
            <!--<div>
              <q-card class="full-height">
                <q-card-section>
                  <div class="text-h6 text-weight-medium">Citas por Hora - Hoy</div>
                </q-card-section>
                <q-card-section>
                  <canvas ref="appointmentsChart" height="300"></canvas>
                </q-card-section>
              </q-card>
            </div>-->

            <!-- Gráficos adicionales -->
            <div class="row q-gutter-lg">
              <!-- Distribución de servicios -->
              <!--<div>
              <q-card class="full-height">
                <q-card-section>
                  <div class="text-h6 text-weight-medium">Citas por Hora - Hoy</div>
                </q-card-section>
                <q-card-section>
                  <canvas ref="appointmentsChart" height="300"></canvas>
                </q-card-section>
              </q-card>
            </div>-->
              
              
              <div class="col-12 col-md-6">
                <q-card>
                  <q-card-section>
                    <div class="text-h6 text-weight-medium">Citas por Hora - Hoy</div>
                  </q-card-section>
                  <q-card-section>
                    <canvas ref="appointmentsChart" height="300"></canvas>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-5">
                <q-card>
                  <q-card-section>
                    <div class="text-h6 text-weight-medium">Distribución de Servicios</div>
                  </q-card-section>
                  <q-card-section>
                    <canvas ref="servicesChart" height="300"></canvas>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Tendencia mensual -->
              <!--<div class="col-12 col-md-6">
                <q-card>
                  <q-card-section>
                    <div class="text-h6 text-weight-medium">Tendencia Mensual</div>
                  </q-card-section>
                  <q-card-section>
                    <canvas ref="monthlyChart" height="300"></canvas>
                  </q-card-section>
                </q-card>
              </div>-->
            </div>

            
        </div>
        <!-- Columna de Alertas (Derecha) -->
        <div class="col-12 col-md-4">
          <div style="position: sticky; top: 32px;">
            <q-card>
              <q-card-section>
                <div class="text-h6 text-weight-medium">Alertas y Notificaciones</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div v-for="alert in alerts" :key="alert.id" class="q-mb-sm">
                  <alert-card v-bind="alert" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import StatCard from './../components/card/StatCard.vue'
import AlertCard from './../components/card/AlertCard.vue'

Chart.register(...registerables)

// Refs reactivos
const currentTime = ref(new Date())
const appointmentsChart = ref(null)
const servicesChart = ref(null)
const monthlyChart = ref(null)

// Timer para actualizar hora
let timeInterval = null

// Instancias de los gráficos para poder destruirlas
let appointmentsChartInstance = null
let servicesChartInstance = null
let monthlyChartInstance = null

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
  { name: 'Consultas', value: 45, color: '#1976d2' },
  { name: 'Vacunación', value: 25, color: '#388e3c' },
  { name: 'Cirugías', value: 15, color: '#d32f2f' },
  { name: 'Emergencias', value: 10, color: '#f57c00' },
  { name: 'Otros', value: 5, color: '#7b1fa2' }
]

const monthlyData = [
  { mes: 'Ene', mascotas: 720, ingresos: 38000 },
  { mes: 'Feb', mascotas: 680, ingresos: 35000 },
  { mes: 'Mar', mascotas: 790, ingresos: 42000 },
  { mes: 'Abr', mascotas: 847, ingresos: 45750 }
]

// Computed properties para las estadísticas organizadas
const mainStats = computed(() => [
  {
    id: 'mascotas',
    title: 'Mascotas Atendidas',
    value: stats.value.mascotas_atendidas,
    icon: 'pets',
    color: 'primary',
    subtitle: 'Este mes',
    trend: '+12%'
  },
  {
    id: 'citas',
    title: 'Citas Asignadas',
    value: stats.value.citas_asignadas,
    icon: 'event',
    color: 'positive',
    subtitle: 'Hoy',
    trend: '+5%'
  },
  {
    id: 'vacunas',
    title: 'Vacunas Aplicadas',
    value: stats.value.vacunas_aplicadas,
    icon: 'medical_services',
    color: 'secondary',
    subtitle: 'Este mes',
    trend: '+18%'
  },
  {
    id: 'ingresos',
    title: 'Ingresos del Mes',
    value: stats.value.ingresos_mes,
    icon: 'attach_money',
    color: 'teal',
    subtitle: 'Pesos mexicanos',
    trend: '+8%'
  }
])

const secondaryStats = computed(() => [
  {
    id: 'desparasitaciones',
    title: 'Desparasitaciones',
    value: stats.value.desparasitaciones,
    icon: 'shield',
    color: 'orange',
    subtitle: 'Este mes'
  },
  {
    id: 'hospitalizaciones',
    title: 'Hospitalizaciones',
    value: stats.value.hospitalizaciones,
    icon: 'local_hospital',
    color: 'negative',
    subtitle: 'Activas'
  },
  {
    id: 'cirugias',
    title: 'Cirugías Realizadas',
    value: stats.value.cirugias_realizadas,
    icon: 'healing',
    color: 'deep-purple',
    subtitle: 'Este mes'
  }
])

const additionalStats = computed(() => [
  {
    id: 'emergencias',
    title: 'Emergencias Atendidas',
    value: stats.value.consultas_emergencia,
    icon: 'emergency',
    color: 'red',
    subtitle: 'Este mes'
  },
  {
    id: 'clientes',
    title: 'Clientes Nuevos',
    value: stats.value.clientes_nuevos,
    icon: 'group_add',
    color: 'cyan',
    subtitle: 'Este mes'
  },
  {
    id: 'medicamentos',
    title: 'Medicamentos Dispensados',
    value: stats.value.medicamentos_dispensados,
    icon: 'medication',
    color: 'pink',
    subtitle: 'Este mes'
  }
])

const alerts = ref([
  {
    id: 1,
    type: 'negative',
    icon: 'warning',
    message: 'Paciente Rex requiere atención inmediata',
    time: 'Hace 5 minutos'
  },
  {
    id: 2,
    type: 'info',
    icon: 'schedule',
    message: 'Recordatorio: Vacunación de Luna mañana',
    time: 'Hace 15 minutos'
  },
  {
    id: 3,
    type: 'positive',
    icon: 'check_circle',
    message: 'Cirugía de Max completada exitosamente',
    time: 'Hace 1 hora'
  },
  {
    id: 4,
    type: 'warning',
    icon: 'inventory',
    message: 'Stock bajo de vacuna antirrábica',
    time: 'Hace 2 horas'
  }
])

// Métodos
const formatDate = (date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('es-ES')
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
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            tension: 0.4,
            fill: true
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
          y: {
            beginAtZero: true
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
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }
}

const createMonthlyChart = () => {
  if (monthlyChart.value) {
    if (monthlyChartInstance) {
      monthlyChartInstance.destroy()
    }
    const ctx = monthlyChart.value.getContext('2d')
    monthlyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthlyData.map((d) => d.mes),
        datasets: [
          {
            label: 'Mascotas Atendidas',
            data: monthlyData.map((d) => d.mascotas),
            backgroundColor: 'rgba(25, 118, 210, 0.8)',
            yAxisID: 'y'
          },
          {
            label: 'Ingresos (Miles)',
            data: monthlyData.map((d) => d.ingresos / 1000),
            type: 'line',
            borderColor: '#388e3c',
            backgroundColor: 'transparent',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left'
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    })
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Actualizar hora cada segundo
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Esperar a que el DOM se actualice para asegurar que los <canvas> existan
  await nextTick()

  // Crear gráficos
  createAppointmentsChart()
  createServicesChart()
  createMonthlyChart()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  // Destruir instancias de los gráficos para evitar fugas de memoria
  if (appointmentsChartInstance) {
    appointmentsChartInstance.destroy()
  }
  if (servicesChartInstance) {
    servicesChartInstance.destroy()
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy()
  }
})
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #eff6ff, #f0fdf4);
}

.max-w-7xl {
  max-width: 80rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}
</style>
