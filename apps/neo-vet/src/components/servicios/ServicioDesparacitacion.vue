<template>
    <q-card class="servicio-card">
      <q-card-section class="bg-orange-1">
        <div class="row items-center">
          <q-icon name="medication" color="orange" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Desparacitación</div>
            <div class="text-caption text-grey-7">Registro de tratamiento antiparasitario</div>
          </div>
          <q-btn-dropdown 
            flat round 
            icon="more_vert"
            :disable="modoLectura"
          >
            <q-list>
              <q-item clickable @click="completarDesparacitacion" :disable="!formularioValido">
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
          <!-- Tipo de tratamiento -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosDesparacitacion.tipoTratamiento"
              :options="tiposTratamiento"
              label="Tipo de Tratamiento *"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosDesparacitacion.producto"
              :options="productosDisponibles"
              label="Producto *"
              outlined
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Detalles del producto -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="datosDesparacitacion.principioActivo"
              label="Principio Activo"
              outlined
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosDesparacitacion.presentacion"
              :options="presentaciones"
              label="Presentación"
              outlined
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Dosificación -->
          <div class="col-12">
            <q-separator class="q-my-md"/>
            <div class="text-subtitle2 q-mb-md">Dosificación</div>
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosDesparacitacion.pesoAnimal"
              label="Peso del Animal (kg) *"
              outlined
              type="number"
              step="0.1"
              min="0"
              :readonly="modoLectura"
              @update:model-value="calcularDosis"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosDesparacitacion.dosisAplicada"
              label="Dosis Aplicada *"
              outlined
              :readonly="modoLectura"
              :hint="dosisSugerida"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosDesparacitacion.viaAdministracion"
              label="Vía de Administración"
              outlined
              placeholder="Oral, tópica, etc."
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Parasitos objetivo -->
          <div class="col-12">
            <q-select
              v-model="datosDesparacitacion.tipoParasitos"
              :options="tiposParasitos"
              label="Parásitos Objetivo"
              outlined
              multiple
              use-chips
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Programación -->
          <div class="col-12">
            <q-separator class="q-my-md"/>
            <div class="text-subtitle2 q-mb-md">Programación del Tratamiento</div>
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosDesparacitacion.frecuenciaTratamiento"
              :options="frecuencias"
              label="Frecuencia de Tratamiento"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
              @update:model-value="calcularProximaDesparacitacion"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-input
              v-model="datosDesparacitacion.proximaDesparacitacion"
              label="Próxima Desparacitación"
              outlined
              type="date"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Observaciones -->
          <div class="col-12">
            <q-input
              v-model="datosDesparacitacion.observaciones"
              label="Observaciones"
              outlined
              type="textarea"
              rows="3"
              placeholder="Instrucciones especiales, efectos observados, etc."
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
              label="Completar Desparacitación"
              @click="completarDesparacitacion"
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
  const datosDesparacitacion = ref({
    tipoTratamiento: '',
    producto: '',
    principioActivo: '',
    presentacion: '',
    dosisAplicada: '',
    pesoAnimal: '',
    viaAdministracion: '',
    frecuenciaTratamiento: '',
    proximaDesparacitacion: '',
    tipoParasitos: [],
    observaciones: ''
  })
  
  // Opciones
  const tiposTratamiento = [
    { label: 'Desparasitación Interna', value: 'interno' },
    { label: 'Desparasitación Externa', value: 'externo' },
    { label: 'Tratamiento Completo', value: 'ambos' }
  ]
  
  const productos = {
    interno: ['Drontal Plus', 'Canex', 'Milbemax', 'Panacur', 'Otro'],
    externo: ['Bravecto', 'Frontline', 'Advantix', 'Seresto', 'Revolution', 'Otro'],
    ambos: ['Bravecto Plus', 'Simparica Trio', 'NexGard Spectra', 'Otro']
  }
  
  const presentaciones = [
    'Tabletas', 'Pipetas', 'Spray', 'Collar', 'Suspensión oral', 'Pasta oral'
  ]
  
  const tiposParasitos = [
    'Lombrices intestinales', 'Tenias', 'Ancilostomas', 'Trichuris',
    'Pulgas', 'Garrapatas', 'Piojos', 'Ácaros'
  ]
  
  const frecuencias = [
    { label: 'Cada mes', value: '1' },
    { label: 'Cada 2 meses', value: '2' },
    { label: 'Cada 3 meses', value: '3' },
    { label: 'Cada 6 meses', value: '6' },
    { label: 'Anual', value: '12' }
  ]
  
  // Computed
  const productosDisponibles = computed(() => {
    return productos[datosDesparacitacion.value.tipoTratamiento] || []
  })
  
  const formularioValido = computed(() => {
    return datosDesparacitacion.value.tipoTratamiento && 
           datosDesparacitacion.value.producto && 
           datosDesparacitacion.value.pesoAnimal &&
           datosDesparacitacion.value.dosisAplicada
  })
  
  const dosisSugerida = computed(() => {
    // Lógica básica de cálculo de dosis
    const peso = parseFloat(datosDesparacitacion.value.pesoAnimal)
    if (peso && datosDesparacitacion.value.producto) {
      // Ejemplo: 1 tableta por cada 10kg
      const tabletas = Math.ceil(peso / 10)
      return `Sugerido: ${tabletas} tableta(s) para ${peso}kg`
    }
    return ''
  })
  
  // Métodos
  const calcularDosis = () => {
    const peso = parseFloat(datosDesparacitacion.value.pesoAnimal)
    if (peso && datosDesparacitacion.value.producto) {
      // Lógica específica por producto
      if (datosDesparacitacion.value.presentacion === 'Tabletas') {
        const tabletas = Math.ceil(peso / 10)
        datosDesparacitacion.value.dosisAplicada = `${tabletas} tableta(s)`
      } else if (datosDesparacitacion.value.presentacion === 'Pipetas') {
        // Calcular pipetas según peso
        if (peso <= 4) {
          datosDesparacitacion.value.dosisAplicada = '1 pipeta (hasta 4kg)'
        } else if (peso <= 10) {
          datosDesparacitacion.value.dosisAplicada = '1 pipeta (4-10kg)'
        } else {
          datosDesparacitacion.value.dosisAplicada = '1 pipeta (>10kg)'
        }
      }
    }
  }
  
  const calcularProximaDesparacitacion = () => {
    if (datosDesparacitacion.value.frecuenciaTratamiento) {
      const hoy = new Date()
      const meses = parseInt(datosDesparacitacion.value.frecuenciaTratamiento)
      hoy.setMonth(hoy.getMonth() + meses)
      datosDesparacitacion.value.proximaDesparacitacion = hoy.toISOString().split('T')[0]
    }
  }
  
  const guardarDatos = () => {
    emit('servicio-actualizado', props.servicioId, datosDesparacitacion.value)
  }
  
  const completarDesparacitacion = () => {
    if (formularioValido.value) {
      emit('servicio-completado', props.servicioId, {
        ...datosDesparacitacion.value,
        fechaAplicacion: new Date().toISOString(),
        aplicadoPor: 'Dr. Usuario Actual'
      })
    }
  }
  
  const eliminarServicio = () => {
    emit('servicio-eliminado', props.servicioId)
  }
  
  // Watchers
  watch(() => datosDesparacitacion.value.tipoTratamiento, () => {
    datosDesparacitacion.value.producto = ''
  })
  
  watch(datosDesparacitacion, guardarDatos, { deep: true })
  </script>
  
  <style scoped>
  .servicio-card {
    margin-bottom: 16px;
  }
  </style>