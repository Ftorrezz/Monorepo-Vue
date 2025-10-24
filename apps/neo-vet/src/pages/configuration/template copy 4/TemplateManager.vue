<template>
  <q-page class="template-manager">
    <!-- Header mejorado con gradiente -->
    <div class="manager-header">
      <div class="header-content">
        <div class="title-section">
          <div class="icon-wrapper">
            <q-icon name="description" size="lg" class="header-icon" />
          </div>
          <div class="title-content">
            <h1 class="page-title">Editor de Plantillas</h1>
            <!--<p class="page-subtitle">Sistema integral de documentos clínicos</p>-->
          </div>
          <q-chip
            :color="hasUnsavedChanges ? 'orange-6' : 'green-6'"
            text-color="white"
            size="md"
            :icon="hasUnsavedChanges ? 'edit' : 'check_circle'"
            class="status-chip"
          >
            {{ hasUnsavedChanges ? 'Cambios pendientes' : 'Todo guardado' }}
          </q-chip>
        </div>

        <div class="header-actions">
          <q-btn-group class="action-group">
            <q-btn
              color="primary"
              icon="save"
              label="Guardar"
              @click="saveTemplate"
              :loading="saving"
              :disable="!hasUnsavedChanges"
              unelevated
              class="save-btn"
            />
            <q-btn
              color="secondary"
              icon="preview"
              label="Vista Previa"
              @click="togglePreview"
              :outline="!showPreview"
              unelevated
            />
            <q-btn
              color="accent"
              icon="settings"
              label="Configurar"
              @click="showSettings = true"
              unelevated
            />
          </q-btn-group>
        </div>
      </div>
    </div>

    <!-- Selector de tipo de plantilla mejorado -->
    <div class="template-type-section" v-if="!selectedTemplateType">
      <div class="type-selector-container">
        <div class="selector-header">
          <q-icon name="category" size="xl" class="text-primary" />
          <div class="selector-title">
            <h2>Selecciona el tipo de documento</h2>
            <p>Elige la plantilla que mejor se adapte a tus necesidades</p>
          </div>
        </div>

        <div class="template-types-showcase">
          <div
            v-for="templateType in templateTypes"
            :key="templateType.id"
            class="template-type-card"
            @click="selectTemplateType(templateType)"
          >
            <div class="card-header">
              <q-avatar
                :icon="templateType.icon"
                :color="templateType.color"
                text-color="white"
                size="xl"
                class="type-avatar"
              />
              <div class="urgency-indicator" v-if="templateType.urgent">
                <q-chip
                  icon="priority_high"
                  label="Urgente"
                  color="red-6"
                  text-color="white"
                  size="sm"
                />
              </div>
            </div>

            <div class="card-content">
              <h3 class="type-title">{{ templateType.name }}</h3>
              <p class="type-description">{{ templateType.description }}</p>

              <div class="type-features">
                <q-chip
                  v-for="feature in templateType.features.slice(0, 3)"
                  :key="feature"
                  :label="feature"
                  size="sm"
                  color="grey-2"
                  text-color="grey-8"
                  class="feature-chip"
                />
                <q-chip
                  v-if="templateType.features.length > 3"
                  :label="`+${templateType.features.length - 3} más`"
                  size="sm"
                  color="grey-4"
                  text-color="grey-8"
                />
              </div>
            </div>

            <div class="card-footer">
              <div class="type-stats">
                <div class="stat">
                  <q-icon name="code" size="sm" />
                  <span>{{ templateType.variables?.length || 0 }} variables</span>
                </div>
                <div class="stat">
                  <q-icon name="schedule" size="sm" />
                  <span>{{ templateType.estimatedTime || '5 min' }}</span>
                </div>
              </div>

              <!--<q-btn
                color="primary"
                label="Seleccionar"
                icon="arrow_forward"
                unelevated
                class="select-btn"
              />-->
            </div>

            <!-- Overlay de hover -->
            <div class="card-overlay">
              <q-icon name="touch_app" size="lg" />
              <span>Click para seleccionar</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout principal con tipo seleccionado -->
    <div class="manager-content" v-else>
      <!-- Breadcrumb del tipo seleccionado -->
      <div class="selected-type-header">
        <div class="breadcrumb-section">
          <q-breadcrumbs>
            <q-breadcrumbs-el
              label="Templates"
              icon="home"
              @click="resetTemplateType"
              class="clickable"
            />
            <q-breadcrumbs-el
              :label="selectedTemplateType.name"
              :icon="selectedTemplateType.icon"
            />
          </q-breadcrumbs>

          <q-btn
            flat
            dense
            icon="swap_horiz"
            label="Cambiar tipo"
            @click="resetTemplateType"
            size="sm"
            class="change-type-btn"
          />
        </div>

        <div class="type-info-compact">
          <q-avatar
            :icon="selectedTemplateType.icon"
            :color="selectedTemplateType.color"
            text-color="white"
            size="md"
          />
          <div class="type-details">
            <span class="type-name">{{ selectedTemplateType.name }}</span>
            <span class="variable-count">{{ availableVariables.length }} variables disponibles</span>
          </div>
        </div>
      </div>

      <!-- Splitter principal -->
      <q-splitter
        v-model="leftSplitter"
        :limits="[20, 40]"
        separator-class="splitter-separator"
        class="main-splitter"
      >
        <template v-slot:before>
          <ModernVariablesSidebar
            :variables="templateVariables"
            :available-variables="availableVariables"
            :template-type="selectedTemplateType"
            :loading="loading"
            @variable-updated="handleVariableUpdate"
            @variable-added="handleVariableAdd"
            @variable-deleted="handleVariableDelete"
            @variables-imported="handleVariablesImport"
            @variable-insert-requested="handleVariableInsert"
          />
        </template>

        <template v-slot:after>
          <q-splitter
            v-model="rightSplitter"
            horizontal
            :limits="[30, 100]"
            separator-class="splitter-separator"
            class="content-splitter"
          >
            <template v-slot:before>
              <ModernTemplateEditor
                v-model="templateContent"
                :variables="templateVariables"
                :template-type="selectedTemplateType"
                :loading="loading"
                :show-minimap="editorSettings.showMinimap"
                :theme="editorSettings.theme"
                :font-size="editorSettings.fontSize"
                @content-changed="handleContentChange"
                @cursor-changed="handleCursorChange"
                @validation-error="handleValidationError"
              />
            </template>

            <template v-slot:after v-if="showPreview">
              <ModernTemplatePreview
                :content="templateContent"
                :variables="templateVariables"
                :template-type="selectedTemplateType"
                :loading="processing"
                @export-requested="handleExport"
                @print-requested="handlePrint"
              />
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </div>

    <!-- Dialog de configuraciones mejorado -->
    <q-dialog v-model="showSettings" persistent class="settings-dialog">
      <q-card class="settings-card">
        <q-card-section class="settings-header">
          <div class="header-icon-wrapper">
            <q-icon name="settings" size="lg" class="text-primary" />
          </div>
          <div class="header-content">
            <h3>Configuración del Editor</h3>
            <p>Personaliza tu experiencia de edición</p>
          </div>
          <q-btn icon="close" flat round dense @click="showSettings = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="settings-content">
          <div class="settings-tabs">
            <q-tabs v-model="settingsTab" class="text-grey-6" active-color="primary" indicator-color="primary">
              <q-tab name="editor" icon="edit" label="Editor" />
              <q-tab name="template" icon="description" label="Plantilla" />
              <q-tab name="export" icon="download" label="Exportación" />
            </q-tabs>

            <q-tab-panels v-model="settingsTab" class="settings-panels">
              <q-tab-panel name="editor" class="settings-panel">
                <div class="settings-grid">
                  <q-select
                    v-model="editorSettings.theme"
                    :options="themeOptions"
                    label="Tema del Editor"
                    emit-value
                    map-options
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon name="palette" />
                    </template>
                  </q-select>

                  <q-slider
                    v-model="editorSettings.fontSize"
                    :min="12"
                    :max="24"
                    :step="1"
                    label
                    label-always
                    color="primary"
                  >
                    <template v-slot:prepend>
                      <q-icon name="text_fields" />
                    </template>
                    <template v-slot:append>
                      <span class="slider-value">{{ editorSettings.fontSize }}px</span>
                    </template>
                  </q-slider>

                  <q-toggle
                    v-model="editorSettings.showMinimap"
                    label="Mostrar Minimapa"
                    color="primary"
                  />

                  <q-toggle
                    v-model="editorSettings.autoSave"
                    label="Guardado Automático"
                    color="primary"
                  />

                  <q-toggle
                    v-model="editorSettings.wordWrap"
                    label="Ajuste de línea automático"
                    color="primary"
                  />
                </div>
              </q-tab-panel>

              <q-tab-panel name="template" class="settings-panel">
                <div class="settings-grid">
                  <q-input
                    v-model="templateSettings.customName"
                    label="Nombre personalizado del documento"
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="templateSettings.prefix"
                    label="Prefijo para numeración"
                    outlined
                    :placeholder="selectedTemplateType?.defaultPrefix || 'DOC'"
                  >
                    <template v-slot:prepend>
                      <q-icon name="tag" />
                    </template>
                  </q-input>

                  <q-toggle
                    v-model="templateSettings.autoNumber"
                    label="Numeración automática"
                    color="primary"
                  />

                  <q-toggle
                    v-model="templateSettings.includeLogo"
                    label="Incluir logo de la clínica"
                    color="primary"
                  />
                </div>
              </q-tab-panel>

              <q-tab-panel name="export" class="settings-panel">
                <div class="settings-grid">
                  <q-select
                    v-model="exportSettings.paperSize"
                    :options="paperSizes"
                    label="Tamaño de papel"
                    outlined
                    emit-value
                    map-options
                  >
                    <template v-slot:prepend>
                      <q-icon name="article" />
                    </template>
                  </q-select>

                  <q-select
                    v-model="exportSettings.orientation"
                    :options="orientations"
                    label="Orientación"
                    outlined
                    emit-value
                    map-options
                  >
                    <template v-slot:prepend>
                      <q-icon name="rotate_90_degrees_ccw" />
                    </template>
                  </q-select>

                  <q-toggle
                    v-model="exportSettings.includeWatermark"
                    label="Incluir marca de agua"
                    color="primary"
                  />

                  <q-toggle
                    v-model="exportSettings.compressPdf"
                    label="Comprimir PDF"
                    color="primary"
                  />
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="settings-actions">
          <q-btn label="Cancelar" flat @click="showSettings = false" />
          <q-btn label="Restablecer" color="secondary" outline @click="resetSettings" />
          <q-btn label="Aplicar" color="primary" unelevated @click="applySettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Notificaciones flotantes mejoradas -->
    <div class="floating-notifications">
      <q-slide-transition>
        <q-card
          v-if="validationErrors.length > 0"
          class="notification-card error-notification"
        >
          <q-card-section class="notification-content">
            <q-icon name="error" size="md" color="negative" />
            <div class="notification-text">
              <strong>{{ validationErrors.length }} error(es) encontrado(s)</strong>
              <p>Revisa el contenido del template</p>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="validationErrors = []"
            />
          </q-card-section>
        </q-card>
      </q-slide-transition>

      <q-slide-transition>
        <q-card
          v-if="cursorInfo"
          class="notification-card cursor-notification"
        >
          <q-card-section class="notification-content compact">
            <q-icon name="my_location" size="sm" color="info" />
            <span>Línea {{ cursorInfo.line }}, Columna {{ cursorInfo.column }}</span>
          </q-card-section>
        </q-card>
      </q-slide-transition>
    </div>

    <!-- Loading overlay -->
    <q-dialog v-model="loading" persistent>
      <q-card class="loading-card">
        <q-card-section class="loading-content">
          <q-spinner-dots size="xl" color="primary" />
          <h6>Procesando template...</h6>
          <p>Por favor espera mientras se procesa tu documento</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import ModernVariablesSidebar from './ModernVariablesSidebar.vue'
