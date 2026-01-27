<template>
  <div>
    <q-dialog v-model="mostrarDialogo" persistent @hide="cerrar">
      <q-card class="dialog-mascota-rapido" style="min-width: 500px; max-width: 700px">
        <!-- Header -->
        <q-bar class="bg-secondary text-white">
          <q-icon name="pets" size="sm" />
          <div class="text-subtitle1 q-ml-sm">Nueva Mascota</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <!-- Propietario Info Banner -->
        <q-card-section class="bg-blue-1 q-py-sm">
          <div class="row items-center">
            <q-icon name="person" color="primary" size="sm" class="q-mr-sm" />
            <span class="text-body2">
              <strong>Propietario:</strong> 
              {{ propietario?.nombre }} {{ propietario?.primerapellido }} {{ propietario?.segundoapellido }}
            </span>
          </div>
        </q-card-section>

        <!-- Content -->
        <q-card-section class="q-pa-md">
          <q-form ref="formRef" @submit.prevent="guardar">
            <div class="row q-col-gutter-md">
              <!-- Información Básica -->
              <div class="col-12">
                <div class="text-subtitle2 text-secondary q-mb-sm">Información Básica</div>
              </div>

              <div class="col-6">
                <q-input
                  v-model="mascota.nombre"
                  label="Nombre *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El nombre es requerido']"
                  class="uppercase"
                />
              </div>

              <div class="col-6">
                <ListaEspecie
                  v-model="mascota.id_especie"
                  label="Especie *"
                  outlined
                  dense
                  
                />
              </div>

              <div class="col-6">
                <ListaRazaMascota
                  v-model="mascota.id_raza"
                  outlined
                  dense
                />
              </div>

              <div class="col-6">
                <ListaSexo
                  v-model="mascota.id_sexo"
                  outlined
                  dense
                />
              </div>

              <!-- Edad -->
              <div class="col-12 q-mt-md">
                <div class="text-subtitle2 text-secondary q-mb-sm">Edad</div>
              </div>

              <div class="col-6">
                <q-input
                  v-model="mascota.fechanacimiento"
                  label="Fecha de Nacimiento"
                  type="date"
                  outlined
                  dense
                  @update:model-value="calcularEdad"
                >
                  <template v-slot:prepend>
                    <q-icon name="cake" />
                  </template>
                </q-input>
              </div>

              <div class="col-6">
                <q-input
                  v-model.number="mascota.edad"
                  label="Edad (años)"
                  type="number"
                  outlined
                  dense
                  :readonly="!!mascota.fechanacimiento"
                  @update:model-value="onEdadChange"
                  min="0"
                  step="1"
                >
                  <template v-slot:prepend>
                    <q-icon name="schedule" />
                  </template>
                  <template v-slot:hint v-if="mascota.fechanacimiento">
                    Calculado automáticamente
                  </template>
                </q-input>
              </div>

              <!-- Observaciones -->
              <div class="col-12">
                <q-input
                  v-model="mascota.observaciones"
                  label="Observaciones"
                  type="textarea"
                  outlined
                  dense
                  rows="2"
                >
                  <template v-slot:prepend>
                    <q-icon name="notes" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions align="right" class="q-pa-md bg-grey-2">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="cerrar"
          />
          <q-btn
            unelevated
            label="Guardar"
            color="secondary"
            icon-right="save"
            @click="guardar"
            :loading="guardando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QForm, useQuasar } from 'quasar'
import PeticionService from 'src/services/peticion.service'
import NdAlertasControl from 'src/controles/alertas.control'
import { obtenerIDValue } from '../../../../../libs/shared/src/helper/FuncionesGenericas'
import { useDialogStore } from 'src/stores/DialogoUbicacion'
import ListaRazaMascota from "../../../../../libs/shared/src/components/listas/ListaRazaMascota.vue";
import ListaSexo from "../../../../../libs/shared/src/components/listas/ListaSexo.vue";
import ListaEspecie from "../../../../../libs/shared/src/components/listas/ListaEspecie.vue";


