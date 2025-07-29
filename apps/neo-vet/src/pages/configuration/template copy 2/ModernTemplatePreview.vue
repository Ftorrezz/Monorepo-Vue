<template>
  <div class="template-preview">
    <!-- Header del preview -->
    <div class="preview-header">
      <div class="header-left">
        <q-icon name="preview" size="sm" class="text-primary" />
        <span class="preview-title">Vista Previa</span>
        
        <q-chip 
          :color="loading ? 'orange' : 'green'" 
          text-color="white" 
          size="sm"
          :icon="loading ? 'hourglass_empty' : 'check_circle'"
        >
          {{ loading ? 'Procesando...' : 'Actualizado' }}
        </q-chip>
      </div>

      <div class="header-actions">
        <q-btn-group>
          <q-btn
            flat
            dense
            icon="refresh"
            @click="refreshPreview"
            :loading="loading"
            size="sm"
          >
            <q-tooltip>Actualizar Preview</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            icon="zoom_in"
            @click="zoomIn"
            size="sm"
          >
            <q-tooltip>Acercar</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            icon="zoom_out"
            @click="zoomOut"
            size="sm"
          >
            <q-tooltip>Alejar</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            icon="fit_screen"
            @click="resetZoom"
            size="sm"
          >
            <q-tooltip>Ajustar</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-separator vertical class="q-mx-sm" />

        <q-btn-group>
          <q-btn
            flat
            dense
            :icon="viewMode === 'rendered' ? 'code' : 'preview'"
            @click="toggleViewMode"
            size="sm"
          >
            <q-tooltip>{{ viewMode === 'rendered' ? 'Ver Código HTML' : 'Ver Renderizado' }}</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            icon="print"
            @click="printPreview"
            size="sm"
          >
            <q-tooltip>Imprimir</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            dense
            icon="download"
            size="sm"
          >
            <q-tooltip>Exportar</q-tooltip>
            <q-menu>
              <q-list>
                <q-item clickable @click="exportAs('pdf')">
                  <q-item-section avatar>
                    <q-icon name="picture_as_pdf" color="red" />
                  </q-item-section>
                  <q-item-section>PDF</q-item-section>
                </q-item>
                
                <q-item clickable @click="exportAs('docx')">
                  <q-item-section avatar>
                    <q-icon name="description" color="blue" />
                  </q-item-section>
                  <q-item-section>Word (DOCX)</q-item-section>
                </q-item>
                
                <q-item clickable @click="exportAs('html')">
                  <q-item-section avatar>
                    <q-icon name="code" color="orange" />
                  </q-item-section>
                  <q-item-section>HTML</q-item-section>
                </q-item>
                
                <q-item clickable @click="exportAs('txt')">
                  <q-item-section avatar>
                    <q-icon name="text_snippet" color="grey" />
                  </q-item-section>
                  <q-item-section>Texto Plano</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-btn-group>

        <q-separator vertical class="q-mx-sm" />

        <q-btn
          flat
          dense
          icon="more_vert"
          size="sm"
        >
          <q-tooltip>Más opciones</q-tooltip>
          <q-menu>
            <q-list>
              <q-item clickable @click="copyToClipboard">
                <q-item-section avatar>
                  <q-icon name="content_copy" />
                </q-item-section>
                <q-item-section>Copiar Contenido</q-item-section>
              </q-item>
              
              <q-item clickable @click="sharePreview">
                <q-item-section avatar>
                  <q-icon name="share" />
                </q-item-section>
                <q-item-section>Compartir</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable @click="showPreviewSettings = true">
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

    <!-- Contenido del preview -->
    <div class="preview-content" :style="{ zoom: zoomLevel }">
      <!-- Loading overlay -->
      <div v-if="loading" class="preview-loading">
        <q-spinner-dots size="lg" color="primary" />
        <p>Procesando template...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="preview-error">
        <q-icon name="error" size="lg" color="negative" />
        <h6>Error al procesar el template</h6>
        <p>{{ error }}</p>
        <q-btn 
          color="primary" 
          icon="refresh" 
          label="Reintentar"
          @click="refreshPreview"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="!processedContent" class="preview-empty">
        <q-icon name="preview" size="lg" class="text-grey-5" />
        <h6 class="text-grey-6">Vista previa vacía</h6>
        <p class="text-grey-5">Escribe algo en el editor para ver el resultado aquí</p>
      </div>

      <!-- Preview modes -->
      <div v-else class="preview-body">
        <!-- Rendered view -->
        <div 
          v-if="viewMode === 'rendered'" 
          class="rendered-content"
          :class="previewTheme"
          v-html="renderedHtml"
        ></div>

        <!-- Code view (HTML source) -->
        <div v-else class="code-content">
          <pre><code>{{ formatHtml(processedContent) }}</code></pre>
        </div>
      </div>
    </div>

    <!-- Footer con información -->
    <div class="preview-footer">
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
          <q-icon name="schedule" size="xs" />
          {{ lastUpdated }}
        </span>
      </div>

      <div class="footer-actions">
        <q-btn
          flat
          dense
          size="sm"
          :icon="autoRefresh ? 'pause' : 'play_arrow'"
          @click="toggleAutoRefresh"
          :color="autoRefresh ? 'orange' : 'green'"
        >
          <q-tooltip>{{ autoRefresh ? 'Pausar' : 'Activar' }} Auto-actualización</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Dialog de configuración del preview -->
    <q-dialog v-model="showPreviewSettings" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="settings" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Configuración de Vista Previa</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showPreviewSettings = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="settings-grid">
            <q-select
              v-model="previewTheme"
              :options="themeOptions"
              label="Tema del Preview"
              emit-value
              map-options
            />

            <q-toggle 
              v-model="autoRefresh" 
              label="Auto-actualización"
            />

            <q-slider
              v-model="refreshDelay"
              :min="500"
              :max="5000"
              :step="250"
              label
              label-always
              :disable="!autoRefresh"
            >
              <template v-slot:prepend>
                <span class="text-caption">Delay</span>
              </template>
              <template v-slot:append>
                <span class="text-caption">{{ refreshDelay }}ms</span>
              </template>
            </q-slider>

            <q-toggle 
              v-model="showLineNumbers" 
              label="Mostrar números de línea (vista código)"
            />

            <q-toggle 
              v-model="highlightVariables" 
              label="Resaltar variables no resueltas"
            />

            <q-toggle 
              v-model="sanitizeHtml" 
              label="Sanitizar HTML (seguridad)"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cerrar" flat @click="showPreviewSettings = false" />
          <q-btn label="Restablecer" color="secondary" @click="resetPreviewSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para compartir -->
    <q-dialog v-model="showShareDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="share" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Compartir Preview</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showShareDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="shareUrl"
            label="URL para compartir"
            readonly
            outlined
          >
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                icon="content_copy"
                @click="copyShareUrl"
              />
            </template>
          </q-input>

          <div class="share-options q-mt-md">
            <q-btn
              color="blue"
              icon="email"
              label="Email"
              @click="shareViaEmail"
              class="q-mr-sm q-mb-sm"
            />
            <q-btn
              color="green"
              icon="message"
              label="WhatsApp"
              @click="shareViaWhatsApp"
              class="q-mr-sm q-mb-sm"
            />
            <q-btn
              color="blue-9"
              icon="facebook"
              label="Facebook"
              @click="shareViaFacebook"
              class="q-mr-sm q-mb-sm"
            />
            <q-btn
              color="light-blue"
              icon="link"
              label="Twitter"
              @click="shareViaTwitter"
              class="q-mr-sm q-mb-sm"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  content: {
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
  }
})

