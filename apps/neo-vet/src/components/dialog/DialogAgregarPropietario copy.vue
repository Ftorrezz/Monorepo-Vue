<template>
  <div>
    <div class="text-h5 q-mb-md text-teal">Propietario</div>
    <q-separator class="q-mb-md" color="grey-3" style="height: 2px" />

    <q-tabs
      v-model="tabPropietario"
      dense
      class="text-grey q-mb-lg"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="general" label="General" />
      <q-tab name="adicional" label="Adicional" />
      <q-tab name="facturacion" label="Facturación" />
    </q-tabs>

    <q-tab-panels v-model="tabPropietario" animated class="flex-panels">
      <q-tab-panel name="general" class="flex-panel-content">
        <q-form ref="formPropietario">
          <div class="row q-col-gutter-sm q-pa-none">
            <!-- Contenedor principal que agrupa la foto y los campos -->
            <div class="row full-width q-col-gutter-md q-pa-none">
              <!-- Sección de la foto -->
              <div class="col-lg-2 col-md-3 col-sm-6 col-xs-12 q-pa-none">
                <div class="camera-section">
                  <div class="photo-container">
                    <video
                      v-show="!imagenCapturada && camaraActiva"
                      ref="video"
                      class="camera-preview"
                      autoplay
                      playsinline
                    ></video>
                    <canvas
                      ref="canvas"
                      width="640"
                      height="480"
                      style="display: none;"
                    ></canvas>
                    <img
                      v-if="imagenCapturada"
                      :src="imagenCapturada"
                      class="captured-image"
                      alt="Foto del propietario"
                    />
                    <div v-if="!camaraActiva && !imagenCapturada" class="photo-placeholder">
                      <q-icon name="photo_camera" size="32px" color="grey-7" />
                      <div class="text-grey-7 text-caption q-mt-sm">Click para foto</div>
                    </div>
                  </div>
                  <!-- Modificar los controles de la cámara -->
                  <div class="camera-controls q-mt-sm">
                    <q-btn
                      v-if="!camaraActiva && !imagenCapturada"
                      color="primary"
                      dense
                      icon="camera_alt"
                      size="sm"
                      @click="activarCamara"
                    >
                      <q-tooltip>Activar Cámara</q-tooltip>
                    </q-btn>
                    <template v-if="camaraActiva">
                      <q-btn
                        color="primary"
                        dense
                        icon="camera"
                        size="sm"
                        @click="capturarFoto"
                      >
                        <q-tooltip>Capturar</q-tooltip>
                      </q-btn>
                      <q-btn
                        color="negative"
                        dense
                        icon="close"
                        size="sm"
                        @click="detenerCamara"
                        class="q-ml-sm"
                      >
                        <q-tooltip>Cancelar</q-tooltip>
                      </q-btn>
                    </template>
                    <q-btn
                      v-if="imagenCapturada"
                      color="negative"
                      dense
                      icon="refresh"
                      size="sm"
                      @click="reiniciarCamara"
                      class="q-ml-sm"
                    >
                      <q-tooltip>Volver a tomar</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>

              <!-- Campos de nombre y apellidos -->
              <div class="col-lg-10 col-md-9 col-sm-6 col-xs-12 q-pa-none">
                <div class="row q-col-gutter-sm">
                  <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                    <q-input
                      v-model="propietario.primerapellido"
                      label="Primer Apellido"
                      :rules="[val => !!val || 'El primer apellido es requerido']"
                    />
                  </div>
                  <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                    <q-input
                      v-model="propietario.segundoapellido"
                      label="Segundo Apellido"
                    />
                  </div>
                  <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                    <q-input
                      v-model="propietario.nombre"
                      label="Nombres"
                      :rules="[val => !!val || 'El nombre es requerido']"
                    />
                  </div>
                  <!-- Correo y teléfono alineados -->
                  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-input
                      v-model="propietario.correo"
                      label="Correo electrónico"
                      type="email"
                      :rules="[
                        val => !!val || 'El correo electrónico es requerido',
                        val => isValidEmail(val) || 'Formato de correo inválido'
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="mail" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-input
                      v-model="propietario.telefonocelular"
                      label="Teléfono móvil"
                      :rules="[val => !!val || 'El teléfono móvil es requerido']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="phone_android" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="adicional">
        <q-form ref="formAdicional">
          <div class="row q-col-gutter-md">
            <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                v-model="propietario.id_genero"
                :options="opcionesGenero"
                label="Género"
                emit-value
                map-options
                filled
                class="full-width"
              />
            </div>
            <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                v-model="propietario.id_estadocivil"
                :options="opcionesEstadoCivil"
                label="Estado Civil"
                emit-value
                map-options
                filled
                class="full-width"
              />
            </div>
            <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                v-model="propietario.id_escolaridad"
                :options="opcionesEscolaridad"
                label="Escolaridad"
                emit-value
                map-options
                filled
                class="full-width"
              />
            </div>
            <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="propietario.fechanacimiento"
                label="Fecha de Nacimiento"
                type="date"
                @update:model-value="calcularEdad"
                filled
                class="full-width"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="propietario.observacion"
                type="textarea"
                label="Observaciones"
                rows="3"
                filled
                class="full-width"
              />
            </div>
          </div>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="facturacion">
        <div class="text-h6">Facturación</div>
        <!-- Campos de facturación aquí -->
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  propietarioData: {
    type: Object,
    default: () => ({
      id: null,
      primerapellido: '',
      segundoapellido: '',
      nombre: '',
      correo: '',
      telefonocelular: '',
      id_genero: null,
      id_estadocivil: null,
      id_escolaridad: null,
      fechanacimiento: null,
      observacion: ''
    })
  }
});

