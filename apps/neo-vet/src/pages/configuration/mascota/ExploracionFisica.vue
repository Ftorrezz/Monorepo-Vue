<template>
  <div class="configuracion-exploracion">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-auto">
        <div class="text-h5">Configuración de Exploración Física</div>
        <div class="text-caption text-grey-7">Configure los grupos y preguntas para este sitio</div>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nuevo Grupo"
          @click="abrirModalGrupo()"
        />
      </div>
    </div>

    <!-- Lista de Grupos Configurados -->
    <div class="row q-col-gutter-md">
      <div class="col-12" v-for="grupo in gruposConfiguracion" :key="grupo.id">
        <q-card class="grupo-card">
          <q-card-section>
            <div class="row items-center">
              <q-icon :name="grupo.icono" :color="grupo.color" size="md" class="q-mr-md"/>
              <div class="col">
                <div class="text-h6">{{ grupo.nombre }}</div>
                <div class="text-caption text-grey-7">{{ grupo.descripcion }}</div>
                <div class="text-caption">
                  <q-chip size="sm" color="blue" text-color="white">
                    {{ grupo.preguntas.length }} preguntas
                  </q-chip>
                  <q-chip 
                    size="sm" 
                    :color="grupo.activo ? 'green' : 'grey'" 
                    text-color="white"
                  >
                    {{ grupo.activo ? 'Activo' : 'Inactivo' }}
                  </q-chip>
                </div>
              </div>
              <div class="col-auto">
                <q-btn-dropdown flat round icon="more_vert">
                  <q-list>
                    <q-item clickable @click="editarGrupo(grupo)">
                      <q-item-section avatar>
                        <q-icon name="edit" color="primary"/>
                      </q-item-section>
                      <q-item-section>Editar Grupo</q-item-section>
                    </q-item>
                    <q-item clickable @click="gestionarPreguntas(grupo)">
                      <q-item-section avatar>
                        <q-icon name="quiz" color="orange"/>
                      </q-item-section>
                      <q-item-section>Gestionar Preguntas</q-item-section>
                    </q-item>
                    <q-item clickable @click="cambiarEstado(grupo)">
                      <q-item-section avatar>
                        <q-icon 
                          :name="grupo.activo ? 'toggle_off' : 'toggle_on'" 
                          :color="grupo.activo ? 'grey' : 'green'"
                        />
                      </q-item-section>
                      <q-item-section>
                        {{ grupo.activo ? 'Desactivar' : 'Activar' }}
                      </q-item-section>
                    </q-item>
                    <q-separator/>
                    <q-item clickable @click="eliminarGrupo(grupo)" class="text-negative">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative"/>
                      </q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </div>
          </q-card-section>

          <!-- Preview de preguntas -->
          <q-card-section v-if="grupo.preguntas.length > 0" class="pt-0">
            <q-separator class="q-mb-md"/>
            <div class="text-subtitle2 q-mb-sm">Preguntas configuradas:</div>
            <div class="row q-col-gutter-sm">
              <div 
                class="col-12 col-md-6" 
                v-for="pregunta in grupo.preguntas.slice(0, 4)" 
                :key="pregunta.id"
              >
                <q-chip 
                  size="sm" 
                  outline 
                  :color="getTipoColor(pregunta.tipo)"
                  :icon="getTipoIcon(pregunta.tipo)"
                >
                  {{ pregunta.etiqueta }}
                </q-chip>
              </div>
              <div class="col-12" v-if="grupo.preguntas.length > 4">
                <q-chip size="sm" outline color="grey">
                  +{{ grupo.preguntas.length - 4 }} más...
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Modal para Grupo -->
    <q-dialog v-model="mostrarModalGrupo" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ grupoEditando ? 'Editar Grupo' : 'Nuevo Grupo' }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input
              v-model="formularioGrupo.nombre"
              label="Nombre del Grupo *"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            
            <q-input
              v-model="formularioGrupo.descripcion"
              label="Descripción"
              outlined
              type="textarea"
              rows="2"
            />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  v-model="formularioGrupo.icono"
                  :options="iconosDisponibles"
                  label="Icono *"
                  outlined
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.value"/>
                      </q-item-section>
                      <q-item-section>{{ scope.opt.label }}</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <div class="col-6">
                <q-select
                  v-model="formularioGrupo.color"
                  :options="coloresDisponibles"
                  label="Color *"
                  outlined
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-avatar size="20px" :color="scope.opt.value"/>
                      </q-item-section>
                      <q-item-section>{{ scope.opt.label }}</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <q-input
              v-model.number="formularioGrupo.orden"
              label="Orden de Aparición"
              outlined
              type="number"
              min="1"
            />

            <q-toggle
              v-model="formularioGrupo.activo"
              label="Grupo Activo"
              color="positive"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarModalGrupo"/>
          <q-btn 
            color="primary" 
            label="Guardar" 
            @click="guardarGrupo"
            :disable="!formularioGrupoValido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para Gestión de Preguntas -->
    <q-dialog v-model="mostrarModalPreguntas" persistent maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Gestionar Preguntas - {{ grupoSeleccionado?.nombre }}</div>
          <div class="text-caption">Configure las preguntas para este grupo</div>
        </q-card-section>

        <q-card-section>
          <div class="row">
            <!-- Lista de Preguntas -->
            <div class="col-8">
              <div class="row items-center justify-between q-mb-md">
                <div class="col-auto">
                  <div class="text-h6">Preguntas Configuradas</div>
                </div>
                <div class="col-auto">
                  <q-btn 
                    color="primary" 
                    icon="add" 
                    label="Nueva Pregunta"
                    @click="abrirFormularioPregunta()"
                  />
                </div>
              </div>

              <q-list separator>
                <q-item 
                  v-for="(pregunta, index) in preguntasGrupo" 
                  :key="pregunta.id"
                  class="pregunta-item"
                >
                  <q-item-section avatar>
                    <q-icon :name="getTipoIcon(pregunta.tipo)" :color="getTipoColor(pregunta.tipo)"/>
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label>{{ pregunta.etiqueta }}</q-item-label>
                    <q-item-label caption>
                      <q-chip size="xs" :color="getTipoColor(pregunta.tipo)" text-color="white">
                        {{ getTipoLabel(pregunta.tipo) }}
                      </q-chip>
                      <span v-if="pregunta.requerido" class="text-orange q-ml-sm">• Requerido</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-btn 
                        flat 
                        round 
                        dense 
                        icon="arrow_upward" 
                        @click="moverPregunta(index, -1)"
                        :disable="index === 0"
                      />
                      <q-btn 
                        flat 
                        round 
                        dense 
                        icon="arrow_downward" 
                        @click="moverPregunta(index, 1)"
                        :disable="index === preguntasGrupo.length - 1"
                      />
                      <q-btn 
                        flat 
                        round 
                        dense 
                        icon="edit" 
                        color="primary"
                        @click="editarPregunta(pregunta)"
                      />
                      <q-btn 
                        flat 
                        round 
                        dense 
                        icon="delete" 
                        color="negative"
                        @click="eliminarPregunta(pregunta)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Formulario de Pregunta -->
            <div class="col-4 q-pl-md">
              <q-card v-if="mostrandoFormularioPregunta" class="formulario-pregunta">
                <q-card-section>
                  <div class="text-h6">
                    {{ preguntaEditando ? 'Editar Pregunta' : 'Nueva Pregunta' }}
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="q-gutter-md">
                    <q-input
                      v-model="formularioPregunta.etiqueta"
                      label="Etiqueta de la Pregunta *"
                      outlined
                      :rules="[val => !!val || 'La etiqueta es requerida']"
                    />

                    <q-input
                      v-model="formularioPregunta.codigo"
                      label="Código Único *"
                      outlined
                      :rules="[val => !!val || 'El código es requerido']"
                      hint="Código único para identificar la pregunta"
                    />

                    <q-select
                      v-model="formularioPregunta.tipo"
                      :options="tiposPreguntas"
                      label="Tipo de Pregunta *"
                      outlined
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                    />

                    <!-- Configuración específica por tipo -->
                    <div v-if="formularioPregunta.tipo === 'select'">
                      <q-input
                        v-model="opcionNueva"
                        label="Agregar Opción"
                        outlined
                        @keyup.enter="agregarOpcion"
                      >
                        <template v-slot:append>
                          <q-btn 
                            flat 
                            round 
                            dense 
                            icon="add" 
                            @click="agregarOpcion"
                          />
                        </template>
                      </q-input>
                      
                      <q-list v-if="formularioPregunta.opciones.length > 0" class="q-mt-sm">
                        <q-item 
                          v-for="(opcion, index) in formularioPregunta.opciones" 
                          :key="index"
                          dense
                        >
                          <q-item-section>{{ opcion.label }}</q-item-section>
                          <q-item-section side>
                            <q-btn 
                              flat 
                              round 
                              dense 
                              icon="delete" 
                              size="sm"
                              @click="eliminarOpcion(index)"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>

                    <div v-if="formularioPregunta.tipo === 'numerico'">
                      <div class="row q-col-gutter-sm">
                        <div class="col-4">
                          <q-input
                            v-model.number="formularioPregunta.minimo"
                            label="Mínimo"
                            outlined
                            type="number"
                          />
                        </div>
                        <div class="col-4">
                          <q-input
                            v-model.number="formularioPregunta.maximo"
                            label="Máximo"
                            outlined
                            type="number"
                          />
                        </div>
                        <div class="col-4">
                          <q-input
                            v-model="formularioPregunta.unidad"
                            label="Unidad"
                            outlined
                          />
                        </div>
                      </div>
                      
                      <q-input
                        v-model="formularioPregunta.paso"
                        label="Paso"
                        outlined
                        placeholder="1 o 0.1"
                      />
                    </div>

                    <q-input
                      v-model="formularioPregunta.placeholder"
                      label="Texto de Ayuda"
                      outlined
                    />

                    <q-toggle
                      v-model="formularioPregunta.requerido"
                      label="Campo Requerido"
                      color="orange"
                    />

                    <q-input
                      v-model.number="formularioPregunta.orden"
                      label="Orden"
                      outlined
                      type="number"
                      min="1"
                    />
                  </div>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancelar" @click="cerrarFormularioPregunta"/>
                  <q-btn 
                    color="primary" 
                    label="Guardar" 
                    @click="guardarPregunta"
                    :disable="!formularioPreguntaValido"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="Cerrar" @click="cerrarModalPreguntas"/>
          <q-btn color="primary" label="Guardar Configuración" @click="guardarConfiguracionCompleta"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Estados principales
