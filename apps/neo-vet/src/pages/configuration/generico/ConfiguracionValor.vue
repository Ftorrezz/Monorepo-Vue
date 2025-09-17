<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div>
        <q-btn 
          flat 
          icon="arrow_back" 
          label="Volver" 
          @click="$router.push('/admin/modulos')"
          class="q-mb-sm"
        />
        <h5 class="q-ma-none">
          <q-icon :name="modulo?.icono" :color="modulo?.color" class="q-mr-sm" />
          Configuración de {{ modulo?.nombre || 'Módulo' }}
        </h5>
        <p class="text-grey-7 q-ma-none">{{ modulo?.descripcion }}</p>
      </div>
      <div>
        <q-btn 
          color="positive" 
          label="Guardar Cambios" 
          icon="save"
          @click="guardarConfiguracion"
          :loading="guardando"
          :disable="!hayChangios"
          class="q-mr-sm"
        />
        <q-btn 
          outline 
          color="secondary" 
          label="Restablecer" 
          icon="refresh"
          @click="restablecerValores"
        />
      </div>
    </div>

    <!-- Formulario dinámico -->
    <q-form ref="formulario" @submit="guardarConfiguracion">
      <div v-for="grupo in gruposOrdenados" :key="grupo.nombre" class="q-mb-lg">
        <q-card flat bordered>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              {{ grupo.nombre || 'Configuración General' }}
            </div>
            <div v-if="grupo.descripcion" class="text-caption">
              {{ grupo.descripcion }}
            </div>
          </q-card-section>
          
          <q-card-section>
            <div class="row q-gutter-md">
              <div 
                v-for="campo in grupo.campos" 
                :key="campo.id"
                :class="getColumnClass(campo)"
              >
                <!-- Campo de texto -->
                <q-input
                  v-if="campo.tipo_campo === 'text'"
                  v-model="valores[campo.clave]"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="buildRules(campo)"
                  outlined
                  dense
                  @update:model-value="marcarCambio(campo.clave)"
                />

                <!-- Campo numérico -->
                <q-input
                  v-else-if="campo.tipo_campo === 'number'"
                  v-model.number="valores[campo.clave]"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="buildRules(campo)"
                  type="number"
                  outlined
                  dense
                  @update:model-value="marcarCambio(campo.clave)"
                />

                <!-- Campo booleano -->
                <div v-else-if="campo.tipo_campo === 'boolean'" class="q-field q-field--outlined q-field--dense">
                  <q-toggle
                    v-model="valores[campo.clave]"
                    :label="campo.etiqueta"
                    color="positive"
                    @update:model-value="marcarCambio(campo.clave)"
                  />
                  <div v-if="campo.descripcion" class="text-caption text-grey-7 q-mt-xs">
                    {{ campo.descripcion }}
                  </div>
                </div>

                <!-- Campo select -->
                <q-select
                  v-else-if="campo.tipo_campo === 'select'"
                  v-model="valores[campo.clave]"
                  :options="campo.opciones?.opciones || []"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="buildRules(campo)"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-value="value"
                  option-label="label"
                  @update:model-value="marcarCambio(campo.clave)"
                />

                <!-- Campo textarea -->
                <q-input
                  v-else-if="campo.tipo_campo === 'textarea'"
                  v-model="valores[campo.clave]"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="buildRules(campo)"
                  type="textarea"
                  rows="4"
                  outlined
                  dense
                  @update:model-value="marcarCambio(campo.clave)"
                />

                <!-- Campo JSON -->
                <q-input
                  v-else-if="campo.tipo_campo === 'json'"
                  v-model="valores[campo.clave]"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="[...buildRules(campo), validarJSON]"
                  type="textarea"
                  rows="6"
                  outlined
                  dense
                  @update:model-value="marcarCambio(campo.clave)"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      icon="code"
                      @click="formatearJSON(campo.clave)"
                      :disable="!valores[campo.clave]"
                    >
                      <q-tooltip>Formatear JSON</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>

                <!-- Campo fecha -->
                <q-input
                  v-else-if="campo.tipo_campo === 'date'"
                  v-model="valores[campo.clave]"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="buildRules(campo)"
                  type="date"
                  outlined
                  dense
                  @update:model-value="marcarCambio(campo.clave)"
                />

                <!-- Campo email -->
                <q-input
                  v-else-if="campo.tipo_campo === 'email'"
                  v-model="valores[campo.clave]"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="[...buildRules(campo), validarEmail]"
                  type="email"
                  outlined
                  dense
                  @update:model-value="marcarCambio(campo.clave)"
                />

                <!-- Campo URL -->
                <q-input
                  v-else-if="campo.tipo_campo === 'url'"
                  v-model="valores[campo.clave]"
                  :label="campo.etiqueta"
                  :hint="campo.descripcion"
                  :rules="[...buildRules(campo), validarURL]"
                  type="url"
                  outlined
                  dense
                  @update:model-value="marcarCambio(campo.clave)"
                />

              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-form>

    <!-- Historial de cambios -->
    <q-card v-if="historialCambios.length > 0" flat bordered class="q-mt-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="history" class="q-mr-sm" />
          Historial de Cambios Recientes
        </div>
        <q-timeline dense>
          <q-timeline-entry
            v-for="cambio in historialCambios.slice(0, 5)"
            :key="cambio.id"
            :subtitle="formatearFecha(cambio.fecha)"
            :body="cambio.descripcion"
            :avatar="cambio.usuario?.avatar"
          />
        </q-timeline>
      </q-card-section>
    </q-card>

    <!-- Dialog de confirmación para restablecer -->
    <q-dialog v-model="mostrarRestablecimiento" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <div class="q-ml-sm">
            <div class="text-h6">Restablecer Configuración</div>
            <div class="text-body2">¿Estás seguro de que deseas restablecer todos los valores a su configuración por defecto?</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="warning" label="Restablecer" @click="confirmarRestablecimiento" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()

