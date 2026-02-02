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
            <q-btn flat round icon="add_circle" @click="abrirFormulario()" size="md">
              <q-tooltip>Nueva Plantilla</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de plantillas -->
    <q-table :rows="plantillas" :columns="columnas" :loading="loading" row-key="id" flat bordered>
      <template v-slot:body-cell-icono="props">
        <q-td :props="props">
          <q-avatar size="36px" :style="{ backgroundColor: props.row.color || '#2196F3' }" text-color="white" class="shadow-1">
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
            <q-btn flat icon="edit" color="primary" size="sm" @click="editarPlantilla(props.row)"><q-tooltip>Editar</q-tooltip></q-btn>
            <q-btn flat icon="delete" color="negative" size="sm" @click="eliminarPlantilla(props.row)"><q-tooltip>Eliminar</q-tooltip></q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de Edición (PRO EDITOR REDESIGN) -->
    <q-dialog v-model="mostrarFormulario" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column no-wrap bg-grey-1">
        <!-- HEADER ESTILO IMAGEN -->
        <q-toolbar class="bg-white text-grey-9 border-bottom q-py-sm">
          <q-icon name="edit" color="primary" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold">
            Editor: <span class="text-primary">{{ formulario.nombre || 'Nueva Plantilla' }}</span>
            <q-chip size="sm" color="green-1" text-color="green-9" icon="check_circle" class="q-ml-sm text-weight-bold">
              Guardado
            </q-chip>
          </q-toolbar-title>
          <q-space />
          <div class="q-gutter-sm row items-center">
            <q-btn flat round dense icon="undo" @click="undo">
              <q-tooltip>Deshacer cambio (Flecha izquierda)</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="redo" @click="redo">
              <q-tooltip>Rehacer cambio (Flecha derecha)</q-tooltip>
            </q-btn>
            <q-separator vertical inset class="q-mx-sm" />
            <q-btn 
              flat 
              round 
              dense 
              :icon="mostrarVistaPreviaSeccion ? 'visibility_off' : 'visibility'" 
              :color="mostrarVistaPreviaSeccion ? 'primary' : 'grey-7'"
              @click="mostrarVistaPreviaSeccion = !mostrarVistaPreviaSeccion"
            >
              <q-tooltip>{{ mostrarVistaPreviaSeccion ? 'Ocultar Vista Previa' : 'Ver Vista Previa' }}</q-tooltip>
            </q-btn>
            <q-btn unelevated color="white" text-color="grey-9" icon="save" label="Guardar" class="border" @click="guardarPlantilla" :loading="guardando">
              <q-tooltip>Guardar todos los cambios</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="settings">
              <q-tooltip>Configuración avanzada</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="close" v-close-popup>
              <q-tooltip>Cerrar editor</q-tooltip>
            </q-btn>
          </div>
        </q-toolbar>

        <!-- AREA DE EDICIÓN Y VISTA PREVIA -->
        <q-scroll-area class="col">
          <div class="q-pa-md q-gutter-md">
            <!-- Formulario de Metadatos Compacto -->
            <q-card flat bordered class="bg-white q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input v-model="formulario.nombre" label="Nombre de la Plantilla" outlined dense bg-color="white" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formulario.codigo" label="Código Único" outlined dense bg-color="white" :readonly="modoEdicion" />
                </div>
                <div class="col-12 col-md-4">
                  <div class="row q-gutter-sm items-center no-wrap">
                    <q-select v-model="formulario.tamano_papel" :options="['A4', 'Letter', 'Legal']" label="Papel" outlined dense bg-color="white" class="col" />
                    <q-btn-toggle
                      v-model="formulario.orientacion"
                      flat text-color="grey-7" toggle-color="primary"
                      :options="[{icon: 'portrait', value: 'portrait'}, {icon: 'landscape', value: 'landscape'}]"
                    />
                  </div>
                </div>
              </div>
            </q-card>

            <!-- EDITOR HTML -->
            <q-card flat bordered class="column bg-white overflow-hidden">
               <q-editor
                ref="editorRef"
                v-model="formulario.contenido_html"
                :definitions="definitions"
                :toolbar="toolbar"
                min-height="40vh"
                class="full-width no-border-radius custom-editor-pro"
                flat
                placeholder="Escribe tu template aquí..."
              />
            </q-card>

            <!-- BARRA DE VARIABLES (MOVIDA Y CON WRAP) -->
            <div class="bg-blue-grey-1 q-pa-sm border br-4">
              <div class="row items-center q-px-md q-mb-xs">
                <q-icon name="code" size="xs" color="blue-grey-7" class="q-mr-xs" />
                <div class="text-caption text-weight-bold text-blue-grey-7 uppercase-tracking">Variables Disponibles</div>
                <q-space />
                <q-btn dense flat color="primary" label="+ NUEVA VARIABLE" size="sm" @click="agregarVariable" class="text-weight-bold" />
              </div>
              <div class="row q-gutter-xs q-px-md items-center">
                <!-- Variables del Sistema -->
                <template v-for="cat in variablesSistema" :key="cat.categoria">
                  <q-btn
                    v-for="item in cat.items"
                    :key="item.value"
                    size="11px"
                    rounded
                    unelevated
                    color="blue-7"
                    text-color="white"
                    :label="item.value"
                    class="variable-chip"
                    @click="insertarPlaceholder(item.value)"
                  >
                    <q-tooltip>{{ cat.categoria }}: {{ item.label }}</q-tooltip>
                  </q-btn>
                </template>
                <!-- Variables Personalizadas -->
                <q-btn
                  v-for="(v, index) in formulario.variables"
                  :key="index"
                  size="11px"
                  rounded
                  unelevated
                  color="indigo-7"
                  text-color="white"
                  :label="'{{' + v.nombre + '}}'"
                  class="variable-chip"
                  @click="insertarPlaceholder('{{' + v.nombre + '}}')"
                >
                  <q-menu touch-position context-menu>
                    <q-list dense>
                      <q-item clickable @click="editarVariable(index)">
                        <q-item-section side><q-icon name="edit" color="primary" size="xs" /></q-item-section>
                        <q-item-section>Editar</q-item-section>
                      </q-item>
                      <q-item clickable @click="eliminarVariable(index)">
                        <q-item-section side><q-icon name="delete" color="negative" size="xs" /></q-item-section>
                        <q-item-section>Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                  <q-tooltip>Variable Personalizada: {{ v.nombre }}. Haz Clic Derecho para editar o eliminar.</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- SECCIÓN DE VISTA PREVIA INTEGRADA (OPCIONAL) -->
            <q-card flat bordered class="column bg-white shadow-2" v-if="mostrarVistaPreviaSeccion">
              <q-toolbar class="bg-grey-1 border-bottom q-py-xs">
                <q-icon name="visibility" color="blue-grey-7" size="xs" class="q-mr-sm" />
                <q-toolbar-title class="text-caption text-weight-bold text-blue-grey-7 uppercase-tracking">
                  Vista Previa
                  <q-chip size="xs" color="green-1" text-color="green-9" label="Actualizado" class="q-ml-sm" v-if="previewAutoUpdate" />
                </q-toolbar-title>
                <q-space />
                <div class="q-gutter-xs">
                  <q-btn flat round dense size="sm" icon="refresh" />
                  <q-btn flat round dense size="sm" icon="zoom_in" />
                  <q-btn flat round dense size="sm" icon="fullscreen" />
                  <q-separator vertical inset class="q-mx-xs" />
                  <q-btn flat round dense size="sm" icon="code" />
                  <q-btn flat round dense size="sm" icon="print" @click="imprimirPreview" />
                  <q-btn flat round dense size="sm" icon="download" @click="descargarCaptura" />
                </div>
              </q-toolbar>

              <div class="q-pa-lg bg-blue-grey-1 flex justify-center preview-container-pro">
                <div v-if="!formulario.contenido_html" class="column items-center justify-center text-grey-5 q-pa-xl" style="min-height: 400px">
                  <q-icon name="visibility_off" size="64px" class="q-mb-md" />
                  <div class="text-h6">Vista previa vacía</div>
                  <div class="text-caption">Escribe algo en el editor para ver el resultado aquí</div>
                </div>
                <div 
                  v-else 
                  ref="previewContainerPro" 
                  class="preview-paper shadow-10" 
                  :class="{'landscape': formulario.orientacion === 'landscape'}" 
                  v-html="processedPreviewHTML"
                />
              </div>
            </q-card>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <!-- Diálogo para Nueva/Editar Variable -->
    <q-dialog v-model="dialogoNuevaVariable" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ modoEdicionVariable ? 'Editar Variable' : 'Nueva Variable Personalizada' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="q-gutter-md">
            <q-input 
              v-model="variableTmp.nombre" 
              label="Código de la Variable (sin llaves)" 
              hint="Ej: diagnostico_previo"
              outlined 
              dense 
              autofocus
            />
            <q-select 
              v-model="variableTmp.tipo_dato" 
              :options="['text', 'date', 'number', 'bool']" 
              label="Tipo de Dato" 
              outlined 
              dense 
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated :label="modoEdicionVariable ? 'Actualizar' : 'Agregar'" color="primary" @click="confirmarVariable" />
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

