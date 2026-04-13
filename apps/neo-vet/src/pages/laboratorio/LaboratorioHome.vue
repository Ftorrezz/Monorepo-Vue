<template>
  <div class="lab-dashboard">
    <!-- Header del Dashboard -->
    <div class="dashboard-hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Dashboard de Laboratorio</h1>
          <div class="hero-breadcrumb">
            <q-icon name="science" size="14px" color="indigo-4" />
            <span>Control de Laboratorio</span>
            <span class="breadcrumb-sep">/</span>
            <span>{{ fechaActual }}</span>
          </div>
        </div>
        <div class="hero-quick-actions">
          <q-btn
            unelevated
            color="primary"
            label="Nueva Orden"
            icon="add_circle"
            no-caps
            size="sm"
            class="quick-action-btn"
            @click="irA('/laboratorio')"
          />
          <q-btn
            outline
            color="primary"
            label="Cargar Resultados"
            icon="upload_file"
            no-caps
            size="sm"
            class="quick-action-btn"
            @click="irA('/laboratorio/carga-resultados')"
          />
        </div>
      </div>
    </div>

    <!-- Stat Cards Premium -->
    <div class="stats-grid">
      <!-- Card: Órdenes del Día -->
      <div class="stat-card" @click="irA('/laboratorio')">
        <div class="stat-card__icon-wrapper stat-card__icon--blue">
          <q-icon name="receipt_long" size="28px" />
        </div>
        <div class="stat-card__body">
          <div class="stat-card__value">{{ estadisticas.ordenesHoy }}</div>
          <div class="stat-card__label">Órdenes del Día</div>
        </div>
        <div class="stat-card__trend stat-card__trend--up">
          <q-icon name="trending_up" size="14px" />
          <span>+12%</span>
        </div>
        <div class="stat-card__sparkline stat-card__sparkline--blue"></div>
      </div>

      <!-- Card: Órdenes Pendientes -->
      <div class="stat-card" @click="irA('/laboratorio')">
        <div class="stat-card__icon-wrapper stat-card__icon--amber">
          <q-icon name="pending_actions" size="28px" />
        </div>
        <div class="stat-card__body">
          <div class="stat-card__value">{{ estadisticas.ordenesPendientes }}</div>
          <div class="stat-card__label">Pendientes</div>
        </div>
        <div class="stat-card__trend stat-card__trend--warning">
          <q-icon name="schedule" size="14px" />
          <span>Urgente</span>
        </div>
        <div class="stat-card__sparkline stat-card__sparkline--amber"></div>
      </div>

      <!-- Card: Resultados Listos -->
      <div class="stat-card" @click="irA('/laboratorio/carga-resultados')">
        <div class="stat-card__icon-wrapper stat-card__icon--green">
          <q-icon name="check_circle_outline" size="28px" />
        </div>
        <div class="stat-card__body">
          <div class="stat-card__value">{{ estadisticas.resultadosCompletados }}</div>
          <div class="stat-card__label">Resultados Listos</div>
        </div>
        <div class="stat-card__trend stat-card__trend--up">
          <q-icon name="trending_up" size="14px" />
          <span>+8%</span>
        </div>
        <div class="stat-card__sparkline stat-card__sparkline--green"></div>
      </div>

      <!-- Card: Por Validar -->
      <div class="stat-card" @click="irA('/laboratorio/carga-resultados')">
        <div class="stat-card__icon-wrapper stat-card__icon--red">
          <q-icon name="rule" size="28px" />
        </div>
        <div class="stat-card__body">
          <div class="stat-card__value">{{ estadisticas.porValidar }}</div>
          <div class="stat-card__label">Por Validar</div>
        </div>
        <div class="stat-card__trend stat-card__trend--warning">
          <q-icon name="priority_high" size="14px" />
          <span>Revisar</span>
        </div>
        <div class="stat-card__sparkline stat-card__sparkline--red"></div>
      </div>
    </div>

    <!-- Segunda fila de stats mini -->
    <div class="mini-stats-row">
      <div class="mini-stat">
        <div class="mini-stat__icon bg-blue-1 text-blue-8">
          <q-icon name="biotech" size="20px" />
        </div>
        <div class="mini-stat__info">
          <div class="mini-stat__value">{{ estadisticas.muestrasEnProceso }}</div>
          <div class="mini-stat__label">Muestras en Proceso</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat__icon bg-purple-1 text-purple-8">
          <q-icon name="category" size="20px" />
        </div>
        <div class="mini-stat__info">
          <div class="mini-stat__value">{{ estadisticas.estudiosDisponibles }}</div>
          <div class="mini-stat__label">Estudios Disponibles</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat__icon bg-teal-1 text-teal-8">
          <q-icon name="timelapse" size="20px" />
        </div>
        <div class="mini-stat__info">
          <div class="mini-stat__value">{{ estadisticas.tiempoPromedio }}</div>
          <div class="mini-stat__label">Tiempo Promedio (hrs)</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat__icon bg-orange-1 text-orange-8">
          <q-icon name="local_shipping" size="20px" />
        </div>
        <div class="mini-stat__info">
          <div class="mini-stat__value">{{ estadisticas.muestrasExternas }}</div>
          <div class="mini-stat__label">Muestras Externas</div>
        </div>
      </div>
    </div>

    <!-- Contenido principal: Gráficos + Accesos rápidos -->
    <div class="dashboard-grid">
      <!-- Chart: Órdenes de la semana -->
      <div class="dashboard-card chart-card">
        <div class="card-header">
          <div class="card-header__title">
            <q-icon name="show_chart" size="20px" class="text-blue-6" />
            <span>Órdenes de la Semana</span>
          </div>
          <q-btn-group flat class="card-header__toggle">
            <q-btn flat dense no-caps label="Semana" size="sm" :color="chartPeriodo === 'semana' ? 'primary' : 'grey-6'" @click="chartPeriodo = 'semana'" />
            <q-btn flat dense no-caps label="Mes" size="sm" :color="chartPeriodo === 'mes' ? 'primary' : 'grey-6'" @click="chartPeriodo = 'mes'" />
          </q-btn-group>
        </div>
        <div class="chart-wrapper">
          <canvas ref="ordenesChart"></canvas>
        </div>
      </div>

      <!-- Chart: Distribución de estudios -->
      <div class="dashboard-card chart-card-small">
        <div class="card-header">
          <div class="card-header__title">
            <q-icon name="donut_large" size="20px" class="text-purple-6" />
            <span>Distribución de Estudios</span>
          </div>
        </div>
        <div class="donut-wrapper">
          <canvas ref="distribucionChart"></canvas>
        </div>
      </div>

      <!-- Accesos rápidos / módulos -->
      <div class="dashboard-card modules-card">
        <div class="card-header">
          <div class="card-header__title">
            <q-icon name="grid_view" size="20px" class="text-indigo-6" />
            <span>Acceso Rápido</span>
          </div>
        </div>
        <div class="modules-grid">
          <div 
            v-for="modulo in modulosRapidos" 
            :key="modulo.nombre"
            class="module-card"
            :style="{ '--module-color': modulo.color, '--module-bg': modulo.bg }"
            @click="irA(modulo.ruta)"
          >
            <div class="module-card__icon">
              <q-icon :name="modulo.icon" size="24px" />
            </div>
            <div class="module-card__name">{{ modulo.nombre }}</div>
            <div class="module-card__count" v-if="modulo.count !== undefined">{{ modulo.count }}</div>
          </div>
        </div>
      </div>

      <!-- Órdenes recientes -->
      <div class="dashboard-card recent-card">
        <div class="card-header">
          <div class="card-header__title">
            <q-icon name="history" size="20px" class="text-blue-grey-6" />
            <span>Órdenes Recientes</span>
          </div>
          <q-btn flat dense no-caps label="Ver todas" color="primary" size="sm" @click="irA('/laboratorio')" />
        </div>
        <div class="recent-list">
          <div
            v-for="orden in ordenesRecientes"
            :key="orden.id"
            class="recent-item"
          >
            <div class="recent-item__avatar" :class="'bg-' + orden.statusColor + '-1'">
              <q-icon name="description" :class="'text-' + orden.statusColor + '-8'" size="18px" />
            </div>
            <div class="recent-item__info">
              <div class="recent-item__title">{{ orden.paciente }}</div>
              <div class="recent-item__subtitle">{{ orden.estudio }} · {{ orden.fecha }}</div>
            </div>
            <q-badge
              :color="orden.statusColor"
              :label="orden.status"
              rounded
              class="recent-item__badge"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const router = useRouter();
