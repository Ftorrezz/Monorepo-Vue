<template>
  <q-card class="servicio-dinamico-card shadow-1 animate__animated animate__fadeIn">
    <!-- Header del Servicio -->
    <q-card-section class="bg-primary text-white q-pa-md">
      <div class="row items-center no-wrap">
        <q-avatar size="48px" font-size="28px" :icon="schema.icono || 'auto_awesome'" color="white" text-color="primary" />
        <div class="col q-ml-md">
          <div class="text-h6 leading-tight">{{ schema.servicio }}</div>
          <div class="text-caption opacity-80" v-if="schema.descripcion">{{ schema.descripcion }}</div>
        </div>
        <q-btn 
          v-if="schema.id_plantilla || schema.id_plantilla_asociada"
          flat 
          round 
          dense 
          icon="print" 
          color="white" 
          class="q-mr-sm"
          @click="imprimirDocumento"
          :loading="cargandoPlantilla"
        >
          <q-tooltip>Imprimir Documento</q-tooltip>
        </q-btn>
        <q-btn-dropdown flat round dense icon="more_vert" color="white">
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup @click="emit('servicio-eliminado', props.servicioId)">
              <q-item-section avatar>
                <q-icon name="delete" color="negative" size="sm" />
              </q-item-section>
              <q-item-section>Eliminar Servicio</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>

    <!-- Cuerpo del Formulario Dinámico -->
    <q-card-section class="q-pa-lg">
      <div v-for="(seccion, sIdx) in schema.secciones" :key="sIdx" class="q-mb-xl">
        <div class="row items-center q-mb-md">
          <div class="text-subtitle1 text-weight-bold text-primary">{{ seccion.titulo }}</div>
          <q-separator class="col q-ml-md" />
        </div>

        <div class="row q-col-gutter-lg">
          <div 
            v-for="campo in ordenarCampos(seccion.campos)" 
            :key="campo.id" 
            :class="getColClass(campo)"
          >
            <!-- Renderizado dinámico de campos -->
            
            <!-- Texto (Standard & Textarea) -->
            <q-input
              v-if="['texto', 'text', 'textarea'].includes(campo.tipo)"
              v-model="formData[campo.id]"
              :label="campo.label"
              :placeholder="campo.placeholder"
              :hint="campo.hint"
              :type="campo.tipo === 'textarea' ? 'textarea' : 'text'"
              :rows="campo.tipo === 'textarea' ? 3 : 1"
              :rules="campo.requerido ? [val => !!val || 'Este campo es obligatorio'] : []"
              :readonly="modoLectura"
              outlined
              dense
              bg-color="grey-1"
            >
              <template v-if="campo.icono" v-slot:prepend>
                <q-icon :name="campo.icono" />
              </template>
            </q-input>

            <!-- Numérico -->
            <q-input
              v-else-if="campo.tipo === 'numerico' || campo.tipo === 'number'"
              v-model.number="formData[campo.id]"
              :label="campo.label"
              :placeholder="campo.placeholder"
              :hint="campo.hint"
              type="number"
              :suffix="campo.unit || campo.unidad"
              :rules="campo.requerido ? [val => val !== null && val !== '' || 'Este campo es obligatorio'] : []"
              :readonly="modoLectura"
              outlined
              dense
              bg-color="grey-1"
            >
              <template v-if="campo.icono" v-slot:prepend>
                <q-icon :name="campo.icono" />
              </template>
            </q-input>

            <!-- Selección (Select) -->
            <q-select
              v-else-if="campo.tipo === 'select'"
              v-model="formData[campo.id]"
              :options="getOptions(campo)"
              :label="campo.label"
              :hint="campo.hint"
              :rules="campo.requerido ? [val => !!val || 'Este campo es obligatorio'] : []"
              :readonly="modoLectura"
              outlined
              dense
              bg-color="grey-1"
              emit-value
              map-options
              :loading="isSourceLoading(campo)"
            >
              <template v-if="campo.icono" v-slot:prepend>
                <q-icon :name="campo.icono" />
              </template>
            </q-select>

            <!-- Checkbox -->
            <div v-else-if="campo.tipo === 'checkbox'" class="q-py-sm">
              <q-checkbox 
                v-model="formData[campo.id]" 
                :label="campo.label" 
                :disable="modoLectura"
                color="primary"
              />
              <div v-if="campo.hint" class="text-caption text-grey-6 q-ml-md">{{ campo.hint }}</div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Footer de Acciones -->
    <q-card-section v-if="!modoLectura" class="bg-grey-1 border-top q-pa-md text-right">
      <q-btn 
        color="positive" 
        icon="check_circle" 
        label="Completar Servicio" 
        :loading="guardando"
        @click="completarServicio"
        unelevated
        class="rounded-borders"
      />
    </q-card-section>

    <!-- Banner Informativo si es modo lectura -->
    <q-banner v-if="modoLectura" class="bg-info text-white">
      <template v-slot:avatar>
        <q-icon name="lock" />
      </template>
      Este servicio ha sido completado y se encuentra en modo lectura.
    </q-banner>
  </q-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { usePlantillas } from 'src/composables/usePlantillas'
