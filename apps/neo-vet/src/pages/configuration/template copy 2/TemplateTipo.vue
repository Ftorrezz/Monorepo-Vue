<template>
  <div class="template-type-selector">
    <!-- Header con información del tipo actual -->
    <div class="type-header">
      <div class="current-type-info">
        <q-avatar 
          :icon="currentTemplateType?.icon || 'description'" 
          :color="currentTemplateType?.color || 'primary'"
          text-color="white"
          size="md"
        />
        <div class="type-details">
          <h6 class="type-name">{{ currentTemplateType?.name || 'Seleccionar Tipo' }}</h6>
          <p class="type-description">{{ currentTemplateType?.description || 'Elige el tipo de documento a configurar' }}</p>
        </div>
      </div>

      <div class="header-actions">
        <q-btn
          flat
          dense
          icon="swap_horiz"
          label="Cambiar Tipo"
          @click="showTypeSelector = true"
          color="primary"
          size="sm"
        />
        
        <q-btn
          flat
          dense
          icon="settings"
          @click="showTypeSettings = true"
          size="sm"
        >
          <q-tooltip>Configurar Tipo de Plantilla</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Variables específicas del tipo -->
    <div class="type-variables" v-if="currentTemplateType">
      <div class="variables-header">
        <q-icon name="code" size="sm" />
        <span>Variables Disponibles para {{ currentTemplateType.name }}</span>
        <q-chip :label="`${availableVariables.length} variables`" size="sm" color="info" />
      </div>

      <div class="variables-grid">
        <div 
          v-for="variable in availableVariables" 
          :key="variable.name"
          class="variable-card"
          :class="{ 'required': variable.required }"
        >
          <div class="variable-info">
            <div class="variable-name">
              <q-icon :name="getVariableIcon(variable.type)" size="xs" />
              <span>{{ variable.label || variable.name }}</span>
              <q-chip v-if="variable.required" label="Requerido" size="xs" color="orange" />
            </div>
            <p class="variable-description">{{ variable.description }}</p>
            <div class="variable-meta">
              <span class="variable-type">{{ getVariableTypeLabel(variable.type) }}</span>
              <span class="variable-syntax">{{{{ variable.name }}}}</span>
            </div>
          </div>
          
          <div class="variable-actions">
            <q-btn
              flat
              dense
              round
              icon="content_copy"
              size="xs"
              @click="copyVariableToClipboard(variable.name)"
            >
              <q-tooltip>Copiar variable</q-tooltip>
            </q-btn>
            
            <q-btn
              flat
              dense
              round
              icon="add"
              size="xs"
              @click="insertVariable(variable.name)"
            >
              <q-tooltip>Insertar en editor</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog de selección de tipo -->
    <q-dialog v-model="showTypeSelector" persistent>
      <q-card style="min-width: 600px; max-width: 800px;">
        <q-card-section class="row items-center">
          <q-icon name="category" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Seleccionar Tipo de Plantilla</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showTypeSelector = false" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="template-types-grid">
            <div 
              v-for="templateType in templateTypes" 
              :key="templateType.id"
              class="template-type-card"
              :class="{ 'selected': selectedType === templateType.id }"
              @click="selectedType = templateType.id"
            >
              <q-avatar 
                :icon="templateType.icon" 
                :color="templateType.color"
                text-color="white"
                size="lg"
                class="type-avatar"
              />
              
              <div class="type-content">
                <h6 class="type-title">{{ templateType.name }}</h6>
                <p class="type-desc">{{ templateType.description }}</p>
                
                <div class="type-features">
                  <q-chip 
                    v-for="feature in templateType.features" 
                    :key="feature"
                    :label="feature" 
                    size="sm" 
                    color="grey-3" 
                    text-color="grey-8"
                  />
                </div>
                
                <div class="type-stats">
                  <span class="stat">
                    <q-icon name="code" size="xs" />
                    {{ templateType.variables?.length || 0 }} variables
                  </span>
                  <span class="stat">
                    <q-icon name="schedule" size="xs" />
                    {{ templateType.estimatedTime || '5 min' }}
                  </span>
                </div>
              </div>

              <div class="selection-indicator" v-if="selectedType === templateType.id">
                <q-icon name="check_circle" color="positive" size="md" />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat @click="showTypeSelector = false" />
          <q-btn 
            label="Seleccionar" 
            color="primary" 
            :disable="!selectedType"
            @click="selectTemplateType"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de configuración del tipo -->
    <q-dialog v-model="showTypeSettings" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section class="row items-center">
          <q-icon name="settings" size="md" class="text-primary q-mr-md" />
          <div class="text-h6">Configuración de {{ currentTemplateType?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showTypeSettings = false" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="currentTemplateType">
          <q-form>
            <q-input
              v-model="typeSettings.customName"
              label="Nombre personalizado (opcional)"
              outlined
              class="q-mb-md"
            />
            
            <q-input
              v-model="typeSettings.prefix"
              label="Prefijo para numeración"
              outlined
              class="q-mb-md"
              :placeholder="currentTemplateType.defaultPrefix"
            />
            
            <q-toggle 
              v-model="typeSettings.autoNumber" 
              label="Numeración automática"
              class="q-mb-md"
            />
            
            <q-toggle 
              v-model="typeSettings.requireSignature" 
              label="Requerir firma digital"
              class="q-mb-md"
            />
            
            <q-toggle 
              v-model="typeSettings.includeLogo" 
              label="Incluir logo de la clínica"
              class="q-mb-md"
            />

            <q-select
              v-model="typeSettings.paperSize"
              :options="paperSizes"
              label="Tamaño de papel"
              outlined
              emit-value
              map-options
              class="q-mb-md"
            />

            <q-select
              v-model="typeSettings.orientation"
              :options="orientations"
              label="Orientación"
              outlined
              emit-value
              map-options
            />
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat @click="showTypeSettings = false" />
          <q-btn label="Guardar" color="primary" @click="saveTypeSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'

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
const templateTypes = ref([
  {
    id: 'vaccination_certificate',
    name: 'Certificado de Vacunación',
    description: 'Documento oficial que certifica las vacunas aplicadas a la mascota',
    icon: 'vaccines',
    color: 'green',
    features: ['Historial de vacunas', 'Fechas de aplicación', 'Próximas dosis'],
    defaultPrefix: 'CV',
    estimatedTime: '3 min',
    variables: [
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true, description: 'Nombre completo de la mascota' },
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true, description: 'Nombre completo del dueño' },
      { name: 'petSpecies', label: 'Especie', type: 'text', required: true, description: 'Perro, Gato, etc.' },
      { name: 'petBreed', label: 'Raza', type: 'text', required: false, description: 'Raza de la mascota' },
      { name: 'petAge', label: 'Edad', type: 'text', required: false, description: 'Edad actual de la mascota' },
      { name: 'vaccineList', label: 'Lista de vacunas', type: 'array', required: true, description: 'Vacunas aplicadas con fechas' },
      { name: 'veterinarianName', label: 'Veterinario', type: 'text', required: true, description: 'Nombre del veterinario certificante' },
      { name: 'clinicName', label: 'Clínica', type: 'text', required: true, description: 'Nombre de la clínica veterinaria' },
      { name: 'issueDate', label: 'Fecha de emisión', type: 'date', required: true, description: 'Fecha de emisión del certificado' },
      { name: 'certificateNumber', label: 'Número de certificado', type: 'text', required: true, description: 'Número único del certificado' },
      { name: 'nextVaccination', label: 'Próxima vacunación', type: 'date', required: false, description: 'Fecha de la próxima vacuna' }
    ]
  },
  {
    id: 'deworming_certificate',
    name: 'Certificado de Desparasitación',
    description: 'Documento que certifica los tratamientos antiparasitarios aplicados',
    icon: 'pest_control',
    color: 'orange',
    features: ['Historial de tratamientos', 'Medicamentos utilizados', 'Dosis aplicadas'],
    defaultPrefix: 'CD',
    estimatedTime: '3 min',
    variables: [
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true, description: 'Nombre completo de la mascota' },
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true, description: 'Nombre completo del dueño' },
      { name: 'petSpecies', label: 'Especie', type: 'text', required: true, description: 'Perro, Gato, etc.' },
      { name: 'petWeight', label: 'Peso', type: 'number', required: true, description: 'Peso actual de la mascota en kg' },
      { name: 'dewormingList', label: 'Lista de desparasitaciones', type: 'array', required: true, description: 'Tratamientos aplicados con fechas y dosis' },
      { name: 'medication', label: 'Medicamento utilizado', type: 'text', required: true, description: 'Nombre del antiparasitario' },
      { name: 'veterinarianName', label: 'Veterinario', type: 'text', required: true, description: 'Nombre del veterinario tratante' },
      { name: 'clinicName', label: 'Clínica', type: 'text', required: true, description: 'Nombre de la clínica veterinaria' },
      { name: 'treatmentDate', label: 'Fecha de tratamiento', type: 'date', required: true, description: 'Fecha del último tratamiento' },
      { name: 'nextTreatment', label: 'Próximo tratamiento', type: 'date', required: false, description: 'Fecha del próximo tratamiento' }
    ]
  },
  {
    id: 'commitment_letter',
    name: 'Carta Compromiso',
    description: 'Documento de compromiso para cuidados específicos o tratamientos',
    icon: 'handshake',
    color: 'blue',
    features: ['Términos y condiciones', 'Responsabilidades', 'Compromisos específicos'],
    defaultPrefix: 'CC',
    estimatedTime: '5 min',
    variables: [
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true, description: 'Nombre completo del responsable' },
      { name: 'ownerIdNumber', label: 'Número de identificación', type: 'text', required: true, description: 'Cédula o documento de identidad' },
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true, description: 'Nombre de la mascota involucrada' },
      { name: 'commitmentType', label: 'Tipo de compromiso', type: 'text', required: true, description: 'Naturaleza del compromiso adquirido' },
      { name: 'commitmentDetails', label: 'Detalles del compromiso', type: 'text', required: true, description: 'Descripción específica de las obligaciones' },
      { name: 'startDate', label: 'Fecha de inicio', type: 'date', required: true, description: 'Fecha de inicio del compromiso' },
      { name: 'endDate', label: 'Fecha de vencimiento', type: 'date', required: false, description: 'Fecha límite del compromiso' },
      { name: 'veterinarianName', label: 'Veterinario supervisor', type: 'text', required: true, description: 'Veterinario que supervisa el cumplimiento' },
      { name: 'clinicName', label: 'Clínica', type: 'text', required: true, description: 'Clínica responsable del seguimiento' },
      { name: 'consequences', label: 'Consecuencias', type: 'text', required: false, description: 'Consecuencias por incumplimiento' }
    ]
  },
  {
    id: 'health_certificate',
    name: 'Certificado de Salud',
    description: 'Certificado médico general del estado de salud de la mascota',
    icon: 'health_and_safety',
    color: 'teal',
    features: ['Examen físico', 'Estado general', 'Recomendaciones'],
    defaultPrefix: 'CS',
    estimatedTime: '4 min',
    variables: [
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true, description: 'Nombre completo de la mascota' },
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true, description: 'Nombre del propietario' },
      { name: 'petSpecies', label: 'Especie', type: 'text', required: true, description: 'Especie animal' },
      { name: 'petAge', label: 'Edad', type: 'text', required: true, description: 'Edad de la mascota' },
      { name: 'healthStatus', label: 'Estado de salud', type: 'text', required: true, description: 'Estado general de salud' },
      { name: 'examDate', label: 'Fecha de examen', type: 'date', required: true, description: 'Fecha del examen médico' },
      { name: 'findings', label: 'Hallazgos', type: 'text', required: false, description: 'Hallazgos relevantes del examen' },
      { name: 'recommendations', label: 'Recomendaciones', type: 'text', required: false, description: 'Recomendaciones médicas' },
      { name: 'veterinarianName', label: 'Veterinario', type: 'text', required: true, description: 'Veterinario certificante' },
      { name: 'validUntil', label: 'Válido hasta', type: 'date', required: false, description: 'Fecha de vencimiento del certificado' }
    ]
  },
  {
    id: 'surgery_consent',
    name: 'Consentimiento de Cirugía',
    description: 'Documento de autorización para procedimientos quirúrgicos',
    icon: 'medical_services',
    color: 'red',
    features: ['Autorización quirúrgica', 'Riesgos informados', 'Términos legales'],
    defaultPrefix: 'CQ',
    estimatedTime: '7 min',
    variables: [
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true, description: 'Nombre del responsable legal' },
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true, description: 'Nombre de la mascota' },
      { name: 'surgeryType', label: 'Tipo de cirugía', type: 'text', required: true, description: 'Procedimiento quirúrgico a realizar' },
      { name: 'surgeryDate', label: 'Fecha de cirugía', type: 'date', required: true, description: 'Fecha programada para la cirugía' },
      { name: 'risks', label: 'Riesgos informados', type: 'text', required: true, description: 'Riesgos asociados al procedimiento' },
      { name: 'preOperativeCare', label: 'Cuidados preoperatorios', type: 'text', required: false, description: 'Instrucciones previas a la cirugía' },
      { name: 'postOperativeCare', label: 'Cuidados postoperatorios', type: 'text', required: false, description: 'Cuidados posteriores a la cirugía' },
      { name: 'surgeonName', label: 'Cirujano', type: 'text', required: true, description: 'Veterinario que realizará la cirugía' },
      { name: 'estimatedCost', label: 'Costo estimado', type: 'number', required: false, description: 'Costo aproximado del procedimiento' },
      { name: 'emergencyContact', label: 'Contacto de emergencia', type: 'text', required: true, description: 'Teléfono de contacto de emergencia' }
    ]
  },
  {
    id: 'euthanasia_consent',
    name: 'Consentimiento de Eutanasia',
    description: 'Documento de autorización para procedimiento de eutanasia humanitaria',
    icon: 'pets',
    color: 'purple',
    features: ['Autorización legal', 'Consideraciones éticas', 'Opciones finales'],
    defaultPrefix: 'CE',
    estimatedTime: '10 min',
    variables: [
      { name: 'ownerName', label: 'Nombre del propietario', type: 'text', required: true, description: 'Nombre del propietario responsable' },
      { name: 'petName', label: 'Nombre de la mascota', type: 'text', required: true, description: 'Nombre de la mascota' },
      { name: 'medicalReason', label: 'Razón médica', type: 'text', required: true, description: 'Justificación médica para el procedimiento' },
      { name: 'alternativesDiscussed', label: 'Alternativas discutidas', type: 'text', required: true, description: 'Opciones alternativas consideradas' },
      { name: 'procedureDate', label: 'Fecha del procedimiento', type: 'date', required: true, description: 'Fecha programada' },
      { name: 'veterinarianName', label: 'Veterinario', type: 'text', required: true, description: 'Veterinario responsable' },
      { name: 'witnessName', label: 'Testigo', type: 'text', required: false, description: 'Nombre del testigo presente' },
      { name: 'disposalOption', label: 'Opción de disposición final', type: 'text', required: true, description: 'Cremación, entierro, etc.' },
      { name: 'ownerSignature', label: 'Firma del propietario', type: 'text', required: true, description: 'Confirmación de firma' },
      { name: 'vetSignature', label: 'Firma del veterinario', type: 'text', required: true, description: 'Confirmación de firma profesional' }
    ]
  }
])

