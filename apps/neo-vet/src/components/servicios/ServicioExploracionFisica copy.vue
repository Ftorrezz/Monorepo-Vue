<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="medical_services" color="blue" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Exploración Física</div>
          <div class="text-caption text-grey-7">Registro del examen físico completo</div>
        </div>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
          :disable="modoLectura"
        >
          <q-list>
            <q-item clickable @click="completarExploracion" :disable="!formularioValido">
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Marcar como Completada</q-item-section>
            </q-item>
            <q-item clickable @click="configurarCampos" v-if="!modoLectura">
              <q-item-section avatar>
                <q-icon name="settings" color="primary"/>
              </q-item-section>
              <q-item-section>Configurar Campos</q-item-section>
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
      <!-- Signos Vitales -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="favorite" color="red" class="q-mr-sm"/>
            Signos Vitales
          </div>
        </div>
        
        <div class="col-6 col-md-3" v-if="camposHabilitados.temperatura">
          <q-input
            v-model="datosExploracion.temperatura"
            label="Temperatura (°C)"
            outlined
            type="number"
            step="0.1"
            min="35"
            max="42"
            :readonly="modoLectura"
            suffix="°C"
          />
        </div>
        
        <div class="col-6 col-md-3" v-if="camposHabilitados.frecuenciaCardiaca">
          <q-input
            v-model="datosExploracion.frecuenciaCardiaca"
            label="FC (lpm)"
            outlined
            type="number"
            min="40"
            max="250"
            :readonly="modoLectura"
            suffix="lpm"
          />
        </div>
        
        <div class="col-6 col-md-3" v-if="camposHabilitados.frecuenciaRespiratoria">
          <q-input
            v-model="datosExploracion.frecuenciaRespiratoria"
            label="FR (rpm)"
            outlined
            type="number"
            min="10"
            max="60"
            :readonly="modoLectura"
            suffix="rpm"
          />
        </div>
        
        <div class="col-6 col-md-3" v-if="camposHabilitados.peso">
          <q-input
            v-model="datosExploracion.peso"
            label="Peso (kg)"
            outlined
            type="number"
            step="0.1"
            min="0"
            :readonly="modoLectura"
            suffix="kg"
          />
        </div>
      </div>

      <!-- Examen por Sistemas -->
      <div class="row q-col-gutter-md q-mt-md" v-for="sistema in sistemasHabilitados" :key="sistema.codigo">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon :name="sistema.icono" :color="sistema.color" class="q-mr-sm"/>
            {{ sistema.nombre }}
          </div>
        </div>
        
        <div class="col-12" v-for="campo in sistema.campos" :key="campo.codigo">
          <!-- Campo de texto -->
          <q-input
            v-if="campo.tipo === 'texto'"
            v-model="datosExploracion.sistemas[sistema.codigo][campo.codigo]"
            :label="campo.nombre"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
            :placeholder="campo.placeholder"
          />
          
          <!-- Campo de selección -->
          <q-select
            v-else-if="campo.tipo === 'select'"
            v-model="datosExploracion.sistemas[sistema.codigo][campo.codigo]"
            :options="campo.opciones"
            :label="campo.nombre"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
          
          <!-- Campo numérico -->
          <q-input
            v-else-if="campo.tipo === 'numerico'"
            v-model="datosExploracion.sistemas[sistema.codigo][campo.codigo]"
            :label="campo.nombre"
            outlined
            type="number"
            :step="campo.paso || '1'"
            :min="campo.minimo"
            :max="campo.maximo"
            :readonly="modoLectura"
            :suffix="campo.unidad"
          />
          
          <!-- Campo de checkbox -->
          <q-checkbox
            v-else-if="campo.tipo === 'checkbox'"
            v-model="datosExploracion.sistemas[sistema.codigo][campo.codigo]"
            :label="campo.nombre"
            :disable="modoLectura"
          />
        </div>
      </div>

      <!-- Observaciones Generales -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Observaciones Generales</div>
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosExploracion.observaciones"
            label="Observaciones y Hallazgos"
            outlined
            type="textarea"
            rows="3"
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
            :label="formularioValido ? 'Exploración Completa' : 'Exploración Incompleta'"
          />
        </div>
        
        <div class="col-auto">
          <q-btn
            color="positive"
            icon="check"
            label="Completar Exploración"
            @click="completarExploracion"
            :disable="!formularioValido"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Modal de Configuración -->
    <q-dialog v-model="mostrarConfiguracion" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Configuración de Campos - Exploración Física</div>
          <div class="text-caption">Configure qué campos mostrar para este sitio</div>
        </q-card-section>

        <q-card-section>
          <q-tabs v-model="tabConfiguracion">
            <q-tab name="vitales" label="Signos Vitales"/>
            <q-tab name="sistemas" label="Sistemas"/>
          </q-tabs>

          <q-tab-panels v-model="tabConfiguracion">
            <!-- Configuración Signos Vitales -->
            <q-tab-panel name="vitales">
              <div class="q-gutter-md">
                <q-checkbox 
                  v-model="configuracion.signos_vitales.temperatura"
                  label="Temperatura"
                />
                <q-checkbox 
                  v-model="configuracion.signos_vitales.frecuencia_cardiaca"
                  label="Frecuencia Cardíaca"
                />
                <q-checkbox 
                  v-model="configuracion.signos_vitales.frecuencia_respiratoria"
                  label="Frecuencia Respiratoria"
                />
                <q-checkbox 
                  v-model="configuracion.signos_vitales.peso"
                  label="Peso"
                />
              </div>
            </q-tab-panel>

            <!-- Configuración Sistemas -->
            <q-tab-panel name="sistemas">
              <div class="q-gutter-md">
                <div v-for="sistema in sistemasPredefinidos" :key="sistema.codigo">
                  <q-expansion-item
                    :icon="sistema.icono"
                    :label="sistema.nombre"
                    v-model="configuracion.sistemas[sistema.codigo].habilitado"
                  >
                    <div class="q-pa-md">
                      <div v-for="campo in sistema.campos" :key="campo.codigo" class="q-mb-sm">
                        <q-checkbox 
                          v-model="configuracion.sistemas[sistema.codigo].campos[campo.codigo]"
                          :label="campo.nombre"
                        />
                      </div>
                    </div>
                  </q-expansion-item>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarConfiguracion"/>
          <q-btn color="primary" label="Guardar" @click="guardarConfiguracion"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

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
const datosExploracion = ref({
  temperatura: '',
  frecuenciaCardiaca: '',
  frecuenciaRespiratoria: '',
  peso: '',
  sistemas: {
    respiratorio: {},
    cardiovascular: {},
    digestivo: {},
    neurologico: {},
    musculoesqueletico: {},
    tegumentario: {},
    oftalmologico: {},
    otologico: {},
    genitourinario: {}
  },
  observaciones: ''
})

