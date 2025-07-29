<template>
  <q-card class="full-height">
    <q-card-section>
      <div class="row q-col-gutter-md items-center">
        <div class="col-6">
          <q-input
            v-model="templateName"
            label="Nombre de la plantilla"
            outlined
            dense
          />
        </div>
        <div class="col-6">
          <q-select
            v-model="selectedTemplate"
            :options="templateOptions"
            label="Plantilla"
            outlined
            dense
            @update:model-value="$emit('template-changed', $event)"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <q-editor
        v-model="content"
        :toolbar="editorToolbar"
        height="400px"
        placeholder="Escribe tu plantilla aquí..."
        @update:model-value="$emit('update:content', $event)"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        color="primary"
        label="Guardar"
        icon="save"
        @click="$emit('save')"
      />
      <q-btn
        color="secondary"
        label="Nueva"
        icon="add"
        @click="newTemplate"
      />
      <q-btn
        color="info"
        label="Insertar Tabla"
        icon="table_chart"
        @click="insertTable"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  content: String,
  name: String,
  templates: Array
});

const emit = defineEmits(['update:content', 'update:name', 'template-changed', 'save']);

const templateName = computed({
  get: () => props.name,
  set: (value) => emit('update:name', value)
});

const content = computed({
  get: () => props.content,
  set: (value) => emit('update:content', value)
});

const selectedTemplate = ref('');

const templateOptions = computed(() => 
  props.templates.map(t => ({
    label: t.name,
    value: t.id
  }))
);

// Configuración de la toolbar del QEditor
const editorToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['undo', 'redo'],
  [
    {
      label: 'Formato',
      icon: 'format_size',
      list: 'no-icons',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']
    }
  ],
  ['quote', 'unordered', 'ordered'],
  ['link'],
  [
    {
      label: 'Alineación',
      icon: 'format_align_left',
      fixedLabel: true,
      options: ['left', 'center', 'right', 'justify']
    }
  ],
  ['hr'],
  ['print', 'fullscreen']
];

const newTemplate = () => {
  templateName.value = 'Nueva Plantilla';
  content.value = '';
};

const insertTable = () => {
  const tableHtml = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 8px;">Campo</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">{{mascota.nombre}}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">{{mascota.especie}}</td>
        </tr>
      </tbody>
    </table>
  `;
  content.value += tableHtml;
};
</script>