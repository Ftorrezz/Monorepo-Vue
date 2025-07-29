<template>
  <div class="template-editor-container">
    <!-- Header con acciones principales -->
    <div class="editor-header">
      <div class="header-left">
        <q-input
          v-model="templateName"
          class="template-name-input"
          placeholder="Nombre de la plantilla"
          borderless
          dense
        >
          <template v-slot:prepend>
            <q-icon name="edit" color="primary" />
          </template>
        </q-input>
      </div>
      
      <div class="header-actions">
        <q-btn-group flat>
          <q-btn
            flat
            icon="visibility"
            label="Vista Previa"
            @click="togglePreview"
            :color="showPreview ? 'primary' : 'grey-7'"
          />
          <q-btn
            flat
            icon="save"
            label="Guardar"
            color="positive"
            @click="saveTemplate"
          />
          <q-btn
            flat
            icon="picture_as_pdf"
            label="PDF"
            color="orange"
            @click="generatePDF"
          />
        </q-btn-group>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="editor-content" :class="{ 'preview-mode': showPreview }">
      
      <!-- Panel lateral de variables (colapsible) -->
      <div class="variables-panel" v-show="showVariablesPanel">
        <div class="panel-header">
          <h6 class="panel-title">
            <q-icon name="code" class="q-mr-sm" />
            Variables
          </h6>
          <q-btn
            flat
            round
            dense
            icon="close"
            size="sm"
            @click="showVariablesPanel = false"
          />
        </div>

        <!-- Buscador de variables -->
        <div class="variables-search">
          <q-input
            v-model="variableSearch"
            placeholder="Buscar variables..."
            dense
            outlined
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Lista de variables filtradas -->
        <div class="variables-list">
          <div
            v-for="group in filteredVariableGroups"
            :key="group.category"
            class="variable-group"
          >
            <div class="group-header" @click="toggleGroup(group.category)">
              <q-icon :name="group.icon" class="group-icon" />
              <span class="group-title">{{ group.category }}</span>
              <q-icon
                :name="expandedGroups.includes(group.category) ? 'expand_less' : 'expand_more'"
                class="expand-icon"
              />
            </div>
            
            <q-slide-transition>
              <div v-show="expandedGroups.includes(group.category)" class="group-content">
                <div
                  v-for="variable in group.variables"
                  :key="variable.value"
                  class="variable-item"
                  @click="insertVariable(variable.value)"
                >
                  <span class="variable-label">{{ variable.label }}</span>
                  <code class="variable-code">{{ variable.value }}</code>
                </div>
              </div>
            </q-slide-transition>
          </div>
        </div>

        <!-- Elementos rápidos -->
        <div class="quick-elements">
          <div class="elements-header">
            <q-icon name="widgets" class="q-mr-sm" />
            <span>Elementos Rápidos</span>
          </div>
          <div class="elements-grid">
            <q-btn
              v-for="element in quickElements"
              :key="element.type"
              :icon="element.icon"
              :label="element.label"
              flat
              class="element-btn"
              @click="insertQuickElement(element.type)"
            />
          </div>
        </div>
      </div>

      <!-- Editor principal -->
      <div class="editor-main">
        <!-- Barra de herramientas flotante -->
        <div class="floating-toolbar">
          <q-btn
            v-if="!showVariablesPanel"
            flat
            round
            icon="code"
            size="sm"
            class="toolbar-btn"
            @click="showVariablesPanel = true"
          >
            <q-tooltip>Variables</q-tooltip>
          </q-btn>
          
          <q-separator vertical class="q-mx-sm" />
          
          <q-btn
            flat
            round
            icon="format_bold"
            size="sm"
            class="toolbar-btn"
            @click="formatText('bold')"
          />
          <q-btn
            flat
            round
            icon="format_italic"
            size="sm"
            class="toolbar-btn"
            @click="formatText('italic')"
          />
          <q-btn
            flat
            round
            icon="format_underlined"
            size="sm"
            class="toolbar-btn"
            @click="formatText('underline')"
          />
          
          <q-separator vertical class="q-mx-sm" />
          
          <q-btn
            flat
            round
            icon="table_chart"
            size="sm"
            class="toolbar-btn"
            @click="insertTable"
          >
            <q-tooltip>Insertar Tabla</q-tooltip>
          </q-btn>
        </div>

        <!-- Editor de texto -->
        <div class="editor-wrapper">
          <q-editor
            v-model="templateContent"
            class="template-editor"
            :toolbar="editorToolbar"
            placeholder="Comienza a escribir tu plantilla aquí..."
            content-class="editor-content-area"
            @update:model-value="updatePreview"
          />
        </div>
      </div>

      <!-- Panel de vista previa -->
      <div class="preview-panel" v-show="showPreview">
        <div class="panel-header">
          <h6 class="panel-title">
            <q-icon name="visibility" class="q-mr-sm" />
            Vista Previa
          </h6>
          <div class="preview-controls">
            <q-btn
              flat
              round
              dense
              icon="refresh"
              size="sm"
              @click="updatePreview"
            >
              <q-tooltip>Actualizar</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="preview-content">
          <div 
            class="preview-render"
            v-html="renderedContent"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { templateService } from './TemplateService.js';