const gruposConfiguracion = ref([])
const mostrarModalGrupo = ref(false)
const mostrarModalPreguntas = ref(false)
const mostrandoFormularioPregunta = ref(false)

// Estados de edición
const grupoEditando = ref(null)
const grupoSeleccionado = ref(null)
const preguntaEditando = ref(null)
const preguntasGrupo = ref([])

// Formularios
const formularioGrupo = ref({
  nombre: '',
  descripcion: '',
  icono: 'medical_services',
  color: 'blue',
  orden: 1,
  activo: true
})

const formularioPregunta = ref({
  etiqueta: '',
  codigo: '',
  tipo: 'texto',
  placeholder: '',
  requerido: false,
  orden: 1,
  opciones: [],
  minimo: null,
  maximo: null,
  unidad: '',
  paso: '1'
})

const opcionNueva = ref('')

// Opciones de configuración
const iconosDisponibles = [
  { label: 'Médico General', value: 'medical_services' },
  { label: 'Corazón', value: 'favorite' },
  { label: 'Pulmones', value: 'air' },
  { label: 'Cerebro', value: 'psychology' },
  { label: 'Huesos', value: 'skeleton' },
  { label: 'Digestivo', value: 'restaurant' },
  { label: 'Ojos', value: 'visibility' },
  { label: 'Oídos', value: 'hearing' },
  { label: 'Piel', value: 'healing' },
  { label: 'Termómetro', value: 'thermostat' },
  { label: 'Monitor', value: 'monitor_heart' }
]

