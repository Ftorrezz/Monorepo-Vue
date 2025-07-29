<template>
  <div class="modern-variables-sidebar">
    <!-- Header del sidebar -->
    <div class="sidebar-header">
      <div class="header-title">
        <q-icon name="code" size="md" class="title-icon" />
        <div class="title-content">
          <h3>Variables del Template</h3>
          <p v-if="templateType">{{ templateType.name }}</p>
        </div>
      </div>
      
      <div class="header-actions">
        <q-btn
          flat
          dense
          round
          icon="add"
          @click="showAddVariableDialog = true"
          class="add-btn"
        >
          <q-tooltip>Agregar variable personalizada</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          icon="upload"
          @click="importVariables"
        >
          <q-tooltip>Importar variables</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          icon="more_vert"
        >
          <q-tooltip>Más opciones</q-tooltip>
          <q-menu>
            <q-list>
              <q-item clickable @click="exportVariables">
                <q-item-section avatar>
                  <q-icon name="download" />
                </q-item-section>
                <q-item-section>Exportar variables</q-item-section>
              </q-item>
              <q-item clickable @click="resetVariables">
                <q-item-section avatar>
                  <q-icon name="restore" />
                </q-item-section>
                <q-item-section>Restablecer valores</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="showVariableHelp = true">
                <q-item-section avatar>
                  <q-icon name="help" />
                </q-item-section>
                <q-item-section>Ayuda</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="sidebar-filters">
      <q-input
        v-model="searchQuery"
        placeholder="Buscar variables..."
        outlined
        dense
        clearable
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="filter-chips">
        <q-chip
          v-for="filter in filterOptions"
          :key="filter.value"
          :selected="activeFilters.includes(filter.value)"
          @click="toggleFilter(filter.value)"
          :color="filter.color"
          :text-color="activeFilters.includes(filter.value) ? 'white' : 'grey-8'"
          size="sm"
          clickable
          class="filter-chip"
        >
          <q-icon :name="filter.icon" size="xs" class="q-mr-xs" />
          {{ filter.label }}
        </q-chip>
      </div>
    </div>

    <!-- Lista de variables -->
    <div class="variables-list">
      <!-- Variables requeridas -->
      <div v-if="requiredVariables.length > 0" class="variable-group">
        <div class="group-header required-header">
          <q-icon name="star" class="group-icon" />
          <span class="group-title">Variables Requeridas</span>
          <q-chip :label="requiredVariables.length" size="xs" color="orange" />
        </div>
        
        <div class="variables-container">
          <VariableCard
            v-for="variable in requiredVariables"
            :key="variable.name"
            :variable="variable"
            :template-type="templateType"
            :is-required="true"
            @variable-updated="$emit('variable-updated', $event)"
            @variable-deleted="$emit('variable-deleted', $event)"
            @insert-requested="$emit('variable-insert-requested', $event)"
          />
        </div>
      </div>

      <!-- Variables opcionales -->
      <div v-if="optionalVariables.length > 0" class="variable-group">
        <div class="group-header optional-header">
          <q-icon name="lightbulb" class="group-icon" />
          <span class="group-title">Variables Opcionales</span>
          <q-chip :label="optionalVariables.length" size="xs" color="blue" />
        </div>
        
        <div class="variables-container">
          <VariableCard
            v-for="variable in optionalVariables"
            :key="variable.name"
            :variable="variable"
            :template-type="templateType"
            :is-required="false"
            @variable-updated="$emit('variable-updated', $event)"
            @variable-deleted="$emit('variable-deleted', $event)"
            @insert-requested="$emit('variable-insert-requested', $event)"
          />
        </div>
      </div>

      <!-- Variables personalizadas -->
      <div v-if="customVariables.length > 0" class="variable-group">
        <div class="group-header custom-header">
          <q-icon name="extension" class="group-icon" />
          <span class="group-title">Variables Personalizadas</span>
          <q-chip :label="customVariables.length" size="xs" color="purple" />
        </div>
        
        <div class="variables-container">
          <VariableCard
            v-for="variable in customVariables"
            :key="variable.name"
            :variable="variable"
            :template-type="templateType"
            :is-custom="true"
            @variable-updated="$emit('variable-updated', $event)"
            @variable-deleted="$emit('variable-deleted', $event)"
            @insert-requested="$emit('variable-insert-requested', $event)"
          />
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="filteredVariables.length === 0" class="empty-state">
        <q-icon name="code_off" size="xl" class="empty-icon" />
        <h4>No hay variables</h4>
        <p v-if="searchQuery">No se encontraron variables que coincidan con "{{ searchQuery }}"</p>
        <p v-else>Agrega variables para personalizar tu template</p>
        <q-btn
          color="primary"
          icon="add"
          label="Agregar Variable"
          @click="showAddVariableDialog = true"
          unelevated
        />
      </div>
    </div>

    <!-- Progress de completitud -->
    <div class="completion-progress" v-if="variables.length > 0">
      <div class="progress-header">
        <span class="progress-label">Progreso de completitud</span>
        <span class="progress-percentage">{{ completionPercentage }}%</span>
      </div>
      <q-linear-progress
        :value="completionPercentage / 100"
        color="green"
        track-color="grey-3"
        size="8px"
        rounded
        class="progress-bar"
      />
      <div class="progress-details">
        <span class="detail-item">
          <q-icon name="check_circle" color="green" size="xs" />
          {{ completedVariables }} completadas
        </span>
        <span class="detail-item">
          <q-icon name="radio_button_unchecked" color="grey" size="xs" />
          {{ pendingVariables }} pendientes
        </span>
      </div>
    </div>

    <!-- Dialog para agregar variable -->
    <q-dialog v-model="showAddVariableDialog" persistent>
      <q-card class="add-variable-card">
        <q-card-section class="card-header">
          <div class="header-icon">
            <q-icon name="add" size="lg" />
          </div>
          <div class="header-content">
            <h3>Nueva Variable Personalizada</h3>
            <p>Agrega una variable específica para tu template</p>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="card-content">
          <q-form @submit="addCustomVariable" class="variable-form">
            <div class="form-row">
              <q-input
                v-model="newVariable.name"
                label="Nombre de la variable"
                outlined
                :rules="[val => !!val || 'El nombre es requerido']"
                class="name-input"
              />
              
              <q-select
                v-model="newVariable.type"
                :options="variableTypes"
                label="Tipo"
                outlined
                emit-value
                map-options
                class="type-select"
              />
            </div>

            <q-input
              v-model="newVariable.label"
              label="Etiqueta (opcional)"
              outlined
              hint="Nombre descriptivo para mostrar"
            />
            
            <q-input
              v-model="newVariable.description"
              label="Descripción"
              outlined
              type="textarea"
              rows="2"
              hint="Explica para qué se usa esta variable"
            />
            
            <q-input
              v-model="newVariable.value"
              label="Valor por defecto (opcional)"
              outlined
            />

            <div class="form-options">
              <q-toggle 
                v-model="newVariable.required" 
                label="Variable requerida"
                color="orange"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="card-actions">
          <q-btn label="Cancelar" flat @click="closeAddVariableDialog" />
          <q-btn 
            label="Agregar Variable" 
            color="primary" 
            unelevated
            @click="addCustomVariable"
            :disable="!newVariable.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de ayuda -->
    <q-dialog v-model="showVariableHelp" maximized>
      <q-card class="help-card">
        <q-card-section class="help-header">
          <div class="header-icon">
            <q-icon name="help" size="lg" />
          </div>
          <div class="header-content">
            <h3>Guía de Variables</h3>
            <p>Todo lo que necesitas saber sobre las variables en templates</p>
          </div>
          <q-btn icon="close" flat round dense @click="showVariableHelp = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="help-content">
          <div class="help-sections">
            <div class="help-section">
              <h4><q-icon name="code" class="section-icon" />¿Qué son las variables?</h4>
              <p>Las variables son marcadores de posición que se reemplazan con información específica al generar el documento final. Por ejemplo, <code>{{petName}}</code> se reemplazará con el nombre real de la mascota.</p>
            </div>

            <div class="help-section">
              <h4><q-icon name="category" class="section-icon" />Tipos de variables</h4>
              <div class="variable-types-help">
                <div class="type-help-item">
                  <q-icon name="text_fields" color="blue" />
                  <div>
                    <strong>Texto:</strong> Para nombres, descripciones y contenido general
                    <code>{{ownerName}}, {{petBreed}}</code>
                  </div>
                </div>
                <div class="type-help-item">
                  <q-icon name="tag" color="green" />
                  <div>
                    <strong>Número:</strong> Para cantidades, pesos, edades
                    <code>{{petAge}}, {{weight}}</code>
                  </div>
                </div>
                <div class="type-help-item">
                  <q-icon name="event" color="orange" />
                  <div>
                    <strong>Fecha:</strong> Para fechas de nacimiento, consultas, etc.
                    <code>{{birthDate}}, {{visitDate}}</code>
                  </div>
                </div>
                <div class="type-help-item">
                  <q-icon name="list" color="purple" />
                  <div>
                    <strong>Lista:</strong> Para múltiples elementos como vacunas
                    <code>{{vaccineList}}, {{medications}}</code>
                  </div>
                </div>
              </div>
            </div>

            <div class="help-section">
              <h4><q-icon name="integration_instructions" class="section-icon" />Cómo usar las variables</h4>
              <ol class="help-steps">
                <li>
                  <strong>Completar valores:</strong> Rellena los campos de cada variable con la información correspondiente.
                </li>
                <li>
                  <strong>Insertar en el editor:</strong> Haz clic en el botón "+" junto a una variable para insertarla en el editor.
                </li>
                <li>
                  <strong>Vista previa:</strong> Las variables se reemplazarán automáticamente en la vista previa.
                </li>
                <li>
                  <strong>Variables requeridas:</strong> Asegúrate de completar todas las variables marcadas como requeridas.
                </li>
              </ol>
            </div>

            <div class="help-section">
              <h4><q-icon name="tips_and_updates" class="section-icon" />Consejos útiles</h4>
              <ul class="help-tips">
                <li>Las variables requeridas están marcadas con <q-icon name="star" color="orange" size="xs" /> y deben completarse obligatoriamente.</li>
                <li>Puedes crear variables personalizadas para necesidades específicas de tu clínica.</li>
                <li>Las variables de tipo lista permiten agregar múltiples elementos (ej: varias vacunas).</li>
                <li>Los valores por defecto ayudan a agilizar la creación de documentos repetitivos.</li>
                <li>Usa la búsqueda para encontrar rápidamente variables específicas.</li>
              </ul>
            </div>

            <div class="help-section">
              <h4><q-icon name="error" class="section-icon" />Solución de problemas</h4>
              <div class="troubleshooting">
                <div class="problem-solution">
                  <strong>Problema:</strong> Una variable no se reemplaza en la vista previa
                  <br>
                  <strong>Solución:</strong> Verifica que el nombre de la variable esté escrito correctamente con dobles llaves: <code>{{nombreVariable}}</code>
                </div>
                <div class="problem-solution">
                  <strong>Problema:</strong> Error de validación en variables requeridas
                  <br>
                  <strong>Solución:</strong> Completa todas las variables marcadas con <q-icon name="star" color="orange" size="xs" /> antes de guardar
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import VariableCard from './VariableCard.vue'

