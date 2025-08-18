<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="medical_services" color="blue" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Exploración Física</div>
          <div class="text-caption text-grey-7">{{ configuracionCargada ? 'Configuración personalizada cargada' : 'Cargando configuración...' }}</div>
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
            <q-item clickable @click="abrirConfiguracion" v-if="!modoLectura">
              <q-item-section avatar>
                <q-icon name="settings" color="primary"/>
              </q-item-section>
              <q-item-section>Ir a Configuración</q-item-section>
            </q-item>
            <q-item clickable @click="recargarConfiguracion">
              <q-item-section avatar>
                <q-icon name="refresh" color="info"/>
              </q-item-section>
              <q-item-section>Recargar Configuración</q-item-section>
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
    
    <q-card-section v-if="!configuracionCargada" class="text-center">
      <q-spinner-dots size="50px" color="primary"/>
      <div class="text-body2 q-mt-md">Cargando configuración del sitio...</div>
    </q-card-section>

    <q-card-section v-else-if="gruposActivos.length === 0" class="text-center">
      <q-icon name="settings" size="50px" color="grey-5"/>
      <div class="text-body1 q-mt-md">No hay grupos configurados</div>
      <div class="text-caption text-grey-7 q-mb-md">Configure los grupos de exploración física para este sitio</div>
      <q-btn 
        color="primary" 
        label="Configurar Ahora" 
        @click="abrirConfiguracion"
        v-if="!modoLectura"
      />
    </q-card-section>
    
    <q-card-section v-else>
      <!-- Grupos dinámicos -->
      <div 
        v-for="(grupo, grupoIndex) in gruposActivos" 
        :key="grupo.id"
        class="grupo-exploracion"
      >
        <!-- Header del grupo -->
        <div class="row items-center q-mb-md" v-if="grupoIndex > 0">
          <q-separator class="col"/>
        </div>
        
        <div class="text-subtitle2 q-mb-md">
          <q-icon :name="grupo.icono" :color="grupo.color" class="q-mr-sm"/>
          {{ grupo.nombre }}
          <span v-if="grupo.descripcion" class="text-caption text-grey-7 q-ml-sm">
            - {{ grupo.descripcion }}
          </span>
        </div>

        <!-- Preguntas del grupo -->
        <div class="row q-col-gutter-md">
          <div 
            v-for="pregunta in grupo.preguntas"
            :key="pregunta.id"
            :class="getColSize(pregunta)"
          >
            <!-- Campo de texto simple -->
            <q-input
              v-if="pregunta.tipo === 'texto'"
              v-model="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              outlined
              :readonly="modoLectura"
              :placeholder="pregunta.placeholder"
              :rules="pregunta.requerido ? [val => !!val || `${pregunta.etiqueta} es requerido`] : []"
            />
            
            <!-- Campo de área de texto -->
            <q-input
              v-else-if="pregunta.tipo === 'textarea'"
              v-model="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              outlined
              type="textarea"
              rows="2"
              :readonly="modoLectura"
              :placeholder="pregunta.placeholder"
              :rules="pregunta.requerido ? [val => !!val || `${pregunta.etiqueta} es requerido`] : []"
            />
            
            <!-- Campo numérico -->
            <q-input
              v-else-if="pregunta.tipo === 'numerico'"
              v-model.number="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              outlined
              type="number"
              :step="pregunta.paso || '1'"
              :min="pregunta.minimo"
              :max="pregunta.maximo"
              :readonly="modoLectura"
              :suffix="pregunta.unidad"
              :placeholder="pregunta.placeholder"
              :rules="pregunta.requerido ? [val => val !== null && val !== '' || `${pregunta.etiqueta} es requerido`] : []"
            />
            
            <!-- Campo de selección -->
            <q-select
              v-else-if="pregunta.tipo === 'select'"
              v-model="datosExploracion[pregunta.codigo]"
              :options="pregunta.opciones"
              :label="pregunta.etiqueta"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
              :rules="pregunta.requerido ? [val => !!val || `${pregunta.etiqueta} es requerido`] : []"
              clearable
            />
            
            <!-- Campo de checkbox -->
            <q-checkbox
              v-else-if="pregunta.tipo === 'checkbox'"
              v-model="datosExploracion[pregunta.codigo]"
              :label="pregunta.etiqueta"
              :disable="modoLectura"
            />
          </div>
        </div>
      </div>

      <!-- Observaciones Generales (siempre presente) -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Observaciones Generales</div>
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosExploracion.observaciones_generales"
            label="Observaciones y Hallazgos Adicionales"
            outlined
            type="textarea"
            rows="3"
            :readonly="modoLectura"
            placeholder="Registre cualquier observación adicional no contemplada en los campos anteriores..."
          />
        </div>
      </div>
    </q-card-section>
    
    <!-- Estado y acciones -->
    <q-card-section v-if="!modoLectura && configuracionCargada && gruposActivos.length > 0" class="bg-grey-1">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <div class="row items-center q-gutter-sm">
            <q-chip 
              :color="formularioValido ? 'green' : 'orange'"
              text-color="white"
              :icon="formularioValido ? 'check_circle' : 'warning'"
              :label="formularioValido ? 'Exploración Completa' : 'Exploración Incompleta'"
            />
            <div class="text-caption text-grey-7">
              {{ camposCompletados }}/{{ totalCamposRequeridos }} campos requeridos completados
            </div>
          </div>
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

    <!-- Modal de progreso -->
    <q-dialog v-model="mostrandoProgreso" persistent>
      <q-card>
        <q-card-section class="text-center">
          <q-spinner-dots size="50px" color="primary"/>
          <div class="text-h6 q-mt-md">{{ mensajeProgreso }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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
  sitioId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado'])

// Router
const router = useRouter()

// Estados principales
const configuracionCargada = ref(false)
const configuracionSitio = ref([])
const datosExploracion = ref({
  observaciones_generales: ''
})
const mostrandoProgreso = ref(false)
const mensajeProgreso = ref('')

// Computed properties
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
      if (pregunta.requerido && datosExploracion.value[pregunta.codigo]) {
        const valor = datosExploracion.value[pregunta.codigo]
        if (pregunta.tipo === 'checkbox') {
          // Para checkboxes, cualquier valor booleano es válido
          completados++
        } else if (valor !== null && valor !== '' && valor !== undefined) {
          completados++
        }
      }
    })
  })
  return completados
})

