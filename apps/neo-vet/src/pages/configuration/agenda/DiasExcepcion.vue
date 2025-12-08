<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-primary">
        Días de Excepción y Feriados
      </div>
      <q-btn
        color="primary"
        label="Agregar Excepción"
        icon="add"
        @click="openDialog()"
      />
    </div>

    <!-- Tabla de Excepciones -->
    <q-table
      :rows="exceptions"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay días de excepción configurados"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template #body-cell-fecha="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-icon name="event" color="grey-6" size="sm" class="q-mr-sm" />
            <span>{{ formatDate(props.value) }}</span>
          </div>
        </q-td>
      </template>

      <template #body-cell-feriado="props">
        <q-td :props="props">
          <q-chip
            :color="props.value === 'S' ? 'purple' : 'blue'"
            text-color="white"
            size="sm"
            :icon="props.value === 'S' ? 'celebration' : 'event_busy'"
          >
            {{ props.value === 'S' ? 'Feriado' : 'Excepción' }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-horario="props">
        <q-td :props="props">
          <div v-if="props.row.hora_inicio && props.row.hora_fin" class="row items-center">
            <q-icon name="schedule" color="grey-6" size="sm" class="q-mr-sm" />
            <span>{{ formatTime(props.row.hora_inicio) }} - {{ formatTime(props.row.hora_fin) }}</span>
          </div>
          <div v-else class="text-grey-6 text-italic">
            Día completo
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
              @click="openDialog(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="red"
              icon="delete"
              size="sm"
              @click="confirmDelete(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog de Edición/Creación -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ currentException.id ? 'Editar Excepción' : 'Nueva Excepción' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="dialog = false" />
        </q-card-section>

        <q-card-section>
          <q-form ref="form" @submit="save" class="column q-gutter-md">
            
            <q-input
              v-model="currentException.descripcion"
              label="Descripción"
              outlined
              :rules="[val => !!val || 'La descripción es requerida']"
            />

            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="currentException.fecha"
                  label="Fecha"
                  outlined
                  mask="date"
                  :rules="['date']"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="currentException.fecha">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col">
                <q-select
                  v-model="currentException.id_sucursal"
                  label="Sucursal"
                  outlined
                  :options="sucursales"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  :rules="[val => !!val || 'La sucursal es requerida']"
                />
              </div>
            </div>

            <div class="row q-gutter-sm">
              <div class="col">
                <q-select
                  v-model="currentException.feriado"
                  label="Tipo"
                  outlined
                  :options="tipoOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                />
              </div>
              <div class="col">
                <q-select
                  v-model="currentException.activo"
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

            <div class="text-subtitle2 q-mt-sm">Horario Especial (Opcional)</div>
            <div class="text-caption text-grey-6 q-mb-sm">
              Si se deja vacío, se considera día no laborable completo. Si se especifica, se considera horario especial de trabajo.
            </div>
            
            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="currentException.hora_inicio"
                  label="Hora Inicio"
                  outlined
                  mask="time"
                  clearable
                >
                  <template #append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="currentException.hora_inicio" format24h>
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
                  v-model="currentException.hora_fin"
                  label="Hora Fin"
                  outlined
                  mask="time"
                  clearable
                >
                  <template #append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="currentException.hora_fin" format24h>
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

          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="dialog = false" />
          <q-btn
            color="primary"
            label="Guardar"
            @click="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import NdPeticionControl from 'src/controles/rest.control'
import PeticionService from 'src/services/peticion.service'

const $q = useQuasar()

// Props para recibir datos necesarios del padre si fuera necesario
// const props = defineProps({})

// Estados
const exceptions = ref([])
const sucursales = ref([])
const loading = ref(false)
const dialog = ref(false)
const currentException = ref({})

// Opciones
const estadoOptions = [
  { label: 'Activo', value: 'S' },
  { label: 'Inactivo', value: 'N' }
]

const tipoOptions = [
  { label: 'Feriado / Festivo', value: 'S' },
  { label: 'Excepción Operativa', value: 'N' }
]

// Columnas
const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: true },
  { name: 'feriado', label: 'Tipo', field: 'feriado', align: 'center', sortable: true },
  { name: 'horario', label: 'Horario', field: row => `${row.hora_inicio || ''} - ${row.hora_fin || ''}`, align: 'left' },
  { name: 'sucursal', label: 'Sucursal', field: 'id_sucursal', align: 'left', sortable: true },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Métodos Auxiliares
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD/MM/YYYY')
}

const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

const getSucursalName = (id) => {
  const s = sucursales.value.find(s => s.id === id)
  return s ? s.nombre : 'Desconocida'
}

// Carga de Datos
const loadSucursales = async () => {
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo('sucursal', 'get')
    if (response) {
      sucursales.value = response.map(s => ({
        id: s.id,
        nombre: s.descripcion
      }))
    }
  } catch (error) {
    console.error('Error cargando sucursales', error)
  }
}

const loadExceptions = async () => {
  loading.value = true
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo('diaexcepcion', 'get')
    if (response) {
      exceptions.value = response
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar días de excepción',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

// Acciones
const openDialog = (exception = null) => {
  if (exception) {
    currentException.value = { ...exception }
    // Asegurar formato de fecha para el input
    if (currentException.value.fecha) {
      currentException.value.fecha = date.formatDate(currentException.value.fecha, 'YYYY/MM/DD')
    }
  } else {
    currentException.value = {
      descripcion: '',
      fecha: date.formatDate(new Date(), 'YYYY/MM/DD'),
      activo: 'S',
      feriado: 'S',
      hora_inicio: null,
      hora_fin: null,
      dia_semana: 0, // Se calculará al guardar
      id_sucursal: sucursales.value.length > 0 ? sucursales.value[0].id : null
    }
  }
  dialog.value = true
}

const save = async () => {
  try {
    const peticionService = new PeticionService()
    let response
    
    // Calcular día de la semana
    const d = new Date(currentException.value.fecha)
    const diaSemana = d.getDay() // 0 = Domingo, 1 = Lunes, etc.

    const dataToSend = {
      ...currentException.value,
      dia_semana: diaSemana
    }

    if (currentException.value.id) {
      response = await peticionService.actualizar('diaexcepcion', dataToSend)
    } else {
      response = await peticionService.crear('diaexcepcion', dataToSend)
    }

    if (response) {
      $q.notify({
        type: 'positive',
        message: 'Guardado correctamente',
        position: 'top-right'
      })
      await loadExceptions()
      dialog.value = false
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar',
      position: 'top-right'
    })
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar esta excepción?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const peticionService = new PeticionService()
      await peticionService.eliminar('diaexcepcion', { id })
      
      $q.notify({
        type: 'positive',
        message: 'Eliminado correctamente',
        position: 'top-right'
      })
      await loadExceptions()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar',
        position: 'top-right'
      })
    }
  })
}

onMounted(async () => {
  await loadSucursales()
  await loadExceptions()
})
</script>
