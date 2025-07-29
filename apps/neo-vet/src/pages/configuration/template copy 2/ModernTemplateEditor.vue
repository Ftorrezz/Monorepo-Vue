<template>
  <div class="template-editor">
    <!-- Header del Editor -->
    <div class="editor-header">
      <div class="header-left">
        <q-icon name="edit" size="sm" class="text-primary" />
        <span class="editor-title">Editor de Template</span>
        
        <q-chip 
          :color="hasChanges ? 'orange' : 'green'" 
          text-color="white" 
          size="sm"
          :icon="hasChanges ? 'edit' : 'check_circle'"
        >
          {{ hasChanges ? 'Editando...' : 'Guardado' }}
        </q-chip>
      </div>

      <div class="header-actions">
        <q-btn-group>
          <q-btn
            flat
            dense
            icon="undo"
            @click="undo"
            :disable="!canUndo"
            size="sm"
          >
            <q-tooltip>Deshacer</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            icon="redo"
            @click="redo"
            :disable="!canRedo"
            size="sm"
          >
            <q-tooltip>Rehacer</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-separator vertical class="q-mx-sm" />

        <q-btn-group>
          <q-btn
            flat
            dense
            icon="save"
            @click="saveTemplate"
            :loading="saving"
            size="sm"
          >
            <q-tooltip>Guardar Template</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            icon="folder_open"
            @click="loadTemplate"
            size="sm"
          >
            <q-tooltip>Cargar Template</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-separator vertical class="q-mx-sm" />

        <q-btn
          flat
          dense
          icon="settings"
          @click="showEditorSettings = true"
          size="sm"
        >
          <q-tooltip>Configuración del Editor</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Contenido del Editor -->
    <div class="editor-content">
      <!-- Toolbar de Variables -->
      <div class="variables-toolbar" v-if="showVariablesToolbar">
        <div class="toolbar-title">
          <q-icon name="code" size="sm" />
          <span>Variables Disponibles</span>
          <q-btn
            flat
            dense
            round
            icon="close"
            size="xs"
            @click="showVariablesToolbar = false"
          />
        </div>
        
        <div class="variables-list">
          <q-chip
            v-for="variable in variables"
            :key="variable.name"
            :label="`{{${variable.name}}}`"
            clickable
            @click="insertVariable(variable.name)"
            color="primary"
            text-color="white"
            size="sm"
            class="variable-chip"
          >
            <q-tooltip>{{ variable.description || `Insertar variable: ${variable.name}` }}</q-tooltip>
          </q-chip>
          
          <q-btn
            flat
            dense
            icon="add"
            label="Nueva Variable"
            @click="showNewVariableDialog = true"
            size="sm"
            color="positive"
          />
        </div>
      </div>

      <!-- QEditor Principal -->
      <div class="qeditor-container">
        <q-editor
          ref="qeditorRef"
          v-model="internalContent"
          :toolbar="editorToolbar"
          :fonts="fontOptions"
          min-height="400px"
          max-height="600px"
          @update:model-value="onContentChange"
          @keydown="onKeyDown"
          @paste="onPaste"
          :placeholder="placeholder"
          class="full-height"
        />
      </div>

      <!-- Footer del Editor -->
      <div class="editor-footer">
        <div class="footer-stats">
          <span class="stat-item">
            <q-icon name="text_fields" size="xs" />
            {{ wordCount }} palabras
          </span>
          <span class="stat-item">
            <q-icon name="format_size" size="xs" />
            {{ charCount }} caracteres
          </span>
          <span class="stat-item">
            <q-icon name="code" size="xs" />
            {{ variableCount }} variables
          </span>
        </div>

        <div class="footer-actions">
          <q-btn
            flat
            dense
            size="sm"
            :icon="showVariablesToolbar ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            @click="showVariablesToolbar = !showVariablesToolbar"
          >
            <q-tooltip>{{ showVariablesToolbar ? 'Ocultar' : 'Mostrar' }} Variables</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            size="sm"
            icon="help"
            @click="showHelpDialog = true"
          >
            <q-tooltip>Ayuda de Sintaxis</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Dialog de Nueva Variable -->
    <q-dialog v-model="showNewVariableDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="add" size="md" class="text-positive q-mr-md" />
          <div class="text-h6">Nueva Variable</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeNewVariableDialog" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="createNewVariable">
            <q-input
              v-model="newVariable.name"
              label="Nombre de la variable"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
              class="q-mb-md"
            />
            
            <q-input
              v-model="newVariable.description"
              label="Descripción (opcional)"
              outlined
              type="textarea"
              rows="2"
              class="q-mb-md"
            />
            
            <q-select
              v-model="newVariable.type"
              :options="variableTypes"
              label="Tipo de variable"
              outlined
              emit-value
              map-options
              class="q-mb-md"
            />
            
            <q-input
              v-model="newVariable.defaultValue"
              label="Valor por defecto (opcional)"
              outlined
            />
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat @click="closeNewVariableDialog" />
          <q-btn label="Crear Variable" color="positive" @click="createNewVariable" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de Configuración del Editor -->
    <q-dialog v-model="showEditorSettings" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <q-icon name="settings" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Configuración del Editor</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showEditorSettings = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="settings-grid">
            <q-toggle 
              v-model="editorSettings.autoSave" 
              label="Guardado automático"
            />

            <q-slider
              v-model="editorSettings.autoSaveDelay"
              :min="1000"
              :max="10000"
              :step="500"
              label
              label-always
              :disable="!editorSettings.autoSave"
            >
              <template v-slot:prepend>
                <span class="text-caption">Delay</span>
              </template>
              <template v-slot:append>
                <span class="text-caption">{{ editorSettings.autoSaveDelay }}ms</span>
              </template>
            </q-slider>

            <q-toggle 
              v-model="editorSettings.showVariablesOnLoad" 
              label="Mostrar variables al cargar"
            />

            <q-toggle 
              v-model="editorSettings.highlightVariables" 
              label="Resaltar variables al escribir"
            />

            <q-select
              v-model="editorSettings.defaultFont"
              :options="fontOptions"
              label="Fuente por defecto"
              emit-value
              map-options
            />

            <q-toggle 
              v-model="editorSettings.enableSpellCheck" 
              label="Corrección ortográfica"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cerrar" flat @click="showEditorSettings = false" />
          <q-btn label="Restablecer" color="secondary" @click="resetEditorSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de Ayuda -->
    <q-dialog v-model="showHelpDialog" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="help" size="md" class="text-info q-mr-md" />
          <div class="text-h6">Guía de Sintaxis para Templates</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showHelpDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="help-content">
          <div class="help-section">
            <h6>Variables</h6>
            <p>Usa dobles llaves para insertar variables:</p>
            <code>{{nombreVariable}}</code>
            <p>Ejemplo: Hola {{nombre}}, bienvenido a {{empresa}}</p>
          </div>

          <div class="help-section">
            <h6>Condicionales</h6>
            <p>Muestra contenido solo si una variable tiene valor:</p>
            <code>{if:variable}Contenido a mostrar{/if}</code>
            <p>Ejemplo: {if:descuento}¡Tienes un descuento especial!{/if}</p>
          </div>

          <div class="help-section">
            <h6>Bucles</h6>
            <p>Repite contenido para cada elemento de una lista:</p>
            <code>{for:items}Elemento: {{nombre}}{/for}</code>
            <p>Útil para listas de productos, usuarios, etc.</p>
          </div>

          <div class="help-section">
            <h6>Formato de Texto</h6>
            <p>Usa las herramientas del editor para:</p>
            <ul>
              <li><strong>Negrita</strong> y <em>cursiva</em></li>
              <li>Títulos y subtítulos</li>
              <li>Listas numeradas y con viñetas</li>
              <li>Enlaces y citas</li>
              <li>Tablas</li>
            </ul>
          </div>

          <div class="help-section">
            <h6>Consejos</h6>
            <ul>
              <li>Usa el panel de variables para insertar rápidamente</li>
              <li>Las variables no resueltas se resaltarán en la vista previa</li>
              <li>Guarda frecuentemente tu trabajo</li>
              <li>Usa la vista previa para verificar el resultado</li>
            </ul>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, nextTick, defineExpose } from 'vue'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  variables: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Escribe tu template aquí...'
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'variable-created',
  'content-saved'
])

