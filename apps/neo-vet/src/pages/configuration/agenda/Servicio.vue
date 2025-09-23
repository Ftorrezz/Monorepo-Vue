<template>
  <div class="q-pa-md">
    <q-card class="shadow-10">
      <!-- Header -->
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="medical_services" size="md" class="q-mr-md" />
            Configuración de Servicios Veterinarios
          </div>
          <q-btn
            color="white"
            text-color="primary"
            label="Nuevo Servicio"
            icon="add"
            @click="openServiceDialog()"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Grid de Servicios -->
        <div class="row q-gutter-md q-mb-lg">
          <div
            v-for="service in services"
            :key="service.id"
            class="col-12 col-sm-6 col-md-3"
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

            <template #body-cell-sucursal="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-icon name="place" color="grey-6" size="sm" class="q-mr-sm" />
                  <span>{{ getSucursalName(props.value) }}</span>
                </div>
              </q-td>
            </template>

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
            <q-select
              v-model="currentSchedule.id_sucursal"
              label="Sucursal"
              outlined
              :options="sucursales"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              :rules="[val => !!val || 'La sucursal es requerida']"
            />

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

const $q = useQuasar()

// Estados reactivos
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

// Datos estáticos
const sucursales = ref([
  { id: 1, nombre: 'Sucursal Centro' },
  { id: 2, nombre: 'Sucursal Norte' },
  { id: 3, nombre: 'Sucursal Sur' }
])

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

// Métodos
const loadData = async () => {
  // Datos de ejemplo
  services.value = [
    {
      id: 1,
      id_configuracion: 1,
      duracion_minutos: 30,
      nombre: 'Consulta General',
      descripcion: 'Consulta veterinaria general para revisión de salud',
      activo: 'S',
      fechaalta: '2024-01-15T10:30:00',
      precio: 250.00,
      icono: 'medical_services',
      color: 'blue',
      urgencias: 'N'
    },
    {
      id: 2,
      id_configuracion: 1,
      duracion_minutos: 45,
      nombre: 'Vacunación',
      descripcion: 'Aplicación de vacunas preventivas',
      activo: 'S',
      fechaalta: '2024-01-15T11:00:00',
      precio: 180.00,
      icono: 'vaccines',
      color: 'green',
      urgencias: 'N'
    },
    {
      id: 3,
      id_configuracion: 1,
      duracion_minutos: 60,
      nombre: 'Cirugía Menor',
      descripcion: 'Procedimientos quirúrgicos menores',
      activo: 'S',
      fechaalta: '2024-01-15T12:00:00',
      precio: 800.00,
      icono: 'healing',
      color: 'red',
      urgencias: 'S'
    },
    {
      id: 4,
      id_configuracion: 1,
      duracion_minutos: 20,
      nombre: 'Desparasitación',
      descripcion: 'Tratamiento antiparasitario',
      activo: 'S',
      fechaalta: '2024-01-15T13:00:00',
      precio: 120.00,
      icono: 'medication',
      color: 'orange',
      urgencias: 'N'
    }
  ]

  schedules.value = [
    {
      id: 1,
      id_servicio: 1,
      id_sucursal: 1,
      dia_semana: 1,
      hora_inicio: '08:00:00',
      hora_fin: '17:00:00',
      intervalo_minutos: 30,
      activo: 'S',
      fechaalta: '2024-01-15T10:30:00'
    },
    {
      id: 2,
      id_servicio: 1,
      id_sucursal: 1,
      dia_semana: 2,
      hora_inicio: '08:00:00',
      hora_fin: '17:00:00',
      intervalo_minutos: 30,
      activo: 'S',
      fechaalta: '2024-01-15T10:30:00'
    },
    {
      id: 3,
      id_servicio: 2,
      id_sucursal: 1,
      dia_semana: 1,
      hora_inicio: '09:00:00',
      hora_fin: '16:00:00',
      intervalo_minutos: 45,
      activo: 'S',
      fechaalta: '2024-01-15T11:00:00'
    },
    {
      id: 4,
      id_servicio: 1,
      id_sucursal: 2,
      dia_semana: 3,
      hora_inicio: '10:00:00',
      hora_fin: '18:00:00',
      intervalo_minutos: 30,
      activo: 'S',
      fechaalta: '2024-01-15T12:00:00'
    }
  ]
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
      urgencias: 'N'
    }
  }
  serviceDialog.value = true
}

