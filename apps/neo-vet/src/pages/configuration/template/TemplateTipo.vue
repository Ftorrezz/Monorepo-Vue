<template>
  <div class="template-manager q-pa-md">
    <!-- Tabs para cambiar entre tipos y plantillas -->
    <q-tabs
      v-model="activeTab"
      class="text-primary q-mb-md"
      dense
      align="left"
      :breakpoint="0"
    >
      <q-tab name="types" icon="style" label="Tipos de Plantillas" />
      <q-tab name="templates" icon="description" label="Mis Plantillas" />
    </q-tabs>

    <!-- Panel de Tipos de Plantillas -->
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="types">
        <div class="row q-col-gutter-md">
          <div v-for="type in templateTypes" :key="type.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card class="template-type-card">
              <q-card-section class="q-pb-none">
                <div class="row items-center no-wrap">
                  <q-icon :name="type.icon" :color="type.color" size="md" class="q-mr-sm"/>
                  <div class="col">
                    <div class="text-subtitle1">{{ type.name }}</div>
                    <div class="text-caption text-grey">{{ type.description }}</div>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn 
                  color="primary" 
                  label="Usar plantilla" 
                  @click="createFromType(type)"
                  flat
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- Panel de Plantillas Activas -->
      <q-tab-panel name="templates">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Mis Plantillas</div>
          <q-btn-group flat>
            <q-btn outline color="primary" icon="add" label="Nueva desde tipo" to="/templates/types" />
            <q-btn outline color="secondary" icon="filter_list">
              <q-menu>
                <q-list style="min-width: 200px">
                  <q-item>
                    <q-select
                      v-model="moduleFilter"
                      :options="availableModules"
                      label="Filtrar por módulo"
                      dense
                      options-dense
                      emit-value
                      map-options
                      style="min-width: 200px"
                    />
                  </q-item>
                  <q-item>
                    <q-toggle v-model="showInactive" label="Mostrar inactivas" />
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-btn-group>
        </div>

        <!-- Grid de plantillas existentes -->
        <div class="row q-col-gutter-md">
          <div v-for="template in filteredTemplates" :key="template.id" class="col-12 col-sm-6 col-md-3 col-lg-2">
            <q-card class="template-card">
              <q-img
                :src="getTemplateTypeIcon(template.type)"
                height="100px"
                class="template-header"
              >
                <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                  {{ template.name }}
                </div>
              </q-img>

              <q-card-actions align="center">
                <q-btn flat round color="grey" icon="preview" size="sm">
                  <q-tooltip>Vista previa</q-tooltip>
                </q-btn>
                <q-btn flat round color="primary" icon="edit" size="sm">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn 
                  flat 
                  round 
                  :color="template.active ? 'negative' : 'positive'" 
                  :icon="template.active ? 'toggle_off' : 'toggle_on'"
                  size="sm"
                >
                  <q-tooltip>{{ template.active ? 'Desactivar' : 'Activar' }}</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Diálogo para seleccionar tipo de plantilla nueva -->
    <q-dialog v-model="showNewTemplateDialog">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">Seleccionar Tipo de Plantilla</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div v-for="type in templateTypes" :key="type.id" class="col-12 col-sm-6">
              <q-card 
                class="template-type-card cursor-pointer" 
                :class="{ 'selected': selectedTemplateType === type.id }"
                @click="selectedTemplateType = type.id"
                flat
                bordered
              >
                <q-card-section class="q-pa-sm">
                  <div class="row items-center no-wrap">
                    <q-icon :name="type.icon" :color="type.color" size="md" class="q-mr-md"/>
                    <div class="col">
                      <div class="text-subtitle1">{{ type.name }}</div>
                      <div class="text-caption">{{ type.description }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn 
            color="primary" 
            label="Crear" 
            :disable="!selectedTemplateType"
            @click="createNewTemplate" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Usar el nuevo componente de formulario -->
    <template-form
      ref="templateForm"
      @save="handleTemplateSave"
      @close="handleTemplateClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import TemplateForm from '../../../components/templates/TemplateForm.vue'
import { templateService } from '@/services/templateService'

// Props
const props = defineProps({
  selectedTemplateTypeId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'template-type-selected',
  'variable-insert-requested',
  'type-settings-changed'
])

// Composables
const $q = useQuasar()

// Estado local
const showTypeSelector = ref(false)
const showTypeSettings = ref(false)
const selectedType = ref(props.selectedTemplateTypeId)
const showDialog = ref(false)
const isEditing = ref(false)

// Estado para filtros y diálogos
const moduleFilter = ref(null)
const showInactive = ref(false)
const showNewTemplateDialog = ref(false)
const selectedTemplateType = ref(null)

// Referencias
const templateForm = ref(null)

// Configuración del tipo actual
const typeSettings = reactive({
  customName: '',
  prefix: '',
  autoNumber: true,
  requireSignature: false,
  includeLogo: true,
  paperSize: 'A4',
  orientation: 'portrait'
})

// Opciones de configuración
const paperSizes = [
  { label: 'A4 (210 × 297 mm)', value: 'A4' },
  { label: 'Carta (216 × 279 mm)', value: 'Letter' },
  { label: 'Legal (216 × 356 mm)', value: 'Legal' },
  { label: 'A5 (148 × 210 mm)', value: 'A5' }
]

const orientations = [
  { label: 'Vertical (Portrait)', value: 'portrait' },
  { label: 'Horizontal (Landscape)', value: 'landscape' }
]

// Tipos de plantillas disponibles
const templates = ref([
  {
    id: '1',
    name: 'Plantilla 1',
    description: 'Descripción de la plantilla 1',
    active: true,
    modules: ['consultations', 'vaccinations'],
    variables: [],
    content: '<p>Contenido de la plantilla 1</p>',
    updatedAt: '2023-10-01'
  },
  {
    id: '2',
    name: 'Plantilla 2',
    description: 'Descripción de la plantilla 2',
    active: false,
    modules: ['surgeries', 'hospitalization'],
    variables: [],
    content: '<p>Contenido de la plantilla 2</p>',
    updatedAt: '2023-09-15'
  }
])

// Módulos disponibles en el sistema
const availableModules = [
  { label: 'Consultas', value: 'consultations', icon: 'medical_services' },
  { label: 'Vacunación', value: 'vaccinations', icon: 'vaccines' },
  { label: 'Cirugías', value: 'surgeries', icon: 'medical_services' },
  { label: 'Hospitalización', value: 'hospitalization', icon: 'local_hospital' },
  { label: 'Laboratorio', value: 'laboratory', icon: 'science' },
  { label: 'Peluquería', value: 'grooming', icon: 'content_cut' },
  { label: 'Farmacia', value: 'pharmacy', icon: 'medication' },
  { label: 'Historias Clínicas', value: 'medical_records', icon: 'folder_shared' }
]

// Variables comunes disponibles para todas las plantillas
const commonVariables = [
  { name: 'clinic.name', label: 'Nombre Clínica' },
  { name: 'clinic.address', label: 'Dirección Clínica' },
  { name: 'clinic.phone', label: 'Teléfono Clínica' },
  { name: 'clinic.logo', label: 'Logo Clínica' },
  { name: 'pet.name', label: 'Nombre Mascota' },
  { name: 'pet.species', label: 'Especie' },
  { name: 'pet.breed', label: 'Raza' },
  { name: 'owner.name', label: 'Nombre Propietario' },
  { name: 'owner.phone', label: 'Teléfono Propietario' },
  { name: 'vet.name', label: 'Nombre Veterinario' },
  { name: 'date.now', label: 'Fecha Actual' },
  { name: 'date.next', label: 'Próxima Fecha' }
]

// Computed properties
const currentTemplateType = computed(() => {
  return templateTypes.value.find(type => type.id === props.selectedTemplateTypeId)
})

const availableVariables = computed(() => {
  return currentTemplateType.value?.variables || []
})

const filteredTemplates = computed(() => {
  let filtered = [...templates.value]
  
  if (moduleFilter.value) {
    filtered = filtered.filter(t => t.modules.includes(moduleFilter.value))
  }
  
  if (!showInactive.value) {
    filtered = filtered.filter(t => t.active)
  }
  
  return filtered
})

// Nuevos métodos
const getModuleIcon = (moduleValue) => {
  const module = availableModules.find(m => m.value === moduleValue)
  return module?.icon || 'extension'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Métodos
const getVariableIcon = (type) => {
  const iconMap = {
    text: 'text_fields',
    number: 'tag',
    date: 'event',
    array: 'list',
    boolean: 'toggle_on'
  }
  return iconMap[type] || 'code'
}

const getVariableTypeLabel = (type) => {
  const labelMap = {
    text: 'Texto',
    number: 'Número',
    date: 'Fecha',
    array: 'Lista',
    boolean: 'Sí/No'
  }
  return labelMap[type] || 'Desconocido'
}

const copyVariableToClipboard = async (variableName) => {
  try {
    await navigator.clipboard.writeText(`{{${variableName}}}`)
    $q.notify({
      message: `Variable {{${variableName}}} copiada al portapapeles`,
      color: 'positive',
      icon: 'content_copy'
    })
  } catch (error) {
    $q.notify({
      message: 'Error al copiar al portapapeles',
      color: 'negative',
      icon: 'error'
    })
  }
}

const insertVariable = (variableName) => {
  emit('variable-insert-requested', variableName)
}

const selectTemplateType = () => {
  if (selectedType.value) {
    const templateType = templateTypes.value.find(type => type.id === selectedType.value)
    
    emit('template-type-selected', {
      id: selectedType.value,
      type: templateType,
      variables: templateType.variables
    })
    
    showTypeSelector.value = false
    
    $q.notify({
      message: `Tipo de plantilla "${templateType.name}" seleccionado`,
      color: 'positive',
      icon: 'check_circle'
    })
  }
}

const saveTypeSettings = () => {
  emit('type-settings-changed', {
    templateTypeId: props.selectedTemplateTypeId,
    settings: { ...typeSettings }
  })
  
  showTypeSettings.value = false
  
  $q.notify({
    message: 'Configuración guardada exitosamente',
    color: 'positive',
    icon: 'save'
  })
}

const toggleTemplateStatus = async (template) => {
  try {
    // Aquí iría la llamada a la API para actualizar el estado
    template.active = !template.active
    $q.notify({
      message: `Plantilla ${template.active ? 'activada' : 'desactivada'} correctamente`,
      color: 'positive'
    })
  } catch (error) {
    $q.notify({
      message: 'Error al cambiar el estado de la plantilla',
      color: 'negative'
    })
  }
}

const previewTemplate = (template) => {
  // Implementar vista previa
}

const showTemplateDialog = (template = null) => {
  templateForm.value.showDialog = true
}

const loadTemplates = async () => {
  try {
    templates.value = await templateService.getTemplates()
  } catch (error) {
    $q.notify({
      message: 'Error al cargar las plantillas',
      color: 'negative'
    })
  }
}

const handleTemplateSave = async (templateData) => {
  try {
    if (templateData.id) {
      await templateService.updateTemplate(templateData.id, templateData)
    } else {
      await templateService.createTemplate(templateData)
    }
    await loadTemplates()
    $q.notify({
      message: 'Plantilla guardada exitosamente',
      color: 'positive'
    })
  } catch (error) {
    $q.notify({
      message: 'Error al guardar la plantilla',
      color: 'negative'
    })
  }
}

const createNewTemplate = () => {
  const type = templateTypes.find(t => t.id === selectedTemplateType.value)
  if (type) {
    showNewTemplateDialog.value = false
    templateForm.value.open({
      type: type.id,
      name: '',
      description: '',
      modules: [],
      variables: type.variables,
      content: type.defaultContent || ''
    })
  }
}

// Cargar plantillas al montar el componente
onMounted(() => {
  loadTemplates()
})

const handleTemplateClose = () => {
  // Lógica adicional al cerrar el formulario si es necesaria
}

// Watchers
watch(() => props.selectedTemplateTypeId, (newId) => {
  selectedType.value = newId
})

// Estado para tabs
const activeTab = ref('types')

// Tipos de plantillas predefinidos
const templateTypes = [
  {
    id: 'consultation',
    name: 'Consulta General',
    description: 'Plantilla para registrar consultas médicas',
    icon: 'medical_services',
    color: 'primary',
    defaultContent: '<h2>Consulta Veterinaria</h2><p>Fecha: {{date.now}}</p>'
  },
  {
    id: 'vaccine',
    name: 'Certificado de Vacunación',
    description: 'Certificado oficial de vacunación',
    icon: 'vaccines',
    color: 'positive',
    defaultContent: '<h2>Certificado de Vacunación</h2>'
  },
  {
    id: 'surgery',
    name: 'Informe Quirúrgico',
    description: 'Informe detallado de cirugía',
    icon: 'medical_services',
    color: 'negative',
    defaultContent: '<h2>Informe Quirúrgico</h2>'
  },
  {
    id: 'prescription',
    name: 'Receta Médica',
    description: 'Prescripción de medicamentos',
    icon: 'medication',
    color: 'warning',
    defaultContent: '<h2>Receta Médica</h2>'
  }
]

// Método para crear desde tipo
const createFromType = (type) => {
  templateForm.value.open({
    type: type.id,
    name: '',
    description: '',
    modules: [],
    content: type.defaultContent,
    variables: [],
    active: true
  })
}

// Método para obtener icono de tipo
const getTemplateTypeIcon = (typeId) => {
  const type = templateTypes.find(t => t.id === typeId)
  return type?.icon || 'description'
}
</script>

<style lang="scss" scoped>
.template-manager {
  max-width: 1400px;
  margin: 0 auto;

  .template-type-card {
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  }

  .template-card {
    transition: all 0.2s ease;
    height: 180px;

    .template-header {
      background: linear-gradient(45deg, var(--q-primary) 0%, var(--q-secondary) 100%);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  }
}

// Dark theme support
.body--dark {
  .template-type-card {
    background: #1d1d1d;
  }
}
</style>