const store = useDialogStore()

const props = defineProps({
  propietario: {
    type: Object,
    required: true
  },
  mascotaData: {
    type: Object,
    default: () => ({
      id: null,
      id_propietario: null,
      nombre: '',
      id_especie: null,
      id_raza: null,
      id_sexo: null,
      fechanacimiento: null,
      edad: null,
      observaciones: '',
      activo: 'S',
      historiaclinica: ''
    })
  }
})

const emit = defineEmits(['mascota-guardada', 'cerrar'])

const $q = useQuasar()
const alertas = new NdAlertasControl()
const peticionService = new PeticionService()

// State
const mostrarDialogo = ref(true)
const guardando = ref(false)
const formRef = ref(null)

// Data
const mascota = ref({
  ...props.mascotaData,
  id_propietario: props.propietario?.id,
  id_sucursal: store.sucursalSeleccionada.id
})

// Methods
const calcularEdad = () => {
  if (mascota.value.fechanacimiento) {
    const fechaNac = new Date(mascota.value.fechanacimiento)
    const hoy = new Date()
    let edad = hoy.getFullYear() - fechaNac.getFullYear()
    const mes = hoy.getMonth() - fechaNac.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--
    }
    mascota.value.edad = edad >= 0 ? edad : 0
  }
}

const onEdadChange = (nuevaEdad) => {
  // Si se ingresa una edad manualmente y no hay fecha de nacimiento
  if (nuevaEdad && !mascota.value.fechanacimiento) {
    const edadNum = typeof nuevaEdad === 'string' ? parseInt(nuevaEdad, 10) : nuevaEdad
    mascota.value.edad = isNaN(edadNum) ? null : edadNum
  }
}

const guardar = async () => {
  const esValido = await formRef.value?.validate()
  if (!esValido) {
    alertas.mostrarMensaje(
      'error',
      'Mascota',
      'Por favor, completa los campos requeridos.'
    )
    return
  }

  guardando.value = true
  try {
    const payload = {
      ...mascota.value,
      id_propietario: props.propietario.id,
      activo: 'S',
      id_sitio: 1, // TODO: get from global context
      id_sucursal: store.sucursalSeleccionada?.id || 2
    }

    // Transform ID fields from list components
    payload.id_especie = obtenerIDValue(payload.id_especie)
    payload.id_sexo = obtenerIDValue(payload.id_sexo)
    payload.id_raza = obtenerIDValue(payload.id_raza)

    let resultado
    if (payload.id) {
      resultado = await peticionService.actualizar('paciente', payload)
    } else {
      if (payload.id === null || payload.id === undefined) {
        delete payload.id
      }
      resultado = await peticionService.crear('paciente', payload)
    }

    const mascotaGuardada = {
      ...payload,
      id: resultado?.id || resultado?.elemento?.id || payload.id
    }

    emit('mascota-guardada', mascotaGuardada)
    cerrar()
  } catch (error) {
    console.error('Error guardando mascota:', error)
    // PeticionService already shows the error notification
  } finally {
    guardando.value = false
  }
}

const cerrar = () => {
  mostrarDialogo.value = false
}

// Watchers
watch(
  () => mascota.value.fechanacimiento,
  (nuevaFecha) => {
    if (nuevaFecha) {
      calcularEdad()
    } else {
      mascota.value.edad = null
    }
  }
)

watch(
  () => props.propietario?.id,
  (newValue) => {
    mascota.value.id_propietario = newValue
  }
)

// Calculate age on mount if fechanacimiento is present
if (mascota.value.fechanacimiento) {
  calcularEdad()
}
</script>

<style scoped>
.dialog-mascota-rapido {
  border-radius: 12px;
}

/* Uppercase text transformation */
.uppercase :deep(.q-field__native) {
  text-transform: uppercase;
}

/* Smooth transitions */
:deep(.q-field) {
  transition: all 0.2s ease;
}
</style>
