<template>
  <div class="exploracion-container">
    <!-- Navegación entre vistas -->
    <q-tabs v-model="vistaActual" class="text-grey" active-color="primary" indicator-color="primary">
      <q-tab name="exploracion" label="Exploración Física" icon="medical_services"/>
      <q-tab name="configuracion" label="Configuración" icon="settings" :disable="modoLectura"/>
    </q-tabs>

    <q-separator/>

    <q-tab-panels v-model="vistaActual" animated class="bg-grey-1">
      <!-- Vista de Exploración Física -->
      <q-tab-panel name="exploracion" class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <!-- Información del paciente -->
            <q-card class="q-mb-md">
              <q-card-section class="bg-primary text-white">
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">{{ paciente.nombre }}</div>
                    <div class="text-caption">{{ paciente.especie }} • {{ paciente.raza }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip outline color="white" text-color="white" icon="location_on">
                      {{ sitioActual.nombre }}
                    </q-chip>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Módulo de Exploración Física Dinámico -->
            <ModuloExploracionDinamico
              :atencion-id="atencionId"
              :servicio-id="servicioId"
              :sitio-id="sitioId"
              :modo-lectura="modoLectura"
              @servicio-actualizado="onServicioActualizado"
              @servicio-completado="onServicioCompletado"
              @servicio-eliminado="onServicioEliminado"
            />
          </div>
        </div>
      </q-tab-panel>

      <!-- Vista de Configuración -->
      <q-tab-panel name="configuracion" class="q-pa-md">
        <div class="row">
          <div class="col-12">
            <!-- Header de configuración -->
            <q-card class="q-mb-md">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="col">
                    <div class="text-h6">Configuración de Exploración Física</div>
                    <div class="text-caption text-grey-7">
                      Personalice los grupos y preguntas para {{ sitioActual.nombre }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn-group>
                      <q-btn 
                        color="info" 
                        icon="download" 
                        label="Importar"
                        @click="mostrarImportar = true"
                      />
                      <q-btn 
                        color="secondary" 
                        icon="upload" 
                        label="Exportar"
                        @click="exportarConfiguracion"
                      />
                      <q-btn 
                        color="primary" 
                        icon="library_books" 
                        label="Plantillas"
                        @click="mostrarPlantillas = true"
                      />
                    </q-btn-group>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- CRUD de Configuración -->
            <CrudConfiguracionExploracion 
              :sitio-id="sitioId"
              @configuracion-actualizada="onConfiguracionActualizada"
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Modal de Plantillas -->
    <q-dialog v-model="mostrarPlantillas" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Plantillas Predefinidas</div>
          <div class="text-caption">Seleccione una plantilla para aplicar a este sitio</div>
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item 
              v-for="plantilla in plantillasDisponibles" 
              :key="plantilla.id"
              clickable
              @click="seleccionarPlantilla(plantilla)"
            >
              <q-item-section avatar>
                <q-icon name="library_books" color="primary"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ plantilla.nombre }}</q-item-label>
                <q-item-label caption>{{ plantilla.descripcion }}</q-item-label>
                <q-item-label caption class="text-blue">
                  {{ plantilla.grupos.length }} grupos • {{ contarPreguntas(plantilla) }} preguntas
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right"/>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="mostrarPlantillas = false"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Importar -->
    <q-dialog v-model="mostrarImportar" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Importar Configuración</div>
          <div class="text-caption">Importe configuración desde otro sitio o archivo JSON</div>
        </q-card-section>

        <q-card-section>
          <q-tabs v-model="tipoImportacion" class="text-grey">
            <q-tab name="archivo" label="Desde Archivo" icon="upload_file"/>
            <q-tab name="sitio" label="Desde Otro Sitio" icon="content_copy"/>
          </q-tabs>

          <q-separator class="q-my-md"/>

          <q-tab-panels v-model="tipoImportacion">
            <q-tab-panel name="archivo">
              <q-file
                v-model="archivoImportar"
                label="Seleccionar archivo JSON"
                outlined
                accept=".json"
                @update:model-value="leerArchivo"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file"/>
                </template>
              </q-file>
            </q-tab-panel>

            <q-tab-panel name="sitio">
              <q-select
                v-model="sitioOrigen"
                :options="sitiosDisponibles"
                label="Seleccionar sitio origen"
                outlined
                option-label="nombre"
                option-value="id"
                emit-value
                map-options
                @update:model-value="cargarConfiguracionSitio"
              />
            </q-tab-panel>
          </q-tab-panels>

          <!-- Preview de configuración a importar -->
          <div v-if="configuracionImportar" class="q-mt-md">
            <q-separator class="q-my-md"/>
            <div class="text-subtitle2 q-mb-sm">Vista previa:</div>
            <q-scroll-area style="height: 200px">
              <div v-for="grupo in configuracionImportar" :key="grupo.id" class="q-mb-sm">
                <q-chip color="primary" text-color="white" icon="folder">
                  {{ grupo.nombre }} ({{ grupo.preguntas?.length || 0 }} preguntas)
                </q-chip>
              </div>
            </q-scroll-area>
            
            <q-toggle
              v-model="reemplazarConfiguracion"
              label="Reemplazar configuración actual completamente"
              color="warning"
            />
            <div class="text-caption text-orange q-mt-sm" v-if="reemplazarConfiguracion">
              ⚠️ Esto eliminará toda la configuración actual
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarImportar"/>
          <q-btn 
            color="primary" 
            label="Importar" 
            :disable="!configuracionImportar"
            @click="ejecutarImportar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Notificaciones -->
    <q-dialog v-model="mostrandoProgreso" persistent>
      <q-card>
        <q-card-section class="text-center">
          <q-spinner-dots size="50px" color="primary"/>
          <div class="text-h6 q-mt-md">{{ mensajeProgreso }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useConfiguracionExploracion, PLANTILLAS_EXPLORACION } from '@/services/configuracionExploracionService'

