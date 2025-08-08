<template>
  <q-card class="servicio-card">
    <!-- Header compacto -->
    <q-card-section class="bg-gradient-primary text-white q-py-sm">
      <div class="row items-center no-wrap">
        <q-icon name="medication" size="sm" class="q-mr-sm"/>
        <div class="col-grow">
          <div class="text-subtitle1 text-weight-medium">Administración de Medicamentos</div>
          <div class="text-caption opacity-80">
            {{ datosMedicamentos.prescripciones.length }} prescripciones • 
            {{ estadisticas.pendientes }} pendientes
          </div>
        </div>
        <div class="col-auto">
          <div class="row q-gutter-xs">
            <q-chip 
              dense 
              square
              :color="estadisticas.vencidas > 0 ? 'red-4' : 'transparent'"
              :text-color="estadisticas.vencidas > 0 ? 'white' : 'white'"
              :label="estadisticas.vencidas"
              icon="warning"
              size="sm"
              class="q-px-xs"
            />
            <q-chip 
              dense 
              square
              color="transparent"
              text-color="white"
              :label="estadisticas.completadas"
              icon="check_circle"
              size="sm"
              class="q-px-xs"
            />
          </div>
        </div>
        <q-btn-dropdown 
          flat 
          dense
          round 
          icon="more_vert"
          :disable="modoLectura"
          dropdown-icon="none"
        >
          <q-list dense>
            <q-item clickable @click="agregarPrescripcion">
              <q-item-section avatar mini>
                <q-icon name="add_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Nueva Prescripción</q-item-section>
            </q-item>
            <q-item clickable @click="administrarMedicamento">
              <q-item-section avatar mini>
                <q-icon name="schedule" color="primary"/>
              </q-item-section>
              <q-item-section>Administrar Medicamento</q-item-section>
            </q-item>
            <q-item clickable @click="verHistorial">
              <q-item-section avatar mini>
                <q-icon name="history" color="blue"/>
              </q-item-section>
              <q-item-section>Ver Historial</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="eliminarServicio">
              <q-item-section avatar mini>
                <q-icon name="delete" color="negative"/>
              </q-item-section>
              <q-item-section>Eliminar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>
    
    <q-card-section class="q-pa-md">
      <!-- Estado vacío -->
      <div v-if="datosMedicamentos.prescripciones.length === 0" class="text-center q-py-lg">
        <q-icon name="medication" size="64px" color="grey-4" class="q-mb-md"/>
        <div class="text-h6 text-grey-6 q-mb-sm">No hay prescripciones activas</div>
        <div class="text-body2 text-grey-5 q-mb-md">Agrega la primera prescripción para comenzar</div>
        <q-btn 
          v-if="!modoLectura"
          color="primary" 
          icon="add" 
          label="Agregar Prescripción" 
          @click="agregarPrescripcion"
          unelevated
        />
      </div>
      
      <!-- Grid de prescripciones -->
      <div v-else class="prescripciones-grid">
        <!-- Filtros compactos -->
        <div class="row items-center q-mb-md">
          <div class="col-auto">
            <q-select
              v-model="filtroEstado"
              :options="estadosFiltro"
              label="Estado"
              outlined
              dense
              style="min-width: 120px"
              clearable
              class="q-mr-sm"
            />
          </div>
          <q-space />
          <div class="col-auto">
            <div class="row q-gutter-xs">
              <q-chip 
                dense
                :color="filtroEstado === 'activa' ? 'blue' : 'blue-2'" 
                :text-color="filtroEstado === 'activa' ? 'white' : 'blue-8'"
                clickable
                @click="filtroEstado = filtroEstado === 'activa' ? '' : 'activa'"
                :label="`${estadisticas.activas} Activas`"
                size="sm"
              />
              <q-chip 
                dense
                :color="filtroEstado === 'suspendida' ? 'orange' : 'orange-2'" 
                :text-color="filtroEstado === 'suspendida' ? 'white' : 'orange-8'"
                clickable
                @click="filtroEstado = filtroEstado === 'suspendida' ? '' : 'suspendida'"
                :label="`${estadisticas.suspendidas} Suspendidas`"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Lista de prescripciones en grid -->
        <div class="row q-col-gutter-md">
          <div 
            class="col-12 col-md-6 col-lg-4"
            v-for="(prescripcion, index) in prescripcionesFiltradas" 
            :key="prescripcion.id"
          >
            <q-card 
              flat 
              bordered 
              class="prescripcion-card full-height"
              :class="{ 'border-warning': tieneAdministracionesVencidas(prescripcion) }"
            >
              <!-- Header de la prescripción -->
              <q-card-section class="q-pa-sm bg-grey-1">
                <div class="row items-center no-wrap">
                  <div class="col-grow">
                    <div class="text-subtitle2 text-weight-medium text-primary ellipsis">
                      {{ prescripcion.medicamento }}
                    </div>
                    <div class="text-caption text-grey-7 ellipsis">
                      {{ prescripcion.dosificacion }} • {{ getFrecuenciaLabel(prescripcion.frecuencia) }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-chip 
                      dense
                      square
                      :color="getEstadoPrescripcionColor(prescripcion.estado)"
                      text-color="white"
                      :label="getEstadoLabel(prescripcion.estado)"
                      size="sm"
                    />
                  </div>
                </div>
              </q-card-section>

              <!-- Contenido principal -->
              <q-card-section class="q-pa-sm">
                <!-- Información básica -->
                <div class="row q-gutter-xs q-mb-sm">
                  <q-chip 
                    dense 
                    outline 
                    color="blue" 
                    size="sm"
                    :label="getViaLabel(prescripcion.viaAdministracion)"
                    icon="route"
                  />
                  <q-chip 
                    dense 
                    outline 
                    color="purple" 
                    size="sm"
                    :label="prescripcion.duracionTratamiento"
                    icon="schedule"
                  />
                </div>

                <!-- Próximas administraciones -->
                <div v-if="getProximasAdministraciones(prescripcion).length > 0" class="q-mb-sm">
                  <div class="text-caption text-weight-medium text-blue q-mb-xs">
                    <q-icon name="schedule" size="xs" class="q-mr-xs"/>
                    Próximas dosis
                  </div>
                  <div class="row q-gutter-xs">
                    <div 
                      v-for="(proxima, idx) in getProximasAdministraciones(prescripcion).slice(0, 2)" 
                      :key="idx"
                      class="col-12"
                    >
                      <div 
                        class="row items-center no-wrap q-pa-xs rounded-borders"
                        :class="isAdministracionVencida(proxima.fecha) ? 'bg-red-1' : 'bg-blue-1'"
                      >
                        <q-icon 
                          :name="isAdministracionVencida(proxima.fecha) ? 'warning' : 'schedule'"
                          :color="isAdministracionVencida(proxima.fecha) ? 'negative' : 'primary'"
                          size="xs"
                          class="q-mr-xs"
                        />
                        <div class="col-grow text-caption">
                          {{ formatTimeCompact(proxima.fecha) }}
                        </div>
                        <q-btn 
                          v-if="!modoLectura"
                          flat 
                          dense
                          round 
                          icon="medication" 
                          size="xs" 
                          color="positive"
                          @click="administrarEspecifica(prescripcion.id, proxima.fecha)"
                          :loading="administrando === `${prescripcion.id}-${proxima.fecha}`"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Última administración -->
                <div v-if="getUltimasAdministraciones(prescripcion).length > 0" class="q-mb-sm">
                  <div class="text-caption text-weight-medium text-green q-mb-xs">
                    <q-icon name="check_circle" size="xs" class="q-mr-xs"/>
                    Última dosis
                  </div>
                  <div class="bg-green-1 q-pa-xs rounded-borders">
                    <div class="text-caption">
                      {{ formatTimeCompact(getUltimasAdministraciones(prescripcion)[0].fechaAdministracion) }}
                      <q-chip 
                        dense 
                        square
                        size="sm" 
                        :color="getUltimasAdministraciones(prescripcion)[0].dosisCompleta ? 'positive' : 'warning'"
                        text-color="white"
                        :label="getUltimasAdministraciones(prescripcion)[0].dosisCompleta ? 'Completa' : 'Parcial'"
                        class="q-ml-xs"
                      />
                    </div>
                  </div>
                </div>
              </q-card-section>

              <!-- Acciones -->
              <q-card-actions class="q-pa-sm" v-if="!modoLectura">
                <q-btn 
                  flat 
                  dense
                  color="positive" 
                  icon="medication" 
                  label="Administrar"
                  @click="administrarAhora(prescripcion.id)"
                  size="sm"
                />
                <q-space />
                <q-btn-dropdown 
                  flat 
                  dense
                  round 
                  icon="more_vert" 
                  size="sm"
                >
                  <q-list dense>
                    <q-item clickable @click="editarPrescripcion(index)">
                      <q-item-section avatar mini>
                        <q-icon name="edit" color="primary"/>
                      </q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item clickable @click="suspenderPrescripcion(prescripcion.id)">
                      <q-item-section avatar mini>
                        <q-icon name="pause" color="warning"/>
                      </q-item-section>
                      <q-item-section>Suspender</q-item-section>
                    </q-item>
                    <q-item clickable @click="completarPrescripcion(prescripcion.id)">
                      <q-item-section avatar mini>
                        <q-icon name="check_circle" color="positive"/>
                      </q-item-section>
                      <q-item-section>Completar</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Observaciones compactas -->
        <div class="q-mt-md" v-if="datosMedicamentos.observaciones || !modoLectura">
          <q-expansion-item
            icon="notes"
            label="Observaciones"
            header-class="text-grey-7"
            dense
          >
            <q-input
              v-model="datosMedicamentos.observaciones"
              label="Observaciones del Plan de Medicación"
              outlined
              dense
              type="textarea"
              rows="2"
              :readonly="modoLectura"
            />
          </q-expansion-item>
        </div>
      </div>
    </q-card-section>

    <!-- Modal para nueva/editar prescripción -->
    <q-dialog v-model="mostrarModalPrescripcion" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ prescripcionEditando !== null ? 'Editar Prescripción' : 'Nueva Prescripción' }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="prescripcionTemporal.medicamento"
                label="Medicamento *"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="prescripcionTemporal.dosificacion"
                label="Dosificación *"
                outlined
                dense
                placeholder="ej: 10mg, 1 tableta, 5ml"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-select
                v-model="prescripcionTemporal.frecuencia"
                :options="frecuenciasDisponibles"
                label="Frecuencia *"
                outlined
                dense
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-select
                v-model="prescripcionTemporal.viaAdministracion"
                :options="viasAdministracion"
                label="Vía de Administración *"
                outlined
                dense
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="prescripcionTemporal.fechaInicio"
                label="Fecha de Inicio *"
                outlined
                dense
                type="datetime-local"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="prescripcionTemporal.duracionTratamiento"
                label="Duración del Tratamiento *"
                outlined
                dense
                placeholder="ej: 7 días, 2 semanas, indefinido"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="prescripcionTemporal.indicaciones"
                label="Indicaciones Especiales"
                outlined
                dense
                type="textarea"
                rows="3"
                placeholder="Con alimento, en ayunas, observaciones especiales..."
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarPrescripcion"/>
          <q-btn color="primary" label="Guardar" @click="guardarPrescripcion" unelevated/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para administrar medicamento -->
    <q-dialog v-model="mostrarModalAdministracion" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-positive text-white">
          <div class="text-h6">Administrar Medicamento</div>
          <div class="text-subtitle2 opacity-80">
            {{ administracionTemporal.medicamento }} - {{ administracionTemporal.dosificacion }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="administracionTemporal.fechaAdministracion"
                label="Fecha y Hora de Administración"
                outlined
                dense
                type="datetime-local"
              />
            </div>
            
            <div class="col-12">
              <q-toggle
                v-model="administracionTemporal.dosisCompleta"
                label="¿Se administró la dosis completa?"
                color="positive"
              />
            </div>
            
            <div class="col-12" v-if="!administracionTemporal.dosisCompleta">
              <q-input
                v-model="administracionTemporal.dosisAdministrada"
                label="Dosis Administrada"
                outlined
                dense
                placeholder="Especificar cantidad administrada"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="administracionTemporal.observaciones"
                label="Observaciones"
                outlined
                dense
                type="textarea"
                rows="3"
                placeholder="Reacciones, dificultades, notas..."
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarAdministracion"/>
          <q-btn 
            color="positive" 
            label="Confirmar Administración" 
            @click="confirmarAdministracion"
            :loading="administrando !== null"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para historial -->
    <q-dialog v-model="mostrarModalHistorial" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Historial de Administraciones</div>
          <q-btn 
            flat 
            round 
            icon="close" 
            v-close-popup 
            class="absolute-top-right q-ma-sm"
          />
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="historialCompleto"
            :columns="columnasHistorial"
            row-key="id"
            :pagination="paginacionHistorial"
            :filter="filtroHistorial"
            binary-state-sort
            dense
          >
            <template v-slot:top>
              <q-input
                v-model="filtroHistorial"
                debounce="300"
                placeholder="Buscar en historial..."
                class="col-12 col-md-4"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip 
                  :color="props.value === 'Administrado' ? 'positive' : 'warning'"
                  text-color="white"
                  :label="props.value"
                  size="sm"
                  dense
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  atencionId: {
    type: String,
    required: true
  },
  servicioId: {
    type: String,
    required: true
  },
  modoLectura: {
    type: Boolean,
    default: false
  },
  relacionadoCon: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'evento-creado'])