const formularioValido = computed(() => {
  if (totalCamposRequeridos.value === 0) {
    // Si no hay campos requeridos, el formulario es válido si tiene al menos una observación
    return datosExploracion.value.observaciones_generales?.trim() || 
           Object.keys(datosExploracion.value).some(key => {
             const valor = datosExploracion.value[key]
             return key !== 'observaciones_generales' && valor !== null && valor !== '' && valor !== undefined
           })
  }
  
  // Si hay campos requeridos, deben estar todos completados
  return camposCompletados.value === totalCamposRequeridos.value
})

// Métodos
const getColSize = (pregunta) => {
  // Determina el tamaño de columna basado en el tipo de pregunta
  switch (pregunta.tipo) {
    case 'textarea':
      return 'col-12'
    case 'checkbox':
      return 'col-12 col-md-6'
    case 'numerico':
      return 'col-6 col-md-3'
    default:
      return 'col-12 col-md-6'
  }
}

const cargarConfiguracionSitio = async () => {
  try {
    mostrandoProgreso.value = true
    mensajeProgreso.value = 'Cargando configuración del sitio...'
    
    // Simulación de llamada API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Aquí harías la llamada real al API
    // const response = await api.get(`/sitios/${props.sitioId}/configuracion-exploracion`)
    // configuracionSitio.value = response.data
    
    // Datos de ejemplo para demostración
    configuracionSitio.value = [
      {
        id: '1',
        nombre: 'Signos Vitales',
        descripcion: 'Mediciones básicas de signos vitales',
        icono: 'thermostat',
        color: 'red',
        orden: 1,
        activo: true,
        preguntas: [
          {
            id: '1-1',
            etiqueta: 'Temperatura (°C)',
            codigo: 'temperatura',
            tipo: 'numerico',
            requerido: true,
            minimo: 35,
            maximo: 42,
            unidad: '°C',
            paso: '0.1',
            orden: 1,
            placeholder: 'Ej: 38.5'
          },
          {
            id: '1-2',
            etiqueta: 'Frecuencia Cardíaca (lpm)',
            codigo: 'frecuencia_cardiaca',
            tipo: 'numerico',
            requerido: true,
            minimo: 40,
            maximo: 250,
            unidad: 'lpm',
            orden: 2
          },
          {
            id: '1-3',
            etiqueta: 'Peso (kg)',
            codigo: 'peso',
            tipo: 'numerico',
            requerido: false,
            minimo: 0,
            unidad: 'kg',
            paso: '0.1',
            orden: 3
          }
        ]
      },
      {
        id: '2',
        nombre: 'Sistema Respiratorio',
        descripcion: 'Evaluación del sistema respiratorio',
        icono: 'air',
        color: 'blue',
        orden: 2,
        activo: true,
        preguntas: [
          {
            id: '2-1',
            etiqueta: 'Patrón Respiratorio',
            codigo: 'patron_respiratorio',
            tipo: 'select',
            requerido: true,
            orden: 1,
            opciones: [
              { label: 'Normal', value: 'normal' },
              { label: 'Taquipnea', value: 'taquipnea' },
              { label: 'Bradipnea', value: 'bradipnea' },
              { label: 'Disnea', value: 'disnea' }
            ]
          },
          {
            id: '2-2',
            etiqueta: 'Auscultación Pulmonar',
            codigo: 'auscultacion_pulmonar',
            tipo: 'textarea',
            requerido: false,
            orden: 2,
            placeholder: 'Describa los hallazgos en la auscultación pulmonar...'
          },
          {
            id: '2-3',
            etiqueta: 'Presencia de tos',
            codigo: 'tos',
            tipo: 'checkbox',
            requerido: false,
            orden: 3
          }
        ]
      },
      {
        id: '3',
        nombre: 'Sistema Cardiovascular',
        descripcion: 'Evaluación cardiovascular',
        icono: 'favorite',
        color: 'red',
        orden: 3,
        activo: true,
        preguntas: [
          {
            id: '3-1',
            etiqueta: 'Auscultación Cardíaca',
            codigo: 'auscultacion_cardiaca',
            tipo: 'textarea',
            requerido: false,
            orden: 1,
            placeholder: 'R1 R2, soplos, arritmias...'
          },
          {
            id: '3-2',
            etiqueta: 'Color de Mucosas',
            codigo: 'mucosas',
            tipo: 'select',
            requerido: true,
            orden: 2,
            opciones: [
              { label: 'Rosadas', value: 'rosadas' },
              { label: 'Pálidas', value: 'palidas' },
              { label: 'Cianóticas', value: 'cianoticas' },
              { label: 'Ictéricas', value: 'ictericas' }
            ]
          }
        ]
      }
    ]
    
    // Inicializar los datos de exploración con los campos de la configuración
    inicializarDatosExploracion()
    
    configuracionCargada.value = true
    
  } catch (error) {
    console.error('Error al cargar configuración:', error)
    // Mostrar notificación de error
  } finally {
    mostrandoProgreso.value = false
  }
}

