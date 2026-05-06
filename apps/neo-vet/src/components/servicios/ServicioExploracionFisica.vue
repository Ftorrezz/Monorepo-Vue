<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-blue-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-blue-2 q-mr-md flex flex-center br-lg">
          <q-icon name="medical_services" color="blue-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-blue-10">Exploración Física</div>
          <div class="text-caption text-blue-7 opacity-80">{{ configuracionCargada ? 'Configuración personalizada' : 'Cargando configuración...' }}</div>
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
              <q-item clickable @click="recargarConfiguracion">
                <q-item-section avatar><q-icon name="refresh" color="info" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Recargar Configuración</q-item-section>
              </q-item>

              <q-item clickable @click="completarExploracion" class="text-positive" :disable="!formularioValido">
                <q-item-section avatar><q-icon name="check_circle" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Finalizar Exploración</q-item-section>
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

    <q-card-section v-if="!configuracionCargada" class="text-center q-pa-xl">
      <q-spinner-dots size="40px" color="blue-7"/>
      <div class="text-body2 q-mt-md text-grey-7">Cargando parámetros...</div>
    </q-card-section>

    <q-card-section v-else-if="gruposActivos.length === 0" class="text-center q-pa-xl">
      <q-icon name="settings" size="48px" color="grey-4"/>
      <div class="text-body1 q-mt-md text-grey-8">No hay grupos configurados</div>
      <q-btn flat color="blue-7" label="Reintentar Carga" @click="recargarConfiguracion" class="q-mt-md" no-caps />
    </q-card-section>
    
    <q-card-section v-else class="q-pa-lg">
      <div 
        v-for="(grupo, grupoIndex) in gruposActivos" 
        :key="grupo.id"
        class="grupo-exploracion q-mb-xl"
      >
        <div class="row items-center q-mb-md">
          <div class="service-icon-wrap bg-grey-1 q-mr-sm flex flex-center br-md" style="width: 32px; height: 32px">
            <q-icon :name="grupo.icono" :color="grupo.color" size="18px"/>
          </div>
          <div class="text-subtitle1 text-weight-bold text-grey-9">
            {{ grupo.nombre }}
          </div>
          <q-space />
          <div v-if="grupo.descripcion" class="text-caption text-grey-6 italic">
            {{ grupo.descripcion }}
          </div>
        </div>

        <div class="row q-col-gutter-lg">
          <div 
            v-for="pregunta in grupo.preguntas"
            :key="pregunta.id"
            :class="getColSize(pregunta)"
          >
            <q-input
              v-if="pregunta.tipo === 'texto'"
              v-model="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              outlined dense
              class="br-md"
              :readonly="modoLectura && !modoEdicionManual"
              :placeholder="pregunta.placeholder"
            />
            
            <q-input
              v-else-if="pregunta.tipo === 'textarea'"
              v-model="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              outlined dense
              type="textarea"
              rows="2"
              class="br-md"
              :readonly="modoLectura && !modoEdicionManual"
              :placeholder="pregunta.placeholder"
            />
            
            <q-input
              v-else-if="pregunta.tipo === 'numerico'"
              v-model.number="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              outlined dense
              type="number"
              :step="pregunta.paso || '1'"
              class="br-md"
              :readonly="modoLectura && !modoEdicionManual"
              :suffix="pregunta.unidad"
              :placeholder="pregunta.placeholder"
            />
            
            <q-select
              v-else-if="pregunta.tipo === 'select'"
              v-model="datosExploracion[pregunta.codigo]"
              :options="pregunta.opciones"
              :label="pregunta.etiqueta"
              outlined dense
              class="br-md"
              :readonly="modoLectura && !modoEdicionManual"
              clearable
            />
            
            <q-checkbox
              v-else-if="pregunta.tipo === 'checkbox'"
              v-model="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              :disable="modoLectura && !modoEdicionManual"
              class="q-mt-xs"
            />
          </div>
        </div>
      </div>

      <div class="col-12 q-mt-lg">
        <q-separator class="q-my-md opacity-20"/>
        <div class="text-subtitle2 text-grey-8 q-mb-md">Observaciones Generales</div>
        <q-input
          v-model="datosExploracion.observaciones_generales"
          label="Hallazgos Adicionales"
          outlined
          type="textarea"
          rows="3"
          class="br-md bg-blue-0"
          :readonly="modoLectura && !modoEdicionManual"
          placeholder="..."
        />
      </div>
    </q-card-section>
    
    <q-card-section v-if="(!modoLectura || modoEdicionManual) && configuracionCargada && gruposActivos.length > 0" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="row items-center q-gutter-sm">
            <q-chip 
              dense
              :color="formularioValido ? 'positive' : 'warning'"
              text-color="white"
              class="br-md"
              :icon="formularioValido ? 'check' : 'priority_high'"
            >
              {{ camposCompletados }}/{{ totalCamposRequeridos }} campos requeridos
            </q-chip>
          </div>
        </div>
        
        <div class="row items-center q-gutter-sm">
          <q-btn v-if="modoEdicionManual" flat color="grey-7" label="Descartar" @click="cancelarEdicion" no-caps />
          <q-btn 
            color="blue-8" 
            icon="check" 
            :label="modoEdicionManual ? 'Guardar Cambios' : 'Completar Exploración'" 
            @click="completarExploracion" 
            :disable="!formularioValido || procesando"
            :loading="procesando"
            class="br-lg q-px-lg shadow-1"
            no-caps
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  modoLectura: { type: Boolean, default: false },
  sitioId: { type: String, required: true },
  datosIniciales: { type: Object, default: () => ({}) },
  plantillasServicio: { type: Array, default: () => [] }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio', 'firmar-servicio'])