import { useQuasar } from 'quasar'

const props = defineProps({
  schema: {
    type: Object,
    required: true
  },
  servicioId: {
    type: String,
    required: true
  },
  atencionId: {
    type: String,
    required: true
  },
  datosIniciales: {
    type: Object,
    default: () => ({})
  },
  modoLectura: {
    type: Boolean,
    default: false
  },
  catalogos: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado'])

const formData = reactive({})
const guardando = ref(false)
const cargandoPlantilla = ref(false)

const $q = useQuasar()
const { cargarPlantillaPorId, procesarHtml, generarPDF } = usePlantillas()

// Inicializar el formulario con valores del esquema o datos existentes
const initForm = () => {
  props.schema.secciones.forEach(seccion => {
    seccion.campos.forEach(campo => {
      // Prioridad: 1. Datos previos, 2. Valor default del esquema, 3. Valor vacío según tipo
      if (props.datosIniciales[campo.id] !== undefined) {
        formData[campo.id] = props.datosIniciales[campo.id]
      } else if (campo.default !== undefined) {
        formData[campo.id] = campo.default
      } else {
        formData[campo.id] = campo.tipo === 'checkbox' ? false : null
      }
    })
  })
}

const getColClass = (campo) => {
  // Si tiene 'cols' definido, lo usamos. Si no, usamos defaults
  if (campo.cols) return `col-12 col-md-${campo.cols}`
  
  if (campo.tipo === 'textarea') return 'col-12'
  if (campo.tipo === 'checkbox') return 'col-12 col-md-4'
  return 'col-12 col-md-6'
}

const getOptions = (campo) => {
  // 1. Si tiene datasource, buscar en el prop de catálogos
  if (campo.datasource) {
    return props.catalogos[campo.datasource] || []
  }
  // 2. Si tiene opciones fijas en el metadata
  return campo.opciones || []
}

const isSourceLoading = (campo) => {
  if (!campo.datasource) return false
  // Si el catálogo existe pero está vacío o no está definido aún
  return !props.catalogos[campo.datasource]
}

const ordenarCampos = (campos) => {
  return [...campos].sort((a, b) => (a.orden || 0) - (b.orden || 0))
}

const completarServicio = async () => {
  guardando.value = true
  // Simular guardado
  await new Promise(resolve => setTimeout(resolve, 800))
  emit('servicio-completado', props.servicioId, { ...formData })
  guardando.value = false
}

const imprimirDocumento = async () => {
  const idPlantilla = props.schema.id_plantilla || props.schema.id_plantilla_asociada
  if (!idPlantilla) return

  cargandoPlantilla.value = true
  try {
    const plantilla = await cargarPlantillaPorId(idPlantilla)
    if (!plantilla) {
      $q.notify({ type: 'negative', message: 'No se pudo cargar la plantilla' })
      return
    }

    // Preparar datos para las variables
    // En un escenario real, aquí mezclaríamos datos del paciente, propietario y los campos del servicio
    const datosVariables = {
      ...formData,
      fecha_atencion: new Date().toLocaleDateString(),
      // Estos datos deberían venir del padre idealmente o de un store
      paciente_nombre: 'Mascota', 
      propietario_nombre: 'Propietario'
    }

    const htmlProcesado = procesarHtml(plantilla.contenido_html, datosVariables)
    
    await generarPDF(htmlProcesado, {
      filename: `${props.schema.servicio || 'Servicio'}_${Date.now()}.pdf`,
      paperSize: plantilla.tamano_paper || 'A4',
      orientation: plantilla.orientacion || 'portrait'
    })

    $q.notify({ type: 'positive', message: 'Documento generado correctamente' })
  } catch (error) {
    console.error('Error al generar PDF:', error)
    $q.notify({ type: 'negative', message: 'Error al generar el documento' })
  } finally {
    cargandoPlantilla.value = false
  }
}

// Watch para auto-guardar cambios (actualizar estado en padre)
watch(formData, (newVal) => {
  if (!props.modoLectura) {
    emit('servicio-actualizado', props.servicioId, { ...newVal })
  }
}, { deep: true })

// Watch para cambios en el esquema (por si se carga asíncronamente)
watch(() => props.schema, () => {
  initForm()
}, { deep: true })

onMounted(() => {
  initForm()
})
</script>

<style scoped>
.servicio-dinamico-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

.leading-tight {
  line-height: 1.2;
}

.opacity-80 {
  opacity: 0.8;
}
</style>