// --- ESTADO ---
const loading = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const plantillas = ref([])
const previewContainerPro = ref(null)
const previewAutoUpdate = ref(true)
const mostrarVistaPreviaSeccion = ref(false) // Por defecto oculta para dar más espacio
const dialogoNuevaVariable = ref(false)
const modoEdicionVariable = ref(false)
const variableIndexEdicion = ref(-1)
const variableTmp = reactive({
  nombre: '',
  tipo_dato: 'text'
})

const agregarVariable = () => {
  modoEdicionVariable.value = false
  variableTmp.nombre = ''
  variableTmp.tipo_dato = 'text'
  dialogoNuevaVariable.value = true
}

const editarVariable = (index) => {
  modoEdicionVariable.value = true
  variableIndexEdicion.value = index
  const v = formulario.variables[index]
  variableTmp.nombre = v.nombre
  variableTmp.tipo_dato = v.tipo_dato
  dialogoNuevaVariable.value = true
}

const confirmarVariable = () => {
  if (!variableTmp.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' })
    return
  }
  
  if (modoEdicionVariable.value) {
    formulario.variables[variableIndexEdicion.value].nombre = variableTmp.nombre
    formulario.variables[variableIndexEdicion.value].tipo_dato = variableTmp.tipo_dato
  } else {
    formulario.variables.push({
      id_plantilla: formulario.id,
      nombre: variableTmp.nombre,
      etiqueta: variableTmp.nombre,
      tipo_dato: variableTmp.tipo_dato,
      requerido: 'N',
      orden: formulario.variables.length
    })
  }
  
  dialogoNuevaVariable.value = false
  $q.notify({ type: 'positive', message: modoEdicionVariable.value ? 'Variable actualizada' : 'Variable agregada' })
}
const editorRef = ref(null)

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