const emit = defineEmits(['update:propietario', 'propietario-guardado']);

// Tabs
const tabPropietario = ref('general');

// Cámara
const video = ref(null);
const canvas = ref(null);
const camaraActiva = ref(false);
const imagenCapturada = ref(null);
const stream = ref(null);

// Datos del propietario
const propietario = ref({ ...props.propietarioData });

// Opciones para los selects
const opcionesGenero = ref([
  { label: 'Masculino', value: 1 },
  { label: 'Femenino', value: 2 },
  { label: 'Otro', value: 3 }
]);

const opcionesEstadoCivil = ref([
  { label: 'Soltero/a', value: 1 },
  { label: 'Casado/a', value: 2 },
  { label: 'Divorciado/a', value: 3 },
  { label: 'Viudo/a', value: 4 }
]);

const opcionesEscolaridad = ref([
  { label: 'Primaria', value: 1 },
  { label: 'Secundaria', value: 2 },
  { label: 'Preparatoria', value: 3 },
  { label: 'Universidad', value: 4 },
  { label: 'Posgrado', value: 5 }
]);

// Funciones para la cámara
const activarCamara = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    video.value.srcObject = stream.value;
    camaraActiva.value = true;
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
  }
};

const capturarFoto = () => {
  const context = canvas.value.getContext('2d');
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
  imagenCapturada.value = canvas.value.toDataURL('image/png');
  detenerCamara();
};

const detenerCamara = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  camaraActiva.value = false;
};

const reiniciarCamara = () => {
  imagenCapturada.value = null;
  activarCamara();
};

// Validación de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Calcular edad
const calcularEdad = () => {
  if (propietario.value.fechanacimiento) {
    // Lógica para calcular la edad
  }
};

// Validar formulario
const validarFormulario = async () => {
  const formPropietario = document.querySelector('ref[formPropietario]');
  if (formPropietario && !await formPropietario.validate()) {
    return false;
  }
  return true;
};

// Exponer métodos y propiedades para el componente padre
defineExpose({
  propietario,
  validarFormulario
});

// Actualizar el propietario cuando cambie
watch(propietario, (newValue) => {
  emit('update:propietario', newValue);
}, { deep: true });
</script>

<style scoped>
.camera-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0;
}

.photo-container {
  width: 130px;
  height: 130px;
  border: 3px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  cursor: pointer;
  position: relative;
}

.camera-preview, .captured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.camera-controls {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.flex-panels {
  display: flex;
  flex-direction: column;
}

.flex-panel-content {
  flex: 1;
  overflow: auto;
}
</style>