// Computed properties
const currentTemplateType = computed(() => {
  return templateTypes.value.find(type => type.id === props.selectedTemplateTypeId)
})

const availableVariables = computed(() => {
  return currentTemplateType.value?.variables || []
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

// Watchers
watch(() => props.selectedTemplateTypeId, (newId) => {
  selectedType.value = newId
})
</script>

<style lang="scss" scoped>
.template-type-selector {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;

  .current-type-info {
    display: flex;
    align-items: center;
    gap: 1rem;

    .type-details {
      .type-name {
        margin: 0 0 0.25rem 0;
        font-weight: 600;
        color: #1f2937;
      }

      .type-description {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.type-variables {
  padding: 1rem;

  .variables-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .variables-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .variable-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #f9fafb;
    transition: all 0.2s ease;

    &:hover {
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    &.required {
      border-left: 4px solid #f59e0b;
    }

    .variable-info {
      flex: 1;

      .variable-name {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #1f2937;
      }

      .variable-description {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        color: #6b7280;
      }

      .variable-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.75rem;

        .variable-type {
          color: #059669;
          font-weight: 500;
        }

        .variable-syntax {
          color: #dc2626;
          font-family: monospace;
          background: #fef2f2;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
      }
    }

    .variable-actions {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  }
}

.template-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.template-type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #3b82f6;
    background: #eff6ff;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .type-avatar {
    margin-bottom: 1rem;
  }

  .type-content {
    text-align: center;
    flex: 1;

    .type-title {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: #1f2937;
    }

    .type-desc {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .type-features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .type-stats {
      display: flex;
      justify-content: center;
      gap: 1rem;
      font-size: 0.75rem;
      color: #9ca3af;

      .stat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }
  }

  .selection-indicator {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
}

// Responsive
@media (max-width: 768px) {
  .type-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;

    .current-type-info {
      justify-content: center;
      text-align: center;
    }

    .header-actions {
      justify-content: center;
    }
  }

  .variables-grid {
    grid-template-columns: 1fr;
  }

  .template-types-grid {
    grid-template-columns: 1fr;
  }

  .variable-card {
    flex-direction: column;
    gap: 1rem;

    .variable-actions {
      flex-direction: row;
      justify-content: center;
    }
  }
}

// Dark theme
.body--dark {
  .template-type-selector {
    background: #1e293b;
    border-bottom-color: #334155;
  }

  .type-header {
    border-bottom-color: #334155;

    .type-details {
      .type-name {
        color: #e2e8f0;
      }

      .type-description {
        color: #94a3b8;
      }
    }
  }

  .type-variables {
    .variables-header {
      color: #e2e8f0;
    }

    .variable-card {
      background: #334155;
      border-color: #475569;

      &:hover {
        border-color: #64748b;
      }

      &.required {
        border-left-color: #f59e0b;
      }

      .variable-info {
        .variable-name {
          color: #e2e8f0;
        }

        .variable-description {
          color: #94a3b8;
        }

        .variable-meta {
          .variable-type {
            color: #10b981;
          }

          .variable-syntax {
            color: #ef4444;
            background: #450a0a;
          }
        }
      }
    }
  }

  .template-type-card {
    background: #334155;
    border-color: #475569;

    &:hover {
      border-color: #64748b;
    }

    &.selected {
      background: #1e3a8a;
      border-color: #3b82f6;
    }

    .type-content {
      .type-title {
        color: #e2e8f0;
      }

      .type-desc {
        color: #94a3b8;
      }

      .type-stats {
        color: #64748b;
      }
    }
  }
}
</style>