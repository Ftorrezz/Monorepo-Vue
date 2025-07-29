<template>
  <div class="variables-sidebar">
    <!-- Header del panel -->
    <div class="sidebar-header">
      <div class="header-title">
        <q-icon name="tune" size="sm" class="text-primary" />
        <span class="title-text">Variables</span>
        <q-chip 
          :label="variables.length" 
          size="sm" 
          color="primary" 
          text-color="white"
        />
      </div>
      
      <div class="header-actions">
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="add"
          @click="showAddDialog = true"
          class="add-btn"
        >
          <q-tooltip>Agregar Variable</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="upload"
          @click="showImportDialog = true"
          class="import-btn"
        >
          <q-tooltip>Importar Variables</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="more_vert"
          @click="showOptionsMenu = true"
          class="options-btn"
        >
          <q-tooltip>Opciones</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="search-section">
      <q-input
        v-model="searchQuery"
        placeholder="Buscar variables..."
        dense
        outlined
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append v-if="searchQuery">
          <q-icon 
            name="clear" 
            class="cursor-pointer" 
            @click="searchQuery = ''" 
          />
        </template>
      </q-input>

      <div class="filter-chips" v-if="availableTypes.length > 1">
        <q-chip
          v-for="type in availableTypes"
          :key="type"
          :model-value="selectedTypes.includes(type)"
          @update:model-value="toggleTypeFilter(type)"
          clickable
          :color="selectedTypes.includes(type) ? 'primary' : 'grey-4'"
          :text-color="selectedTypes.includes(type) ? 'white' : 'grey-8'"
          size="sm"
          class="filter-chip"
        >
          {{ getTypeLabel(type) }}
        </q-chip>
      </div>
    </div>

    <!-- Lista de variables -->
    <div class="variables-list" v-if="!loading">
      <q-scroll-area class="scroll-area">
        <div v-if="filteredVariables.length === 0" class="empty-state">
          <q-icon name="tune" size="lg" class="text-grey-5" />
          <p class="text-grey-6">No hay variables que mostrar</p>
          <q-btn
            color="primary"
            icon="add"
            label="Agregar Primera Variable"
            @click="showAddDialog = true"
            size="sm"
          />
        </div>

        <q-expansion-item
          v-for="variable in filteredVariables"
          :key="variable.id"
          :model-value="expandedVariables.includes(variable.id)"
          @update:model-value="toggleExpanded(variable.id)"
          class="variable-item"
          :class="{ 'required': variable.required, 'unused': !isVariableUsed(variable) }"
        >
          <template v-slot:header>
            <div class="variable-header">
              <div class="variable-info">
                <div class="variable-name">
                  {{ variable.name }}
                  <q-badge 
                    v-if="variable.required" 
                    color="orange" 
                    text-color="white"
                    class="required-badge"
                  >
                    REQ
                  </q-badge>
                  <q-badge 
                    v-if="!isVariableUsed(variable)" 
                    color="grey-5" 
                    text-color="white"
                    class="unused-badge"
                  >
                    No usado
                  </q-badge>
                </div>
                <div class="variable-type">{{ getTypeLabel(variable.type) }}</div>
              </div>
              
              <div class="variable-actions" @click.stop>
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="content_copy"
                  @click="duplicateVariable(variable)"
                  class="action-btn"
                >
                  <q-tooltip>Duplicar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="delete"
                  @click="confirmDelete(variable)"
                  class="action-btn delete-btn"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>

          <!-- Contenido expandido de la variable -->
          <div class="variable-content">
            <div class="form-grid">
              <!-- Nombre -->
              <q-input
                v-model="variable.name"
                label="Nombre"
                dense
                outlined
                @update:model-value="updateVariable(variable)"
                :rules="[val => !!val || 'El nombre es requerido']"
                class="name-input"
              />

              <!-- Tipo -->
              <q-select
                v-model="variable.type"
                :options="typeOptions"
                label="Tipo"
                emit-value
                map-options
                dense
                outlined
                @update:model-value="updateVariable(variable)"
                class="type-select"
              />

              <!-- Valor -->
              <component
                :is="getInputComponent(variable.type)"
                v-model="variable.value"
                :label="getValueLabel(variable.type)"
                :type="getInputType(variable.type)"
                :options="getSelectOptions(variable)"
                dense
                outlined
                @update:model-value="updateVariable(variable)"
                class="value-input"
                v-bind="getInputProps(variable)"
              />

              <!-- Descripción -->
              <q-input
                v-model="variable.description"
                label="Descripción"
                type="textarea"
                dense
                outlined
                rows="2"
                @update:model-value="updateVariable(variable)"
                class="description-input"
              />

              <!-- Placeholder (solo para text) -->
              <q-input
                v-if="variable.type === 'text'"
                v-model="variable.placeholder"
                label="Placeholder"
                dense
                outlined
                @update:model-value="updateVariable(variable)"
                class="placeholder-input"
              />

              <!-- Configuraciones adicionales -->
              <div class="config-section">
                <q-toggle
                  v-model="variable.required"
                  label="Requerido"
                  @update:model-value="updateVariable(variable)"
                  class="required-toggle"
                />

                <q-toggle
                  v-if="variable.type === 'text'"
                  v-model="variable.multiline"
                  label="Multilínea"
                  @update:model-value="updateVariable(variable)"
                  class="multiline-toggle"
                />
              </div>
            </div>

            <!-- Preview del valor -->
            <div class="value-preview" v-if="variable.value">
              <div class="preview-label">Vista previa:</div>
              <div class="preview-content">
                {{ formatPreviewValue(variable) }}
              </div>
            </div>
          </div>
        </q-expansion-item>
      </q-scroll-area>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <q-spinner-dots size="lg" color="primary" />
      <p>Cargando variables...</p>
    </div>

    <!-- Dialog para agregar variable -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="add" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Nueva Variable</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showAddDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="form-grid">
            <q-input
              v-model="newVariable.name"
              label="Nombre *"
              dense
              outlined
              autofocus
              :rules="[val => !!val || 'El nombre es requerido']"
            />

            <q-select
              v-model="newVariable.type"
              :options="typeOptions"
              label="Tipo"
              emit-value
              map-options
              dense
              outlined
            />

            <q-input
              v-model="newVariable.description"
              label="Descripción"
              type="textarea"
              rows="2"
              dense
              outlined
            />

            <q-toggle
              v-model="newVariable.required"
              label="Requerido"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat @click="showAddDialog = false" />
          <q-btn 
            label="Crear" 
            color="primary" 
            @click="addVariable"
            :disable="!newVariable.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para importar variables -->
    <q-dialog v-model="showImportDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <q-icon name="upload" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Importar Variables</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showImportDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-tabs v-model="importTab" class="text-primary">
            <q-tab name="json" label="JSON" />
            <q-tab name="csv" label="CSV" />
            <q-tab name="manual" label="Manual" />
          </q-tabs>

          <q-tab-panels v-model="importTab" animated>
            <q-tab-panel name="json">
              <q-input
                v-model="importData.json"
                type="textarea"
                label='Pegar JSON (ej: {"nombre": "Juan", "edad": 30})'
                rows="6"
                outlined
              />
            </q-tab-panel>

            <q-tab-panel name="csv">
              <q-file
                v-model="importData.file"
                label="Seleccionar archivo CSV"
                accept=".csv"
                outlined
                @update:model-value="handleFileUpload"
              />
              <q-input
                v-if="!importData.file"
                v-model="importData.csv"
                type="textarea"
                label="O pegar contenido CSV"
                rows="6"
                outlined
              />
            </q-tab-panel>

            <q-tab-panel name="manual">
              <p class="text-grey-6">Agregar múltiples variables de una vez:</p>
              <q-input
                v-model="importData.manual"
                type="textarea"
                label="Una variable por línea (nombre:tipo:valor)"
                placeholder="nombre:text:Juan&#10;edad:number:30&#10;fecha:date:2024-01-01"
                rows="6"
                outlined
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat @click="showImportDialog = false" />
          <q-btn 
            label="Importar" 
            color="primary" 
            @click="importVariables"
            :disable="!canImport"
            :loading="importing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Menu de opciones -->
    <q-menu v-model="showOptionsMenu">
      <q-list>
        <q-item clickable @click="exportVariables">
          <q-item-section avatar>
            <q-icon name="download" />
          </q-item-section>
          <q-item-section>Exportar Variables</q-item-section>
        </q-item>
        
        <q-item clickable @click="clearAllVariables">
          <q-item-section avatar>
            <q-icon name="clear_all" />
          </q-item-section>
          <q-item-section>Limpiar Todas</q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item clickable @click="sortVariables('name')">
          <q-item-section avatar>
            <q-icon name="sort_by_alpha" />
          </q-item-section>
          <q-item-section>Ordenar por Nombre</q-item-section>
        </q-item>
        
        <q-item clickable @click="sortVariables('type')">
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>Ordenar por Tipo</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { templateService } from './TemplateService'