// Estados principales
const datosMedicamentos = ref({
  prescripciones: [],
  observaciones: '',
  estadisticas: {
    totalPrescripciones: 0,
    administracionesHoy: 0,
    administracionesPendientes: 0
  }
})

// Estados de modales
const mostrarModalPrescripcion = ref(false)
const mostrarModalAdministracion = ref(false)
const mostrarModalHistorial = ref(false)
const prescripcionEditando = ref(null)
const administrando = ref(null)

// Estados temporales
const prescripcionTemporal = ref({
  id: '',
  medicamento: '',
  dosificacion: '',
  frecuencia: '',
  viaAdministracion: '',
  fechaInicio: new Date().toISOString().slice(0, 16),
  duracionTratamiento: '',
  indicaciones: '',
  estado: 'activa',
  prescritoPor: 'Dr. Usuario Actual',
  administraciones: []
})

const administracionTemporal = ref({
  prescripcionId: '',
  medicamento: '',
  dosificacion: '',
  fechaAdministracion: new Date().toISOString().slice(0, 16),
  dosisCompleta: true,
  dosisAdministrada: '',
  administradoPor: 'Usuario Actual',
  observaciones: ''
})

// Estados de filtros
const filtroEstado = ref('')
const filtroHistorial = ref('')

// Opciones para selects
const frecuenciasDisponibles = [
  { label: 'Cada 4 horas', value: 'cada_4h' },
  { label: 'Cada 6 horas', value: 'cada_6h' },
  { label: 'Cada 8 horas', value: 'cada_8h' },
  { label: 'Cada 12 horas', value: 'cada_12h' },
  { label: 'Una vez al día', value: 'diaria' },
  { label: 'Dos veces al día', value: 'bid' },
  { label: 'Tres veces al día', value: 'tid' },
  { label: 'Según necesidad', value: 'prn' }
]

