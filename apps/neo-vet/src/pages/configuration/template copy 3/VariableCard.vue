<template>
  <div class="variable-card" :class="cardClasses">
    <!-- Header de la variable -->
    <div class="variable-header">
      <div class="variable-info">
        <div class="variable-name">
          <q-icon :name="getVariableIcon(variable.type)" size="sm" :class="iconClass" />
          <span class="name-text">{{ variable.label || variable.name }}</span>
          <q-chip 
            v-if="isRequired" 
            label="Requerido" 
            size="xs" 
            color="orange-6" 
            text-color="white"
            icon="star"
            class="required-chip"
          />
          <q-chip 
            v-if="isCustom" 
            label="Personalizada" 
            size="xs" 
            color="purple-6" 
            text-color="white"
            icon="extension"
            class="custom-chip"
          />
        </div>
        
        <p v-if="variable.description" class="variable-description">
          {{ variable.description }}
        </p>
      </div>

      <div class="variable-actions">
        <q-btn
          flat
          dense
          round
          icon="content_copy"
          size="sm"
          @click="copyToClipboard"
          class="action-btn copy-btn"
        >
          <q-tooltip>Copiar {{ variable.name }}</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          icon="add"
          size="sm"
          @click="insertVariable"
          class="action-btn insert-btn"
        >
          <q-tooltip>Insertar en editor</q-tooltip>
        </q-btn>
        
        <q-btn
          v-if="isCustom"
          flat
          dense
          round
          icon="delete"
          size="sm"
          @click="deleteVariable"
          class="action-btn delete-btn"
        >
          <q-tooltip>Eliminar variable</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Input de la variable -->
    <div class="variable-input">
      <!-- Texto -->
      <q-input
        v-if="variable.type === 'text'"
        v-model="localValue"
        :label="getInputLabel()"
        outlined
        dense
        :rules="validationRules"
        :placeholder="getPlaceholder()"
        @update:model-value="updateValue"
        class="variable-field"
      >
        <template v-slot:prepend>
          <q-icon name="text_fields" />
        </template>
      </q-input>

      <!-- Número -->
      <q-input
        v-else-if="variable.type === 'number'"
        v-model.number="localValue"
        :label="getInputLabel()"
        type="number"
        outlined
        dense
        :rules="validationRules"
        :placeholder="getPlaceholder()"
        @update:model-value="updateValue"
        class="variable-field"
      >
        <template v-slot:prepend>
          <q-icon name="tag" />
        </template>
      </q-input>

      <!-- Fecha -->
      <q-input
        v-else-if="variable.type === 'date'"
        v-model="localValue"
        :label="getInputLabel()"
        outlined
        dense
        :rules="validationRules"
        @update:model-value="updateValue"
        class="variable-field"
      >
        <template v-slot:prepend>
          <q-icon name="event" />
        </template>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="localValue" @update:model-value="updateValue">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <!-- Boolean/Toggle -->
      <div v-else-if="variable.type === 'boolean'" class="boolean-field">
        <q-toggle
          v-model="localValue"
          :label="getInputLabel()"
          @update:model-value="updateValue"
          color="primary"
          class="variable-toggle"
        />
        <span class="toggle-status">{{ localValue ? 'Sí' : 'No' }}</span>
      </div>

      <!-- Array/Lista -->
      <div v-else-if="variable.type === 'array'" class="array-field">
        <div class="array-header">
          <span class="array-label">{{ getInputLabel() }}</span>
          <q-btn
            flat
            dense
            icon="add"
            size="sm"
            @click="addArrayItem"
            color="primary"
            class="add-item-btn"
          >
            <q-tooltip>Agregar elemento</q-tooltip>
          </q-btn>
        </div>

        <div class="array-items" v-if="arrayItems.length > 0">
          <div
            v-for="(item, index) in arrayItems"
            :key="index"
            class="array-item"
          >
            <q-input
              v-model="arrayItems[index]"
              :placeholder="`Elemento ${index + 1}`"
              outlined
              dense
              @update:model-value="updateArrayValue"
              class="item-input"
            />
            <q-btn
              flat
              dense
              round
              icon="remove"
              size="sm"
              @click="removeArrayItem(index)"
              color="negative"
              class="remove-item-btn"
            >
              <q-tooltip>Eliminar elemento</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div v-else class="array-empty">
          <q-icon name="list_alt" size="md" class="empty-icon" />
          <span>No hay elementos en la lista</span>
          <q-btn
            color="primary"
            icon="add"
            label="Agregar primer elemento"
            @click="addArrayItem"
            size="sm"
            unelevated
          />
        </div>
      </div>

      <!-- Campo genérico para otros tipos -->
      <q-input
        v-else
        v-model="localValue"
        :label="getInputLabel()"
        outlined
        dense
        :rules="validationRules"
        :placeholder="getPlaceholder()"
        @update:model-value="updateValue"
        class="variable-field"
      >
        <template v-slot:prepend>
          <q-icon name="code" />
        </template>
      </q-input>
    </div>

    <!-- Footer con información adicional -->
    <div class="variable-footer" v-if="showFooter">
      <div class="variable-meta">
        <span class="meta-item">
          <q-icon name="category" size="xs" />
          {{ getTypeLabel(variable.type) }}
        </span>
        <span class="meta-item syntax-preview">
          <q-icon name="code" size="xs" />
          {{ variableSyntax }}
        </span>
      </div>

      <div class="completion-status">
        <q-icon
          :name="isCompleted ? 'check_circle' : 'radio_button_unchecked'"
          :color="isCompleted ? 'positive' : 'grey'"
          size="sm"
        />
      </div>
    </div>

    <!-- Indicador de validación -->
    <div v-if="hasValidationError" class="validation-error">
      <q-icon name="error" color="negative" size="sm" />
      <span>{{ validationError }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  variable: {
    type: Object,
    required: true
  },
  templateType: {
    type: Object,
    default: null
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'variable-updated',
  'variable-deleted',
  'insert-requested'
])

