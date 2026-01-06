<template>
  <q-page padding>
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="business" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Proveedores</div>
            <div class="text-caption">Gestiona los proveedores de productos del inventario</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            outlined
            dense
            placeholder="Buscar proveedor..."
            class="col-12 col-md-4"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-space />

          <q-btn
            color="primary"
            icon="add"
            label="Nuevo Proveedor"
            @click="abrirFormulario()"
            unelevated
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="proveedoresFiltrados"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :pagination="paginacion"
          dense
        >
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-badge 
                :color="props.value ? 'positive' : 'grey'" 
                :label="props.value ? 'Activo' : 'Inactivo'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn flat dense round icon="edit" color="primary" @click="editarProveedor(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              
              <q-btn
                flat dense round
                :icon="props.row.activo ? 'block' : 'check_circle'"
                :color="props.row.activo ? 'negative' : 'positive'"
                @click="toggleEstado(props.row)"
              >
                <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal Formulario -->
    <q-dialog v-model="mostrarFormulario" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="row q-gutter-md">
            <q-input
              v-model="proveedorTemporal.nombre"
              label="Nombre *"
              outlined dense
              class="col"
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="proveedorTemporal.razonSocial"
              label="Razón Social"
              outlined dense
              class="col"
            />
          </div>

          <div class="row q-gutter-md">
            <q-input
              v-model="proveedorTemporal.rfc"
              label="RFC"
              outlined dense
              class="col"
              maxlength="13"
            />
            <q-input
              v-model="proveedorTemporal.telefono"
              label="Teléfono"
              outlined dense
              class="col"
              mask="(##) #### ####"
            />
          </div>

          <div class="row q-gutter-md">
            <q-input
              v-model="proveedorTemporal.email"
              label="Email"
              outlined dense
              class="col"
              type="email"
            />
            <q-input
              v-model="proveedorTemporal.contacto"
              label="Persona de Contacto"
              outlined dense
              class="col"
            />
          </div>

          <q-input
            v-model="proveedorTemporal.direccion"
            label="Dirección"
            outlined dense
            type="textarea"
            rows="2"
          />

          <q-input
            v-model="proveedorTemporal.notas"
            label="Notas"
            outlined dense
            type="textarea"
            rows="2"
          />

          <q-toggle
            v-if="proveedorEditando"
            v-model="proveedorTemporal.activo"
            label="Proveedor activo"
            color="positive"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarFormulario" />
          <q-btn 
            color="primary"
            :label="proveedorEditando ? 'Guardar Cambios' : 'Crear Proveedor'"
            @click="guardarProveedor"
            :loading="guardando"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import inventarioService, { Proveedor } from 'src/services/inventario.service';

const $q = useQuasar();

const proveedores = ref<Proveedor[]>([]);
const filtro = ref('');
const cargando = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const proveedorEditando = ref<Proveedor | null>(null);

const proveedorTemporal = ref<Partial<Proveedor>>({
  nombre: '',
  razonSocial: '',
  rfc: '',
  telefono: '',
  email: '',
  direccion: '',
  contacto: '',
  notas: '',
  activo: true
});

const proveedoresFiltrados = computed(() => {
  if (!filtro.value) return proveedores.value;
  const busqueda = filtro.value.toLowerCase();
  return proveedores.value.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) ||
    p.razonSocial?.toLowerCase().includes(busqueda) ||
    p.rfc?.toLowerCase().includes(busqueda) ||
    p.contacto?.toLowerCase().includes(busqueda)
  );
});

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'razonSocial', label: 'Razón Social', field: 'razonSocial', align: 'left' as const },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'center' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'contacto', label: 'Contacto', field: 'contacto', align: 'left' as const },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const }
];

const paginacion = ref({ rowsPerPage: 10 });

const cargarProveedores = async () => {
  cargando.value = true;
  try {
    const response = await inventarioService.proveedores.getAll();
    proveedores.value = response.data;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar proveedores' });
  } finally {
    cargando.value = false;
  }
};

const abrirFormulario = (proveedor?: Proveedor) => {
  if (proveedor) {
    proveedorEditando.value = proveedor;
    proveedorTemporal.value = { ...proveedor };
  } else {
    proveedorEditando.value = null;
    proveedorTemporal.value = {
      nombre: '',
      razonSocial: '',
      rfc: '',
      telefono: '',
      email: '',
      direccion: '',
      contacto: '',
      notas: '',
      activo: true
    };
  }
  mostrarFormulario.value = true;
};

const editarProveedor = (proveedor: Proveedor) => abrirFormulario(proveedor);

const cancelarFormulario = () => {
  mostrarFormulario.value = false;
  proveedorEditando.value = null;
};

const guardarProveedor = async () => {
  if (!proveedorTemporal.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es requerido' });
    return;
  }

  guardando.value = true;
  try {
    if (proveedorEditando.value) {
      await inventarioService.proveedores.update(proveedorEditando.value.id, proveedorTemporal.value);
      $q.notify({ type: 'positive', message: 'Proveedor actualizado correctamente' });
    } else {
      await inventarioService.proveedores.create(proveedorTemporal.value);
      $q.notify({ type: 'positive', message: 'Proveedor creado correctamente' });
    }
    await cargarProveedores();
    cancelarFormulario();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar proveedor' });
  } finally {
    guardando.value = false;
  }
};

const toggleEstado = async (proveedor: Proveedor) => {
  const accion = proveedor.activo ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de ${accion} el proveedor "${proveedor.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inventarioService.proveedores.update(proveedor.id, { activo: !proveedor.activo });
      $q.notify({ type: 'positive', message: `Proveedor ${accion === 'desactivar' ? 'desactivado' : 'activado'}` });
      await cargarProveedores();
    } catch (error) {
      $q.notify({ type: 'negative', message: `Error al ${accion} proveedor` });
    }
  });
};

onMounted(() => cargarProveedores());
</script>