const viasAdministracion = [
  { label: 'Oral', value: 'oral' },
  { label: 'Intramuscular', value: 'im' },
  { label: 'Intravenosa', value: 'iv' },
  { label: 'Subcutánea', value: 'sc' },
  { label: 'Tópica', value: 'topica' },
  { label: 'Ocular', value: 'ocular' },
  { label: 'Ótica', value: 'otica' },
  { label: 'Rectal', value: 'rectal' }
]

const estadosFiltro = [
  'activa',
  'suspendida',
  'completada'
]

// Computed properties
const prescripcionesFiltradas = computed(() => {
  let prescripciones = datosMedicamentos.value.prescripciones
  
  if (filtroEstado.value) {
    prescripciones = prescripciones.filter(p => p.estado === filtroEstado.value)
  }
  
  return prescripciones
})

const estadisticas = computed(() => {
  const prescripciones = datosMedicamentos.value.prescripciones
  
  return {
    activas: prescripciones.filter(p => p.estado === 'activa').length,
    suspendidas: prescripciones.filter(p => p.estado === 'suspendida').length,
    completadas: prescripciones.filter(p => p.estado === 'completada').length,
    pendientes: prescripciones.reduce((acc, p) => {
      return acc + getProximasAdministraciones(p).length
    }, 0),
    vencidas: prescripciones.reduce((acc, p) => {
      return acc + getProximasAdministraciones(p).filter(a => 
        isAdministracionVencida(a.fecha)
      ).length
    }, 0)
  }
})

