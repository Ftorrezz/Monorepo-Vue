<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-blue-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-blue-2 q-mr-md flex flex-center br-lg">
          <q-icon name="accessibility_new" color="blue-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-blue-10">Fisioterapia</div>
          <div class="text-caption text-blue-7 opacity-80">
             {{ datosFisioterapia.estado === 'activo' ? `Sesión ${sesionActual} de ${datosFisioterapia.totalSesiones}` : 
                datosFisioterapia.estado === 'completado' ? 'Tratamiento completado' : 'Plan de fisioterapia' }}
          </div>
        </div>
        
        <div class="row items-center q-gutter-xs">
          <q-btn 
            v-if="modoLectura && !modoEdicionManual"
            flat dense round 
            color="blue-7" 
            icon="edit" 
            size="sm" 
            @click="modoEdicionManual = true"
          >
            <q-tooltip>Habilitar Edición</q-tooltip>
          </q-btn>
          
          <q-btn 
            v-if="modoEdicionManual"
            flat dense round 
            color="grey-7" 
            icon="close" 
            size="sm" 
            @click="cancelarEdicion"
          >
            <q-tooltip>Cancelar Edición</q-tooltip>
          </q-btn>

          <q-btn-dropdown flat round icon="more_vert" color="blue-7" dropdown-icon="none">
            <q-list dense style="min-width: 200px" class="br-md">
              <q-item clickable @click="imprimirReporte('especial')">
                <q-item-section avatar><q-icon name="print" color="blue" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Imprimir Reporte</q-item-section>
              </q-item>

              <q-item clickable @click="firmarDocumento('especial')">
                <q-item-section avatar><q-icon name="history_edu" color="orange-8" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Visualizar y Firmar</q-item-section>
              </q-item>

              <q-separator v-if="plantillasServicio && plantillasServicio.length > 0" />
              
              <q-item v-if="plantillasServicio && plantillasServicio.length > 0" clickable>
                <q-item-section avatar><q-icon name="description" color="secondary" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Imprimir Plantilla</q-item-section>
                <q-item-section side><q-icon name="chevron_right" /></q-item-section>
                
                <q-menu anchor="top end" self="top start">
                  <q-list style="min-width: 200px">
                    <q-item v-for="p in plantillasServicio" :key="p.id_plantilla" clickable v-close-popup @click="imprimirReporte('plantilla', p.id_plantilla)">
                      <q-item-section avatar><q-icon name="description" color="secondary" size="xs" /></q-item-section>
                      <q-item-section>{{ p.nombre_plantilla }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>

              <q-separator />
              <q-item v-if="datosFisioterapia.estado === 'planificado'" clickable @click="iniciarTratamiento" class="text-positive" :disable="!formularioValido">
                <q-item-section avatar><q-icon name="play_arrow" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Iniciar Tratamiento</q-item-section>
              </q-item>

              <q-item v-if="datosFisioterapia.estado === 'activo'" clickable @click="agregarSesion" class="text-primary">
                <q-item-section avatar><q-icon name="add" color="primary" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Nueva Sesión</q-item-section>
              </q-item>

              <q-item clickable @click="eliminarServicio" class="text-negative">
                <q-item-section avatar><q-icon name="delete" color="negative" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Eliminar Servicio</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-lg">
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-8">
          <q-input
            v-model="datosFisioterapia.indicacionMedica"
            label="Indicación Médica *"
            outlined dense
            type="textarea"
            rows="2"
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosFisioterapia.estado !== 'planificado'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosFisioterapia.tipoTratamiento"
            :options="tiposTratamiento"
            label="Tipo de Tratamiento *"
            outlined dense
            class="br-md q-mb-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosFisioterapia.estado !== 'planificado'"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model="datosFisioterapia.totalSesiones" label="Sesiones" outlined dense type="number" class="br-md" :readonly="(modoLectura && !modoEdicionManual) || datosFisioterapia.estado !== 'planificado'" />
            </div>
            <div class="col-6">
              <q-select v-model="datosFisioterapia.frecuencia" :options="frecuencias" label="Frecuencia" outlined dense class="br-md" :readonly="(modoLectura && !modoEdicionManual) || datosFisioterapia.estado !== 'planificado'" />
            </div>
          </div>
        </div>

        <div v-if="datosFisioterapia.estado !== 'planificado'" class="col-12">
           <q-separator class="q-my-md opacity-20" />
           <div class="row items-center q-col-gutter-lg">
              <div class="col-12 col-md-4 flex flex-center">
                 <q-circular-progress :value="porcentajeProgreso" size="100px" :thickness="0.1" color="blue-7" track-color="blue-1" show-value class="text-blue-10 text-weight-bold br-xl shadow-1">
                    {{ Math.round(porcentajeProgreso) }}%
                 </q-circular-progress>
              </div>
              <div class="col-12 col-md-8">
                 <div class="text-subtitle2 text-grey-8 q-mb-xs">Sesiones: {{ sesionActual }} / {{ datosFisioterapia.totalSesiones }}</div>
                 <q-linear-progress :value="porcentajeProgreso / 100" color="blue-7" track-color="grey-2" size="10px" class="br-xl shadow-1" />
                 <div class="row q-gutter-sm q-mt-sm">
                    <q-chip dense outline color="blue-7" icon="calendar_today" :label="'Inicio: ' + datosFisioterapia.fechaInicio" />
                    <q-chip v-if="datosFisioterapia.fechaFinalizacion" dense color="positive" text-color="white" icon="check" :label="'Fin: ' + datosFisioterapia.fechaFinalizacion" />
                 </div>
              </div>
           </div>
        </div>

        <div v-if="datosFisioterapia.sesiones.length > 0" class="col-12">
          <q-separator class="q-my-md opacity-20" />
          <div class="text-subtitle2 text-grey-8 q-mb-md">Historial de Sesiones</div>
          <q-timeline color="blue" layout="comfortable" dense>
            <q-timeline-entry
              v-for="(sesion, index) in datosFisioterapia.sesiones"
              :key="index"
              :color="getSesionColor(sesion.evaluacion?.progreso || 'sin_cambio')"
              :icon="getSesionIcon(sesion.evaluacion?.progreso || 'sin_cambio')"
              :subtitle="formatDateTime(sesion.fecha)"
            >
              <div class="row items-center justify-between">
                 <div class="text-weight-bold text-grey-9">Sesión #{{ sesion.numeroSesion }}</div>
                 <q-btn v-if="!modoLectura || modoEdicionManual" flat dense round color="grey-6" icon="edit" size="xs" @click="editarSesion(index)" />
              </div>
              <div class="row q-gutter-xs q-mt-xs">
                 <q-badge v-for="t in sesion.tecnicasAplicadas" :key="t" color="blue-1" text-color="blue-10" dense :label="t" />
              </div>
              <div v-if="sesion.observaciones" class="text-body2 text-grey-7 q-mt-xs">{{ sesion.observaciones }}</div>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>
    </q-card-section>
    
    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn v-if="modoEdicionManual" flat color="grey-7" label="Descartar" @click="cancelarEdicion" no-caps />
        
        <q-btn 
          v-if="datosFisioterapia.estado === 'planificado'"
          color="positive" 
          icon="play_arrow" 
          label="Iniciar Tratamiento" 
          @click="iniciarTratamiento" 
          :disable="!formularioValido || procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="datosFisioterapia.estado === 'activo'"
          color="primary" 
          icon="add" 
          label="Siguiente Sesión" 
          @click="agregarSesion" 
          :disable="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="datosFisioterapia.estado === 'activo'"
          flat
          color="positive" 
          icon="check_circle" 
          label="Finalizar Tratamiento" 
          @click="finalizarTratamiento" 
          class="br-lg"
          no-caps
        />

        <q-btn 
          v-if="modoEdicionManual"
          color="blue-8" 
          icon="save" 
          label="Guardar Cambios" 
          @click="guardarLocal" 
          :disable="!formularioValido"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />
      </div>
    </q-card-section>
  </q-card>

  <!-- Modales Dinámicos -->
  <q-dialog v-model="mostrarModalSesion" persistent>
    <q-card style="min-width: 500px" class="br-xl">
       <q-card-section class="bg-blue text-white"><div class="text-h6">{{ sesionEditando !== null ? 'Editar' : 'Nueva' }} Sesión</div></q-card-section>
       <q-card-section class="q-pa-lg row q-col-gutter-md">
          <div class="col-6"><q-input v-model="sesionTemporal.fecha" label="Fecha/Hora" outlined dense type="datetime-local" class="br-md" /></div>
          <div class="col-6"><q-input v-model="sesionTemporal.duracion" label="Duración (min)" outlined dense type="number" class="br-md" /></div>
          <div class="col-12"><q-select v-model="sesionTemporal.tecnicasAplicadas" :options="tecnicasFisioterapia" label="Técnicas" outlined dense multiple use-chips class="br-md" /></div>
          <div class="col-12"><q-input v-model="sesionTemporal.observaciones" label="Notas de la sesión" outlined dense type="textarea" rows="3" class="br-md" /></div>
       </q-card-section>
       <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn color="blue" label="Guardar Sesión" @click="guardarSesion" class="br-lg px-lg" no-caps />
       </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarModalFinalizacion" persistent>
    <q-card style="min-width: 400px" class="br-xl">
       <q-card-section class="bg-positive text-white"><div class="text-h6">Finalizar Tratamiento</div></q-card-section>
       <q-card-section class="q-pa-lg">
          <q-select v-model="finalizacionTemporal.resultado" :options="resultadosTratamiento" label="Resultado" outlined dense class="br-md q-mb-md" />
          <q-input v-model="finalizacionTemporal.evaluacionFinal" label="Resumen Final" outlined type="textarea" rows="4" class="br-md" />
       </q-card-section>
       <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn color="positive" label="Confirmar Cierre" @click="confirmarFinalizacion" class="br-lg px-lg" no-caps />
       </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  modoLectura: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: () => ({}) },
  plantillasServicio: { type: Array, default: () => [] }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio', 'firmar-servicio'])
