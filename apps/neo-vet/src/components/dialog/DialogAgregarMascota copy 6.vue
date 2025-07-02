<template>
  <div>
    <q-dialog v-model="mostrarDialogo" persistent>
    <q-card class="modern-dialog">
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
              <!-- Sección de foto y Información Personal -->
              <div class="col-12">
                <div class="row q-col-gutter-md">
                  <!-- Sección de la foto -->
                  <div class="col-lg-2 col-md-3 col-sm-6 col-xs-12">
                    <q-card flat bordered class="modern-photo-card">
                      <q-card-section class="column items-center">
                        <div
                          class="modern-photo-container"
                          @click="
                            !camaraActiva && !imagenCapturada && activarCamara()
                          "
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
                            alt="Foto del propietario"
                          />
                          <div
                            v-if="!camaraActiva && !imagenCapturada"
                            class="photo-placeholder"
                          >
                            <q-icon
                              name="photo_camera"
                              size="32px"
                              color="grey-7"
                            />
                            <div class="text-grey-7 text-caption q-mt-sm">
                              Click para foto
                            </div>
                          </div>
                        </div>
                        <!-- Modificar los controles de la cámara -->
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

                  <!-- Información personal -->
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
                              class="uppercase"
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
                            <ListaSexo
                              v-model="mascota.id_sexo"
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
                      <div class="col-lg-2 col-md-3 col-sm-12 col-xs-12">
                        <q-select
                          v-model="mascota.id_tamanio"
                          :options="OPCIONES_TAMANO_MASCOTA"
                          label="Tamaño"
                          emit-value
                          map-options
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
                      <div class="text-subtitle1 text-primary">Datos Adicionales</div>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaEspecie
                          v-model="mascota.id_especie"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <ListaRazaMascota
                              v-model="mascota.id_raza"
                              dense
                            />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaColor
                          v-model="mascota.id_color"
                          dense
                        />
                      </div>

                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaDieta
                          v-model="mascota.id_dieta"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaHabitat
                          v-model="mascota.id_habitat"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaCaracter
                        v-model="mascota.id_caracter"
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
                      <q-icon
                        name="notes"
                        color="primary"
                        size="sm"
                        class="q-mr-sm"
                      />
                      <div class="text-subtitle1 text-primary">
                        Observaciones
                      </div>
                    </div>
                    <q-input
                      v-model="mascota.observaciones"
                      type="textarea"
                      label="Observaciones"
                      rows="3"
                      class="full-width"
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
          />
        </q-card-actions>

    </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineEmits, watch } from "vue";
import { QForm, useQuasar } from "quasar";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";
import PeticionService from "src/services/peticion.service";
import NdAlertasControl from "src/controles/alertas.control";
import ListaRazaMascota from "../../../../../libs/shared/src/components/listas/ListaRazaMascota.vue";
import ListaSexo from "../../../../../libs/shared/src/components/listas/ListaSexo.vue";
import ListaHabitat from "../../../../../libs/shared/src/components/listas/ListaHabitat.vue";
import ListaColor from "../../../../../libs/shared/src/components/listas/ListaColor.vue";
import ListaDieta from "../../../../../libs/shared/src/components/listas/ListaDieta.vue";
import ListaEspecie from "../../../../../libs/shared/src/components/listas/ListaEspecie.vue";
import ListaCaracter from "../../../../../libs/shared/src/components/listas/ListaCaracter.vue";
import { OPCIONES_TAMANO_MASCOTA } from "../../../../../libs/shared/src/constant/mascota"
import { obtenerIDValue } from "../../../../../libs/shared/src/helper/FuncionesGenericas"

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
      id_tamanio: null,
      observaciones: "",
      activo: "S",
      id_sitio: 1,
      id_sucursal: 2,

    }),
  },
});

//TODO: SUCUERSAL FIJA

const emit = defineEmits(["update:mascota", "mascota-guardada", "cerrar"]);

const $q = useQuasar();
const mostrarDialogo = ref(true);
const isLoading = ref(false);
const peticionService = new PeticionService();
const alertas = new NdAlertasControl();

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

const formMascotaRef = ref<QForm | null>(null);

// Datos de la mascota
const mascota = ref({
  ...props.mascotaData,
  id_propietario: props.propietarioId,
});



// ... (otras refs y funciones)
// (deja aquí el resto del código igual)

// ---
const validar = async () => {
  if (formMascotaRef.value) {
    return await formMascotaRef.value.validate();
  }
  return false;
};

