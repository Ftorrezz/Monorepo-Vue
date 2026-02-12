<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div>
        <q-btn 
          flat 
          icon="arrow_back" 
          label="Volver" 
          @click="$router.go(-1)"
          class="q-mb-sm"
        />
        <h5 class="q-ma-none">
          Campos de {{ modulo?.nombre || 'Configuración' }}
        </h5>
        <p class="text-grey-7 q-ma-none">Define los campos de configuración para este módulo</p>
      </div>
      <q-btn 
        color="primary" 
        label="Nuevo Campo" 
        icon="add"
        @click="abrirFormulario()"
      />
    </div>

    <!-- Tabla de campos agrupados -->
    <div v-for="grupo in camposAgrupados" :key="grupo.nombre" class="q-mb-lg">
      <q-card flat bordered>
        <q-card-section class="bg-grey-1">
          <div class="text-h6 text-primary">
            {{ grupo.nombre || 'Sin grupo' }}
          </div>
        </q-card-section>
        
        <q-table
          :rows="grupo.campos"
          :columns="columnas"
          :loading="loading"
          row-key="id"
          flat
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
        >
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-chip 
                :color="getTipoColor(props.value)" 
                text-color="white" 
                size="sm"
              >
                {{ getTipoLabel(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-validaciones="props">
            <q-td :props="props">
              <div v-if="props.value && Object.keys(props.value).length > 0">
                <q-chip 
                  v-for="(val, key) in props.value" 
                  :key="key" 
                  size="xs" 
                  outline
                  class="q-mr-xs"
                >
                  {{ key }}: {{ val }}
                </q-chip>
              </div>
              <span v-else class="text-grey-5">Sin validaciones</span>
            </q-td>
          </template>

          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.value"
                @update:model-value="cambiarEstadoCampo(props.row.id, $event)"
                color="positive"
              />
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
                  @click="editarCampo(props.row)"
                >
                  <q-tooltip>Editar campo</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="eliminarCampo(props.row)"
                >
                  <q-tooltip>Eliminar campo</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Dialog para crear/editar campo -->
    <q-dialog v-model="mostrarFormulario" persistent maximized>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ modoEdicion ? 'Editar Campo' : 'Nuevo Campo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll">
          <q-form @submit="guardarCampo" ref="formulario">
            <div class="row q-gutter-md">
              <!-- Información básica -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Información Básica</div>
                    
                    <q-input
                      v-model="formularioCampo.clave"
                      label="Clave del campo *"
                      hint="Identificador único (ej: max_intentos_login)"
                      :rules="[val => !!val || 'La clave es requerida']"
                      outlined
                      dense
                      class="q-mb-md"
                    />

                    <q-input
                      v-model="formularioCampo.etiqueta"
                      label="Etiqueta *"
                      hint="Texto que verá el usuario"
                      :rules="[val => !!val || 'La etiqueta es requerida']"
                      outlined
                      dense
                      class="q-mb-md"
                    />

                    <q-input
                      v-model="formularioCampo.descripcion"
                      label="Descripción"
                      outlined
                      dense
                      type="textarea"
                      rows="3"
                      class="q-mb-md"
                    />

                    <div class="row q-gutter-md">
                      <div class="col">
                        <q-input
                          v-model="formularioCampo.grupo"
                          label="Grupo"
                          hint="Para agrupar campos relacionados"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col">
                        <q-input
                          v-model.number="formularioCampo.orden"
                          label="Orden"
                          outlined
                          dense
                          type="number"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Configuración del campo -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Configuración del Campo</div>
                    
                    <q-select
                      v-model="formularioCampo.tipo_campo"
                      :options="tiposCampoDisponibles"
                      label="Tipo de campo *"
                      outlined
                      dense
                      emit-value
                      map-options
                      class="q-mb-md"
                      :rules="[val => !!val || 'El tipo es requerido']"
                    />

                    <q-select
                      v-model="formularioCampo.tipo_dato"
                      :options="tiposDatoDisponibles"
                      label="Tipo de dato *"
                      outlined
                      dense
                      emit-value
                      map-options
                      class="q-mb-md"
                    />

                    <q-input
                      v-model="formularioCampo.valor_defecto"
                      label="Valor por defecto"
                      outlined
                      dense
                      class="q-mb-md"
                    />

                    <!-- Opciones para campos select -->
                    <div v-if="formularioCampo.tipo_campo === 'select'">
                      <div class="text-subtitle2 q-mb-sm">Opciones del Select</div>
                      <div v-for="(opcion, index) in opcionesSelect" :key="index" class="row q-gutter-sm q-mb-sm">
                        <div class="col">
                          <q-input
                            v-model="opcion.value"
                            label="Valor"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col">
                          <q-input
                            v-model="opcion.label"
                            label="Etiqueta"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-auto">
                          <q-btn
                            flat
                            round
                            icon="delete"
                            color="negative"
                            @click="eliminarOpcion(index)"
                          />
                        </div>
                      </div>
                      <q-btn
                        flat
                        icon="add"
                        label="Agregar opción"
                        @click="agregarOpcion"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Validaciones -->
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Validaciones</div>
                    
                    <div class="row q-gutter-md">
                      <div class="col-12 col-md-3">
                        <q-checkbox
                          v-model="validaciones.required"
                          label="Campo requerido"
                        />
                      </div>
                      
                      <div class="col-12 col-md-3" v-if="formularioCampo.tipo_dato === 'integer'">
                        <q-input
                          v-model.number="validaciones.min"
                          label="Valor mínimo"
                          outlined
                          dense
                          type="number"
                        />
                      </div>
                      
                      <div class="col-12 col-md-3" v-if="formularioCampo.tipo_dato === 'integer'">
                        <q-input
                          v-model.number="validaciones.max"
                          label="Valor máximo"
                          outlined
                          dense
                          type="number"
                        />
                      </div>
                      
                      <div class="col-12 col-md-3" v-if="formularioCampo.tipo_dato === 'string'">
                        <q-input
                          v-model.number="validaciones.minLength"
                          label="Longitud mínima"
                          outlined
                          dense
                          type="number"
                        />
                      </div>
                      
                      <div class="col-12 col-md-3" v-if="formularioCampo.tipo_dato === 'string'">
                        <q-input
                          v-model.number="validaciones.maxLength"
                          label="Longitud máxima"
                          outlined
                          dense
                          type="number"
                        />
                      </div>
                      
                      <div class="col-12" v-if="formularioCampo.tipo_dato === 'string'">
                        <q-input
                          v-model="validaciones.pattern"
                          label="Patrón (RegExp)"
                          hint="Expresión regular para validación personalizada"
                          outlined
                          dense
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn 
            color="primary" 
            label="Guardar" 
            @click="$refs.formulario.submit()"
            :loading="guardando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()

// Estado reactivo
const loading = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const modulo = ref(null)
const campos = ref([])

// Formulario
const formularioCampo = reactive({
  id: null,
  id_seccion: null,
  clave: '',
  etiqueta: '',
  descripcion: '',
  tipo_campo: 'text',
  tipo_dato: 'string',
  valor_defecto: '',
  grupo: '',
  orden: 0,
  activo: true
})

const validaciones = reactive({
  required: false,
  min: null,
  max: null,
  minLength: null,
  maxLength: null,
  pattern: ''
})

const opcionesSelect = ref([
  { value: '', label: '' }
])

// Columnas de la tabla
const columnas = [
  {
    name: 'clave',
    required: true,
    label: 'Clave',
    align: 'left',
    field: 'clave',
    sortable: true
  },
  {
    name: 'etiqueta',
    label: 'Etiqueta',
    field: 'etiqueta',
    align: 'left'
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo_campo',
    align: 'center'
  },
  {
    name: 'validaciones',
    label: 'Validaciones',
    field: 'validaciones',
    align: 'left'
  },
  {
    name: 'orden',
    label: 'Orden',
    field: 'orden',
    align: 'center',
    sortable: true,
    style: 'width: 80px'
  },
  {
    name: 'activo',
    label: 'Activo',
    field: 'activo',
    align: 'center',
    style: 'width: 80px'
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    style: 'width: 120px'
  }
]

// Opciones para formularios
const tiposCampoDisponibles = [
  { label: 'Texto', value: 'text' },
  { label: 'Número', value: 'number' },
  { label: 'Booleano', value: 'boolean' },
  { label: 'Selección', value: 'select' },
  { label: 'Área de texto', value: 'textarea' },
  { label: 'JSON', value: 'json' },
  { label: 'Fecha', value: 'date' },
  { label: 'Email', value: 'email' },
  { label: 'URL', value: 'url' }
]

const tiposDatoDisponibles = [
  { label: 'Texto', value: 'string' },
  { label: 'Entero', value: 'integer' },
  { label: 'Decimal', value: 'decimal' },
  { label: 'Booleano', value: 'boolean' },
  { label: 'JSON', value: 'json' },
  { label: 'Fecha', value: 'date' }
]

// Computed
const camposAgrupados = computed(() => {
  const grupos = {}
  
  campos.value.forEach(campo => {
    const nombreGrupo = campo.grupo || 'Sin grupo'
    if (!grupos[nombreGrupo]) {
      grupos[nombreGrupo] = {
        nombre: nombreGrupo,
        campos: []
      }
    }
    grupos[nombreGrupo].campos.push(campo)
  })
  
  // Ordenar campos dentro de cada grupo
  Object.keys(grupos).forEach(grupo => {
    grupos[grupo].campos.sort((a, b) => a.orden - b.orden)
  })
  
  return Object.values(grupos)
})

// Watchers
watch(() => formularioCampo.tipo_campo, (newVal) => {
  if (newVal === 'select' && opcionesSelect.value.length === 1 && !opcionesSelect.value[0].value) {
    opcionesSelect.value = [
      { value: 'opcion1', label: 'Opción 1' },
      { value: 'opcion2', label: 'Opción 2' }
    ]
  }
})

// Métodos
const cargarModulo = async () => {
  try {
    const moduloId = route.params.id
    // const response = await api.get(`/modulos-configuracion/${moduloId}`)
    // modulo.value = response.data
    
    // Datos de ejemplo
    modulo.value = {
      id: parseInt(moduloId),
      nombre: 'usuarios',
      descripcion: 'Configuración de usuarios del sistema'
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar módulo'
    })
  }
}

const cargarCampos = async () => {
  loading.value = true
  try {
    const moduloId = route.params.id
    // const response = await api.get(`/campos-configuracion?modulo_id=${moduloId}`)
    // campos.value = response.data
    
    // Datos de ejemplo
    campos.value = [
      {
        id: 1,
        modulo_id: parseInt(moduloId),
        clave: 'max_intentos_login',
        etiqueta: 'Máximo intentos de login',
        descripcion: 'Número máximo de intentos fallidos antes de bloquear usuario',
        tipo_campo: 'number',
        tipo_dato: 'integer',
        validaciones: { required: true, min: 1, max: 10 },
        grupo: 'autenticacion',
        orden: 1,
        activo: true
      },
      {
        id: 2,
        modulo_id: parseInt(moduloId),
        clave: 'tiempo_bloqueo',
        etiqueta: 'Tiempo de bloqueo (minutos)',
        descripcion: 'Tiempo en minutos que permanece bloqueado el usuario',
        tipo_campo: 'number',
        tipo_dato: 'integer',
        validaciones: { required: true, min: 5, max: 1440 },
        grupo: 'autenticacion',
        orden: 2,
        activo: true
      },
      {
        id: 3,
        modulo_id: parseInt(moduloId),
        clave: 'politica_password',
        etiqueta: 'Política de contraseñas',
        descripcion: 'Nivel de complejidad requerido para contraseñas',
        tipo_campo: 'select',
        tipo_dato: 'string',
        opciones: {
          opciones: [
            { value: 'basica', label: 'Básica' },
            { value: 'intermedia', label: 'Intermedia' },
            { value: 'avanzada', label: 'Avanzada' }
          ]
        },
        validaciones: { required: true },
        grupo: 'autenticacion',
        orden: 3,
        activo: true
      },
      {
        id: 4,
        modulo_id: parseInt(moduloId),
        clave: 'permitir_registro',
        etiqueta: 'Permitir auto-registro',
        descripcion: 'Permitir que usuarios se registren automáticamente',
        tipo_campo: 'boolean',
        tipo_dato: 'boolean',
        validaciones: {},
        grupo: 'registro',
        orden: 4,
        activo: true
      }
    ]
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar campos'
    })
  } finally {
    loading.value = false
  }
}

