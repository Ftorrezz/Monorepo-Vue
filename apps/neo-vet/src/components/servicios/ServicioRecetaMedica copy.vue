<template>
  <q-card class="servicio-card border-left-recipe">
    <q-card-section class="bg-purple-1">
      <div class="row items-center">
        <q-icon name="receipt_long" color="secondary" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6 text-secondary">Receta Médica</div>
          <div class="text-caption text-grey-7">Prescripción de medicamentos e indicaciones</div>
        </div>
        <q-btn 
          v-if="modoLectura && !modoEdicionManual"
          flat dense round 
          color="secondary" 
          icon="edit" 
          size="sm" 
          @click="modoEdicionManual = true"
          class="q-mr-sm"
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
          class="q-mr-sm"
        >
          <q-tooltip>Cancelar Edición</q-tooltip>
        </q-btn>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
        >
          <q-list>
            <q-item clickable @click="imprimirReceta('especial')">
              <q-item-section avatar>
                <q-icon name="print" color="primary"/>
              </q-item-section>
              <q-item-section>Imprimir Receta</q-item-section>
            </q-item>

            <q-item v-if="plantillasServicio && plantillasServicio.length > 0" clickable>
              <q-item-section avatar>
                <q-icon name="description" color="secondary"/>
              </q-item-section>
              <q-item-section>
                Otras Plantillas
                <q-tooltip>Selecciona una plantilla adicional</q-tooltip>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
              
              <q-menu anchor="top end" self="top start">
                <q-list style="min-width: 200px">
                  <q-item 
                    v-for="p in plantillasServicio" 
                    :key="p.id_plantilla" 
                    clickable 
                    v-close-popup
                    @click="imprimirReceta('plantilla', p.id_plantilla)"
                  >
                    <q-item-section avatar>
                      <q-icon name="description" color="secondary" size="xs" />
                    </q-item-section>
                    <q-item-section>{{ p.nombre_plantilla || 'Plantilla ' + p.id_plantilla }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-separator />
            <q-item clickable @click="completarReceta" :disable="!formularioValido">
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Finalizar Receta</q-item-section>
            </q-item>
            <q-item clickable @click="eliminarServicio">
              <q-item-section avatar>
                <q-icon name="delete" color="negative"/>
              </q-item-section>
              <q-item-section>Eliminar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>

    <q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-input
            v-model="datosReceta.receta_indicaciones"
            label="Indicaciones de la Receta *"
            type="textarea"
            rows="8"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
            placeholder="Escribe aquí los medicamentos, dosis, frecuencia y duración del tratamiento..."
            :rules="[val => !!val || 'Las indicaciones son requeridas']"
          >
            <template v-slot:prepend>
              <q-icon name="medication" color="secondary" />
            </template>
          </q-input>
        </div>

        <div class="col-12">
          <q-input
            v-model="datosReceta.observaciones"
            label="Observaciones Internas"
            outlined
            dense
            :readonly="modoLectura && !modoEdicionManual"
            placeholder="Notas que no aparecen en la impresión..."
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 text-right q-gutter-x-sm">
      <q-btn 
        v-if="modoEdicionManual"
        flat
        color="grey-7"
        label="Cancelar"
        @click="cancelarEdicion"
      />
      <q-btn 
        :color="modoEdicionManual ? 'orange' : 'secondary'" 
        :icon="modoEdicionManual ? 'save' : 'save'" 
        :label="modoEdicionManual ? 'Guardar Cambios' : 'Guardar Receta'" 
        @click="completarReceta"
        :disable="!formularioValido"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  plantillasServicio: { type: Array, default: () => [] },
  modoLectura: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio'])

const modoEdicionManual = ref(false)

const datosReceta = ref({
  receta_indicaciones: '',
  observaciones: ''
})

const formularioValido = computed(() => {
  return !!datosReceta.value.receta_indicaciones
})

const guardarCambios = () => {
  emit('servicio-actualizado', props.servicioId, datosReceta.value)
}

const completarReceta = () => {
  if (formularioValido.value) {
    emit('servicio-completado', props.servicioId, {
      ...datosReceta.value,
      fecha_aplicacion: new Date().toISOString()
    })
    modoEdicionManual.value = false
  }
}

const cancelarEdicion = () => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    Object.assign(datosReceta.value, props.datosIniciales)
  } else {
    datosReceta.value = {
      receta_indicaciones: '',
      observaciones: ''
    }
  }
  modoEdicionManual.value = false
}

const imprimirReceta = (tipo = 'especial', idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, datosReceta.value, tipo, idPlantilla)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

watch(datosReceta, guardarCambios, { deep: true })

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    Object.assign(datosReceta.value, props.datosIniciales)
  }
})
</script>

<style scoped>
.servicio-card { margin-bottom: 20px; border-radius: 12px; }
.border-left-recipe { border-left: 5px solid #9c27b0; }
.bg-purple-1 { background: #f3e5f5; }
</style>