// Emits
const emit = defineEmits([
  'export-requested',
  'print-requested'
])

// Composables
const $q = useQuasar()

// Estado local
const processedContent = ref('')
const renderedHtml = ref('')
const error = ref('')
const viewMode = ref('rendered') // 'rendered' | 'code'
const zoomLevel = ref(1)
const lastUpdated = ref('')
const showPreviewSettings = ref(false)
const showShareDialog = ref(false)
const shareUrl = ref('')

// Configuración del preview
const previewSettings = reactive({
  theme: 'light',
  autoRefresh: true,
  refreshDelay: 1000,
  showLineNumbers: true,
  highlightVariables: true,
  sanitizeHtml: false
})

// Alias para acceso directo
const previewTheme = computed({
  get: () => previewSettings.theme,
  set: (value) => previewSettings.theme = value
})

const autoRefresh = computed({
  get: () => previewSettings.autoRefresh,
  set: (value) => previewSettings.autoRefresh = value
})

const refreshDelay = computed({
  get: () => previewSettings.refreshDelay,
  set: (value) => previewSettings.refreshDelay = value
})

const showLineNumbers = computed({
  get: () => previewSettings.showLineNumbers,
  set: (value) => previewSettings.showLineNumbers = value
})

const highlightVariables = computed({
  get: () => previewSettings.highlightVariables,
  set: (value) => previewSettings.highlightVariables = value
})

