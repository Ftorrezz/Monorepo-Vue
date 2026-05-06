<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-indigo-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-indigo-2 q-mr-md flex flex-center br-lg">
          <q-icon name="local_hospital" color="indigo-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-indigo-10">Hospitalización</div>
          <div class="text-caption text-indigo-7 opacity-80">
            {{ datosHospitalizacion.estado === 'activa' ? 'Paciente hospitalizado' : 'Registro de hospitalización' }}
          </div>
        </div>
        
        <div class="row items-center q-gutter-xs">
          <q-btn 
            v-if="modoLectura && !modoEdicionManual"
            flat dense round 
            color="indigo-7" 
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

          <q-btn-dropdown flat round icon="more_vert" color="indigo-7" dropdown-icon="none">
            <q-list dense style="min-width: 200px" class="br-md">
              <q-item clickable @click="imprimirReporte('especial')">
                <q-item-section avatar><q-icon name="print" color="indigo" size="20px" /></q-item-section>
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
              <q-item v-if="datosHospitalizacion.estado === 'pendiente'" clickable @click="iniciarHospitalizacion" class="text-positive" :disable="!formularioValido">
                <q-item-section avatar><q-icon name="play_arrow" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Iniciar Hospitalización</q-item-section>
              </q-item>

              <q-item v-if="datosHospitalizacion.estado === 'activa'" clickable @click="darDeAlta" class="text-primary">
                <q-item-section avatar><q-icon name="exit_to_app" color="primary" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Dar de Alta</q-item-section>
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
          <q-input
            v-model="datosHospitalizacion.motivoIngreso"
            label="Motivo de Ingreso *"
            outlined dense
            type="textarea"
            rows="2"
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosHospitalizacion.estado === 'activa'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosHospitalizacion.tipoHospitalizacion"
            :options="tiposHospitalizacion"
            label="Tipo *"
            outlined dense
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosHospitalizacion.estado === 'activa'"
          />
        </div>

        <div class="col-6 col-md-4">
          <q-input
            v-model="datosHospitalizacion.fechaIngresoEstimada"
            label="Fecha Estimada"
            outlined dense
            type="datetime-local"
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosHospitalizacion.estado === 'activa'"
          />
        </div>
        
        <div class="col-6 col-md-4">
          <q-input
            v-model="datosHospitalizacion.tiempoEstimado"
            label="Días Estimados"
            outlined dense
            type="number"
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosHospitalizacion.estado === 'activa'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosHospitalizacion.prioridad"
            :options="prioridades"
            label="Prioridad"
            outlined dense
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosHospitalizacion.estado === 'activa'"
          />
        </div>

        <div v-if="datosHospitalizacion.estado !== 'pendiente'" class="col-12">
           <q-separator class="q-my-md opacity-20" />
           <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="datosHospitalizacion.fechaIngresoReal"
                  label="Fecha Ingreso Real"
                  outlined dense
                  readonly
                  class="br-md bg-grey-1"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="datosHospitalizacion.estadoActual"
                  :options="estadosHospitalizacion"
                  label="Estado del Paciente"
                  outlined dense
                  class="br-md"
                  :readonly="modoLectura && !modoEdicionManual"
                />
              </div>
           </div>
        </div>

        <div class="col-12">
          <q-separator class="q-my-md opacity-20" />
          <div class="text-subtitle2 text-grey-8 q-mb-md">Plan y Cuidados</div>
          <q-input
            v-model="datosHospitalizacion.planTratamiento"
            label="Plan de Tratamiento"
            outlined
            type="textarea"
            rows="3"
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <div v-if="datosHospitalizacion.eventos.length > 0" class="col-12">
          <q-separator class="q-my-md opacity-20" />
          <div class="text-subtitle2 text-grey-8 q-mb-md">Línea de Tiempo</div>
          <q-timeline color="indigo" layout="comfortable" dense>
            <q-timeline-entry
              v-for="(evento, index) in datosHospitalizacion.eventos"
              :key="index"
              :color="getEventColor(evento.tipo)"
              :icon="getEventIcon(evento.tipo)"
              :subtitle="formatDateTime(evento.fecha)"
            >
              <div class="text-weight-bold text-grey-9">{{ evento.titulo }}</div>
              <div class="text-body2 text-grey-7">{{ evento.descripcion }}</div>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn v-if="modoEdicionManual" flat color="grey-7" label="Descartar" @click="cancelarEdicion" no-caps />
        
        <q-btn 
          v-if="datosHospitalizacion.estado === 'pendiente'"
          color="positive" 
          icon="play_arrow" 
          label="Iniciar Hospitalización" 
          @click="iniciarHospitalizacion" 
          :disable="!formularioValido || procesando"
          :loading="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="datosHospitalizacion.estado === 'activa'"
          color="primary" 
          icon="exit_to_app" 
          label="Dar de Alta" 
          @click="darDeAlta" 
          :disable="procesando"
          :loading="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="modoEdicionManual"
          color="indigo-8" 
          icon="save" 
          label="Guardar Cambios" 
          @click="guardarDatosSimple" 
          :disable="!formularioValido || procesando"
          :loading="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />
      </div>
    </q-card-section>
  </q-card>

  <!-- Modales Dinámicos -->
  <q-dialog v-model="mostrarModalAlta" persistent>
    <q-card style="min-width: 400px" class="br-xl">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Alta Hospitalaria</div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <q-select v-model="altaTemporal.tipo" :options="tiposAlta" label="Tipo de Alta" outlined dense class="br-md q-mb-md" />
        <q-input v-model="altaTemporal.resumen" label="Resumen y Recomendaciones" outlined type="textarea" rows="4" class="br-md" />
      </q-card-section>
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup no-caps />
        <q-btn color="primary" label="Confirmar Alta" @click="confirmarAlta" class="br-lg" no-caps />
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
const mostrarModalAlta = ref(false)