const historialCompleto = computed(() => {
  const historial = []
  
  datosMedicamentos.value.prescripciones.forEach(prescripcion => {
    prescripcion.administraciones.forEach(admin => {
      historial.push({
        id: `${prescripcion.id}-${admin.fechaAdministracion}`,
        medicamento: prescripcion.medicamento,
        dosificacion: prescripcion.dosificacion,
        fechaAdministracion: admin.fechaAdministracion,
        administradoPor: admin.administradoPor,
        estado: admin.dosisCompleta ? 'Administrado' : 'Parcial',
        observaciones: admin.observaciones || '-'
      })
    })
  })
  
  return historial.sort((a, b) => 
    new Date(b.fechaAdministracion) - new Date(a.fechaAdministracion)
  )
})

const columnasHistorial = [
  {
    name: 'medicamento',
    label: 'Medicamento',
    field: 'medicamento',
    align: 'left',
    sortable: true
  },
  {
    name: 'dosificacion',
    label: 'Dosificación',
    field: 'dosificacion',
    align: 'left'
  },
  {
    name: 'fechaAdministracion',
    label: 'Fecha/Hora',
    field: 'fechaAdministracion',
    align: 'left',
    sortable: true,
    format: val => formatDateTime(val)
  },
  {
    name: 'administradoPor',
    label: 'Administrado Por',
    field: 'administradoPor',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    field: 'observaciones',
    align: 'left'
  }
]

