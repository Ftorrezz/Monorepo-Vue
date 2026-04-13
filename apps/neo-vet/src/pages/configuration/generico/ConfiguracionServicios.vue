<template>
  <q-page padding>
    <!-- Header principal con gradiente -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="auto_awesome" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Configuración de Servicios</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticas.total }} servicio{{ estadisticas.total !== 1 ? 's' : '' }} • 
              {{ estadisticas.activos }} activo{{ estadisticas.activos !== 1 ? 's' : '' }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn 
              flat
              round
              icon="add_circle"
              @click="abrirFormulario()"
              size="md"
            >
              <q-tooltip>Agregar Servicio</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de servicios -->
    <q-table
      :rows="servicios"
      :columns="columnas"
      :loading="loading"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 12 }"
    >
      <template v-slot:body-cell-icono="props">
        <q-td :props="props">
          <q-avatar size="32px" color="primary" text-color="white" :icon="props.value || 'auto_awesome'" />
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.value === 'S'"
            @update:model-value="cambiarEstado(props.row, $event)"
            color="positive"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              icon="edit"
              color="primary"
              size="sm"
              @click="editarServicio(props.row)"
            >
              <q-tooltip>Editar definición</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="account_tree"
              color="secondary"
              size="sm"
              @click="gestionarEstructura(props.row)"
            >
              <q-tooltip>Gestionar Estructura (Secciones y Campos)</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="delete"
              color="negative"
              size="sm"
              @click="eliminarServicio(props.row)"
            >
              <q-tooltip>Eliminar servicio</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog para crear/editar servicio -->
    <q-dialog v-model="mostrarFormulario" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarServicio" ref="formulario">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="formularioServicio.nombre"
                  label="Nombre del Servicio *"
                  placeholder="Ej: Estética Canina"
                  :rules="[val => !!val || 'El nombre es requerido']"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="formularioServicio.identificador"
                  label="Identificador Único *"
                  placeholder="Ej: estetica_canina"
                  hint="Identificador interno (sin espacios)"
                  :rules="[val => !!val || 'El identificador es requerido']"
                  :readonly="modoEdicion"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="formularioServicio.descripcion"
                  label="Descripción"
                  type="textarea"
                  rows="3"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <q-select
                  v-model="formularioServicio.icono"
                  :options="iconosDisponibles"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Icono (Material Icon)"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  @filter="filtrarIconos"
                  hint="Selecciona un icono o escribe uno personalizado"
                >
                  <template v-slot:prepend>
                    <q-icon :name="formularioServicio.icono || 'help'" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.value" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12">
                <q-select
                  v-model="formularioServicio.ids_plantillas"
                  :options="plantillas"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  multiple
                  use-chips
                  stack-label
                  label="Plantillas de Documentos"
                  outlined
                  dense
                  clearable
                  hint="Selecciona una o más plantillas para generar certificados o reportes"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-select>
              </div>

              <!-- Nuevos campos de renderizado -->
              <div class="col-12">
                <q-separator class="q-my-sm" />
                <div class="text-subtitle2 q-mb-sm">Renderizado y Estética</div>
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="formularioServicio.tipo_renderizado"
                  :options="[
                    { label: 'Dinámico (EAV)', value: 'dinamico' },
                    { label: 'Especializado (Componente)', value: 'especializado' }
                  ]"
                  label="Tipo de Renderizado"
                  outlined
                  dense
                  emit-value
                  map-options
                  hint="Cómo se dibujará el formulario"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="formularioServicio.categoria"
                  :options="[
                    { label: 'Consultas', value: 'consultas' },
                    { label: 'Procedimientos', value: 'procedimientos' },
                    { label: 'Diagnóstico', value: 'diagnostico' },
                    { label: 'Otros', value: 'otros' }
                  ]"
                  label="Categoría"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="col-12" v-if="formularioServicio.tipo_renderizado === 'especializado'">
                <q-select
                  v-model="formularioServicio.componente_clave"
                  :options="componentesEspecializados"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Componente Especializado *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Requerido para servicios especializados']"
                  hint="Selecciona el componente técnico que procesará este servicio"
                >
                  <template v-slot:prepend>
                    <q-icon name="extension" color="primary" />
                  </template>
                </q-select>
              </div>

              <div class="col-12">
                <q-input
                  v-model="formularioServicio.color"
                  label="Color UI"
                  outlined
                  dense
                  placeholder="ej: primary, positive, #ff0000"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="formularioServicio.color" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:prepend>
                    <div 
                      class="q-mr-xs rounded-borders" 
                      :style="{ 
                        width: '20px', 
                        height: '20px', 
                        backgroundColor: formularioServicio.color?.startsWith('#') ? formularioServicio.color : `var(--q-${formularioServicio.color || 'primary'})` 
                      }"
                    ></div>
                  </template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn 
            color="primary" 
            label="Guardar" 
            @click="$refs.formulario.submit()"
            :loading="guardando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { servicioDinamicoService } from 'src/services/servicioDinamico.service'
