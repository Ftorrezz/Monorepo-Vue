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

      <q-card-section class="text-h5 text-center">{{ app.nombre }}</q-card-section>

    </q-card>
  </div>
</template>

<script setup>
import { openURL } from 'quasar'
import { ref } from "vue";
import { useRouter } from "vue-router";
import useFuncionesGenericas from "src/composables/useFuncionesGenericas";

const router = useRouter(); // Obtener el enrutador
const { verificaAccesoPantalla } = useFuncionesGenericas();

const verificarAccesoYRedirigir = async (pantalla, rutaDestino) => {
  try {
        
    goToPage(rutaDestino);

    /*const acceso = await verificaAccesoPantalla(pantalla);
    if (acceso) {
      goToPage(rutaDestino);
      //router.push(rutaDestino); // Redirigir a la ruta deseada
    }*/
  } catch (error) {
    console.error("Error al verificar acceso:", error);
  }
};

const goToPage = (url) => {
    
  openURL(url, null, null)
}

// Lista de aplicaciones
const aplicaciones = ref([
  {
    id: 1,
    nombre: "Gestión Hospitalaria",
    img: "static/GestionHospitalaria.png",
    permiso: "AC_MODULO_GESTIONHOSPITAL",
    url: "/gestionhospital",
  },
  {
    id: 2,
    nombre: "Laboratorio",
    img: "static/GestionLaboratorio.png",
    permiso: "AC_MODULO_LABORATORIO",
    url: "/gestionlaboratorio",
  },
  {
    id: 3,
    nombre: "Control de Calidad",
    img: "static/GestionCalidad.png",
    permiso: "AC_MODULO_CONTROLCALIDAD",
    url: 'http://localhost:9001/'// process.env.BASE_URL_QC, //TODO esto tiene que ser
  },
  {
    id: 4,
    nombre: "Inventario",
    img: "static/GestionInventario.png",
    permiso: "AC_MODULO_INVENTARIO",
    url: "/gestionlaboratorio",
  },
  {
    id: 5,
    nombre: "Farmacia",
    img: "static/GestionFarmacia.png",
    permiso: "AC_MODULO_FARMACIA",
    url: "/gestionlaboratorio",
  },
  {
    id: 6,
    nombre: "Citas",
    img: "static/GestionCitas.png",
    permiso: "AC_MODULO_CITAS",
    url: "/gestionlaboratorio",
  },
  {
    id: 7,
    nombre: "Gestor de Turnos",
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


<!--<template>
  <div class="q-pa-md row q-gutter-md flex-center">
    <q-card
      class="my-card modern-card"
      v-for="app in aplicaciones"
      :key="app.id"
      bordered
      hover
    >
      <span class="q-focus-helper"></span>
      <q-img
        :src="app.img"
        class="app-image"
        contain
        lazy
        :alt="app.nombre"
        clickable
        v-ripple
      ></q-img>

      <q-card-section class="text-h5 text-center">{{ app.nombre }}</q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn
          class="full-width no-uppercase modern-btn"
          color="primary"
          :label="'Ingresar'"
          @click="verificarAccesoYRedirigir(app.permiso, app.ruta)"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useFuncionesGenericas from "src/composables/useFuncionesGenericas";

const router = useRouter(); // Obtener el enrutador
const { verificaAccesoPantalla } = useFuncionesGenericas();

const verificarAccesoYRedirigir = async (pantalla, rutaDestino) => {
  try {
    const acceso = await verificaAccesoPantalla(pantalla);
    if (acceso) {
      router.push(rutaDestino); // Redirigir a la ruta deseada
    }
  } catch (error) {
    console.error("Error al verificar acceso:", error);
  }
};

// Lista de aplicaciones
const aplicaciones = ref([
  {
    id: 1,
    nombre: "Gestión Hospitalaria",
    img: "static/GestionHospitalaria.png",
    permiso: "AC_MODULO_GESTIONHOSPITAL",
    ruta: "/gestionhospital",
  },
  {
    id: 2,
    nombre: "Laboratorio",
    img: "static/GestionLaboratorio.png",
    permiso: "AC_MODULO_LABORATORIO",
    ruta: "/gestionlaboratorio",
  },
  {
    id: 3,
    nombre: "Control de Calidad",
    img: "static/GestionCalidad.png",
    permiso: "AC_MODULO_CONTROLCALIDAD",
    ruta: "/gestionlaboratorio",
  },
  {
    id: 4,
    nombre: "Inventario",
    img: "static/GestionInventario.png",
    permiso: "AC_MODULO_INVENTARIO",
    ruta: "/gestionlaboratorio",
  },
  {
    id: 5,
    nombre: "Farmacia",
    img: "static/GestionFarmacia.png",
    permiso: "AC_MODULO_FARMACIA",
    ruta: "/gestionlaboratorio",
  },
  {
    id: 6,
    nombre: "Citas",
    img: "static/GestionCitas.png",
    permiso: "AC_MODULO_CITAS",
    ruta: "/gestionlaboratorio",
  },
  {
    id: 7,
    nombre: "Gestor de Turnos",
    img: "static/GestionTurnos.png",
    permiso: "AC_MODULO_TURNOS",
    ruta: "/gestionlaboratorio",
  },
]);
</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 330px;
  min-height: 260px;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.my-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
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
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
}

.modern-btn:hover {
  box-shadow: 0px 5px 15px rgba(33, 150, 243, 0.4);
  transform: scale(1.05); /* Incrementa ligeramente el tamaño */
  background-color: #1976d2; /* Cambia el color del botón */
}

.no-uppercase {
  text-transform: none !important;
}
</style>



<!--<template>
  <div class="q-pa-md row q-gutter-md flex-center">
    <q-card class="my-card" borderead>
      <span class="q-focus-helper"></span>
      <q-img src="static/GestionHospitalaria.png" clickable v-ripple>

      </q-img>

      <q-card-section class="text-h5"> Gestión Hospitalaria </q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn class="full-width no-uppercase" color="primary"
          @click="verificarAccesoYRedirigir('AC_MODULO_GESTIONHOSPITAL', '/gestionhospital')"
          >Ingresar</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-card class="my-card" borderead>
      <span class="q-focus-helper"></span>
      <q-img src="static/GestionLaboratorio.png">

      </q-img>
      <q-card-section class="text-h5"> Laboratorio </q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn class="full-width no-uppercase" color="primary"
        @click="verificarAccesoYRedirigir('AC_MODULO_LABORATORIO', '/gestionlaboratorio')"
        >Ingresar</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-card class="my-card" borderead>
      <q-img src="static/GestionCalidad.png"> </q-img>
      <q-card-section class="text-h5"> Control de calidad </q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn class="full-width no-uppercase" color="primary"
        @click="verificarAccesoYRedirigir('AC_MODULO_CONTROLCALIDAD', '/gestionlaboratorio')"
          >Ingresar</q-btn
        >
      </q-card-actions>
    </q-card>
    <q-card class="my-card" borderead>
      <q-img src="static/GestionInventario.png"> </q-img>
      <q-card-section class="text-h5"> Inventario </q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn class="full-width no-uppercase" color="primary"
        @click="verificarAccesoYRedirigir('AC_MODULO_INVENTARIO', '/gestionlaboratorio')"
          >Ingresar</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-card class="my-card" borderead>
      <q-img src="static/GestionFarmacia.png"> </q-img>
      <q-card-section class="text-h5">Farmacia </q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn class="full-width no-uppercase" color="primary"
        @click="verificarAccesoYRedirigir('AC_MODULO_FARMACIA', '/gestionlaboratorio')"
          >Ingresar</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-card class="my-card" borderead>
      <q-img src="static/GestionCitas.png"> </q-img>
      <q-card-section class="text-h5"> Citas </q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn class="full-width no-uppercase" color="primary"
        @click="verificarAccesoYRedirigir('AC_MODULO_CITAS', '/gestionlaboratorio')"
          >Ingresar</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-card class="my-card" borderead>
      <q-img src="static/GestionTurnos.png"> </q-img>
      <q-card-section class="text-h5">Gestor de Turnos </q-card-section>
      <q-card-actions align="center" class="absolute-bottom">
        <q-btn class="full-width no-uppercase" color="primary" label="Ingresar"
        @click="verificarAccesoYRedirigir('AC_MODULO_TURNOS', '/gestionlaboratorio')"


          ></q-btn
        >
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import useFuncionesGenericas from 'src/composables/useFuncionesGenericas';
import { useRouter } from "vue-router";

const router = useRouter(); // Obtener el enrutador

  const { verificaAccesoPantalla } = useFuncionesGenericas()

  const verificarAccesoYRedirigir = async (pantalla, rutaDestino) => {
      try {
        const acceso = await verificaAccesoPantalla(pantalla);
        if (acceso) {
          router.push(rutaDestino); // Redirigir a la ruta deseada
        }

      } catch (error) {
        console.error('Error al verificar acceso:', error);
      }
    };

</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 330px;
  min-height: 260px;
}
.no-uppercase {
  text-transform: none !important;
}
</style>-->
