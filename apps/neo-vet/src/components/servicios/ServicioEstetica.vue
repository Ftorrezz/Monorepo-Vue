<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-pink-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-pink-2 q-mr-md flex flex-center br-lg">
          <q-icon name="pets" color="pink-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-pink-10">Estética Canina</div>
          <div class="text-caption text-pink-7 opacity-80">
            {{ datosEstetica.estado === 'completado' ? 'Servicio completado' : 
               datosEstetica.estado === 'en_proceso' ? 'En proceso' : 'Servicio programado' }}
          </div>
        </div>
        
        <div class="row items-center q-gutter-xs">
          <q-btn 
            v-if="modoLectura && !modoEdicionManual"
            flat dense round 
            color="pink-7" 
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

          <q-btn-dropdown flat round icon="more_vert" color="pink-7" dropdown-icon="none">
            <q-list dense style="min-width: 200px" class="br-md">
              <q-item clickable @click="imprimirReporte('especial')">
                <q-item-section avatar><q-icon name="print" color="pink" size="20px" /></q-item-section>
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
              <q-item v-if="datosEstetica.estado === 'programado'" clickable @click="iniciarServicio" class="text-positive" :disable="!formularioValido">
                <q-item-section avatar><q-icon name="play_arrow" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Iniciar Servicio</q-item-section>
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
          <q-select
            v-model="datosEstetica.tipoServicio"
            :options="['Baño', 'Corte', 'Uñas', 'Oídos', 'Drenado Glándulas']"
            label="Servicios a Realizar *"
            outlined dense multiple use-chips
            class="br-md q-mb-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosEstetica.estado === 'completado'"
          />
          <q-input
            v-model="datosEstetica.instruccionesEspeciales"
            label="Instrucciones del Cliente"
            outlined dense type="textarea" rows="2"
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12 col-md-4">
           <q-input v-model="datosEstetica.fechaProgramada" label="Programado" outlined dense type="datetime-local" class="br-md q-mb-md" :readonly="(modoLectura && !modoEdicionManual) || datosEstetica.estado !== 'programado'" />
           <q-select v-model="datosEstetica.tipoCorte" :options="['Raza', 'Cachorro', 'Verano', 'Higiénico']" label="Tipo de Corte" outlined dense class="br-md" :readonly="(modoLectura && !modoEdicionManual) || datosEstetica.estado === 'completado'" />
        </div>

        <div class="col-12">
           <q-separator class="q-my-md opacity-20" />
           <div class="text-subtitle2 text-grey-8 q-mb-md">Revisión Inicial Pelaje / Piel</div>
           <div class="row q-col-gutter-md">
              <div class="col-6 col-md-3">
                 <q-select v-model="datosEstetica.estadoPelaje.condicion" :options="['Excelente', 'Bueno', 'Con Nudos', 'Muy Sucio']" label="Condición" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
              <div class="col-6 col-md-3">
                 <q-select v-model="datosEstetica.estadoPelaje.tipo" :options="['Largo', 'Corto', 'Duro', 'Rizado']" label="Tipo Pelo" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
              <div class="col-12 col-md-6">
                 <q-input v-model="datosEstetica.estadoPelaje.observaciones" label="Hallazgos (Pulgas, Heridas, etc.)" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
           </div>
        </div>

        <div v-if="datosEstetica.estado !== 'programado'" class="col-12">
           <q-separator class="q-my-md opacity-20" />
           <div class="text-subtitle2 text-grey-8 q-mb-md">Insumos y Comportamiento</div>
           <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                 <q-input v-model="datosEstetica.productosUtilizados.shampoo" label="Shampoo / Jabón utilizado" outlined dense class="br-md q-mb-sm" :readonly="modoLectura && !modoEdicionManual" />
                 <q-select v-model="datosEstetica.productosUtilizados.tratamientosEspeciales" :options="['Antipulgas', 'Hidratante', 'Blanqueador']" label="Tratamientos" outlined dense multiple use-chips class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
              <div class="col-12 col-md-6">
                 <q-select v-model="datosEstetica.comportamiento.cooperacion" :options="['Muy Cooperativo', 'Tranquilo', 'Nervioso', 'Agresivo']" label="Cómo se portó" outlined dense class="br-md q-mb-sm" :readonly="modoLectura && !modoEdicionManual" />
                 <q-input v-model="datosEstetica.comportamiento.observaciones" label="Notas de manejo" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
           </div>
        </div>
      </div>
    </q-card-section>
    
    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn v-if="modoEdicionManual" flat color="grey-7" label="Descartar" @click="cancelarEdicion" no-caps />
        
        <q-btn 
          v-if="datosEstetica.estado === 'programado'"
          color="positive" 
          icon="play_arrow" 
          label="Iniciar Servicio" 
          @click="iniciarServicio" 
          :disable="!formularioValido || procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="datosEstetica.estado === 'en_proceso'"
          color="positive" 
          icon="check_circle" 
          label="Completar Servicio" 
          @click="completarServicio" 
          :disable="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="modoEdicionManual"
          color="pink-8" 
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
  <q-dialog v-model="mostrarModalCompletar" persistent>
    <q-card style="min-width: 400px" class="br-xl">
       <q-card-section class="bg-positive text-white"><div class="text-h6">Servicio Finalizado</div></q-card-section>
       <q-card-section class="q-pa-lg">
          <q-input v-model="datosComplecion.descripcionFinal" label="Resumen del trabajo" outlined type="textarea" rows="3" class="br-md q-mb-md" />
          <q-input v-model="datosComplecion.recomendacionesCuidado" label="Recomendaciones para el dueño" outlined type="textarea" rows="2" class="br-md q-mb-md" />
          <div class="row q-col-gutter-sm">
             <div class="col-6"><q-input v-model="datosComplecion.proximaCita" label="Próxima cita" outlined dense type="date" class="br-md" /></div>
             <div class="col-6"><q-select v-model="datosComplecion.satisfaccionCliente" :options="['Excelente', 'Buena', 'Regular']" label="Satisfacción" outlined dense class="br-md" /></div>
          </div>
       </q-card-section>
       <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn color="positive" label="Finalizar" @click="confirmarComplecion" class="br-lg px-lg" no-caps />
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
const mostrarModalCompletar = ref(false)

