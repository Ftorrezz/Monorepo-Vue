<template>
    <q-card class="servicio-card">
      <q-card-section class="bg-green-1">
        <div class="row items-center">
          <q-icon name="vaccines" color="green" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Vacunación</div>
            <div class="text-caption text-grey-7">Registro de aplicación de vacunas</div>
          </div>
          <q-btn-dropdown 
            flat round 
            icon="more_vert"
            :disable="modoLectura"
          >
            <q-list>
              <q-item clickable @click="completarVacunacion" :disable="!formularioValido">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive"/>
                </q-item-section>
                <q-item-section>Marcar como Completada</q-item-section>
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
          <!-- Información básica de la vacuna -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.tipoVacuna"
              :options="tiposVacuna"
              label="Tipo de Vacuna *"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.laboratorio"
              :options="laboratorios"
              label="Laboratorio *"
              outlined
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.numeroLote"
              label="Número de Lote *"
              outlined
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.fechaVencimiento"
              label="Fecha de Vencimiento"
              outlined
              type="date"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.dosisAplicada"
              label="Dosis Aplicada (ml) *"
              outlined
              type="number"
              step="0.1"
              min="0"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Detalles de aplicación -->
          <div class="col-12">
            <q-separator class="q-my-md"/>
            <div class="text-subtitle2 q-mb-md">Detalles de Aplicación</div>
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.viaAdministracion"
              :options="viasAdministracion"
              label="Vía de Administración"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-input
              v-model="datosVacuna.sitioAplicacion"
              label="Sitio de Aplicación"
              outlined
              placeholder="Ej: Flanco izquierdo, cuello..."
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-input
              v-model="datosVacuna.proximaVacuna"
              label="Próxima Vacunación"
              outlined
              type="date"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Reacciones adversas -->
          <div class="col-12">
            <q-checkbox
              v-model="datosVacuna.reaccionesAdversas"
              label="¿Se presentaron reacciones adversas?"
              :disable="modoLectura"
            />
          </div>
          
          <div v-if="datosVacuna.reaccionesAdversas" class="col-12">
            <q-input
              v-model="datosVacuna.descripcionReacciones"
              label="Descripción de Reacciones"
              outlined
              type="textarea"
              rows="2"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Observaciones -->
          <div class="col-12">
            <q-input
              v-model="datosVacuna.observaciones"
              label="Observaciones"
              outlined
              type="textarea"
              rows="2"
              :readonly="modoLectura"
            />
          </div>
        </div>
      </q-card-section>
      
      <!-- Estado y acciones -->
      <q-card-section v-if="!modoLectura" class="bg-grey-1">
        <div class="row items-center justify-between">
          <div class="col-auto">
            <q-chip 
              :color="formularioValido ? 'green' : 'orange'"
              text-color="white"
              :icon="formularioValido ? 'check_circle' : 'warning'"
              :label="formularioValido ? 'Datos Completos' : 'Datos Incompletos'"
            />
          </div>
          
          <div class="col-auto">
            <q-btn
              color="positive"
              icon="check"
              label="Completar Vacunación"
              @click="completarVacunacion"
              :disable="!formularioValido"
            />
          </div>
        </div>
      </q-card-section>
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
    }
  })
  
  // Emits
  const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado'])
  
  // Estados del formulario
  const datosVacuna = ref({
    tipoVacuna: '',
    laboratorio: '',
    numeroLote: '',
    fechaVencimiento: '',
    dosisAplicada: '',
    viaAdministracion: 'subcutanea',
    sitioAplicacion: '',
    proximaVacuna: '',
    reaccionesAdversas: false,
    descripcionReacciones: '',
    observaciones: ''
  })
  
  // Opciones para selects
  const tiposVacuna = [
    { label: 'Triple Felina (FVRCP)', value: 'triple_felina', especies: ['felino'] },
    { label: 'Rabia', value: 'rabia', especies: ['canino', 'felino'] },
    { label: 'Parvovirus Canino', value: 'parvovirus', especies: ['canino'] },
    { label: 'Hepatitis Canina', value: 'hepatitis', especies: ['canino'] },
    { label: 'Moquillo Canino', value: 'moquillo', especies: ['canino'] },
    { label: 'Bordetella', value: 'bordetella', especies: ['canino'] },
    { label: 'Leucemia Felina', value: 'leucemia_felina', especies: ['felino'] },
    { label: 'Otra', value: 'otra', especies: ['canino', 'felino'] }
  ]
  
  const laboratorios = [
    'Zoetis', 'MSD Animal Health', 'Boehringer Ingelheim', 
    'Virbac', 'HIPRA', 'Fort Dodge', 'Otro'
  ]
  
  const viasAdministracion = [
    { label: 'Subcutánea', value: 'subcutanea' },
    { label: 'Intramuscular', value: 'intramuscular' },
    { label: 'Intranasal', value: 'intranasal' },
    { label: 'Oral', value: 'oral' }
  ]
  
  // Validaciones
  const formularioValido = computed(() => {
    return datosVacuna.value.tipoVacuna && 
           datosVacuna.value.laboratorio && 
           datosVacuna.value.numeroLote &&
           datosVacuna.value.dosisAplicada
  })
  
  // Métodos
  const calcularProximaVacuna = () => {
    if (datosVacuna.value.tipoVacuna && !datosVacuna.value.proximaVacuna) {
      const hoy = new Date()
      let mesesSiguientes = 12 // Default anual
      
      // Ajustar según tipo de vacuna
      switch(datosVacuna.value.tipoVacuna) {
        case 'parvovirus':
        case 'moquillo':
          mesesSiguientes = 12
          break
        case 'rabia':
          mesesSiguientes = 12
          break
        case 'bordetella':
          mesesSiguientes = 6
          break
      }
      
      hoy.setMonth(hoy.getMonth() + mesesSiguientes)
      datosVacuna.value.proximaVacuna = hoy.toISOString().split('T')[0]
    }
  }
  
  const guardarDatos = () => {
    if (formularioValido.value) {
      emit('servicio-actualizado', props.servicioId, datosVacuna.value)
    }
  }
  
  const completarVacunacion = () => {
    if (formularioValido.value) {
      emit('servicio-completado', props.servicioId, {
        ...datosVacuna.value,
        fechaAplicacion: new Date().toISOString(),
        aplicadaPor: 'Dr. Usuario Actual' // Obtener del contexto
      })
    }
  }
  
  const eliminarServicio = () => {
    emit('servicio-eliminado', props.servicioId)
  }
  
  // Watchers
  watch(() => datosVacuna.value.tipoVacuna, calcularProximaVacuna)
  watch(datosVacuna, guardarDatos, { deep: true })
  </script>
  
  <style scoped>
  .servicio-card {
    margin-bottom: 16px;
  }
  </style>