// Composables
const $q = useQuasar()

// Referencias
const qeditorRef = ref(null)

// Estado local
const internalContent = ref(props.modelValue || '')
const hasChanges = ref(false)
const saving = ref(false)
const showVariablesToolbar = ref(true)
const showNewVariableDialog = ref(false)
const showEditorSettings = ref(false)
const showHelpDialog = ref(false)

// Historial para undo/redo
const history = ref([])
const historyIndex = ref(-1)
const maxHistorySize = 50

// Nueva variable
const newVariable = reactive({
  name: '',
  description: '',
  type: 'text',
  defaultValue: ''
})

// Configuración del editor
const editorSettings = reactive({
  autoSave: true,
  autoSaveDelay: 3000,
  showVariablesOnLoad: true,
  highlightVariables: true,
  defaultFont: 'default',
  enableSpellCheck: true
})

// Opciones del editor
const editorToolbar = [
  [
    {
      label: $q.lang.editor.formatting,
      icon: $q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
    }
  ],
  ['bold', 'italic', 'underline', 'strike'],
  ['token', 'hr', 'link', 'custom_btn'],
  [
    {
      label: $q.lang.editor.align,
      icon: $q.iconSet.editor.align,
      fixedLabel: true,
      options: ['left', 'center', 'right', 'justify']
    }
  ],
  ['unordered', 'ordered', 'outdent', 'indent'],
  [
    {
      label: $q.lang.editor.fontSize,
      icon: $q.iconSet.editor.fontSize,
      fixedLabel: true,
      options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
    },
    'removeFormat'
  ],
  ['quote', 'unordered', 'ordered'],
  ['undo', 'redo'],
  ['viewsource']
]