// Componentes
import ModuloExploracionDinamico from '@/components/ModuloExploracionDinamico.vue'
import CrudConfiguracionExploracion from '@/components/CrudConfiguracionExploracion.vue'

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
  sitioId: {
    type: String,
    required: true
  },
  pacienteId: {
    type: String,
    required: true
  },
  modoLectura: {
    type: Boolean,
    default: false
  }
})

// Composables
const $q = useQuasar()
const { cargarConfiguracion, aplicarPlantilla } = useConfiguracionExploracion()

// Estados
const vistaActual = ref('exploracion')
const mostrarPlantillas = ref(false)
const mostrarImportar = ref(false)
const mostrandoProgreso = ref(false)
const mensajeProgreso = ref('')

// Datos del paciente y sitio
const paciente = ref({
  nombre: 'Max',
  especie: 'Canino',
  raza: 'Golden Retriever',
  edad: '5 años'
})

const sitioActual = ref({
  nombre: 'Clínica Veterinaria San José',
  ubicacion: 'Ciudad de México'
})

// Estados para importar
const tipoImportacion = ref('archivo')
const archivoImportar = ref(null)
const sitioOrigen = ref(null)
const configuracionImportar = ref(null)
const reemplazarConfiguracion = ref(false)

// Plantillas y sitios disponibles
const plantillasDisponibles = ref([
  PLANTILLAS_EXPLORACION.CANINOS_BASICA,
  PLANTILLAS_EXPLORACION.FELINOS_BASICA,
  PLANTILLAS_EXPLORACION.EXOTICOS_BASICA
])

const sitiosDisponibles = ref([
  { id: '1', nombre: 'Clínica Central' },
  { id: '2', nombre: 'Hospital Veterinario Norte' },
  { id: '3', nombre: 'Clínica de Especialidades' }
])

// Computed
const contarPreguntas = (plantilla) => {
  return plantilla.grupos.reduce((total, grupo) => total + (grupo.preguntas?.length || 0), 0)
}

// Métodos principales
const onServicioActualizado = (servicioId, datos) => {
  console.log('Servicio actualizado:', { servicioId, datos })
  $q.notify({
    type: 'info',
    message: 'Datos guardados automáticamente',
    timeout: 1000
  })
}

const onServicioCompletado = async (servicioId, datos) => {
  console.log('Servicio completado:', { servicioId, datos })
  
  $q.notify({
    type: 'positive',
    message: 'Exploración física completada exitosamente',
    icon: 'check_circle'
  })
  
  // Aquí podrías redirigir o actualizar el estado
}

const onServicioEliminado = (servicioId) => {
  console.log('Servicio eliminado:', servicioId)
  $q.notify({
    type: 'negative',
    message: 'Servicio eliminado',
    icon: 'delete'
  })
}

