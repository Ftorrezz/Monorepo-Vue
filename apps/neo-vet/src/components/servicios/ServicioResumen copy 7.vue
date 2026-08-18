<template>
  <div class="servicio-resumen">
    <div v-if="hayAtencionSeleccionada" class="selected-attention-card premium-glass q-mb-lg">
      <div class="row items-start no-wrap q-gutter-sm">
        <div class="col overflow-hidden">
          <div class="text-caption text-uppercase text-grey-6">Atención seleccionada</div>
          <div class="text-subtitle1 text-weight-bold text-primary ellipsis">
            {{ etiquetaAtencionSeleccionada }}
          </div>
          <div class="text-body2 text-grey-7 ellipsis">
            {{ detalleAtencionSeleccionada }}
          </div>
        </div>
        <div class="col-auto">
          <div class="compact-dashboard">
            <div class="compact-metric compact-metric--total">
              <div class="compact-metric__label">Total</div>
              <div class="compact-metric__value">{{ serviciosAplicados.length }}</div>
            </div>
            <div class="compact-metric compact-metric--done">
              <div class="compact-metric__label">Listos</div>
              <div class="compact-metric__value">{{ serviciosCompletados.length }}</div>
            </div>
            <div class="compact-metric compact-metric--pending">
              <div class="compact-metric__label">Pend.</div>
              <div class="compact-metric__value">{{ serviciosPendientes.length }}</div>
            </div>
            <div class="compact-metric compact-metric--progress">
              <div class="compact-metric__label">%</div>
              <div class="compact-metric__value">{{ porcentajeProgreso }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Lista de Servicios con diseño premium -->
      <div class="col-12">
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
                <!-- Cabecera Consolidada -->
                <div class="row items-center justify-between no-wrap q-gutter-x-sm">
                  <div class="column flex-grow-1 overflow-hidden" style="min-width: 0;">
                    <span class="service-name-text ellipsis">{{ servicio.nombre }}</span>
                    <span class="service-meta-text">
                      <q-icon name="schedule" size="12px" class="q-mr-xs" />
                      {{ servicio.timestamp }}
                    </span>
                  </div>

                  <div class="row items-center no-wrap q-gutter-x-xs">
                    <q-chip 
                      dense 
                      outline 
                      :color="servicio.completado ? 'positive' : 'negative'" 
                      size="10px" 
                      class="text-weight-bold br-xs q-mx-xs"
                    >
                      {{ servicio.completado ? 'FIN' : 'PEND' }}
                    </q-chip>

                    <!-- Acciones Integradas -->
                    <div class="row items-center no-wrap q-gutter-x-xs" v-if="servicio.completado">
                      <q-btn
                        v-if="['consulta', 'vacunacion', 'receta', 'desparasitacion'].includes(servicio.componente_clave)"
                        unelevated round dense icon="print" size="11px" color="grey-2" text-color="grey-7" class="action-btn-v3"
                        @click.stop="$emit('imprimir-servicio', servicio, 'especial')"
                      ><q-tooltip>Imprimir</q-tooltip></q-btn>

                      <!-- Firmar: dropdown si hay múltiples plantillas -->
                      <q-btn-dropdown
                        v-if="['consulta', 'vacunacion', 'receta', 'desparasitacion'].includes(servicio.componente_clave) && servicio.plantillas_servicio && servicio.plantillas_servicio.length > 1"
                        unelevated round dense icon="history_edu" size="11px" color="orange-1" text-color="orange-8" class="action-btn-v3"
                        dropdown-icon="none"
                      ><q-tooltip>Firmar Documento</q-tooltip>
                        <q-list dense style="min-width: 190px">
                          <q-item-label header style="font-size: 10px; padding: 6px 12px 2px;" class="text-grey-6 text-uppercase">Seleccionar plantilla a firmar</q-item-label>
                          <q-item v-for="p in servicio.plantillas_servicio" :key="p.id_plantilla" clickable v-close-popup @click="$emit('firmar-servicio', servicio, 'plantilla', p.id_plantilla)">
                            <q-item-section side><q-icon name="history_edu" size="xs" color="orange-7" /></q-item-section>
                            <q-item-section class="text-weight-bold" style="font-size: 11px;">{{ p.nombre_plantilla }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>

                      <!-- Firmar: directo si hay exactamente 1 plantilla -->
                      <q-btn
                        v-else-if="['consulta', 'vacunacion', 'receta', 'desparasitacion'].includes(servicio.componente_clave) && servicio.plantillas_servicio?.length === 1"
                        unelevated round dense icon="history_edu" size="11px" color="orange-1" text-color="orange-8" class="action-btn-v3"
                        @click.stop="$emit('firmar-servicio', servicio, 'plantilla', servicio.plantillas_servicio[0].id_plantilla)"
                      ><q-tooltip>Firmar: {{ servicio.plantillas_servicio[0].nombre_plantilla }}</q-tooltip></q-btn>


                      <q-btn-dropdown
                        v-if="servicio.plantillas_servicio && servicio.plantillas_servicio.length > 1"
                        unelevated round dense icon="article" size="11px" color="teal-1" text-color="teal-7" class="action-btn-v3"
                        dropdown-icon="none"
                      ><q-tooltip>Plantillas</q-tooltip>
                        <q-list dense style="min-width: 180px">
                          <q-item v-for="p in servicio.plantillas_servicio" :key="p.id_plantilla" clickable v-close-popup @click="$emit('imprimir-servicio', servicio, 'plantilla', p.id_plantilla)">
                            <q-item-section side><q-icon name="description" size="xs" color="primary" /></q-item-section>
                            <q-item-section class="text-weight-bold" style="font-size: 11px;">{{ p.nombre_plantilla }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                      <q-btn
                        v-else-if="servicio.plantillas_servicio?.length === 1 || servicio.id_plantilla"
                        unelevated round dense icon="article" size="11px" color="teal-1" text-color="teal-7" class="action-btn-v3"
                        @click.stop="$emit('imprimir-servicio', servicio, 'plantilla')"
                      ><q-tooltip>Plantilla</q-tooltip></q-btn>
                    </div>

                    <q-btn unelevated round dense icon="arrow_forward" size="11px" color="primary" class="action-btn-v3 q-ml-xs shadow-sm" @click="$emit('seleccionar-pestaña', servicio.id)">
                      <q-tooltip>Ir al Servicio</q-tooltip>
                    </q-btn>
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

const hayAtencionSeleccionada = computed(() => {
  const atencion = props.atencion || {}
  return Boolean(atencion.id || atencion.numero || atencion.motivo || atencion.estado || atencion.veterinario)
})

const etiquetaAtencionSeleccionada = computed(() => {
  const atencion = props.atencion || {}
  if (atencion.numero) return `Atención ${atencion.numero}`
  if (atencion.id) return `Atención #${atencion.id}`
  return 'Atención seleccionada'
})

const detalleAtencionSeleccionada = computed(() => {
  const atencion = props.atencion || {}
  const partes = []

  if (atencion.motivo) partes.push(atencion.motivo)
  if (atencion.veterinario) partes.push(atencion.veterinario)

  const fecha = atencion.fecha || atencion.created_at
  if (fecha) partes.push(fecha)

  return partes.length > 0 ? partes.join(' • ') : 'Sin detalles adicionales'
})

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

/* Dashboard compacto del encabezado */
.compact-dashboard {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.compact-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(226, 232, 240, 0.9);
  min-width: 56px;
  min-height: 46px;
}

.compact-metric--total { background: #eff6ff; }
.compact-metric--done { background: #ecfdf5; }
.compact-metric--pending { background: #fff7ed; }
.compact-metric--progress { background: #f5f3ff; }

.compact-metric__label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1;
}

.compact-metric__value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

/* Panel de Estadísticas Premium */
.selected-attention-card {
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(255, 255, 255, 0.95));
}

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
  margin-top: -2px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 2px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-top: 6px;
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
  padding-bottom: 12px;
}

.timeline-card {
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
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
  padding: 2px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
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

.br-xs { border-radius: 4px; }
.shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.flex-grow-1 { flex-grow: 1; }

.action-btn-v3:hover {
  transform: scale(1.1);
}

.action-btn-v3 :deep(.q-btn-dropdown__arrow) {
  display: none !important;
}
</style>