const getTipoColor = (tipo) => {
  const colores = {
    text: 'blue',
    number: 'green',
    boolean: 'orange',
    select: 'purple',
    textarea: 'teal',
    json: 'deep-orange',
    date: 'pink',
    email: 'cyan',
    url: 'indigo'
  }
  return colores[tipo] || 'grey'
}

const getTipoLabel = (tipo) => {
  const labels = {
    text: 'Texto',
    number: 'Número',
    boolean: 'Booleano',
    select: 'Selección',
    textarea: 'Área de texto',
    json: 'JSON',
    date: 'Fecha',
    email: 'Email',
    url: 'URL'
  }
  return labels[tipo] || tipo
}

const abrirFormulario = (campo = null) => {
  modoEdicion.value = !!campo
  if (campo) {
    Object.assign(formularioCampo, campo)
    // Cargar validaciones
    if (campo.validaciones) {
      Object.assign(validaciones, campo.validaciones)
    } else {
      limpiarValidaciones()
    }
    // Cargar opciones para select
    if (campo.tipo_campo === 'select' && campo.opciones?.opciones) {
      opcionesSelect.value = [...campo.opciones.opciones]
    } else {
      opcionesSelect.value = [{ value: '', label: '' }]
    }
  } else {
    limpiarFormulario()
  }
  mostrarFormulario.value = true
}

