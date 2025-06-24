<template>
  <div>

    <q-dialog v-model="mostrarDialogo" persistent>
    <q-card
      bordered
      elevated
      class="dialog-card"
    >
      <q-bar class="bg-primary text-white">
        <q-icon name="person" />
        <div>Mascota</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <template #default>
            <q-tooltip>Cerrar</q-tooltip>
          </template>
        </q-btn>
      </q-bar>

    <div class="text-h5 q-mb-md text-teal">Mascota</div>
    <q-separator class="q-mb-md" color="grey-3" style="height: 2px" />

    <q-tab-panels v-model="tabMascota" animated class="flex-panels">
      <q-tab-panel name="general" class="flex-panel-content">
        <q-form ref="formMascota">
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
                      style="display: none"
                    ></canvas>
                    <img
                      v-if="imagenCapturada"
                      :src="imagenCapturada"
                      class="captured-image"
                      alt="Foto de la mascota"
                    />
                    <div
                      v-if="!camaraActiva && !imagenCapturada"
                      class="photo-placeholder"
                    >
                      <q-icon name="pets" size="32px" color="grey-7" />
                      <div class="text-grey-7 text-caption q-mt-sm">
                        Click para foto
                      </div>
                    </div>
                  </div>
                  <!-- Controles de la cámara -->
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
                      ></q-btn>
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

              <!-- Campos principales de la mascota -->
              <div class="col-lg-10 col-md-9 col-sm-6 col-xs-12 q-pa-none">
                <div class="row q-col-gutter-sm">
                  <!-- Fila para campos identificativos -->
                  <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                    <q-input
                      v-model="mascota.nombre"
                      label="Nombre *"
                      :rules="[(val) => !!val || 'El nombre es requerido']"
                    />
                  </div>
                  <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                    <q-input
                      v-model="mascota.fechanacimiento"
                      label="Fecha de Nacimiento"
                      type="date"
                    />
                  </div>
                  <div class="col-lg-1 col-md-1 col-sm-12 col-xs-12">
                    <q-input v-model="mascota.edad" label="Edad" />
                  </div>
                  <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                    <q-select
                      v-model="mascota.id_sexo"
                      :options="opcionesSexo"
                      label="Sexo *"
                      :rules="[(val) => !!val || 'El sexo es requerido']"
                      emit-value
                      map-options
                    />
                  </div>
                </div>
                <!-- Fin de fila para campos identificativos -->
              </div>
              <!-- Fin de col-lg-10 para campos identificativos -->
            </div>
            <!-- Fin de row full-width para foto y campos identificativos -->

            <!-- Sección de Detalles de la Mascota -->
            <div class="row full-width q-col-gutter-md q-mt-md q-pa-none">
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section class="q-pa-sm">
                    <div class="text-subtitle1 text-teal">
                      Detalles Adicionales
                    </div>
                    <q-separator class="q-my-sm" color="grey-3" />
                    <div class="row q-col-gutter-sm">
                      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_especie"
                          :options="opcionesEspecie"
                          label="Especie *"
                          :rules="[(val) => !!val || 'La especie es requerida']"
                          emit-value
                          map-options
                        />
                      </div>
                      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_raza"
                          :options="opcionesRaza"
                          label="Raza"
                          emit-value
                          map-options
                        />
                      </div>

                      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_color"
                          :options="opcionesColor"
                          label="Color"
                          emit-value
                          map-options
                          class="full-width"
                        />
                      </div>
                      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_tamano"
                          :options="opcionesTamano"
                          label="Tamaño"
                          emit-value
                          map-options
                          class="full-width"
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                    <q-input
                      v-model="mascota.chip"
                      label="Número de Chip"
                      class="full-width"
                    />
                  </div>
                  <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                    <q-input
                      v-model="mascota.fechachip"
                      label="Fecha de Chip"
                      type="date"
                      class="full-width"
                    />
                  </div>

                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Sección de Observaciones -->
            <div class="row full-width q-col-gutter-md q-mt-md q-pa-none">
              <div class="col-12">
                <q-input
                  v-model="mascota.observacion"
                  type="textarea"
                  label="Observaciones"
                  rows="3"
                  class="full-width"
                />
              </div>
            </div>
          </div>
          <!-- Fin de row q-col-gutter-sm q-pa-none (contenedor principal del form) -->
        </q-form>
      </q-tab-panel>
    </q-tab-panels>

    <q-card-section class="q-pa-md">
        <OpcionCancelarGuardar
          @accionCerrar="close"
          @accionValidar="validarFormulario"
        />
      </q-card-section>

    </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineEmits, watch } from "vue";