const $q = useQuasar();

// Estado del componente
const templateName = ref('Nueva Plantilla');
const templateContent = ref('');
const showPreview = ref(false);
const showVariablesPanel = ref(true);
const variableSearch = ref('');
const expandedGroups = ref(['🏥 Clínica', '🐕 Mascota']);

// Configuración del editor
const editorToolbar = [
  ['bold', 'italic', 'underline'],
  ['quote', 'unordered', 'ordered'],
  ['undo', 'redo'],
  ['viewsource']
];

// Variables organizadas
const variableGroups = ref([
  {
    category: '🏥 Clínica',
    icon: 'local_hospital',
    variables: [
      { label: 'Nombre', value: '{{clinica.nombre}}' },
      { label: 'Dirección', value: '{{clinica.direccion}}' },
      { label: 'Teléfono', value: '{{clinica.telefono}}' },
      { label: 'Email', value: '{{clinica.email}}' },
      { label: 'Website', value: '{{clinica.website}}' }
    ]
  },
  {
    category: '👨‍⚕️ Veterinario',
    icon: 'person',
    variables: [
      { label: 'Nombre', value: '{{veterinario.nombre}}' },
      { label: 'Cédula', value: '{{veterinario.cedula}}' },
      { label: 'Especialidad', value: '{{veterinario.especialidad}}' },
      { label: 'Título', value: '{{veterinario.titulo}}' }
    ]
  },
  {
    category: '👤 Propietario',
    icon: 'account_circle',
    variables: [
      { label: 'Nombre', value: '{{propietario.nombre}}' },
      { label: 'Teléfono', value: '{{propietario.telefono}}' },
      { label: 'Email', value: '{{propietario.email}}' },
      { label: 'Dirección', value: '{{propietario.direccion}}' },
      { label: 'Documento', value: '{{propietario.documento}}' }
    ]
  },
  {
    category: '🐕 Mascota',
    icon: 'pets',
    variables: [
      { label: 'Nombre', value: '{{mascota.nombre}}' },
      { label: 'Especie', value: '{{mascota.especie}}' },
      { label: 'Raza', value: '{{mascota.raza}}' },
      { label: 'Edad', value: '{{mascota.edad}}' },
      { label: 'Peso', value: '{{mascota.peso}}' },
      { label: 'Color', value: '{{mascota.color}}' },
      { label: 'Sexo', value: '{{mascota.sexo}}' },
      { label: 'ID/Chip', value: '{{mascota.chip}}' }
    ]
  },
  {
    category: '📅 Fechas',
    icon: 'event',
    variables: [
      { label: 'Fecha Actual', value: '{{fecha.actual}}' },
      { label: 'Fecha Cita', value: '{{fecha.cita}}' },
      { label: 'Hora', value: '{{fecha.hora}}' }
    ]
  },
  {
    category: '⚕️ Servicios',
    icon: 'medical_services',
    variables: [
      { label: 'Tipo Servicio', value: '{{servicio.tipo}}' },
      { label: 'Descripción', value: '{{servicio.descripcion}}' },
      { label: 'Precio', value: '{{servicio.precio}}' },
      { label: 'Observaciones', value: '{{servicio.observaciones}}' }
    ]
  }
]);

// Elementos rápidos
const quickElements = ref([
  { type: 'header', icon: 'title', label: 'Encabezado' },
  { type: 'table', icon: 'table_chart', label: 'Tabla' },
  { type: 'signature', icon: 'draw', label: 'Firma' }
]);

// Datos de ejemplo
const sampleData = ref({
  clinica: {
    nombre: "Clínica Veterinaria San Martín",
    direccion: "Av. Principal #123, Ciudad",
    telefono: "(555) 123-4567",
    email: "info@veterinaria.com",
    website: "www.veterinaria.com"
  },
  veterinario: {
    nombre: "Dr. Carlos Mendoza",
    cedula: "12345678",
    especialidad: "Medicina Veterinaria",
    titulo: "Médico Veterinario"
  },
  propietario: {
    nombre: "Ana García",
    telefono: "(555) 987-6543",
    email: "ana@email.com",
    direccion: "Calle 123",
    documento: "12.345.678-9"
  },
  mascota: {
    nombre: "Max",
    especie: "Canino",
    raza: "Golden Retriever",
    edad: "3 años",
    peso: "25 kg",
    color: "Dorado",
    sexo: "Macho",
    chip: "982000123456789"
  },
  fecha: {
    actual: new Date().toLocaleDateString('es-ES'),
    cita: "28/07/2025",
    hora: "14:30"
  },
  servicio: {
    tipo: "Vacunación",
    descripcion: "Vacuna antirrábica",
    precio: "$50.000",
    observaciones: "Próxima dosis en 1 año"
  }
});