const router = useRouter()
const $q = useQuasar()

const configuracionCargada = ref(false)
const configuracionSitio = ref([])
const datosExploracion = ref({ observaciones_generales: '' })
const procesando = ref(false)
const modoEdicionManual = ref(false)

const gruposActivos = computed(() => {
  return configuracionSitio.value
    .filter(grupo => grupo.activo)
    .sort((a, b) => a.orden - b.orden)
})

const totalCamposRequeridos = computed(() => {
  let total = 0
  gruposActivos.value.forEach(grupo => {
    total += grupo.preguntas.filter(p => p.requerido).length
  })
  return total
})

const camposCompletados = computed(() => {
  let completados = 0
  gruposActivos.value.forEach(grupo => {
    grupo.preguntas.forEach(pregunta => {
      if (pregunta.requerido && (datosExploracion.value[pregunta.codigo] !== null && datosExploracion.value[pregunta.codigo] !== '' && datosExploracion.value[pregunta.codigo] !== undefined)) {
        completados++
      }
    })
  })
  return completados
})

const formularioValido = computed(() => {
  if (totalCamposRequeridos.value === 0) return true
  return camposCompletados.value === totalCamposRequeridos.value
})

const getColSize = (pregunta) => {
  switch (pregunta.tipo) {
    case 'textarea': return 'col-12'
    case 'checkbox': return 'col-12 col-md-6'
    case 'numerico': return 'col-6 col-md-3'
    default: return 'col-12 col-md-6'
  }
}

const cargarConfiguracionSitio = async () => {
  try {
    procesando.value = true
    // Simulación - En un entorno real se llamaría al servicio factory o API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    configuracionSitio.value = [
      {
        id: '1', nombre: 'Signos Vitales', descripcion: 'Mediciones básicas', icono: 'thermostat', color: 'red', orden: 1, activo: true,
        preguntas: [
          { id: '1-1', etiqueta: 'Temperatura', codigo: 'temperatura', tipo: 'numerico', requerido: true, unidad: '°C', paso: '0.1', orden: 1 },
          { id: '1-2', etiqueta: 'Frecuencia Cardíaca', codigo: 'frecuencia_cardiaca', tipo: 'numerico', requerido: true, unidad: 'lpm', orden: 2 },
          { id: '1-3', etiqueta: 'Frecuencia Respiratoria', codigo: 'frecuencia_respiratoria', tipo: 'numerico', requerido: true, unidad: 'rpm', orden: 3 },
          { id: '1-4', etiqueta: 'Peso', codigo: 'peso', tipo: 'numerico', unidad: 'kg', paso: '0.1', orden: 4 }
        ]
      },
      {
        id: '2', nombre: 'Estado General', descripcion: 'Evaluación macroxcópica', icono: 'visibility', color: 'blue', orden: 2, activo: true,
        preguntas: [
          { id: '2-1', etiqueta: 'Condición Corporal', codigo: 'condicion_corporal', tipo: 'select', requerido: true, opciones: ['1/5', '2/5', '3/5', '4/5', '5/5'], orden: 1 },
          { id: '2-2', etiqueta: 'Mucosas', codigo: 'mucosas', tipo: 'select', requerido: true, opciones: ['Rosadas', 'Pálidas', 'Cianóticas', 'Ictéricas'], orden: 2 },
          { id: '2-3', etiqueta: 'TLLC', codigo: 'tllc', tipo: 'numerico', unidad: 'seg', orden: 3 }
        ]
      }
    ]
    
    inicializarDatosExploracion()
    configuracionCargada.value = true
  } catch (error) {
    console.error('Error al cargar configuración:', error)
  } finally {
    procesando.value = false
  }
}

const inicializarDatosExploracion = () => {
  configuracionSitio.value.forEach(grupo => {
    grupo.preguntas.forEach(pregunta => {
      if (datosExploracion.value[pregunta.codigo] === undefined) {
        datosExploracion.value[pregunta.codigo] = pregunta.tipo === 'checkbox' ? false : pregunta.tipo === 'numerico' ? null : ''
      }
    })
  })
}

const recargarConfiguracion = async () => {
  configuracionCargada.value = false
  await cargarConfiguracionSitio()
}

const cancelarEdicion = () => {
  if (props.datosIniciales) {
    datosExploracion.value = JSON.parse(JSON.stringify(props.datosIniciales))
  }
  modoEdicionManual.value = false
}

const completarExploracion = async () => {
  if (!formularioValido.value) return
  procesando.value = true
  try {
    emit('servicio-completado', props.servicioId, { ...datosExploracion.value })
    modoEdicionManual.value = false
  } finally {
    procesando.value = false
  }
}

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosExploracion.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosExploracion.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({
    title: 'Eliminar Servicio',
    message: '¿Estás seguro de eliminar esta Exploración Física?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(async () => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosExploracion.value = { ...datosExploracion.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
  }
  await cargarConfiguracionSitio()
})

watch(datosExploracion, () => {
  if (configuracionCargada.value && !props.modoLectura) {
    emit('servicio-actualizado', props.servicioId, datosExploracion.value)
  }
}, { deep: true })
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
.bg-blue-0 { background: rgba(225, 245, 254, 0.3); }

.servicio-card {
  margin-bottom: 16px;
}

.grupo-exploracion {
  margin-bottom: 24px;
}

.grupo-exploracion:last-child {
  margin-bottom: 0;
}
</style>