// Props
const props = defineProps({
  variables: {
    type: Array,
    default: () => []
  },
  availableVariables: {
    type: Array,
    default: () => []
  },
  templateType: {
    type: Object,
    default: null
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
  'variables-imported',
  'variable-insert-requested'
])

// Composables
const $q = useQuasar()

// Estado local
const searchQuery = ref('')
const activeFilters = ref([])
const showAddVariableDialog = ref(false)
const showVariableHelp = ref(false)

// Nueva variable
const newVariable = reactive({
  name: '',
  label: '',
  description: '',
  type: 'text',
  value: '',
  required: false
})

// Opciones
const variableTypes = [
  { label: 'Texto', value: 'text', icon: 'text_fields' },
  { label: 'Número', value: 'number', icon: 'tag' },
  { label: 'Fecha', value: 'date', icon: 'event' },
  { label: 'Lista', value: 'array', icon: 'list' },
  { label: 'Sí/No', value: 'boolean', icon: 'toggle_on' }
]

const filterOptions = [
  { label: 'Requeridas', value: 'required', icon: 'star', color: 'orange' },
  { label: 'Opcionales', value: 'optional', icon: 'lightbulb', color: 'blue' },
  { label: 'Personalizadas', value: 'custom', icon: 'extension', color: 'purple' },
  { label: 'Completadas', value: 'completed', icon: 'check_circle', color: 'green' },
  { label: 'Pendientes', value: 'pending', icon: 'radio_button_unchecked', color: 'grey' }
]

// Computed properties
const filteredVariables = computed(() => {
  let filtered = [...props.variables]

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(variable => 
      variable.name.toLowerCase().includes(query) ||
      (variable.label && variable.label.toLowerCase().includes(query)) ||
      (variable.description && variable.description.toLowerCase().includes(query))
    )
  }

  // Filtrar por tipos activos
  if (activeFilters.value.length > 0) {
    filtered = filtered.filter(variable => {
      return activeFilters.value.some(filter => {
        switch (filter) {
          case 'required':
            return variable.required
          case 'optional':
            return !variable.required && !variable.custom
          case 'custom':
            return variable.custom
          case 'completed':
            return variable.value && variable.value.toString().trim() !== ''
          case 'pending':
            return !variable.value || variable.value.toString().trim() === ''
          default:
            return true
        }
      })
    })
  }

  return filtered
})

