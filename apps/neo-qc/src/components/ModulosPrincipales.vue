<template>
  <div class="q-pa-md row q-gutter-md flex-center">
    <q-card class="my-card" borderead>
      <span class="q-focus-helper"></span>
      <q-img src="static/GestionHospitalaria.png" clickable v-ripple>
        <!--<div class="absolute-top text-h6">Gestión Hospitalaria</div>-->
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
        <!--<div class="absolute-top text-h6">Laboratorio</div>-->
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
</style>
