<template>
  <div class="template-editor">
    <!-- Header del editor -->
    <div class="editor-header">
      <div class="header-left">
        <q-icon name="edit" size="sm" class="text-primary" />
        <span class="editor-title">Editor de Template</span>
        
        <q-chip 
          :color="hasChanges ? 'orange' : 'green'" 
          text-color="white" 
          size="sm"
          icon="edit"
        >
          {{ hasChanges ? 'Modificado' : 'Sincronizado' }}
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

        <q-btn
          flat
          dense
          icon="format_size"
          size="sm"
        >
          <q-tooltip>Tamaño de fuente</q-tooltip>
          <q-menu>
            <q-list>
              <q-item 
                v-for="size in fontSizes"
                :key="size"
                clickable
                @click="changeFontSize(size)"
                :class="{ 'bg-primary text-white': fontSize === size }"
              >
                <q-item-section>{{ size }}px</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          flat
          dense
          icon="palette"
          size="sm"
        >
          <q-tooltip>Tema</q-tooltip>
          <q-menu>
            <q-list>
              <q-item 
                v-for="themeOption in themes"
                :key="themeOption.value"
                clickable
                @click="changeTheme(themeOption.value)"
                :class="{ 'bg-primary text-white': theme === themeOption.value }"
              >
                <q-item-section>{{ themeOption.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          flat
          dense
          :icon="showMinimap ? 'visibility' : 'visibility_off'"
          @click="toggleMinimap"
          size="sm"
        >
          <q-tooltip>{{ showMinimap ? 'Ocultar' : 'Mostrar' }} Minimapa</q-tooltip>
        </q-btn>

        <q-separator vertical class="q-mx-sm" />

        <q-btn
          flat
          dense
          icon="search"
          @click="toggleSearch"
          size="sm"
        >
          <q-tooltip>Buscar y Reemplazar</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="more_vert"
          size="sm"
        >
          <q-tooltip>Más opciones</q-tooltip>
          <q-menu>
            <q-list>
              <q-item clickable @click="formatDocument">
                <q-item-section avatar>
                  <q-icon name="auto_fix_high" />
                </q-item-section>
                <q-item-section>Formatear Documento</q-item-section>
              </q-item>
              
              <q-item clickable @click="insertVariable">
                <q-item-section avatar>
                  <q-icon name="add_box" />
                </q-item-section>
                <q-item-section>Insertar Variable</q-item-section>
              </q-item>
              
              <q-item clickable @click="insertTemplate">
                <q-item-section avatar>
                  <q-icon name="library_add" />
                </q-item-section>
                <q-item-section>Insertar Plantilla</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable @click="showSettings = true">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Configuración</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- Toolbar con variables disponibles -->
    <div class="variables-toolbar" v-if="variables.length > 0">
      <div class="toolbar-label">Variables disponibles:</div>
      <div class="variables-chips">
        <q-chip
          v-for="variable in variables"
          :key="variable.id"
          :color="isVariableUsed(variable) ? 'primary' : 'grey-4'"
          :text-color="isVariableUsed(variable) ? 'white' : 'grey-8'"
          size="sm"
          clickable
          @click="insertVariableAtCursor(variable)"
          class="variable-chip"
        >
          <q-icon name="code" size="xs" class="q-mr-xs" />
          {{ variable.name }}
          <q-tooltip>
            {{ variable.description || 'Sin descripción' }}<br>
            Tipo: {{ getTypeLabel(variable.type) }}<br>
            Valor: {{ variable.value || 'Sin valor' }}
          </q-tooltip>
        </q-chip>
      </div>
    </div>

    <!-- Editor principal -->
    <div class="editor-container" :class="editorClasses">
      <div ref="editorElement" class="monaco-editor"></div>
      
      <!-- Overlay de loading -->
      <div v-if="loading" class="editor-loading">
        <q-spinner-dots size="lg" color="primary" />
        <p>Cargando editor...</p>
      </div>
    </div>

    <!-- Panel de búsqueda (deslizable) -->
    <div v-if="searchVisible" class="search-panel">
      <div class="search-content">
        <q-input
          v-model="searchQuery"
          placeholder="Buscar..."
          dense
          outlined
          autofocus
          @keyup.enter="findNext"
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn flat round dense size="sm" icon="keyboard_arrow_down" @click="findNext">
              <q-tooltip>Siguiente</q-tooltip>
            </q-btn>
            <q-btn flat round dense size="sm" icon="keyboard_arrow_up" @click="findPrevious">
              <q-tooltip>Anterior</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <q-input
          v-model="replaceQuery"
          placeholder="Reemplazar..."
          dense
          outlined
          @keyup.enter="replaceNext"
          class="replace-input"
        >
          <template v-slot:append>
            <q-btn flat round dense size="sm" icon="find_replace" @click="replaceNext">
              <q-tooltip>Reemplazar</q-tooltip>
            </q-btn>
            <q-btn flat round dense size="sm" icon="swap_horiz" @click="replaceAll">
              <q-tooltip>Reemplazar Todo</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <div class="search-options">
          <q-toggle v-model="searchOptions.caseSensitive" label="Aa" size="sm">
            <q-tooltip>Sensible a mayúsculas</q-tooltip>
          </q-toggle>
          <q-toggle v-model="searchOptions.wholeWord" label="Ab" size="sm">
            <q-tooltip>Palabra completa</q-tooltip>
          </q-toggle>
          <q-toggle v-model="searchOptions.regex" label=".*" size="sm">
            <q-tooltip>Expresión regular</q-tooltip>
          </q-toggle>
        </div>

        <q-btn 
          flat 
          round 
          dense 
          icon="close" 
          @click="toggleSearch"
          class="close-search"
        />
      </div>
    </div>

    <!-- Información de estado -->
    <div class="editor-status">
      <div class="status-left">
        <span class="cursor-info" v-if="cursorPosition">
          Línea {{ cursorPosition.lineNumber }}, Columna {{ cursorPosition.column }}
        </span>
        <span class="selection-info" v-if="selectionInfo">
          ({{ selectionInfo }} seleccionado)
        </span>
      </div>

      <div class="status-right">
        <span class="word-count">{{ wordCount }} palabras</span>
        <span class="char-count">{{ charCount }} caracteres</span>
      </div>
    </div>

    <!-- Dialog para insertar variables -->
    <q-dialog v-model="showVariableDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="add_box" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Insertar Variable</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showVariableDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="variable-list">
            <q-item
              v-for="variable in variables"
              :key="variable.id"
              clickable
              @click="insertSelectedVariable(variable)"
              class="variable-item"
            >
              <q-item-section avatar>
                <q-icon :name="getVariableIcon(variable.type)" :color="getVariableColor(variable.type)" />
              </q-item-section>
              
              <q-item-section>
                <q-item-label>{{ variable.name }}</q-item-label>
                <q-item-label caption>{{ variable.description || 'Sin descripción' }}</q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <q-badge :color="getVariableColor(variable.type)" :label="getTypeLabel(variable.type)" />
              </q-item-section>
            </q-item>
          </div>

          <div v-if="variables.length === 0" class="no-variables">
            <q-icon name="tune" size="lg" class="text-grey-5" />
            <p class="text-grey-6">No hay variables disponibles</p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog para insertar plantillas -->
    <q-dialog v-model="showTemplateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <q-icon name="library_add" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Insertar Plantilla</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showTemplateDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-tabs v-model="templateTab" class="text-primary">
            <q-tab name="snippets" label="Fragmentos" />
            <q-tab name="layouts" label="Layouts" />
            <q-tab name="examples" label="Ejemplos" />
          </q-tabs>

          <q-tab-panels v-model="templateTab" animated>
            <q-tab-panel name="snippets">
              <div class="template-grid">
                <q-card
                  v-for="snippet in templateSnippets"
                  :key="snippet.id"
                  flat
                  bordered
                  class="template-card cursor-pointer"
                  @click="insertTemplateSnippet(snippet)"
                >
                  <q-card-section>
                    <div class="snippet-name">{{ snippet.name }}</div>
                    <div class="snippet-desc">{{ snippet.description }}</div>
                    <pre class="snippet-preview">{{ snippet.preview }}</pre>
                  </q-card-section>
                </q-card>
              </div>
            </q-tab-panel>

            <q-tab-panel name="layouts">
              <div class="template-grid">
                <q-card
                  v-for="layout in templateLayouts"
                  :key="layout.id"
                  flat
                  bordered
                  class="template-card cursor-pointer"
                  @click="insertTemplateLayout(layout)"
                >
                  <q-card-section>
                    <div class="snippet-name">{{ layout.name }}</div>
                    <div class="snippet-desc">{{ layout.description }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </q-tab-panel>

            <q-tab-panel name="examples">
              <div class="template-grid">
                <q-card
                  v-for="example in templateExamples"
                  :key="example.id"
                  flat
                  bordered
                  class="template-card cursor-pointer"
                  @click="insertTemplateExample(example)"
                >
                  <q-card-section>
                    <div class="snippet-name">{{ example.name }}</div>
                    <div class="snippet-desc">{{ example.description }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de configuración del editor -->
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
            <q-toggle 
              v-model="editorSettings.wordWrap" 
              label="Ajuste de línea automático"
              @update:model-value="updateEditorOptions"
            />
            
            <q-toggle 
              v-model="editorSettings.lineNumbers" 
              label="Mostrar números de línea"
              @update:model-value="updateEditorOptions"
            />
            
            <q-toggle 
              v-model="editorSettings.minimap" 
              label="Mostrar minimapa"
              @update:model-value="updateEditorOptions"
            />
            
            <q-toggle 
              v-model="editorSettings.bracketMatching" 
              label="Resaltar llaves coincidentes"
              @update:model-value="updateEditorOptions"
            />
            
            <q-toggle 
              v-model="editorSettings.autoIndent" 
              label="Sangría automática"
              @update:model-value="updateEditorOptions"
            />

            <q-slider
              v-model="editorSettings.tabSize"
              :min="2"
              :max="8"
              :step="1"
              label
              label-always
              @update:model-value="updateEditorOptions"
            >
              <template v-slot:prepend>
                <span class="text-caption">Tab</span>
              </template>
              <template v-slot:append>
                <span class="text-caption">{{ editorSettings.tabSize }}</span>
              </template>
            </q-slider>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cerrar" flat @click="showSettings = false" />
          <q-btn label="Restablecer" color="secondary" @click="resetEditorSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import * as monaco from 'monaco-editor'

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
  loading: {
    type: Boolean,
    default: false
  },
  showMinimap: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'vs-dark'
  },
  fontSize: {
    type: Number,
    default: 14
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'content-changed',
  'cursor-changed',
  'validation-error'
])

// Composables
const $q = useQuasar()

// Refs
const editorElement = ref(null)
const editor = ref(null)

// Estado local
const hasChanges = ref(false)
const searchVisible = ref(false)
const showVariableDialog = ref(false)
const showTemplateDialog = ref(false)
const showSettings = ref(false)
const templateTab = ref('snippets')

// Búsqueda y reemplazo
const searchQuery = ref('')
const replaceQuery = ref('')
const searchOptions = reactive({
  caseSensitive: false,
  wholeWord: false,
  regex: false
})

// Información del cursor y selección
const cursorPosition = ref(null)
const selectionInfo = ref('')

// Configuración del editor
const fontSize = ref(props.fontSize)
const theme = ref(props.theme)
const showMinimap = ref(props.showMinimap)

const editorSettings = reactive({
  wordWrap: true,
  lineNumbers: true,
  minimap: true,
  bracketMatching: true,
  autoIndent: true,
  tabSize: 2
})

// Opciones de fuente y tema
const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24]
const themes = [
  { label: 'Oscuro', value: 'vs-dark' },
  { label: 'Claro', value: 'vs' },
  { label: 'Alto Contraste', value: 'hc-black' }
]

// Templates predefinidos
const templateSnippets = ref([
  {
    id: 1,
    name: 'Variable Simple',
    description: 'Insertar una variable básica',
    preview: '{{nombre}}',
    content: '{{variable}}'
  },
  {
    id: 2,
    name: 'Condicional',
    description: 'Bloque condicional',
    preview: '{if:condicion}...{/if}',
    content: '{if:condicion}\n  Contenido si es verdadero\n{/if}'
  },
  {
    id: 3,
    name: 'Bucle',
    description: 'Repetir contenido',
    preview: '{for:lista}...{/for}',
    content: '{for:lista}\n  {{item}}\n{/for}'
  },
  {
    id: 4,
    name: 'Fecha Formateada',
    description: 'Fecha con formato específico',
    preview: '{fecha|DD/MM/YYYY}',
    content: '{{fecha|DD/MM/YYYY}}'
  }
])

const templateLayouts = ref([
  {
    id: 1,
    name: 'Carta Formal',
    description: 'Layout para correspondencia formal',
    content: `# {{empresa}}

**Fecha:** {{fecha}}

Estimado/a {{destinatario}},

{{contenido}}

Atentamente,
{{remitente}}
{{cargo}}`
  },
  {
    id: 2,
    name: 'Reporte',
    description: 'Estructura básica de reporte',
    content: `# Reporte: {{titulo}}

**Fecha:** {{fecha}}
**Autor:** {{autor}}

## Resumen Ejecutivo

{{resumen}}

## Contenido

{{contenido}}

## Conclusiones

{{conclusiones}}`
  }
])

const templateExamples = ref([
  {
    id: 1,
    name: 'Email Marketing',
    description: 'Plantilla para email promocional',
    content: `# ¡Hola {{nombre}}!

Tenemos una oferta especial para ti.

**Descuento:** {{descuento}}%
**Válido hasta:** {{fecha_limite}}

{{mensaje_promocional}}

[Ver Ofertas]({{enlace}})

Gracias,
El equipo de {{empresa}}`
  }
])

// Computed properties
const editorClasses = computed(() => ({
  'loading': props.loading,
  [`theme-${theme.value}`]: true
}))

const wordCount = computed(() => {
  if (!props.modelValue) return 0
  return props.modelValue.trim().split(/\s+/).filter(word => word.length > 0).length
})

const charCount = computed(() => {
  return props.modelValue.length
})

const canUndo = computed(() => {
  return editor.value?.getModel()?.canUndo() || false
})

const canRedo = computed(() => {
  return editor.value?.getModel()?.canRedo() || false
})

// Métodos
const initializeEditor = async () => {
  if (!editorElement.value) return

  try {
    // Configurar Monaco Editor
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#64748b'
      }
    })

    // Crear el editor
    editor.value = monaco.editor.create(editorElement.value, {
      value: props.modelValue,
      language: 'markdown',
      theme: theme.value,
      fontSize: fontSize.value,
      minimap: { enabled: showMinimap.value },
      wordWrap: editorSettings.wordWrap ? 'on' : 'off',
      lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
      bracketMatching: editorSettings.bracketMatching ? 'always' : 'never',
      autoIndent: editorSettings.autoIndent ? 'full' : 'none',
      tabSize: editorSettings.tabSize,
      insertSpaces: true,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
      smoothScrolling: true,
      mouseWheelScrollSensitivity: 2
    })

    // Configurar eventos
    setupEditorEvents()
    
    // Configurar autocompletado de variables
    setupVariableCompletion()
    
    // Configurar validación
    setupValidation()

  } catch (error) {
    console.error('Error inicializando editor:', error)
    emit('validation-error', [{ message: 'Error al inicializar el editor' }])
  }
}

