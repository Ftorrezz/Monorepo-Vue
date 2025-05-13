<template>
  <q-dialog v-model="mostrarDialogo" persistent>
    <q-card
      bordered
      elevated
      class="dialog-card"
    >
      <q-bar class="bg-primary text-white">
        <q-icon name="person" />
        <div>Propietario / Mascota</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <template #default>
            <q-tooltip>Cerrar</q-tooltip>
          </template>
        </q-btn>
      </q-bar>

      <q-card-section class="fixed-height-section">
        <q-card elevated>
          <q-splitter v-model="splitterModel" style="height: calc(600px - 50px)">
            <template #before>
              <q-tabs v-model="tab" vertical class="text-teal">
                <q-tab name="propietario" icon="person" label="Propietario" />
                <q-tab
                  name="mascota"
                  icon="pets"
                  label="Mascota"
                  :disable="!propietarioActual.id"
                >
                  <template #default>
                    <q-tooltip v-if="!propietarioActual.id">
                      Debe agregar un propietario primero
                    </q-tooltip>
                  </template>
                </q-tab>
              </q-tabs>
            </template>

            <template #after>
              <q-tab-panels
                v-model="tab"
                animated
                swipeable
                vertical
                transition-prev="jump-up"
                transition-next="jump-up"
                class="fixed-height-panel"
              >
                <q-tab-panel name="propietario">
                  <div class="text-h5 q-mb-md text-teal">Propietario</div>
                  <q-separator
                    class="q-mb-md"
                    color="grey-3"
                    style="height: 2px"
                  />

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

                  <q-tab-panels
                    v-model="tabPropietario"
                    animated
                    class="flex-panels"
                  >
                    <q-tab-panel name="general" class="flex-panel-content">
                      <q-form ref="myForm">
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
                                    v-model="formData.propietario.primerapellido"
                                    label="Primer Apellido"
                                    :rules="[val => !!val || 'El primer apellido es requerido']"
                                  />
                                </div>
                                <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                  <q-input
                                    v-model="formData.propietario.segundoapellido"
                                    label="Segundo Apellido"
                                  />
                                </div>
                                <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                  <q-input
                                    v-model="formData.propietario.nombre"
                                    label="Nombres"
                                    :rules="[val => !!val || 'El nombre es requerido']"
                                  />
                                </div>
                                <!-- Correo y teléfono alineados -->
                                <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                  <q-input
                                    v-model="formData.propietario.correo"
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
                                    v-model="formData.propietario.telefonocelular"
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

                          <!-- Resto de los campos -->
                          <div class="row q-col-gutter-sm">
                            <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                              <q-input
                                v-model="formData.propietario.correo"
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
                                v-model="formData.propietario.telefonocelular"
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
                      </q-form>
                    </q-tab-panel>

                    <q-tab-panel name="adicional">
                      <q-form ref="formAdicional">
                        <div class="row q-col-gutter-md">
                          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                            <q-select
                              v-model="formData.propietario.id_genero"
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
                              v-model="formData.propietario.id_estadocivil"
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
                              v-model="formData.propietario.id_escolaridad"
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
                              v-model="formData.propietario.fechanacimiento"
                              label="Fecha de Nacimiento"
                              type="date"
                              @update:model-value="calcularEdad"
                              filled
                              class="full-width"
                            />
                          </div>
                          <div class="col-12">
                            <q-input
                              v-model="formData.propietario.observacion"
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
                      <div class="text-h6">Movies</div>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </q-tab-panel>
                  </q-tab-panels>
                </q-tab-panel>

                <q-tab-panel name="mascota">
                  <div class="text-h5 q-mb-md text-teal">Mascota</div>
                  <q-separator
                    class="q-mb-md"
                    color="grey-3"
                    style="height: 2px"
                  />

                  <q-tabs
                    v-model="tabMascota"
                    dense
                    class="text-grey q-mb-lg"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                  >
                    <q-tab name="general" label="General" />
                    <q-tab name="adicional" label="Adicional" />
                  </q-tabs>

                  <q-tab-panels
                    v-model="tabMascota"
                    animated
                    class="flex-panels"
                  >
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
                                    style="display: none;"
                                  ></canvas>
                                  <img
                                    v-if="imagenCapturada"
                                    :src="imagenCapturada"
                                    class="captured-image"
                                    alt="Foto de la mascota"
                                  />
                                  <div v-if="!camaraActiva && !imagenCapturada" class="photo-placeholder">
                                    <q-icon name="pets" size="32px" color="grey-7" />
                                    <div class="text-grey-7 text-caption q-mt-sm">Click para foto</div>
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
                                <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                  <q-input
                                    v-model="formData.mascota.nombre"
                                    label="Nombre"
                                    :rules="[val => !!val || 'El nombre es requerido']"
                                  />
                                </div>
                                <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                  <q-input
                                    v-model="formData.mascota.chip"
                                    label="Número de Chip"
                                  />
                                </div>
                                <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                  <q-input
                                    v-model="formData.mascota.tatuaje"
                                    label="Tatuaje"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Segunda fila de campos -->
                          <div class="row q-col-gutter-sm">
                            <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.id_especie"
                                :options="opcionesEspecie"
                                label="Especie"
                                emit-value
                                map-options
                                :rules="[val => !!val || 'La especie es requerida']"
                              />
                            </div>
                            <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.id_raza"
                                :options="opcionesRaza"
                                label="Raza"
                                emit-value
                                map-options
                                :rules="[val => !!val || 'La raza es requerida']"
                              />
                            </div>
                            <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.id_color"
                                :options="opcionesColor"
                                label="Color"
                                emit-value
                                map-options
                              />
                            </div>
                            <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.id_sexo"
                                :options="opcionesSexo"
                                label="Sexo"
                                emit-value
                                map-options
                                :rules="[val => !!val || 'El sexo es requerido']"
                              />
                            </div>
                          </div>

                          <!-- Tercera fila de campos -->
                          <div class="row q-col-gutter-sm">
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-input
                                v-model="formData.mascota.fechanacimiento"
                                label="Fecha de Nacimiento"
                                type="date"
                                @update:model-value="calcularEdadMascota"
                              />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-input
                                v-model="formData.mascota.edad"
                                label="Edad"
                                type="number"
                                readonly
                              />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-input
                                v-model="formData.mascota.fechachip"
                                label="Fecha de Chip"
                                type="date"
                              />
                            </div>
                          </div>

                          <!-- Cuarta fila de campos -->
                          <div class="row q-col-gutter-sm">
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.id_habitat"
                                :options="opcionesHabitat"
                                label="Hábitat"
                                emit-value
                                map-options
                              />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.id_caracter"
                                :options="opcionesCaracter"
                                label="Carácter"
                                emit-value
                                map-options
                              />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.id_dieta"
                                :options="opcionesDieta"
                                label="Dieta"
                                emit-value
                                map-options
                              />
                            </div>
                          </div>

                          <!-- Quinta fila de campos -->
                          <div class="row q-col-gutter-sm">
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-input
                                v-model="formData.mascota.pedrigri"
                                label="Pedigrí"
                              />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.esterilizado"
                                :options="[
                                  { label: 'Sí', value: 'S' },
                                  { label: 'No', value: 'N' }
                                ]"
                                label="Esterilizado"
                                emit-value
                                map-options
                              />
                            </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                              <q-select
                                v-model="formData.mascota.activo"
                                :options="[
                                  { label: 'Sí', value: 'S' },
                                  { label: 'No', value: 'N' }
                                ]"
                                label="Activo"
                                emit-value
                                map-options
                              />
                            </div>
                          </div>

                          <!-- Campo de observaciones -->
                          <div class="row q-col-gutter-sm">
                            <div class="col-12">
                              <q-input
                                v-model="formData.mascota.observaciones"
                                type="textarea"
                                label="Observaciones"
                                rows="3"
                              />
                            </div>
                          </div>
                        </div>
                      </q-form>
                    </q-tab-panel>
                    <q-tab-panel name="adicional">
                      <q-form ref="formMascotaAdicional">
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <q-input
                              v-model="formData.mascota.observaciones"
                              type="textarea"
                              label="Observaciones"
                              rows="3"
                            />
                          </div>
                          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                            <q-select
                              v-model="formData.mascota.id_habitat"
                              :options="opcionesHabitat"
                              label="Hábitat"
                              emit-value
                              map-options
                            />
                          </div>
                          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                            <q-select
                              v-model="formData.mascota.id_caracter"
                              :options="opcionesCaracter"
                              label="Carácter"
                              emit-value
                              map-options
                            />
                          </div>
                          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                            <q-select
                              v-model="formData.mascota.id_dieta"
                              :options="opcionesDieta"
                              label="Dieta"
                              emit-value
                              map-options
                            />
                          </div>
                          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                            <q-select
                              v-model="formData.mascota.esterilizado"
                              :options="[
                                { label: 'Sí', value: 'S' },
                                { label: 'No', value: 'N' }
                              ]"
                              label="Esterilizado"
                              emit-value
                              map-options
                            />
                          </div>
                        </div>
                      </q-form>
                    </q-tab-panel>
                  </q-tab-panels>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>
        </q-card>
        <q-card-section class="q-pa-md">
        <OpcionCancelarGuardar
          @accionCerrar="close"
          @accionValidar="validate"
        />
      </q-card-section>
      </q-card-section>




    </q-card>
  </q-dialog>
