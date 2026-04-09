<template>
  <div class="reportes-laboratorio">
    <!-- Header -->
    <div class="top-bar">
      <div class="title-section">
        <q-icon name="assessment" size="28px" color="primary" />
        <div>
          <div class="title-main">Reportes de Laboratorio</div>
          <div class="title-sub">Análisis, estadísticas e informes</div>
        </div>
      </div>

      <q-btn
        color="primary"
        icon="download"
        label="Descargar Reporte"
        @click="descargarReporte"
        no-caps
      />
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <q-card class="filter-card">
        <q-card-section>
          <div class="row gap-md">
            <q-select
              v-model="filtros.tipoReporte"
              :options="tiposReporte"
              label="Tipo de Reporte"
              outlined
              dense
              emit-value
              map-options
              class="col-12 col-md-6"
            />
            <q-input
              v-model="filtros.fechaInicio"
              type="date"
              label="Fecha Inicio"
              outlined
              dense
              class="col-12 col-md-3"
            />
            <q-input
              v-model="filtros.fechaFin"
              type="date"
              label="Fecha Fin"
              outlined
              dense
              class="col-12 col-md-3"
            />
            <q-btn
              color="primary"
              icon="search"
              label="Buscar"
              @click="generarReporte"
              no-caps
              class="col-12 col-sm-auto"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Reportes Disponibles -->
    <div class="reportes-container">
      <q-tabs
        v-model="tabActiva"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="resumen" label="Resumen" icon="bar_chart" />
        <q-tab name="ordenes" label="Órdenes" icon="receipt" />
        <q-tab name="resultados" label="Resultados" icon="check_circle" />
        <q-tab name="muestras" label="Muestras" icon="local_shipping" />
        <q-tab name="calidad" label="Control de Calidad" icon="verified" />
      </q-tabs>

      <q-tab-panels v-model="tabActiva" animated>
        <!-- Tab: Resumen -->
        <q-tab-panel name="resumen">
          <div class="grid-2x2">
            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-header">Órdenes Procesadas</div>
                <div class="stat-number">{{ estadisticas.ordenesProcesadas }}</div>
                <q-linear-progress
                  :value="0.8"
                  color="primary"
                  class="q-mt-md"
                />
              </q-card-section>
            </q-card>

            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-header">Resultados Completados</div>
                <div class="stat-number">{{ estadisticas.resultadosCompletados }}</div>
                <q-linear-progress
                  :value="0.75"
                  color="positive"
                  class="q-mt-md"
                />
              </q-card-section>
            </q-card>

            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-header">Tiempo Promedio</div>
                <div class="stat-number">{{ estadisticas.tiempoPromedio }}</div>
                <q-linear-progress
                  :value="0.6"
                  color="info"
                  class="q-mt-md"
                />
              </q-card-section>
            </q-card>

            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-header">Tasa de Error</div>
                <div class="stat-number">{{ estadisticas.tasaError }}%</div>
                <q-linear-progress
                  :value="0.05"
                  color="warning"
                  class="q-mt-md"
                />
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Tab: Órdenes -->
        <q-tab-panel name="ordenes">
          <q-table
            title="Órdenes Procesadas"
            :rows="ordenes"
            :columns="columnasOrdenes"
            row-key="id"
            :pagination="paginacionOrdenes"
            flat
            bordered
          />
        </q-tab-panel>

        <!-- Tab: Resultados -->
        <q-tab-panel name="resultados">
          <q-table
            title="Resultados de Laboratorio"
            :rows="resultados"
            :columns="columnasResultados"
            row-key="id"
            :pagination="paginacionResultados"
            flat
            bordered
          />
        </q-tab-panel>

        <!-- Tab: Muestras -->
        <q-tab-panel name="muestras">
          <q-table
            title="Tracking de Muestras"
            :rows="muestras"
            :columns="columnasMuestras"
            row-key="id"
            :pagination="paginacionMuestras"
            flat
            bordered
          />
        </q-tab-panel>

        <!-- Tab: Control de Calidad -->
        <q-tab-panel name="calidad">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Control de Calidad - Métricas del Sistema</div>
              <div class="q-mt-md">
                <div class="metric-item">
                  <span>Precisión de Resultados:</span>
                  <q-linear-progress :value="0.95" color="positive" />
                  <span class="metric-value">95%</span>
                </div>
                <div class="metric-item q-mt-md">
                  <span>Disponibilidad del Sistema:</span>
                  <q-linear-progress :value="0.99" color="positive" />
                  <span class="metric-value">99%</span>
                </div>
                <div class="metric-item q-mt-md">
                  <span>Cumplimiento de Tiempos:</span>
                  <q-linear-progress :value="0.88" color="info" />
                  <span class="metric-value">88%</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tabActiva = ref('resumen');

