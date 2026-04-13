<template>
  <div class="servicio-resumen">
    <div class="row q-col-gutter-md">
      <!-- Panel de progreso compacto -->
      <div class="col-12 col-md-3">
        <div class="progress-panel">
          <div class="progress-header">
            <q-circular-progress
              show-value
              font-size="10px"
              :value="porcentajeProgreso"
              size="56px"
              :thickness="0.18"
              color="primary"
              track-color="grey-3"
            >
              {{ porcentajeProgreso }}%
            </q-circular-progress>
            <div class="progress-stats">
              <div class="text-subtitle2 text-weight-bold">Progreso</div>
              <div class="progress-counts">
                <span class="text-positive text-weight-bold">{{ serviciosCompletados.length }}</span>
                <span class="text-grey-5">/</span>
                <span class="text-weight-bold">{{ serviciosAplicados.length }}</span>
                <span class="text-caption text-grey-6 q-ml-xs">servicios</span>
              </div>
            </div>
          </div>

          <q-separator class="q-my-sm" />

          <div class="mini-legend">
            <div class="legend-item">
              <div class="legend-dot bg-positive"></div>
              <span>Completado ({{ serviciosCompletados.length }})</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot bg-orange"></div>
              <span>Pendiente ({{ serviciosPendientes.length }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Servicios compacta -->
      <div class="col-12 col-md-9">
        <div class="services-list">
          <div
            v-for="servicio in serviciosAplicados"
            :key="servicio.id"
            class="service-row"
            :class="servicio.completado ? 'service-row--done' : 'service-row--pending'"
          >
            <!-- Indicador + Icono -->
            <div class="service-row__icon" :class="servicio.completado ? 'bg-positive' : 'bg-orange'">
              <q-icon :name="servicio.icono" size="20px" color="white" />
            </div>

            <!-- Info + datos -->
            <div class="service-row__body">
              <div class="service-row__top">
                <div class="service-row__info">
                  <div class="service-row__name">{{ servicio.nombre }}</div>
                  <div class="service-row__time">{{ servicio.timestamp }}</div>
                </div>

                <!-- Estado + Acciones -->
                <div class="service-row__actions">
                  <q-chip
                    dense
                    :color="servicio.completado ? 'positive' : 'orange'"
                    text-color="white"
                    :label="servicio.completado ? 'Completado' : 'Pendiente'"
                    size="sm"
                    class="service-row__chip"
                  />
                  <q-btn flat round dense icon="launch" size="sm" color="primary" @click="$emit('seleccionar-pestaña', servicio.id)">
                    <q-tooltip>Ir a pestaña</q-tooltip>
                  </q-btn>
                  <template v-if="servicio.completado">
                    <q-btn
                      v-if="servicio.tipo?.toLowerCase() === 'vacunacion' || servicio.componente_clave === 'vacunacion'"
                      flat round dense icon="card_membership" size="sm" color="primary"
                      @click="$emit('imprimir-servicio', servicio, 'especial')"
                    ><q-tooltip>Certificado</q-tooltip></q-btn>
                    <q-btn
                      v-if="servicio.tipo?.toLowerCase() === 'consulta' || servicio.componente_clave === 'consulta'"
                      flat round dense icon="description" size="sm" color="primary"
                      @click="$emit('imprimir-servicio', servicio, 'especial')"
                    ><q-tooltip>Imprimir Consulta</q-tooltip></q-btn>
                    <q-btn
                      v-if="servicio.tipo?.toLowerCase() === 'receta' || servicio.componente_clave === 'receta'"
                      flat round dense icon="receipt_long" size="sm" color="secondary"
                      @click="$emit('imprimir-servicio', servicio, 'especial')"
                    ><q-tooltip>Receta</q-tooltip></q-btn>
                    <q-btn
                      v-if="servicio.tipo?.toLowerCase() === 'desparasitacion' || servicio.tipo?.toLowerCase() === 'desparacitacion' || servicio.componente_clave === 'desparacitacion'"
                      flat round dense icon="bug_report" size="sm" color="orange"
                      @click="$emit('imprimir-servicio', servicio, 'especial')"
                    ><q-tooltip>Desparasitación</q-tooltip></q-btn>
                    <q-btn-dropdown
                      v-if="servicio.plantillas_servicio && servicio.plantillas_servicio.length > 1"
                      flat round dense icon="print" size="sm" color="secondary"
                    >
                      <q-list dense style="min-width: 200px">
                        <q-item
                          v-for="p in servicio.plantillas_servicio"
                          :key="p.id_plantilla"
                          clickable v-close-popup
                          @click="$emit('imprimir-servicio', servicio, 'plantilla', p.id_plantilla)"
                        >
                          <q-item-section avatar><q-icon name="description" color="secondary" size="xs" /></q-item-section>
                          <q-item-section>{{ p.nombre_plantilla || 'Plantilla ' + p.id_plantilla }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                    <q-btn
                      v-else-if="servicio.plantillas_servicio?.length === 1 || servicio.id_plantilla"
                      flat round dense icon="print" size="sm" color="secondary"
                      @click="$emit('imprimir-servicio', servicio, 'plantilla')"
                    ><q-tooltip>Imprimir</q-tooltip></q-btn>
                  </template>
                </div>
              </div>

              <!-- Datos relevantes (segunda línea) -->
              <div class="service-row__data" v-if="servicio.completado">
                <template v-for="(valor, label) in getsDatosRelevantes(servicio)" :key="label">
                  <div class="data-chip" v-if="valor">
                    <span class="data-chip__label">{{ label }}:</span>
                    <span class="data-chip__value">{{ valor }}</span>
                  </div>
                </template>
              </div>
              <div class="service-row__data" v-else>
                <span class="text-caption text-italic text-grey-5">Sin datos registrados aún</span>
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
    required: true
  }
})

defineEmits(['seleccionar-pestaña', 'imprimir-servicio'])

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
/* Panel de progreso */
.progress-panel {
  background: white;
  border: 1px solid #e8ecf0;
  border-radius: 10px;
  padding: 14px;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-stats {
  flex: 1;
}

.progress-counts {
  font-size: 13px;
}

.mini-legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Lista de servicios */
.services-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: white;
  border: 1px solid #e8ecf0;
  border-radius: 10px;
  transition: all 0.15s ease;
  border-left: 4px solid transparent;
}

.service-row:hover {
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.service-row--done {
  border-left-color: #4caf50;
}

.service-row--pending {
  border-left-color: #ff9800;
}

.service-row__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.service-row__body {
  flex: 1;
  min-width: 0;
}

.service-row__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.service-row__info {
  min-width: 0;
}

.service-row__name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.service-row__time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
}

.service-row__data {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.data-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f3f4f6;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  white-space: nowrap;
}

.data-chip__label {
  color: #9ca3af;
  font-weight: 500;
}

.data-chip__value {
  color: #374151;
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-row__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.service-row__chip {
  font-size: 11px;
}
</style>