import ModernTemplateEditor from './ModernTemplateEditor.vue'
import ModernTemplatePreview from './ModernTemplatePreview.vue'
import { useTemplateManager } from './useTemplateManager'

// Composables
const $q = useQuasar()
const {
  templateContent,
  templateVariables,
  loading,
  saving,
  processing,
  saveTemplate,
  loadTemplate,
  exportTemplate
} = useTemplateManager()

// Estado local del manager
const showPreview = ref(true)
const showSettings = ref(false)
const hasUnsavedChanges = ref(false)
const validationErrors = ref([])
const cursorInfo = ref(null)
const selectedTemplateType = ref(null)
const settingsTab = ref('editor')

// Configuración de splitters
const leftSplitter = ref(25)
const rightSplitter = ref(60)

// Configuración del editor
const editorSettings = reactive({
  theme: 'vs-dark',
  fontSize: 14,
  showMinimap: true,
  autoSave: false,
  wordWrap: true
})

// Configuración de template
const templateSettings = reactive({
  customName: '',
  prefix: '',
  autoNumber: true,
  includeLogo: true
})

// Configuración de exportación
const exportSettings = reactive({
  paperSize: 'A4',
  orientation: 'portrait',
  includeWatermark: false,
  compressPdf: true
})

// Tipos de plantillas disponibles
const templateTypes = ref([
  {
    id: 'vaccination_certificate',
    name: 'Certificado de Vacunación',
    description: 'Documento oficial que certifica las vacunas aplicadas a la mascota',
    icon: 'vaccines',
    color: 'green-6',
    urgent: false,
    features: ['Historial de vacunas', 'Fechas de aplicación', 'Próximas dosis', 'Validación oficial'],
    defaultPrefix: 'CV',
    estimatedTime: '3 min',
    variables: [
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true, description: 'Nombre completo de la mascota' },
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true, description: 'Nombre completo del dueño' },
      { name: 'petSpecies', label: 'Especie', type: 'text', required: true, description: 'Perro, Gato, etc.' },
      { name: 'petBreed', label: 'Raza', type: 'text', required: false, description: 'Raza de la mascota' },
      { name: 'vaccineList', label: 'Lista de vacunas', type: 'array', required: true, description: 'Vacunas aplicadas con fechas' },
      { name: 'veterinarianName', label: 'Veterinario', type: 'text', required: true, description: 'Nombre del veterinario certificante' },
      { name: 'clinicName', label: 'Clínica', type: 'text', required: true, description: 'Nombre de la clínica veterinaria' },
      { name: 'issueDate', label: 'Fecha de emisión', type: 'date', required: true, description: 'Fecha de emisión del certificado' },
      { name: 'certificateNumber', label: 'Número de certificado', type: 'text', required: true, description: 'Número único del certificado' }
    ]
  },
  {
    id: 'deworming_certificate',
    name: 'Certificado de Desparasitación',
    description: 'Documento que certifica los tratamientos antiparasitarios aplicados',
    icon: 'pest_control',
    color: 'orange-6',
    urgent: false,
    features: ['Historial de tratamientos', 'Medicamentos utilizados', 'Dosis aplicadas', 'Próximos tratamientos'],
    defaultPrefix: 'CD',
    estimatedTime: '3 min',
    variables: [
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true },
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true },
      { name: 'petWeight', label: 'Peso', type: 'number', required: true },
      { name: 'medication', label: 'Medicamento utilizado', type: 'text', required: true },
      { name: 'treatmentDate', label: 'Fecha de tratamiento', type: 'date', required: true }
    ]
  },
  {
    id: 'surgery_consent',
    name: 'Consentimiento de Cirugía',
    description: 'Documento de autorización para procedimientos quirúrgicos',
    icon: 'medical_services',
    color: 'red-6',
    urgent: true,
    features: ['Autorización quirúrgica', 'Riesgos informados', 'Términos legales', 'Firmas digitales'],
    defaultPrefix: 'CQ',
    estimatedTime: '7 min',
    variables: [
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true },
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true },
      { name: 'surgeryType', label: 'Tipo de cirugía', type: 'text', required: true },
      { name: 'surgeryDate', label: 'Fecha de cirugía', type: 'date', required: true },
      { name: 'risks', label: 'Riesgos informados', type: 'text', required: true }
    ]
  },
  {
    id: 'health_certificate',
    name: 'Certificado de Salud',
    description: 'Certificado médico general del estado de salud de la mascota',
    icon: 'health_and_safety',
    color: 'teal-6',
    urgent: false,
    features: ['Examen físico', 'Estado general', 'Recomendaciones', 'Validez temporal'],
    defaultPrefix: 'CS',
    estimatedTime: '4 min',
    variables: [
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true },
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true },
      { name: 'healthStatus', label: 'Estado de salud', type: 'text', required: true },
      { name: 'examDate', label: 'Fecha de examen', type: 'date', required: true }
    ]
  },
  {
    id: 'euthanasia_consent',
    name: 'Consentimiento de Eutanasia',
    description: 'Documento de autorización para procedimiento de eutanasia humanitaria',
    icon: 'pets',
    color: 'purple-6',
    urgent: true,
    features: ['Autorización legal', 'Consideraciones éticas', 'Opciones finales', 'Múltiples firmas'],
    defaultPrefix: 'CE',
    estimatedTime: '10 min',
    variables: [
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true },
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true },
      { name: 'medicalReason', label: 'Razón médica', type: 'text', required: true },
      { name: 'procedureDate', label: 'Fecha del procedimiento', type: 'date', required: true }
    ]
  }
])

