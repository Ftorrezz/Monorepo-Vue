<template>
  <div class="servicio-resumen">
    <div class="row q-col-gutter-lg">
      <!-- Resumen Estadístico Izquierda -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="summary-stats-card">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Progreso de la Atención</div>
            
            <div class="column q-gutter-y-md">
              <div class="row justify-between items-center">
                <div class="text-grey-7">Servicios agregados</div>
                <div class="text-weight-bold">{{ serviciosAplicados.length }}</div>
              </div>
              
              <div class="row justify-between items-center">
                <div class="text-grey-7">Completados</div>
                <div class="text-weight-bold text-positive">{{ serviciosCompletados.length }}</div>
              </div>
              
              <div class="row justify-between items-center">
                <div class="text-grey-7">Pendientes</div>
                <div class="text-weight-bold text-orange">{{ serviciosPendientes.length }}</div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="column items-center q-pt-md">
                <q-circular-progress
                  show-value
                  font-size="12px"
                  :value="porcentajeProgreso"
                  size="100px"
                  :thickness="0.2"
                  color="primary"
                  track-color="grey-3"
                  class="q-mb-sm"
                >
                  {{ porcentajeProgreso }}%
                </q-circular-progress>
                <div class="text-caption text-grey-6 text-center">
                  {{ porcentajeProgreso === 100 ? '¡Listo para finalizar!' : 'Complete los servicios para finalizar la atención' }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Leyenda / Accesos directos -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-grey-8 q-mb-sm">Leyenda de Estados</div>
            <div class="column q-gutter-y-sm">
              <div class="row items-center q-gutter-x-sm">
                <q-badge rounded color="positive" />
                <span class="text-caption">Servicio finalizado</span>
              </div>
              <div class="row items-center q-gutter-x-sm">
                <q-badge rounded color="orange" />
                <span class="text-caption">En proceso / Pendiente datos</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Timeline de Servicios Derecha -->
      <div class="col-12 col-md-8">
        <div class="text-h6 q-mb-md">Detalle de Servicios Aplicados</div>
        
        <q-list padding class="q-pa-none">
          <q-item
            v-for="servicio in serviciosAplicados"
            :key="servicio.id"
            class="service-summary-item q-mb-md rounded-borders no-padding overflow-hidden border-item"
            :class="servicio.completado ? 'border-positive' : 'border-orange'"
          >
            <q-item-section>
              <div class="row no-wrap items-center full-width">
                <!-- Icono de Estado -->
                <div class="status-indicator" :class="servicio.completado ? 'bg-positive' : 'bg-orange'">
                  <q-avatar size="32px" text-color="white" :icon="servicio.icono" />
                </div>

                <div class="col q-pa-md">
                  <div class="row items-center justify-between">
                    <div class="column">
                      <div class="text-weight-bold text-subtitle1">{{ servicio.nombre }}</div>
                      <div class="text-caption text-grey-6">{{ servicio.timestamp }}</div>
                    </div>
                    
                    <div class="row items-center q-gutter-x-sm">
                      <q-chip
                        dense
                        :color="servicio.completado ? 'positive' : 'orange'"
                        text-color="white"
                        :label="servicio.completado ? 'Completado' : 'Pendiente'"
                        size="sm"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="launch"
                        color="primary"
                        @click="$emit('seleccionar-pestaña', servicio.id)"
                      >
                        <q-tooltip>Ir a pestaña</q-tooltip>
                      </q-btn>
                      <template v-if="servicio.completado">
                        <!-- Impresión Dedicada (Certificados, etc) -->
                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'vacunacion' || servicio.componente_clave === 'vacunacion'"
                          flat round dense
                          icon="card_membership"
                          color="primary"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Certificado</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'consulta' || servicio.componente_clave === 'consulta'"
                          flat round dense
                          icon="description"
                          color="primary"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Consulta</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'receta' || servicio.componente_clave === 'receta'"
                          flat round dense
                          icon="receipt_long"
                          color="secondary"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Receta Médica</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'desparasitacion' || servicio.tipo?.toLowerCase() === 'desparacitacion' || servicio.componente_clave === 'desparacitacion'"
                          flat round dense
                          icon="bug_report"
                          color="orange"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Reporte Desparasitación</q-tooltip>
                        </q-btn>

                        <!-- Impresión de Plantillas (Reportes) -->
                        <q-btn-dropdown
                          v-if="servicio.plantillas_servicio && servicio.plantillas_servicio.length > 1"
                          flat round dense
                          icon="print"
                          color="secondary"
                        >
                          <q-list style="min-width: 200px">
                            <q-item 
                              v-for="p in servicio.plantillas_servicio" 
                              :key="p.id_plantilla" 
                              clickable 
                              v-close-popup
                              @click="$emit('imprimir-servicio', servicio, 'plantilla', p.id_plantilla)"
                            >
                              <q-item-section avatar>
                                <q-icon name="description" color="secondary" size="xs" />
                              </q-item-section>
                              <q-item-section>{{ p.nombre_plantilla || 'Plantilla ' + p.id_plantilla }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>

                        <q-btn
                          v-else-if="servicio.plantillas_servicio?.length === 1 || servicio.id_plantilla"
                          flat
                          round
                          dense
                          icon="print"
                          color="secondary"
                          @click="$emit('imprimir-servicio', servicio, 'plantilla')"
                        >
                          <q-tooltip>Imprimir Plantilla</q-tooltip>
                        </q-btn>
                      </template>
                    </div>
                  </div>

                  <!-- Resumen de datos del servicio -->
                  <div class="q-mt-sm service-data-preview bg-grey-1 q-pa-sm rounded-borders">
                    <div v-if="servicio.completado">
                      <div class="row q-col-gutter-sm">
                        <template v-for="(valor, label) in getsDatosRelevantes(servicio)" :key="label">
                          <div class="col-6 col-sm-4" v-if="valor">
                            <div class="text-caption text-grey-7 text-uppercase" style="font-size: 10px;">{{ label }}</div>
                            <div class="text-body2 text-weight-medium ellipsis">{{ valor }}</div>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div v-else class="text-caption text-italic text-grey-7">
                      No se han completado los registros de este servicio aún.
                    </div>
                  </div>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
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
.summary-stats-card {
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
}

.service-summary-item {
  transition: all 0.2s ease;
  background: white;
}

.service-summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.border-item {
  border: 1px solid #eee !important;
  border-left-width: 0 !important;
}

.border-positive { border-left: 5px solid #4caf50 !important; }
.border-orange { border-left: 5px solid #ff9800 !important; }

.status-indicator {
  width: 60px;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-data-preview {
  min-height: 48px;
}

.rounded-borders {
  border-radius: 8px !important;
}
</style>
