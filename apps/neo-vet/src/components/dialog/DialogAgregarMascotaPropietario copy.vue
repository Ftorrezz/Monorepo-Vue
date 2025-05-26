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
                <!--<q-tab
                  name="mascota"
                  icon="pets"
                  label="Mascota"
                  :disable="!propietarioActual.id"
                ></q-tab>-->
                <q-tab
                  name="mascota"
                  icon="pets"
                  label="Mascota"

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
                  <DialogAgregarPropietario/>
                </q-tab-panel>

                <q-tab-panel name="mascota">
                  <DialogAgregarMascota/>
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
import DialogAgregarPropietario from "./DialogAgregarPropietario.vue";
import DialogAgregarMascota from "./DialogAgregarMascota.vue";

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
// Función para validar el formulario según la pestaña activa
const validate = async () => {
  try {
    let isValid = false;

    if (tab.value === 'propietario') {
      if (tabPropietario.value === 'general') {
        // Validar el formulario general del propietario
        const myFormRef = myForm.value;
        if (myFormRef) {
          isValid = await myFormRef.validate();
        } else {
          console.warn('La referencia al formulario general del propietario es nula');
          return false;
        }
      } else if (tabPropietario.value === 'adicional') {
        // Validar el formulario adicional del propietario
        const formAdicionalRef = formAdicional.value;
        if (formAdicionalRef) {
          isValid = await formAdicionalRef.validate();
        } else {
          // Para el formulario adicional, podemos considerar que es válido si no existe
          console.warn('La referencia al formulario adicional del propietario es nula');
          isValid = true;
        }
      } else {
        // Para la pestaña de facturación, consideramos que es válido por ahora
        isValid = true;
      }
    } else if (tab.value === 'mascota') {
      // Validar el formulario de la mascota
      const formMascotaRef = formMascota.value;
      if (formMascotaRef) {
        isValid = await formMascotaRef.validate();
      } else {
        console.warn('La referencia al formulario de la mascota es nula');
        return false;
      }
    }

    return isValid;
  } catch (error) {
    console.error('Error al validar el formulario:', error);
    return false;
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