import { plantillaService } from 'src/services/plantilla.service'
import { plantillaServicioService } from 'src/services/plantillaServicio.service'

const $q = useQuasar()
const router = useRouter()

// Estado
const loading = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const servicios = ref([])
const plantillas = ref([])

const formularioServicio = reactive({
  id: null,
  identificador: '',
  descripcion: '',
  nombre: '',
  icono: 'auto_awesome',
  ids_plantillas: [],
  activo: 'S',
  id_configuracion: 1,
  tipo_renderizado: 'dinamico',
  componente_clave: '',
  color: 'primary',
  categoria: 'otros'
})
const columnas = [
  { name: 'icono', label: '', field: 'icono', align: 'center', style: 'width: 50px' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'identificador', label: 'Identificador Único', field: 'identificador', align: 'left', sortable: true },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center', style: 'width: 150px' }
]

// Lista de iconos comunes para servicios
const iconosBase = [
  { label: 'Servicios Generales', value: 'auto_awesome' },
  { label: 'Veterinaria', value: 'pets' },
  { label: 'Vacunación', value: 'vaccines' },
  { label: 'Cirugía', value: 'medical_services' },
  { label: 'Consulta', value: 'stethoscope' },
  { label: 'Emergencia', value: 'emergency' },
  { label: 'Laboratorio', value: 'science' },
  { label: 'Rayos X', value: 'radiology' },
  { label: 'Peluquería', value: 'content_cut' },
  { label: 'Baño', value: 'shower' },
  { label: 'Spa', value: 'spa' },
  { label: 'Dental', value: 'dentistry' },
  { label: 'Hospitalización', value: 'local_hospital' },
  { label: 'Farmacia', value: 'medication' },
  { label: 'Nutrición', value: 'restaurant' },
  { label: 'Entrenamiento', value: 'school' },
  { label: 'Guardería', value: 'home' },
  { label: 'Adopción', value: 'favorite' },
  { label: 'Microchip', value: 'qr_code_2' },
  { label: 'Desparasitación', value: 'bug_report' },
  { label: 'Esterilización', value: 'healing' },
  { label: 'Ecografía', value: 'monitor_heart' },
  { label: 'Cardiología', value: 'cardiology' },
  { label: 'Oftalmología', value: 'visibility' },
  { label: 'Dermatología', value: 'dermatology' }
]

const componentesEspecializados = [
  { label: 'Vacunación', value: 'vacunacion' },
  { label: 'Desparasitación', value: 'desparacitacion' },
  { label: 'Laboratorio', value: 'laboratorio' },
  { label: 'Rayos X', value: 'rayosx' },
  { label: 'Ultrasonido', value: 'ultrasonido' },
  { label: 'Exploración Física', value: 'exploracion' },
  { label: 'Hospitalización', value: 'hospitalizacion' },
  { label: 'Medicamentos y Tratamientos', value: 'medicamentos' },
  { label: 'Rehabilitación / Fisioterapia', value: 'rehabilitacion' },
  { label: 'Urgencias / Emergencias', value: 'emergencia' },
  { label: 'Estética y Grooming', value: 'estetica' }
]

const iconosDisponibles = ref([...iconosBase])

