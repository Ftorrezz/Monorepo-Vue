<template>
  <q-card bordered elevated>
        <q-card-section class="text-h6">
          <!-- Encabezado del formulario -->
          {{ props.crudName }}
        </q-card-section>

        <q-separator inset color="primary"></q-separator>

        <!-- Formulario -->
        <q-card-section>
          <q-form ref="myForm">
            <!-- Aquí irían los campos del formulario -->

            <template v-for="(field, index) in formFields" :key="index">
              <template v-if="field.component === 'q-input'">
                <!-- Campo de tipo q-input -->
                <q-input
                  v-model="editedItem[field.name]"
                  :label="field.label"
                  :class="field.classes"
                  lazy-rules
                  :rules="field.rules"
                />
              </template>
              <template v-else-if="field.component === 'q-checkbox'">
                <!-- Campo de tipo q-checkbox -->
                <q-checkbox
                  v-model="editedItem[field.name]"
                  :label="field.label"
                  :class="field.classes"
                  :true-value="'S'"
                  :false-value="'N'"
                />
              </template>
              <!-- Agrega otros tipos de campos según sea necesario -->
            </template>
          </q-form>
        </q-card-section>

      </q-card>
</template>

<script setup lang="ts">
import OpcionCancelarGuardar from "./OpcionCancelarGuardar.vue";

   const props = defineProps({
     modelName: String,
     crudName: String,
     formFields: [],
     editedItem: {}
  });

</script>