const paginacionHistorial = ref({
  rowsPerPage: 10
})

// Métodos de utilidad mejorados
const formatDate = (fechaISO) => {
  if (!fechaISO) return ''
  return new Date(fechaISO).toLocaleDateString('es-MX')
}

const formatDateTime = (fechaISO) => {
  if (!fechaISO) return ''
  return new Date(fechaISO).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeCompact = (fechaISO) => {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  const ahora = new Date()
  const diffDias = Math.floor((fecha - ahora) / (1000 * 60 * 60 * 24))
  
  if (diffDias === 0) {
    return 'Hoy ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDias === 1) {
    return 'Mañana ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDias === -1) {
    return 'Ayer ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  } else {
    return fecha.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) + ' ' + 
           fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }
}

const getEstadoPrescripcionColor = (estado) => {
  const colores = {
    'activa': 'positive',
    'suspendida': 'warning',
    'completada': 'blue'
  }
  return colores[estado] || 'grey'
}

const getEstadoLabel = (estado) => {
  const labels = {
    'activa': 'Activa',
    'suspendida': 'Suspendida',
    'completada': 'Completada'
  }
  return labels[estado] || estado
}

const getFrecuenciaLabel = (frecuencia) => {
  const frecuencia2 = frecuenciasDisponibles.find(f => f.value === frecuencia)
  return frecuencia2?.label || frecuencia
}

