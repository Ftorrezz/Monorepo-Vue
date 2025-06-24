<template>
  <div>
    <q-dialog v-model="mostrarDialogo" persistent>
      <q-card class="modern-dialog">
        <!-- Encabezado moderno -->
        <q-bar class="bg-primary text-white modern-header">
          <div class="row items-center full-width">
            <div class="col-auto">
              <q-avatar size="28px" class="q-mr-sm">
                <q-icon name="pets" />
              </q-avatar>
            </div>
            <div class="col text-subtitle1">Registro de Mascota</div>
            <div class="col-auto">
              <q-btn flat round dense icon="close" @click="closeDialog">
                <q-tooltip>Cerrar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-bar>

        <!-- Contenido principal -->
        <q-card-section class="q-pa-md scrollable-form-content">
          <q-form ref="formMascotaRef">
            <div class="row q-col-gutter-md">
              <!-- Sección de foto e Información Principal -->
              <div class="col-12">
                <div class="row q-col-gutter-md">
                  <!-- Sección de la foto -->
                  <div class="col-lg-2 col-md-3 col-sm-6 col-xs-12">
                    <q-card flat bordered class="modern-photo-card">
                      <q-card-section class="column items-center">
                        <div
                          class="modern-photo-container"
                          @click="!camaraActiva && !imagenCapturada && activarCamara()"
                        >
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
                            <q-icon name="photo_camera" size="32px" color="grey-7" />
                            <div class="text-grey-7 text-caption q-mt-sm">
                              Click para foto
                            </div>
                          </div>
                        </div>
                        <div class="modern-camera-controls q-mt-sm">
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
                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- Información principal de la mascota -->
                  <div class="col-lg-10 col-md-9 col-sm-6 col-xs-12">
                    <q-card flat bordered class="modern-info-card">
                      <q-card-section>
                        <div class="text-subtitle1 text-primary q-mb-md">
                          Información Principal
                        </div>
                        <div class="row q-col-gutter-md">
                          <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <q-input
                              v-model="mascota.nombre"
                              label="Nombre *"
                              :rules="[(val) => !!val || 'El nombre es requerido']"
                              dense
                            />
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="mascota.fechanacimiento"
                              label="Fecha de Nacimiento"
                              type="date"
                              @update:model-value="calcularEdadMascota"
                              dense
                            />
                          </div>
                          <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                            <q-input v-model="mascota.edad" label="Edad" readonly dense />
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                            <q-select
                              v-model="mascota.id_sexo"
                              :options="opcionesSexo"
                              label="Sexo *"
                              :rules="[(val) => !!val || 'El sexo es requerido']"
                              emit-value
                              map-options
                              dense
                            />
                          </div>
                           <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <q-input
                              v-model="mascota.historiaclinica"
                              label="Historia Clínica"
                              dense
                            />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Detalles Adicionales -->
              <div class="col-12">
                <q-card flat bordered class="modern-details-card">
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <q-icon name="list_alt" color="primary" size="sm" class="q-mr-sm" />
                      <div class="text-subtitle1 text-primary">Detalles Adicionales</div>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_especie"
                          :options="opcionesEspecie"
                          label="Especie *"
                          :rules="[(val) => !!val || 'La especie es requerida']"
                          emit-value
                          map-options
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_raza"
                          :options="opcionesRaza"
                          label="Raza"
                          emit-value
                          map-options
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_color"
                          :options="opcionesColor"
                          label="Color"
                          emit-value
                          map-options
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_tamano"
                          :options="opcionesTamano"
                          label="Tamaño"
                          emit-value
                          map-options
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          v-model="mascota.chip"
                          label="Número de Chip"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          v-model="mascota.fechachip"
                          label="Fecha de Chip"
                          type="date"
                          dense
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Observaciones -->
              <div class="col-12">
                <q-card flat bordered class="modern-notes-card">
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <q-icon name="notes" color="primary" size="sm" class="q-mr-sm" />
                      <div class="text-subtitle1 text-primary">Observaciones</div>
                    </div>
                    <q-input
                      v-model="mascota.observacion"
                      type="textarea"
                      label="Observaciones"
                      rows="3"
                      dense
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <!-- Botones de acción -->
        <q-card-actions align="right" class="modern-actions q-pa-md">
          <OpcionCancelarGuardar
            @accionCerrar="closeDialog"
            @accionValidar="guardarMascota"
            :loading="isLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { QForm, useQuasar } from "quasar";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";
import PeticionService from "src/services/peticion.service";
import NdAlertasControl from "src/controles/alertas.control";

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
      activo: "S",
      id_sitio: 1, // Default site ID
      foto: null, // For captured image data
    }),
  },
});

const emit = defineEmits(["update:mascota", "mascota-guardada", "cerrar"]);

const $q = useQuasar();
const mostrarDialogo = ref(true);
const isLoading = ref(false);
const peticionService = new PeticionService();
const alertas = new NdAlertasControl();

const formMascotaRef = ref<QForm | null>(null);

const mascota = ref({
  ...props.mascotaData,
  id_propietario: props.propietarioId,
});

watch(
  () => props.propietarioId,
  (newValue) => {
    mascota.value.id_propietario = newValue;
  }
);

watch(
  mascota,
  (newValue) => {
    emit("update:mascota", newValue);
  },
  { deep: true }
);

