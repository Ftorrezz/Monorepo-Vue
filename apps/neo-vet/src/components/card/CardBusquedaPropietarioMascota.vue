<template>
  <div class="row q-col-gutter-md full-width q-pl-md">
    <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12 q-pa-none">
      <q-card class="custom-card full-width">
        <q-card-section class="bg-primary text-white q-py-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1">
              <q-icon name="list" size="sm" class="q-mr-sm" />
              Lista de Propietarios
            </div>
            <q-btn
              round
              flat
              color="white"
              size="sm"
              icon="add"
              class="floating-btn"
              @click="abrirDialogoPropietario"
            >
              <q-tooltip>Agregar Propietario</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-table
          :rows="rows"
          :columns="columns"
          row-key="name"
          flat
          bordered
        >
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
      </q-card>
    </div>

    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12 q-pa-none">
      <q-card class="custom-card full-width">
        <q-card-section class="bg-secondary text-white q-py-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1">
              <q-icon name="pets" size="sm" class="q-mr-sm" />
              Lista de Mascotas
            </div>
            <q-btn
              round
              flat
              color="white"
              size="sm"
              icon="add"
              class="floating-btn"
              @click="abrirDialogoMascota"
            >
              <q-tooltip>Agregar Mascota</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-table
          :rows="rows"
          :columns="columnsMascota"
          row-key="name"
          flat
          bordered
        >
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
      </q-card>
    </div>
  </div>

  <DialogAgregarPropietario v-if="mostrarDialogoPropietario" />
  <DialogAgregarMascota v-if="mostrarDialogoMascota" />
</template>

<script setup>
import { ref } from "vue";
import DialogAgregarPropietario from "../dialog/DialogAgregarPropietario.vue";
import DialogAgregarMascota from "../dialog/DialogAgregarMascota.vue";

const mostrarDialogoPropietario = ref(false);
const mostrarDialogoMascota = ref(false);

const abrirDialogoPropietario = () => {
  mostrarDialogoPropietario.value = true;
};

const abrirDialogoMascota = () => {
  mostrarDialogoMascota.value = true;
};

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
});

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
    name: "email",
    align: "left",
    label: "Correo electrónico",
    field: "perfildescripcion",
    sortable: true,
  },
  {
    name: "telefonomovil",
    label: "Teléfono móvil",
    field: "activo",
    sortable: true,
    align: "center",
  },
  {
    name: "action",
    align: "center",
    field: "action",
    sortable: false,
  },
]);

const columnsMascota = ref([
  {
    name: "nombre",
    align: "left",
    label: "Nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "historiaclinica",
    align: "left",
    label: "Historia Clínica",
    field: "historiaclinica",
    sortable: true,
  },
  {
    name: "action",
    align: "center",
    field: "action",
    sortable: false,
  },
]);
</script>

<style scoped>
.custom-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  margin: 0;
}

.custom-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.full-width {
  width: 100%;
  margin: 0;
}

.floating-btn {
  transform: translateY(-2px);
  margin-right: -8px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.floating-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.floating-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.q-pl-md {
  padding-left: 16px !important;
}

/* Ajuste del espaciado entre columnas */
.q-col-gutter-md > * {
  padding: 6px !important;
}
</style>