// Estado reactivo
const loading = ref(false)
const guardando = ref(false)
const mostrarRestablecimiento = ref(false)
const modulo = ref(null)
const campos = ref([])
const valores = reactive({})
const valoresOriginales = ref({})
const cambiosPendientes = ref(new Set())
const historialCambios = ref([])

// Computed
const gruposOrdenados = computed(() => {
  const grupos = {}
  
  // Agrupar campos
  campos.value.filter(campo => campo.activo).forEach(campo => {
    const nombreGrupo = campo.grupo || 'general'
    if (!grupos[nombreGrupo]) {
      grupos[nombreGrupo] = {
        nombre: nombreGrupo.charAt(0).toUpperCase() + nombreGrupo.slice(1),
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

const hayChangios = computed(() => {
  return cambiosPendientes.value.size > 0
})

// Métodos
const cargarModulo = async () => {
  try {
    const moduloNombre = route.params.modulo
    // const response = await api.get(`/modulos-configuracion/nombre/${moduloNombre}`)
    // modulo.value = response.data
    
    // Datos de ejemplo
    modulo.value = {
      id: 1,
      nombre: moduloNombre,
      descripcion: 'Configuración de usuarios del sistema',
      icono: 'people',
      color: 'primary'
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
    const moduloNombre = route.params.modulo
    // const response = await api.get(`/campos-configuracion/modulo/${moduloNombre}`)
    // campos.value = response.data
    
    // Datos de ejemplo
    campos.value = [
      {
        id: 1,
        clave: 'max_intentos_login',
        etiqueta: 'Máximo intentos de login',
        descripcion: 'Permitir que usuarios se registren automáticamente',
        tipo_campo: 'boolean',
        tipo_dato: 'boolean',
        validaciones: {},
        valor_defecto: 'false',
        grupo: 'registro',
        orden: 4,
        activo: true
      },
      {
        id: 5,
        clave: 'email_admin',
        etiqueta: 'Email del administrador',
        descripcion: 'Correo electrónico para notificaciones importantes',
        tipo_campo: 'email',
        tipo_dato: 'string',
        validaciones: { required: true },
        valor_defecto: 'admin@ejemplo.com',
        grupo: 'notificaciones',
        orden: 1,
        activo: true
      },
      {
        id: 6,
        clave: 'configuracion_avanzada',
        etiqueta: 'Configuración avanzada (JSON)',
        descripcion: 'Configuración técnica en formato JSON',
        tipo_campo: 'json',
        tipo_dato: 'json',
        validaciones: {},
        valor_defecto: '{"timeout": 300, "retries": 3}',
        grupo: 'avanzado',
        orden: 1,
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

const cargarValores = async () => {
  try {
    const moduloNombre = route.params.modulo
    // const response = await api.get(`/valores-configuracion/modulo/${moduloNombre}`)
    // const valoresActuales = response.data
    
    // Datos de ejemplo
    const valoresActuales = {
      max_intentos_login: 5,
      tiempo_bloqueo: 30,
      politica_password: 'avanzada',
      permitir_registro: true,
      email_admin: 'admin@miempresa.com',
      configuracion_avanzada: '{"timeout": 600, "retries": 5, "debug": true}'
    }
    
    // Inicializar valores
    campos.value.forEach(campo => {
      let valor = valoresActuales[campo.clave] ?? campo.valor_defecto ?? ''
      
      // Conversión de tipos
      if (campo.tipo_dato === 'integer') {
        valor = parseInt(valor) || 0
      } else if (campo.tipo_dato === 'decimal') {
        valor = parseFloat(valor) || 0
      } else if (campo.tipo_dato === 'boolean') {
        valor = valor === true || valor === 'true' || valor === 1 || valor === '1'
      }
      
      valores[campo.clave] = valor
    })
    
    // Guardar copia para detectar cambios
    valoresOriginales.value = { ...valores }
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar valores'
    })
  }
}

const cargarHistorial = async () => {
  try {
    const moduloNombre = route.params.modulo
    // const response = await api.get(`/historial-configuracion/modulo/${moduloNombre}`)
    // historialCambios.value = response.data
    
    // Datos de ejemplo
    historialCambios.value = [
      {
        id: 1,
        descripcion: 'Política de contraseñas cambiada de "intermedia" a "avanzada"',
        fecha: new Date(2024, 8, 1, 10, 30),
        usuario: { nombre: 'Juan Pérez', avatar: 'https://cdn.quasar.dev/img/boy-avatar.png' }
      },
      {
        id: 2,
        descripción: 'Máximo intentos de login cambiado de "3" a "5"',
        fecha: new Date(2024, 8, 1, 9, 15),
        usuario: { nombre: 'María García', avatar: 'https://cdn.quasar.dev/img/avatar2.jpg' }
      }
    ]
  } catch (error) {
    console.error('Error al cargar historial:', error)
  }
}

const buildRules = (campo) => {
  const rules = []
  const validaciones = campo.validaciones || {}
  
  // Requerido
  if (validaciones.required) {
    rules.push(val => !!val || `${campo.etiqueta} es requerido`)
  }
  
  // Validaciones numéricas
  if (campo.tipo_dato === 'integer' || campo.tipo_dato === 'decimal') {
    if (validaciones.min !== undefined) {
      rules.push(val => val >= validaciones.min || `Valor mínimo: ${validaciones.min}`)
    }
    if (validaciones.max !== undefined) {
      rules.push(val => val <= validaciones.max || `Valor máximo: ${validaciones.max}`)
    }
  }
  
  // Validaciones de texto
  if (campo.tipo_dato === 'string') {
    if (validaciones.minLength) {
      rules.push(val => !val || val.length >= validaciones.minLength || `Mínimo ${validaciones.minLength} caracteres`)
    }
    if (validaciones.maxLength) {
      rules.push(val => !val || val.length <= validaciones.maxLength || `Máximo ${validaciones.maxLength} caracteres`)
    }
    if (validaciones.pattern) {
      const regex = new RegExp(validaciones.pattern)
      rules.push(val => !val || regex.test(val) || 'Formato no válido')
    }
  }
  
  return rules
}

const validarJSON = (val) => {
  if (!val) return true
  try {
    JSON.parse(val)
    return true
  } catch (e) {
    return 'JSON no válido'
  }
}

const validarEmail = (val) => {
  if (!val) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(val) || 'Email no válido'
}

const validarURL = (val) => {
  if (!val) return true
  try {
    new URL(val)
    return true
  } catch (e) {
    return 'URL no válida'
  }
}

const getColumnClass = (campo) => {
  // Definir el ancho de columna basado en el tipo de campo
  if (campo.tipo_campo === 'textarea' || campo.tipo_campo === 'json') {
    return 'col-12'
  } else if (campo.tipo_campo === 'boolean') {
    return 'col-12 col-md-6'
  } else {
    return 'col-12 col-md-6'
  }
}

const marcarCambio = (clave) => {
  if (valores[clave] !== valoresOriginales.value[clave]) {
    cambiosPendientes.value.add(clave)
  } else {
    cambiosPendientes.value.delete(clave)
  }
}

const formatearJSON = (clave) => {
  try {
    const parsed = JSON.parse(valores[clave])
    valores[clave] = JSON.stringify(parsed, null, 2)
    marcarCambio(clave)
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'JSON no válido para formatear'
    })
  }
}

const guardarConfiguracion = async () => {
  // Validar formulario
  const isValid = await new Promise((resolve) => {
    const form = document.querySelector('form')
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        resolve(true)
      }, { once: true })
      form.requestSubmit()
    } else {
      resolve(true)
    }
  })
  
  if (!isValid) return
  
  guardando.value = true
  try {
    const cambios = {}
    cambiosPendientes.value.forEach(clave => {
      cambios[clave] = valores[clave]
    })
    
    const moduloNombre = route.params.modulo
    // await api.put(`/valores-configuracion/modulo/${moduloNombre}`, cambios)
    
    // Actualizar valores originales
    valoresOriginales.value = { ...valores }
    cambiosPendientes.value.clear()
    
    $q.notify({
      type: 'positive',
      message: 'Configuración guardada correctamente',
      icon: 'save',
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {}
        }
      ]
    })
    
    // Recargar historial
    await cargarHistorial()
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar configuración'
    })
  } finally {
    guardando.value = false
  }
}

