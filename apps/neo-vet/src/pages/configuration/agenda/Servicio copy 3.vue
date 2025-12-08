<template>
  <div class="q-pa-md">
    <q-card class="shadow-10">
      <!-- Header -->
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="medical_services" size="md" class="q-mr-md" />
            Configuración de Servicios
          </div>
          <q-btn
            v-if="tab === 'services'"
            color="white"
            text-color="primary"
            label="Nuevo Servicio"
            icon="add"
            @click="openServiceDialog()"
          />
        </div>
      </q-card-section>

      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="services" label="Servicios" icon="medical_services" />
        <q-tab name="exceptions" label="Días de Excepción" icon="event_busy" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="services">
          <q-card-section>
            <!-- Grid de Servicios -->
            <div class="row q-gutter-sm q-md-lg">
              <div
                v-for="service in services"
                :key="service.id"
                class="col-12 col-xs-6 col-md-3"
              >
                <q-card 
                  class="service-card cursor-pointer"
                  :class="{ 'selected-service': selectedService?.id === service.id }"
                  bordered
                  @click="selectService(service)"
                >
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center q-mb-xs">
                      <q-avatar
                        :color="service.color"
                        text-color="white"
                        :icon="service.icono"
                        size="30px"
                        class="q-mr-sm"
                      />
                      <div class="col">
                        <div class="text-subtitle2 text-weight-medium ellipsis">
                          {{ service.nombre }}
                        </div>
                        <div class="text-caption text-grey-6">
                          {{ service.duracion_minutos }}min - ${{ service.precio.toFixed(2) }}
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center justify-between">
                      <q-chip
                        :color="service.activo === 'S' ? 'green' : 'red'"
                        text-color="white"
                        size="sm"
                      >
                        {{ service.activo === 'S' ? 'Activo' : 'Inactivo' }}
                      </q-chip>
                      <div class="flex q-gutter-xs">
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="edit"
                          size="sm"
                          @click.stop="openServiceDialog(service)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          color="red"
                          icon="delete"
                          size="sm"
                          @click.stop="confirmDeleteService(service.id)"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Sección de Horarios del Servicio Seleccionado en Tabla -->
            <div v-if="selectedService" class="q-mt-lg">
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-primary">
                  Horarios de Atención - {{ selectedService.nombre }}
                </div>
                <q-btn
                  color="primary"
                  label="Agregar Horario"
                  icon="add"
                  size="sm"
                  @click="openScheduleDialog()"
                />
              </div>

              <!-- Tabla de Horarios -->
              <q-table
                :rows="selectedServiceSchedules"
                :columns="scheduleColumns"
                row-key="id"
                flat
                bordered
                :loading="false"
                no-data-label="No hay horarios configurados para este servicio"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template #body-cell-dia_semana="props">
                  <q-td :props="props">
                    <q-badge color="blue-grey" :label="getDiaName(props.value)" />
                  </q-td>
                </template>

                <template #body-cell-horario="props">
                  <q-td :props="props">
                    <div class="row items-center">
                      <q-icon name="schedule" color="grey-6" size="sm" class="q-mr-sm" />
                      <span>{{ formatTime(props.row.hora_inicio) }} - {{ formatTime(props.row.hora_fin) }}</span>
                    </div>
                  </q-td>
                </template>

                <!--<template #body-cell-sucursal="props">
                  <q-td :props="props">
                    <div class="row items-center">
                      <q-icon name="place" color="grey-6" size="sm" class="q-mr-sm" />
                      <span>{{ getSucursalName(props.value) }}</span>
                    </div>
                  </q-td>
                </template>-->

                <template #body-cell-intervalo_minutos="props">
                  <q-td :props="props">
                    <q-chip color="orange" text-color="white" size="sm">
                      {{ props.value }} min
                    </q-chip>
                  </q-td>
                </template>

                <template #body-cell-activo="props">
                  <q-td :props="props">
                    <q-chip
                      :color="props.value === 'S' ? 'green' : 'red'"
                      text-color="white"
                      size="sm"
                    >
                      {{ props.value === 'S' ? 'Activo' : 'Inactivo' }}
                    </q-chip>
                  </q-td>
                </template>

                <template #body-cell-acciones="props">
                  <q-td :props="props">
                    <div class="q-gutter-xs">
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="edit"
                        size="sm"
                        @click="openScheduleDialog(props.row)"
                      >
                        <q-tooltip>Editar horario</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        color="red"
                        icon="delete"
                        size="sm"
                        @click="confirmDeleteSchedule(props.row.id)"
                      >
                        <q-tooltip>Eliminar horario</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>

                <template #no-data="{ icon, message }">
                  <div class="full-width row flex-center q-gutter-sm q-pa-lg">
                    <q-icon :name="icon" size="2em" color="grey-4" />
                    <span class="text-subtitle1 text-grey-6">{{ message }}</span>
                    <q-btn
                      color="primary"
                      label="Agregar Primer Horario"
                      icon="add"
                      size="sm"
                      @click="openScheduleDialog()"
                    />
                  </div>
                </template>
              </q-table>
            </div>

            <!-- Mensaje inicial cuando no hay servicio seleccionado -->
            <div v-else class="text-center q-pa-lg">
              <q-icon name="touch_app" size="48px" color="grey-4" class="q-mb-md" />
              <div class="text-subtitle1 text-grey-6">
                Selecciona un servicio para ver y configurar sus horarios de atención
              </div>
            </div>
          </q-card-section>
        </q-tab-panel>

        <q-tab-panel name="exceptions">
          <DiasExcepcion />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Dialog de Servicios -->
    <q-dialog v-model="serviceDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ currentService.id ? 'Editar Servicio' : 'Nuevo Servicio' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="serviceDialog = false" />
        </q-card-section>

        <q-card-section>
          <q-form ref="serviceForm" @submit="saveService" class="column q-gutter-md">
            <q-input
              v-model="currentService.nombre"
              label="Nombre del Servicio"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
            />

            <q-input
              v-model="currentService.descripcion"
              label="Descripción"
              outlined
              type="textarea"
              rows="3"
              :rules="[val => !!val || 'La descripción es requerida']"
            />

            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model.number="currentService.duracion_minutos"
                  label="Duración (minutos)"
                  outlined
                  type="number"
                  min="1"
                  :rules="[val => val > 0 || 'Debe ser mayor a 0']"
                />
              </div>
              <div class="col">
                <q-input
                  v-model.number="currentService.precio"
                  label="Precio"
                  outlined
                  type="number"
                  step="0.01"
                  min="0"
                  prefix="$"
                  :rules="[val => val >= 0 || 'Debe ser mayor o igual a 0']"
                />
              </div>
            </div>

            <div>
              <div class="text-subtitle2 q-mb-sm">Color del Servicio</div>
              <div class="row q-gutter-xs">
                <q-btn
                  v-for="color in colores"
                  :key="color"
                  :color="color"
                  round
                  size="sm"
                  :outline="currentService.color !== color"
                  @click="currentService.color = color"
                />
              </div>
            </div>

            <div>
              <div class="text-subtitle2 q-mb-sm">Icono del Servicio</div>
              <div class="row q-gutter-xs">
                <q-btn
                  v-for="icono in iconos"
                  :key="icono"
                  :icon="icono"
                  round
                  size="sm"
                  :color="currentService.icono === icono ? 'primary' : 'grey-5'"
                  @click="currentService.icono = icono"
                />
              </div>
            </div>

            <div class="row q-gutter-sm">
              <div class="col">
                <q-select
                  v-model="currentService.activo"
                  label="Estado"
                  outlined
                  :options="estadoOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                />
              </div>
              <div class="col">
                <q-select
                  v-model="currentService.urgencias"
                  label="Permite Urgencias"
                  outlined
                  :options="urgenciasOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="serviceDialog = false" />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveService"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de Horarios -->
    <q-dialog v-model="scheduleDialog" persistent>
      <q-card style="min-width: 400px; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ currentSchedule.id ? 'Editar Horario' : 'Nuevo Horario' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="scheduleDialog = false" />
        </q-card-section>

        <q-card-section>
          <q-form ref="scheduleForm" @submit="saveSchedule" class="column q-gutter-md">
            <!--<q-select
              v-model="currentSchedule.id_sucursal"
              label="Sucursal"
              outlined
              :options="sucursales"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              :rules="[val => !!val || 'La sucursal es requerida']"
            />-->

            <q-select
              v-model="currentSchedule.dia_semana"
              label="Día de la Semana"
              outlined
              :options="diasSemana"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[val => val !== null && val !== undefined || 'El día es requerido']"
            />

            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="currentSchedule.hora_inicio"
                  label="Hora Inicio"
                  outlined
                  mask="time"
                  :rules="['time']"
                >
                  <template #append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time
                          v-model="currentSchedule.hora_inicio"
                          format24h
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col">
                <q-input
                  v-model="currentSchedule.hora_fin"
                  label="Hora Fin"
                  outlined
                  mask="time"
                  :rules="['time']"
                >
                  <template #append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time
                          v-model="currentSchedule.hora_fin"
                          format24h
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model.number="currentSchedule.intervalo_minutos"
                  label="Intervalo (minutos)"
                  outlined
                  type="number"
                  min="1"
                  :rules="[val => val > 0 || 'Debe ser mayor a 0']"
                />
              </div>
              <div class="col">
                <q-select
                  v-model="currentSchedule.activo"
                  label="Estado"
                  outlined
                  :options="estadoOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="scheduleDialog = false" />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveSchedule"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import NdPeticionControl from 'src/controles/rest.control'
