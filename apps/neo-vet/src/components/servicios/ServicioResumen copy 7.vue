<template>
  <div class="servicio-resumen">
    <div class="row q-col-gutter-lg">
      <!-- Columna Izquierda: Métricas y Estadísticas -->
      <div class="col-12 col-md-4">
        <!-- Bloque de Tarjetas de Métricas en Columna -->
        <div class="column q-gutter-md q-mb-lg">
          <div class="metric-card metric-card--total">
            <div class="metric-card__icon">
              <q-icon name="assignment" size="20px" />
            </div>
            <div class="metric-card__content">
              <div class="metric-card__label">Total Servicios</div>
              <div class="metric-card__value">{{ serviciosAplicados.length }}</div>
            </div>
          </div>
          
          <div class="metric-card metric-card--done">
            <div class="metric-card__icon">
              <q-icon name="check_circle" size="20px" />
            </div>
            <div class="metric-card__content">
              <div class="metric-card__label">Completados</div>
              <div class="metric-card__value">{{ serviciosCompletados.length }}</div>
            </div>
          </div>
          
          <div class="metric-card metric-card--pending">
            <div class="metric-card__icon">
              <q-icon name="pending" size="20px" />
            </div>
            <div class="metric-card__content">
              <div class="metric-card__label">Pendientes</div>
              <div class="metric-card__value">{{ serviciosPendientes.length }}</div>
            </div>
          </div>
        </div>

        <!-- Panel de progreso con diseño moderno -->
        <div class="stats-panel premium-glass">
          <div class="stats-header">
            <div class="text-subtitle1 text-weight-bold text-primary">Estado de Avance</div>
            <div class="text-caption text-grey-6">Progreso general de la atención</div>
          </div>
          
          <div class="flex flex-center q-py-lg">
            <q-circular-progress
              show-value
              font-size="16px"
              :value="porcentajeProgreso"
              size="120px"
              :thickness="0.15"
              color="primary"
              track-color="blue-1"
              class="progress-chart"
            >
              <div class="column items-center">
                <span class="text-h6 text-weight-bolder">{{ porcentajeProgreso }}%</span>
                <span class="text-caption text-grey-7" style="font-size: 10px; margin-top: -4px;">LOGRADO</span>
              </div>
            </q-circular-progress>
          </div>

          <div class="modern-legend">
            <div class="legend-item-v2">
              <div class="legend-info">
                <div class="legend-label">Finalizados</div>
                <div class="legend-count text-positive">{{ serviciosCompletados.length }}</div>
              </div>
              <q-linear-progress :value="porcentajeProgreso / 100" color="positive" class="legend-bar" />
            </div>
            
            <div class="legend-item-v2">
              <div class="legend-info">
                <div class="legend-label">Pendientes</div>
                <div class="legend-count text-orange">{{ serviciosPendientes.length }}</div>
              </div>
              <q-linear-progress :value="1 - (porcentajeProgreso / 100)" color="orange" class="legend-bar" />
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Servicios con diseño premium -->
      <div class="col-12 col-md-8">
        <div class="section-title row items-center q-mb-md">
          <q-icon name="list_alt" size="20px" color="primary" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold text-grey-9">Servicios en esta Atención</span>
          <q-space />
          <q-btn flat dense color="primary" icon="print" label="Imprimir Resumen" no-caps @click="$emit('imprimir-resumen')" v-if="serviciosAplicados.length > 0" />
        </div>

        <div class="timeline-container q-pa-md">
          <div 
            v-for="(servicio, index) in serviciosAplicados" 
            :key="servicio.id"
            class="timeline-item animate-fade-in"
            :class="{ 'timeline-item--last': index === serviciosAplicados.length - 1 }"
          >
            <!-- Carril de la Línea (Path) -->
            <div class="timeline-trail">
              <div class="trail-line" :class="{ 'trail-line--done': servicio.completado }"></div>
              <div class="trail-node" :class="servicio.completado ? 'node--done' : 'node--pending'">
                <q-icon :name="servicio.icono" size="20px" :color="servicio.completado ? 'positive' : 'orange'" />
                <div class="node-glow" v-if="servicio.completado"></div>
              </div>
            </div>

            <div class="timeline-content-wrapper">
              <div class="timeline-card" :class="servicio.completado ? 'timeline-card--done' : 'timeline-card--pending'">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="column">
                    <span class="service-name-text">{{ servicio.nombre }}</span>
                    <span class="service-meta-text">
                      <q-icon name="schedule" size="12px" class="q-mr-xs" />
                      {{ servicio.timestamp }}
                    </span>
                  </div>
                  <div class="row q-gutter-x-xs no-wrap">
                    <q-chip 
                      dense 
                      outline 
                      :color="servicio.completado ? 'positive' : 'negative'" 
                      size="10px" 
                      class="text-weight-bold"
                      style="border-radius: 4px;"
                    >
                      {{ servicio.completado ? 'COMPLETADO' : 'PENDIENTE' }}
                    </q-chip>
                  </div>
                </div>

                <!-- Información Clínica Expandida -->
                <div class="clinical-info-segment q-mt-md" v-if="servicio.completado">
                  <div class="row q-col-gutter-sm">
                    <template v-for="(valor, label) in getsDatosRelevantes(servicio)" :key="label">
                      <div class="col-auto" v-if="valor">
                        <div class="info-badge">
                          <span class="info-badge__label">{{ label }}:</span>
                          <span class="info-badge__value">{{ valor }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <div class="pending-info-segment" v-else>
                  <q-icon name="info_outline" color="grey-5" size="14px" class="q-mr-xs" />
                  <span class="text-caption text-grey-6 italic">Esperando registro de datos...</span>
                </div>

                <!-- Barra de Acciones Premium -->
                <div class="timeline-card-actions q-mt-md pt-md row items-center justify-between border-t-dashed">
                    <div class="row q-gutter-x-xs no-wrap" v-if="servicio.completado">
                      <q-btn
                        v-if="servicio.componente_clave === 'vacunacion'"
                        unelevated round dense icon="card_membership" size="11px" color="blue-1" text-color="blue-7" class="action-btn-v3"
                        @click.stop="$emit('imprimir-servicio', servicio, 'especial')"
                      ><q-tooltip>Ver Certificado</q-tooltip></q-btn>
                      
                      <q-btn
                        v-if="servicio.componente_clave === 'consulta'"
                        unelevated round dense icon="description" size="11px" color="indigo-1" text-color="indigo-7" class="action-btn-v3"
                        @click.stop="$emit('imprimir-servicio', servicio, 'especial')"
                      ><q-tooltip>Ver Atencion</q-tooltip></q-btn>

                      <q-btn
                        v-if="['consulta', 'vacunacion', 'receta', 'desparasitacion'].includes(servicio.componente_clave)"
                        unelevated round dense icon="history_edu" size="11px" color="orange-1" text-color="orange-8" class="action-btn-v3"
                        @click.stop="$emit('firmar-servicio', servicio, 'especial')"
                      ><q-tooltip>Firmar Documento</q-tooltip></q-btn>
                      
                      <q-btn
                        v-if="servicio.componente_clave === 'receta'"
                        unelevated round dense icon="receipt_long" size="11px" color="pink-1" text-color="pink-7" class="action-btn-v3"
                        @click.stop="$emit('imprimir-servicio', servicio, 'especial')"
                      ><q-tooltip>Ver Receta</q-tooltip></q-btn>

                      <q-btn-dropdown
                        v-if="servicio.plantillas_servicio && servicio.plantillas_servicio.length > 1"
                        unelevated round dense icon="print" size="11px" color="grey-2" text-color="grey-7" class="action-btn-v3"
                      >
                        <q-list dense style="min-width: 180px">
                          <q-item v-for="p in servicio.plantillas_servicio" :key="p.id_plantilla" clickable v-close-popup @click="$emit('imprimir-servicio', servicio, 'plantilla', p.id_plantilla)">
                            <q-item-section side><q-icon name="description" size="xs" color="primary" /></q-item-section>
                            <q-item-section class="text-weight-bold" style="font-size: 11px;">{{ p.nombre_plantilla }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                      <q-btn
                        v-else-if="servicio.plantillas_servicio?.length === 1 || servicio.id_plantilla"
                        unelevated round dense icon="print" size="11px" color="grey-2" text-color="grey-7" class="action-btn-v3"
                        @click.stop="$emit('imprimir-servicio', servicio, 'plantilla')"
                      ><q-tooltip>Imprimir</q-tooltip></q-btn>
                    </div>
                    <div v-else></div>

                    <q-btn color="primary" flat icon-right="arrow_forward" label="Ir al Servicio" size="11px" class="br-md" no-caps @click="$emit('seleccionar-pestaña', servicio.id)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  serviciosAplicados: {
    type: Array,
    default: () => []
  },
  atencion: {
    type: Object,
    default: () => ({})
  },
  paciente: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['seleccionar-pestaña', 'imprimir-servicio', 'imprimir-resumen', 'firmar-servicio'])

