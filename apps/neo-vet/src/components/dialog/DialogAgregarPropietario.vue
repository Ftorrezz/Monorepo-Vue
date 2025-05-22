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
      <q-tab name="general" label="Principal" />
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
                      <q-icon name="photo_camera" size="32px" color="grey-7" />
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
                    <q-select
                      v-model="propietario.id_genero"
                      :options="opcionesGenero"
                      label="Género"
                      emit-value
                      map-options
                      class="full-width"
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

                  <div class="col-lg-3 col-md- col-sm-12 col-xs-12">
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
                        (val) => !!val || 'El correo electrónico es requerido',
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

                <!-- Card de Domicilio -->
                <!--<div class="col-12 q-mt-md">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle1 text-teal">Domicilio</div>
                      <q-separator class="q-my-sm" color="grey-3" />

                      <div class="row q-col-gutter-sm">
                        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
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
                        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                          <q-input
                            v-model="propietario.colonia"
                            label="Colonia"
                            dense
                          />
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                          <q-input
                            v-model="propietario.delegacion"
                            label="Delegación/Municipio"
                            dense
                          />
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                          <q-input
                            v-model="propietario.estado"
                            label="Estado"
                            dense
                          />
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                          <q-input
                            v-model="propietario.pais"
                            label="País"
                            dense
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>-->
              </div>
            </div>

            <!-- Card de Domicilio alineado a la izquierda -->
            <div class="row full-width q-col-gutter-md q-mt-md q-pa-none">
              <div class="col-12">
                <q-card flat bordered class="domicilio-card">
                  <q-card-section class="q-pa-sm">
                    <div class="text-subtitle1 text-teal">Domicilio</div>
                    <q-separator class="q-my-sm" color="grey-3" />

                    <div class="row q-col-gutter-sm">
                      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <q-input
                          v-model="propietario.calle"
                          label="Calle"
                          dense
                        />
                      </div>
                      <div class="col-lg-1 col-md-1 col-sm-6 col-xs-12">
                        <q-input
                          v-model="propietario.numero_exterior"
                          label="# Exterior"
                          dense
                        />
                      </div>
                      <div class="col-lg-1 col-md-1 col-sm-6 col-xs-12">
                        <q-input
                          v-model="propietario.numero_interior"
                          label="# Interior"
                          dense
                        />
                      </div>
                      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          v-model="propietario.colonia"
                          label="Colonia"
                          dense
                        />
                      </div>
                      <div class="col-lg-1 col-md-1 col-sm-12 col-xs-12">
                        <q-input
                          v-model="propietario.codigopostal"
                          label="C.P."
                          dense
                        />
                      </div>
                      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <q-input
                          v-model="propietario.delegacion"
                          label="Delegación/Municipio"
                          dense
                        />
                      </div>
                      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <q-input
                          v-model="propietario.estado"
                          label="Estado"
                          dense
                        />
                      </div>
                      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <q-input
                          v-model="propietario.pais"
                          label="País"
                          dense
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="adicional">
        <q-form ref="formAdicional">
          <div class="row q-col-gutter-md">


            <div class="col-12">
              <q-input
                v-model="propietario.observacion"
                type="textarea"
                label="Observaciones"
                rows="7"
                class="full-width"
              />
            </div>
          </div>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="facturacion">
        <q-form ref="formFacturacion">
          <div class="row q-col-gutter-md q-pa-none">
            <div class="col-12">
              <q-card flat bordered class="facturacion-card">
                <q-card-section class="q-pa-sm">
                  <div class="text-subtitle1 text-teal">Datos de Facturación</div>
                  <q-separator class="q-my-sm" color="grey-3" />

                  <div class="row q-col-gutter-sm">
                    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.rfc"
                        label="RFC"
                        hint="Registro Federal de Contribuyentes"
                        :rules="[
                          val => !!val || 'El RFC es requerido',
                          val => val.length >= 12 || 'El RFC debe tener al menos 12 caracteres'
                        ]"
                        dense
                      />
                    </div>
                    <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.razon_social"
                        label="Razón Social"
                        hint="Nombre o razón social registrada ante el SAT"
                        :rules="[val => !!val || 'La razón social es requerida']"
                        dense
                      />
                    </div>

                    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <q-select
                        v-model="propietario.regimen_fiscal"
                        :options="opcionesRegimenFiscal"
                        label="Régimen Fiscal"
                        hint="Régimen fiscal registrado ante el SAT"
                        emit-value
                        map-options
                        :rules="[val => !!val || 'El régimen fiscal es requerido']"
                        dense
                      />
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <q-select
                        v-model="propietario.uso_cfdi"
                        :options="opcionesUsoCFDI"
                        label="Uso de CFDI"
                        hint="Uso que le dará al comprobante fiscal"
                        emit-value
                        map-options
                        :rules="[val => !!val || 'El uso de CFDI es requerido']"
                        dense
                      />
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.cp_fiscal"
                        label="Código Postal Fiscal"
                        hint="Código postal del domicilio fiscal"
                        :rules="[
                          val => !!val || 'El código postal es requerido',
                          val => val.length === 5 || 'El código postal debe tener 5 dígitos'
                        ]"
                        dense
                      />
                    </div>

                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <q-input
                        v-model="propietario.correo_facturacion"
                        label="Correo para Facturación"
                        hint="Correo electrónico donde recibirá sus facturas"
                        type="email"
                        :rules="[
                          val => !!val || 'El correo para facturación es requerido',
                          val => isValidEmail(val) || 'Formato de correo inválido'
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
        </q-form>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from "vue";