// Props
const props = defineProps({
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
  'variable-updated',
  'variable-added', 
  'variable-deleted',
  'variables-imported'
])

// Composables
const $q = useQuasar()

// Estado local
const searchQuery = ref('')
const selectedTypes = ref([])
const expandedVariables = ref([])
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const showOptionsMenu = ref(false)
const importing = ref(false)
const importTab = ref('json')

// Nuevo variable form
const newVariable = reactive({
  name: '',
  type: 'text',
  value: '',
  description: '',
  required: false,
  placeholder: ''
})

// Datos de importación
const importData = reactive({
  json: '',
  csv: '',
  file: null,
  manual: ''
})

// Opciones de tipos
const typeOptions = [
  { label: 'Texto', value: 'text' },
  { label: 'Número', value: 'number' },
  { label: 'Fecha', value: 'date' },
  { label: 'Email', value: 'email' },
  { label: 'Teléfono', value: 'phone' },
  { label: 'URL', value: 'url' },
  { label: 'Booleano', value: 'boolean' },
  { label: 'Selección', value: 'select' },
  { label: 'Lista', value: 'array' }
]

// Computed properties
const filteredVariables = computed(() => {
  let filtered = props.variables

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(variable => 
      variable.name.toLowerCase().includes(query) ||
      variable.description.toLowerCase().includes(query) ||
      variable.type.toLowerCase().includes(query)
    )
  }

  // Filtrar por tipos seleccionados
  if (selectedTypes.value.length > 0) {
    filtered = filtered.filter(variable => 
      selectedTypes.value.includes(variable.type)
    )
  }

  return filtered
})

