<template>
  <div class="q-pa-md row q-gutter-md flex-center">
    <q-card
      class="my-card"
      :class="{'bg-white': !$q.dark.isActive, 'bg-dark': $q.dark.isActive, 'text-white': $q.dark.isActive}"
      v-for="app in aplicaciones"
      :key="app.id"
      bordered
      hover
      @click="verificarAccesoYRedirigir(app.permiso, app.url)"
      clickable
    >
      <span class="q-focus-helper"></span>
      <q-img
        :src="app.img"
        class="app-image"
        contain
        lazy
        :alt="app.nombre"
        v-ripple
      ></q-img>

      <q-card-section class="text-h5 text-center">{{ $t(`modules.${app.translationKey}`) }}</q-card-section>

    </q-card>
  </div>
</template>

<script setup>
import { openURL } from 'quasar'
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import useFuncionesGenericas from "src/composables/useFuncionesGenericas";
import { useI18n } from 'vue-i18n';

const router = useRouter(); 
const { verificaAccesoPantalla } = useFuncionesGenericas();
const { t } = useI18n();

// Debugging de variables de entorno
console.log('Todas las variables de entorno:', import.meta.env);
const QC_URL = import.meta.env.VITE_QC_URL || 'http://localhost:9001';
console.log('URL de Control de Calidad:', QC_URL);

const verificarAccesoYRedirigir = async (pantalla, rutaDestino) => {
  try {
    console.log('Pantalla:', pantalla);
    console.log('Ruta Destino:', rutaDestino);
    if (rutaDestino) {
      goToPage(rutaDestino);
    } else {
      console.error(t('modules.errors.undefined'));
    }
  } catch (error) {
    console.error(t('modules.errors.accessError'), error);
  }
};

const goToPage = (url) => {
  if (!url) {
    console.error(t('modules.errors.invalidUrl'), url);
    return;
  }
  console.log('Navegando a URL:', url);
  openURL(url, null, null);
}

// Lista de aplicaciones
const aplicaciones = ref([
  {
    id: 1,
    translationKey: 'hospitalManagement',
    img: "static/GestionHospitalaria.png",
    permiso: "AC_MODULO_GESTIONHOSPITAL",
    url: "/gestionhospital",
  },
  {
    id: 2,
    translationKey: 'laboratory',
    img: "static/GestionLaboratorio.png",
    permiso: "AC_MODULO_LABORATORIO",
    url: "/gestionlaboratorio",
  },
  {
    id: 3,
    translationKey: 'qualityControl',
    img: "static/GestionCalidad.png",
    permiso: "AC_MODULO_CONTROLCALIDAD",
    url: QC_URL
  },
  {
    id: 4,
    translationKey: 'inventory',
    img: "static/GestionInventario.png",
    permiso: "AC_MODULO_INVENTARIO",
    url: "/gestionlaboratorio",
  },
  {
    id: 5,
    translationKey: 'pharmacy',
    img: "static/GestionFarmacia.png",
    permiso: "AC_MODULO_FARMACIA",
    url: "/gestionlaboratorio",
  },
  {
    id: 6,
    translationKey: 'appointments',
    img: "static/GestionCitas.png",
    permiso: "AC_MODULO_CITAS",
    url: "/gestionlaboratorio",
  },
  {
    id: 7,
    translationKey: 'shiftManager',
    img: "static/GestionTurnos.png",
    permiso: "AC_MODULO_TURNOS",
    url: "/gestionlaboratorio",
  },
]);
</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 330px;
  min-height: 130px;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.my-card:hover {
  transform: translateY(-7px);
  box-shadow: 0px 5px 15px rgba(12, 160, 245, 0.4);
}

.app-image {
  border-radius: 12px 12px 0 0;
}

.modern-card {
  background-color: #ffffff;
}

.q-card-actions {
  padding-top: 8px;
}

.modern-btn {
  background-color: #2196f3 !important; /* Color inicial */
  color: white !important;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
}

.modern-btn:hover {
  box-shadow: 0px 5px 15px rgba(12, 160, 245, 0.4);
  transform: scale(1.05); /* Incrementa ligeramente el tamaño */
  background-color: #a005a0 !important; /* Color al pasar el cursor */
}

.no-uppercase {
  text-transform: none !important;
}
</style>