import  ListaGenero from "../../../../../libs/shared/src/components/listas/ListaGenero.vue";

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
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      delegacion: "",
      estado: "",
      pais: "México",
      // Campos para facturación
      rfc: "",
      razon_social: "",
      regimen_fiscal: null,
      uso_cfdi: null,
      cp_fiscal: "",
      correo_facturacion: ""
    }),
  },
});

const emit = defineEmits(["update:propietario", "propietario-guardado"]);

// Tabs
const tabPropietario = ref("general");

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
  const formPropietario = document.querySelector("ref[formPropietario]");
  if (formPropietario && !(await formPropietario.validate())) {
    return false;
  }
  return true;
};

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

// Opciones para los selects de facturación
const opcionesRegimenFiscal = ref([
  { label: "601 - General de Ley Personas Morales", value: "601" },
  { label: "603 - Personas Morales con Fines no Lucrativos", value: "603" },
  { label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios", value: "605" },
  { label: "606 - Arrendamiento", value: "606" },
  { label: "608 - Demás ingresos", value: "608" },
  { label: "609 - Consolidación", value: "609" },
  { label: "610 - Residentes en el Extranjero sin Establecimiento Permanente en México", value: "610" },
  { label: "611 - Ingresos por Dividendos (socios y accionistas)", value: "611" },
  { label: "612 - Personas Físicas con Actividades Empresariales y Profesionales", value: "612" },
  { label: "614 - Ingresos por intereses", value: "614" },
  { label: "616 - Sin obligaciones fiscales", value: "616" },
  { label: "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos", value: "620" },
  { label: "621 - Incorporación Fiscal", value: "621" },
  { label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras", value: "622" },
  { label: "623 - Opcional para Grupos de Sociedades", value: "623" },
  { label: "624 - Coordinados", value: "624" },
  { label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas", value: "625" },
  { label: "626 - Régimen Simplificado de Confianza", value: "626" }
]);

const opcionesUsoCFDI = ref([
  { label: "G01 - Adquisición de mercancías", value: "G01" },
  { label: "G02 - Devoluciones, descuentos o bonificaciones", value: "G02" },
  { label: "G03 - Gastos en general", value: "G03" },
  { label: "I01 - Construcciones", value: "I01" },
  { label: "I02 - Mobiliario y equipo de oficina por inversiones", value: "I02" },
  { label: "I03 - Equipo de transporte", value: "I03" },
  { label: "I04 - Equipo de cómputo y accesorios", value: "I04" },
  { label: "I05 - Dados, troqueles, moldes, matrices y herramental", value: "I05" },
  { label: "I06 - Comunicaciones telefónicas", value: "I06" },
  { label: "I07 - Comunicaciones satelitales", value: "I07" },
  { label: "I08 - Otra maquinaria y equipo", value: "I08" },
  { label: "D01 - Honorarios médicos, dentales y gastos hospitalarios", value: "D01" },
  { label: "D02 - Gastos médicos por incapacidad o discapacidad", value: "D02" },
  { label: "D03 - Gastos funerales", value: "D03" },
  { label: "D04 - Donativos", value: "D04" },
  { label: "D05 - Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)", value: "D05" },
  { label: "D06 - Aportaciones voluntarias al SAR", value: "D06" },
  { label: "D07 - Primas por seguros de gastos médicos", value: "D07" },
  { label: "D08 - Gastos de transportación escolar obligatoria", value: "D08" },
  { label: "D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones", value: "D09" },
  { label: "D10 - Pagos por servicios educativos (colegiaturas)", value: "D10" },
  { label: "P01 - Por definir", value: "P01" }
]);

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
  min-height: calc(130px + 1.0cm); /* Altura base + medio centímetro adicional */
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




