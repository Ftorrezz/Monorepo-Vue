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
                  v-model="formData.propietario.correo"
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
                  v-model="formData.propietario.telefonocelular"
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

       <!-- <q-card-actions align="right" class="q-pa-md">
          <q-btn
            outline
            label="Buscar"
            icon="search"
            style="color: #FF0080"
            @click="buscar()"
          />
        </q-card-actions>-->
      </q-card>

      <div class="fab-container">
        <q-btn
          round
          flat
          style="color: #FF0080"
          icon="search"
          size="1.2rem"
          padding="12px"
          @click="buscar()"
          class="search-fab"
        />
      </div>
    </div>

    <CardBusquedaPropietarioMascota :rows="listaPropietarios" />
  </div>
</template>



<script setup lang="ts">
import { ref } from "vue";
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
    correo: '',
    telefonocelular: ''
  },
  mascota: {
    nombre: '',
    historia_clinica: ''
  }
});

const buscar = async () => {
  try {
    loading.value = true;
    listaPropietarios.value = [];
    const _peticion = new NdPeticionControl();

    let _unDtoParametros = new DtoParametros();
    _unDtoParametros.filtro = {
      id_sitio: 1,
      nombre: formData.value.propietario.nombre,
      primerapellido: formData.value.propietario.primerapellido,
      segundoapellido: formData.value.propietario.segundoapellido,
      correo: formData.value.propietario.correo,
      telefonocelular: formData.value.propietario.telefonocelular,
      nombre_mascota: formData.value.mascota.nombre,
      historia_clinica: formData.value.mascota.historia_clinica
    };

    const _respuesta = await _peticion.invocarMetodo("filtropropietariomascota/filtro", "post", _unDtoParametros);
    listaPropietarios.value = _respuesta || [];

    console.log(listaPropietarios.value);

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

const isValidEmail = (val: string) => {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val) || "El correo no parece ser válido";
};
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
  position: absolute;
  right: -100px;
  top: -90px;
  z-index: 2;
  transform: scale(1.6);
}
</style>
