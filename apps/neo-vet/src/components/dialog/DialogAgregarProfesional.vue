<template>
  <div>
    <q-dialog v-model="mostrarDialogo" persistent @hide="emit('cerrar')">
      <q-card class="modern-dialog">
        <!-- Encabezado moderno -->
        <q-bar class="bg-primary text-white modern-header">
          <div class="row items-center full-width">
            <div class="col-auto">
              <q-avatar size="28px" class="q-mr-sm">
                <q-icon name="person_add" />
              </q-avatar>
            </div>
            <div class="col text-subtitle1">Registro de Profesional</div>
            <div class="col-auto">
              <q-btn flat round dense icon="close" v-close-popup>
                <q-tooltip>Cerrar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-bar>

        <!-- Contenido principal -->
        <q-card-section class="q-pa-md scrollable-form-content">
          <q-form ref="formProfesionalRef">
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
                            alt="Foto del profesional"
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
                          Información Personal
                        </div>
                        <div class="row q-col-gutter-md">
                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="profesional.primerapellido"
                              label="Primer Apellido *"
                              :rules="[
                                (val) =>
                                  !!val || 'El primer apellido es requerido',
                              ]"
                              dense
                              class="uppercase"
                            />
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="profesional.segundoapellido"
                              label="Segundo Apellido"
                              dense
                              class="uppercase"
                            />
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="profesional.nombre"
                              label="Nombres *"
                              :rules="[
                                (val) => !!val || 'El nombre es requerido',
                              ]"
                              dense
                              class="uppercase"
                            />
                          </div>
                           <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="profesional.cedula"
                              label="Cédula *"
                              :rules="[
                                (val) => !!val || 'La cédula es requerida',
                              ]"
                              dense
                            />
                          </div>

                          <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <ListaTipoProfesional
                              v-model="profesional.id_tipoprofesional"
                              :rules="[(val) => !!val || 'El tipo de profesional es requerido']"
                              dense
                            />
                          </div>

                          <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <q-input
                              v-model="profesional.telefono1"
                              label="Teléfono móvil *"
                              :rules="[
                                (val) =>
                                  !!val || 'El teléfono móvil es requerido',
                              ]"
                              dense
                            >
                              <template v-slot:prepend>
                                <q-icon name="phone_android" />
                              </template>
                            </q-input>
                          </div>
                        
                          <!-- Correo y teléfono alineados -->
                          <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <q-input
                              v-model="profesional.email"
                              label="Correo electrónico"
                              type="email"
                              dense
                            >
                              <template v-slot:prepend>
                                <q-icon name="mail" />
                              </template>
                            </q-input>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Domicilio con diseño mejorado -->
              <div class="col-12">
                <q-card flat bordered class="modern-address-card">
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <q-icon
                        name="location_on"
                        color="primary"
                        size="sm"
                        class="q-mr-sm"
                      />
                      <div class="text-subtitle1 text-primary">Domicilio</div>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <q-input
                          v-model="profesional.calle"
                          label="Calle"
                          dense

                        />
                      </div>
                      <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                        <q-input
                          v-model="profesional.exterior"
                          label="Número Exterior"
                          dense
                        />
                      </div>
                      <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                        <q-input
                          v-model="profesional.interior"
                          label="Número Interior"
                          dense
                        />
                      </div>
                      <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          v-model="profesional.codigopostal"
                          label="C.P."
                          dense
                        />
                      </div>

                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaPais v-model="profesional.id_pais" dense />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaEstado
                          v-model="profesional.id_estado"
                          :id-pais="profesional.id_pais"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaMunicipio
                          v-model="profesional.id_municipio"
                          :id-estado="profesional.id_estado"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaColonia
                          v-model="profesional.id_colonia"
                          :id-municipio="profesional.id_municipio"
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
                      v-model="profesional.observaciones"
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
            @accionCerrar="close"
            @accionValidar="guardarProfesional"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from "vue";
import { QForm, useQuasar } from "quasar";
import ListaTipoProfesional from "../../../../../libs/shared/src/components/listas/ListaTipoProfesional.vue";
import ListaPais from "../../../../../libs/shared/src/components/listas/ListaPais.vue";
import ListaEstado from "../../../../../libs/shared/src/components/listas/ListaEstado.vue";
import ListaMunicipio from "../../../../../libs/shared/src/components/listas/ListaMunicipio.vue";
import ListaColonia from "../../../../../libs/shared/src/components/listas/ListaColonia.vue";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";
import PeticionService from "src/services/peticion.service";
import NdAlertasControl from "src/controles/alertas.control";
import { obtenerIDValue } from "../../../../../libs/shared/src/helper/FuncionesGenericas";


let alertas = new NdAlertasControl();