const fontOptions = [
  { label: 'Por defecto', value: 'default' },
  { label: 'Arial', value: 'arial' },
  { label: 'Helvetica', value: 'helvetica' },
  { label: 'Times New Roman', value: 'times' },
  { label: 'Georgia', value: 'georgia' },
  { label: 'Verdana', value: 'verdana' },
  { label: 'Courier New', value: 'courier' }
]

const variableTypes = [
  { label: 'Texto', value: 'text' },
  { label: 'Número', value: 'number' },
  { label: 'Fecha', value: 'date' },
  { label: 'Lista', value: 'array' },
  { label: 'Booleano', value: 'boolean' }
]

// Computed properties
const wordCount = computed(() => {
  if (!internalContent.value) return 0
  const textContent = internalContent.value.replace(/<[^>]*>/g, '')
  return textContent.trim().split(/\s+/).filter(word => word.length > 0).length
})

const charCount = computed(() => {
  return internalContent.value.length
})

const variableCount = computed(() => {
  const matches = internalContent.value.match(/\{\{[^}]+\}\}/g)
  return matches ? matches.length : 0
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// Auto-save timer
let autoSaveTimer = null

// Métodos principales
const onContentChange = (newContent) => {
  internalContent.value = newContent
  hasChanges.value = true
  emit('update:modelValue', newContent)
  
  // Agregar al historial
  addToHistory(newContent)
  
  // Auto-save
  if (editorSettings.autoSave) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(() => {
      saveTemplate()
    }, editorSettings.autoSaveDelay)
  }
}

const onKeyDown = (event) => {
  // Atajos de teclado personalizados
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        saveTemplate()
        break
      case 'z':
        if (event.shiftKey) {
          event.preventDefault()
          redo()
        } else {
          event.preventDefault()
          undo()
        }
        break
      case 'y':
        event.preventDefault()
        redo()
        break
    }
  }
}

const onPaste = (event) => {
  // Procesar contenido pegado si es necesario
  nextTick(() => {
    if (editorSettings.highlightVariables) {
      highlightVariablesInContent()
    }
  })
}

