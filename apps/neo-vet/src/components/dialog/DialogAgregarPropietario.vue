<template>
  <div>
    <q-dialog v-model="mostrarDialogo" persistent>
      <q-card class="modern-dialog">
        <!-- Encabezado moderno -->
        <q-bar class="bg-primary text-white modern-header">
          <div class="row items-center full-width">
            <div class="col-auto">
              <q-avatar size="28px" class="q-mr-sm">
                <q-icon name="person_add" />
              </q-avatar>
            </div>
            <div class="col text-subtitle1">Registro de Propietario</div>
            <div class="col-auto">
              <q-btn flat round dense icon="close" v-close-popup>
                <q-tooltip>Cerrar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-bar>

        <!-- Contenido principal -->
        <q-card-section class="q-pa-md scrollable-form-content">
          <q-form ref="formPropietarioRef">
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
                          Información Personal
                        </div>
                        <div class="row q-col-gutter-md">
                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="propietario.primerapellido"
                              label="Primer Apellido"
                              :rules="[
                                (val) =>
                                  !!val || 'El primer apellido es requerido',
                              ]"
                              dense
                            />
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="propietario.segundoapellido"
                              label="Segundo Apellido"
                              dense
                            />
                          </div>
                          <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <q-input
                              v-model="propietario.nombre"
                              label="Nombres"
                              :rules="[
                                (val) => !!val || 'El nombre es requerido',
                              ]"
                              dense
                            />
                          </div>

                          <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                            <ListaGenero
                              v-model="propietario.id_genero"
                              dense
                            />
                          </div>

                          <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                            <q-input
                              v-model="propietario.fechanacimiento"
                              label="Fecha de Nacimiento"
                              type="date"
                              @update:model-value="calcularEdad"
                              class="full-width"
                              dense
                            />

                            <!--<q-input
                              v-model="propietario.fechanacimiento"
                              mask="date"
                              :rules="['date']"
                            >
                              <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                  >
                                    <q-date v-model="propietario.fechanacimiento">
                                      <div class="row items-center justify-end">
                                        <q-btn
                                          v-close-popup
                                          label="Close"
                                          color="primary"
                                          flat
                                        />
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>-->
                          </div>

                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="propietario.telefono1"
                              label="Teléfono móvil"
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
                          <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                            <q-input
                              v-model="propietario.telefono2"
                              label="Teléfono adicional"
                              dense
                            >
                              <template v-slot:prepend>
                                <q-icon name="phone" />
                              </template>
                            </q-input>
                          </div>
                          <!-- Correo y teléfono alineados -->
                          <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <q-input
                              v-model="propietario.email"
                              label="Correo electrónico"
                              type="email"
                              :rules="[
                                (val) =>
                                  !!val || 'El correo electrónico es requerido',
                                (val) =>
                                  isValidEmail(val) ||
                                  'Formato de correo inválido',
                              ]"
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
                          v-model="propietario.calle"
                          label="Calle"
                          dense
                        />
                      </div>
                      <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                        <q-input
                          v-model="propietario.exterior"
                          label="Número Exterior"
                          dense
                        />
                      </div>
                      <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                        <q-input
                          v-model="propietario.interior"
                          label="Número Interior"
                          dense
                        />
                      </div>
                      <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          v-model="propietario.codigopostal"
                          label="C.P."
                          dense
                        />
                      </div>

                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaPais v-model="propietario.id_pais" dense />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaEstado
                          v-model="propietario.id_estado"
                          :id-pais="propietario.id_pais"
                          :rules="[(val) => !!val || 'El estado es requerido']"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaMunicipio
                          v-model="propietario.id_municipio"
                          :id-estado="propietario.id_estado"
                          :rules="[
                            (val) => !!val || 'El municipio es requerido',
                          ]"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaColonia
                          v-model="propietario.id_colonia"
                          :id-municipio="propietario.id_municipio"
                          :rules="[(val) => !!val || 'La colonia es requerida']"
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
                      v-model="propietario.observaciones"
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
            @accionValidar="guardarPropietario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from "vue";