const sanitizeHtml = computed({
  get: () => previewSettings.sanitizeHtml,
  set: (value) => previewSettings.sanitizeHtml = value
})

// Opciones de tema
const themeOptions = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Sepia', value: 'sepia' },
  { label: 'Alto Contraste', value: 'high-contrast' }
]

// Auto-refresh timer
let refreshTimer = null

// Computed properties
const wordCount = computed(() => {
  if (!processedContent.value) return 0
  // Extraer texto plano del HTML para contar palabras
  const textContent = processedContent.value.replace(/<[^>]*>/g, '')
  return textContent.trim().split(/\s+/).filter(word => word.length > 0).length
})

const charCount = computed(() => {
  // Contar caracteres del HTML
  return processedContent.value.length
})

// Métodos principales
const processTemplate = async () => {
  try {
    error.value = ''
    let content = props.content

    // El contenido ya viene como HTML del QEditor, no necesitamos marked
    
    // Procesar variables
    props.variables.forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g')
      content = content.replace(regex, variable.value || '')
    })

    // Procesar condicionales {if:variable}...{/if}
    const conditionalRegex = /\{if:([^}]+)\}([\s\S]*?)\{\/if\}/g
    content = content.replace(conditionalRegex, (match, varName, condContent) => {
      const variable = props.variables.find(v => v.name === varName)
      if (variable && variable.value) {
        return condContent
      }
      return ''
    })

    // Procesar bucles {for:variable}...{/for}
    const loopRegex = /\{for:([^}]+)\}([\s\S]*?)\{\/for\}/g
    content = content.replace(loopRegex, (match, varName, template) => {
      const variable = props.variables.find(v => v.name === varName)
      if (variable && Array.isArray(variable.value)) {
        return variable.value.map(item => {
          let itemContent = template
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              const itemRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
              itemContent = itemContent.replace(itemRegex, value)
            })
          }
          return itemContent
        }).join('')
      }
      return ''
    })

    processedContent.value = content

    // Ya no necesitamos marked - el contenido del QEditor ya es HTML
    renderedHtml.value = content

    // Sanitizar HTML si está habilitado
    if (previewSettings.sanitizeHtml) {
      renderedHtml.value = sanitizeHtmlContent(content)
    }

    // Resaltar variables si está habilitado
    if (previewSettings.highlightVariables) {
      highlightUnresolvedVariables()
    }

    lastUpdated.value = new Date().toLocaleTimeString()

  } catch (err) {
    error.value = err.message
    console.error('Error procesando template:', err)
  }
}

