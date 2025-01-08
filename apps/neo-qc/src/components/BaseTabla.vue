<template>
  <q-table
    :rows="tableData"
    :columns="tableColumns"
    row-key="id"
    :dense="$q.screen.lt.md"
    title=""
    :filter="filter"
    no-data-label="No se encontraron registros para mostrar"
    rows-per-page-label="Registros por página"
    :pagination="{ rowsPerPage: 7 }"
  >
    <template v-slot:top>
      <q-input
        outlined
        dense
        debounce="600"
        v-model="filter"
        placeholder="Buscar"
        style="width: 400px"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
        <q-tooltip>ingrese el texto que desea buscar</q-tooltip>
      </q-input>

      <q-space />
      <q-btn
        color="primary"
        icon-right="archive"
        label="Exportar a .csv"
        no-caps
        align="right"
        @click="exportTable"
      >
        <q-tooltip
          >exportar información de la tabla en un archivo .csv</q-tooltip
        >
      </q-btn>
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div class="q-gutter-sm">
          <q-btn
            round
            color="primary"
            icon="edit"
            @click="updateItem(props)"
            size="11px"
          >
            <q-tooltip>editar información {{ crudName }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            color="negative"
            icon="delete"
            @click="deleteItem(props)"
            size="11px"
            :disabled="
              props.row.activo == 'S'
                ? false
                : props.row.activo == 'N'
                ? true
                : false
            "
          >
            <q-tooltip>eliminar registro {{ crudName }}</q-tooltip>
          </q-btn>
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-activo="props">
      <q-td :props="props">
        <q-chip
          :color="
            props.row.activo == 'S'
              ? 'positive'
              : props.row.activo == 'N'
              ? 'grey'
              : 'grey'
          "
          :label="
            props.row.activo == 'S'
              ? 'Activo'
              : props.row.activo == 'N'
              ? 'Inactivo'
              : 'Activo'
          "
          text-color="white"
          class="text-weight-bolder"
          style="width: 80px"
          align="rigth"
        >
        </q-chip>
      </q-td>
    </template>

    <!-- Aquí irían las columnas de la tabla -->
  </q-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([]);
  const tableColumns = ref([]);
  let filter = ref("");

</script>