import PeticionService from 'src/services/peticion.service'
import { useDialogStore } from 'neo-auth/src/stores/DialogoUbicacion'
import DiasExcepcion from './DiasExcepcion.vue'

const $q = useQuasar()
const store = useDialogStore()

// Estados reactivos
const tab = ref('services')
const services = ref([])
const schedules = ref([])
const selectedService = ref(null)
const serviceDialog = ref(false)
const scheduleDialog = ref(false)
const currentService = ref({})
const currentSchedule = ref({})

// Columnas para la tabla de horarios
const scheduleColumns = [
  {
    name: 'dia_semana',
    required: true,
    label: 'Día',
    align: 'left',
    field: 'dia_semana',
    sortable: true
  },
  {
    name: 'horario',
    required: true,
    label: 'Horario',
    align: 'left',
    field: row => `${row.hora_inicio} - ${row.hora_fin}`,
    sortable: false
  },
  {
    name: 'sucursal',
    required: true,
    label: 'Sucursal',
    align: 'left',
    field: 'id_sucursal',
    sortable: true
  },
  {
    name: 'intervalo_minutos',
    required: true,
    label: 'Intervalo',
    align: 'center',
    field: 'intervalo_minutos',
    sortable: true
  },
  {
    name: 'activo',
    required: true,
    label: 'Estado',
    align: 'center',
    field: 'activo',
    sortable: true
  },
  {
    name: 'acciones',
    required: true,
    label: 'Acciones',
    align: 'center',
    field: 'acciones',
    sortable: false
  }
]