const filtrarIconos = (val, update) => {
  update(() => {
    if (val === '') {
      iconosDisponibles.value = iconosBase
    } else {
      const needle = val.toLowerCase()
      iconosDisponibles.value = iconosBase.filter(
        v => v.label.toLowerCase().indexOf(needle) > -1 || 
             v.value.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

// Métodos
const cargarServicios = async () => {
  loading.value = true
  try {
    servicios.value = await servicioDinamicoService.getServicios()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar servicios' })
  } finally {
    loading.value = false
  }
}

const cargarPlantillas = async () => {
  try {
    plantillas.value = await plantillaService.getPlantillas()
  } catch (error) {
    console.error('Error al cargar plantillas:', error)
  }
}

const abrirFormulario = async (servicio = null) => {
  modoEdicion.value = !!servicio
  
  loading.value = true
  
  try {
    await cargarPlantillas()
    
    if (servicio) {
      // Intentar obtener las plantillas directamente del API para asegurar que están sincronizadas
      const plantillasActuales = await plantillaServicioService.getPorServicio(servicio.id)
      
      const ids_plantillas = (plantillasActuales.length > 0 ? plantillasActuales : (servicio.plantillas_servicio || []))
        .filter(p => !p.activo || p.activo === 'S')
        .map(p => Number(p.id_plantilla))

      // Resetear formulario con valores base
      Object.assign(formularioServicio, {
        id: null,
        identificador: '',
        descripcion: '',
        nombre: '',
        icono: 'auto_awesome',
        ids_plantillas: [],
        activo: 'S',
        id_configuracion: 1,
        tipo_renderizado: 'dinamico',
        componente_clave: '',
        color: 'primary',
        categoria: 'otros'
      })

      // Asignar datos del servicio y luego los IDs calculados
      Object.assign(formularioServicio, servicio)
      formularioServicio.ids_plantillas = ids_plantillas
    } else {
      Object.assign(formularioServicio, {
        id: null,
        identificador: '',
        descripcion: '',
        nombre: '',
        icono: 'auto_awesome',
        ids_plantillas: [],
        activo: 'S',
        id_configuracion: 1,
        tipo_renderizado: 'dinamico',
        componente_clave: '',
        color: 'primary',
        categoria: 'otros'
      })
    }
    
    mostrarFormulario.value = true
  } catch (error) {
    console.error('Error al abrir formulario:', error)
    $q.notify({ type: 'negative', message: 'Error al preparar el formulario' })
  } finally {
    loading.value = false
  }
}

const guardarServicio = async () => {
  guardando.value = true
  try {
    // Clonar para no enviar ids_plantillas ni otros campos calculados/relaciones
    const { ids_plantillas, plantillas_servicio, paridad, ...datosServicio } = formularioServicio
    // También removemos id_plantilla si existe para cumplir con el requerimiento
    delete datosServicio.id_plantilla

    let idServicio = formularioServicio.id

    if (modoEdicion.value) {
      await servicioDinamicoService.updateServicio(idServicio, datosServicio)
    } else {
      const resp = await servicioDinamicoService.createServicio(datosServicio)
      // Extraer el ID del nuevo servicio (depende de cómo responda el backend)
      idServicio = resp?.id || (Array.isArray(resp) ? resp[0]?.id : null) || resp?.elemento?.id
    }

    // Sincronizar plantillas
    if (idServicio) {
        await plantillaServicioService.syncPlantillas(idServicio, ids_plantillas)
    }
    
    $q.notify({ type: 'positive', message: 'Servicio guardado correctamente' })
    mostrarFormulario.value = false
    cargarServicios()
  } catch (error) {
    console.error('Error al guardar servicio:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar servicio' })
  } finally {
    guardando.value = false
  }
}

const editarServicio = (servicio) => {
  abrirFormulario(servicio)
}

const gestionarEstructura = (servicio) => {
  router.push({
    name: 'configuracion-estructura-servicio',
    params: { id: servicio.id }
  })
}

const cambiarEstado = async (servicio, estado) => {
  try {
    const nuevoEstado = estado ? 'S' : 'N'
    const { plantillas_servicio, paridad, ...datosServicio } = servicio
    await servicioDinamicoService.updateServicio(servicio.id, { ...datosServicio, activo: nuevoEstado })
    servicio.activo = nuevoEstado
    $q.notify({ type: 'positive', message: `Servicio ${estado ? 'activado' : 'desactivado'}` })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const eliminarServicio = (servicio) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el servicio "${servicio.nombre}"? Se perderá toda su configuración de secciones y campos.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await servicioDinamicoService.deleteServicio(servicio.id)
      $q.notify({ type: 'positive', message: 'Servicio eliminado' })
      cargarServicios()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

// Estadísticas para el header
const estadisticas = computed(() => {
  const total = servicios.value?.length || 0
  const activos = servicios.value?.filter(item => item.activo === 'S').length || 0
  return {
    total,
    activos
  }
})

onMounted(() => {
  cargarServicios()
})
</script>

<style lang="scss" scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.opacity-80 {
  opacity: 0.8;
}
</style>