const fechaActual = ref('');
const chartPeriodo = ref('semana');
const ordenesChart = ref<HTMLCanvasElement | null>(null);
const distribucionChart = ref<HTMLCanvasElement | null>(null);

let chartInstance1: Chart | null = null;
let chartInstance2: Chart | null = null;

const estadisticas = ref({
  ordenesHoy: 18,
  ordenesPendientes: 12,
  resultadosCompletados: 45,
  porValidar: 7,
  muestrasEnProceso: 8,
  estudiosDisponibles: 32,
  tiempoPromedio: 2.4,
  muestrasExternas: 5,
});

const modulosRapidos = [
  { nombre: 'Gestión Órdenes', icon: 'receipt_long', color: '#3949ab', bg: '#e8eaf6', ruta: '/laboratorio', count: 18 },
  { nombre: 'Muestras', icon: 'science', color: '#00897b', bg: '#e0f2f1', ruta: '/laboratorio/registro-muestras', count: 8 },
  { nombre: 'Resultados', icon: 'fact_check', color: '#43a047', bg: '#e8f5e9', ruta: '/laboratorio/carga-resultados', count: 45 },
  { nombre: 'Configuración', icon: 'tune', color: '#5e35b1', bg: '#ede7f6', ruta: '/laboratorio/admin-catalogos' },
  { nombre: 'Reportes', icon: 'analytics', color: '#e53935', bg: '#ffebee', ruta: '/laboratorio/reportes' },
  { nombre: 'Inventario', icon: 'inventory_2', color: '#f57c00', bg: '#fff3e0', ruta: '/laboratorio/inventario' },
];

