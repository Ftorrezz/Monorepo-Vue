<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-purple-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-purple-2 q-mr-md flex flex-center br-lg">
          <q-icon name="monitor_heart" color="purple-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-purple-10">Ultrasonido</div>
          <div class="text-caption text-purple-7 opacity-80">Estudio ecográfico diagnóstico</div>
        </div>
        
        <div class="row items-center q-gutter-xs">
          <q-btn 
            v-if="modoLectura && !modoEdicionManual"
            flat dense round 
            color="purple-7" 
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

          <q-btn-dropdown flat round icon="more_vert" color="purple-7" dropdown-icon="none">
            <q-list dense style="min-width: 200px" class="br-md">
              <q-item clickable @click="imprimirReporte('especial')">
                <q-item-section avatar><q-icon name="print" color="purple" size="20px" /></q-item-section>
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
              <q-item clickable @click="completarUltrasonido" class="text-positive" :disable="!formularioValido">
                <q-item-section avatar><q-icon name="check_circle" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Finalizar Estudio</q-item-section>
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
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosUltrasonido.tipoEstudio"
            :options="tiposEstudio"
            label="Tipo de Estudio *"
            outlined dense
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosUltrasonido.regionEstudiada"
            :options="regionesAnatomicas"
            label="Región Estudiada *"
            outlined dense
            multiple
            use-chips
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosUltrasonido.indicacion"
            :options="indicacionesClinicas"
            label="Indicación Clínica *"
            outlined dense
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosUltrasonido.tipoTransductor"
            :options="tiposTransductor"
            label="Tipo de Transductor"
            outlined dense
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosUltrasonido.frecuencia"
            label="Frecuencia (MHz)"
            outlined dense
            type="number"
            step="0.5"
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <div class="col-12">
          <div class="row items-center q-gutter-sm q-mb-md">
            <q-checkbox v-model="datosUltrasonido.ayuno" label="Ayuno" :disable="modoLectura && !modoEdicionManual" />
            <q-checkbox v-model="datosUltrasonido.sedacion" label="Sedación" :disable="modoLectura && !modoEdicionManual" />
            <q-checkbox v-model="datosUltrasonido.rasurado" label="Rasurado" :disable="modoLectura && !modoEdicionManual" />
          </div>
        </div>

        <div class="col-12">
          <q-input
            v-model="datosUltrasonido.hallazgosGenerales"
            label="Hallazgos Ecográficos *"
            outlined
            type="textarea"
            rows="4"
            class="br-md"
            placeholder="Describa los hallazgos observados en los diferentes órganos..."
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="datosUltrasonido.diagnostico"
            label="Interpretación y Diagnóstico *"
            outlined
            type="textarea"
            rows="3"
            class="br-md bg-purple-0"
            placeholder="Conclusión diagnóstica..."
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <div class="col-12">
          <q-file
            v-if="!modoLectura || modoEdicionManual"
            v-model="nuevosArchivos"
            label="Adjuntar Imágenes Ecográficas"
            outlined dense
            multiple
            use-chips
            class="br-md"
            accept=".jpg,.jpeg,.png,.pdf"
            @update:model-value="alAdjuntarArchivos"
          >
            <template v-slot:prepend><q-icon name="cloud_upload" color="primary" /></template>
          </q-file>

          <div v-if="datosUltrasonido.archivos_adjuntos?.length > 0" class="q-mt-md">
             <div class="row q-col-gutter-sm">
                <div v-for="(file, idx) in datosUltrasonido.archivos_adjuntos" :key="idx" class="col-auto">
                   <q-chip
                    removable
                    @remove="eliminarAdjunto(idx)"
                    color="grey-2"
                    text-color="grey-9"
                    class="br-md"
                    icon="image"
                    :disable="modoLectura && !modoEdicionManual"
                   >
                     {{ file.name || 'Archivo ' + (idx+1) }}
                   </q-chip>
                </div>
             </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn v-if="modoEdicionManual" flat color="grey-7" label="Descartar" @click="cancelarEdicion" no-caps />
        <q-btn 
          color="purple-8" 
          icon="check" 
          :label="modoEdicionManual ? 'Guardar Cambios' : 'Completar y Guardar'" 
          @click="completarUltrasonido" 
          :disable="!formularioValido || procesando"
          :loading="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />
      </div>
    </q-card-section>
  </q-card>
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
const nuevosArchivos = ref(null)

const datosUltrasonido = ref({
  tipoEstudio: null,
  regionEstudiada: [],
  indicacion: null,
  tipoTransductor: 'convexo',
  frecuencia: '',
  ayuno: false,
  sedacion: false,
  rasurado: true,
  hallazgosGenerales: '',
  diagnostico: '',
  archivos_adjuntos: []
})

const tiposEstudio = [
  { label: 'Abdominal', value: 'abdominal' },
  { label: 'Ecocardiografía', value: 'ecocardiografia' },
  { label: 'Tórax', value: 'torax' },
  { label: 'Reproductivo', value: 'reproductivo' },
  { label: 'Otro', value: 'otro' }
]

const regionesAnatomicas = [
  { label: 'Hígado/Vesícula', value: 'higado_vesicula' },
  { label: 'Bazo', value: 'bazo' },
  { label: 'Riñones', value: 'rinones' },
  { label: 'Vejiga', value: 'vejiga' },
  { label: 'Tracto GI', value: 'gi' },
  { label: 'Corazón', value: 'corazon' }
]

const indicacionesClinicas = [
  { label: 'Dolor abdominal', value: 'dolor' },
  { label: 'Vómitos/Diarrea', value: 'gi' },
  { label: 'Gestación', value: 'gestacion' },
  { label: 'Masa palpable', value: 'masa' }
]

const tiposTransductor = [
  { label: 'Convexo', value: 'convexo' },
  { label: 'Lineal', value: 'lineal' },
  { label: 'Microconvexo', value: 'microconvexo' }
]

const formularioValido = computed(() => {
  return datosUltrasonido.value.tipoEstudio && 
         datosUltrasonido.value.regionEstudiada.length > 0 && 
         datosUltrasonido.value.hallazgosGenerales && 
         datosUltrasonido.value.diagnostico
})

const alAdjuntarArchivos = (files) => {
  if (!files) return
  files.forEach(f => {
    datosUltrasonido.value.archivos_adjuntos.push({
      name: f.name,
      size: f.size,
      type: f.type,
      ultimoUpdate: new Date().toISOString()
    })
  })
  nuevosArchivos.value = null
}

const eliminarAdjunto = (idx) => {
  datosUltrasonido.value.archivos_adjuntos.splice(idx, 1)
}

const completarUltrasonido = async () => {
  if (!formularioValido.value) return
  procesando.value = true
  try {
    emit('servicio-completado', props.servicioId, { ...datosUltrasonido.value })
    modoEdicionManual.value = false
  } finally {
    procesando.value = false
  }
}

const cancelarEdicion = () => {
  if (props.datosIniciales) {
    datosUltrasonido.value = JSON.parse(JSON.stringify(props.datosIniciales))
  }
  modoEdicionManual.value = false
}

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosUltrasonido.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosUltrasonido.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({
    title: 'Eliminar Servicio',
    message: '¿Estás seguro de eliminar este estudio de Ultrasonido?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosUltrasonido.value = { ...datosUltrasonido.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
  }
})
</script>

<style scoped>
.service-icon-wrap {
  width: 44px;
  height: 44px;
}
.br-xl { border-radius: 20px; }
.br-lg { border-radius: 12px; }
.br-md { border-radius: 8px; }
.border-top { border-top: 1px solid rgba(0,0,0,0.05); }
</style>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>