const datosHospitalizacion = ref({
  estado: 'pendiente',
  motivoIngreso: '',
  tipoHospitalizacion: null,
  fechaIngresoEstimada: '',
  fechaIngresoReal: '',
  tiempoEstimado: '',
  prioridad: 'Media',
  estadoActual: 'Estable',
  planTratamiento: '',
  eventos: [],
  observaciones: ''
})

const altaTemporal = ref({ tipo: 'Alta Médica', resumen: '' })

const tiposHospitalizacion = ['Cirugía', 'Tratamiento Médico', 'Observación', 'Urgencia']
const prioridades = ['Baja', 'Media', 'Alta', 'Crítica']
const estadosHospitalizacion = ['Estable', 'Reservado', 'Crítico', 'Fenecido']
const tiposAlta = ['Alta Médica', 'Alta Voluntaria', 'Traslado', 'Defunción']

const formularioValido = computed(() => {
  return datosHospitalizacion.value.motivoIngreso && datosHospitalizacion.value.tipoHospitalizacion
})

const iniciarHospitalizacion = () => {
  if (!formularioValido.value) return
  datosHospitalizacion.value.estado = 'activa'
  datosHospitalizacion.value.fechaIngresoReal = new Date().toISOString()
  
  datosHospitalizacion.value.eventos.push({
    tipo: 'nota',
    titulo: 'Ingreso Hospitalario',
    descripcion: datosHospitalizacion.value.motivoIngreso,
    fecha: new Date().toISOString()
  })
  
  guardarDatosSimple()
}

const darDeAlta = () => {
  mostrarModalAlta.value = true
}

const confirmarAlta = () => {
  datosHospitalizacion.value.estado = 'completada'
  datosHospitalizacion.value.eventos.unshift({
    tipo: 'mejoria',
    titulo: 'Alta: ' + altaTemporal.value.tipo,
    descripcion: altaTemporal.value.resumen,
    fecha: new Date().toISOString()
  })
  
  emit('servicio-completado', props.servicioId, { ...datosHospitalizacion.value })
  mostrarModalAlta.value = false
}

const cancelarEdicion = () => {
  if (props.datosIniciales) {
    datosHospitalizacion.value = JSON.parse(JSON.stringify(props.datosIniciales))
  }
  modoEdicionManual.value = false
}

const guardarDatosSimple = () => {
  emit('servicio-actualizado', props.servicioId, { ...datosHospitalizacion.value })
  modoEdicionManual.value = false
}

const getEventColor = (tipo) => {
  const colores = { medicamento: 'blue', cambio: 'orange', mejora: 'positive', nota: 'grey' }
  return colores[tipo] || 'indigo'
}

const getEventIcon = (tipo) => {
  const iconos = { medicamento: 'medication', cambio: 'swap_vert', mejora: 'trending_up', nota: 'note' }
  return iconos[tipo] || 'event'
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosHospitalizacion.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosHospitalizacion.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({
    title: 'Eliminar Servicio',
    message: '¿Estás seguro de eliminar este registro de Hospitalización?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosHospitalizacion.value = { ...datosHospitalizacion.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
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

.servicio-card {
  margin-bottom: 16px;
}
</style>