const ordenesRecientes = ref([
  { id: 1, paciente: 'Max - Golden Retriever', estudio: 'Hemograma Completo', fecha: 'Hoy 10:30', status: 'En proceso', statusColor: 'blue' },
  { id: 2, paciente: 'Luna - Siamés', estudio: 'Química Sanguínea', fecha: 'Hoy 09:15', status: 'Completado', statusColor: 'green' },
  { id: 3, paciente: 'Rocky - Pastor Alemán', estudio: 'Urianálisis', fecha: 'Hoy 08:45', status: 'Pendiente', statusColor: 'orange' },
  { id: 4, paciente: 'Mia - Persa', estudio: 'Perfil Tiroideo', fecha: 'Ayer 16:20', status: 'Validado', statusColor: 'teal' },
  { id: 5, paciente: 'Thor - Bulldog', estudio: 'Coprológico', fecha: 'Ayer 14:00', status: 'Completado', statusColor: 'green' },
]);

onMounted(async () => {
  actualizarFecha();
  await nextTick();
  initCharts();
});

onUnmounted(() => {
  if (chartInstance1) chartInstance1.destroy();
  if (chartInstance2) chartInstance2.destroy();
});

const actualizarFecha = () => {
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  fechaActual.value = new Date().toLocaleDateString('es-ES', opciones);
};

const irA = (ruta: string) => {
  router.push(ruta);
};

const initCharts = () => {
  // Chart de órdenes (bar + line)
  if (ordenesChart.value) {
    const ctx = ordenesChart.value.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(57, 73, 171, 0.25)');
    gradient.addColorStop(1, 'rgba(57, 73, 171, 0)');

    chartInstance1 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Órdenes',
            data: [14, 18, 22, 16, 24, 12, 8],
            backgroundColor: 'rgba(57, 73, 171, 0.75)',
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
          },
          {
            label: 'Completadas',
            data: [12, 15, 20, 14, 22, 10, 6],
            backgroundColor: 'rgba(67, 160, 71, 0.7)',
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              borderRadius: 3,
              useBorderRadius: true,
              font: { size: 11, family: 'Inter' },
              padding: 15,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 11, family: 'Inter' } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, family: 'Inter' } },
          },
        },
      },
    });
  }

  // Chart de distribución (doughnut)
  if (distribucionChart.value) {
    chartInstance2 = new Chart(distribucionChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Hemograma', 'Química', 'Urianálisis', 'Coprológico', 'Otros'],
        datasets: [
          {
            data: [35, 25, 15, 12, 13],
            backgroundColor: [
              '#3949ab',
              '#5c6bc0',
              '#7986cb',
              '#9fa8da',
              '#c5cae9',
            ],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              borderRadius: 2,
              useBorderRadius: true,
              font: { size: 11, family: 'Inter' },
              padding: 12,
            },
          },
        },
      },
    });
  }
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.lab-dashboard {
  font-family: 'Inter', sans-serif;
  animation: fadeSlideIn 0.4s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ── HERO HEADER ──
.dashboard-hero {
  margin-bottom: 14px;
  padding: 10px 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #3949ab;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-title {
  color: #1a1a2e;
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.2px;
}

.hero-breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 400;
}