// Datos estáticos (estos podrían venir también de BD si fuera necesario)
const sucursales = ref([]) // Se cargarán de BD
const diasSemana = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

const iconos = [
  'medical_services',
  'favorite',
  'healing',
  'medication',
  'thermostat',
  'vaccines',
  'local_hospital',
  'science',
  'pets',
  'emergency'
]

const colores = [
  'blue',
  'green',
  'orange',
  'red',
  'purple',
  'teal',
  'brown',
  'blue-grey',
  'deep-orange',
  'pink'
]

const estadoOptions = [
  { label: 'Activo', value: 'S' },
  { label: 'Inactivo', value: 'N' }
]

const urgenciasOptions = [
  { label: 'Sí', value: 'S' },
  { label: 'No', value: 'N' }
]

// Computed
const selectedServiceSchedules = computed(() => {
  if (!selectedService.value) return []
  return schedules.value.filter(s => s.id_servicio === selectedService.value.id)
})

// Métodos Auxiliares
const getDiaName = (dia) => {
  const d = diasSemana.find(d => d.value === dia)
  return d ? d.label : 'Desconocido'
}

const getSucursalName = (id) => {
  const s = sucursales.value.find(s => s.id === id)
  return s ? s.nombre : 'Desconocida'
}

const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

// Métodos de Carga de Datos
const loadSucursales = async () => {
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo('sucursal', 'get')
    if (response) {
      sucursales.value = response.map(s => ({
        id: s.id,
        nombre: s.descripcion // Asumiendo que 'descripcion' es el nombre
      }))
    }
  } catch (error) {
    console.error('Error cargando sucursales', error)
  }
}

const loadServices = async () => {
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo('servicioagenda', 'get')
    if (response) {
      services.value = response
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los servicios',
      position: 'top-right'
    })
  }
}

const loadSchedules = async () => {
  try {
    const peticion = new NdPeticionControl()
    // Asumiendo que el modelo es 'horarioservicio'
    const response = await peticion.invocarMetodo('servicioagendahorario', 'get')
    if (response) {
      schedules.value = response
    }
  } catch (error) {
    console.error('Error cargando horarios', error)
    // No notificamos error visual aquí para no saturar si falla este endpoint específico
  }
}

const loadData = async () => {
  await Promise.all([loadSucursales(), loadServices(), loadSchedules()])
}