const props = defineProps({
  propietarioId: {
    type: Number,
    required: true,
  },
  mascotaData: {
    type: Object,
    default: () => ({
      id: null,
      id_propietario: null,
      nombre: "",
      historiaclinica: "",
      edad: "",
      id_especie: null,
      id_raza: null,
      id_sexo: null,
      fechanacimiento: null,
      chip: "",
      fechachip: null,
      id_color: null,
      id_tamano: null,
      observacion: "",
    }),
  },
});

const emit = defineEmits(["update:mascota", "mascota-guardada"]);

const mostrarDialogo = ref(true);

const close = () => {
  mostrarDialogo.value = false;
};

// Tabs
const tabMascota = ref("general");

// Cámara
const video = ref(null);
const canvas = ref(null);
const camaraActiva = ref(false);
const imagenCapturada = ref(null);
const stream = ref(null);

// Datos de la mascota
const mascota = ref({
  ...props.mascotaData,
  id_propietario: props.propietarioId,
});

// Actualizar el ID del propietario cuando cambie
watch(
  () => props.propietarioId,
  (newValue) => {
    mascota.value.id_propietario = newValue;
  }
);

// Opciones para los selects
const opcionesEspecie = ref([
  { label: "Perro", value: 1 },
  { label: "Gato", value: 2 },
  { label: "Ave", value: 3 },
  { label: "Reptil", value: 4 },
  { label: "Otro", value: 5 },
]);

const opcionesRaza = ref([
  { label: "Labrador", value: 1 },
  { label: "Pastor Alemán", value: 2 },
  { label: "Siamés", value: 3 },
  { label: "Persa", value: 4 },
  { label: "Otra", value: 5 },
]);

const opcionesSexo = ref([
  { label: "Macho", value: 1 },
  { label: "Hembra", value: 2 },
]);

const opcionesColor = ref([
  { label: "Negro", value: 1 },
  { label: "Blanco", value: 2 },
  { label: "Marrón", value: 3 },
  { label: "Gris", value: 4 },
  { label: "Otro", value: 5 },
]);

const opcionesTamano = ref([
  { label: "Pequeño", value: 1 },
  { label: "Mediano", value: 2 },
  { label: "Grande", value: 3 },
]);

// Funciones para la cámara
const activarCamara = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    video.value.srcObject = stream.value;
    camaraActiva.value = true;
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
  }
};

const capturarFoto = () => {
  const context = canvas.value.getContext("2d");
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
  imagenCapturada.value = canvas.value.toDataURL("image/png");
  detenerCamara();
};

const detenerCamara = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
  camaraActiva.value = false;
};

const reiniciarCamara = () => {
  imagenCapturada.value = null;
  activarCamara();
};

// Validar formulario
const validarFormulario = async () => {
  const formMascota = document.querySelector("ref[formMascota]");
  if (formMascota && !(await formMascota.validate())) {
    return false;
  }
  return true;
};

// Exponer métodos y propiedades para el componente padre
defineExpose({
  mascota,
  validarFormulario,
});

// Actualizar la mascota cuando cambie
watch(
  mascota,
  (newValue) => {
    emit("update:mascota", newValue);
  },
  { deep: true }
);
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

.camera-preview,
.captured-image {
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

/* Ajustes responsive */
@media (max-width: 600px) {
  .photo-container {
    width: 120px;
    height: 120px;
  }
}
.dialog-card {
  width: 90vw;
  max-width: 1200px;
  min-width: 320px;
  border-radius: 10px;
  overflow: hidden;
}

.fixed-height-section {
  height: 650px;
  overflow: hidden;
}

.fixed-height-panel {
  height: 100%;
  overflow-y: auto;
}

/* Estilo para mantener consistente el tamaño de los paneles */
:deep(.q-tab-panel) {
  padding: 8px !important;
}

.q-pa-none {
  padding: 0 !important;
}

.row.q-col-gutter-md {
  margin: 0;
}

.row.q-col-gutter-sm {
  margin: 0;
}

/* Ajuste específico para la sección de la cámara */
.camera-section {
  margin-top: 0;
  padding-top: 0;
}

.q-item {
  padding-top: 0;
  padding-bottom: 8px;
}
</style>