// Gestión del historial
const addToHistory = (content) => {
  // Evitar duplicados consecutivos
  if (history.value.length > 0 && history.value[historyIndex.value] === content) {
    return
  }
  
  // Eliminar entradas futuras si estamos en el medio del historial
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  
  // Agregar nueva entrada
  history.value.push(content)
  historyIndex.value = history.value.length - 1
  
  // Limitar tamaño del historial
  if (history.value.length > maxHistorySize) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    const content = history.value[historyIndex.value]
    internalContent.value = content
    emit('update:modelValue', content)
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    const content = history.value[historyIndex.value]
    internalContent.value = content
    emit('update:modelValue', content)
  }
}

// Gestión de variables
const insertVariable = (variableName) => {
  const editor = qeditorRef.value
  if (editor) {
    const variableText = `{{${variableName}}}`
    editor.caret.restore()
    editor.runCmd('insertText', variableText)
  }
}

const highlightVariablesInContent = () => {
  // Esta función se podría implementar para resaltar variables en tiempo real
  // Por simplicidad, la vista previa se encarga del resaltado
}

const createNewVariable = () => {
  if (!newVariable.name.trim()) {
    $q.notify({
      message: 'El nombre de la variable es requerido',
      color: 'negative',
      icon: 'error'
    })
    return
  }
  
  // Verificar que no exista ya
  const exists = props.variables.some(v => v.name === newVariable.name)
  if (exists) {
    $q.notify({
      message: 'Ya existe una variable con ese nombre',
      color: 'warning',
      icon: 'warning'
    })
    return
  }
  
  const variable = {
    name: newVariable.name,
    description: newVariable.description || '',
    type: newVariable.type,
    value: newVariable.defaultValue || ''
  }
  
  emit('variable-created', variable)
  
  // Insertar la variable en el editor
  insertVariable(newVariable.name)
  
  // Limpiar formulario
  closeNewVariableDialog()
  
  $q.notify({
    message: `Variable "${newVariable.name}" creada exitosamente`,
    color: 'positive',
    icon: 'check_circle'
  })
}

const closeNewVariableDialog = () => {
  showNewVariableDialog.value = false
  Object.assign(newVariable, {
    name: '',
    description: '',
    type: 'text',
    defaultValue: ''
  })
}

// Gestión de archivos
const saveTemplate = async () => {
  saving.value = true
  
  try {
    // Simular guardado - en una app real, aquí harías la llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    hasChanges.value = false
    emit('content-saved', internalContent.value)
    
    $q.notify({
      message: 'Template guardado exitosamente',
      color: 'positive',
      icon: 'save'
    })
    
  } catch (error) {
    $q.notify({
      message: 'Error al guardar el template',
      color: 'negative',
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

const loadTemplate = () => {
  // Crear input file temporal
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.html,.txt'
  
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      internalContent.value = content
      emit('update:modelValue', content)
      addToHistory(content)
      
      $q.notify({
        message: `Template "${file.name}" cargado exitosamente`,
        color: 'positive',
        icon: 'folder_open'
      })
    }
    
    reader.readAsText(file)
  }
  
  input.click()
}

// Configuración
const resetEditorSettings = () => {
  Object.assign(editorSettings, {
    autoSave: true,
    autoSaveDelay: 3000,
    showVariablesOnLoad: true,
    highlightVariables: true,
    defaultFont: 'default',
    enableSpellCheck: true
  })
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue !== internalContent.value) {
    internalContent.value = newValue
    addToHistory(newValue)
  }
})

watch(() => editorSettings.showVariablesOnLoad, (show) => {
  if (show) {
    showVariablesToolbar.value = true
  }
})

// Lifecycle
onMounted(() => {
  // Inicializar historial
  if (internalContent.value) {
    addToHistory(internalContent.value)
  }
  
  // Mostrar variables si está configurado
  if (editorSettings.showVariablesOnLoad) {
    showVariablesToolbar.value = true
  }
})

defineExpose({
  insertVariable
})
</script>

<style lang="scss" scoped>
.template-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .editor-title {
      font-weight: 600;
      color: #334155;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.variables-toolbar {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;

  .toolbar-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #475569;
    
    .q-btn {
      margin-left: auto;
    }
  }

  .variables-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;

    .variable-chip {
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
}