// Estados de configuración
const mostrarConfiguracion = ref(false)
const tabConfiguracion = ref('vitales')

// Configuración predefinida de sistemas
const sistemasPredefinidos = [
  {
    codigo: 'respiratorio',
    nombre: 'Sistema Respiratorio',
    icono: 'air',
    color: 'blue',
    campos: [
      {
        codigo: 'respiracion',
        nombre: 'Patrón Respiratorio',
        tipo: 'select',
        opciones: [
          { label: 'Normal', value: 'normal' },
          { label: 'Taquipnea', value: 'taquipnea' },
          { label: 'Bradipnea', value: 'bradipnea' },
          { label: 'Disnea', value: 'disnea' }
        ]
      },
      {
        codigo: 'auscultacion_pulmonar',
        nombre: 'Auscultación Pulmonar',
        tipo: 'texto',
        placeholder: 'Describir hallazgos...'
      },
      {
        codigo: 'tos',
        nombre: 'Presencia de tos',
        tipo: 'checkbox'
      }
    ]
  },
  {
    codigo: 'cardiovascular',
    nombre: 'Sistema Cardiovascular',
    icono: 'favorite',
    color: 'red',
    campos: [
      {
        codigo: 'auscultacion_cardiaca',
        nombre: 'Auscultación Cardíaca',
        tipo: 'texto',
        placeholder: 'R1 R2, soplos, arritmias...'
      },
      {
        codigo: 'pulso',
        nombre: 'Calidad del Pulso',
        tipo: 'select',
        opciones: [
          { label: 'Fuerte', value: 'fuerte' },
          { label: 'Débil', value: 'debil' },
          { label: 'Filiforme', value: 'filiforme' },
          { label: 'Saltón', value: 'salton' }
        ]
      },
      {
        codigo: 'mucosas',
        nombre: 'Color de Mucosas',
        tipo: 'select',
        opciones: [
          { label: 'Rosadas', value: 'rosadas' },
          { label: 'Pálidas', value: 'palidas' },
          { label: 'Cianóticas', value: 'cianoticas' },
          { label: 'Ictéricas', value: 'ictericas' }
        ]
      }
    ]
  },
  {
    codigo: 'digestivo',
    nombre: 'Sistema Digestivo',
    icono: 'restaurant',
    color: 'orange',
    campos: [
      {
        codigo: 'palpacion_abdominal',
        nombre: 'Palpación Abdominal',
        tipo: 'texto',
        placeholder: 'Dolor, masas, distensión...'
      },
      {
        codigo: 'condicion_corporal',
        nombre: 'Condición Corporal (1-9)',
        tipo: 'numerico',
        minimo: 1,
        maximo: 9,
        paso: '0.5'
      }
    ]
  },
  {
    codigo: 'neurologico',
    nombre: 'Sistema Neurológico',
    icono: 'psychology',
    color: 'purple',
    campos: [
      {
        codigo: 'estado_mental',
        nombre: 'Estado Mental',
        tipo: 'select',
        opciones: [
          { label: 'Alerta', value: 'alerta' },
          { label: 'Deprimido', value: 'deprimido' },
          { label: 'Letárgico', value: 'letargico' },
          { label: 'Estuporoso', value: 'estuporoso' }
        ]
      },
      {
        codigo: 'reflejos',
        nombre: 'Reflejos',
        tipo: 'texto',
        placeholder: 'Reflejos pupilares, patelares...'
      }
    ]
  },
  {
    codigo: 'tegumentario',
    nombre: 'Sistema Tegumentario',
    icono: 'healing',
    color: 'brown',
    campos: [
      {
        codigo: 'piel_pelaje',
        nombre: 'Estado de Piel y Pelaje',
        tipo: 'texto',
        placeholder: 'Lesiones, parasitos, alopecia...'
      },
      {
        codigo: 'hidratacion',
        nombre: 'Estado de Hidratación',
        tipo: 'select',
        opciones: [
          { label: 'Normal', value: 'normal' },
          { label: 'Deshidratación leve', value: 'leve' },
          { label: 'Deshidratación moderada', value: 'moderada' },
          { label: 'Deshidratación severa', value: 'severa' }
        ]
      }
    ]
  }
]