const sanitizeHtmlContent = (html) => {
  // Función básica de sanitización - en producción usar DOMPurify
  const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br', 'div', 'span', 'blockquote', 'code', 'pre', 'table', 'tr', 'td', 'th', 'thead', 'tbody']
  
  // Esta es una implementación básica - considera usar DOMPurify en producción
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
  
  const elementsToRemove = []
  let node = walker.nextNode()
  
  while (node) {
    if (!allowedTags.includes(node.tagName.toLowerCase())) {
      elementsToRemove.push(node)
    }
    node = walker.nextNode()
  }
  
  elementsToRemove.forEach(el => {
    if (el.parentNode) {
      while (el.firstChild) {
        el.parentNode.insertBefore(el.firstChild, el)
      }
      el.parentNode.removeChild(el)
    }
  })
  
  return doc.body.innerHTML
}

const highlightUnresolvedVariables = () => {
  if (!renderedHtml.value) return

  // Buscar variables no resueltas {{variable}}
  const unresolvedRegex = /\{\{([^}]+)\}\}/g
  renderedHtml.value = renderedHtml.value.replace(unresolvedRegex, 
    '<span class="unresolved-variable">${{$1}}</span>'
  )
}

const formatHtml = (html) => {
  // Formatear HTML para vista de código con indentación básica
  if (!html) return ''
  
  let formatted = html
  let indent = 0
  const tab = '  '
  
  formatted = formatted.replace(/></g, '>\n<')
  
  const lines = formatted.split('\n')
  const result = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return
    
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1)
    }
    
    result.push(tab.repeat(indent) + trimmed)
    
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indent++
    }
  })
  
  return result.join('\n')
}

const refreshPreview = () => {
  processTemplate()
}

// Métodos de zoom
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.5)
}

const resetZoom = () => {
  zoomLevel.value = 1
}

// Métodos de vista
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'rendered' ? 'code' : 'rendered'
}

// Métodos de exportación
const exportAs = (format) => {
  emit('export-requested', format)
}

const printPreview = () => {
  emit('print-requested')
  
  // También permitir impresión directa del preview
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>Vista Previa - Template</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2cm; line-height: 1.6; }
          .unresolved-variable { 
            background: #ffeb3b; 
            padding: 2px 4px; 
            border-radius: 2px; 
          }
          h1, h2, h3, h4, h5, h6 { color: #333; margin: 1em 0 0.5em 0; }
          p { margin: 0 0 1em 0; }
          ul, ol { margin: 0 0 1em 2em; }
          blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; }
          table { border-collapse: collapse; width: 100%; margin: 1em 0; }
          th, td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        ${renderedHtml.value}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// Métodos de utilidad