const coloresDisponibles = [
  { label: 'Azul', value: 'blue' },
  { label: 'Rojo', value: 'red' },
  { label: 'Verde', value: 'green' },
  { label: 'Naranja', value: 'orange' },
  { label: 'Morado', value: 'purple' },
  { label: 'Marrón', value: 'brown' },
  { label: 'Gris', value: 'grey' },
  { label: 'Rosa', value: 'pink' }
]

const tiposPreguntas = [
  { label: 'Texto Simple', value: 'texto' },
  { label: 'Área de Texto', value: 'textarea' },
  { label: 'Número', value: 'numerico' },
  { label: 'Selección', value: 'select' },
  { label: 'Sí/No', value: 'checkbox' }
]

// Computed
const formularioGrupoValido = computed(() => {
  return formularioGrupo.value.nombre && 
         formularioGrupo.value.icono && 
         formularioGrupo.value.color
})

const formularioPreguntaValido = computed(() => {
  return formularioPregunta.value.etiqueta && 
         formularioPregunta.value.codigo && 
         formularioPregunta.value.tipo
})

// Métodos para grupos
const abrirModalGrupo = (grupo = null) => {
  if (grupo) {
    grupoEditando.value = grupo
    formularioGrupo.value = { ...grupo }
  } else {
    grupoEditando.value = null
    formularioGrupo.value = {
      nombre: '',
      descripcion: '',
      icono: 'medical_services',
      color: 'blue',
      orden: gruposConfiguracion.value.length + 1,
      activo: true
    }
  }
  mostrarModalGrupo.value = true
}

