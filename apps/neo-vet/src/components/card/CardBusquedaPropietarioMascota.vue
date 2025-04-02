<template>

  <div class="q-pa-xs col-lg-8 col-md-6 col-sm-12 col-xs-12">
    <q-table title="Treats" :rows="rows" :columns="columns" row-key="name">
      <template v-slot:top>
        <q-space />
        <q-btn round color="secondary" icon="add" @click="addItem" />
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left">
              This is expand slot for row above: {{ props.row.name }}.
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>

  <div class="q-pa-xs col-lg-4 col-md-6 col-sm-12 col-xs-12">
    <q-table title="Treats" :rows="rows" :columns="columnsMascota" row-key="name">
      <template v-slot:top>
        <q-space />
        <q-btn round color="secondary" icon="add" @click="addItem" />
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left">
              This is expand slot for row above: {{ props.row.name }}.
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
<!--<template>
  <div class="col-lg-12 col-md-6 col-sm-12 col-xs-12">
    <q-card class="q-mt-md" borderead>
      <q-card-section class="q-mt-xs" horizontal>
        <q-card-section class="row q-col-gutter-xs">
          <q-item>
            <q-item-section>
              <q-input
                outlined
                v-model="text"
                label="Nombres"
                stack-label
                :dense="true"
              />
            </q-item-section>
          </q-item>

          <q-input
            outlined
            v-model="text"
            label="Nombres"
            stack-label
            :dense="true"
          />

          <q-input
            outlined
            v-model="text"
            label="Telefono"
            stack-label
            :dense="true"
          />
        </q-card-section>
      </q-card-section>

      <q-card-actions>
        <q-btn
          color="grey"
          round
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <q-card-section class="text-subitle2">
            {{ lorem }}
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>-->

<script setup>
import { ref } from "vue";

const rows = []

const columns = ref([
  {
    name: "primerapellido",
    align: "left",
    label: "Primer Apellido",
    field: "primerapellido",
    sortable: true,
  },
  {
    name: "segundoapellido",
    align: "left",
    label: "Segundo Apellido",
    field: "segundoapellido",
    sortable: true,
  },
  {
    name: "nombre",
    align: "left",
    label: "Nombres",
    field: "nombre",
    sortable: true,
  },
  {
    name: "genero",
    align: "left",
    label: "Género",
    field: "genero",
    sortable: true,
  },

  {
    name: "email",
    align: "left",
    label: "Correo electrónico",
    field: "perfildescripcion",
    sortable: true,
  },
  {
    name: "telefonomovil",
    label: "Telefono movil",
    field: "activo",
    sortable: true,
    align: "center",
  },
]);

const columnsMascota = ref([
  {
    name: "primerapellido",
    align: "left",
    label: "Primer Apellido",
    field: "primerapellido",
    sortable: true,
  },
  {
    name: "segundoapellido",
    align: "left",
    label: "Segundo Apellido",
    field: "segundoapellido",
    sortable: true,
  },

]);

const expanded = ref(false);
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 350px
</style>
