<template>
  <div>
    <q-dialog v-model="mostrarDialogo" persistent>
      <q-card bordered elevated class="dialog-card">
        <q-bar class="bg-primary text-white">
          <q-icon name="person" />
          <div>Propietario</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <template #default>
              <q-tooltip>Cerrar</q-tooltip>
            </template>
          </q-btn>
        </q-bar>

        <q-card
          class="row q-col-gutter-md full-width"
        >
          <q-form ref="formPropietarioRef">
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
                    <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.primerapellido"
                        label="Primer Apellido"
                        :rules="[
                          (val) => !!val || 'El primer apellido es requerido',
                        ]"
                      />
                    </div>
                    <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.segundoapellido"
                        label="Segundo Apellido"
                      />
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.nombre"
                        label="Nombres"
                        :rules="[(val) => !!val || 'El nombre es requerido']"
                      />
                    </div>

                    <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                      <ListaGenero v-model="propietario.id_genero" />
                    </div>

                    <div class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.fechanacimiento"
                        label="Fecha de Nacimiento"
                        type="date"
                        @update:model-value="calcularEdad"
                        class="full-width"
                      />
                    </div>

                    <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.telefonocelular"
                        label="Teléfono móvil"
                        :rules="[
                          (val) => !!val || 'El teléfono móvil es requerido',
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="phone_android" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-lg-3 col-md- col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.telefonoadicional"
                        label="Teléfono adicional"
                      >
                        <template v-slot:prepend>
                          <q-icon name="phone" />
                        </template>
                      </q-input>
                    </div>
                    <!-- Correo y teléfono alineados -->
                    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.correo"
                        label="Correo electrónico"
                        type="email"
                        :rules="[
                          (val) =>
                            !!val || 'El correo electrónico es requerido',
                          (val) =>
                            isValidEmail(val) || 'Formato de correo inválido',
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="mail" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card de Domicilio alineado a la izquierda -->
              <div class="row full-width q-col-gutter-md q-mt-md q-pa-none">
                <div class="col-12">
                  <q-card flat bordered class="domicilio-card">
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle1 text-teal">Domicilio</div>
                      <q-separator class="q-my-sm" color="grey-3" />

                      <div class="row q-col-gutter-sm items-end">
                        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                          <q-input
                            v-model="propietario.calle"
                            label="Calle"
                            dense
                          />
                        </div>
                        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                          <q-input
                            v-model="propietario.numero_exterior"
                            label="Número Exterior"
                            dense
                          />
                        </div>
                        <div class="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                          <q-input
                            v-model="propietario.numero_interior"
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
                          <ListaPais v-model="propietario.id_pais" />
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                          <ListaEstado
                            v-model="propietario.id_estado"
                            :id-pais="propietario.id_pais"
                            :rules="[
                              (val) => !!val || 'El estado es requerido',
                            ]"
                          />
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                          <ListaMunicipio
                            v-model="propietario.id_municipio"
                            :id-estado="propietario.id_estado"
                            :rules="[
                              (val) => !!val || 'El municipio es requerido',
                            ]"
                          />
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                          <ListaColonia
                            v-model="propietario.id_colonia"
                            :id-municipio="propietario.id_municipio"
                            :rules="[
                              (val) => !!val || 'La colonia es requerida',
                            ]"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div class="row full-width q-col-gutter-md q-mt-md q-pa-none">
                <div class="col-12">
                  <q-input
                    v-model="propietario.observacion"
                    type="textarea"
                    label="Observaciones"
                    rows="3"
                    class="full-width"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card>

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

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch, onMounted } from "vue";
import { QForm } from "quasar";
import ListaGenero from "../../../../../libs/shared/src/components/listas/ListaGenero.vue";
// Importar los nuevos componentes de lista de ubicación
import ListaPais from "../../../../../libs/shared/src/components/listas/ListaPais.vue";
import ListaEstado from "../../../../../libs/shared/src/components/listas/ListaEstado.vue";
import ListaMunicipio from "../../../../../libs/shared/src/components/listas/ListaMunicipio.vue";
import ListaColonia from "../../../../../libs/shared/src/components/listas/ListaColonia.vue";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";

const props = defineProps({
  propietarioData: {
    type: Object,
    default: () => ({
      id: null,
      primerapellido: "",
      segundoapellido: "",
      nombre: "",
      correo: "",
      telefonocelular: "",
      telefonoadicional: "",
      id_genero: null,
      id_estadocivil: null,
      id_escolaridad: null,
      fechanacimiento: null,
      observacion: "",
      // Campos para el domicilio
      id_pais: null,
      id_estado: null,
      id_municipio: null,
      id_colonia: null,
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      codigopostal: "",
      // Campos para facturación
      rfc: "",
      razon_social: "",
      regimen_fiscal: null,
      uso_cfdi: null,
      cp_fiscal: "",
      correo_facturacion: "",
    }),
  },
});

const mostrarDialogo = ref(true);

const close = () => {
  mostrarDialogo.value = false;
};

const emit = defineEmits(["update:propietario", "propietario-guardado"]);

// Tabs
const tabPropietario = ref("general");

// Cámara
const video = ref(null);
const canvas = ref(null);
const camaraActiva = ref(false);
const imagenCapturada = ref(null);
const stream = ref(null);

// Referencia al formulario
const formPropietarioRef = ref<QForm | null>(null);

// Datos del propietario
const propietario = ref({ ...props.propietarioData });

// Opciones para los selects
const opcionesGenero = ref([
  { label: "Masculino", value: 1 },
  { label: "Femenino", value: 2 },
  { label: "Otro", value: 3 },
]);

const opcionesEstadoCivil = ref([
  { label: "Soltero/a", value: 1 },
  { label: "Casado/a", value: 2 },
  { label: "Divorciado/a", value: 3 },
  { label: "Viudo/a", value: 4 },
]);

const opcionesEscolaridad = ref([
  { label: "Primaria", value: 1 },
  { label: "Secundaria", value: 2 },
  { label: "Preparatoria", value: 3 },
  { label: "Universidad", value: 4 },
  { label: "Posgrado", value: 5 },
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

/* Estilo para el card de domicilio con altura aumentada */
.domicilio-card {
  min-height: calc(130px + 1cm); /* Altura base + medio centímetro adicional */
}

/* Ajuste del padding interno para distribuir mejor el espacio */
.domicilio-card .q-card-section {
  padding-top: 12px;
  padding-bottom: 52px;
}

/* Estilo para el card de facturación */
.facturacion-card {
  min-height: 250px;
}

.facturacion-card .q-card-section {
  padding-top: 12px;
  padding-bottom: 12px;
}
</style>