const cerrarModalGrupo = () => {
  mostrarModalGrupo.value = false
  grupoEditando.value = null
}

const guardarGrupo = async () => {
  try {
    const grupoData = {
      ...formularioGrupo.value,
      id: grupoEditando.value?.id || Date.now().toString(),
      preguntas: grupoEditando.value?.preguntas || []
    }

    if (grupoEditando.value) {
      const index = gruposConfiguracion.value.findIndex(g => g.id === grupoEditando.value.id)
      gruposConfiguracion.value[index] = grupoData
    } else {
      gruposConfiguracion.value.push(grupoData)
    }

    // Aquí harías la llamada al API
    await guardarConfiguracionEnAPI()
    
    cerrarModalGrupo()
  } catch (error) {
    console.error('Error al guardar grupo:', error)
  }
}

const editarGrupo = (grupo) => {
  abrirModalGrupo(grupo)
}

const cambiarEstado = async (grupo) => {
  grupo.activo = !grupo.activo
  await guardarConfiguracionEnAPI()
}

const eliminarGrupo = async (grupo) => {
  if (confirm('¿Está seguro de eliminar este grupo y todas sus preguntas?')) {
    const index = gruposConfiguracion.value.findIndex(g => g.id === grupo.id)
    gruposConfiguracion.value.splice(index, 1)
    await guardarConfiguracionEnAPI()
  }
}

// Métodos para preguntas
const gestionarPreguntas = (grupo) => {
  grupoSeleccionado.value = grupo
  preguntasGrupo.value = [...(grupo.preguntas || [])]
  mostrarModalPreguntas.value = true
}

const cerrarModalPreguntas = () => {
  mostrarModalPreguntas.value = false
  mostrandoFormularioPregunta.value = false
  grupoSeleccionado.value = null
  preguntasGrupo.value = []
}

const abrirFormularioPregunta = (pregunta = null) => {
  if (pregunta) {
    preguntaEditando.value = pregunta
    formularioPregunta.value = { ...pregunta }
  } else {
    preguntaEditando.value = null
    formularioPregunta.value = {
      etiqueta: '',
      codigo: '',
      tipo: 'texto',
      placeholder: '',
      requerido: false,
      orden: preguntasGrupo.value.length + 1,
      opciones: [],
      minimo: null,
      maximo: null,
      unidad: '',
      paso: '1'
    }
  }
  mostrandoFormularioPregunta.value = true
}

const cerrarFormularioPregunta = () => {
  mostrandoFormularioPregunta.value = false
  preguntaEditando.value = null
  opcionNueva.value = ''
}

const guardarPregunta = () => {
  const preguntaData = {
    ...formularioPregunta.value,
    id: preguntaEditando.value?.id || Date.now().toString()
  }

  if (preguntaEditando.value) {
    const index = preguntasGrupo.value.findIndex(p => p.id === preguntaEditando.value.id)
    preguntasGrupo.value[index] = preguntaData
  } else {
    preguntasGrupo.value.push(preguntaData)
  }

  cerrarFormularioPregunta()
}

const editarPregunta = (pregunta) => {
  abrirFormularioPregunta(pregunta)
}