import { QForm, useQuasar } from "quasar";
import ListaGenero from "../../../../../libs/shared/src/components/listas/ListaGenero.vue";
// Importar los nuevos componentes de lista de ubicación
import ListaPais from "../../../../../libs/shared/src/components/listas/ListaPais.vue";
import ListaEstado from "../../../../../libs/shared/src/components/listas/ListaEstado.vue";
import ListaMunicipio from "../../../../../libs/shared/src/components/listas/ListaMunicipio.vue";
import ListaColonia from "../../../../../libs/shared/src/components/listas/ListaColonia.vue";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";
import PeticionService from "src/services/peticion.service"; // Importar el servicio real
import NdAlertasControl from "src/controles/alertas.control";


let alertas = new NdAlertasControl();

const props = defineProps({
  propietarioData: {
    type: Object,
    default: () => ({
      id: null,
      primerapellido: "",
      segundoapellido: "",
      nombre: "",
      email: "",
      telefono1: "",
      telefono2: "",
      id_genero: null,
      id_estadocivil: null,
      id_escolaridad: null,
      fechanacimiento: null,
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

const mostrarDialogo = ref(true);

const close = () => {
  mostrarDialogo.value = false;
};

const emit = defineEmits(["update:propietario", "propietario-guardado"]);

// Cámara
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref(null);
const camaraActiva = ref(false);
const imagenCapturada = ref(null);
const stream = ref(null);

// Referencia al formulario
const formPropietarioRef = ref<QForm | null>(null);

// Datos del propietario
const propietario = ref({ ...props.propietarioData });

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

// Calcular edad
const calcularEdad = () => {
  if (propietario.value.fechanacimiento) {
    // Lógica para calcular la edad
  }
};

// Validar formulario
const validarFormulario = async () => {
  if (formPropietarioRef.value) {
    return await formPropietarioRef.value.validate();
  }
  return false;
};

// Guardar propietario
const guardarPropietario = async () => {
  const esValido = await validarFormulario();
  if (!esValido) {
    alertas.mostrarMensaje(
        "error",
        "Propietario",
        "Por favor, completa los campos requeridos."
      );


    return;
  }

  isLoading.value = true;
  try {
    let resultadoOperacion;
    // Crear una copia mutable para la transformación
    const datosPropietarioPayload = { ...propietario.value };

    // Helper para extraer el '.value' si el campo es un objeto proveniente de los componentes de lista
    const extractIdValue = (fieldValue: any) => {
      if (fieldValue && typeof fieldValue === 'object' && fieldValue !== null && fieldValue.hasOwnProperty('value')) {
        return fieldValue.value;
      }
      return fieldValue;
    };

    // Transformar los campos de ID que podrían ser objetos
    datosPropietarioPayload.id_genero = extractIdValue(datosPropietarioPayload.id_genero);
    datosPropietarioPayload.id_pais = extractIdValue(datosPropietarioPayload.id_pais);
    datosPropietarioPayload.id_estado = extractIdValue(datosPropietarioPayload.id_estado);
    datosPropietarioPayload.id_municipio = extractIdValue(datosPropietarioPayload.id_municipio);
    datosPropietarioPayload.id_colonia = extractIdValue(datosPropietarioPayload.id_colonia);
    // Considera también id_estadocivil y id_escolaridad si usas componentes similares para ellos

    if (datosPropietarioPayload.id) {
      // Actualizar propietario existente
      // PeticionService.actualizar toma (endpoint, modelo). El ID del modelo se usa internamente.
      resultadoOperacion = await peticionService.actualizar('propietario', datosPropietarioPayload);
    } else {
      // Crear nuevo propietario
      // El backend debería asignar el ID, así que lo eliminamos si es null/undefined
      if (datosPropietarioPayload.id === null || datosPropietarioPayload.id === undefined) {
        delete datosPropietarioPayload.id;
      }
      resultadoOperacion = await peticionService.crear('propietario', datosPropietarioPayload);
    }

    // Si la promesa se resolvió (no entró al catch), resultadoOperacion es la respuesta exitosa (respuesta.elemento).
    // PeticionService (a través de NdPeticionControl y NdAlertasControl) ya habrá mostrado
    // las notificaciones de éxito/error provenientes del backend.
    // El `catch` de abajo manejará los errores de la API que PeticionService propaga.
    
    console.log('Resultado de la operación:', resultadoOperacion);
    
    // Emitir los datos del propietario guardado (con el ID asignado por el backend)
    const propietarioGuardado = {
      ...datosPropietarioPayload,
      id: resultadoOperacion?.id || resultadoOperacion?.elemento?.id || datosPropietarioPayload.id
    };
    
    console.log('Propietario guardado a emitir:', propietarioGuardado);
    emit('propietario-guardado', propietarioGuardado);
    close();

    // Opcional: Notificación de éxito adicional si las de PeticionService no son suficientes
    // o si se desea un mensaje específico del componente que no viene del backend.
    // Por ejemplo:
    // alertas.mostrarMensaje("verificacion", "Propietario", datosPropietarioPayload.id ? "Actualizado correctamente." : "Registrado correctamente.");

  } catch (error: any) {
    // PeticionService.procesarRespuestaError (llamado internamente) ya muestra la notificación de error de la API.
    // Este catch es para errores de programación no previstos o para registrar el error que PeticionService propaga.
    console.error("Error en la operación de guardado (DialogAgregarPropietario):", error);
  } finally {
    isLoading.value = false;
  }
};

// Watchers para la lógica de cascada de ubicaciones
watch(
  () => propietario.value.id_pais,
  (newPaisId, oldPaisId) => {
    if (newPaisId !== oldPaisId) {
      propietario.value.id_estado = null;
      propietario.value.id_municipio = null;
      propietario.value.id_colonia = null;
      // La lógica de carga de estados se maneja dentro de ListaEstado.vue
    }
  }
);

watch(
  () => propietario.value.id_estado,
  (newEstadoId, oldEstadoId) => {
    if (newEstadoId !== oldEstadoId) {
      propietario.value.id_municipio = null;
      propietario.value.id_colonia = null;
      // La lógica de carga de municipios se maneja dentro de ListaMunicipio.vue
    }
  }
);

watch(
  () => propietario.value.id_municipio,
  (newMunicipioId, oldMunicipioId) => {
    if (newMunicipioId !== oldMunicipioId) {
      propietario.value.id_colonia = null;
      // La lógica de carga de colonias se maneja dentro de ListaColonia.vue
    }
  }
);

onBeforeUnmount(() => {
  detenerCamara(); // Asegurarse de detener la cámara al desmontar
});

// Exponer métodos y propiedades para el componente padre
defineExpose({
  propietario,
  validarFormulario,
  guardarPropietario, // Exponer también la función de guardar si es necesario
});

// Actualizar el propietario cuando cambie
watch(
  propietario,
  (newValue) => {
    emit("update:propietario", newValue);
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
  transform: scale(0.95);
}

/* Eliminar estilos antiguos que pueden causar conflictos */
.dialog-card,
.camera-section,
.photo-container,
.camera-controls,
.fixed-height-section,
.fixed-height-panel,
.q-pa-none,
.row.q-col-gutter-md,
.row.q-col-gutter-sm,
.domicilio-card,
.facturacion-card {
  /* Estos estilos se han reemplazado por las nuevas clases .modern-* */
  /* Puedes eliminarlos si no se usan en otras partes del componente */
}

/* Asegurar que el padding de q-card-section dentro de las tarjetas modernas sea consistente */
.modern-photo-card .q-card-section,
.modern-info-card .q-card-section,
.modern-address-card .q-card-section,
.modern-notes-card .q-card-section {
  padding: 16px; /* Ajusta el padding según necesites */
}

/* Ajuste para los inputs densos dentro de las tarjetas */
.modern-info-card .q-field--dense,
.modern-address-card .q-field--dense,
.modern-notes-card .q-field--dense {
  padding-bottom: 0px; /* Ajusta el padding inferior si usas dense */
}
</style>