// Composables
const $q = useQuasar()

// Estado local
const localValue = ref('')
const arrayItems = ref([])
const validationError = ref('')

// Computed properties
const cardClasses = computed(() => ({
  'required-variable': props.isRequired,
  'custom-variable': props.isCustom,
  'completed-variable': isCompleted.value,
  'has-error': hasValidationError.value
}))

const iconClass = computed(() => ({
  'text-orange-6': props.isRequired,
  'text-purple-6': props.isCustom,
  'text-blue-6': !props.isRequired && !props.isCustom
}))

const isCompleted = computed(() => {
  if (props.variable.type === 'array') {
    return arrayItems.value.length > 0 && arrayItems.value.every(item => item.trim() !== '')
  }
  if (props.variable.type === 'boolean') {
    return localValue.value !== null && localValue.value !== undefined
  }
  return localValue.value && localValue.value.toString().trim() !== ''
})

const hasValidationError = computed(() => {
  return validationError.value !== ''
})

const variableSyntax = computed(() => {
  return `{{${props.variable.name}}}`
})

const validationRules = computed(() => {
  const rules = []
  
  if (props.isRequired) {
    rules.push(val => {
      if (props.variable.type === 'array') {
        return arrayItems.value.length > 0 || 'Este campo es requerido'
      }
      return (val && val.toString().trim() !== '') || 'Este campo es requerido'
    })
  }

  if (props.variable.type === 'number') {
    rules.push(val => {
      if (!val && !props.isRequired) return true
      return !isNaN(val) || 'Debe ser un número válido'
    })
  }

  if (props.variable.type === 'date') {
    rules.push(val => {
      if (!val && !props.isRequired) return true
      const date = new Date(val)
      return !isNaN(date.getTime()) || 'Debe ser una fecha válida'
    })
  }

  return rules
})

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

