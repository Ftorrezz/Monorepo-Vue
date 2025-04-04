<template>
  <q-dialog v-model="mostrarDialogo" persistent>
    <q-card bordered
          elevated
          style="
            max-width: 1500px;
            border-radius: 10px;
            overflow: hidden;
          ">
      <q-bar class="bg-primary text-white">
        <q-icon name="person" />
        <div>Propietario / Mascota</div>

        <q-space />

        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <q-card elevated>
          <q-splitter v-model="splitterModel" style="height: 500px">
            <template v-slot:before>
              <q-tabs v-model="tab" vertical class="text-teal">
                <q-tab name="propietario" icon="person" label="Propietario" />
                <q-tab name="mascota" icon="pets" label="Mascota" />

              </q-tabs>
            </template>

            <template v-slot:after>
              <q-tab-panels
                v-model="tab"
                animated
                swipeable
                vertical
                transition-prev="jump-up"
                transition-next="jump-up"
              >
                <q-tab-panel name="propietario">
                  <div class="text-h5 q-mb-md text-teal">Propietario</div>
                  <q-separator
                    class="q-mb-md"
                    color="grey-3"
                    style="height: 2px"
                  />
                  
                  
                  <q-form ref="myForm">
            <div class="row q-col-gutter-sm">
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
                    <q-input
                      v-model="prueba"
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
                    <q-input v-model="prueba" label="Telefono móvil" lazy-rules>
                      <template v-slot:prepend>
                        <q-icon name="phone_android" />
                      </template>
                    </q-input>
                  </q-item-section>
                </q-item> </q-card-section
              >
            </div>
          </q-form>
                                                      
        
                </q-tab-panel>

                <q-tab-panel name="mascota">
                  <div class="text-h5 q-mb-md text-teal">Mascota</div>
                  <q-separator
                    class="q-mb-md"
                    color="grey-3"
                    style="height: 2px"
                  />
                  
                  <q-form ref="myForm">
            <div class="row q-col-gutter-sm">
              <q-card-section class="row q-col-gutter-xs">
                
              
                <q-item class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
                  <q-item-section>
                    <q-input v-model="prueba" label="Primer Apellido" />
                  </q-item-section>
                </q-item>
              
              </q-card-section> 
                </div>  
                </q-form>
                  
                  
                  <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Quis praesentium cumque magnam odio iure quidem, quod illum
                    numquam possimus obcaecati commodi minima assumenda
                    consectetur culpa fuga nulla ullam. In, libero.
                  </p>
                  <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Quis praesentium cumque magnam odio iure quidem, quod illum
                    numquam possimus obcaecati commodi minima assumenda
                    consectetur culpa fuga nulla ullam. In, libero.
                  </p>
                </q-tab-panel>


              </q-tab-panels>
            </template>
          </q-splitter>

          <!--<q-form ref="myForm">
            <div class="row q-col-gutter-sm">
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
                    <q-input
                      v-model="prueba"
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
                    <q-input v-model="prueba" label="Telefono móvil" lazy-rules>
                      <template v-slot:prepend>
                        <q-icon name="phone_android" />
                      </template>
                    </q-input>
                  </q-item-section>
                </q-item> </q-card-section
              >
            </div>
          </q-form>-->
        </q-card>
      </q-card-section>

      <q-separator inset color="primary" />

      <OpcionCancelarGuardar @accionCerrar="close" @accionValidar="validate" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";

const tab = ref('propietario');
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
const validate = () => {
  const form = ref(null);
  if (form.value.validate()) {
    // Aquí puedes realizar la acción de guardar
    console.log("Formulario válido");
  } else {
    console.log("Formulario inválido");
  }
};
</script>