const eliminarPregunta = (pregunta) => {
  if (confirm('¿Está seguro de eliminar esta pregunta?')) {
    const index = preguntasGrupo.value.findIndex(p => p.id === pregunta.id)
    preguntasGrupo.value.splice(index, 1)
  }
}

const moverPregunta = (index, direccion) => {
  const newIndex = index + direccion
  if (newIndex >= 0 && newIndex < preguntasGrupo.value.length) {
    const temp = preguntasGrupo.value[index]
    preguntasGrupo.value[index] = preguntasGrupo.value[newIndex]
    preguntasGrupo.value[newIndex] = temp
  }
}

// Métodos para opciones de select
const agregarOpcion = () => {
  if (opcionNueva.value.trim()) {
    formularioPregunta.value.opciones.push({
      label: opcionNueva.value.trim(),
      value: opcionNueva.value.toLowerCase().replace(/\s+/g, '_')
    })
    opcionNueva.value = ''
  }
}

const eliminarOpcion = (index) => {
  formularioPregunta.value.opciones.splice(index, 1)
}

// Métodos de utilidad
const getTipoIcon = (tipo) => {
  const iconos = {
    texto: 'text_fields',
    textarea: 'notes',
    numerico: 'numbers',
    select: 'list',
    checkbox: 'check_box'
  }
  return iconos[tipo] || 'help'
}

const getTipoColor = (tipo) => {
  const colores = {
    texto: 'blue',
    textarea: 'green',
    numerico: 'orange',
    select: 'purple',
    checkbox: 'grey'
  }
  return colores[tipo] || 'grey'
}

const getTipoLabel = (tipo) => {
  const labels = {
    texto: 'Texto',
    textarea: 'Área Texto',
    numerico: 'Número',
    select: 'Selección',
    checkbox: 'Sí/No'
  }
  return labels[tipo] || tipo
}

// Métodos de API
const cargarConfiguracion = async () => {
  try {
    // Aquí cargarías desde tu API
    // const response = await api.get('/configuracion-exploracion')
    // gruposConfiguracion.value = response.data
    
    // Datos de ejemplo
    gruposConfiguracion.value = [
      {
        id: '1',
        nombre: 'Signos Vitales',
        descripcion: 'Mediciones básicas de signos vitales',
        icono: 'thermostat',
        color: 'red',
        orden: 1,
        activo: true,
        preguntas: [
          {
            id: '1-1',
            etiqueta: 'Temperatura (°C)',
            codigo: 'temperatura',
            tipo: 'numerico',
            requerido: true,
            minimo: 35,
            maximo: 42,
            unidad: '°C',
            paso: '0.1',
            orden: 1
          },
          {
            id: '1-2',
            etiqueta: 'Frecuencia Cardíaca (lpm)',
            codigo: 'frecuencia_cardiaca',
            tipo: 'numerico',
            requerido: true,
            minimo: 40,
            maximo: 250,
            unidad: 'lpm',
            orden: 2
          }
        ]
      }
    ]
  } catch (error) {
    console.error('Error al cargar configuración:', error)
  }
}

const guardarConfiguracionEnAPI = async () => {
  try {
    // Aquí guardarías en tu API
    // await api.post('/configuracion-exploracion', gruposConfiguracion.value)
    console.log('Configuración guardada:', gruposConfiguracion.value)
  } catch (error) {
    console.error('Error al guardar configuración:', error)
  }
}

const guardarConfiguracionCompleta = async () => {
  // Actualizar el grupo seleccionado con las preguntas modificadas
  if (grupoSeleccionado.value) {
    const index = gruposConfiguracion.value.findIndex(g => g.id === grupoSeleccionado.value.id)
    if (index !== -1) {
      gruposConfiguracion.value[index].preguntas = [...preguntasGrupo.value]
    }
  }
  
  await guardarConfiguracionEnAPI()
  cerrarModalPreguntas()
}

// Lifecycle
onMounted(() => {
  cargarConfiguracion()
})
</script>

<style scoped>
.configuracion-exploracion {
  padding: 16px;
}

.grupo-card {
  margin-bottom: 16px;
}

.pregunta-item {
  border: 1px solid #e0e0e0;
  margin-bottom: 8px;
  border-radius: 4px;
}

.formulario-pregunta {
  position: sticky;
  top: 16px;
}
</style>