const getTypeLabel = (type) => {
  const labelMap = {
    text: 'Texto',
    number: 'Número',
    date: 'Fecha',
    array: 'Lista',
    boolean: 'Sí/No'
  }
  return labelMap[type] || 'Desconocido'
}

const getInputLabel = () => {
  return props.variable.label || props.variable.name
}

const getPlaceholder = () => {
  const placeholders = {
    text: 'Ingresa el texto...',
    number: 'Ingresa un número...',
    date: 'Selecciona una fecha...',
    boolean: 'Verdadero o falso',
    array: 'Lista de elementos'
  }
  
  return props.variable.placeholder || 
         placeholders[props.variable.type] || 
         `Valor para ${props.variable.name}`
}

const updateValue = (newValue) => {
  localValue.value = newValue
  validationError.value = ''
  
  // Validar el nuevo valor
  if (props.isRequired && (!newValue || newValue.toString().trim() === '')) {
    validationError.value = 'Este campo es requerido'
  }

  // Emitir actualización
  emit('variable-updated', {
    ...props.variable,
    value: newValue
  })
}

const updateArrayValue = () => {
  const cleanItems = arrayItems.value.filter(item => item && item.trim() !== '')
  localValue.value = cleanItems
  
  emit('variable-updated', {
    ...props.variable,
    value: cleanItems
  })
}

const addArrayItem = () => {
  arrayItems.value.push('')
}

const removeArrayItem = (index) => {
  arrayItems.value.splice(index, 1)
  updateArrayValue()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(`{{${props.variable.name}}}`)
    $q.notify({
      message: `Variable {{${props.variable.name}}} copiada`,
      color: 'positive',
      icon: 'content_copy',
      timeout: 2000
    })
  } catch (error) {
    $q.notify({
      message: 'Error al copiar al portapapeles',
      color: 'negative',
      icon: 'error'
    })
  }
}

const insertVariable = () => {
  emit('insert-requested', props.variable.name)
  $q.notify({
    message: `Variable {{${props.variable.name}}} insertada`,
    color: 'info',
    icon: 'add',
    timeout: 2000
  })
}

const deleteVariable = () => {
  $q.dialog({
    title: 'Eliminar Variable',
    message: `¿Estás seguro de que quieres eliminar la variable "${props.variable.label || props.variable.name}"?`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    emit('variable-deleted', props.variable.name)
    $q.notify({
      message: `Variable "${props.variable.label || props.variable.name}" eliminada`,
      color: 'info',
      icon: 'delete'
    })
  })
}

// Watchers
watch(() => props.variable.value, (newValue) => {
  if (props.variable.type === 'array') {
    arrayItems.value = Array.isArray(newValue) ? [...newValue] : []
  } else {
    localValue.value = newValue || ''
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  // Inicializar valor
  if (props.variable.type === 'array') {
    arrayItems.value = Array.isArray(props.variable.value) ? [...props.variable.value] : []
  } else {
    localValue.value = props.variable.value || ''
  }

  // Si es tipo boolean y no tiene valor, inicializar como false
  if (props.variable.type === 'boolean' && localValue.value === '') {
    localValue.value = false
    updateValue(false)
  }
})
</script>

<style lang="scss" scoped>
.variable-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &.required-variable {
    border-left: 4px solid #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);

    &:hover {
      border-left-color: #d97706;
    }
  }

  &.custom-variable {
    border-left: 4px solid #a855f7;
    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);

    &:hover {
      border-left-color: #9333ea;
    }
  }

  &.completed-variable {
    .variable-header::after {
      content: '';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
  }

  &.has-error {
    border-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  }
}

