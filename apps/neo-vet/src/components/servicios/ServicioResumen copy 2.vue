<template>
  <div class="servicio-resumen">
    <div class="row q-col-gutter-lg">
      <!-- Resumen Estadístico Izquierda -->
      <div class="col-12 col-md-3">
        <q-card flat bordered class="summary-stats-card bg-grey-1">
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-weight-bold q-mb-xs">Atención Veterinario</div>
            <div class="row items-center q-gutter-x-sm">
              <q-circular-progress
                show-value
                font-size="10px"
                :value="porcentajeProgreso"
                size="50px"
                :thickness="0.15"
                color="primary"
                track-color="grey-3"
              >
                {{ porcentajeProgreso }}%
              </q-circular-progress>
              <div class="column">
                <div class="text-caption text-grey-7">{{ serviciosCompletados.length }}/{{ serviciosAplicados.length }} completados</div>
                <div class="text-caption" :class="porcentajeProgreso === 100 ? 'text-positive' : 'text-orange'">
                  {{ porcentajeProgreso === 100 ? '¡Listo!' : 'En proceso' }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="q-mt-sm">
          <q-btn
            unelevated
            color="primary"
            icon="print"
            label="Imprimir Resumen"
            class="full-width"
            no-caps
            @click="$emit('imprimir-resumen')"
          />
        </div>

        <q-separator class="q-my-md" />

        <div class="text-caption text-grey-8 q-mb-xs text-weight-bold">Leyenda de Estados</div>
        <q-list dense>
          <q-item dense class="q-px-none">
            <q-item-section avatar side><q-badge rounded color="positive" size="8px" /></q-item-section>
            <q-item-section><span class="text-caption">Finalizado</span></q-item-section>
          </q-item>
          <q-item dense class="q-px-none">
            <q-item-section avatar side><q-badge rounded color="orange" size="8px" /></q-item-section>
            <q-item-section><span class="text-caption">Pendiente</span></q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Timeline de Servicios Derecha -->
      <div class="col-12 col-md-9">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2 text-weight-bold">Línea de Vida de la Atención</div>
          <q-btn flat dense color="primary" label="Expandir Todo" icon="unfold_more" size="sm" no-caps />
        </div>
        
        <q-list padding class="q-pa-none">
          <q-item
            v-for="servicio in serviciosAplicados"
            :key="servicio.id"
            class="service-summary-item q-mb-sm rounded-borders no-padding overflow-hidden border-item"
            :class="servicio.completado ? 'border-positive' : 'border-orange'"
          >
            <q-item-section>
              <div class="row no-wrap items-center full-width">
                <!-- Icono de Estado -->
                <div class="status-indicator" :class="servicio.completado ? 'bg-positive' : 'bg-orange'">
                  <q-avatar size="24px" text-color="white" :icon="servicio.icono" />
                </div>

                <div class="col q-pa-sm">
                  <div class="row items-center justify-between">
                    <div class="row items-center q-gutter-x-sm">
                      <div class="text-weight-bold text-subtitle2">{{ servicio.nombre }}</div>
                      <q-icon v-if="servicio.completado" name="check_circle" color="positive" size="14px" />
                      <q-icon v-else name="pending" color="orange" size="14px" />
                    </div>
                    
                    <div class="row items-center q-gutter-x-xs">
                      <q-btn
                        flat round dense
                        icon="launch"
                        color="primary"
                        size="sm"
                        @click="$emit('seleccionar-pestaña', servicio.id)"
                      >
                        <q-tooltip>Ver Detalles</q-tooltip>
                      </q-btn>
                      
                      <template v-if="servicio.completado">
                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'vacunacion' || servicio.componente_clave === 'vacunacion'"
                          flat round dense
                          icon="card_membership"
                          color="primary"
                          size="sm"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Certificado</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'consulta' || servicio.componente_clave === 'consulta'"
                          flat round dense
                          icon="description"
                          color="primary"
                          size="sm"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Consulta</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'receta' || servicio.componente_clave === 'receta'"
                          flat round dense
                          icon="receipt_long"
                          color="secondary"
                          size="sm"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Receta Médica</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="servicio.tipo?.toLowerCase() === 'desparasitacion' || servicio.tipo?.toLowerCase() === 'desparacitacion' || servicio.componente_clave === 'desparacitacion'"
                          flat round dense
                          icon="bug_report"
                          color="orange"
                          size="sm"
                          @click="$emit('imprimir-servicio', servicio, 'especial')"
                        >
                          <q-tooltip>Imprimir Desparasitación</q-tooltip>
                        </q-btn>

                        <q-btn-dropdown
                          v-if="servicio.plantillas_servicio && servicio.plantillas_servicio.length > 0"
                          flat round dense
                          icon="print"
                          color="grey-7"
                          size="sm"
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

defineEmits(['seleccionar-pestaña', 'imprimir-servicio', 'imprimir-resumen'])

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
  width: 40px;
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