// Opciones
const themeOptions = [
  { label: 'Oscuro', value: 'vs-dark' },
  { label: 'Claro', value: 'vs' },
  { label: 'Alto Contraste', value: 'hc-black' }
]

const paperSizes = [
  { label: 'A4 (210 × 297 mm)', value: 'A4' },
  { label: 'Carta (216 × 279 mm)', value: 'Letter' },
  { label: 'Legal (216 × 356 mm)', value: 'Legal' }
]

const orientations = [
  { label: 'Vertical (Portrait)', value: 'portrait' },
  { label: 'Horizontal (Landscape)', value: 'landscape' }
]

// Computed
const availableVariables = computed(() => {
  return selectedTemplateType.value?.variables || []
})

// Event Handlers
const selectTemplateType = (templateType) => {
  selectedTemplateType.value = templateType

  // Inicializar variables del template
  templateVariables.value = templateType.variables.map(variable => ({
    ...variable,
    value: variable.type === 'date' ? new Date().toISOString().split('T')[0] : ''
  }))

  // Configurar ajustes específicos del tipo
  templateSettings.prefix = templateType.defaultPrefix

  $q.notify({
    message: `Plantilla "${templateType.name}" seleccionada`,
    color: 'positive',
    icon: 'check_circle',
    position: 'top'
  })
}