const setupEditorEvents = () => {
  if (!editor.value) return

  // Cambios de contenido
  editor.value.onDidChangeModelContent(() => {
    const value = editor.value.getValue()
    hasChanges.value = value !== props.modelValue
    emit('update:modelValue', value)
    emit('content-changed', value)
    validateContent(value)
  })

  // Cambios de cursor
  editor.value.onDidChangeCursorPosition((e) => {
    cursorPosition.value = e.position
    emit('cursor-changed', e.position)
    updateSelectionInfo()
  })

  // Cambios de selección
  editor.value.onDidChangeCursorSelection(() => {
    updateSelectionInfo()
  })
}

const setupVariableCompletion = () => {
  if (!editor.value) return

  monaco.languages.registerCompletionItemProvider('markdown', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions = props.variables.map(variable => ({
        label: variable.name,
        kind: monaco.languages.CompletionItemKind.Variable,
        documentation: variable.description || 'Variable del template',
        insertText: `{{${variable.name}}}`,
        range: range,
        detail: `${getTypeLabel(variable.type)} - ${variable.value || 'Sin valor'}`
      }))

      return { suggestions }
    }
  })
}

const setupValidation = () => {
  if (!editor.value) return

  // Validar sintaxis de variables
  const validateContent = (content) => {
    const errors = []
    const variableRegex = /\{\{([^}]+)\}\}/g
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      const varName = match[1].trim()
      const variable = props.variables.find(v => v.name === varName)
      
      if (!variable) {
        const lineNumber = getLineNumberFromIndex(content, match.index)
        errors.push({
          message: `Variable '${varName}' no está definida`,
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: match[0].length
        })
      }
    }

    // Aplicar marcadores de error
    monaco.editor.setModelMarkers(editor.value.getModel(), 'variables', errors)
    emit('validation-error', errors)
  }
}