.qeditor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  :deep(.q-editor) {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .q-editor__content {
      flex: 1;
      overflow: auto;
    }
  }
  
  // Personalización del QEditor
  :deep(.q-editor__toolbar) {
    border-bottom: 1px solid #e2e8f0;
    background: #ffffff;
  }
  
  :deep(.q-editor__content) {
    padding: 1rem;
    line-height: 1.6;
    font-size: 1rem;
    
    &:focus {
      outline: none;
    }
  }
  
  // Estilos para el contenido del editor
  :deep(.q-editor__content) {
    h1, h2, h3, h4, h5, h6 {
      margin: 1em 0 0.5em 0;
      font-weight: 600;
    }
    
    p {
      margin: 0 0 1em 0;
    }
    
    ul, ol {
      margin: 0 0 1em 0;
      padding-left: 2em;
    }
    
    blockquote {
      border-left: 4px solid #e5e7eb;
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: #6b7280;
    }
    
    code {
      background: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-size: 0.9em;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    
    pre {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
      
      code {
        background: none;
        padding: 0;
      }
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      
      th, td {
        border: 1px solid #e5e7eb;
        padding: 0.5rem;
        text-align: left;
      }
      
      th {
        background: #f9fafb;
        font-weight: 600;
      }
    }
  }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.8rem;
  color: #64748b;

  .footer-stats {
    display: flex;
    gap: 1rem;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .footer-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.settings-grid {
  display: grid;
  gap: 1rem;
}

.help-content {
  max-height: 70vh;
  overflow-y: auto;
  
  .help-section {
    margin-bottom: 2rem;
    
    h6 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    p {
      margin-bottom: 0.5rem;
      color: #4b5563;
    }
    
    code {
      background: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      color: #dc2626;
    }
    
    ul {
      margin: 0.5rem 0;
      padding-left: 2rem;
      
      li {
        margin-bottom: 0.25rem;
        color: #4b5563;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;

    .header-left, .header-actions {
      justify-content: center;
    }
  }

  .variables-toolbar {
    padding: 0.5rem;
    
    .variables-list {
      justify-content: center;
    }
  }

  .qeditor-container {
    :deep(.q-editor__content) {
      padding: 0.5rem;
      font-size: 0.9rem;
    }
  }

  .editor-footer {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;

    .footer-stats {
      justify-content: center;
    }
  }
}

// Dark theme
.body--dark {
  .template-editor {
    background: #1e293b;
  }

  .editor-header {
    background: #0f172a;
    border-bottom-color: #334155;

    .editor-title {
      color: #e2e8f0;
    }
  }

  .variables-toolbar {
    background: #334155;
    border-bottom-color: #475569;

    .toolbar-title {
      color: #e2e8f0;
    }
  }

  .qeditor-container {
    :deep(.q-editor__toolbar) {
      background: #334155;
      border-bottom-color: #475569;
    }

    :deep(.q-editor__content) {
      background: #1e293b;
      color: #e2e8f0;

      blockquote {
        border-left-color: #475569;
        color: #94a3b8;
      }

      code {
        background: #334155;
        color: #e2e8f0;
      }

      pre {
        background: #0f172a;
        color: #e2e8f0;
      }

      table {
        th, td {
          border-color: #475569;
        }

        th {
          background: #334155;
        }
      }
    }
  }

  .editor-footer {
    background: #0f172a;
    border-top-color: #334155;
    color: #94a3b8;
  }

  .help-content {
    .help-section {
      h6 {
        color: #e2e8f0;
      }

      p, li {
        color: #cbd5e1;
      }

      code {
        background: #334155;
        color: #fbbf24;
      }
    }
  }
}

// Print styles
@media print {
  .template-editor {
    .editor-header, .variables-toolbar, .editor-footer {
      display: none;
    }

    .qeditor-container {
      :deep(.q-editor__toolbar) {
        display: none;
      }

      :deep(.q-editor__content) {
        background: white !important;
        color: black !important;
        padding: 0;
      }
    }
  }
}
</style>