const copyToClipboard = async () => {
  try {
    // Copiar el HTML procesado
    await navigator.clipboard.writeText(processedContent.value)
    $q.notify({
      message: 'Contenido copiado al portapapeles',
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

const sharePreview = () => {
  // Generar URL temporal o usar servicio de compartir
  shareUrl.value = `${window.location.origin}/preview/${Date.now()}`
  showShareDialog.value = true
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    $q.notify({
      message: 'URL copiada al portapapeles',
      color: 'positive',
      icon: 'content_copy'
    })
  } catch (error) {
    $q.notify({
      message: 'Error al copiar URL',
      color: 'negative',
      icon: 'error'
    })
  }
}

const shareViaEmail = () => {
  const subject = encodeURIComponent('Vista Previa del Template')
  const body = encodeURIComponent(`Echa un vistazo a este template: ${shareUrl.value}`)
  window.open(`mailto:?subject=${subject}&body=${body}`)
}

const shareViaWhatsApp = () => {
  const text = encodeURIComponent(`Vista Previa del Template: ${shareUrl.value}`)
  window.open(`https://wa.me/?text=${text}`)
}

const shareViaFacebook = () => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`)
}

const shareViaTwitter = () => {
  const text = encodeURIComponent('Vista Previa del Template')
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl.value)}`)
}

// Auto-refresh
const setupAutoRefresh = () => {
  if (previewSettings.autoRefresh && !refreshTimer) {
    refreshTimer = setInterval(() => {
      processTemplate()
    }, previewSettings.refreshDelay)
  } else if (!previewSettings.autoRefresh && refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const toggleAutoRefresh = () => {
  previewSettings.autoRefresh = !previewSettings.autoRefresh
  setupAutoRefresh()
}

// Configuración
const resetPreviewSettings = () => {
  Object.assign(previewSettings, {
    theme: 'light',
    autoRefresh: true,
    refreshDelay: 1000,
    showLineNumbers: true,
    highlightVariables: true,
    sanitizeHtml: false
  })
}

// Watchers
watch([() => props.content, () => props.variables], () => {
  if (previewSettings.autoRefresh) {
    // Debounce para evitar demasiadas actualizaciones
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      processTemplate()
    }, previewSettings.refreshDelay)
  }
}, { deep: true })

watch(() => previewSettings.autoRefresh, setupAutoRefresh)
watch(() => previewSettings.refreshDelay, setupAutoRefresh)

// Lifecycle
onMounted(() => {
  processTemplate()
  setupAutoRefresh()
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style lang="scss" scoped>
.template-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
}

.preview-header {
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

    .preview-title {
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

.preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
  background: white;
  transition: zoom 0.2s ease;

  .preview-loading, .preview-error, .preview-empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
    color: #64748b;

    .q-icon {
      margin-bottom: 1rem;
    }

    h6 {
      margin: 0.5rem 0;
      color: #334155;
    }

    p {
      margin: 0;
      max-width: 300px;
    }
  }

  .preview-error {
    color: #dc2626;

    .q-icon {
      color: #dc2626;
    }
  }

  .preview-body {
    height: 100%;

    .rendered-content {
      padding: 2rem;
      line-height: 1.6;
      
      &.light {
        background: #ffffff;
        color: #1f2937;
      }

      &.dark {
        background: #1f2937;
        color: #f9fafb;
      }

      &.sepia {
        background: #f7f3e9;
        color: #5c4a3a;
      }

      &.high-contrast {
        background: #000000;
        color: #ffffff;
        
        :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
          color: #ffff00;
        }
      }

      // Estilos para el contenido del QEditor
      :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.2;
      }

      :deep(p) {
        margin-bottom: 1em;
      }

      :deep(ul), :deep(ol) {
        margin-bottom: 1em;
        padding-left: 2em;
      }

      :deep(li) {
        margin-bottom: 0.25em;
      }

      :deep(blockquote) {
        border-left: 4px solid #e5e7eb;
        padding-left: 1rem;
        margin: 1rem 0;
        font-style: italic;
        color: #6b7280;
      }

      :deep(strong) {
        font-weight: 600;
      }

      :deep(em) {
        font-style: italic;
      }

      :deep(u) {
        text-decoration: underline;
      }

      :deep(code) {
        background: #f3f4f6;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-size: 0.9em;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }

      :deep(pre) {
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

      :deep(table) {
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

      :deep(a) {
        color: #3b82f6;
        text-decoration: underline;

        &:hover {
          color: #1d4ed8;
        }
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }

      :deep(hr) {
        border: none;
        height: 1px;
        background: #e5e7eb;
        margin: 2rem 0;
      }

      :deep(.unresolved-variable) {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        color: #92400e;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.9em;
        font-weight: 500;
      }

      // Estilos específicos para listas del QEditor
      :deep(.ql-indent-1) { padding-left: 3em; }
      :deep(.ql-indent-2) { padding-left: 6em; }
      :deep(.ql-indent-3) { padding-left: 9em; }
      :deep(.ql-indent-4) { padding-left: 12em; }
      :deep(.ql-indent-5) { padding-left: 15em; }
      :deep(.ql-indent-6) { padding-left: 18em; }
      :deep(.ql-indent-7) { padding-left: 21em; }
      :deep(.ql-indent-8) { padding-left: 24em; }

      // Alineación de texto del QEditor
      :deep(.ql-align-center) { text-align: center; }
      :deep(.ql-align-right) { text-align: right; }
      :deep(.ql-align-justify) { text-align: justify; }

      // Colores del QEditor
      :deep(.ql-color-red) { color: #dc2626; }
      :deep(.ql-color-orange) { color: #ea580c; }
      :deep(.ql-color-yellow) { color: #ca8a04; }
      :deep(.ql-color-green) { color: #16a34a; }
      :deep(.ql-color-blue) { color: #2563eb; }
      :deep(.ql-color-purple) { color: #9333ea; }

      // Fondos del QEditor
      :deep(.ql-bg-red) { background-color: #fef2f2; }
      :deep(.ql-bg-orange) { background-color: #fff7ed; }
      :deep(.ql-bg-yellow) { background-color: #fefce8; }
      :deep(.ql-bg-green) { background-color: #f0fdf4; }
      :deep(.ql-bg-blue) { background-color: #eff6ff; }
      :deep(.ql-bg-purple) { background-color: #faf5ff; }

      // Tamaños de fuente del QEditor
      :deep(.ql-size-small) { font-size: 0.75em; }
      :deep(.ql-size-large) { font-size: 1.5em; }
      :deep(.ql-size-huge) { font-size: 2.5em; }

      // Familias de fuente del QEditor
      :deep(.ql-font-serif) { font-family: Georgia, Times, serif; }
      :deep(.ql-font-monospace) { font-family: Monaco, Consolas, 'Lucida Console', monospace; }
    }

    .code-content {
      height: 100%;
      overflow: auto;

      pre {
        margin: 0;
        padding: 2rem;
        height: 100%;
        background: #f8fafc;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
        line-height: 1.5;
        color: #334155;
        white-space: pre-wrap;
        word-wrap: break-word;

        code {
          background: none;
          padding: 0;
        }
      }
    }
  }
}

.preview-footer {
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

.share-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

// Responsive
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;

    .header-left, .header-actions {
      justify-content: center;
    }
  }

  .preview-content {
    .rendered-content {
      padding: 1rem;
      font-size: 0.9rem;
    }

    .code-content pre {
      padding: 1rem;
      font-size: 0.8rem;
    }
  }

  .preview-footer {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;

    .footer-stats {
      justify-content: center;
    }
  }
}

// Print styles
@media print {
  .template-preview {
    .preview-header, .preview-footer {
      display: none;
    }

    .preview-content {
      .rendered-content {
        padding: 0;
        background: white !important;
        color: black !important;

        :deep(.unresolved-variable) {
          background: #ffeb3b !important;
          color: #000 !important;
          border: 1px solid #ccc !important;
        }
      }
    }
  }
}

// Dark theme
.body--dark {
  .template-preview {
    background: #1e293b;
    border-left-color: #334155;
  }

  .preview-header {
    background: #0f172a;
    border-bottom-color: #334155;

    .preview-title {
      color: #e2e8f0;
    }
  }

  .preview-content {
    background: #1e293b;

    .rendered-content {
      &.light {
        background: #1e293b;
        color: #e2e8f0;
      }

      :deep(table) {
        th, td {
          border-color: #475569;
        }

        th {
          background: #334155;
        }
      }

      :deep(blockquote) {
        border-left-color: #475569;
        color: #94a3b8;
      }

      :deep(code) {
        background: #334155;
        color: #e2e8f0;
      }

      :deep(pre) {
        background: #0f172a;
        color: #e2e8f0;
      }

      :deep(hr) {
        background: #475569;
      }
    }

    .code-content pre {
      background: #0f172a;
      color: #e2e8f0;
    }
  }

  .preview-footer {
    background: #0f172a;
    border-top-color: #334155;
    color: #94a3b8;
  }
}
</style>
