// composables/useTemplateManager.js
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar'
import { templateService } from './TemplateService'

export function useTemplateManager() {
  const $q = useQuasar()

  // Estado reactivo
  const templateContent = ref('')
  const templateVariables = ref([])
  const templateMetadata = reactive({
    id: null,
    name: '',
    description: '',
    category: '',
    tags: [],
    createdAt: null,
    updatedAt: null,
    version: '1.0.0'
  })

  // Estados de loading
  const loading = ref(false)
  const saving = ref(false)
  const processing = ref(false)
  const exporting = ref(false)

  // Estado de errores
  const errors = ref([])
  const validationErrors = ref([])

  // Configuración
  const config = reactive({
    autoSave: false,
    autoSaveInterval: 30000, // 30 segundos
    maxHistoryEntries: 50,
    enableValidation: true
  })

  // Historial para undo/redo
  const history = ref([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50

  // Computed properties
  const hasUnsavedChanges = computed(() => {
    return templateMetadata.updatedAt < Date.now() - 1000
  })

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  const variableCount = computed(() => templateVariables.value.length)
  const usedVariables = computed(() => {
    const content = templateContent.value
    return templateVariables.value.filter(variable => 
      content.includes(`{{${variable.name}}}`) || 
      content.includes(`{${variable.name}}`)
    )
  })

  const unusedVariables = computed(() => {
    const used = usedVariables.value.map(v => v.id)
    return templateVariables.value.filter(v => !used.includes(v.id))
  })

  // Funciones principales
  const loadTemplate = async (templateId = null) => {
    loading.value = true
    errors.value = []

    try {
      let data
      if (templateId) {
        data = await templateService.getTemplate(templateId)
      } else {
        // Cargar template por defecto o crear uno nuevo
        data = {
          content: '# Mi Template\n\nHola {{nombre}}, este es tu template personalizado.\n\n**Fecha:** {{fecha}}\n**Empresa:** {{empresa}}',
          variables: [
            {
              id: '1',
              name: 'nombre',
              type: 'text',
              value: 'Usuario',
              description: 'Nombre del destinatario',
              required: true,
              placeholder: 'Ingresa el nombre'
            },
            {
              id: '2',
              name: 'fecha',
              type: 'date',
              value: new Date().toISOString().split('T')[0],
              description: 'Fecha del documento',
              required: true
            },
            {
              id: '3',
              name: 'empresa',
              type: 'text',
              value: 'Mi Empresa',
              description: 'Nombre de la empresa',
              required: false,
              placeholder: 'Nombre de la empresa'
            }
          ],
          metadata: {
            id: null,
            name: 'Nuevo Template',
            description: 'Template sin descripción',
            category: 'general',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
          }
        }
      }

      templateContent.value = data.content
      templateVariables.value = data.variables || []
      Object.assign(templateMetadata, data.metadata || {})

      // Agregar al historial
      addToHistory()

      $q.notify({
        message: templateId ? 'Template cargado correctamente' : 'Template inicializado',
        color: 'positive',
        icon: 'check_circle'
      })

    } catch (error) {
      errors.value.push(error.message)
      $q.notify({
        message: 'Error al cargar el template',
        color: 'negative',
        icon: 'error',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const saveTemplate = async (options = {}) => {
    saving.value = true
    errors.value = []

    try {
      // Validar antes de guardar
      if (config.enableValidation) {
        const validation = validateTemplate()
        if (!validation.isValid) {
          validationErrors.value = validation.errors
          throw new Error('El template contiene errores de validación')
        }
      }

      const templateData = {
        content: templateContent.value,
        variables: templateVariables.value,
        metadata: {
          ...templateMetadata,
          updatedAt: new Date().toISOString()
        }
      }

      const result = await templateService.saveTemplate(templateData, options)
      
      if (!templateMetadata.id) {
        templateMetadata.id = result.id
        templateMetadata.createdAt = result.createdAt
      }
      templateMetadata.updatedAt = result.updatedAt

      $q.notify({
        message: 'Template guardado correctamente',
        color: 'positive',
        icon: 'save',
        timeout: 2000
      })

      return result

    } catch (error) {
      errors.value.push(error.message)
      $q.notify({
        message: 'Error al guardar el template',
        color: 'negative',
        icon: 'error',
        caption: error.message
      })
      throw error
    } finally {
      saving.value = false
    }
  }

  const processTemplate = async (customVariables = null) => {
    processing.value = true

    try {
      const variables = customVariables || templateVariables.value
      const result = await templateService.processTemplate(
        templateContent.value,
        variables
      )

      return result

    } catch (error) {
      errors.value.push(error.message)
      $q.notify({
        message: 'Error al procesar el template',
        color: 'negative',
        icon: 'error',
        caption: error.message
      })
      throw error
    } finally {
      processing.value = false
    }
  }

  const exportTemplate = async (format = 'pdf', options = {}) => {
    exporting.value = true

    try {
      const processedContent = await processTemplate()
      const result = await templateService.exportTemplate(
        processedContent,
        format,
        {
          filename: templateMetadata.name || 'template',
          ...options
        }
      )

      // Crear enlace de descarga
      const blob = new Blob([result.data], { type: result.mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      $q.notify({
        message: `Template exportado como ${format.toUpperCase()}`,
        color: 'positive',
        icon: 'download'
      })

      return result

    } catch (error) {
      errors.value.push(error.message)
      $q.notify({
        message: 'Error al exportar el template',
        color: 'negative',
        icon: 'error',
        caption: error.message
      })
      throw error
    } finally {
      exporting.value = false
    }
  }

  // Funciones de variables
  const addVariable = (variable) => {
    const newVariable = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      value: '',
      description: '',
      required: false,
      placeholder: '',
      ...variable
    }

    templateVariables.value.push(newVariable)
    addToHistory()
    return newVariable
  }

  const updateVariable = (variableId, updates) => {
    const index = templateVariables.value.findIndex(v => v.id === variableId)
    if (index !== -1) {
      templateVariables.value[index] = {
        ...templateVariables.value[index],
        ...updates
      }
      addToHistory()
    }
  }

  const deleteVariable = (variableId) => {
    const index = templateVariables.value.findIndex(v => v.id === variableId)
    if (index !== -1) {
      templateVariables.value.splice(index, 1)
      addToHistory()
    }
  }

  const duplicateVariable = (variableId) => {
    const variable = templateVariables.value.find(v => v.id === variableId)
    if (variable) {
      const duplicate = {
        ...variable,
        id: Date.now().toString(),
        name: `${variable.name}_copy`
      }
      templateVariables.value.push(duplicate)
      addToHistory()
      return duplicate
    }
  }

  // Funciones de historial
  const addToHistory = () => {
    const state = {
      content: templateContent.value,
      variables: JSON.parse(JSON.stringify(templateVariables.value)),
      timestamp: Date.now()
    }

    // Remover entradas futuras si estamos en el medio del historial
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    history.value.push(state)
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
      const state = history.value[historyIndex.value]
      templateContent.value = state.content
      templateVariables.value = JSON.parse(JSON.stringify(state.variables))
    }
  }

  const redo = () => {
    if (canRedo.value) {
      historyIndex.value++
      const state = history.value[historyIndex.value]
      templateContent.value = state.content
      templateVariables.value = JSON.parse(JSON.stringify(state.variables))
    }
  }

  // Funciones de validación
  const validateTemplate = () => {
    const errors = []
    const warnings = []

    // Validar sintaxis de variables
    const variableRegex = /\{\{([^}]+)\}\}/g
    const matches = [...templateContent.value.matchAll(variableRegex)]
    
    matches.forEach(match => {
      const varName = match[1].trim()
      const variable = templateVariables.value.find(v => v.name === varName)
      
      if (!variable) {
        errors.push({
          type: 'undefined_variable',
          message: `Variable '${varName}' no está definida`,
          line: getLineNumber(templateContent.value, match.index)
        })
      }
    })

    // Validar variables requeridas
    templateVariables.value.forEach(variable => {
      if (variable.required && !variable.value) {
        warnings.push({
          type: 'missing_required_value',
          message: `Variable requerida '${variable.name}' no tiene valor`,
          variable: variable.name
        })
      }
    })

    // Validar variables no utilizadas
    unusedVariables.value.forEach(variable => {
      warnings.push({
        type: 'unused_variable',
        message: `Variable '${variable.name}' está definida pero no se usa`,
        variable: variable.name
      })
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const getLineNumber = (text, index) => {
    return text.substring(0, index).split('\n').length
  }

  // Funciones de utilidad
  const clearTemplate = () => {
    templateContent.value = ''
    templateVariables.value = []
    addToHistory()
  }

  const resetTemplate = async () => {
    await loadTemplate()
  }

  const duplicateTemplate = () => {
    templateMetadata.id = null
    templateMetadata.name = `${templateMetadata.name} (Copia)`
    templateMetadata.createdAt = new Date().toISOString()
    templateMetadata.updatedAt = new Date().toISOString()
  }

  // Auto-save setup
  let autoSaveInterval
  const setupAutoSave = () => {
    if (config.autoSave && !autoSaveInterval) {
      autoSaveInterval = setInterval(async () => {
        if (hasUnsavedChanges.value) {
          try {
            await saveTemplate({ silent: true })
          } catch (error) {
            console.error('Auto-save failed:', error)
          }
        }
      }, config.autoSaveInterval)
    } else if (!config.autoSave && autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  }

  const cleanup = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
    }
  }

  return {
    // Estado
    templateContent,
    templateVariables,
    templateMetadata,
    loading,
    saving,
    processing,
    exporting,
    errors,
    validationErrors,
    config,
    history,
    historyIndex,

    // Computed
    hasUnsavedChanges,
    canUndo,
    canRedo,
    variableCount,
    usedVariables,
    unusedVariables,

    // Funciones principales
    loadTemplate,
    saveTemplate,
    processTemplate,
    exportTemplate,

    // Funciones de variables
    addVariable,
    updateVariable,
    deleteVariable,
    duplicateVariable,

    // Funciones de historial
    undo,
    redo,
    addToHistory,

    // Funciones de utilidad
    validateTemplate,
    clearTemplate,
    resetTemplate,
    duplicateTemplate,
    setupAutoSave,
    cleanup
  }
}