// --- CONFIGURACIÓN ---
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

const processedPreviewHTML = computed(() => {
  let html = formulario.contenido_html || ''
  if (!html) return ''

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

  Object.entries(mockData).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    html = html.replace(regex, `<span class="var-badge var-system">${value}</span>`)
  })

  formulario.variables.forEach(v => {
    const regex = new RegExp(`{{${v.nombre}}}`, 'g')
    html = html.replace(regex, `<span class="var-badge var-custom">[${v.nombre}]</span>`)
  })

  const dynamicRegex = /{{datos\.(.+?)}}/g
  html = html.replace(dynamicRegex, (match, field) => {
    return `<span class="var-badge var-dynamic">[DATO: ${field}]</span>`
  })

  return html
})

const estadisticas = computed(() => ({
  total: plantillas.value.length,
  activas: plantillas.value.filter(p => p.activo === 'S').length
}))

const definitions = computed(() => ({
  save: { tip: 'Guardar cambios', icon: 'save', label: 'Guardar', handler: guardarPlantilla },
  // Definiciones de color para el editor
  'text-red': { label: 'Rojo', icon: 'format_color_text', tip: 'Color Rojo', handler: () => editorRef.value.runCmd('foreColor', '#f44336') },
  'text-blue': { label: 'Azul', icon: 'format_color_text', tip: 'Color Azul', handler: () => editorRef.value.runCmd('foreColor', '#2196f3') },
  'text-green': { label: 'Verde', icon: 'format_color_text', tip: 'Color Verde', handler: () => editorRef.value.runCmd('foreColor', '#4caf50') },
  'text-black': { label: 'Negro', icon: 'format_color_text', tip: 'Color Negro', handler: () => editorRef.value.runCmd('foreColor', '#000000') }
}))

const toolbar = computed(() => [
  [
    {
      label: $q.lang.editor.formatting,
      icon: $q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
    }
  ],
  ['bold', 'italic', 'underline', 'strike'],
  ['link', 'hr'],
  ['left', 'center', 'right', 'justify'],
  ['unordered', 'ordered', 'outdent', 'indent'],
  [
    {
      label: 'Tamaño',
      icon: 'format_size',
      fixedLabel: true,
      list: 'no-icons',
      options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
    },
    {
      label: 'Color',
      icon: 'palette',
      fixedLabel: true,
      list: 'no-icons',
      options: ['text-red', 'text-blue', 'text-green', 'text-black']
    },
    'removeFormat'
  ],
  ['quote', 'undo', 'redo'],
  ['viewsource', 'fullscreen']
])