const serviciosCompletados = computed(() => props.serviciosAplicados.filter(s => s.completado))
const serviciosPendientes = computed(() => props.serviciosAplicados.filter(s => !s.completado))

const porcentajeProgreso = computed(() => {
  if (props.serviciosAplicados.length === 0) return 0
  return Math.round((serviciosCompletados.value.length / props.serviciosAplicados.length) * 100)
})

const getsDatosRelevantes = (servicio) => {
  const datos = servicio.datos || {}
  
  // Mapeo para servicios conocidos
  const mapeos = {
    vacunacion: {
      'Vacuna': datos.tipoVacuna?.label || datos.vacuna,
      'Lote': datos.numeroLote || datos.lote,
      'Próxima': datos.proximaVacuna
    },
    exploracion: {
      'Temp': datos.temperatura ? `${datos.temperatura}°C` : null,
      'Peso': datos.peso ? `${datos.peso} kg` : null,
      'FC': datos.frecuencia_cardiaca ? `${datos.frecuencia_cardiaca} lpm` : null
    },
    desparacitacion: {
      'Producto': datos.producto,
      'Vía': datos.viaAdministracion || datos.via
    }
  }

  if (mapeos[servicio.tipo]) {
    return mapeos[servicio.tipo]
  }

  // Lógica genérica para servicios dinámicos
  const keys = Object.keys(datos).filter(k => 
    datos[k] !== null && 
    datos[k] !== '' && 
    typeof datos[k] !== 'object'
  )
  
  const res = {}
  keys.slice(0, 3).forEach(k => {
    const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    res[label] = datos[k]
  })
  
  return res
}
</script>