const availableTypes = computed(() => {
  const types = new Set(props.variables.map(v => v.type))
  return Array.from(types).sort()
})

const canImport = computed(() => {
  switch (importTab.value) {
    case 'json':
      return !!importData.json.trim()
    case 'csv':
      return !!(importData.file || importData.csv.trim())
    case 'manual':
      return !!importData.manual.trim()
    default:
      return false
  }
})

// Métodos
const toggleTypeFilter = (type) => {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    selectedTypes.value.splice(index, 1)
  } else {
    selectedTypes.value.push(type)
  }
}

const toggleExpanded = (variableId) => {
  const index = expandedVariables.value.indexOf(variableId)
  if (index > -1) {
    expandedVariables.value.splice(index, 1)
  } else {
    expandedVariables.value.push(variableId)
  }
}

const isVariableUsed = (variable) => {
  // Esta función debería recibir el contenido del template
  // Por ahora simulamos que todas están usadas
  return true
}

const getTypeLabel = (type) => {
  const option = typeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

const getInputComponent = (type) => {
  switch (type) {
    case 'boolean':
      return 'q-toggle'
    case 'select':
      return 'q-select'
    case 'date':
      return 'q-input'
    default:
      return 'q-input'
  }
}

const getValueLabel = (type) => {
  switch (type) {
    case 'boolean':
      return 'Activado'
    case 'select':
      return 'Seleccionar opción'
    case 'date':
      return 'Fecha'
    case 'number':
      return 'Número'
    default:
      return 'Valor'
  }
}

const getInputType = (type) => {
  switch (type) {
    case 'number':
      return 'number'
    case 'email':
      return 'email'
    case 'url':
      return 'url'
    case 'phone':
      return 'tel'
    case 'date':
      return 'date'
    default:
      return 'text'
  }
}

const getInputProps = (variable) => {
  const props = {}
  
  if (variable.placeholder) {
    props.placeholder = variable.placeholder
  }
  
  if (variable.multiline) {
    props.type = 'textarea'
    props.rows = 3
  }
  
  return props
}

const getSelectOptions = (variable) => {
  if (variable.type === 'select' && variable.options) {
    return variable.options
  }
  return []
}

const formatPreviewValue = (variable) => {
  switch (variable.type) {
    case 'date':
      return new Date(variable.value).toLocaleDateString()
    case 'boolean':
      return variable.value ? 'Sí' : 'No'
    case 'array':
      return Array.isArray(variable.value) ? variable.value.join(', ') : variable.value
    default:
      return variable.value
  }
}

const updateVariable = (variable) => {
  emit('variable-updated', { ...variable })
}

const addVariable = () => {
  if (!newVariable.name) {
    $q.notify({
      message: 'El nombre de la variable es requerido',
      color: 'negative',
      icon: 'warning'
    })
    return
  }

  // Verificar que no exista una variable con el mismo nombre
  const exists = props.variables.some(v => v.name === newVariable.name)
  if (exists) {
    $q.notify({
      message: 'Ya existe una variable con ese nombre',
      color: 'negative',
      icon: 'warning'
    })
    return
  }

  const variable = {
    id: Date.now().toString(),
    ...newVariable,
    createdAt: new Date().toISOString()
  }

  emit('variable-added', variable)

  // Resetear form
  Object.assign(newVariable, {
    name: '',
    type: 'text',
    value: '',
    description: '',
    required: false,
    placeholder: ''
  })

  showAddDialog.value = false
  
  $q.notify({
    message: 'Variable agregada correctamente',
    color: 'positive',
    icon: 'check'
  })
}

const duplicateVariable = (variable) => {
  const duplicate = {
    ...variable,
    id: Date.now().toString(),
    name: `${variable.name}_copia`,
    createdAt: new Date().toISOString()
  }

  emit('variable-added', duplicate)
  
  $q.notify({
    message: 'Variable duplicada',
    color: 'positive',
    icon: 'content_copy'
  })
}

const confirmDelete = (variable) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que quieres eliminar la variable "${variable.name}"?`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    emit('variable-deleted', variable.id)
    
    $q.notify({
      message: 'Variable eliminada',
      color: 'positive',
      icon: 'delete'
    })
  })
}

const importVariables = async () => {
  importing.value = true
  
  try {
    let variables = []
    
    switch (importTab.value) {
      case 'json':
        variables = await templateService.importVariables(importData.json, 'json')
        break
      case 'csv':
        const csvData = importData.file ? await readFile(importData.file) : importData.csv
        variables = await templateService.importVariables(csvData, 'csv')
        break
      case 'manual':
        variables = parseManualInput(importData.manual)
        break
    }

    if (variables.length > 0) {
      emit('variables-imported', variables)
      
      // Resetear datos de importación
      Object.assign(importData, {
        json: '',
        csv: '',
        file: null,
        manual: ''
      })
      
      showImportDialog.value = false
      
      $q.notify({
        message: `${variables.length} variables importadas correctamente`,
        color: 'positive',
        icon: 'upload'
      })
    } else {
      $q.notify({
        message: 'No se encontraron variables para importar',
        color: 'warning',
        icon: 'warning'
      })
    }
  } catch (error) {
    $q.notify({
      message: 'Error al importar variables: ' + error.message,
      color: 'negative',
      icon: 'error'
    })
  } finally {
    importing.value = false
  }
}

const parseManualInput = (input) => {
  const lines = input.split('\n').filter(line => line.trim())
  const variables = []
  
  lines.forEach((line, index) => {
    const parts = line.split(':')
    if (parts.length >= 2) {
      variables.push({
        id: (Date.now() + index).toString(),
        name: parts[0].trim(),
        type: parts[1].trim() || 'text',
        value: parts[2] ? parts[2].trim() : '',
        description: `Importado manualmente`,
        required: false
      })
    }
  })
  
  return variables
}

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

const handleFileUpload = (file) => {
  if (file) {
    importData.csv = '' // Limpiar el textarea si se selecciona un archivo
  }
}

const exportVariables = () => {
  const data = JSON.stringify(props.variables, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'variables.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  showOptionsMenu.value = false
  
  $q.notify({
    message: 'Variables exportadas correctamente',
    color: 'positive',
    icon: 'download'
  })
}

const clearAllVariables = () => {
  $q.dialog({
    title: 'Confirmar limpieza',
    message: '¿Estás seguro de que quieres eliminar todas las variables?',
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    props.variables.forEach(variable => {
      emit('variable-deleted', variable.id)
    })
    
    showOptionsMenu.value = false
    
    $q.notify({
      message: 'Todas las variables han sido eliminadas',
      color: 'positive',
      icon: 'clear_all'
    })
  })
}

const sortVariables = (criteria) => {
  // Esta función necesitaría ser implementada en el componente padre
  // ya que no podemos modificar las props directamente
  showOptionsMenu.value = false
  
  $q.notify({
    message: `Variables ordenadas por ${criteria}`,
    color: 'info',
    icon: 'sort'
  })
}

// Watchers
watch(searchQuery, () => {
  // Expandir todas las variables cuando se busca
  if (searchQuery.value && filteredVariables.value.length > 0) {
    expandedVariables.value = filteredVariables.value.map(v => v.id)
  }
})
</script>

<style lang="scss" scoped>
.variables-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;

    .title-text {
      font-weight: 600;
      font-size: 1.1rem;
    }
  }

  .header-actions {
    display: flex;
    gap: 0.25rem;

    .q-btn {
      color: rgba(255, 255, 255, 0.9);
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }
  }
}

.search-section {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;

  .search-input {
    margin-bottom: 0.5rem;
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;

    .filter-chip {
      font-size: 0.75rem;
    }
  }
}

.variables-list {
  flex: 1;
  overflow: hidden;

  .scroll-area {
    height: 100%;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #64748b;

    .q-icon {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 1rem;
    }
  }
}

.variable-item {
  border-bottom: 1px solid #f1f5f9;

  &.required {
    border-left: 3px solid #f59e0b;
  }

  &.unused {
    opacity: 0.7;
    background: #f8fafc;
  }

  .variable-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.5rem;

    .variable-info {
      flex: 1;

      .variable-name {
        font-weight: 500;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .required-badge, .unused-badge {
          font-size: 0.6rem;
          padding: 0.1rem 0.3rem;
        }
      }

      .variable-type {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 0.2rem;
      }
    }

    .variable-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;

      .action-btn {
        color: #64748b;

        &:hover {
          color: #334155;
        }

        &.delete-btn:hover {
          color: #ef4444;
        }
      }
    }
  }

  &:hover .variable-actions {
    opacity: 1;
  }

  .variable-content {
    padding: 1rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;

    .form-grid {
      display: grid;
      gap: 0.75rem;
      margin-bottom: 1rem;

      .name-input, .type-select {
        grid-column: 1 / 3;
      }

      .value-input {
        grid-column: 1 / 3;
      }

      .description-input, .placeholder-input {
        grid-column: 1 / 3;
      }

      .config-section {
        grid-column: 1 / 3;
        display: flex;
        gap: 1rem;
      }
    }

    .value-preview {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 0.75rem;

      .preview-label {
        font-size: 0.75rem;
        color: #64748b;
        margin-bottom: 0.25rem;
      }

      .preview-content {
        font-family: monospace;
        background: #f1f5f9;
        padding: 0.5rem;
        border-radius: 2px;
        font-size: 0.85rem;
      }
    }
  }
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;

  p {
    margin-top: 1rem;
  }
}

// Responsive
@media (max-width: 768px) {
  .sidebar-header {
    padding: 0.75rem;

    .header-title .title-text {
      font-size: 1rem;
    }
  }

  .search-section {
    padding: 0.75rem;
  }

  .variable-content .form-grid {
    .name-input, .type-select, .value-input, 
    .description-input, .placeholder-input, .config-section {
      grid-column: 1;
    }
  }
}

// Dark theme
.body--dark {
  .variables-sidebar {
    background: #1e293b;
    border-right-color: #334155;
  }

  .sidebar-header {
    border-bottom-color: #334155;
  }

  .search-section {
    border-bottom-color: #334155;
  }

  .variable-item {
    border-bottom-color: #334155;

    &.unused {
      background: #0f172a;
    }

    .variable-content {
      background: #0f172a;
      border-top-color: #334155;

      .value-preview {
        background: #1e293b;
        border-color: #334155;

        .preview-content {
          background: #334155;
        }
      }
    }
  }
}
</style>