// Computed properties
const filteredVariableGroups = computed(() => {
  if (!variableSearch.value) return variableGroups.value;
  
  return variableGroups.value.map(group => ({
    ...group,
    variables: group.variables.filter(variable =>
      variable.label.toLowerCase().includes(variableSearch.value.toLowerCase()) ||
      variable.value.toLowerCase().includes(variableSearch.value.toLowerCase())
    )
  })).filter(group => group.variables.length > 0);
});

const renderedContent = computed(() => {
  if (!templateContent.value) return '';
  return templateService.renderTemplate(templateContent.value, sampleData.value);
});

// Métodos
const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

const toggleGroup = (category) => {
  const index = expandedGroups.value.indexOf(category);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(category);
  }
};

const insertVariable = (variable) => {
  templateContent.value += variable;
  $q.notify({
    color: 'positive',
    message: 'Variable insertada',
    timeout: 1000,
    position: 'top-right'
  });
};

const insertQuickElement = (type) => {
  const elements = {
    header: `
<div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1976d2; padding-bottom: 20px;">
  <h2 style="color: #1976d2; margin-bottom: 10px;">{{clinica.nombre}}</h2>
  <p style="color: #666;">{{clinica.direccion}} | Tel: {{clinica.telefono}}</p>
</div>`,
    table: `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5; font-weight: bold;">Propietario:</td>
    <td style="border: 1px solid #ddd; padding: 10px;">{{propietario.nombre}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5; font-weight: bold;">Mascota:</td>
    <td style="border: 1px solid #ddd; padding: 10px;">{{mascota.nombre}}</td>
  </tr>
</table>`,
    signature: `
<div style="margin-top: 60px; text-align: center;">
  <div style="border-top: 2px solid #333; width: 250px; margin: 0 auto; padding-top: 10px;">
    <p style="font-weight: bold;">{{veterinario.nombre}}</p>
    <p style="color: #666;">{{veterinario.especialidad}}</p>
  </div>
</div>`
  };
  
  templateContent.value += elements[type];
};

const formatText = (format) => {
  document.execCommand(format, false, null);
};

const insertTable = () => {
  insertQuickElement('table');
};

const updatePreview = () => {
  // La vista previa se actualiza automáticamente via computed
};

const saveTemplate = () => {
  if (!templateName.value.trim()) {
    $q.notify({
      color: 'warning',
      message: 'Ingresa un nombre para la plantilla'
    });
    return;
  }

  // Para guardar en base de datos, el contenido se enviaría como JSON:
  const templateData = {
    name: templateName.value,
    content: templateContent.value, // Esto se guarda como TEXT en la BD
    variables_used: extractVariables(templateContent.value), // Array de variables usadas
    created_at: new Date().toISOString()
  };

  console.log('Datos a guardar:', templateData);
  
  $q.notify({
    color: 'positive',
    message: 'Plantilla guardada exitosamente',
    icon: 'check'
  });
};

const extractVariables = (content) => {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
};

const generatePDF = () => {
  templateService.generatePDF({
    content: templateContent.value,
    data: sampleData.value,
    name: templateName.value
  });
};

onMounted(() => {
  // Expandir grupos por defecto
  expandedGroups.value = ['🏥 Clínica', '🐕 Mascota'];
});
</script>

<style scoped>
.template-editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.template-name-input {
  font-size: 18px;
  font-weight: 500;
  max-width: 300px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.editor-content {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
}

.editor-content.preview-mode .editor-main {
  flex: 1;
}

.variables-panel {
  width: 320px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.variables-search {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.variables-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.variable-group {
  margin-bottom: 4px;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
}

.group-header:hover {
  background: #f5f5f5;
}

.group-icon {
  font-size: 18px;
  margin-right: 12px;
  color: #666;
}

.group-title {
  flex: 1;
  font-weight: 500;
  font-size: 13px;
}

.expand-icon {
  color: #999;
  transition: transform 0.2s;
}

.group-content {
  padding-left: 20px;
}

.variable-item {
  padding: 8px 20px 8px 50px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 2px 8px;
}

.variable-item:hover {
  background: #e3f2fd;
}

.variable-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.variable-code {
  font-size: 11px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.quick-elements {
  border-top: 1px solid #e0e0e0;
  padding: 16px 20px;
  background: #fafafa;
}

.elements-header {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.elements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.element-btn {
  min-height: 40px;
  font-size: 11px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
}

.floating-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  display: flex;
  align-items: center;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
}

.editor-wrapper {
  flex: 1;
  margin: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.template-editor {
  height: 100%;
  border: none;
}

.template-editor :deep(.q-editor__content) {
  min-height: calc(100vh - 200px);
  padding: 24px;
  font-size: 14px;
  line-height: 1.6;
}

.preview-panel {
  width: 400px;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
}

.preview-controls {
  display: flex;
  gap: 4px;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  margin: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.preview-render {
  padding: 24px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 1200px) {
  .variables-panel {
    width: 280px;
  }
  
  .preview-panel {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .editor-content {
    flex-direction: column;
  }
  
  .variables-panel,
  .preview-panel {
    width: 100%;
    max-height: 40vh;
  }
  
  .floating-toolbar {
    position: relative;
    top: auto;
    right: auto;
    margin: 8px;
    justify-content: center;
  }
}
</style>