const saveService = async () => {
  try {
    if (currentService.value.id) {
      const index = services.value.findIndex(s => s.id === currentService.value.id)
      services.value[index] = { ...currentService.value }
      
      // Si el servicio editado es el seleccionado, actualizarlo
      if (selectedService.value?.id === currentService.value.id) {
        selectedService.value = { ...currentService.value }
      }
      
      $q.notify({
        type: 'positive',
        message: 'Servicio actualizado correctamente',
        position: 'top-right'
      })
    } else {
      const newService = {
        ...currentService.value,
        id: Date.now(),
        fechaalta: new Date().toISOString()
      }
      services.value.push(newService)
      
      $q.notify({
        type: 'positive',
        message: 'Servicio creado correctamente',
        position: 'top-right'
      })
    }
    
    serviceDialog.value = false
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
    services.value = services.value.filter(s => s.id !== serviceId)
    schedules.value = schedules.value.filter(sh => sh.id_servicio !== serviceId)
    
    // Si el servicio eliminado estaba seleccionado, deseleccionarlo
    if (selectedService.value?.id === serviceId) {
      selectedService.value = null
    }
    
    $q.notify({
      type: 'positive',
      message: 'Servicio eliminado correctamente',
      position: 'top-right'
    })
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
    currentSchedule.value = {
      ...schedule,
      hora_inicio: schedule.hora_inicio.substring(0, 5),
      hora_fin: schedule.hora_fin.substring(0, 5)
    }
  } else {
    currentSchedule.value = {
      id_servicio: selectedService.value.id,
      id_sucursal: sucursales.value[0].id,
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fin: '17:00',
      intervalo_minutos: selectedService.value.duracion_minutos,
      activo: 'S'
    }
  }
  scheduleDialog.value = true
}

const saveSchedule = async () => {
  try {
    const scheduleToSave = {
      ...currentSchedule.value,
      id_servicio: selectedService.value.id,
      hora_inicio: `${currentSchedule.value.hora_inicio}:00`,
      hora_fin: `${currentSchedule.value.hora_fin}:00`
    }

    if (currentSchedule.value.id) {
      const index = schedules.value.findIndex(sh => sh.id === currentSchedule.value.id)
      schedules.value[index] = scheduleToSave
      
      $q.notify({
        type: 'positive',
        message: 'Horario actualizado correctamente',
        position: 'top-right'
      })
    } else {
      const newSchedule = {
        ...scheduleToSave,
        id: Date.now(),
        fechaalta: new Date().toISOString()
      }
      schedules.value.push(newSchedule)
      
      $q.notify({
        type: 'positive',
        message: 'Horario creado correctamente',
        position: 'top-right'
      })
    }
    
    scheduleDialog.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el horario',
      position: 'top-right'
    })
  }
}

const confirmDeleteSchedule = (scheduleId) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este horario?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteSchedule(scheduleId)
  })
}

const deleteSchedule = async (scheduleId) => {
  try {
    schedules.value = schedules.value.filter(sh => sh.id !== scheduleId)
    
    $q.notify({
      type: 'positive',
      message: 'Horario eliminado correctamente',
      position: 'top-right'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el horario',
      position: 'top-right'
    })
  }
}

const getSucursalName = (sucursalId) => {
  const sucursal = sucursales.value.find(s => s.id === sucursalId)
  return sucursal ? sucursal.nombre : 'Sucursal no encontrada'
}

const getDiaName = (dia) => {
  const diaObj = diasSemana.find(d => d.value === dia)
  return diaObj ? diaObj.label : 'Día no válido'
}

const formatTime = (time) => {
  return time.substring(0, 5)
}

// Lifecycle
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