const getViaLabel = (via) => {
  const viaObj = viasAdministracion.find(v => v.value === via)
  return viaObj?.label || via
}

const isAdministracionVencida = (fecha) => {
  return new Date(fecha) < new Date()
}

const tieneAdministracionesVencidas = (prescripcion) => {
  return getProximasAdministraciones(prescripcion).some(a => isAdministracionVencida(a.fecha))
}

const getProximasAdministraciones = (prescripcion) => {
  // Lógica para calcular próximas administraciones basada en frecuencia
  // Esta es una implementación simplificada
  const proximasAdministraciones = []
  const ahora = new Date()
  const frecuenciaHoras = {
    'cada_4h': 4,
    'cada_6h': 6,
    'cada_8h': 8,
    'cada_12h': 12,
    'diaria': 24,
    'bid': 12,
    'tid': 8,
    'prn': 0
  }
  
  if (prescripcion.estado !== 'activa' || prescripcion.frecuencia === 'prn') {
    return proximasAdministraciones
  }
  
  const intervalo = frecuenciaHoras[prescripcion.frecuencia] || 24
  const ultimaAdmin = prescripcion.administraciones.length > 0 
    ? new Date(prescripcion.administraciones[prescripcion.administraciones.length - 1].fechaAdministracion)
    : new Date(prescripcion.fechaInicio)
  
  // Generar próximas 3 administraciones
  for (let i = 1; i <= 3; i++) {
    const proximaFecha = new Date(ultimaAdmin)
    proximaFecha.setHours(proximaFecha.getHours() + (intervalo * i))
    
    proximasAdministraciones.push({
      fecha: proximaFecha.toISOString()
    })
  }
  
  return proximasAdministraciones
}

const getUltimasAdministraciones = (prescripcion) => {
  return prescripcion.administraciones
    .sort((a, b) => new Date(b.fechaAdministracion) - new Date(a.fechaAdministracion))
    .slice(0, 3)
}

// Métodos de acción
const agregarPrescripcion = () => {
  prescripcionTemporal.value = {
    id: '',
    medicamento: '',
    dosificacion: '',
    frecuencia: '',
    viaAdministracion: '',
    fechaInicio: new Date().toISOString().slice(0, 16),
    duracionTratamiento: '',
    indicaciones: '',
    estado: 'activa',
    prescritoPor: 'Dr. Usuario Actual',
    administraciones: []
  }
  prescripcionEditando.value = null
  mostrarModalPrescripcion.value = true
}

const editarPrescripcion = (index) => {
  prescripcionEditando.value = index
  prescripcionTemporal.value = { ...datosMedicamentos.value.prescripciones[index] }
  mostrarModalPrescripcion.value = true
}

const guardarPrescripcion = () => {
  if (!prescripcionTemporal.value.medicamento || !prescripcionTemporal.value.dosificacion) {
    return
  }
  
  if (prescripcionEditando.value !== null) {
    // Editar prescripción existente
    datosMedicamentos.value.prescripciones[prescripcionEditando.value] = { 
      ...prescripcionTemporal.value 
    }
  } else {
    // Nueva prescripción
    prescripcionTemporal.value.id = `pres_${Date.now()}`
    datosMedicamentos.value.prescripciones.push({ ...prescripcionTemporal.value })
  }
  
  mostrarModalPrescripcion.value = false
  guardarDatos()
  
  // Si está relacionado con hospitalización, crear evento
  if (props.relacionadoCon?.tipo === 'hospitalizacion') {
    emit('evento-creado', {
      tipo: 'medicamento',
      titulo: `Prescripción: ${prescripcionTemporal.value.medicamento}`,
      descripcion: `${prescripcionTemporal.value.dosificacion} - ${prescripcionTemporal.value.frecuencia}`,
      fecha: new Date().toISOString(),
      observaciones: prescripcionTemporal.value.indicaciones
    })
  }
}