const resetTemplateType = () => {
  selectedTemplateType.value = null
  templateContent.value = ''
  templateVariables.value = []
  hasUnsavedChanges.value = false
}

const handleVariableUpdate = (variable) => {
  const index = templateVariables.value.findIndex(v => v.name === variable.name)
  if (index !== -1) {
    templateVariables.value[index] = { ...variable }
    hasUnsavedChanges.value = true
  }
}

const handleVariableAdd = (variable) => {
  templateVariables.value.push({
    ...variable,
    name: variable.name || `var_${Date.now()}`
  })
  hasUnsavedChanges.value = true
}

const handleVariableDelete = (variableName) => {
  const index = templateVariables.value.findIndex(v => v.name === variableName)
  if (index !== -1) {
    templateVariables.value.splice(index, 1)
    hasUnsavedChanges.value = true
  }
}

const handleVariablesImport = (importedVariables) => {
  templateVariables.value = [...templateVariables.value, ...importedVariables]
  hasUnsavedChanges.value = true
  $q.notify({
    message: `${importedVariables.length} variables importadas`,
    color: 'positive',
    icon: 'upload'
  })
}

const handleVariableInsert = (variableName) => {
  // Emitir evento para que el editor inserte la variable
  // Este evento será manejado por el componente ModernTemplateEditor
}