.variable-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  position: relative;

  .variable-info {
    flex: 1;
    min-width: 0;

    .variable-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;

      .name-text {
        font-weight: 600;
        color: #374151;
        word-break: break-word;
      }

      .required-chip, .custom-chip {
        font-weight: 600;
        font-size: 0.7rem;
      }
    }

    .variable-description {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }
  }

  .variable-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;

    .action-btn {
      transition: all 0.2s ease;

      &.copy-btn:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      &.insert-btn:hover {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }

      &.delete-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
    }
  }
}

.variable-input {
  margin-bottom: 1rem;

  .variable-field {
    :deep(.q-field__control) {
      border-radius: 8px;
    }

    :deep(.q-field__prepend) {
      color: #6b7280;
    }
  }

  .boolean-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #f9fafb;

    .variable-toggle {
      flex: 1;
    }

    .toggle-status {
      font-weight: 600;
      color: #374151;
      margin-left: 1rem;
    }
  }

  .array-field {
    .array-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;

      .array-label {
        font-weight: 600;
        color: #374151;
      }

      .add-item-btn {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;

        &:hover {
          background: rgba(59, 130, 246, 0.2);
        }
      }
    }

    .array-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .array-item {
        display: flex;
        gap: 0.5rem;
        align-items: flex-start;

        .item-input {
          flex: 1;
        }

        .remove-item-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;

          &:hover {
            background: rgba(239, 68, 68, 0.2);
          }
        }
      }
    }

    .array-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
      text-align: center;
      color: #6b7280;
      border: 2px dashed #d1d5db;
      border-radius: 8px;

      .empty-icon {
        margin-bottom: 0.5rem;
        opacity: 0.5;
      }

      span {
        margin-bottom: 1rem;
        font-size: 0.875rem;
      }
    }
  }
}

.variable-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;

  .variable-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #6b7280;

      &.syntax-preview {
        font-family: monospace;
        background: #f3f4f6;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        color: #dc2626;
      }
    }
  }

  .completion-status {
    display: flex;
    align-items: center;
  }
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #dc2626;
  margin-top: 0.5rem;
}

// Responsive
@media (max-width: 768px) {
  .variable-card {
    padding: 0.75rem;
  }

  .variable-header {
    flex-direction: column;
    gap: 0.75rem;

    .variable-actions {
      align-self: flex-end;
    }
  }

  .array-field {
    .array-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: stretch;

      .add-item-btn {
        align-self: center;
      }
    }

    .array-item {
      flex-direction: column;
      gap: 0.5rem;

      .remove-item-btn {
        align-self: flex-end;
      }
    }
  }

  .variable-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;

    .variable-meta {
      justify-content: center;
      flex-wrap: wrap;
    }

    .completion-status {
      justify-content: center;
    }
  }
}

// Dark theme
.body--dark {
  .variable-card {
    background: #1e293b;
    border-color: #334155;

    &:hover {
      border-color: #475569;
    }

    &.required-variable {
      background: linear-gradient(135deg, #451a03 0%, #1e293b 100%);
    }

    &.custom-variable {
      background: linear-gradient(135deg, #581c87 0%, #1e293b 100%);
    }

    &.has-error {
      background: linear-gradient(135deg, #450a0a 0%, #1e293b 100%);
      border-color: #dc2626;
    }

    .variable-header .variable-info {
      .variable-name .name-text {
        color: #e2e8f0;
      }

      .variable-description {
        color: #94a3b8;
      }
    }

    .boolean-field {
      background: #334155;
      border-color: #475569;

      .toggle-status {
        color: #e2e8f0;
      }
    }

    .array-field {
      .array-header .array-label {
        color: #e2e8f0;
      }

      .array-empty {
        border-color: #475569;
        color: #94a3b8;
      }
    }

    .variable-footer {
      border-top-color: #334155;

      .variable-meta .meta-item {
        color: #94a3b8;

        &.syntax-preview {
          background: #334155;
          color: #fbbf24;
        }
      }
    }

    .validation-error {
      background: #450a0a;
      border-color: #dc2626;
      color: #fca5a5;
    }
  }
}
</style>