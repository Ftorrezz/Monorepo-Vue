<template>
  <q-page class="template-manager">
    <div class="row full-height no-wrap">
      <!-- Sidebar Variables -->
      <div class="col-3">
        <VariablesSidebar @insert-variable="insertVariable" />
      </div>

      <!-- Editor Principal -->
      <div class="col-6">
        <TemplateEditor
          v-model:content="templateContent"
          v-model:name="templateName"
          :templates="availableTemplates"
          @template-changed="loadTemplate"
          @save="saveTemplate"
        />
      </div>

      <!-- Preview -->
      <div class="col-3">
        <TemplatePreview
          :content="templateContent"
          :sample-data="sampleData"
          @generate-pdf="generatePDF"
          @print="printTemplate"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import VariablesSidebar from './VariablesSidebar.vue';
import TemplateEditor from './TemplateEditor.vue';
import TemplatePreview from './TemplatePreview.vue';
import { useTemplateManager } from './useTemplateManager.js';

const {
  templateContent,
  templateName,
  availableTemplates,
  sampleData,
  loadTemplate,
  saveTemplate,
  insertVariable,
  generatePDF,
  printTemplate
} = useTemplateManager();
</script>