// --- MÉTODOS ---
const cargarPlantillas = async () => {
  loading.value = true
  try {
    plantillas.value = await plantillaService.getPlantillas()
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
      id: null, codigo: '', nombre: '', descripcion: '', icono: 'description', color: '#2196F3',
      contenido_html: '<h1>Nuevo Documento</h1><p>Contenido de la plantilla...</p>',
      activo: 'S', requiere_firma: 'N', incluir_logo: 'S', tamano_papel: 'A4', orientacion: 'portrait', variables: []
    })
  }
  mostrarFormulario.value = true
}

const guardarPlantilla = async () => {
  if (!formulario.nombre || !formulario.codigo) {
    $q.notify({ type: 'warning', message: 'Nombre y código son requeridos' })
    return
  }
  guardando.value = true
  try {
    const data = { ...formulario }
    if (modoEdicion.value) {
      await plantillaService.updatePlantilla(data.id, data)
      $q.notify({ type: 'positive', message: 'Plantilla actualizada' })
    } else {
      await plantillaService.createPlantilla(data)
      $q.notify({ type: 'positive', message: 'Plantilla creada' })
    }
    mostrarFormulario.value = false
    cargarPlantillas()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar la plantilla' })
  } finally {
    guardando.value = false
  }
}

const editarPlantilla = (plantilla) => abrirFormulario(plantilla)

const eliminarPlantilla = (plantilla) => {
  $q.dialog({ title: 'Confirmar eliminación', message: `¿Eliminar "${plantilla.nombre}"?`, cancel: true, persistent: true }).onOk(async () => {
    try {
      await plantillaService.deletePlantilla(plantilla.id)
      $q.notify({ type: 'positive', message: 'Plantilla eliminada' })
      cargarPlantillas()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}


const insertarPlaceholder = (valor) => {
  if (editorRef.value) {
    editorRef.value.caret.restore()
    editorRef.value.runCmd('insertText', valor)
    editorRef.value.focus()
  }
}

const eliminarVariable = (index) => formulario.variables.splice(index, 1)

const undo = () => { if (editorRef.value) editorRef.value.runCmd('undo') }
const redo = () => { if (editorRef.value) editorRef.value.runCmd('redo') }

const imprimirPreview = () => {
  if (previewContainerPro.value) {
    const printWindow = window.open('', '_blank')
    printWindow.document.write('<html><head><title>Imprimir</title>')
    printWindow.document.write('<style>body { font-family: sans-serif; padding: 20px; } .preview-paper { background: white; width: 210mm; margin: 0 auto; }<\/style>')
    printWindow.document.write('</head><body>')
    printWindow.document.write(previewContainerPro.value.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

const descargarCaptura = async () => {
  try {
    await descargarPDF(previewContainerPro.value, {
      nombreArchivo: `${formulario.codigo || 'plantilla'}.pdf`,
      orientacion: formulario.orientacion,
      tamanoPapel: formulario.tamano_papel
    })
    $q.notify({ type: 'positive', message: 'PDF generado correctamente' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  }
}

onMounted(cargarPlantillas)
</script>

<style lang="scss" scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #039BE5 0%, #4FC3F7 100%);
}

.border-bottom { border-bottom: 1px solid #e0e0e0; }
.border-right { border-right: 1px solid #e0e0e0; }
.border { border: 1px solid #e0e0e0; }
.br-4 { border-radius: 4px; }

.uppercase-tracking {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.7rem;
}

.variable-chip {
  height: 28px;
  font-family: monospace;
  font-weight: bold;
  opacity: 0.9;
  &:hover { opacity: 1; transform: translateY(-1px); }
}

.hide-scrollbar {
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-editor-pro {
  border: none;
  :deep(.q-editor__tool-group) {
    padding: 8px 16px;
    background: #ffffff;
    border-bottom: 2px solid #f1f1f1;
  }
  :deep(.q-btn--dense) {
    padding: 8px;
    min-width: 36px;
    min-height: 36px;
    .q-icon { font-size: 20px; }
  }
}

.preview-container-pro {
  min-height: 600px;
  overflow: auto;
}

.preview-paper {
  background: white;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  margin-bottom: 40px;
  transform-origin: top center;
  transition: all 0.3s ease;
  &.landscape { width: 297mm; min-height: 210mm; }
}

:deep(.var-badge) {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.95em;
  &.var-system { background-color: #fff9c4; color: #f57f17; border: 1px solid #fff176; }
  &.var-custom { background-color: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; }
  &.var-dynamic { background-color: #f1f8e9; color: #33691e; border: 1px solid #aed581; }
}

.opacity-80 { opacity: 0.8; }
</style>
