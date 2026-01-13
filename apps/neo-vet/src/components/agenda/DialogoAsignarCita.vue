<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 1000px; max-width: 95vw;">
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

          <BusquedaRapidaPropietarioMascota
            @propietario-seleccionado="seleccionarPropietario"
            @nuevo-propietario="abrirDialogoPropietario"
          />
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
              <strong>{{ getNombreCompleto(propietarioSeleccionado) }}</strong>
              <div class="banner-meta">
                <span>{{ propietarioSeleccionado?.contacto?.telefono1 || propietarioSeleccionado?.telefono }}</span>
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
            <div class="mascotas-header row items-center justify-between">
              <span>Mascotas registradas ({{ mascotasPropietario.length }})</span>
              <q-btn
                flat
                dense
                color="secondary"
                icon="add"
                label="Nueva Mascota"
                @click="irANuevaMascota"
                size="sm"
              />
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

          <!-- Botón para nueva mascota (solo si no hay mascotas) -->
          <div v-if="mascotasPropietario.length === 0" class="nueva-mascota-btn">
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
                    <div class="resumen-value">{{ getNombreCompleto(propietarioSeleccionado) }}</div>
                    <div class="resumen-meta">{{ propietarioSeleccionado?.contacto?.telefono1 || propietarioSeleccionado?.telefono }}</div>
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

  <!-- Simplified Dialogs -->
  <DialogPropietarioRapido
    v-if="mostrarDialogoPropietario"
    @propietario-guardado="manejarPropietarioGuardado"
    @cerrar="cerrarDialogoPropietario"
  />

  <DialogMascotaRapido
    v-if="mostrarDialogoMascota"
    :propietario="propietarioSeleccionado"
    @mascota-guardada="manejarMascotaGuardada"
    @cerrar="cerrarDialogoMascota"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import NdPeticionControl from 'src/controles/rest.control'
import BusquedaRapidaPropietarioMascota from './BusquedaRapidaPropietarioMascota.vue'
import DialogPropietarioRapido from '../dialog/DialogPropietarioRapido.vue'
import DialogMascotaRapido from '../dialog/DialogMascotaRapido.vue'

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
const guardandoCita = ref(false)

// Dialog controls for simplified components
const mostrarDialogoPropietario = ref(false)
const mostrarDialogoMascota = ref(false)

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

const getNombreCompleto = (p) => {
  if (!p) return '-'
  const nombre = p.nombre || p.nombres || ''
  const primer = p.primerapellido || p.primer_apellido || ''
  const segundo = p.segundoapellido || p.segundo_apellido || ''
  return `${primer} ${segundo} ${nombre}`.trim() || '-'
}

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
const seleccionarPropietario = async (row) => {
  console.log('Propietario seleccionado (row):', row)
  propietarioSeleccionado.value = row.propietario
  
  // Buscar mascotas en la raíz o dentro del objeto propietario
  const mascotas = row.mascotas || row.propietario?.mascotas || []
  console.log('Mascotas encontradas:', mascotas)
  
  if (mascotas.length > 0) {
    mascotasPropietario.value = mascotas
  } else if (row.propietario?.id) {
    await cargarMascotasPropietario(row.propietario.id)
  } else {
    mascotasPropietario.value = []
  }
  
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

// Navegación entre pasos - Updated for dialogs
const abrirDialogoPropietario = () => {
  mostrarDialogoPropietario.value = true
}

const cerrarDialogoPropietario = () => {
  mostrarDialogoPropietario.value = false
}

const manejarPropietarioGuardado = async (propietario) => {
  mostrarDialogoPropietario.value = false
  propietarioSeleccionado.value = propietario
  await cargarMascotasPropietario(propietario.id)
  pasoActual.value = 'seleccionar_mascota'
  $q.notify({ type: 'positive', message: 'Propietario registrado exitosamente' })
}

const abrirDialogoMascota = () => {
  mostrarDialogoMascota.value = true
}

const cerrarDialogoMascota = () => {
  mostrarDialogoMascota.value = false
}

const manejarMascotaGuardada = (mascota) => {
  mostrarDialogoMascota.value = false
  mascotaSeleccionada.value = mascota
  pasoActual.value = 'confirmar_cita'
  $q.notify({ type: 'positive', message: 'Mascota registrada exitosamente' })
}

// Legacy methods (keep for now, can be removed once fully tested)
const irANuevoPropietario = () => {
  abrirDialogoPropietario()
}

const irANuevaMascota = () => {
  abrirDialogoMascota()
}

const volverABusqueda = () => {
  propietarioSeleccionado.value = null
  mascotasPropietario.value = []
  pasoActual.value = 'buscar_propietario'
}

const volverASeleccionMascota = () => {
  pasoActual.value = 'seleccionar_mascota'
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
  flex-wrap: wrap;
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
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.paso-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.paso-numero {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
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
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.paso-item.active .paso-texto {
  color: #667eea;
}

.paso-item.completed .paso-texto {
  color: #10b981;
}

.paso-linea {
  flex: 1;
  max-width: 60px;
  min-width: 20px;
  height: 2px;
  background: #e2e8f0;
  margin: 0 4px;
  margin-bottom: 20px;
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
