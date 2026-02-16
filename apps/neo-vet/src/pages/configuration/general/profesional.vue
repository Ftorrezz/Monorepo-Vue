<template>
  <div class="q-pa-md">
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="medical_services" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Profesionales</div>
            <div class="text-subtitle2 opacity-80">
              Gestión de médicos y personal de salud
            </div>
          </div>
          <div class="col-auto">
            <q-btn 
              flat
              round
              icon="add_circle"
              @click="abrirDialogoAgregar"
              size="md"
            >
              <q-tooltip>Agregar Profesional</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-table
        :rows="profesionales"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :filter="filter"
        no-data-label="No se encontraron profesionales"
        class="modern-table"
      >
        <template v-slot:top>
          <div class="row full-width items-center q-gutter-md">
            <q-input
              outlined
              dense
              debounce="300"
              v-model="filter"
              placeholder="Buscar..."
              class="col-12 col-md-4"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.activo === 'S' ? 'positive' : 'grey'"
              :label="props.row.activo === 'S' ? 'Activo' : 'Inactivo'"
              text-color="white"
              size="sm"
              dense
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="editarProfesional(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
             <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="eliminarItem(props.row)"
                size="sm"
                :disable="props.row.activo === 'N'"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <DialogAgregarProfesional
      v-if="mostrarDialogo"
      :profesionalData="profesionalSeleccionado"
      @cerrar="cerrarDialogo"
      @profesional-guardado="cargarProfesionales"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { profesionalService, Profesional } from 'src/services/profesional.service';
import DialogAgregarProfesional from 'src/components/dialog/DialogAgregarProfesional.vue';
import PeticionService from "src/services/peticion.service";
import NdAlertasControl from "src/controles/alertas.control";

const $q = useQuasar();
const profesionales = ref<Profesional[]>([]);
const loading = ref(false);
const filter = ref('');
const mostrarDialogo = ref(false);
const profesionalSeleccionado = ref<Profesional | null>(null);
const peticionService = new PeticionService();

const columns: any[] = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' },
  { name: 'nombre_completo', label: 'Nombre Completo', 
    field: (row: Profesional) => `${row.nombre} ${row.primerapellido || ''} ${row.segundoapellido || ''}`, 
    align: 'left', sortable: true 
  },
  { name: 'cedula', label: 'Cédula', field: 'cedula', align: 'left', sortable: true },
  { name: 'tipoprofesional', label: 'Tipo', field: (row: any) => row.tipoprofesional?.nombre || row.id_tipoprofesional, align: 'left', sortable: true },
  { name: 'telefono1', label: 'Teléfono', field: 'telefono1', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
];

const cargarProfesionales = async () => {
  loading.value = true;
  try {
    const data = await profesionalService.getProfesionales();
    profesionales.value = data as Profesional[];
  } catch (error) {
    console.error('Error al cargar profesionales:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de profesionales'
    });
  } finally {
    loading.value = false;
  }
};

const abrirDialogoAgregar = () => {
  profesionalSeleccionado.value = null; // Resetear para nuevo
  mostrarDialogo.value = true;
};

const editarProfesional = (profesional: Profesional) => {
  profesionalSeleccionado.value = { ...profesional };
  mostrarDialogo.value = true;
};

 const eliminarItem = async (row: any) => {

      try {
        const resultado = await peticionService.eliminar(
          "profesional",
          Object.assign({}, row),
          true,
          "Profesional"
        );

        if (resultado) {
          await cargarProfesionales();
        }
      } catch (error) {
        console.error(error);
        const alertas = new NdAlertasControl();
        alertas.mostrarMensaje(
          "error",
          "Eliminar",
          "No fue posible eliminar el registro."
        );
      }
    };


const cerrarDialogo = () => {
  mostrarDialogo.value = false;
};

onMounted(() => {
  cargarProfesionales();
});
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}
.opacity-80 {
  opacity: 0.8;
}

</style>