const limpiarFormulario = () => {
  Object.assign(formularioCampo, {
    id: null,
    modulo_id: parseInt(route.params.id),
    clave: '',
    etiqueta: '',
    descripcion: '',
    tipo_campo: 'text',
    tipo_dato: 'string',
    valor_defecto: '',
    grupo: '',
    orden: 0,
    activo: true
  })
  limpiarValidaciones()
  opcionesSelect.value = [{ value: '', label: '' }]
}

const limpiarValidaciones = () => {
  Object.assign(validaciones, {
    required: false,
    min: null,
    max: null,
    minLength: null,
    maxLength: null,
    pattern: ''
  })
}

const agregarOpcion = () => {
  opcionesSelect.value.push({ value: '', label: '' })
}

const eliminarOpcion = (index) => {
  if (opcionesSelect.value.length > 1) {
    opcionesSelect.value.splice(index, 1)
  }
}

const guardarCampo = async () => {
  guardando.value = true
  try {
    // Preparar validaciones
    const validacionesLimpias = {}
    Object.keys(validaciones).forEach(key => {
      if (validaciones[key] !== null && validaciones[key] !== '' && validaciones[key] !== false) {
        validacionesLimpias[key] = validaciones[key]
      }
    })
    
    // Preparar opciones para select
    let opciones = null
    if (formularioCampo.tipo_campo === 'select') {
      opciones = {
        opciones: opcionesSelect.value.filter(op => op.value && op.label)
      }
    }
    
    const datoCampo = {
      ...formularioCampo,
      validaciones: validacionesLimpias,
      opciones
    }
    
    if (modoEdicion.value) {
      // await api.put(`/campos-configuracion/${formularioCampo.id}`, datoCampo)
      const index = campos.value.findIndex(c => c.id === formularioCampo.id)
      if (index !== -1) {
        campos.value[index] = { ...datoCampo }
      }
      $q.notify({
        type: 'positive',
        message: 'Campo actualizado correctamente'
      })
    } else {
      // const response = await api.post('/campos-configuracion', datoCampo)
      campos.value.push({
        ...datoCampo,
        id: Date.now() // Simulado
      })
      $q.notify({
        type: 'positive',
        message: 'Campo creado correctamente'
      })
    }
    mostrarFormulario.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar campo'
    })
  } finally {
    guardando.value = false
  }
}

const editarCampo = (campo) => {
  abrirFormulario(campo)
}

const cambiarEstadoCampo = async (id, estado) => {
  try {
    // await api.patch(`/campos-configuracion/${id}`, { activo: estado })
    const index = campos.value.findIndex(c => c.id === id)
    if (index !== -1) {
      campos.value[index].activo = estado
    }
    $q.notify({
      type: 'positive',
      message: `Campo ${estado ? 'activado' : 'desactivado'}`
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado'
    })
  }
}

const eliminarCampo = (campo) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el campo "${campo.etiqueta}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      // await api.delete(`/campos-configuracion/${campo.id}`)
      campos.value = campos.value.filter(c => c.id !== campo.id)
      $q.notify({
        type: 'positive',
        message: 'Campo eliminado correctamente'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar campo'
      })
    }
  })
}

// Ciclo de vida
onMounted(() => {
  cargarModulo()
  cargarCampos()
})
</script>