// Configuración actual del sitio
const configuracion = ref({
  signos_vitales: {
    temperatura: true,
    frecuencia_cardiaca: true,
    frecuencia_respiratoria: true,
    peso: true
  },
  sistemas: {}
})

// Inicializar configuración de sistemas
sistemasPredefinidos.forEach(sistema => {
  configuracion.value.sistemas[sistema.codigo] = {
    habilitado: true,
    campos: {}
  }
  sistema.campos.forEach(campo => {
    configuracion.value.sistemas[sistema.codigo].campos[campo.codigo] = true
  })
})

// Computed properties
const camposHabilitados = computed(() => {
  return {
    temperatura: configuracion.value.signos_vitales.temperatura,
    frecuenciaCardiaca: configuracion.value.signos_vitales.frecuencia_cardiaca,
    frecuenciaRespiratoria: configuracion.value.signos_vitales.frecuencia_respiratoria,
    peso: configuracion.value.signos_vitales.peso
  }
})

const sistemasHabilitados = computed(() => {
  return sistemasPredefinidos
    .filter(sistema => configuracion.value.sistemas[sistema.codigo]?.habilitado)
    .map(sistema => ({
      ...sistema,
      campos: sistema.campos.filter(campo => 
        configuracion.value.sistemas[sistema.codigo]?.campos[campo.codigo]
      )
    }))
})

const formularioValido = computed(() => {
  // Al menos debe tener temperatura o peso
  const tieneSignosBasicos = datosExploracion.value.temperatura || datosExploracion.value.peso
  
  // Debe tener al menos una observación en algún sistema o las observaciones generales
  const tieneObservaciones = datosExploracion.value.observaciones ||
    Object.values(datosExploracion.value.sistemas).some(sistema =>
      Object.values(sistema).some(valor => valor && valor !== '')
    )
  
  return tieneSignosBasicos && tieneObservaciones
})

// Métodos
const configurarCampos = () => {
  mostrarConfiguracion.value = true
}

const guardarConfiguracion = () => {
  // Aquí guardarías la configuración en el backend/localStorage
  console.log('Guardando configuración:', configuracion.value)
  mostrarConfiguracion.value = false
  
  // Reinicializar sistemas según nueva configuración
  inicializarSistemas()
}

const cancelarConfiguracion = () => {
  // Restaurar configuración anterior
  cargarConfiguracion()
  mostrarConfiguracion.value = false
}

const inicializarSistemas = () => {
  sistemasPredefinidos.forEach(sistema => {
    if (!datosExploracion.value.sistemas[sistema.codigo]) {
      datosExploracion.value.sistemas[sistema.codigo] = {}
    }
    sistema.campos.forEach(campo => {
      if (!datosExploracion.value.sistemas[sistema.codigo][campo.codigo]) {
        datosExploracion.value.sistemas[sistema.codigo][campo.codigo] = 
          campo.tipo === 'checkbox' ? false : ''
      }
    })
  })
}

const cargarConfiguracion = () => {
  // Aquí cargarías la configuración del sitio desde el backend
  // Por ahora usa la configuración por defecto
  console.log('Cargando configuración del sitio...')
}

const guardarDatos = () => {
  emit('servicio-actualizado', props.servicioId, datosExploracion.value)
}

const completarExploracion = () => {
  if (formularioValido.value) {
    emit('servicio-completado', props.servicioId, {
      ...datosExploracion.value,
      fechaExploracion: new Date().toISOString(),
      realizadaPor: 'Dr. Usuario Actual' // Obtener del contexto
    })
  }
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Lifecycle
onMounted(() => {
  cargarConfiguracion()
  inicializarSistemas()
})

// Watchers
watch(datosExploracion, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>