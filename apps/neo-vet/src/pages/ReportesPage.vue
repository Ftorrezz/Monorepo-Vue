<!-- TemplateBuilder.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Panel de configuración -->
      <div class="col-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Configuración de Plantilla</div>
          </q-card-section>

          <q-card-section>
            <q-input v-model="template.name" label="Nombre de la plantilla" />

            <q-select
              v-model="template.certificate_type_id"
              :options="certificateTypes"
              option-value="id"
              option-label="name"
              label="Tipo de certificado"
            />

            <q-select
              v-model="template.paper_size"
              :options="['A4', 'Letter', 'A5']"
              label="Tamaño de papel"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1">Campos Dinámicos</div>
            <q-btn @click="addField" color="primary" size="sm" class="q-mb-md">
              Agregar Campo
            </q-btn>

            <div v-for="(field, index) in template.fields" :key="index" class="q-mb-md">
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <q-input v-model="field.field_label" label="Etiqueta" dense />
                  <q-input v-model="field.field_name" label="Nombre del campo" dense />

                  <q-select
                    v-model="field.field_type"
                    :options="fieldTypes"
                    label="Tipo"
                    dense
                  />

                  <q-toggle v-model="field.is_required" label="Requerido" />

                  <q-btn
                    @click="removeField(index)"
                    icon="delete"
                    color="negative"
                    size="sm"
                    flat
                  />
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Editor de plantilla -->
      <div class="col-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Editor de Plantilla</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="template.template_content"
              type="textarea"
              label="Contenido HTML"
              rows="20"
              class="q-mb-md"
            />

            <div class="text-subtitle2 q-mb-sm">Placeholders disponibles:</div>
            <q-chip
              v-for="placeholder in availablePlaceholders"
              :key="placeholder"
              :label="placeholder"
              @click="insertPlaceholder(placeholder)"
              clickable
              color="primary"
              text-color="white"
              size="sm"
            />
          </q-card-section>

          <q-card-actions>
            <q-btn @click="previewTemplate" color="secondary">Vista Previa</q-btn>
            <q-btn @click="saveTemplate" color="primary">Guardar</q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTemplateStore } from '../stores/templateStore'

const templateStore = useTemplateStore()

const template = ref({
  name: '',
  certificate_type_id: null,
  template_content: '',
  paper_size: 'A4',
  fields: []
})

const certificateTypes = ref([])
const fieldTypes = ['text', 'number', 'date', 'select', 'textarea', 'checkbox']

const availablePlaceholders = computed(() => {
  const patientPlaceholders = [
    '{{patient.name}}',
    '{{patient.breed}}',
    '{{patient.age}}',
    '{{patient.weight}}',
    '{{patient.owner_name}}',
    '{{current_date}}'
  ]

  const dynamicPlaceholders = template.value.fields.map(field => `{{${field.field_name}}}`)

  return [...patientPlaceholders, ...dynamicPlaceholders]
})

const addField = () => {
  template.value.fields.push({
    field_name: '',
    field_label: '',
    field_type: 'text',
    is_required: false,
    field_order: template.value.fields.length
  })
}

const removeField = (index) => {
  template.value.fields.splice(index, 1)
}

const insertPlaceholder = (placeholder) => {
  template.value.template_content += ` ${placeholder}`
}

const saveTemplate = async () => {
  try {
    await templateStore.createTemplate(template.value)
    // Mostrar notificación de éxito
  } catch (error) {
    // Mostrar error
  }
}

onMounted(async () => {
  await templateStore.fetchCertificateTypes()
  certificateTypes.value = templateStore.certificateTypes
})
</script>