const $q = useQuasar()

const procesando = ref(false)
const modoEdicionManual = ref(false)
const mostrarModalSesion = ref(false)
const mostrarModalFinalizacion = ref(false)
const sesionEditando = ref(null)

const datosFisioterapia = ref({
  estado: 'planificado', indicacionMedica: '', tipoTratamiento: 'Rehabilitación', areaAfectada: [], totalSesiones: 5, frecuencia: 'Semanal', fechaInicio: '', fechaFinalizacion: '', sesiones: []
})

const sesionTemporal = ref({ numeroSesion: 1, fecha: '', duracion: 30, tecnicasAplicadas: [], observaciones: '', evaluacion: { progreso: 'sin_cambio' } })
const finalizacionTemporal = ref({ resultado: 'Exitoso', evaluacionFinal: '' })

const tiposTratamiento = ['Rehabilitación', 'Analgésico', 'Neurológico', 'Geriátrico']
const frecuencias = ['Diaria', 'Semanal', 'Quincenal']
const tecnicasFisioterapia = ['Masaje', 'Laser', 'Ultrasonido', 'Magneto', 'Ejercicios']
const resultadosTratamiento = ['Exitoso', 'Parcial', 'Sin cambio']

const formularioValido = computed(() => datosFisioterapia.value.indicacionMedica && datosFisioterapia.value.totalSesiones > 0)
const sesionActual = computed(() => datosFisioterapia.value.sesiones.length)
const porcentajeProgreso = computed(() => datosFisioterapia.value.totalSesiones > 0 ? (sesionActual.value / datosFisioterapia.value.totalSesiones) * 100 : 0)