const handleContentChange = (content) => {
  templateContent.value = content
  hasUnsavedChanges.value = true

  if (editorSettings.autoSave) {
    debounceAutoSave()
  }
}

const handleCursorChange = (position) => {
  cursorInfo.value = position
}

const handleValidationError = (errors) => {
  validationErrors.value = errors
}

const handleExport = async (format) => {
  try {
    await exportTemplate(format)
    $q.notify({
      message: `Template exportado en formato ${format}`,
      color: 'positive',
      icon: 'download'
    })
  } catch (error) {
    $q.notify({
      message: 'Error al exportar el template',
      color: 'negative',
      icon: 'error'
    })
  }
}

const handlePrint = () => {
  window.print()
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
  if (!showPreview.value) {
    rightSplitter.value = 100
  } else {
    rightSplitter.value = 60
  }
}

const applySettings = () => {
  localStorage.setItem('templateEditorSettings', JSON.stringify({
    editor: editorSettings,
    template: templateSettings,
    export: exportSettings
  }))

  showSettings.value = false

  $q.notify({
    message: 'Configuración aplicada exitosamente',
    color: 'positive',
    icon: 'check'
  })
}

const resetSettings = () => {
  Object.assign(editorSettings, {
    theme: 'vs-dark',
    fontSize: 14,
    showMinimap: true,
    autoSave: false,
    wordWrap: true
  })

  Object.assign(templateSettings, {
    customName: '',
    prefix: selectedTemplateType.value?.defaultPrefix || '',
    autoNumber: true,
    includeLogo: true
  })

  Object.assign(exportSettings, {
    paperSize: 'A4',
    orientation: 'portrait',
    includeWatermark: false,
    compressPdf: true
  })
}

