<template>
  <div class="row q-col-gutter-md q-pa-md">
    <div class="col-xs-8 col-md-8 col-sm-12 col-xs-12">
      <q-card class="custom-card">
        <q-card-section class="bg-primary text-white q-py-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1">
              <q-icon name="person" size="sm" class="q-mr-sm" />
              Propietario
            </div>
          </div>
        </q-card-section>

       <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <q-item class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input
                  v-model="formData.propietario.primerapellido"
                  label="Primer Apellido"
                  class="custom-input"
                />
              </q-item-section>
            </q-item>
            <q-item class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input
                  v-model="formData.propietario.segundoapellido"
                  label="Segundo Apellido"
                  class="custom-input"
                />
              </q-item-section>
            </q-item>
            <q-item class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input
                  v-model="formData.propietario.nombre"
                  label="Nombres"
                  class="custom-input"
                />
              </q-item-section>
            </q-item>
            <q-item class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input
                  v-model="formData.propietario.email"
                  label="Correo electronico"
                  type="email"
                >
                  <template v-slot:prepend>
                    <q-icon name="mail" />
                  </template>
                </q-input>
              </q-item-section>
            </q-item>
            <q-item class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input
                  v-model="formData.propietario.telefono1"
                  label="Teléfono móvil"
                  class="custom-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone_android" />
                  </template>
                </q-input>
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-card>

      <div class="fab-container row items-center q-gutter-sm">
        <q-btn
          round
          flat
          style="color: #FF0080"
          icon="search"
          size="1.2rem"
          padding="12px"
          @click="buscar()"
          :disable="!tieneAlgunCampoLleno"
          class="search-fab"
        >
          <q-tooltip>
            {{ !tieneAlgunCampoLleno ? 'Ingrese al menos un criterio de búsqueda' : 'Buscar' }}
          </q-tooltip>
        </q-btn>
        <q-btn
          round
          flat
          color="negative"
          icon="close"
          size="1.2rem"
          padding="12px"
          @click="limpiarBusqueda"
          class="search-fab"
        >
          <q-tooltip>Limpiar búsqueda</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="col-xs-3 col-md-3 col-sm-11 col-xs-11">
      <q-card class="custom-card">
        <q-card-section class="bg-secondary text-white q-py-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1">
              <q-icon name="pets" size="sm" class="q-mr-sm" />
              Mascota
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <q-item class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input
                  v-model="formData.mascota.nombre"
                  label="Nombre"
                  class="custom-input"
                />
              </q-item-section>
            </q-item>
            <q-item class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input
                  v-model="formData.mascota.historia_clinica"
                  label="Historia Clínica"
                  class="custom-input"
                />
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <CardBusquedaPropietarioMascota
      :rows="listaPropietarios"
      @refresh-data="buscar"
      @limpiar-filtro="limpiarFiltro"
      @llenar-filtro-y-buscar="llenarFiltroYBuscar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useQuasar } from "quasar";
import CardBusquedaPropietarioMascota from "../../components/card/CardBusquedaPropietarioMascota.vue";
import NdPeticionControl from "src/controles/rest.control";
import { DtoParametros } from "src/controles/dto.parametros";

const $q = useQuasar();
const listaPropietarios = ref([]);
const loading = ref(false);

const formData = ref({
  propietario: {
    primerapellido: '',
    segundoapellido: '',
    nombre: '',
    email: '',
    telefono1: ''
  },
  mascota: {
    nombre: '',
    historia_clinica: ''
  }
});

const hayResultados = computed(() => listaPropietarios.value && listaPropietarios.value.length > 0);