const requiredVariables = computed(() => {
  return filteredVariables.value.filter(v => v.required && !v.custom)
})

const optionalVariables = computed(() => {
  return filteredVariables.value.filter(v => !v.required && !v.custom)
})

const customVariables = computed(() => {
  return filteredVariables.value.filter(v => v.custom)
})

const completionPercentage = computed(() => {
  if (props.variables.length === 0) return 0
  const completed = props.variables.filter(v => v.value && v.value.toString().trim() !== '').length
  return Math.round((completed / props.variables.length) * 100)
})

const completedVariables = computed(() => {
  return props.variables.filter(v => v.value && v.value.toString().trim() !== '').length
})

const pendingVariables = computed(() => {
  return props.variables.length - completedVariables.value
})

// Métodos
const toggleFilter = (filterValue) => {
  const index = activeFilters.value.indexOf(filterValue)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(filterValue)
  }
}

const addCustomVariable = () => {
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
    label: newVariable.label || newVariable.name,
    description: newVariable.description || '',
    type: newVariable.type,
    value: newVariable.value || '',
    required: newVariable.required,
    custom: true
  }

  emit('variable-added', variable)
  closeAddVariableDialog()

  $q.notify({
    message: `Variable "${variable.label}" creada exitosamente`,
    color: 'positive',
    icon: 'check_circle'
  })
}