const restablecerValores = () => {
  if (hayChangios.value) {
    mostrarRestablecimiento.value = true
  } else {
    $q.notify({
      type: 'info',
      message: 'No hay cambios pendientes para restablecer'
    })
  }
}

const confirmarRestablecimiento = async () => {
  try {
    // Restablecer a valores por defecto
    campos.value.forEach(campo => {
      let valor = campo.valor_defecto ?? ''
      
      // Conversión de tipos
      if (campo.tipo_dato === 'integer') {
        valor = parseInt(valor) || 0
      } else if (campo.tipo_dato === 'decimal') {
        valor = parseFloat(valor) || 0
      } else if (campo.tipo_dato === 'boolean') {
        valor = valor === true || valor === 'true' || valor === 1 || valor === '1'
      }
      
      valores[campo.clave] = valor
    })
    
    // Marcar todos los campos como cambiados
    campos.value.forEach(campo => {
      marcarCambio(campo.clave)
    })
    
    mostrarRestablecimiento.value = false
    
    $q.notify({
      type: 'warning',
      message: 'Valores restablecidos a configuración por defecto. No olvides guardar los cambios.',
      timeout: 5000
    })
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al restablecer valores'
    })
  }
}

const formatearFecha = (fecha) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(fecha))
}

// Ciclo de vida
onMounted(async () => {
  await cargarModulo()
  await cargarCampos()
  await cargarValores()
  await cargarHistorial()
})

// Detectar cambios no guardados al salir
window.addEventListener('beforeunload', (e) => {
  if (hayChangios.value) {
    e.preventDefault()
    e.returnValue = ''
  }
})
</script>

<style scoped>
.q-field--outlined .q-field__control {
  min-height: 48px;
}

.q-timeline-entry__content {
  padding-left: 16px;
}
</style> 