const getLineNumberFromIndex = (text, index) => {
  return text.substring(0, index).split('\n').length
}

const updateSelectionInfo = () => {
  if (!editor.value) return

  const selection = editor.value.getSelection()
  if (selection.isEmpty()) {
    selectionInfo.value = ''
  } else {
    const selectedText = editor.value.getModel().getValueInRange(selection)
    selectionInfo.value = `${selectedText.length} caracteres`
  }
}

const isVariableUsed = (variable) => {
  return props.modelValue.includes(`{{${variable.name}}}`)
}

const getTypeLabel = (type) => {
  const types = {
    text: 'Texto',
    number: 'Número',
    date: 'Fecha',
    email: 'Email',
    phone: 'Teléfono',
    url: 'URL',
    boolean: 'Booleano',
    select: 'Selección',
    array: 'Lista'
  }
  return types[type] || type
}

const getVariableIcon = (type) => {
  const icons = {
    text: 'text_fields',
    number: 'numbers',
    date: 'calendar_today',
    email: 'email',
    phone: 'phone',
    url: 'link',
    boolean: 'toggle_on',
    select: 'list',
    array: 'view_list'
  }
  return icons[type] || 'code'
}

const getVariableColor = (type) => {
  const colors = {
    text: 'blue',
    number: 'green',
    date: 'purple',
    email: 'orange',
    phone: 'teal',
    url: 'indigo',
    boolean: 'pink',
    select: 'amber',
    array: 'cyan'
  }
  return colors[type] || 'grey'
}