const buscar = async (forzarBusqueda = false) => {
  try {
    // Si no es una búsqueda forzada, verificar que haya criterios
    if (!forzarBusqueda && !tieneAlgunCampoLleno.value) {
      $q.notify({
        type: 'warning',
        message: 'Debe ingresar al menos un criterio de búsqueda',
        position: 'top'
      });
      return;
    }

    loading.value = true;
    listaPropietarios.value = [];
    const _peticion = new NdPeticionControl();

    let _unDtoParametros = new DtoParametros();
    _unDtoParametros.filtro = {
      id_sitio: 1,
      nombre: formData.value.propietario.nombre,
      primerapellido: formData.value.propietario.primerapellido,
      segundoapellido: formData.value.propietario.segundoapellido,
      email: formData.value.propietario.email,
      telefono1: formData.value.propietario.telefono1,
      nombre_mascota: formData.value.mascota.nombre,
      historia_clinica: formData.value.mascota.historia_clinica
    };

    console.log('Ejecutando búsqueda con filtros:', _unDtoParametros.filtro);

    const _respuesta = await _peticion.invocarMetodo("filtropropietariomascota/filtro", "post", _unDtoParametros);
    listaPropietarios.value = _respuesta || [];

    console.log('Resultados de búsqueda:', listaPropietarios.value);

    /*$q.notify({
      type: 'positive',
      message: 'Búsqueda realizada exitosamente'
    });*/

    return { ok: true, message: "Propietarios obtenidos exitosamente" };
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: 'Error al realizar la búsqueda'
    });
    return {
      ok: false,
      message: "No fue posible obtener los Propietarios",
    };
  } finally {
    loading.value = false;
  }
};

// Función para limpiar el filtro
const limpiarFiltro = () => {
  formData.value = {
    propietario: {
      primerapellido: '',
      segundoapellido: '',
      nombre: '',
      email: '',
      telefono1: ''
    },
    mascota: {
      nombre: '',
      historia_clinica: ''
    }
  };
  console.log('Filtro limpiado');
};

const limpiarBusqueda = () => {
  limpiarFiltro();
  listaPropietarios.value = [];
};

// Función para llenar el filtro con datos de propietario y buscar
const llenarFiltroYBuscar = async (propietario: any) => {
  console.log('=== INICIO llenarFiltroYBuscar ===');
  console.log('Propietario recibido:', propietario);
  console.log('Tipo de propietario:', typeof propietario);
  console.log('Propietario es array:', Array.isArray(propietario));

  if (propietario && typeof propietario === 'object') {
    console.log('Propiedades del propietario:', Object.keys(propietario));
    console.log('primerapellido:', propietario.primerapellido);
    console.log('segundoapellido:', propietario.segundoapellido);
  }

  // Llenar el filtro solo con primer y segundo apellido
  formData.value.propietario = {
    primerapellido: propietario?.primerapellido || '',
    segundoapellido: propietario?.segundoapellido || '',
    nombre: '', // Dejar vacío para agregar después
    email: '', // Dejar vacío para agregar después
    telefono1: '' // Dejar vacío para agregar después
  };

  // Limpiar filtros de mascota
  formData.value.mascota = {
    nombre: '',
    historia_clinica: ''
  };

  console.log('Filtro llenado:', formData.value);
  console.log('tieneAlgunCampoLleno:', tieneAlgunCampoLleno.value);

  // Verificar que al menos uno de los campos del propietario tenga datos
  if (tieneAlgunCampoLleno.value) {
    await buscar(true);
  }
};

const isValidEmail = (val: string) => {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val) || "El correo no parece ser válido";
};

const tieneAlgunCampoLleno = computed(() => {
  const propietario = formData.value.propietario;
  const mascota = formData.value.mascota;

  return propietario.primerapellido.trim() !== '' ||
         propietario.segundoapellido.trim() !== '' ||
         propietario.nombre.trim() !== '' ||
         propietario.email.trim() !== '' ||
         propietario.telefono1.trim() !== '' ||
         mascota.nombre.trim() !== '' ||
         mascota.historia_clinica.trim() !== '';
});
</script>

<style scoped>
.custom-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.custom-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.custom-input {
  transition: all 0.3s ease;
}

.custom-input:focus-within {
  transform: translateY(-1px);
}

.search-button {
  border-radius: 4px;
  transition: all 0.3s ease;
  height: 40px;
  font-weight: 500;
  letter-spacing: 0.5px;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-container {
  margin-left: 0 !important;
  margin-right: auto !important;
}

.floating-search-btn {
  height: 45px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.floating-search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.fab-container {
  position: relative;
  height: 0;
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.search-fab {
  position: fixed;
  z-index: 2;
  transform: scale(1.6);
  top: 140px; /* Ajustado 2cm más abajo (aproximadamente 20px = 1cm) */
  right: 80px; /* Ajustado para mover 1cm a la izquierda */
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Ajustes responsive */
@media (max-width: 599px) {
  .search-fab {
    top: 36px; /* Ajustado proporcionalmente para móviles */
    right: 36px;
    transform: scale(1.4);
  }
}
</style>
