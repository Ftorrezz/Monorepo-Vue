<template>
  <EncabezadoGenericoPrincipal :tituloVentana="crudName" />

  <div class="row q-col-gutter-xs q-ma-xs q-mr-sm">
    <div class="col-xs-8 col-md-8 col-sm-12 col-xs-12">
      <q-card elevated>
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">Propietario</div>
            <q-btn round color="secondary" icon="add" @click="abrirDialogoPropietario" />
          </div>
        </q-card-section>

        <q-separator inset></q-separator>

        <q-card-section class="row q-col-gutter-xs">
          <q-item class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input v-model="prueba" label="Primer Apellido" />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input v-model="prueba" label="Segundo Apellido" />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input v-model="prueba" label="Nombres" />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input v-model="prueba" label="Correo electronico" type="email">
                <template v-slot:prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>
            </q-item-section>
          </q-item>
          <q-item class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input v-model="prueba" label="Telefono móvil" lazy-rules>
                <template v-slot:prepend>
                  <q-icon name="phone_android" />
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-xs-4 col-md-4 col-sm-12 col-xs-12">
      <q-card elevated>
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">Mascota</div>
            <q-btn round color="secondary" icon="add" @click="abrirDialogoMascota" />
          </div>
        </q-card-section>

        <q-separator inset></q-separator>

        <q-card-section class="row q-col-gutter-xs">
          <q-item class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input v-model="prueba" label="Nombre" />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input v-model="prueba" label="Historia Clínica"
            /></q-item-section>
          </q-item>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
      <q-btn
        label="Buscar"
        class="full-width bg-cyan-8 text-white"
        icon="search"
        @click="buscar()"
      />
    </div>

    <CardBusquedaPropietarioMascota />

    <DialogAgregarPropietario v-if="mostrarDialogoPropietario" />
    <DialogAgregarMascota v-if="mostrarDialogoMascota" />


  </div>
</template>

<script setup lang="ts" scoped>
import { ref } from "vue";
import { useQuasar } from "quasar";
import CardBusquedaPropietarioMascota from "../../components/card/CardBusquedaPropietarioMascota.vue";
import EncabezadoGenericoPrincipal from "src/components/EncabezadoGenericoPrincipal.vue";
import DialogAgregarMascota from "src/components/dialog/DialogAgregarMascota.vue";
import DialogAgregarPropietario from "src/components/dialog/DialogAgregarPropietario.vue";

const mostrarDialogoPropietario = ref(false);
const mostrarDialogoMascota = ref(false);
const crudName: string = "Propietario / Mascota";
const $q = useQuasar();
const size = ref({ width: "200px", height: "200px" });
const prueba = ref(null);
const listaPropietarios = ref([]);

const abrirDialogoPropietario = () => {
  mostrarDialogoPropietario.value = true;
};

const abrirDialogoMascota = () => {
  mostrarDialogoMascota.value = true;
};

let tab = ref("all");
let search = ref("");

const buscar = async () => {
  try {
    console.log("entro a buscar");

    listaPropietarios.value = [];

    /*const resp = await Api.get("/buscar/propietario/nombre/prueba4");

        resp.data.propietario.forEach((element) => {
          listaPropietarios.value.push({
            id: element.id,
            nombre: element.persona.nombre,
            primerapellido: element.persona.primerapellido,
            segundoapellido: element.persona.segundoapellido,
          });
        });*/
    console.log(listaPropietarios.value);
    return { ok: true, message: "Propietarios obtenidos exitosamente" };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "No fue posible obtener los Propietarios",
    };
  }
};

const isValidEmail = async (val: any) => {
  const emailPattern =
    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val) || "El correo no parece ser válido";
};

/*return {
      tab: ref("all"),
      search: ref(""),
      size,

      listaPropietarios,

      onResize(size_dynamic) {
        size.value = size_dynamic;
      },
      prueba,
      buscar,

      isValidEmail(val) {
        const emailPattern =
          /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
        return emailPattern.test(val) || "El correo no parece ser válido";
      },
    };*/
</script>

<style scoped>
.custom-container {
  margin-left: 0 !important; /* Ajusta el margen izquierdo */
  margin-right: auto !important; /* Asegura que no haya margen derecho */
}
</style>