const tiposReporte = [
  { label: 'Resumen General', value: 'resumen' },
  { label: 'Detallado por Estudio', value: 'estudio' },
  { label: 'Por Profesional', value: 'profesional' },
  { label: 'Por Paciente', value: 'paciente' },
];

const filtros = ref({
  tipoReporte: 'resumen',
  fechaInicio: '',
  fechaFin: '',
});

const estadisticas = ref({
  ordenesProcesadas: 245,
  resultadosCompletados: 198,
  tiempoPromedio: '2.5 h',
  tasaError: 0.8,
});

const paginacionOrdenes = ref({ sortBy: 'fecha', descending: true, page: 1, rowsPerPage: 10 });
const paginacionResultados = ref({ sortBy: 'fecha', descending: true, page: 1, rowsPerPage: 10 });
const paginacionMuestras = ref({ sortBy: 'fecha', descending: true, page: 1, rowsPerPage: 10 });

const columnasOrdenes = [
  { name: 'id', label: 'Orden', field: 'id', align: 'left' },
  { name: 'paciente', label: 'Paciente', field: 'paciente', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
];

const columnasResultados = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'orden', label: 'Orden', field: 'orden', align: 'left' },
  { name: 'prueba', label: 'Prueba', field: 'prueba', align: 'left' },
  { name: 'resultado', label: 'Resultado', field: 'resultado', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
];

const columnasMuestras = [
  { name: 'id', label: 'Muestra', field: 'id', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'recepcion', label: 'Recepción', field: 'recepcion', align: 'left' },
];

const ordenes = ref([
  { id: 'ORD-001', paciente: 'MAX', fecha: '2026-04-08', estado: 'Completada' },
  { id: 'ORD-002', paciente: 'LUNA', fecha: '2026-04-07', estado: 'Completada' },
]);

const resultados = ref([
  { id: 1, orden: 'ORD-001', prueba: 'Hemoglobina', resultado: '14.5 g/dL', fecha: '2026-04-08' },
  { id: 2, orden: 'ORD-002', prueba: 'Glucosa', resultado: '95 mg/dL', fecha: '2026-04-07' },
]);

const muestras = ref([
  { id: 'MUESTRA-001', tipo: 'Sangre EDTA', estado: 'Procesada', recepcion: '2026-04-08 10:30' },
  { id: 'MUESTRA-002', tipo: 'Suero', estado: 'Procesada', recepcion: '2026-04-07 14:15' },
]);

const generarReporte = () => {
  console.log('Generando reporte con filtros:', filtros.value);
};

const descargarReporte = () => {
  console.log('Descargando reporte...');
};
</script>

<style lang="scss" scoped>
.reportes-laboratorio {
  padding: 24px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .title-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-main {
      font-size: 22px;
      font-weight: 600;
      margin: 0;
    }

    .title-sub {
      font-size: 13px;
      color: #999;
      margin: 4px 0 0 0;
    }
  }
}

.filters-section {
  margin-bottom: 24px;

  .filter-card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
}

.reportes-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.grid-2x2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    .stat-header {
      font-size: 14px;
      color: #666;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin: 8px 0;
    }
  }
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 16px;

  .metric-value {
    min-width: 50px;
    text-align: right;
    font-weight: 600;
    color: #333;
  }
}
</style>