const datosEstetica = ref({
  estado: 'programado', tipoServicio: [], tipoCorte: 'Raza', fechaProgramada: '', duracionEstimada: 60, instruccionesEspeciales: '', estadoPelaje: { tipo: 'Corto', condicion: 'Bueno', observaciones: '' }, productosUtilizados: { shampoo: 'Neutro', tratamientosEspeciales: [] }, comportamiento: { cooperation: 'Tranquilo', observaciones: '' }
})

const datosComplecion = ref({ descripcionFinal: '', recomendacionesCuidado: '', proximaCita: '', satisfaccionCliente: 'Excelente' })

const formularioValido = computed(() => datosEstetica.value.tipoServicio.length > 0 && datosEstetica.value.fechaProgramada)

const iniciarServicio = () => {
  datosEstetica.value.estado = 'en_proceso'
  guardarLocal()
}

const completarServicio = () => { mostrarModalCompletar.value = true }

const confirmarComplecion = () => {
  datosEstetica.value.estado = 'completada'
  emit('servicio-completado', props.servicioId, { ...datosEstetica.value, ...datosComplecion.value })
  mostrarModalCompletar.value = false
}

const cancelarEdicion = () => {
  if (props.datosIniciales) { datosEstetica.value = JSON.parse(JSON.stringify(props.datosIniciales)) }
  modoEdicionManual.value = false
}

const guardarLocal = () => { emit('servicio-actualizado', props.servicioId, { ...datosEstetica.value }) }

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosEstetica.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosEstetica.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({ title: 'Eliminar', message: '¿Eliminar servicio?', cancel: true }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosEstetica.value = { ...datosEstetica.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
  }
})
</script>

<style scoped>
.service-icon-wrap { width: 44px; height: 44px; }
.br-xl { border-radius: 20px; }
.br-lg { border-radius: 12px; }
.br-md { border-radius: 8px; }
.border-top { border-top: 1px solid rgba(0,0,0,0.05); }
</style>