const iniciarTratamiento = () => {
  datosFisioterapia.value.estado = 'activo'
  datosFisioterapia.value.fechaInicio = new Date().toLocaleDateString()
  guardarLocal()
}

const agregarSesion = () => {
  sesionTemporal.value = { 
    numeroSesion: sesionActual.value + 1, 
    fecha: new Date().toISOString().slice(0, 16), 
    duracion: 30, 
    tecnicasAplicadas: [], 
    observaciones: '', 
    evaluacion: { progreso: 'bueno' } 
  }
  sesionEditando.value = null
  mostrarModalSesion.value = true
}

const editarSesion = (idx) => {
  sesionEditando.value = idx
  sesionTemporal.value = JSON.parse(JSON.stringify(datosFisioterapia.value.sesiones[idx]))
  mostrarModalSesion.value = true
}

const guardarSesion = () => {
  if (sesionEditando.value !== null) {
    datosFisioterapia.value.sesiones[sesionEditando.value] = { ...sesionTemporal.value }
  } else {
    datosFisioterapia.value.sesiones.push({ ...sesionTemporal.value })
  }
  mostrarModalSesion.value = false
  guardarLocal()
}

const finalizarTratamiento = () => { mostrarModalFinalizacion.value = true }

const confirmarFinalizacion = () => {
  datosFisioterapia.value.estado = 'completado'
  datosFisioterapia.value.fechaFinalizacion = new Date().toLocaleDateString()
  emit('servicio-completado', props.servicioId, { ...datosFisioterapia.value })
  mostrarModalFinalizacion.value = false
}

const formatDateTime = (iso) => iso ? new Date(iso).toLocaleString() : ''
const getSesionColor = (p) => (p === 'bueno' ? 'positive' : 'blue')
const getSesionIcon = (p) => (p === 'bueno' ? 'trending_up' : 'calendar_today')

const cancelarEdicion = () => {
  if (props.datosIniciales) { datosFisioterapia.value = JSON.parse(JSON.stringify(props.datosIniciales)) }
  modoEdicionManual.value = false
}

const guardarLocal = () => { emit('servicio-actualizado', props.servicioId, { ...datosFisioterapia.value }) }

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosFisioterapia.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosFisioterapia.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({ title: 'Eliminar', message: '¿Eliminar fisioterapia?', cancel: true }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosFisioterapia.value = { ...datosFisioterapia.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
  }
})
</script>

<style scoped>
.service-icon-wrap { width: 44px; height: 44px; }
.br-xl { border-radius: 20px; }
.br-lg { border-radius: 12px; }
.br-md { border-radius: 8px; }
.border-top { border-top: 1px solid rgba(0,0,0,0.05); }
.bg-teal-0 { background: rgba(224, 242, 241, 0.4); }
</style>