const inicializarDatosExploracion = () => {
  // Inicializar todos los campos según la configuración
  configuracionSitio.value.forEach(grupo => {
    if (grupo.activo) {
      grupo.preguntas.forEach(pregunta => {
        if (datosExploracion.value[pregunta.codigo] === undefined) {
          datosExploracion.value[pregunta.codigo] = 
            pregunta.tipo === 'checkbox' ? false : 
            pregunta.tipo === 'numerico' ? null : ''
        }
      })
    }
  })
}

const recargarConfiguracion = async () => {
  configuracionCargada.value = false
  await cargarConfiguracionSitio()
}

const abrirConfiguracion = () => {
  // Navegar a la página de configuración
  router.push({
    name: 'ConfiguracionExploracion',
    params: { sitioId: props.sitioId }
  })
}

const guardarDatos = async () => {
  if (!configuracionCargada.value) return
  
  try {
    // Aquí harías la llamada al API para guardar
    // await api.put(`/atenciones/${props.atencionId}/servicios/${props.servicioId}`, {
    //   datos: datosExploracion.value
    // })
    
    emit('servicio-actualizado', props.servicioId, datosExploracion.value)
  } catch (error) {
    console.error('Error al guardar datos:', error)
  }
}

const completarExploracion = async () => {
  if (!formularioValido.value) return
  
  try {
    mostrandoProgreso.value = true
    mensajeProgreso.value = 'Completando exploración física...'
    
    const datosCompletos = {
      ...datosExploracion.value,
      fechaExploracion: new Date().toISOString(),
      realizadaPor: 'Dr. Usuario Actual', // Obtener del contexto de usuario
      configuracionUsada: configuracionSitio.value.map(g => ({
        id: g.id,
        nombre: g.nombre,
        version: g.version || '1.0'
      }))
    }
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('servicio-completado', props.servicioId, datosCompletos)
    
  } catch (error) {
    console.error('Error al completar exploración:', error)
  } finally {
    mostrandoProgreso.value = false
  }
}

const eliminarServicio = () => {
  if (confirm('¿Está seguro de eliminar este servicio de exploración física?')) {
    emit('servicio-eliminado', props.servicioId)
  }
}

// Lifecycle
onMounted(async () => {
  await cargarConfiguracionSitio()
})

// Watchers
watch(datosExploracion, () => {
  if (configuracionCargada.value && !modoLectura) {
    guardarDatos()
  }
}, { deep: true })

// Watch para cambios en sitioId (si el componente se reutiliza)
watch(() => props.sitioId, async () => {
  if (props.sitioId) {
    configuracionCargada.value = false
    await cargarConfiguracionSitio()
  }
})
</script>

<style scoped>
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