<style scoped>
.servicio-resumen {
  padding: 4px;
}

/* Tarjetas de Métricas */
.metric-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
}

.metric-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.metric-card--total .metric-card__icon { background: #eff6ff; color: #2563eb; }
.metric-card--done .metric-card__icon { background: #ecfdf5; color: #10b981; }
.metric-card--pending .metric-card__icon { background: #fff7ed; color: #f59e0b; }

.metric-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metric-card__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

/* Panel de Estadísticas Premium */
.stats-panel {
  padding: 24px;
  border-radius: 20px;
  background: white;
  border: 1px solid #f1f5f9;
  height: 100%;
}

.premium-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.premium-glass::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  opacity: 0.8;
}

.stats-header {
  margin-bottom: 20px;
}

.progress-chart {
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.15));
}

.modern-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
}

.legend-item-v2 {
  width: 100%;
}

.legend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.legend-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.legend-count {
  font-size: 0.9rem;
  font-weight: 700;
}

.legend-bar {
  height: 6px;
  border-radius: 3px;
}

/* Diseño de Línea de Tiempo (Timeline) */
.timeline-container {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 24px;
}

/* Trail (Icono y Línea) */
.timeline-trail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.trail-line {
  width: 2px;
  flex: 1;
  background: #f1f5f9;
}

.trail-line--done {
  background: linear-gradient(180deg, #10b981, #f1f5f9);
}

.timeline-item--last .trail-line {
  display: none;
}

.trail-node {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 2px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.node--done {
  border-color: #10b981;
  background: #ecfdf5;
}

.node--pending {
  border-color: #ef4444;
  background: #fef2f2;
}

.node-glow {
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  filter: blur(8px);
  z-index: -1;
  opacity: 0.6;
}

.node--pending .q-icon {
  color: #ef4444 !important;
}

/* Tarjeta de Contenido */
.timeline-content-wrapper {
  flex: 1;
  padding-bottom: 32px;
}

.timeline-card {
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  position: relative;
}

.timeline-card:hover {
  transform: translateX(6px);
  border-color: #3b82f644;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.timeline-card--done {
  border-left: 4px solid #10b981;
  background: linear-gradient(to right, #f0fdf455, #ffffff);
}

.timeline-card--pending {
  border-left: 4px solid #ef4444;
  background: linear-gradient(to right, #fef2f255, #ffffff);
}

/* Información Clínica en el Timeline */
.info-badge {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 4px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.info-badge:hover {
  background: white;
  border-color: #3b82f6;
  transform: scale(1.05);
}

.info-badge__label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.info-badge__value {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e293b;
}

/* Acciones en la Tarjeta */
.border-t-dashed {
  border-top: 1px dashed #f1f5f9;
}

.action-btn-v3 {
  transition: all 0.3s ease;
  width: 34px;
  height: 34px;
}

.action-btn-v3:hover {
  transform: translateY(-3px) scale(1.1);
}

.br-md {
  border-radius: 8px;
}

.bg-positive-soft { background: #ecfdf5; }
.bg-orange-soft { background: #fff7ed; }

/* Animaciones */
.animate-fade-in {
  animation: slideInLeft 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-15px); }
  to { opacity: 1; transform: translateX(0); }
}

.timeline-item:nth-child(1) { animation-delay: 0.1s; }
.timeline-item:nth-child(2) { animation-delay: 0.2s; }
.timeline-item:nth-child(3) { animation-delay: 0.3s; }
.timeline-item:nth-child(4) { animation-delay: 0.4s; }
</style>