const closeDialog = () => {
  mostrarDialogo.value = false;
  emit("cerrar");
};

// Cámara
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const camaraActiva = ref(false);
const imagenCapturada = ref<string | null>(props.mascotaData.foto || null);
const stream = ref<MediaStream | null>(null);

const activarCamara = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    if (video.value) {
      video.value.srcObject = stream.value;
      camaraActiva.value = true;
    } else {
      console.error("Elemento de video no encontrado.");
      detenerCamara();
    }
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    $q.notify({
      type: "negative",
      message: "No se pudo acceder a la cámara. Verifica los permisos.",
    });
  }
};

const capturarFoto = () => {
  if (canvas.value && video.value) {
    const context = canvas.value.getContext("2d");
    if (context) {
      context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
      imagenCapturada.value = canvas.value.toDataURL("image/png");
      mascota.value.foto = imagenCapturada.value; // Store base64 image data
      detenerCamara();
    }
  }
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
  mascota.value.foto = null;
  activarCamara();
};

onBeforeUnmount(() => {
  detenerCamara();
});

// Opciones para los selects (podrían venir de un servicio/store en una app real)
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
  { label: "Criollo", value: 5 },
  { label: "Otra", value: 6 },
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
  { label: "Atigrado", value: 5 },
  { label: "Otro", value: 6 },
]);

const opcionesTamano = ref([
  { label: "Pequeño", value: 1 },
  { label: "Mediano", value: 2 },
  { label: "Grande", value: 3 },
]);

const calcularEdadMascota = () => {
  if (mascota.value.fechanacimiento) {
    const fechaNac = new Date(mascota.value.fechanacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    mascota.value.edad = edad >= 0 ? edad.toString() : '0';
  } else {
    mascota.value.edad = '';
  }
};

const validarFormulario = async () => {
  if (formMascotaRef.value) {
    return await formMascotaRef.value.validate();
  }
  return false;
};

const guardarMascota = async () => {
  const esValido = await validarFormulario();
  if (!esValido) {
    alertas.mostrarMensaje(
      "error",
      "Guardar Mascota",
      "Por favor, completa los campos requeridos."
    );
    return;
  }

  isLoading.value = true;
  try {
    let resultadoOperacion;
    const datosMascotaPayload = { ...mascota.value };

    // Ensure id_propietario is set
    if (!datosMascotaPayload.id_propietario && props.propietarioId) {
        datosMascotaPayload.id_propietario = props.propietarioId;
    }

    // Remove id if it's null for creation
    if (datosMascotaPayload.id === null || datosMascotaPayload.id === undefined) {
      delete datosMascotaPayload.id;
    }

    if (datosMascotaPayload.id) {
      resultadoOperacion = await peticionService.actualizar('mascota', datosMascotaPayload);
    } else {
      resultadoOperacion = await peticionService.crear('mascota', datosMascotaPayload);
    }

    const mascotaGuardada = {
      ...datosMascotaPayload,
      id: resultadoOperacion?.id || resultadoOperacion?.elemento?.id || datosMascotaPayload.id,
      // If backend returns full object, spread it: ...resultadoOperacion.elemento
    };

    emit('mascota-guardada', mascotaGuardada);
    closeDialog();

  } catch (error) {
    console.error("Error en la operación de guardado de mascota:", error);
    // NdAlertasControl (via PeticionService) should handle backend error messages.
    // This is a fallback or for client-side issues not caught by PeticionService.
     alertas.mostrarMensaje(
      "error",
      "Guardar Mascota",
      error.message || "No fue posible guardar la mascota."
    );
  } finally {
    isLoading.value = false;
  }
};

defineExpose({
  mascota,
  validarFormulario,
  guardarMascota,
});

// Calculate age on mount if fechanacimiento is present
if (mascota.value.fechanacimiento) {
  calcularEdadMascota();
}

</script>

<style scoped>
.modern-dialog {
  display: flex;
  flex-direction: column;
  width: 90vw;
  max-width: 1000px; /* Adjusted max-width for pet form */
  min-width: 320px;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modern-header {
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.scrollable-form-content {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
}

.modern-photo-card,
.modern-info-card,
.modern-details-card, /* Added for pet details */
.modern-notes-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  margin-bottom: 16px; /* Add some space between cards */
}

.modern-photo-card:hover,
.modern-info-card:hover,
.modern-details-card:hover,
.modern-notes-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.modern-photo-container {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  border: 2px dashed var(--q-primary);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.modern-photo-container:hover {
  border-color: var(--q-secondary);
  background-color: rgba(0, 0, 0, 0.04);
}

.modern-camera-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.modern-camera-controls .q-btn {
  border-radius: 8px;
}

.camera-preview,
.captured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px; /* Match container */
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.modern-actions {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.q-field--dense .q-field__control) {
  border-radius: 8px;
}
:deep(.q-field--dense .q-field__label) {
  font-size: 14px;
}

/* Card content padding */
.modern-photo-card .q-card-section,
.modern-info-card .q-card-section,
.modern-details-card .q-card-section,
.modern-notes-card .q-card-section {
  padding: 16px;
}

@media (max-width: 600px) {
  .modern-photo-container {
    width: 120px;
    height: 120px;
  }
  .modern-dialog {
    width: 95vw;
    max-height: 85vh;
  }
  .modern-actions {
    padding: 8px !important;
    justify-content: center !important;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
