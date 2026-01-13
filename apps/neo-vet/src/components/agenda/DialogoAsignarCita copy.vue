<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 600px; max-width: 800px">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-info">
            <q-icon :name="servicio?.icon || 'event'" size="32px" :color="servicio?.color || 'primary'" />
            <div>
              <div class="dialog-title">Nueva Cita</div>
              <div class="dialog-subtitle">
                {{ fechaFormateada }} - {{ horario }}
              </div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="cerrar" />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Contenido según paso -->
      <q-card-section class="dialog-content">
        <!-- Paso 1: Buscar Propietario -->
        <div v-if="pasoActual === 'buscar_propietario'" class="paso-container">
          <div class="paso-header">
            <q-icon name="person_search" size="24px" color="primary" />
            <h6>Buscar Propietario</h6>
          </div>

          <q-input
            v-model="busquedaPropietario"
            outlined
            label="Buscar por nombre, teléfono o email"
            placeholder="Escribe para buscar..."
            clearable
            autofocus
            @update:model-value="buscarPropietarios"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Resultados de búsqueda -->
          <div v-if="propietariosBuscados.length > 0" class="resultados-container">
            <div class="resultados-header">
              <span>Resultados encontrados ({{ propietariosBuscados.length }})</span>
            </div>
            
            <q-list bordered separator class="resultados-list">
              <q-item
                v-for="prop in propietariosBuscados"
                :key="prop.id"
                clickable
                @click="seleccionarPropietario(prop)"
                class="resultado-item"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="48px">
                    <q-icon name="person" size="24px" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="propietario-nombre">{{ prop.nombre }}</q-item-label>
                  <q-item-label caption class="propietario-info">
                    <q-icon name="phone" size="14px" /> {{ prop.telefono || 'Sin teléfono' }}
                    <span v-if="prop.email" class="ml-2">
                      <q-icon name="email" size="14px" /> {{ prop.email }}
                    </span>
                  </q-item-label>
                  <q-item-label caption v-if="prop.mascotas_count > 0" class="propietario-mascotas">
                    {{ prop.mascotas_count }} mascota(s) registrada(s)
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Sin resultados -->
          <div v-else-if="busquedaPropietario && !cargandoPropietarios" class="sin-resultados">
            <q-icon name="search_off" size="48px" color="grey-5" />
            <p>No se encontraron propietarios</p>
          </div>

          <!-- Indicador de carga -->
          <div v-if="cargandoPropietarios" class="loading-container">
            <q-spinner-dots color="primary" size="40px" />
            <span>Buscando...</span>
          </div>

          <!-- Botón para nuevo propietario -->
          <div class="nuevo-propietario-btn">
            <q-btn
              outline
              color="positive"
              icon="person_add"
              label="Registrar Nuevo Propietario"
              @click="irANuevoPropietario"
              class="full-width"
            />
          </div>
        </div>

        <!-- Paso 2: Nuevo Propietario -->
        <div v-if="pasoActual === 'nuevo_propietario'" class="paso-container">
          <div class="paso-header">
            <q-icon name="person_add" size="24px" color="positive" />
            <h6>Registrar Nuevo Propietario</h6>
          </div>

          <q-form @submit="guardarNuevoPropietario" class="propietario-form">
            <q-input
              v-model="nuevoPropietario.nombre"
              outlined
              label="Nombre completo *"
              :rules="[val => !!val || 'El nombre es requerido']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="nuevoPropietario.telefono"
              outlined
              label="Teléfono *"
              mask="(###) ###-####"
              :rules="[val => !!val || 'El teléfono es requerido']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <q-input
              v-model="nuevoPropietario.email"
              outlined
              label="Email"
              type="email"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="nuevoPropietario.direccion"
              outlined
              label="Dirección"
              type="textarea"
              rows="2"
            >
              <template v-slot:prepend>
                <q-icon name="home" />
              </template>
            </q-input>

            <div class="form-actions">
              <q-btn
                flat
                label="Cancelar"
                @click="volverABusqueda"
                color="grey-7"
              />
              <q-btn
                type="submit"
                label="Guardar y Continuar"
                color="positive"
                icon-right="arrow_forward"
                :loading="guardandoPropietario"
              />
            </div>
          </q-form>
        </div>

        <!-- Paso 3: Seleccionar Mascota -->
        <div v-if="pasoActual === 'seleccionar_mascota'" class="paso-container">
          <div class="paso-header">
            <q-icon name="pets" size="24px" color="secondary" />
            <h6>Seleccionar Mascota</h6>
          </div>

          <!-- Info del propietario seleccionado -->
          <q-banner rounded class="propietario-banner">
            <template v-slot:avatar>
              <q-avatar color="primary" text-color="white">
                <q-icon name="person" />
              </q-avatar>
            </template>
            <div class="banner-content">
              <strong>{{ propietarioSeleccionado?.nombre }}</strong>
              <div class="banner-meta">
                <span>{{ propietarioSeleccionado?.telefono }}</span>
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Cambiar"
                  color="primary"
                  @click="volverABusqueda"
                  class="ml-2"
                />
              </div>
            </div>
          </q-banner>

          <!-- Lista de mascotas -->
          <div v-if="mascotasPropietario.length > 0" class="mascotas-container">
            <div class="mascotas-header">
              <span>Mascotas registradas ({{ mascotasPropietario.length }})</span>
            </div>

            <q-list bordered separator class="mascotas-list">
              <q-item
                v-for="mascota in mascotasPropietario"
                :key="mascota.id"
                clickable
                @click="seleccionarMascota(mascota)"
                class="mascota-item"
              >
                <q-item-section avatar>
                  <q-avatar color="secondary" text-color="white" size="48px">
                    <q-icon name="pets" size="24px" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="mascota-nombre">{{ mascota.nombre }}</q-item-label>
                  <q-item-label caption class="mascota-info">
                    {{ mascota.especie }} - {{ mascota.raza || 'Sin raza' }}
                  </q-item-label>
                  <q-item-label caption v-if="mascota.edad" class="mascota-edad">
                    {{ mascota.edad }} año(s)
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Sin mascotas -->
          <div v-else class="sin-mascotas">
            <q-icon name="pets" size="48px" color="grey-5" />
            <p>Este propietario no tiene mascotas registradas</p>
          </div>

          <!-- Botón para nueva mascota -->
          <div class="nueva-mascota-btn">
            <q-btn
              outline
              color="secondary"
              icon="add"
              label="Registrar Nueva Mascota"
              @click="irANuevaMascota"
              class="full-width"
            />
          </div>
        </div>

        <!-- Paso 4: Nueva Mascota -->
        <div v-if="pasoActual === 'nueva_mascota'" class="paso-container">
          <div class="paso-header">
            <q-icon name="add_circle" size="24px" color="secondary" />
            <h6>Registrar Nueva Mascota</h6>
          </div>

          <q-form @submit="guardarNuevaMascota" class="mascota-form">
            <q-input
              v-model="nuevaMascota.nombre"
              outlined
              label="Nombre de la mascota *"
              :rules="[val => !!val || 'El nombre es requerido']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="pets" />
              </template>
            </q-input>

            <q-select
              v-model="nuevaMascota.especie"
              outlined
              label="Especie *"
              :options="especiesOpciones"
              :rules="[val => !!val || 'La especie es requerida']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>

            <q-input
              v-model="nuevaMascota.raza"
              outlined
              label="Raza"
            >
              <template v-slot:prepend>
                <q-icon name="label" />
              </template>
            </q-input>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model.number="nuevaMascota.edad"
                  outlined
                  label="Edad (años)"
                  type="number"
                  min="0"
                >
                  <template v-slot:prepend>
                    <q-icon name="cake" />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-select
                  v-model="nuevaMascota.sexo"
                  outlined
                  label="Sexo"
                  :options="['Macho', 'Hembra']"
                >
                  <template v-slot:prepend>
                    <q-icon name="wc" />
                  </template>
                </q-select>
              </div>
            </div>

            <q-input
              v-model="nuevaMascota.observaciones"
              outlined
              label="Observaciones"
              type="textarea"
              rows="2"
            >
              <template v-slot:prepend>
                <q-icon name="notes" />
              </template>
            </q-input>

            <div class="form-actions">
              <q-btn
                flat
                label="Cancelar"
                @click="volverASeleccionMascota"
                color="grey-7"
              />
              <q-btn
                type="submit"
                label="Guardar y Continuar"
                color="secondary"
                icon-right="arrow_forward"
                :loading="guardandoMascota"
              />
            </div>
          </q-form>
        </div>

        <!-- Paso 5: Confirmar Cita -->
        <div v-if="pasoActual === 'confirmar_cita'" class="paso-container">
          <div class="paso-header">
            <q-icon name="check_circle" size="24px" color="positive" />
            <h6>Confirmar Cita</h6>
          </div>

          <div class="confirmacion-container">
            <!-- Resumen de la cita -->
            <q-card flat bordered class="resumen-card">
              <q-card-section>
                <div class="resumen-row">
                  <div class="resumen-icon">
                    <q-icon name="event" color="primary" size="24px" />
                  </div>
                  <div class="resumen-info">
                    <div class="resumen-label">Fecha y Hora</div>
                    <div class="resumen-value">{{ fechaFormateada }} - {{ horario }}</div>
                  </div>
                </div>

                <q-separator class="my-3" />

                <div class="resumen-row">
                  <div class="resumen-icon">
                    <q-icon :name="servicio?.icon" :color="servicio?.color" size="24px" />
                  </div>
                  <div class="resumen-info">
                    <div class="resumen-label">Servicio</div>
                    <div class="resumen-value">{{ servicio?.name }}</div>
                    <div class="resumen-meta">Duración: {{ servicio?.duration }} min - ${{ servicio?.price }}</div>
                  </div>
                </div>

                <q-separator class="my-3" />

                <div class="resumen-row">
                  <div class="resumen-icon">
                    <q-icon name="person" color="primary" size="24px" />
                  </div>
                  <div class="resumen-info">
                    <div class="resumen-label">Propietario</div>
                    <div class="resumen-value">{{ propietarioSeleccionado?.nombre }}</div>
                    <div class="resumen-meta">{{ propietarioSeleccionado?.telefono }}</div>
                  </div>
                </div>

                <q-separator class="my-3" />

                <div class="resumen-row">
                  <div class="resumen-icon">
                    <q-icon name="pets" color="secondary" size="24px" />
                  </div>
                  <div class="resumen-info">
                    <div class="resumen-label">Mascota</div>
                    <div class="resumen-value">{{ mascotaSeleccionada?.nombre }}</div>
                    <div class="resumen-meta">{{ mascotaSeleccionada?.especie }} - {{ mascotaSeleccionada?.raza }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Campo de motivo/observaciones -->
            <q-input
              v-model="motivoCita"
              outlined
              label="Motivo de la consulta"
              type="textarea"
              rows="3"
              class="mt-4"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <!-- Footer con acciones -->
      <q-separator />

      <q-card-actions align="right" class="dialog-footer">
        <q-btn
          flat
          label="Cancelar"
          @click="cerrar"
          color="grey-7"
        />
        <q-btn
          v-if="pasoActual === 'confirmar_cita'"
          label="Agendar Cita"
          color="positive"
          icon="check"
          @click="confirmarCita"
          :loading="guardandoCita"
        />
      </q-card-actions>

      <!-- Indicador de pasos -->
      <div class="pasos-indicador">
        <div class="paso-item" :class="{ active: indicePaso >= 0, completed: indicePaso > 0 }">
          <div class="paso-numero">1</div>
          <div class="paso-texto">Propietario</div>
        </div>
        <div class="paso-linea" :class="{ active: indicePaso > 0 }"></div>
        <div class="paso-item" :class="{ active: indicePaso >= 1, completed: indicePaso > 1 }">
          <div class="paso-numero">2</div>
          <div class="paso-texto">Mascota</div>
        </div>
        <div class="paso-linea" :class="{ active: indicePaso > 1 }"></div>
        <div class="paso-item" :class="{ active: indicePaso >= 2 }">
          <div class="paso-numero">3</div>
          <div class="paso-texto">Confirmar</div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import NdPeticionControl from 'src/controles/rest.control'

const props = defineProps({
  visible: Boolean,
  slotInfo: Object,
  servicio: Object
})

const emit = defineEmits(['update:visible', 'cita-creada'])

const $q = useQuasar()

// Estados
const dialogVisible = ref(false)
const pasoActual = ref('buscar_propietario')
const busquedaPropietario = ref('')
const propietariosBuscados = ref([])
const propietarioSeleccionado = ref(null)
const mascotasPropietario = ref([])
const mascotaSeleccionada = ref(null)
const motivoCita = ref('')
const cargandoPropietarios = ref(false)
const guardandoPropietario = ref(false)
const guardandoMascota = ref(false)
const guardandoCita = ref(false)

// Formularios
const nuevoPropietario = ref({
  nombre: '',
  telefono: '',
  email: '',
  direccion: ''
})

const nuevaMascota = ref({
  nombre: '',
  especie: '',
  raza: '',
  edad: null,
  sexo: '',
  observaciones: ''
})

const especiesOpciones = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Reptil', 'Otro']

// Computeds
const fechaFormateada = computed(() => {
  if (!props.slotInfo?.fullDate) return ''
  return props.slotInfo.fullDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const horario = computed(() => props.slotInfo?.time || '')

const indicePaso = computed(() => {
  const pasos = {
    'buscar_propietario': 0,
    'nuevo_propietario': 0,
    'seleccionar_mascota': 1,
    'nueva_mascota': 1,
    'confirmar_cita': 2
  }
  return pasos[pasoActual.value] || 0
})

// Métodos de búsqueda
let timeoutBusqueda = null
const buscarPropietarios = async () => {
  if (!busquedaPropietario.value || busquedaPropietario.value.length < 2) {
    propietariosBuscados.value = []
    return
  }

  clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(async () => {
    cargandoPropietarios.value = true
    try {
      const peticion = new NdPeticionControl()
      const queryParams = new URLSearchParams()
      queryParams.append('busqueda', busquedaPropietario.value)
      
      const response = await peticion.invocarMetodo(`propietarios/buscar?${queryParams.toString()}`, 'get')
      propietariosBuscados.value = Array.isArray(response) ? response : (response?.data || [])
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al buscar propietarios', caption: error.message })
    } finally {
      cargandoPropietarios.value = false
    }
  }, 400)
}

// Métodos de selección
const seleccionarPropietario = async (propietario) => {
  propietarioSeleccionado.value = propietario
  await cargarMascotasPropietario(propietario.id)
  pasoActual.value = 'seleccionar_mascota'
}

const cargarMascotasPropietario = async (idPropietario) => {
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo(`propietarios/${idPropietario}/mascotas`, 'get')
    mascotasPropietario.value = Array.isArray(response) ? response : (response?.data || [])
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar mascotas', caption: error.message })
    mascotasPropietario.value = []
  }
}

const seleccionarMascota = (mascota) => {
  mascotaSeleccionada.value = mascota
  pasoActual.value = 'confirmar_cita'
}

// Navegación entre pasos
const irANuevoPropietario = () => {
  nuevoPropietario.value = { nombre: '', telefono: '', email: '', direccion: '' }
  pasoActual.value = 'nuevo_propietario'
}

const irANuevaMascota = () => {
  nuevaMascota.value = { nombre: '', especie: '', raza: '', edad: null, sexo: '', observaciones: '' }
  pasoActual.value = 'nueva_mascota'
}

const volverABusqueda = () => {
  propietarioSeleccionado.value = null
  mascotasPropietario.value = []
  pasoActual.value = 'buscar_propietario'
}

const volverASeleccionMascota = () => {
  pasoActual.value = 'seleccionar_mascota'
}

// Guardar datos
const guardarNuevoPropietario = async () => {
  guardandoPropietario.value = true
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo('propietarios', 'post', nuevoPropietario.value)
    
    propietarioSeleccionado.value = response?.data || response
    $q.notify({ type: 'positive', message: 'Propietario registrado exitosamente' })
    
    mascotasPropietario.value = []
    pasoActual.value = 'seleccionar_mascota'
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar propietario', caption: error.message })
  } finally {
    guardandoPropietario.value = false
  }
}

const guardarNuevaMascota = async () => {
  guardandoMascota.value = true
  try {
    const peticion = new NdPeticionControl()
    const datos = {
      ...nuevaMascota.value,
      id_propietario: propietarioSeleccionado.value.id
    }
    
    const response = await peticion.invocarMetodo('mascotas', 'post', datos)
    
    mascotaSeleccionada.value = response?.data || response
    $q.notify({ type: 'positive', message: 'Mascota registrada exitosamente' })
    pasoActual.value = 'confirmar_cita'
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar mascota', caption: error.message })
  } finally {
    guardandoMascota.value = false
  }
}

const confirmarCita = async () => {
  guardandoCita.value = true
  try {
    const peticion = new NdPeticionControl()
    const datos = {
      id_propietario: propietarioSeleccionado.value.id,
      id_mascota: mascotaSeleccionada.value.id,
      id_servicio: props.servicio.id,
      id_slot: props.slotInfo.id_slot,
      fecha: props.slotInfo.fullDate.toISOString().split('T')[0],
      hora: props.slotInfo.time,
      motivo: motivoCita.value
    }
    
    const response = await peticion.invocarMetodo('agenda/citas', 'post', datos)
    
    $q.notify({ 
      type: 'positive', 
      message: 'Cita agendada exitosamente',
      caption: `${propietarioSeleccionado.value.nombre} - ${mascotaSeleccionada.value.nombre}`
    })
    
    emit('cita-creada', response?.data || response)
    cerrar()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al agendar cita', caption: error.message })
  } finally {
    guardandoCita.value = false
  }
}

const cerrar = () => {
  dialogVisible.value = false
  setTimeout(() => {
    resetearFormulario()
  }, 300)
}

const resetearFormulario = () => {
  pasoActual.value = 'buscar_propietario'
  busquedaPropietario.value = ''
  propietariosBuscados.value = []
  propietarioSeleccionado.value = null
  mascotasPropietario.value = []
  mascotaSeleccionada.value = null
  motivoCita.value = ''
  nuevoPropietario.value = { nombre: '', telefono: '', email: '', direccion: '' }
  nuevaMascota.value = { nombre: '', especie: '', raza: '', edad: null, sexo: '', observaciones: '' }
}

// Watchers
watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.dialog-subtitle {
  font-size: 14px;
  opacity: 0.9;
  text-transform: capitalize;
}

.dialog-content {
  padding: 24px;
  min-height: 400px;
}

.paso-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.paso-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.paso-header h6 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.resultados-container {
  margin-top: 16px;
}

.resultados-header {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
}

.resultados-list {
  border-radius: 8px;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}

.resultado-item, .mascota-item {
  transition: background 0.2s ease;
}

.resultado-item:hover, .mascota-item:hover {
  background: #f8faff;
}

.propietario-nombre, .mascota-nombre {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.propietario-info, .mascota-info {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.propietario-mascotas, .mascota-edad {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.sin-resultados, .sin-mascotas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.sin-resultados p, .sin-mascotas p {
  margin-top: 12px;
  font-size: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #64748b;
}

.nuevo-propietario-btn, .nueva-mascota-btn {
  margin-top: 20px;
}

.propietario-form, .mascota-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.propietario-banner {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-meta {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
}

.mascotas-container {
  margin-top: 20px;
}

.mascotas-header {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
}

.mascotas-list {
  border-radius: 8px;
  overflow: hidden;
  max-height: 350px;
  overflow-y: auto;
}

.confirmacion-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resumen-card {
  border-radius: 12px;
}

.resumen-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.resumen-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
}

.resumen-info {
  flex: 1;
}

.resumen-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.resumen-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.resumen-meta {
  font-size: 13px;
  color: #64748b;
}

.dialog-footer {
  padding: 16px 24px;
}

.pasos-indicador {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.paso-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.paso-numero {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s ease;
}

.paso-item.active .paso-numero {
  background: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.paso-item.completed .paso-numero {
  background: #10b981;
  color: white;
}

.paso-texto {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.paso-item.active .paso-texto {
  color: #667eea;
}

.paso-item.completed .paso-texto {
  color: #10b981;
}

.paso-linea {
  width: 60px;
  height: 2px;
  background: #e2e8f0;
  margin: 0 8px;
  margin-bottom: 28px;
  transition: background 0.3s ease;
}

.paso-linea.active {
  background: #667eea;
}

.my-3 {
  margin-top: 12px;
  margin-bottom: 12px;
}

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