const cancelarPrescripcion = () => {
  mostrarModalPrescripcion.value = false
  prescripcionEditando.value = null
}

const administrarMedicamento = () => {
  const prescripcionesActivas = datosMedicamentos.value.prescripciones.filter(p => p.estado === 'activa')
  if (prescripcionesActivas.length === 0) {
    return
  }
  
  // Tomar la primera prescripción activa o permitir seleccionar
  administrarEspecifica(prescripcionesActivas[0].id)
}

const administrarAhora = (prescripcionId) => {
  administrarEspecifica(prescripcionId)
}

const administrarEspecifica = (prescripcionId, fechaProgramada = null) => {
  const prescripcion = datosMedicamentos.value.prescripciones.find(p => p.id === prescripcionId)
  if (!prescripcion) return
  
  administracionTemporal.value = {
    prescripcionId: prescripcionId,
    medicamento: prescripcion.medicamento,
    dosificacion: prescripcion.dosificacion,
    fechaAdministracion: fechaProgramada || new Date().toISOString().slice(0, 16),
    dosisCompleta: true,
    dosisAdministrada: '',
    administradoPor: 'Usuario Actual', // Obtener del contexto
    observaciones: ''
  }
  
  administrando.value = fechaProgramada ? `${prescripcionId}-${fechaProgramada}` : prescripcionId
  mostrarModalAdministracion.value = true
}

const confirmarAdministracion = () => {
  const prescripcion = datosMedicamentos.value.prescripciones.find(
    p => p.id === administracionTemporal.value.prescripcionId
  )
  
  if (!prescripcion) return
  
  // Agregar administración al historial
  prescripcion.administraciones.push({
    fechaAdministracion: administracionTemporal.value.fechaAdministracion,
    dosisCompleta: administracionTemporal.value.dosisCompleta,
    dosisAdministrada: administracionTemporal.value.dosisAdministrada,
    administradoPor: administracionTemporal.value.administradoPor,
    observaciones: administracionTemporal.value.observaciones
  })
  
  mostrarModalAdministracion.value = false
  administrando.value = null
  guardarDatos()
  
  // Si está relacionado con hospitalización, crear evento
  if (props.relacionadoCon?.tipo === 'hospitalizacion') {
    emit('evento-creado', {
      tipo: 'medicamento',
      titulo: `Administrado: ${administracionTemporal.value.medicamento}`,
      descripcion: `${administracionTemporal.value.dosificacion} - ${administracionTemporal.value.dosisCompleta ? 'Dosis completa' : 'Dosis parcial'}`,
      fecha: administracionTemporal.value.fechaAdministracion,
      observaciones: administracionTemporal.value.observaciones
    })
  }
}

const cancelarAdministracion = () => {
  mostrarModalAdministracion.value = false
  administrando.value = null
}

const suspenderPrescripcion = (prescripcionId) => {
  const prescripcion = datosMedicamentos.value.prescripciones.find(p => p.id === prescripcionId)
  if (prescripcion) {
    prescripcion.estado = 'suspendida'
    guardarDatos()
    
    // Crear evento si está relacionado con hospitalización
    if (props.relacionadoCon?.tipo === 'hospitalizacion') {
      emit('evento-creado', {
        tipo: 'cambio_estado',
        titulo: `Prescripción suspendida: ${prescripcion.medicamento}`,
        descripcion: 'La prescripción ha sido suspendida',
        fecha: new Date().toISOString(),
        observaciones: ''
      })
    }
  }
}

