<template>
  <div>
    <q-dialog v-model="mostrarDialogo" persistent>
      <q-card class="dialog-propietario-rapido" style="min-width: 500px; max-width: 700px">
        <!-- Header -->
        <q-bar class="bg-primary text-white">
          <q-icon name="person_add" size="sm" />
          <div class="text-subtitle1 q-ml-sm">Nuevo Propietario</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <!-- Content -->
        <q-card-section class="q-pa-md">
          <q-form ref="formRef" @submit.prevent="guardar">
            <div class="row q-col-gutter-md">
              <!-- Nombres -->
              <div class="col-12">
                <div class="text-subtitle2 text-primary q-mb-sm">Información Personal</div>
              </div>

              <div class="col-4">
                <q-input
                  v-model="propietario.primerapellido"
                  label="Primer Apellido *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Requerido']"
                  class="uppercase"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model="propietario.segundoapellido"
                  label="Segundo Apellido"
                  outlined
                  dense
                  class="uppercase"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model="propietario.nombre"
                  label="Nombres *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Requerido']"
                  class="uppercase"
                />
              </div>

              <!-- Contacto -->
              <div class="col-12 q-mt-md">
                <div class="text-subtitle2 text-primary q-mb-sm">Contacto</div>
              </div>

              <div class="col-6">
                <q-input
                  v-model="propietario.telefono1"
                  label="Teléfono móvil *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone_android" />
                  </template>
                </q-input>
              </div>

              <div class="col-6">
                <q-input
                  v-model="propietario.email"
                  label="Email *"
                  type="email"
                  outlined
                  dense
                  :rules="[
                    val => !!val || 'Requerido',
                    val => isValidEmail(val) || 'Email inválido'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>

              <!-- Observaciones -->
              <div class="col-12">
                <q-input
                  v-model="propietario.observaciones"
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
            color="primary"
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
import { ref } from 'vue'
import { QForm, useQuasar } from 'quasar'
import PeticionService from 'src/services/peticion.service'
import NdAlertasControl from 'src/controles/alertas.control'

const props = defineProps({
  propietarioData: {
    type: Object,
    default: () => ({
      id: null,
      primerapellido: '',
      segundoapellido: '',
      nombre: '',
      telefono1: '',
      email: '',
      observaciones: '',
      activo: 'S',
      id_sitio: 1
    })
  }
})

const emit = defineEmits(['propietario-guardado', 'cerrar'])

const $q = useQuasar()
const alertas = new NdAlertasControl()
const peticionService = new PeticionService()

// State
const mostrarDialogo = ref(true)
const guardando = ref(false)
const formRef = ref(null)

// Data
const propietario = ref({ ...props.propietarioData })

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const guardar = async () => {
  const esValido = await formRef.value?.validate()
  if (!esValido) {
    alertas.mostrarMensaje(
      'error',
      'Propietario',
      'Por favor, completa los campos requeridos.'
    )
    return
  }

  guardando.value = true
  try {
    const payload = {
      ...propietario.value,
      activo: 'S',
      id_sitio: 1 // TODO: get from global context
    }

    let resultado
    if (payload.id) {
      resultado = await peticionService.actualizar('propietario', payload)
    } else {
      if (payload.id === null || payload.id === undefined) {
        delete payload.id
      }
      resultado = await peticionService.crear('propietario', payload)
    }

    const propietarioGuardado = {
      ...payload,
      id: resultado?.id || resultado?.elemento?.id || payload.id
    }

    emit('propietario-guardado', propietarioGuardado)
    cerrar()
  } catch (error) {
    console.error('Error guardando propietario:', error)
    // PeticionService already shows the error notification
  } finally {
    guardando.value = false
  }
}

const cerrar = () => {
  mostrarDialogo.value = false
  setTimeout(() => {
    emit('cerrar')
  }, 300)
}
</script>

<style scoped>
.dialog-propietario-rapido {
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