// Auto-save con debounce
let autoSaveTimeout
const debounceAutoSave = () => {
  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(async () => {
    try {
      await saveTemplate()
      hasUnsavedChanges.value = false
    } catch (error) {
      console.error('Error en auto-save:', error)
    }
  }, 2000)
}

// Keyboard shortcuts
const handleKeyboard = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        if (selectedTemplateType.value) {
          saveTemplate()
        }
        break
      case 'p':
        event.preventDefault()
        togglePreview()
        break
      case ',':
        event.preventDefault()
        showSettings.value = true
        break
      case 'Escape':
        if (showSettings.value) {
          showSettings.value = false
        }
        break
    }
  }
}

// Watch para cambios no guardados
watch([templateContent, templateVariables], () => {
  hasUnsavedChanges.value = true
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Cargar configuraciones guardadas
  const savedSettings = localStorage.getItem('templateEditorSettings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    Object.assign(editorSettings, settings.editor || {})
    Object.assign(templateSettings, settings.template || {})
    Object.assign(exportSettings, settings.export || {})
  }

  // Registrar shortcuts
  window.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
  clearTimeout(autoSaveTimeout)
})
</script>

<style lang="scss" scoped>
.template-manager {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.manager-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);

    .header-icon {
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
  }

  .title-content {
    .page-title {
      margin: 0 0 0.25rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #2c3e50;
      background: linear-gradient(135deg, #2c3e50, #4a6741);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: #64748b;
      font-weight: 500;
    }
  }

  .status-chip {
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.header-actions {
  .action-group {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;

    .q-btn {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }

    .save-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);

      &:hover {
        background: linear-gradient(135deg, #5a6fd8, #6b4190);
      }
    }
  }
}

.template-type-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.type-selector-container {
  width: 100%;
  max-width: 1200px;

  .selector-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 3rem;
    text-align: center;
    justify-content: center;

    .selector-title {
      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }

      p {
        margin: 0;
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.template-types-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
}

.template-type-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

    .card-overlay {
      opacity: 1;
    }

    .type-avatar {
      transform: scale(1.1);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;

    .type-avatar {
      transition: transform 0.3s ease;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .urgency-indicator {
      animation: pulse 2s infinite;
    }
  }

  .card-content {
    margin-bottom: 1rem;

    .type-title {
      margin: 0 0 0.75rem 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: #1f2937;
    }

    .type-description {
      margin: 0 0 1.5rem 0;
      color: #6b7280;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .type-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      .feature-chip {
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .type-stats {
      display: flex;
      gap: 1rem;

      .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
      }
    }

    .select-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-weight: 600;
      border-radius: 10px;
      padding: 0.75rem 1.5rem;
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(5px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }
    }
  }

  .card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 20px;

    span {
      font-weight: 600;
      margin-top: 0.5rem;
      font-size: 1.1rem;
    }
  }
}