const guardarMascota = async () => {
  const esValido = await validar();
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

    datosMascotaPayload.id_sexo = obtenerIDValue(datosMascotaPayload.id_sexo);
    datosMascotaPayload.id_tamanio = obtenerIDValue(datosMascotaPayload.id_tamanio);
    datosMascotaPayload.id_especie = obtenerIDValue(datosMascotaPayload.id_especie);
    datosMascotaPayload.id_raza = obtenerIDValue(datosMascotaPayload.id_raza);
    datosMascotaPayload.id_color = obtenerIDValue(datosMascotaPayload.id_color);
    datosMascotaPayload.id_dieta = obtenerIDValue(datosMascotaPayload.id_dieta);
    datosMascotaPayload.id_habitat = obtenerIDValue(datosMascotaPayload.id_habitat);
    datosMascotaPayload.id_caracter = obtenerIDValue(datosMascotaPayload.id_caracter);


    if (datosMascotaPayload.id) {
      resultadoOperacion = await peticionService.actualizar('paciente', datosMascotaPayload);
    } else {
      resultadoOperacion = await peticionService.crear('paciente', datosMascotaPayload);
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

// Asegúrate que esto esté al final del bloque, después de declarar todas las funciones:
defineExpose({
  mascota,
  validar,
  guardarMascota,
});



// Calculate age on mount if fechanacimiento is present
if (mascota.value.fechanacimiento) {
  calcularEdadMascota();
}

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



/*defineExpose({
  mascota,
  validarFormulario,
  guardarMascota,
});*/

const closeDialog = () => {
  mostrarDialogo.value = false;
  emit("cerrar");
};

// Actualizar el ID del propietario cuando cambie
watch(
  () => props.propietarioId,
  (newValue) => {
    mascota.value.id_propietario = newValue;
  }
);


/*const opcionesTamano = ref([
  { label: "PEQUEÑO", value: 1 },
  { label: "MEDIANO", value: 2 },
  { label: "GRANDE", value: 3 },
]);*/

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
.modern-dialog {
  display: flex; /* Usar flexbox para controlar el layout interno */
  flex-direction: column; /* Apilar header, content, actions verticalmente */
  width: 90vw;
  max-width: 1200px;
  min-width: 320px;
  max-height: 90vh; /* Limitar la altura máxima del diálogo */
  border-radius: 12px;
  /* overflow: hidden; Quasar maneja esto, o si se necesita para border-radius.
                     El scroll interno se manejará en .scrollable-form-content */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modern-header { /* Para el q-bar */
  flex-shrink: 0; /* Evitar que el header se encoja */
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* Clase específica para la sección de contenido principal del formulario */
.scrollable-form-content {
  flex-grow: 1; /* Permitir que esta sección crezca para llenar el espacio disponible */
  overflow-y: auto; /* Habilitar scroll vertical si el contenido desborda */
  /* El padding (q-pa-md) se aplica directamente en el template */
  min-height: 0; /* Necesario en algunos casos para que flex-grow funcione correctamente con overflow */
}

.modern-photo-card,
.modern-info-card,
.modern-address-card,
.modern-notes-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #ffffff; /* Fondo blanco para las tarjetas */
  margin-bottom: 16px;
}

.modern-photo-card:hover,
.modern-info-card:hover,
.modern-address-card:hover,
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
  position: relative; /* Necesario para posicionar el placeholder */
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
  border-radius: 8px;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute; /* Posicionar sobre el contenedor */
  top: 0;
  left: 0;
}

.modern-actions {
  flex-shrink: 0; /* Evitar que las acciones se encojan */
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
}

:deep(.q-field--filled .q-field__control) {
  border-radius: 8px;
}

/* Ajustes responsive */
@media (max-width: 600px) {
  .modern-photo-container {
    width: 120px;
    height: 120px;
  }

  .modern-dialog {
    width: 95vw;
    max-height: 85vh; /* Reducir un poco la altura máxima en móviles */
  }

  .modern-actions {
    padding: 8px !important; /* Reduce el padding y asegura que se aplique sobre q-pa-md */
    /* Centra los botones y permite que se envuelvan */
    justify-content: center !important; /* !important para sobreescribir el 'align' de q-card-actions */
    flex-wrap: wrap;
    gap: 8px; /* Espacio entre botones, incluso si se envuelven */
  }
}

/* Animaciones suaves */
.q-dialog-plugin-enter-active,
.q-dialog-plugin-leave-active {
  transition: all 0.3s ease-in-out;
}

.q-dialog-plugin-enter-from,
.q-dialog-plugin-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Estilo para convertir el texto a mayúsculas dentro de q-input */
.uppercase :deep(.q-field__native) {
  text-transform: uppercase;
}
</style>