.breadcrumb-sep {
  color: #d1d5db;
}

.hero-quick-actions {
  display: flex;
  gap: 8px;
}

.quick-action-btn {
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
}

// ── STAT CARDS ──
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  &__icon-wrapper {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__icon--blue {
    background: linear-gradient(135deg, #3949ab, #5c6bc0);
    color: white;
  }

  &__icon--amber {
    background: linear-gradient(135deg, #f57c00, #ffb300);
    color: white;
  }

  &__icon--green {
    background: linear-gradient(135deg, #2e7d32, #43a047);
    color: white;
  }

  &__icon--red {
    background: linear-gradient(135deg, #c62828, #e53935);
    color: white;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__value {
    font-size: 28px;
    font-weight: 800;
    color: #1a1a2e;
    line-height: 1;
    margin-bottom: 4px;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;

    &--up {
      background: #ecfdf5;
      color: #059669;
    }

    &--warning {
      background: #fff7ed;
      color: #d97706;
    }
  }

  &__sparkline {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover &__sparkline {
    opacity: 1;
  }

  &__sparkline--blue { background: linear-gradient(90deg, #3949ab, #5c6bc0); }
  &__sparkline--amber { background: linear-gradient(90deg, #f57c00, #ffb300); }
  &__sparkline--green { background: linear-gradient(90deg, #2e7d32, #66bb6a); }
  &__sparkline--red { background: linear-gradient(90deg, #c62828, #ef5350); }
}

// ── MINI STATS ──
.mini-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.mini-stat {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__value {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.1;
  }

  &__label {
    font-size: 11px;
    font-weight: 500;
    color: #9ca3af;
  }
}

// ── DASHBOARD GRID ──
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: auto auto;
  gap: 16px;
}

.dashboard-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f3f4f6;

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
}

// Chart cards
.chart-card {
  grid-column: 1;
  grid-row: 1;
}

.chart-wrapper {
  padding: 16px 20px 20px;
  height: 260px;
}

.chart-card-small {
  grid-column: 2;
  grid-row: 1;
}

.donut-wrapper {
  padding: 16px 20px 12px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Modules card
.modules-card {
  grid-column: 2;
  grid-row: 2;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px;
}

.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px 8px;
  border-radius: 12px;
  background: var(--module-bg);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--module-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    transition: transform 0.2s ease;
  }

  &:hover &__icon {
    transform: scale(1.1);
  }

  &__name {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    line-height: 1.3;
  }

  &__count {
    position: absolute;
    top: 8px;
    right: 8px;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    background: var(--module-color);
    color: white;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }
}

// Recent orders
.recent-card {
  grid-column: 1;
  grid-row: 2;
}

.recent-list {
  padding: 8px 16px 16px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__subtitle {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 400;
  }

  &__badge {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 10px;
    flex-shrink: 0;
  }
}

// ── RESPONSIVE ──
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mini-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .chart-card,
  .chart-card-small,
  .modules-card,
  .recent-card {
    grid-column: 1;
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .dashboard-hero {
    margin: -12px -12px 16px;
    padding: 20px;
    border-radius: 0 0 16px 16px;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .hero-title {
    font-size: 20px;
  }

  .hero-quick-actions {
    width: 100%;
  }

  .quick-action-btn {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 14px;

    &__value {
      font-size: 22px;
    }
  }

  .mini-stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .mini-stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