const props = defineProps({
  profesionalData: {
    type: Object,
    default: () => ({
      id: null,
      primerapellido: "",
      segundoapellido: "",
      nombre: "",
      email: "",
      telefono1: "",
      telefono2: "",
      cedula: "",
      id_tipoprofesional: null,
      observaciones: "",
      // Campos para el domicilio
      id_pais: null,
      id_estado: null,
      id_municipio: null,
      id_colonia: null,
      calle: "",
      exterior: "",
      interior: "",
      codigopostal: "",
      activo: "S",
      id_sitio: 1
    }),
  },
});
//TODO: ID_SITIO FIJO

const mostrarDialogo = ref(true);

const close = () => {
  mostrarDialogo.value = false;
};

const emit = defineEmits(["update:profesional", "profesional-guardado", "cerrar"]);

// Cámara
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref(null);
const camaraActiva = ref(false);
const imagenCapturada = ref(null);
const stream = ref(null);

// Referencia al formulario
const formProfesionalRef = ref<QForm | null>(null);

// Datos del profesional
const profesional = ref({ ...props.profesionalData });

const $q = useQuasar();
const isLoading = ref(false);

// Instanciar el servicio real
const peticionService = new PeticionService();

// Funciones para la cámara
const activarCamara = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    if (video.value) {
      video.value.srcObject = stream.value;
      camaraActiva.value = true;
    } else {
      console.error("Elemento de video no encontrado.");
      detenerCamara(); // Limpiar si algo salió mal
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

// Validación de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar formulario
const validarFormulario = async () => {
  if (formProfesionalRef.value) {
    return await formProfesionalRef.value.validate();
  }
  return false;
};

// Guardar profesional
const guardarProfesional = async () => {
  const esValido = await validarFormulario();
  if (!esValido) {
    alertas.mostrarMensaje(
        "error",
        "Profesional",
        "Por favor, completa los campos requeridos."
      );
    return;
  }

  isLoading.value = true;
  try {
    let resultadoOperacion;
    // Crear una copia mutable para la transformación
    const datosProfesionalPayload = { ...profesional.value };

    // Transformar los campos de ID que podrían ser objetos
    datosProfesionalPayload.id_tipoprofesional = obtenerIDValue(datosProfesionalPayload.id_tipoprofesional);
    datosProfesionalPayload.id_pais = obtenerIDValue(datosProfesionalPayload.id_pais);
    datosProfesionalPayload.id_estado = obtenerIDValue(datosProfesionalPayload.id_estado);
    datosProfesionalPayload.id_municipio = obtenerIDValue(datosProfesionalPayload.id_municipio);
    datosProfesionalPayload.id_colonia = obtenerIDValue(datosProfesionalPayload.id_colonia);

    if (datosProfesionalPayload.id) {
      // Actualizar profesional existente
      resultadoOperacion = await peticionService.actualizar('profesional', datosProfesionalPayload);
    } else {
      // Crear nuevo profesional
      if (datosProfesionalPayload.id === null || datosProfesionalPayload.id === undefined) {
        delete datosProfesionalPayload.id;
      }
      resultadoOperacion = await peticionService.crear('profesional', datosProfesionalPayload);
    }

    console.log('Resultado de la operación:', resultadoOperacion);

    // Emitir los datos del profesional guardado
    const profesionalGuardado = {
      ...datosProfesionalPayload,
      id: resultadoOperacion?.id || resultadoOperacion?.elemento?.id || datosProfesionalPayload.id
    };

    console.log('Profesional guardado a emitir:', profesionalGuardado);
    emit('profesional-guardado', profesionalGuardado);
    close();

  } catch (error: any) {
    console.error("Error en la operación de guardado (DialogAgregarProfesional):", error);
  } finally {
    isLoading.value = false;
  }
};

// Watchers para la lógica de cascada de ubicaciones
watch(
  () => profesional.value.id_pais,
  (newPaisId, oldPaisId) => {
    if (newPaisId !== oldPaisId) {
      profesional.value.id_estado = null;
      profesional.value.id_municipio = null;
      profesional.value.id_colonia = null;
    }
  }
);

watch(
  () => profesional.value.id_estado,
  (newEstadoId, oldEstadoId) => {
    if (newEstadoId !== oldEstadoId) {
      profesional.value.id_municipio = null;
      profesional.value.id_colonia = null;
    }
  }
);

watch(
  () => profesional.value.id_municipio,
  (newMunicipioId, oldMunicipioId) => {
    if (newMunicipioId !== oldMunicipioId) {
      profesional.value.id_colonia = null;
    }
  }
);

onBeforeUnmount(() => {
  detenerCamara(); // Asegurarse de detener la cámara al desmontar
});

// Exponer métodos y propiedades para el componente padre
defineExpose({
  profesional,
  validarFormulario,
  guardarProfesional,
});

// Actualizar el profesional cuando cambie
watch(
  profesional,
  (newValue) => {
    emit("update:profesional", newValue);
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

.modern-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modern-photo-card,
.modern-info-card,
.modern-address-card,
.modern-notes-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #ffffff; /* Fondo blanco para las tarjetas */
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

/* Estilos para inputs y selects */
:deep(.q-field) {
  border-radius: 8px;
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
}
</style>
