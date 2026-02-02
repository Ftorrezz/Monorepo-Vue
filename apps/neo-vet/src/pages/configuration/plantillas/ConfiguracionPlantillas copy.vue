<template>
  <q-page padding>
    <!-- Header principal con gradiente -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="description" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Gestión de Plantillas</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticas.total }} plantilla{{ estadisticas.total !== 1 ? 's' : '' }} • 
              {{ estadisticas.activas }} activa{{ estadisticas.activas !== 1 ? 's' : '' }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn 
              flat
              round
              icon="add_circle"
              @click="abrirFormulario()"
              size="md"
            >
              <q-tooltip>Nueva Plantilla</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de plantillas -->
    <q-table
      :rows="plantillas"
      :columns="columnas"
      :loading="loading"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-icono="props">
        <q-td :props="props">
          <q-avatar 
            size="36px" 
            :style="{ backgroundColor: props.row.color || '#2196F3' }" 
            text-color="white"
            class="shadow-1"
          >
            <q-icon :name="props.row.icono || 'description'" size="20px" />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-badge :color="props.value === 'S' ? 'positive' : 'negative'" :label="props.value === 'S' ? 'Activa' : 'Inactiva'" />
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              icon="edit"
              color="primary"
              size="sm"
              @click="editarPlantilla(props.row)"
            >
              <q-tooltip>Editar Plantilla</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="visibility"
              color="secondary"
              size="sm"
              @click="previsualizarPlantilla(props.row)"
            >
              <q-tooltip>Previsualizar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="delete"
              color="negative"
              size="sm"
              @click="eliminarPlantilla(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog para crear/editar plantilla -->
    <q-dialog v-model="mostrarFormulario" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-grey-1">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>{{ modoEdicion ? 'Editar Plantilla' : 'Nueva Plantilla' }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-none scroll" style="height: calc(100vh - 50px)">
          <div class="row q-col-gutter-md q-pa-md">
            <!-- Columna Izquierda: Configuración -->
            <div class="col-12 col-md-4">
              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle1 text-weight-bold q-mb-md">Información Básica</div>
                <q-form @submit="guardarPlantilla" ref="plantillaFormRef" class="q-gutter-md">
                  <q-input
                    v-model="formulario.nombre"
                    label="Nombre de la Plantilla *"
                    outlined
                    dense
                    :rules="[val => !!val || 'El nombre es requerido']"
                  />
                  <q-input
                    v-model="formulario.codigo"
                    label="Código Único *"
                    outlined
                    dense
                    placeholder="Ej: CERT_VACUNA"
                    :readonly="modoEdicion"
                    :rules="[val => !!val || 'El código es requerido']"
                  />
                  <q-input
                    v-model="formulario.descripcion"
                    label="Descripción"
                    type="textarea"
                    rows="2"
                    outlined
                    dense
                  />
                  
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-input
                        v-model="formulario.icono"
                        label="Icono"
                        outlined
                        dense
                        placeholder="description"
                      >
                        <template v-slot:append>
                          <q-icon :name="formulario.icono || 'description'" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="formulario.color"
                        label="Color"
                        outlined
                        dense
                      >
                        <template v-slot:append>
                          <q-icon name="colorize" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-color v-model="formulario.color" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <div class="text-subtitle1 text-weight-bold q-mb-md">Configuración de Página</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-select
                        v-model="formulario.tamano_papel"
                        :options="['A4', 'Letter', 'Legal']"
                        label="Tamaño"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="formulario.orientacion"
                        :options="[{label: 'Vertical', value: 'portrait'}, {label: 'Horizontal', value: 'landscape'}]"
                        label="Orientación"
                        emit-value
                        map-options
                        outlined
                        dense
                      />
                    </div>
                  </div>

                  <div class="q-gutter-sm q-mt-md">
                    <q-checkbox v-model="formulario.incluir_logo" label="Incluir Logo" true-value="S" false-value="N" />
                    <q-checkbox v-model="formulario.requiere_firma" label="Requiere Firma Digital" true-value="S" false-value="N" />
                    <q-checkbox v-model="formulario.activo" label="Activa" true-value="S" false-value="N" />
                  </div>
                </q-form>
              </q-card>

              <!-- Variables del Sistema (NUEVO) -->
              <q-card flat bordered class="q-pa-md q-mt-md shadow-1">
                <div class="row items-center q-mb-md">
                  <q-icon name="hub" color="primary" size="sm" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold">Variables del Sistema</div>
                </div>
                <div class="q-gutter-sm">
                  <q-expansion-item
                    v-for="cat in variablesSistema"
                    :key="cat.categoria"
                    :label="cat.categoria"
                    header-class="text-weight-bold bg-blue-1 text-primary br-4 q-mb-xs"
                    dense-toggle
                    expand-separator
                    class="overflow-hidden br-4 border-blue-light"
                  >
                    <div class="row q-gutter-sm q-pa-sm">
                      <q-btn
                        v-for="item in cat.items"
                        :key="item.value"
                        size="sm"
                        unelevated
                        color="blue-1"
                        text-color="primary"
                        :label="item.label"
                        class="text-weight-bold"
                        @click="insertarPlaceholder(item.value)"
                      >
                        <q-tooltip>Insertar {{ item.value }}</q-tooltip>
                      </q-btn>
                    </div>
                  </q-expansion-item>
                </div>
              </q-card>

              <!-- Variables Dinámicas (Personalizadas) -->
              <q-card flat bordered class="q-pa-md q-mt-md">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-subtitle1 text-weight-bold">Variables Adicionales</div>
                  <q-btn flat round dense icon="add" color="primary" @click="agregarVariable">
                    <q-tooltip>Agregar Variable Personalizada</q-tooltip>
                  </q-btn>
                </div>
                <q-list bordered separator>
                  <q-item v-for="(variable, index) in formulario.variables" :key="index" class="q-py-sm">
                    <q-item-section>
                      <div class="row q-col-gutter-sm items-center">
                        <div class="col-6">
                          <q-input 
                            v-model="variable.nombre" 
                            label="ID / Nombre" 
                            dense 
                            outlined 
                            bg-color="white"
                          />
                        </div>
                        <div class="col-6">
                          <q-select 
                            v-model="variable.tipo_dato" 
                            :options="['text', 'date', 'number', 'bool']" 
                            label="Tipo" 
                            dense 
                            outlined 
                            bg-color="white"
                          />
                        </div>
                      </div>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center no-wrap">
                        <q-btn 
                          flat 
                          round 
                          dense 
                          icon="send" 
                          color="primary" 
                          size="sm" 
                          @click="insertarPlaceholder('{{' + variable.nombre + '}}')"
                        >
                          <q-tooltip>Insertar en editor</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense icon="delete" color="negative" size="sm" @click="eliminarVariable(index)" />
                      </div>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="formulario.variables.length === 0">
                    <q-item-section class="text-grey italic text-center">Sin variables configuradas</q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>

            <!-- Columna Derecha: Editor HTML -->
            <div class="col-12 col-md-8">
              <q-card flat bordered class="column full-height bg-white">
                <div class="q-pa-md col-grow column">
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle1 text-weight-bold">Contenido del Documento</div>
                    <div class="text-caption text-grey-7">
                      {{ formulario.contenido_html.length }} caracteres
                    </div>
                  </div>
                   <q-editor
                    ref="editorRef"
                    v-model="formulario.contenido_html"
                    :definitions="definitions"
                    :toolbar="toolbar"
                    min-height="60vh"
                    class="full-width col-grow custom-editor"
                    flat
                  />
                  <div class="q-mt-md text-caption text-grey-8 bg-grey-2 q-pa-sm br-4">
                    <q-icon name="info" color="primary" class="q-mr-xs" />
                    <strong>Tip:</strong> Haz clic en las variables del panel izquierdo para insertarlas automáticamente en la posición del cursor.
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md shadow-2">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn 
            color="primary" 
            label="Guardar Plantilla" 
            icon="save"
            @click="guardarPlantilla"
            :loading="guardando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Previsualización -->
    <q-dialog v-model="mostrarPreview">
       <q-card style="width: 210mm; max-width: 95vw;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Vista Previa</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section class="q-pa-md overflow-hidden">
             <div ref="previewContainer" class="preview-paper" v-html="previewHTML"></div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" v-close-popup />
            <q-btn color="primary" label="Descargar PDF" icon="file_download" @click="exportarPDF" />
          </q-card-actions>
       </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { plantillaService } from 'src/services/plantilla.service'
import { usePDFGenerator } from 'src/composables/usePDFGenerator'

const $q = useQuasar()
const { descargarPDF } = usePDFGenerator()

// Estado
const loading = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const mostrarPreview = ref(false)
const modoEdicion = ref(false)
const plantillas = ref([])
const previewHTML = ref('')
const previewContainer = ref(null)

const formulario = reactive({
  id: null,
  codigo: '',
  nombre: '',
  descripcion: '',
  icono: 'description',
  color: '#2196F3',
  contenido_html: '',
  activo: 'S',
  requiere_firma: 'N',
  incluir_logo: 'S',
  tamano_papel: 'A4',
  orientacion: 'portrait',
  variables: []
})

const editorRef = ref(null)
const plantillaFormRef = ref(null)

const variablesSistema = [
  { 
    categoria: 'Paciente', 
    items: [
      { label: 'Nombre Mascota', value: '{{paciente_nombre}}' },
      { label: 'Especie', value: '{{paciente_especie}}' },
      { label: 'Raza', value: '{{paciente_raza}}' },
      { label: 'Edad', value: '{{paciente_edad}}' },
      { label: 'Peso', value: '{{paciente_peso}}' }
    ]
  },
  { 
    categoria: 'Propietario', 
    items: [
      { label: 'Nombre Propietario', value: '{{propietario_nombre}}' },
      { label: 'Teléfono', value: '{{propietario_telefono}}' }
    ]
  },
  { 
    categoria: 'Atención', 
    items: [
      { label: 'Número de Atención', value: '{{atencion_numero}}' },
      { label: 'Fecha', value: '{{atencion_fecha}}' },
      { label: 'Veterinario', value: '{{atencion_veterinario}}' }
    ]
  },
  {
    categoria: 'Servicios (Dinámicos)',
    items: [
      { label: 'Nombre Servicio', value: '{{servicio_nombre}}' },
      { label: 'Costo', value: '{{servicio_costo}}' },
      { label: 'Observaciones', value: '{{servicio_observaciones}}' },
      { label: 'Dato Específico (Vacuna, etc)', value: '{{datos.nombre_campo}}' }
    ]
  }
]

const columnas = [
  { name: 'icono', label: '', field: 'icono', align: 'center', style: 'width: 50px' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center', style: 'width: 150px' }
]

// Configuración del Editor
const definitions = computed(() => ({
  save: {
    tip: 'Guardar cambios',
    icon: 'save',
    label: 'Guardar',
    handler: guardarPlantilla
  }
}))

const toolbar = computed(() => [
  ['left', 'center', 'right', 'justify'],
  ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
  ['hr', 'link'],
  ['print', 'fullscreen'],
  [
    {
      label: $q.lang.editor.formatting,
      icon: $q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
    },
    {
      label: $q.lang.editor.fontSize,
      icon: $q.iconSet.editor.fontSize,
      fixedLabel: true,
      fixedIcon: true,
      list: 'no-icons',
      options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
    },
    'removeFormat'
  ],
  ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
  ['undo', 'redo'],
  ['viewsource']
])

// Métodos
const cargarPlantillas = async () => {
  loading.value = true
  try {
    plantillas.value = await plantillaService.getPlantillas()
    console.log('Plantillas cargadas:', plantillas.value)
  } catch (error) {
    console.error('Error al cargar plantillas:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar plantillas' })
  } finally {
    loading.value = false
  }
}

const abrirFormulario = (plantilla = null) => {
  modoEdicion.value = !!plantilla
  if (plantilla) {
    Object.assign(formulario, plantilla)
    if (!formulario.variables) formulario.variables = []
  } else {
    Object.assign(formulario, {
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      icono: 'description',
      color: '#2196F3',
      contenido_html: '<h1>Nuevo Documento</h1><p>Contenido de la plantilla...</p>',
      activo: 'S',
      requiere_firma: 'N',
      incluir_logo: 'S',
      tamano_papel: 'A4',
      orientacion: 'portrait',
      id_configuracion: 1,
      variables: []
    })
  }
  mostrarFormulario.value = true
}

const guardarPlantilla = async () => {
  const esValido = await plantillaFormRef.value.validate()
  if (!esValido) {
    $q.notify({ type: 'warning', message: 'Por favor complete los campos requeridos' })
    return
  }

  guardando.value = true
  try {
    const data = { ...formulario }
    if (modoEdicion.value) {
      await plantillaService.updatePlantilla(data.id, data)
      $q.notify({ type: 'positive', message: 'Plantilla actualizada exitosamente' })
    } else {
      await plantillaService.createPlantilla(data)
      $q.notify({ type: 'positive', message: 'Plantilla creada exitosamente' })
    }
    mostrarFormulario.value = false
    cargarPlantillas()
  } catch (error) {
    console.error('Error al guardar plantilla:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar la plantilla' })
  } finally {
    guardando.value = false
  }
}