</template>

<script setup  lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";

const tab = ref("propietario");
const tabPropietario = ref("general");
const tabMascota = ref("general"); // Nueva variable para las pestañas de mascota
const splitterModel = ref(10);

const mostrarDialogo = ref(true);
const editedItem = ref({
  nombreusuario: "",
  email: "",
  clave: "",
  claverepetir: "",
  foto: "",
  activo: "S",
});
const isPwd = ref(true);
const isPwdRep = ref(true);
const mostrarContrasenia = ref(true);
const formData = ref({
  propietario: {
    primerapellido: '',
    segundoapellido: '',
    nombre: '',
    correo: '',
    telefonocelular: ''
  },
  mascota: {
    id: null,
    id_propietario: null,
    nombre: '',
    chip: '',
    fechachip: null,
    tatuaje: '',
    fechanacimiento: null,
    edad: 0,
    pedrigri: '',
    observaciones: '',
    id_especie: null,
    id_raza: null,
    id_color: null,
    id_sexo: null,
    id_habitat: null,
    id_caracter: null,
    id_dieta: null,
    activo: 'S',
    esterilizado: 'N'
  }
});

const isValidEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
const isValidPassword = (password: string) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  return re.test(password);
};

const photoInput = ref(null);
const uploadPhoto = () => {
  const photoInput = ref(null);
};

