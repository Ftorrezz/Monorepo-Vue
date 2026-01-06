<template>
  <div class="q-pa-md">
    <q-card class="shadow-10">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5 flex items-center">
          <q-icon name="calendar_month" size="md" class="q-mr-md" />
          Generar Agenda
        </div>
        <div class="text-subtitle2 q-mt-sm">
          Genera los espacios de agenda disponibles basados en la configuración de servicios y horarios.
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <q-form @submit="generarAgenda" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Rango de Fechas -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="fechaInicio"
                label="Fecha Inicio"
                outlined
                type="date"
                :rules="[val => !!val || 'La fecha de inicio es requerida']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="fechaFin"
                label="Fecha Fin"
                outlined
                type="date"
                :rules="[
                  val => !!val || 'La fecha de fin es requerida',
                  val => !fechaInicio || new Date(val) >= new Date(fechaInicio) || 'La fecha fin debe ser posterior a la fecha inicio'
                ]"
              />
            </div>

            <!-- Sucursal (Readonly or Select if needed, defaulting to current store selection) -->
            <div class="col-12 col-md-6">
              <q-input
                :model-value="store.sucursalSeleccionada?.descripcion || 'Sin Sucursal Seleccionada'"
                label="Sucursal"
                outlined
                readonly
                hint="Se utilizará la sucursal seleccionada actualmente"
              >
                <template #prepend>
                  <q-icon name="store" />
                </template>
              </q-input>
            </div>

            <!-- Servicio (Opcional) -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="servicioSeleccionado"
                :options="servicios"
                option-value="id"
                option-label="nombre"
                label="Servicio (Opcional)"
                outlined
                clearable
                emit-value
                map-options
                hint="Deja vacío para generar agenda de todos los servicios"
              >
                <template #prepend>
                  <q-icon name="medical_services" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="row justify-end q-mt-lg">
            <q-btn
              label="Generar Agenda"
              type="submit"
              color="primary"
              icon="autorenew"
              :loading="loading"
              size="lg"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import NdPeticionControl from 'src/controles/rest.control'
import { useDialogStore } from 'neo-auth/src/stores/DialogoUbicacion'

const $q = useQuasar()
const store = useDialogStore()

const fechaInicio = ref('')
const fechaFin = ref('')
const servicioSeleccionado = ref(null)
const servicios = ref([])
const loading = ref(false)

const loadServices = async () => {
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo('servicioagenda', 'get')
    if (response) {
      servicios.value = response
    }
  } catch (error) {
    console.error('Error cargando servicios', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los servicios',
      position: 'top-right'
    })
  }
}

const generarAgenda = async () => {
  if (!store.sucursalSeleccionada?.id) {
    $q.notify({
      type: 'warning',
      message: 'Debes seleccionar una sucursal primero',
      position: 'top-right'
    })
    return
  }

  loading.value = true
  try {
    const peticion = new NdPeticionControl()
    // Endpoint: agenda/generar
    // Query params: fecha_inicio, fecha_fin, id_sucursal, id_sitio, id_servicio (opcional)
    
    const params = {
      fecha_inicio: fechaInicio.value,
      fecha_fin: fechaFin.value,
      id_sucursal: store.sucursalSeleccionada.id,
      //id_sitio: store.id_sitio || 1, // Fallback if id_sitio is not in store, though it should be
    }

    if (servicioSeleccionado.value) {
      params.id_servicio = servicioSeleccionado.value
    }

    // Construct DtoParametros
    const dtoParams = {
      filtro: params
    }

    // Pass dtoParams as the 4th argument (parametros), 3rd argument (modelo) is null for GET
    const response = await peticion.invocarMetodo('agenda/generar', 'post', null, dtoParams)
    
  } catch (error) {
    console.error('Error generando agenda', error)
    
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Set default dates (e.g., today and 1 month from now)
  const today = new Date()
  const nextMonth = new Date()
  nextMonth.setMonth(today.getMonth() + 1)
  
  fechaInicio.value = today.toISOString().split('T')[0]
  fechaFin.value = nextMonth.toISOString().split('T')[0]
  
  loadServices()
})
</script>