// Acciones del editor
const undo = () => {
  editor.value?.trigger('keyboard', 'undo', null)
}

const redo = () => {
  editor.value?.trigger('keyboard', 'redo', null)
}

const changeFontSize = (size) => {
  fontSize.value = size
  editor.value?.updateOptions({ fontSize: size })
}

const changeTheme = (newTheme) => {
  theme.value = newTheme
  monaco.editor.setTheme(newTheme)
}

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
  editor.value?.updateOptions({ 
    minimap: { enabled: showMinimap.value } 
  })
}

const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
  if (searchVisible.value) {
    nextTick(() => {
      // Focus en el input de búsqueda
    })
  }
}

const findNext = () => {
  if (!editor.value || !searchQuery.value) return
  
  editor.value.getAction('actions.find').run()
}

const findPrevious = () => {
  if (!editor.value || !searchQuery.value) return
  
  editor.value.getAction('actions.findPrevious').run()
}

const replaceNext = () => {
  if (!editor.value || !searchQuery.value) return
  
  editor.value.getAction('editor.action.replaceOne').run()
}

const replaceAll = () => {
  if (!editor.value || !searchQuery.value) return
  
  editor.value.getAction('editor.action.replaceAll').run()
}

const formatDocument = () => {
  editor.value?.getAction('editor.action.formatDocument').run()
}

