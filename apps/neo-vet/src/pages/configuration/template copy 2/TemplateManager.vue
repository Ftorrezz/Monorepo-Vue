<template>
  <q-page class="template-manager">
    <!-- Header con controles globales -->
    <div class="manager-header">
      <div class="header-content">
        <div class="title-section">
          <q-icon name="description" size="md" class="text-primary" />
          <h1 class="page-title">Editor de Templates</h1>
          <q-chip 
            :color="hasUnsavedChanges ? 'orange' : 'green'" 
            text-color="white" 
            size="sm"
          >
            {{ hasUnsavedChanges ? 'Sin guardar' : 'Guardado' }}
          </q-chip>
        </div>
        
        <div class="header-actions">
          <q-btn-group>
            <q-btn 
              color="primary" 
              icon="save" 
              label="Guardar"
              @click="saveTemplate"
              :loading="saving"
              :disable="!hasUnsavedChanges"
            />
            <q-btn 
              color="secondary" 
              icon="preview" 
              label="Vista Previa"
              @click="togglePreview"
              :outline="!showPreview"
            />
            <q-btn 
              color="accent" 
              icon="settings" 
              label="Configurar"
              @click="showSettings = true"
            />
          </q-btn-group>
        </div>
      </div>
    </div>

    <!-- Layout principal con splitters -->
    <div class="manager-content">
      <q-splitter
        v-model="leftSplitter"
        :limits="[15, 35]"
        separator-class="bg-grey-3"
        separator-style="width: 8px;"
        class="full-height"
      >
        <!-- Panel izquierdo: Variables -->
        <template v-slot:before>
          <ModernVariablesSidebar
            :variables="templateVariables"
            :loading="loading"
            @variable-updated="handleVariableUpdate"
            @variable-added="handleVariableAdd"
            @variable-deleted="handleVariableDelete"
            @variables-imported="handleVariablesImport"
          />
        </template>

        <!-- Panel derecho: Editor y Preview -->
        <template v-slot:after>
          <q-splitter
            v-model="rightSplitter"
            horizontal
            :limits="[30, 100]"
            separator-class="bg-grey-3"
            separator-style="height: 8px;"
            class="full-height"
          >
            <!-- Editor -->
            <template v-slot:before>
              <ModernTemplateEditor
                v-model="templateContent"
                :variables="templateVariables"
                :loading="loading"
                :show-minimap="editorSettings.showMinimap"
                :theme="editorSettings.theme"
                :font-size="editorSettings.fontSize"
                @content-changed="handleContentChange"
                @cursor-changed="handleCursorChange"
                @validation-error="handleValidationError"
              />
            </template>

            <!-- Preview (condicional) -->
            <template v-slot:after v-if="showPreview">
              <ModernTemplatePreview
                :content="templateContent"
                :variables="templateVariables"
                :loading="processing"
                @export-requested="handleExport"
                @print-requested="handlePrint"
              />
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </div>

    <!-- Dialog de configuraciones -->
    <q-dialog v-model="showSettings" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="settings" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Configuración del Editor</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showSettings = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="settings-grid">
            <q-select
              v-model="editorSettings.theme"
              :options="themeOptions"
              label="Tema del Editor"
              emit-value
              map-options
              class="q-mb-md"
            />

            <q-slider
              v-model="editorSettings.fontSize"
              :min="12"
              :max="24"
              :step="1"
              label
              label-always
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="text_fields" />
              </template>
              <template v-slot:append>
                <span class="text-caption">{{ editorSettings.fontSize }}px</span>
              </template>
            </q-slider>

            <q-toggle
              v-model="editorSettings.showMinimap"
              label="Mostrar Minimapa"
              class="q-mb-md"
            />

            <q-toggle
              v-model="editorSettings.autoSave"
              label="Guardado Automático"
              class="q-mb-md"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat @click="showSettings = false" />
          <q-btn label="Aplicar" color="primary" @click="applySettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Notificaciones flotantes -->
    <div class="floating-notifications">
      <q-chip
        v-if="validationErrors.length > 0"
        color="negative"
        text-color="white"
        icon="error"
        removable
        @remove="validationErrors = []"
        class="notification-chip"
      >
        {{ validationErrors.length }} error(es) encontrado(s)
      </q-chip>

      <q-chip
        v-if="cursorInfo"
        color="info"
        text-color="white"
        icon="my_location"
        class="notification-chip cursor-info"
      >
        Línea {{ cursorInfo.line }}, Columna {{ cursorInfo.column }}
      </q-chip>
    </div>
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

