<template>
  <q-dialog v-model="mostrarDialogo" persistent>
    <q-card
      bordered
      elevated

      class="fixed-card"
    >
      <q-bar class="bg-primary text-white">
        <q-icon name="person" />
        <div>Propietario</div>

        <q-space />

        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <q-tabs
          v-model="tab"
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

        <q-separator />

        <q-tab-panels v-model="tab" animated class="flex-panels">
          <q-tab-panel name="general" class="flex-panel-content">
            <q-form ref="formPropietario">
              <div class="row q-col-gutter-sm">
                <q-card-section class="row q-col-gutter-xs">
                  <q-item class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input 
                        v-model="propietario.primerapellido" 
                        label="Primer Apellido *"
                        :rules="[val => !!val || 'El primer apellido es requerido']"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input 
                        v-model="propietario.segundoapellido" 
                        label="Segundo Apellido"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input 
                        v-model="propietario.nombre" 
                        label="Nombres *"
                        :rules="[val => !!val || 'El nombre es requerido']"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-select
                        v-model="propietario.id_genero"
                        :options="opcionesGenero"
                        label="Género"
                        emit-value
                        map-options
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-date
                        v-model="propietario.fechanacimiento"
                        label="Fecha de Nacimiento"
                        mask="YYYY-MM-DD"
                        @update:model-value="calcularEdad"
                      >
                        <div class="row items-center justify-end">
                          <q-input
                            v-model="propietario.edadcalculada"
                            label="Edad"
                            readonly
                            dense
                            class="q-ml-sm"
                          />
                        </div>
                      </q-date>
                    </q-item-section>
                  </q-item>
                </q-card-section>
              </div>
            </q-form>
          </q-tab-panel>

          <q-tab-panel name="adicional">
            <q-form ref="formAdicional">
              <div class="row q-col-gutter-sm">
                <q-card-section class="row q-col-gutter-xs">
                  <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-select
                        v-model="propietario.id_estadocivil"
                        :options="opcionesEstadoCivil"
                        label="Estado Civil"
                        emit-value
                        map-options
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-select
                        v-model="propietario.id_ocupacion"
                        :options="opcionesOcupacion"
                        label="Ocupación"
                        emit-value
                        map-options
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-select
                        v-model="propietario.id_escolaridad"
                        :options="opcionesEscolaridad"
                        label="Escolaridad"
                        emit-value
                        map-options
                      />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-12">
                    <q-item-section>
                      <q-input
                        v-model="propietario.observacion"
                        type="textarea"
                        label="Observaciones"
                        rows="3"
                      />
                    </q-item-section>
                  </q-item>
                </q-card-section>
              </div>
            </q-form>
          </q-tab-panel>

          <q-tab-panel name="facturacion">
            <q-form ref="formFacturacion">
              <div class="row q-col-gutter-sm">
                <q-card-section class="row q-col-gutter-xs">
                  <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input
                        v-model="propietario.claveaccesoweb"
                        label="Clave de Acceso Web"
                        type="password"
                      >
                        <template v-slot:append>
                          <q-icon
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd"
                          />
                        </template>
                      </q-input>
                    </q-item-section>
                  </q-item>
                </q-card-section>
              </div>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator inset color="primary" />

      <OpcionCancelarGuardar @accionCerrar="close" @accionValidar="validate" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";

interface Propietario {
  id?: number;
  id_sitio: number;
  id_grupopoblacion: number;
  nombre: string;
  primerapellido: string;
  segundoapellido?: string;
  id_raza?: number;
  id_religion?: number;
  id_estadocivil?: number;
  id_ocupacion?: number;
  id_escolaridad?: number;
  id_genero?: number;
  fechanacimiento?: Date;
  edadcalculada?: string;
  observacion?: string;
  fechaalta?: Date;
  claveaccesoweb?: string;
  estado: string;
  fechanacimientooffset?: number;
  codigoverificacion?: string;
}

const tab = ref("general");
const formPropietario = ref(null);
const formAdicional = ref(null);
const formFacturacion = ref(null);
const mostrarDialogo = ref(true);
const isPwd = ref(true);

const propietario = ref<Propietario>({
  id_sitio: 1, // Valor por defecto
  id_grupopoblacion: 1, // Valor por defecto
  nombre: '',
  primerapellido: '',
  estado: 'A', // Activo por defecto
});

// Opciones para los selects (deberían venir de una API)
const opcionesGenero = ref([
  { label: 'Masculino', value: 1 },
  { label: 'Femenino', value: 2 }
]);

const opcionesEstadoCivil = ref([
  { label: 'Soltero', value: 1 },
  { label: 'Casado', value: 2 }
]);

const opcionesOcupacion = ref([
  { label: 'Empleado', value: 1 },
  { label: 'Independiente', value: 2 }
]);

const opcionesEscolaridad = ref([
  { label: 'Primaria', value: 1 },
  { label: 'Secundaria', value: 2 }
]);

const calcularEdad = () => {
  if (propietario.value.fechanacimiento) {
    const hoy = new Date();
    const fechaNac = new Date(propietario.value.fechanacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    propietario.value.edadcalculada = `${edad} años`;
  }
};

const validate = async () => {
  let isValid = true;
  
  if (tab.value === 'general') {
    isValid = await formPropietario.value?.validate();
  } else if (tab.value === 'adicional') {
    isValid = await formAdicional.value?.validate();
  } else if (tab.value === 'facturacion') {
    isValid = await formFacturacion.value?.validate();
  }

  if (isValid) {
    // Aquí iría la lógica para guardar el propietario
    console.log('Guardando propietario:', propietario.value);
  }
};

const close = () => {
  mostrarDialogo.value = false;
};
</script>
<style scoped>

.fixed-card {
  width: 800px; /* Ancho fijo */
 /* height: 600px; /* Alto fijo */
  max-width: 100%; /* Asegura que no exceda el ancho de la pantalla */
  max-height: 100%; /* Asegura que no exceda el alto de la pantalla */
  display: flex;
  flex-direction: column;
}

.flex-panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.flex-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto; /* Permite desplazamiento si el contenido es más grande */
}
</style>