const completarPrescripcion = (prescripcionId) => {
  const prescripcion = datosMedicamentos.value.prescripciones.find(p => p.id === prescripcionId)
  if (prescripcion) {
    prescripcion.estado = 'completada'
    guardarDatos()
    
    // Crear evento si está relacionado con hospitalización
    if (props.relacionadoCon?.tipo === 'hospitalizacion') {
      emit('evento-creado', {
        tipo: 'mejoria',
        titulo: `Tratamiento completado: ${prescripcion.medicamento}`,
        descripcion: 'El tratamiento ha sido completado exitosamente',
        fecha: new Date().toISOString(),
        observaciones: ''
      })
    }
  }
}

const verHistorial = () => {
  mostrarModalHistorial.value = true
}

const guardarDatos = () => {
  emit('servicio-actualizado', props.servicioId, datosMedicamentos.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Métodos de inicialización
const inicializarDatos = () => {
  // Cargar datos desde props o API
  // Ejemplo de datos iniciales para demostración
  datosMedicamentos.value = {
    prescripciones: [
      {
        id: 'pres_001',
        medicamento: 'Amoxicilina 250mg',
        dosificacion: '1 cápsula',
        frecuencia: 'bid',
        viaAdministracion: 'oral',
        fechaInicio: new Date().toISOString(),
        duracionTratamiento: '7 días',
        indicaciones: 'Administrar con alimento',
        estado: 'activa',
        prescritoPor: 'Dr. Veterinario',
        administraciones: [
          {
            fechaAdministracion: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            dosisCompleta: true,
            dosisAdministrada: '',
            administradoPor: 'Enfermera María',
            observaciones: 'Administrado sin problemas'
          }
        ]
      },
      {
        id: 'pres_002',
        medicamento: 'Meloxicam',
        dosificacion: '0.5ml',
        frecuencia: 'diaria',
        viaAdministracion: 'oral',
        fechaInicio: new Date().toISOString(),
        duracionTratamiento: '5 días',
        indicaciones: 'Para dolor post-operatorio',
        estado: 'activa',
        prescritoPor: 'Dr. Veterinario',
        administraciones: []
      },
      {
        id: 'pres_003',
        medicamento: 'Omeprazol',
        dosificacion: '20mg',
        frecuencia: 'diaria',
        viaAdministracion: 'oral',
        fechaInicio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        duracionTratamiento: '10 días',
        indicaciones: 'En ayunas',
        estado: 'completada',
        prescritoPor: 'Dr. Veterinario',
        administraciones: [
          {
            fechaAdministracion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            dosisCompleta: true,
            dosisAdministrada: '',
            administradoPor: 'Enfermera Ana',
            observaciones: 'Completado según indicaciones'
          }
        ]
      }
    ],
    observaciones: 'Paciente responde bien al tratamiento. Monitorear efectos adversos.',
    estadisticas: {
      totalPrescripciones: 3,
      administracionesHoy: 1,
      administracionesPendientes: 4
    }
  }
}

// Watchers
watch(datosMedicamentos, guardarDatos, { deep: true })

// Inicialización
inicializarDatos()
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.prescripciones-grid {
  min-height: 200px;
}

.prescripcion-card {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.prescripcion-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.border-warning {
  border-left: 4px solid #ff9800 !important;
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.full-height .q-card-section:last-child {
  flex: 1;
}

.opacity-80 {
  opacity: 0.8;
}

.rounded-borders {
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .prescripciones-grid .row.q-col-gutter-md > div {
    padding: 8px;
  }
  
  .prescripcion-card {
    margin-bottom: 12px;
  }
}

/* Mejoras en la densidad visual */
.text-caption {
  line-height: 1.2;
}

.q-chip--dense {
  font-size: 0.75rem;
}

/* Animaciones suaves */
.q-card-section {
  transition: background-color 0.3s ease;
}

.q-expansion-item {
  border-radius: 4px;
  overflow: hidden;
}

/* Mejora visual de los modales */
.q-dialog .q-card {
  border-radius: 8px;
  overflow: hidden;
}

.q-dialog .q-card-section.bg-primary,
.q-dialog .q-card-section.bg-positive {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>