const selectService = (service) => {
  selectedService.value = service
}

const openServiceDialog = (service = null) => {
  if (service) {
    currentService.value = { ...service }
  } else {
    currentService.value = {
      id_configuracion: 1,
      duracion_minutos: 30,
      nombre: '',
      descripcion: '',
      activo: 'S',
      precio: 0,
      icono: 'medical_services',
      color: 'blue',
      urgencias: 'N',
      id_sucursal: store.sucursalSeleccionada.id
    }
  }
  serviceDialog.value = true
}

const saveService = async () => {
  try {
    const peticionService = new PeticionService()
    let response
    
    // Asegurar tipos de datos
    const dataToSend = {
      ...currentService.value,
      precio: Number(currentService.value.precio),
      duracion_minutos: Number(currentService.value.duracion_minutos),
      id_configuracion: 1
    }

    if (currentService.value.id) {
      response = await peticionService.actualizar('servicioagenda', dataToSend)
    } else {
      response = await peticionService.crear('servicioagenda', dataToSend)
    }

    if (response) {
      /*$q.notify({
        type: 'positive',
        message: 'Servicio guardado correctamente',
        position: 'top-right'
      })*/
      await loadServices()
      serviceDialog.value = false
      
      // Si estábamos editando el seleccionado, actualizarlo
      if (selectedService.value?.id === currentService.value.id) {
        selectedService.value = services.value.find(s => s.id === currentService.value.id)
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el servicio',
      position: 'top-right'
    })
  }
}

const confirmDeleteService = (serviceId) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este servicio? También se eliminarán todos sus horarios.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteService(serviceId)
  })
}

const deleteService = async (serviceId) => {
  try {
    const peticionService = new PeticionService()
    await peticionService.eliminar('servicio', { id: serviceId })
    
    $q.notify({
      type: 'positive',
      message: 'Servicio eliminado correctamente',
      position: 'top-right'
    })
    
    await loadServices()
    await loadSchedules() // Recargar horarios por si se borraron en cascada
    
    if (selectedService.value?.id === serviceId) {
      selectedService.value = null
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el servicio',
      position: 'top-right'
    })
  }
}

const openScheduleDialog = (schedule = null) => {
  if (!selectedService.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un servicio primero',
      position: 'top-right'
    })
    return
  }

  if (schedule) {
    currentSchedule.value = { ...schedule }
  } else {
    currentSchedule.value = {
      id_servicio: selectedService.value.id,
      id_sucursal: store.sucursalSeleccionada.id,
      dia_semana: null,
      hora_inicio: '08:00',
      hora_fin: '17:00',
      intervalo_minutos: selectedService.value.duracion_minutos,
      activo: 'S',
      fechaalta: new Date().toISOString(),
      //id_sitio: store.id_sitio
    }
  }
  scheduleDialog.value = true
}

const saveSchedule = async () => {
  try {
    const peticionService = new PeticionService()
    let response
    
    const dataToSend = {
      ...currentSchedule.value,
      intervalo_minutos: Number(currentSchedule.value.intervalo_minutos),
      id_servicio: selectedService.value.id
    }

    if (currentSchedule.value.id) {
      response = await peticionService.actualizar('servicioagendahorario', dataToSend)
    } else {
      response = await peticionService.crear('servicioagendahorario', dataToSend)
    }

    if (response) {
      /*$q.notify({
        type: 'positive',
        message: 'Horario guardado correctamente',
        position: 'top-right'
      })*/
      await loadSchedules()
      scheduleDialog.value = false
    }
  } catch (error) {
    /*$q.notify({
      type: 'negative',
      message: 'Error al guardar el horario',
      position: 'top-right'
    })*/
  }
}

const confirmDeleteSchedule = (scheduleId) => {
  deleteSchedule(scheduleId)
}

const deleteSchedule = async (scheduleId) => {
  try {
    const peticionService = new PeticionService()
    await peticionService.eliminar('servicioagendahorario', { id: scheduleId }, true, '')
    
    /*$q.notify({
      type: 'positive',
      message: 'Horario eliminado correctamente',
      position: 'top-right'
    })*/
    
    await loadSchedules()
  } catch (error) {
    /*$q.notify({
      type: 'negative',
      message: 'Error al eliminar el horario',
      position: 'top-right'
    })*/
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.service-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.selected-service {
  border-color: var(--q-primary) !important;
  background-color: rgba(var(--q-primary-rgb), 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--q-primary-rgb), 0.3);
}
</style>