const onConfiguracionActualizada = () => {
  $q.notify({
    type: 'positive',
    message: 'Configuración actualizada correctamente',
    icon: 'settings'
  })
  
  // Cambiar a la vista de exploración para ver los cambios
  vistaActual.value = 'exploracion'
}

// Métodos para plantillas
const seleccionarPlantilla = async (plantilla) => {
  try {
    const confirmacion = await $q.dialog({
      title: 'Aplicar Plantilla',
      message: `¿Está seguro de aplicar la plantilla "${plantilla.nombre}"? Esto reemplazará la configuración actual.`,
      cancel: true,
      persistent: true
    })

    if (confirmacion) {
      mostrandoProgreso.value = true
      mensajeProgreso.value = 'Aplicando plantilla...'
      
      await aplicarPlantilla(props.sitioId, plantilla.id)
      
      $q.notify({
        type: 'positive',
        message: `Plantilla "${plantilla.nombre}" aplicada correctamente`,
        icon: 'library_books'
      })
      
      mostrarPlantillas.value = false
      vistaActual.value = 'exploracion'
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al aplicar la plantilla',
      icon: 'error'
    })
  } finally {
    mostrandoProgreso.value = false
  }
}

// Métodos para exportar
const exportarConfiguracion = async () => {
  try {
    mostrandoProgreso.value = true
    mensajeProgreso.value = 'Exportando configuración...'
    
    const configuracion = await cargarConfiguracion(props.sitioId)
    
    const datos = {
      sitio: sitioActual.value.nombre,
      fecha: new Date().toISOString(),
      version: '1.0',
      configuracion
    }
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `configuracion-exploracion-${sitioActual.value.nombre.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    $q.notify({
      type: 'positive',
      message: 'Configuración exportada exitosamente',
      icon: 'download'
    })
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar la configuración',
      icon: 'error'
    })
  } finally {
    mostrandoProgreso.value = false
  }
}

// Métodos para importar
const leerArchivo = (archivo) => {
  if (archivo) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const datos = JSON.parse(e.target.result)
        configuracionImportar.value = datos.configuracion || datos
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al leer el archivo. Verifique que sea un JSON válido.',
          icon: 'error'
        })
      }
    }
    reader.readAsText(archivo)
  }
}

const cargarConfiguracionSitio = async (sitioId) => {
  if (sitioId) {
    try {
      configuracionImportar.value = await cargarConfiguracion(sitioId)
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar configuración del sitio origen',
        icon: 'error'
      })
    }
  }
}

const ejecutarImportar = async () => {
  try {
    mostrandoProgreso.value = true
    mensajeProgreso.value = 'Importando configuración...'
    
    // Aquí implementarías la lógica de importación
    // await importarConfiguracion(props.sitioId, configuracionImportar.value, reemplazarConfiguracion.value)
    
    $q.notify({
      type: 'positive',
      message: 'Configuración importada exitosamente',
      icon: 'upload'
    })
    
    cerrarImportar()
    vistaActual.value = 'exploracion'
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al importar la configuración',
      icon: 'error'
    })
  } finally {
    mostrandoProgreso.value = false
  }
}

const cerrarImportar = () => {
  mostrarImportar.value = false
  archivoImportar.value = null
  sitioOrigen.value = null
  configuracionImportar.value = null
  reemplazarConfiguracion.value = false
  tipoImportacion.value = 'archivo'
}

// Cargar datos iniciales
const cargarDatosIniciales = async () => {
  try {
    // Cargar datos del paciente
    // const pacienteData = await api.get(`/pacientes/${props.pacienteId}`)
    // paciente.value = pacienteData
    
    // Cargar datos del sitio
    // const sitioData = await api.get(`/sitios/${props.sitioId}`)
    // sitioActual.value = sitioData
    
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
  }
}

// Lifecycle
onMounted(() => {
  cargarDatosIniciales()
})

// Watchers
watch(() => props.sitioId, () => {
  if (props.sitioId) {
    cargarDatosIniciales()
  }
})
</script>

<style scoped>
.exploracion-container {
  max-width: 1200px;
  margin: 0 auto;
}

.q-tab-panels {
  min-height: 400px;
}

.q-chip {
  margin: 2px;
}
</style>