const closeAddVariableDialog = () => {
  showAddVariableDialog.value = false
  Object.assign(newVariable, {
    name: '',
    label: '',
    description: '',
    type: 'text',
    value: '',
    required: false
  })
}

const importVariables = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        const variables = Array.isArray(importedData) ? importedData : importedData.variables || []
        
        emit('variables-imported', variables)
        
        $q.notify({
          message: `${variables.length} variables importadas exitosamente`,
          color: 'positive',
          icon: 'upload'
        })
      } catch (error) {
        $q.notify({
          message: 'Error al importar variables: archivo inválido',
          color: 'negative',
          icon: 'error'
        })
      }
    }

    reader.readAsText(file)
  }

  input.click()
}

const exportVariables = () => {
  const dataStr = JSON.stringify({
    templateType: props.templateType?.name || 'Template',
    exportDate: new Date().toISOString(),
    variables: props.variables
  }, null, 2)

  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `variables_${props.templateType?.name || 'template'}_${new Date().toISOString().split('T')[0]}.json`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)

  $q.notify({
    message: 'Variables exportadas exitosamente',
    color: 'positive',
    icon: 'download'
  })
}

const resetVariables = () => {
  $q.dialog({
    title: 'Restablecer Variables',
    message: '¿Estás seguro de que quieres restablecer todos los valores de las variables?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    props.variables.forEach(variable => {
      emit('variable-updated', { ...variable, value: '' })
    })

    $q.notify({
      message: 'Variables restablecidas exitosamente',
      color: 'info',
      icon: 'restore'
    })
  })
}
</script>

<style lang="scss" scoped>
.modern-variables-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);

  .header-title {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    flex: 1;

    .title-icon {
      color: #3b82f6;
      margin-top: 0.25rem;
    }

    .title-content {
      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 0.25rem;

    .add-btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;

      &:hover {
        background: linear-gradient(135deg, #2563eb, #1e40af);
      }
    }
  }
}