const close = () => {
  mostrarDialogo.value = false;
};

const opcionesEspecie = ref([]);
const opcionesRaza = ref([]);
const opcionesColor = ref([]);
const opcionesSexo = ref([]);
const opcionesHabitat = ref([]);
const opcionesCaracter = ref([]);
const opcionesDieta = ref([]);

// Función para calcular la edad de la mascota
const calcularEdadMascota = () => {
  if (formData.value.mascota.fechanacimiento) {
    const fechaNac = new Date(formData.value.mascota.fechanacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    formData.value.mascota.edad = edad;
  }
};

// Computed property para determinar el tipo de formulario
const tipoFormulario = computed(() => {
  return tab.value;
});

// Método para validar según el tipo de formulario
const validate = async () => {
  if (tab.value === 'propietario') {
    if (tabPropietario.value === 'general') {
      const myForm = ref<any>(null);
      const isValid = await myForm.value.validate();

      if (isValid) {
        // Lógica para guardar datos generales del propietario
        console.log('Guardando datos generales del propietario', formData.value.propietario);
      }
    } else if (tabPropietario.value === 'adicional') {
      // Lógica para guardar datos adicionales del propietario
      console.log('Guardando datos adicionales del propietario');
    } else if (tabPropietario.value === 'facturacion') {
      // Lógica para guardar datos de facturación del propietario
      console.log('Guardando datos de facturación del propietario');
    }
  } else if (tab.value === 'mascota') {
    // Lógica para guardar mascota
    console.log('Guardando datos de la mascota');
  }
};

// Props para el componente OpcionCancelarGuardar
const botonesProps = computed(() => ({
  textoCancelar: 'Cancelar',
  textoGuardar: tipoFormulario.value === 'propietario' ? 'Guardar Propietario' : 'Guardar Mascota',
  colorGuardar: tipoFormulario.value === 'propietario' ? 'primary' : 'secondary'
}));


const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const camaraActiva = ref(false);
const imagenCapturada = ref('');
const stream = ref<MediaStream | null>(null);

const activarCamara = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    if (video.value && stream.value) {
      video.value.srcObject = stream.value;
      video.value.play();
      camaraActiva.value = true;
    }
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
  }
};

const capturarFoto = () => {
  if (canvas.value && video.value) {
    const context = canvas.value.getContext('2d');
    if (context) {
      context.drawImage(video.value, 0, 0, 640, 480);
      imagenCapturada.value = canvas.value.toDataURL('image/png');
      detenerCamara();
    }
  }
};

const reiniciarCamara = () => {
  imagenCapturada.value = '';
  activarCamara();
};

const detenerCamara = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    camaraActiva.value = false;
  }
};

// Limpiar recursos cuando se cierra el diálogo
onBeforeUnmount(() => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
  }
});

// Inicializar propietarioActual con un objeto vacío que tenga la propiedad id
const propietarioActual = ref({
  id: 0,
  nombre: '',
  primerapellido: '',
  segundoapellido: ''
});

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