const editarPlantilla = (plantilla) => {
  abrirFormulario(plantilla)
}

const eliminarPlantilla = (plantilla) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await plantillaService.deletePlantilla(plantilla.id)
      $q.notify({ type: 'positive', message: 'Plantilla eliminada' })
      cargarPlantillas()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

const agregarVariable = () => {
  formulario.variables.push({
    id_plantilla: formulario.id,
    nombre: 'nueva_variable',
    etiqueta: 'Nueva Variable',
    tipo_dato: 'text',
    requerido: 'N',
    orden: formulario.variables.length
  })
}

const insertarPlaceholder = (valor) => {
  if (editorRef.value) {
    editorRef.value.caret.restore()
    editorRef.value.runCmd('insertText', valor)
    editorRef.value.focus()
  }
}

const eliminarVariable = (index) => {
  formulario.variables.splice(index, 1)
}

const previsualizarPlantilla = (plantilla) => {
  let html = plantilla.contenido_html
  
  // Datos de ejemplo para la previsualización
  const mockData = {
    paciente_nombre: 'Fido',
    paciente_especie: 'Canino',
    paciente_raza: 'Golden Retriever',
    paciente_edad: '4',
    paciente_peso: '28.5',
    propietario_nombre: 'Juan Pérez',
    propietario_telefono: '555-0123',
    atencion_numero: 'A-2024-001',
    atencion_fecha: new Date().toLocaleDateString(),
    atencion_veterinario: 'Dr. Carlos Mendoza'
  }

  // Reemplazar placeholders con mockData
  Object.entries(mockData).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    html = html.replace(regex, `<span class="bg-yellow-2 text-weight-bold" title="Variable: ${key}">${value}</span>`)
  })

  // Reemplazar variables adicionales con placeholders genéricos
  formulario.variables.forEach(v => {
    const regex = new RegExp(`{{${v.nombre}}}`, 'g')
    html = html.replace(regex, `<span class="bg-blue-1 text-primary text-weight-bold" title="Variable Personalizada: ${v.nombre}">[${v.nombre}]</span>`)
  })

  // Reemplazar campos de datos dinámicos {{datos.xxx}}
  const dynamicRegex = /{{datos\.(.+?)}}/g
  html = html.replace(dynamicRegex, (match, field) => {
    return `<span class="bg-orange-1 text-orange-9 text-weight-bold" title="Campo de Servicio: ${field}">[DATO: ${field}]</span>`
  })

  previewHTML.value = html
  mostrarPreview.value = true
}

const exportarPDF = async () => {
  try {
    await descargarPDF(previewContainer.value, {
      nombreArchivo: 'vista_previa.pdf',
      orientacion: formulario.orientacion,
      tamanoPapel: formulario.tamano_papel
    })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  }
}

const estadisticas = computed(() => ({
  total: plantillas.value.length,
  activas: plantillas.value.filter(p => p.activo === 'S').length
}))

onMounted(cargarPlantillas)
</script>

<style lang="scss" scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #039BE5 0%, #4FC3F7 100%); // Azul Celeste Real
}

.br-4 { border-radius: 4px; }
.border-blue-light { border: 1px solid #e3f2fd; }

.custom-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.q-editor__tool-group) {
    padding: 8px; // Más espacio
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
  }
  
  :deep(.q-btn--dense) {
    padding: 10px; // Botones más grandes
    min-width: 40px;
    min-height: 40px;
    
    .q-icon {
      font-size: 24px; // Iconos más grandes
    }
  }
}

.opacity-80 {
  opacity: 0.8;
}

.preview-paper {
  background: white;
  min-height: 297mm;
  padding: 20mm;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin: 0 auto;
}
</style>
