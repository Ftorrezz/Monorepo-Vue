<template>
  <q-dialog
    v-model="modelValue"
    persistent
    maximized
    @hide="$emit('update:modelValue', false)"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Nueva' }} Plantilla</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Información básica -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="Nombre de la plantilla *"
                :rules="[val => !!val || 'El nombre es requerido']"
                outlined
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.code"
                label="Código único *"
                :rules="[val => !!val || 'El código es requerido']"
                outlined
              />
            </div>
          </div>

          <q-input
            v-model="form.description"
            type="textarea"
            label="Descripción"
            outlined
          />

          <!-- Selector de módulos -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Selecciona los módulos donde estará disponible:</div>
            <div class="row q-col-gutter-sm">
              <div v-for="module in availableModules" :key="module.value" class="col-12 col-sm-6 col-md-4">
                <q-checkbox
                  v-model="form.modules"
                  :val="module.value"
                  :label="module.label"
                >
                  <template v-slot:default>
                    <div class="row items-center">
                      <q-icon :name="module.icon" :color="module.color" size="sm" class="q-mr-sm"/>
                      {{ module.label }}
                    </div>
                  </template>
                </q-checkbox>
              </div>
            </div>
          </div>

          <!-- Editor de contenido -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Contenido de la plantilla:</div>
            <q-editor
              v-model="form.content"
              min-height="300px"
              :toolbar="editorToolbar"
              class="q-mb-md"
            />
            
            <!-- Variables disponibles -->
            <div class="text-subtitle2 q-mb-sm">Variables disponibles:</div>
            <div class="row q-col-gutter-sm">
              <div v-for="category in variableCategories" :key="category.name" class="col-12 col-md-4">
                <q-expansion-item
                  :label="category.label"
                  :icon="category.icon"
                  dense
                >
                  <q-list dense>
                    <q-item
                      v-for="variable in category.variables"
                      :key="variable.name"
                      clickable
                      v-ripple
                      @click="insertVariable(variable.name)"
                    >
                      <q-item-section>
                        <q-item-label>{{ variable.label }}</q-item-label>
                        <q-item-label caption>{{ variable.name }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn flat round dense size="sm" icon="add" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </div>
            </div>
          </div>

          <!-- Configuración adicional -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2">Configuración adicional</div>
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.paperSize"
                    :options="paperSizes"
                    label="Tamaño de papel"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.orientation"
                    :options="orientations"
                    label="Orientación"
                    outlined
                    dense
                  />
                </div>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-12 col-md-6">
                  <q-toggle v-model="form.includeLogo" label="Incluir logo de la clínica" />
                </div>
                <div class="col-12 col-md-6">
                  <q-toggle v-model="form.requireSignature" label="Requiere firma" />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" flat v-close-popup />
            <q-btn label="Guardar" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  editingTemplate: Object,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'save'])

const isEditing = computed(() => !!props.editingTemplate)

// Estado del formulario
const isOpen = ref(false)
const form = reactive({
  name: '',
  code: '',
  description: '',
  modules: [],
  content: '',
  paperSize: 'A4',
  orientation: 'portrait',
  includeLogo: true,
  requireSignature: false
})

// Métodos
const open = (template = null) => {
  if (template) {
    Object.assign(form, template)
  } else {
    resetForm()
  }
  isOpen.value = true
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    code: '',
    description: '',
    modules: [],
    content: '',
    paperSize: 'A4',
    orientation: 'portrait',
    includeLogo: true,
    requireSignature: false
  })
}

const onSubmit = async () => {
  try {
    emit('save', { ...form })
    isOpen.value = false
    resetForm()
  } catch (error) {
    console.error('Error al guardar:', error)
  }
}

defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.module-card {
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }
}

// Dark theme
.body--dark {
  .module-card:hover {
    background: #1d1d1d;
  }
}
</style>
.body--dark {
  .module-card:hover {
    background: #1d1d1d;
  }
}
</style>