const insertVariable = () => {
  showVariableDialog.value = true
}

const insertTemplate = () => {
  showTemplateDialog.value = true
}

const insertVariableAtCursor = (variable) => {
  if (!editor.value) return

  const position = editor.value.getPosition()
  const variableText = `{{${variable.name}}}`
  
  editor.value.executeEdits('insert-variable', [{
    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
    text: variableText
  }])
  
  editor.value.focus()
}

const insertSelectedVariable = (variable) => {
  insertVariableAtCursor(variable)
  showVariableDialog.value = false
}

const insertTemplateSnippet = (snippet) => {
  if (!editor.value) return

  const position = editor.value.getPosition()
  
  editor.value.executeEdits('insert-snippet', [{
    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
    text: snippet.content
  }])
  
  showTemplateDialog.value = false
  editor.value.focus()
}

const insertTemplateLayout = (layout) => {
  insertTemplateSnippet(layout)
}

const insertTemplateExample = (example) => {
  insertTemplateSnippet(example)
}

const updateEditorOptions = () => {
  if (!editor.value) return

  editor.value.updateOptions({
    wordWrap: editorSettings.wordWrap ? 'on' : 'off',
    lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
    minimap: { enabled: editorSettings.minimap },
    bracketMatching: editorSettings.bracketMatching ? 'always' : 'never',
    autoIndent: editorSettings.autoIndent ? 'full' : 'none',
    tabSize: editorSettings.tabSize
  })
}

