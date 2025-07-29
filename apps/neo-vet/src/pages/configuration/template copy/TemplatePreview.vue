<template>
  <q-card class="full-height">
    <q-card-section>
      <div class="text-h6 text-negative">
        <q-icon name="visibility" class="q-mr-sm" />
        Vista Previa
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-banner class="bg-warning text-dark" rounded dense>
        <template v-slot:avatar>
          <q-icon name="info" />
        </template>
        <div class="text-caption">
          <strong>Datos de Ejemplo:</strong><br>
          Preview con información simulada
        </div>
      </q-banner>
    </q-card-section>

    <q-card-section class="q-pa-sm">
      <div class="preview-container">
        <div 
          class="preview-content"
          v-html="renderedContent"
        ></div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions vertical>
      <q-btn
        color="primary"
        icon="refresh"
        label="Actualizar"
        @click="updatePreview"
        class="full-width"
      />
      <q-btn
        color="orange"
        icon="picture_as_pdf"
        label="Generar PDF"
        @click="$emit('generate-pdf')"
        class="full-width"
      />
      <q-btn
        color="green"
        icon="print"
        label="Imprimir"
        @click="$emit('print')"
        class="full-width"
      />
      <q-btn
        color="purple"
        icon="share"
        label="Compartir"
        @click="shareTemplate"
        class="full-width"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps({
  content: String,
  sampleData: Object
});

const emit = defineEmits(['generate-pdf', 'print']);
const $q = useQuasar();

// Renderizar template con datos de ejemplo
const renderedContent = computed(() => {
  if (!props.content || !props.sampleData) return '';
  
  let rendered = props.content;
  
  // Función recursiva para reemplazar variables
  const replaceVariables = (str, data, prefix = '') => {
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'object' && value !== null) {
        str = replaceVariables(str, value, `${prefix}${key}.`);
      } else {
        const pattern = new RegExp(`{{${prefix}${key}}}`, 'g');
        str = str.replace(pattern, value || '');
      }
    });
    return str;
  };

  return replaceVariables(rendered, props.sampleData);
});

const updatePreview = () => {
  $q.notify({
    color: 'positive',
    message: 'Vista previa actualizada',
    icon: 'check',
    position: 'top'
  });
};

const shareTemplate = () => {
  // Copiar al portapapeles
  if (navigator.clipboard) {
    navigator.clipboard.writeText(renderedContent.value);
    $q.notify({
      color: 'info',
      message: 'Contenido copiado al portapapeles',
      icon: 'content_copy',
      position: 'top'
    });
  }
};
</script>

<style scoped>
.preview-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.preview-content {
  padding: 20px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  margin-top: 0;
  margin-bottom: 15px;
}

.preview-content :deep(p) {
  margin-bottom: 10px;
}

.preview-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.preview-content :deep(td),
.preview-content :deep(th) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
</style>