// Configuración de splitters
const leftSplitter = ref(25) // 25% para variables
const rightSplitter = ref(60) // 60% para editor, 40% para preview

// Configuración del editor
const editorSettings = reactive({
  theme: 'vs-dark',
  fontSize: 14,
  showMinimap: true,
  autoSave: false
})

const themeOptions = [
  { label: 'Oscuro', value: 'vs-dark' },
  { label: 'Claro', value: 'vs' },
  { label: 'Alto Contraste', value: 'hc-black' }
]

// Computed
const layoutClass = computed(() => ({
  'show-preview': showPreview.value,
  'hide-preview': !showPreview.value
}))

// Event Handlers
const handleVariableUpdate = (variable) => {
  const index = templateVariables.value.findIndex(v => v.id === variable.id)
  if (index !== -1) {
    templateVariables.value[index] = { ...variable }
    hasUnsavedChanges.value = true
  }
}

const handleVariableAdd = (variable) => {
  templateVariables.value.push({
    ...variable,
    id: Date.now().toString()
  })
  hasUnsavedChanges.value = true
}

const handleVariableDelete = (variableId) => {
  const index = templateVariables.value.findIndex(v => v.id === variableId)
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

const handleContentChange = (content) => {
  templateContent.value = content
  hasUnsavedChanges.value = true
  
  // Auto-save si está habilitado
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
  // Ajustar splitter cuando se oculta/muestra preview
  if (!showPreview.value) {
    rightSplitter.value = 100
  } else {
    rightSplitter.value = 60
  }
}

const applySettings = () => {
  // Aplicar configuraciones
  localStorage.setItem('editorSettings', JSON.stringify(editorSettings))
  showSettings.value = false
  $q.notify({
    message: 'Configuración aplicada',
    color: 'positive',
    icon: 'check'
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

// Watch para cambios no guardados
watch([templateContent, templateVariables], () => {
  hasUnsavedChanges.value = true
}, { deep: true })

// Keyboard shortcuts
const handleKeyboard = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        saveTemplate()
        break
      case 'p':
        event.preventDefault()
        togglePreview()
        break
      case ',':
        event.preventDefault()
        showSettings.value = true
        break
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Cargar configuraciones guardadas
  const savedSettings = localStorage.getItem('editorSettings')
  if (savedSettings) {
    Object.assign(editorSettings, JSON.parse(savedSettings))
  }
  
  // Cargar template inicial
  await loadTemplate()
  
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
}

.manager-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.manager-content {
  flex: 1;
  background: #f8fafc;
  overflow: hidden;
}

.floating-notifications {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-chip {
  animation: slideInRight 0.3s ease-out;
}

.cursor-info {
  opacity: 0.8;
  font-size: 0.8rem;
}

.settings-grid {
  display: grid;
  gap: 1rem;
}

// Responsive
@media (max-width: 768px) {
  .manager-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
  }
  
  .floating-notifications {
    bottom: 1rem;
    right: 1rem;
  }
}

// Animaciones
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

// Tema oscuro
.body--dark .manager-header {
  background: rgba(30, 30, 30, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.body--dark .page-title {
  color: #e2e8f0;
}

.body--dark .manager-content {
  background: #1a1a1a;
}
</style>