const resetEditorSettings = () => {
  Object.assign(editorSettings, {
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
    bracketMatching: true,
    autoIndent: true,
    tabSize: 2
  })
  updateEditorOptions()
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getValue() !== newValue) {
    editor.value.setValue(newValue)
    hasChanges.value = false
  }
})

watch(() => props.variables, () => {
  // Revalidar cuando cambien las variables
  if (editor.value) {
    const content = editor.value.getValue()
    validateContent(content)
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await nextTick()
  initializeEditor()
})

onUnmounted(() => {
  if (editor.value) {
    editor.value.dispose()
  }
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

.variables-toolbar {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;

  .toolbar-label {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .variables-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .variable-chip {
      font-size: 0.8rem;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

.editor-container {
  flex: 1;
  position: relative;
  overflow: hidden;

  .monaco-editor {
    height: 100%;
  }

  &.loading {
    .monaco-editor {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .editor-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;

    p {
      margin-top: 1rem;
      color: #64748b;
    }
  }
}

.search-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 350px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin: 1rem;

  .search-content {
    padding: 1rem;
    position: relative;

    .search-input, .replace-input {
      margin-bottom: 0.5rem;
    }

    .search-options {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .close-search {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }
  }
}

.editor-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.8rem;
  color: #64748b;

  .status-left, .status-right {
    display: flex;
    gap: 1rem;
  }
}

.variable-list {
  max-height: 300px;
  overflow-y: auto;

  .variable-item {
    border-radius: 4px;
    margin-bottom: 0.25rem;

    &:hover {
      background: #f1f5f9;
    }
  }
}

.no-variables {
  text-align: center;
  padding: 2rem;
  color: #64748b;

  .q-icon {
    margin-bottom: 1rem;
  }
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;

  .template-card {
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .snippet-name {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .snippet-desc {
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .snippet-preview {
      background: #f1f5f9;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.settings-grid {
  display: grid;
  gap: 1rem;
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

    .variables-chips {
      justify-content: center;
    }
  }

  .search-panel {
    width: calc(100vw - 2rem);
    margin: 0.5rem;
  }

  .editor-status {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .template-grid {
    grid-template-columns: 1fr;
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
    background: #0f172a;
    border-bottom-color: #334155;

    .toolbar-label {
      color: #94a3b8;
    }
  }

  .search-panel {
    background: #1e293b;
    border-color: #334155;
  }

  .editor-status {
    background: #0f172a;
    border-top-color: #334155;
    color: #94a3b8;
  }
}
</style>