.manager-content {
  flex: 1;
  background: #f8fafc;
  overflow: hidden;
}

.selected-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;

  .breadcrumb-section {
    display: flex;
    align-items: center;
    gap: 1rem;

    .clickable {
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #3b82f6;
      }
    }

    .change-type-btn {
      color: #6b7280;
      transition: all 0.2s ease;

      &:hover {
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }
    }
  }

  .type-info-compact {
    display: flex;
    align-items: center;
    gap: 1rem;

    .type-details {
      display: flex;
      flex-direction: column;

      .type-name {
        font-weight: 600;
        color: #1f2937;
      }

      .variable-count {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }
  }
}

.main-splitter {
  height: calc(100vh - 200px);

  .splitter-separator {
    background: #e2e8f0;
    transition: background 0.2s ease;

    &:hover {
      background: #cbd5e1;
    }
  }
}

.content-splitter {
  height: 100%;
}

.settings-dialog {
  .settings-card {
    min-width: 600px;
    max-width: 800px;
    border-radius: 16px;
    overflow: hidden;
  }

  .settings-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;

    .header-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
    }

    .header-content {
      flex: 1;

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      p {
        margin: 0;
        opacity: 0.9;
        font-size: 0.95rem;
      }
    }
  }

  .settings-content {
    padding: 0;
  }

  .settings-tabs {
    .q-tabs {
      padding: 0 2rem;
      background: #f8fafc;
    }
  }

  .settings-panels {
    min-height: 400px;
  }

  .settings-panel {
    padding: 2rem;
  }

  .settings-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;

    .slider-value {
      min-width: 50px;
      text-align: center;
      font-weight: 600;
      color: #3b82f6;
    }
  }

  .settings-actions {
    padding: 1.5rem 2rem;
    background: #f8fafc;
    gap: 1rem;
  }
}

.floating-notifications {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;

  .notification-card {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);

    &.error-notification {
      background: rgba(239, 68, 68, 0.95);
      color: white;
    }

    &.cursor-notification {
      background: rgba(59, 130, 246, 0.95);
      color: white;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;

      &.compact {
        padding: 0.75rem 1rem;
        gap: 0.75rem;
      }

      .notification-text {
        flex: 1;

        strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }
      }
    }
  }
}

.loading-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  min-width: 300px;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem;

    h6 {
      margin: 1rem 0 0.5rem 0;
      color: #1f2937;
    }

    p {
      margin: 0;
      color: #6b7280;
    }
  }
}

// Animaciones
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Responsive
@media (max-width: 1024px) {
  .template-types-showcase {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .template-type-card {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .manager-header {
    .header-content {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .title-section {
      flex-direction: column;
      text-align: center;
      gap: 1rem;

      .title-content .page-title {
        font-size: 1.5rem;
      }
    }
  }

  .selected-type-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .template-types-showcase {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .template-type-card {
    padding: 1rem;

    .card-footer {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;

      .select-btn {
        align-self: center;
      }
    }
  }

  .floating-notifications {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  .settings-dialog .settings-card {
    min-width: 90vw;
    margin: 1rem;
  }
}

// Dark theme
.body--dark {
  .manager-header {
    background: rgba(30, 30, 30, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .title-section {
    .title-content .page-title {
      color: #e2e8f0;
      background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-subtitle {
      color: #94a3b8;
    }
  }

  .manager-content {
    background: #1a1a1a;
  }

  .selected-type-header {
    background: rgba(30, 30, 30, 0.95);
    border-bottom-color: #334155;

    .type-info-compact .type-details {
      .type-name {
        color: #e2e8f0;
      }

      .variable-count {
        color: #94a3b8;
      }
    }
  }

  .template-type-card {
    background: rgba(30, 30, 30, 0.95);

    .type-title {
      color: #e2e8f0;
    }

    .type-description {
      color: #94a3b8;
    }

    .type-stats .stat {
      color: #94a3b8;
    }
  }
}
</style>