.sidebar-filters {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fefefe;

  .search-input {
    margin-bottom: 1rem;

    :deep(.q-field__control) {
      border-radius: 12px;
    }
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .filter-chip {
      transition: all 0.2s ease;
      border-radius: 8px;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
}

.variables-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  .variable-group {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;

      &.required-header {
        background: linear-gradient(135deg, #fff7ed, #fed7aa);
        border: 1px solid #fb923c;

        .group-icon {
          color: #ea580c;
        }
      }

      &.optional-header {
        background: linear-gradient(135deg, #eff6ff, #dbeafe);
        border: 1px solid #60a5fa;

        .group-icon {
          color: #2563eb;
        }
      }

      &.custom-header {
        background: linear-gradient(135deg, #faf5ff, #e9d5ff);
        border: 1px solid #a855f7;

        .group-icon {
          color: #9333ea;
        }
      }

      .group-title {
        font-weight: 600;
        color: #374151;
        flex: 1;
      }
    }

    .variables-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;

    .empty-icon {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    p {
      margin: 0 0 1.5rem 0;
      font-size: 0.875rem;
    }
  }
}

.completion-progress {
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  background: #fefefe;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;

    .progress-label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .progress-percentage {
      font-weight: 700;
      color: #059669;
      font-size: 1rem;
    }
  }

  .progress-bar {
    margin-bottom: 0.75rem;
  }

  .progress-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #6b7280;
    }
  }
}

.add-variable-card {
  min-width: 500px;
  max-width: 600px;
  border-radius: 16px;
  overflow: hidden;

  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;

    .header-icon {
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

  .card-content {
    padding: 2rem;

    .variable-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .form-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
      }

      .form-options {
        padding-top: 0.5rem;
      }
    }
  }

  .card-actions {
    padding: 1.5rem 2rem;
    background: #f8fafc;
  }
}

.help-card {
  .help-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #059669, #047857);
    color: white;

    .header-icon {
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
      }
    }
  }

  .help-content {
    padding: 2rem;
    max-height: 70vh;
    overflow-y: auto;

    .help-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .help-section {
      h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;

        .section-icon {
          color: #059669;
        }
      }

      p {
        margin: 0 0 1rem 0;
        line-height: 1.6;
        color: #4b5563;

        code {
          background: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          color: #dc2626;
          font-family: monospace;
        }
      }

      .variable-types-help {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .type-help-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #e5e7eb;

          div {
            flex: 1;

            strong {
              color: #374151;
            }

            code {
              display: block;
              margin-top: 0.5rem;
              font-size: 0.8em;
            }
          }
        }
      }

      .help-steps {
        padding-left: 1.5rem;

        li {
          margin-bottom: 0.75rem;
          line-height: 1.6;

          strong {
            color: #374151;
          }
        }
      }

      .help-tips {
        padding-left: 1.5rem;

        li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
          color: #4b5563;
        }
      }

      .troubleshooting {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .problem-solution {
          padding: 1rem;
          background: #fef2f2;
          border-radius: 8px;
          border-left: 4px solid #ef4444;

          strong {
            color: #dc2626;
          }

          code {
            background: #fee2e2;
            color: #991b1b;
          }
        }
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .sidebar-header {
    padding: 1rem;

    .header-title {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;

      .title-icon {
        align-self: center;
      }
    }

    .header-actions {
      align-self: center;
      margin-top: 0.5rem;
    }
  }

  .sidebar-filters {
    padding: 0.75rem;

    .filter-chips {
      justify-content: center;
    }
  }

  .variables-list {
    padding: 0.75rem;

    .variable-group .group-header {
      padding: 0.5rem 0.75rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }

  .add-variable-card {
    min-width: 90vw;
    margin: 1rem;

    .card-content .variable-form .form-row {
      grid-template-columns: 1fr;
    }
  }
}

// Dark theme
.body--dark {
  .modern-variables-sidebar {
    background: #1e293b;
    border-right-color: #334155;
  }

  .sidebar-header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);

    .header-title .title-content {
      h3 {
        color: #e2e8f0;
      }

      p {
        color: #94a3b8;
      }
    }
  }

  .sidebar-filters {
    background: #1e293b;
    border-bottom-color: #334155;
  }

  .completion-progress {
    background: #1e293b;
    border-top-color: #334155;

    .progress-header .progress-label {
      color: #e2e8f0;
    }

    .progress-details .detail-item {
      color: #94a3b8;
    }
  }

  .variable-group .group-header {
    &.required-header {
      background: linear-gradient(135deg, #431407, #7c2d12);
      border-color: #ea580c;
    }

    &.optional-header {
      background: linear-gradient(135deg, #1e3a8a, #1e40af);
      border-color: #3b82f6;
    }

    &.custom-header {
      background: linear-gradient(135deg, #581c87, #7c3aed);
      border-color: #a855f7;
    }

    .group-title {
      color: #e2e8f0;
    }
  }

  .empty-state {
    color: #94a3b8;

    h4 {
      color: #e2e8f0;
    }
  }
}
</style>