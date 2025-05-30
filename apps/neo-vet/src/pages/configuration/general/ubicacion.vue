<template>
  <q-page padding class="configuracion-ubicacion">
    <div class="q-mb-md">
      <EncabezadoGenericoPrincipal :tituloVentana="crudName" />
    </div>

    <div class="row q-col-gutter-md">
      <!-- Columna Países -->
      <div class="col-12 col-md-6 col-lg-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Países</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit.prevent="savePais" class="q-gutter-md">
              <div class="text-subtitle1">{{ paisForm.id ? 'Editar' : 'Agregar' }} País</div>
              <q-input
                v-model="paisForm.descripcion"
                label="Descripción *"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Por favor, ingrese una descripción']"
              />
              <q-input
                v-model="paisForm.paridad"
                label="Paridad"
              />
              <q-checkbox v-model="paisForm.activo" label="Activo" />

              <q-card-actions align="right">
                <q-btn :label="paisForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="() => resetPaisForm(paisForm)" v-if="paisForm.id"/>
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-list bordered separator>
            <q-item-label header v-if="!paises.length && !loadingPaises">No hay países cargados.</q-item-label>
            <q-item
              v-for="pais in paises"
              :key="pais.id"
              clickable
              v-ripple
              @click="selectPais(pais.id!)"
              :active="selectedPaisId === pais.id"
              active-class="bg-primary text-white"
            >
              <q-item-section>{{ pais.descripcion }}</q-item-section>
              <q-item-section side top v-if="pais.id">
                <q-badge :color="pais.activo ? 'green' : 'red'" :label="pais.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs" />
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="() => editPaisForm(pais, paisForm)" :text-color="selectedPaisId === pais.id ? 'white' : 'primary'"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="confirmDeletePais(pais.id!)" :text-color="selectedPaisId === pais.id ? 'white' : 'negative'"/>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Columna Estados -->
      <div class="col-12 col-md-6 col-lg-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Estados {{ selectedPaisId ? `(de ${paises.find(p=>p.id === selectedPaisId)?.descripcion || ''})` : '(Seleccione un País)' }}</div>
          </q-card-section>
          <q-card-section v-if="selectedPaisId" class="q-pt-none">
            <q-form @submit.prevent="saveEstado" class="q-gutter-md">
              <div class="text-subtitle1">{{ estadoForm.id ? 'Editar' : 'Agregar' }} Estado</div>
              <q-input v-model="estadoForm.descripcion" label="Descripción *" lazy-rules :rules="[ val => val && val.length > 0 || 'Ingrese una descripción']"/>
              <q-input
                v-model="estadoForm.paridad"
                label="Paridad"
              />
              <q-checkbox v-model="estadoForm.activo" label="Activo" />
              <q-card-actions align="right">
                <q-btn :label="estadoForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="() => resetEstadoForm(estadoForm)" v-if="estadoForm.id" />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-list bordered separator v-if="selectedPaisId">
            <q-item-label header v-if="!estados.length && !loadingEstados">No hay estados para este país.</q-item-label>
            <q-item v-for="estado in estados" :key="estado.id" clickable v-ripple @click="selectEstado(estado.id!)" :active="selectedEstadoId === estado.id" active-class="bg-primary text-white">
              <q-item-section >{{ estado.descripcion }}</q-item-section>
              <q-item-section side top v-if="estado.id">
                <q-badge :color="estado.activo ? 'green' : 'red'" :label="estado.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs"/>
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="() => editEstadoForm(estado, estadoForm)" :text-color="selectedEstadoId === estado.id ? 'white' : 'primary'"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="confirmDeleteEstado(estado.id!)" :text-color="selectedEstadoId === estado.id ? 'white' : 'negative'"/>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-section v-else>
            <div class="text-center text-grey">Seleccione un país para ver/agregar estados.</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Columna Municipios -->
      <div class="col-12 col-md-6 col-lg-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Municipios {{ selectedEstadoId ? `(de ${estados.find(e=>e.id === selectedEstadoId)?.descripcion || ''})` : '(Seleccione un Estado)' }}</div>
          </q-card-section>
          <q-card-section v-if="selectedEstadoId" class="q-pt-none">
            <q-form @submit.prevent="saveMunicipio" class="q-gutter-md">
              <div class="text-subtitle1">{{ municipioForm.id ? 'Editar' : 'Agregar' }} Municipio</div>
              <q-input v-model="municipioForm.descripcion" label="Descripción *" lazy-rules :rules="[ val => val && val.length > 0 || 'Ingrese una descripción']"/>
              <q-input
                v-model="municipioForm.paridad"
                label="Paridad"
              />
              <q-checkbox v-model="municipioForm.activo" label="Activo" />
              <q-card-actions align="right">
                <q-btn :label="municipioForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="() => resetMunicipioForm(municipioForm)" v-if="municipioForm.id" />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-list bordered separator v-if="selectedEstadoId">
            <q-item-label header v-if="!municipios.length && !loadingMunicipios">No hay municipios para este estado.</q-item-label>
            <q-item v-for="municipio in municipios" :key="municipio.id" clickable v-ripple @click="selectMunicipio(municipio.id!)" :active="selectedMunicipioId === municipio.id" active-class="bg-primary text-white">
              <q-item-section >{{ municipio.descripcion }}</q-item-section>
              <q-item-section side top v-if="municipio.id">
                <q-badge :color="municipio.activo ? 'green' : 'red'" :label="municipio.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs"/>
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="() => editMunicipioForm(municipio, municipioForm)" :text-color="selectedMunicipioId === municipio.id ? 'white' : 'primary'"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="confirmDeleteMunicipio(municipio.id!)" :text-color="selectedMunicipioId === municipio.id ? 'white' : 'negative'"/>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-section v-else>
            <div class="text-center text-grey">Seleccione un estado para ver/agregar municipios.</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Columna Colonias -->
      <div class="col-12 col-md-6 col-lg-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">Colonias {{ selectedMunicipioId ? `(de ${municipios.find(m=>m.id === selectedMunicipioId)?.descripcion || ''})` : '(Seleccione un Municipio)' }}</div>
          </q-card-section>
          <q-card-section v-if="selectedMunicipioId" class="q-pt-none">
            <q-form @submit.prevent="saveColonia" class="q-gutter-md">
              <div class="text-subtitle1">{{ coloniaForm.id ? 'Editar' : 'Agregar' }} Colonia</div>
              <q-input v-model="coloniaForm.descripcion" label="Descripción *" lazy-rules :rules="[ val => val && val.length > 0 || 'Ingrese una descripción']"/>
              <q-input
                v-model="coloniaForm.paridad"
                label="Paridad"
              />
              <q-checkbox v-model="coloniaForm.activo" label="Activo" />
              <q-card-actions align="right">
                <q-btn :label="coloniaForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="() => resetColoniaForm(coloniaForm)" v-if="coloniaForm.id" />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-list bordered separator v-if="selectedMunicipioId">
            <q-item-label header v-if="!colonias.length && !loadingColonias">No hay colonias para este municipio.</q-item-label>
            <q-item v-for="colonia in colonias" :key="colonia.id" > <!-- No clickable, no active state for last level -->
              <q-item-section >{{ colonia.descripcion }}</q-item-section>
              <q-item-section side top v-if="colonia.id">
                <q-badge :color="colonia.activo ? 'green' : 'red'" :label="colonia.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs"/>
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="() => editColoniaForm(colonia, coloniaForm)" text-color="primary"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="confirmDeleteColonia(colonia.id!)" text-color="negative"/>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-section v-else>
            <div class="text-center text-grey">Seleccione un municipio para ver/agregar colonias.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import EncabezadoGenericoPrincipal from '../../../components/EncabezadoGenericoPrincipal.vue';
import { useUbicacion } from '../../../../../../libs/shared/src/composables/useUbicacion'; // Ajusta la ruta a tu composable

const {
  paises,
  estados,
  municipios,
  colonias,
  selectedPaisId,
  selectedEstadoId,
  selectedMunicipioId,
  loadingPaises,
  loadingEstados,
  loadingMunicipios,
  loadingColonias,
  fetchPaisesAPI, savePaisAPI, deletePaisAPI, editPaisForm, resetPaisForm,
  fetchEstadosByPaisAPI, saveEstadoAPI, deleteEstadoAPI, editEstadoForm, resetEstadoForm,
  fetchMunicipiosByEstadoAPI, saveMunicipioAPI, deleteMunicipioAPI, editMunicipioForm, resetMunicipioForm,
  fetchColoniasByMunicipioAPI, saveColoniaAPI, deleteColoniaAPI, editColoniaForm, resetColoniaForm,
} = useUbicacion();

const $q = useQuasar(); // For Quasar plugins like Notify

const crudName: string = "Configuración de Ubicaciones Geográficas";

// --- Modelos ---
interface Pais {
  id?: number;
  id_configuracion: number;
  descripcion: string;
  paridad: string;
  activo: boolean; // Internally use boolean
}

interface Estado {
  id?: number;
  id_pais: number;
  descripcion: string;
  paridad: string;
  activo: boolean;
}

interface Municipio {
  id?: number;
  id_estado: number;
  descripcion: string;
  paridad: string;
  activo: boolean;
}

interface Colonia {
  id?: number;
  id_municipio: number;
  descripcion: string;
  paridad: string;
  activo: boolean;
}


const paisForm = reactive({
  id: undefined as number | undefined,
  id_configuracion: 0,
  descripcion: '',
  paridad: '',
  activo: true,
});

const estadoForm = reactive<Estado>({
  id: undefined as number | undefined,
  id_pais: 0,
  descripcion: '',
  paridad: '',
  activo: true,
});

const municipioForm = reactive<Municipio>({
  id: undefined as number | undefined,
  id_estado: 0,
  descripcion: '',
  paridad: '',
  activo: true,
});

const coloniaForm = reactive<Colonia>({
  id: undefined as number | undefined,
  id_municipio: 0,
  descripcion: '',
  paridad: '',
  activo: true,
});

// --- PAÍSES ---
async function savePais() {
  try {
    $q.loading.show();
    await savePaisAPI(paisForm);
    resetPaisForm(paisForm);
    await fetchPaisesAPI();
    $q.notify({ type: 'positive', message: 'País guardado correctamente.' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar el país.' });
  } finally {
    $q.loading.hide();
  }
}

async function confirmDeletePais(id: number) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de que desea eliminar este país? Esto eliminará también sus estados, municipios y colonias asociadas.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show();
      await deletePaisAPI(id);
      if (selectedPaisId.value === id) {
        selectPais(null); // Limpiar selección y datos dependientes
      }
      await fetchPaisesAPI();
      $q.notify({ type: 'positive', message: 'País eliminado.' });
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar el país.' });
    } finally {
      $q.loading.hide();
    }
  });
}

// --- ESTADOS ---
async function saveEstado() {
  if (!selectedPaisId.value) {
    $q.notify({ type: 'warning', message: 'Por favor, seleccione un país primero.' });
    return;
  }
  estadoForm.id_pais = selectedPaisId.value;
  try {
    $q.loading.show();
    await saveEstadoAPI(estadoForm);
    resetEstadoForm(estadoForm);
    if (selectedPaisId.value) await fetchEstadosByPaisAPI(selectedPaisId.value);
    $q.notify({ type: 'positive', message: 'Estado guardado.' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar estado.' });
  } finally {
    $q.loading.hide();
  }
}

async function confirmDeleteEstado(id: number) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de que desea eliminar este estado? Esto eliminará también sus municipios y colonias asociadas.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show();
      await deleteEstadoAPI(id);
      if (selectedEstadoId.value === id) {
        selectEstado(null);
      }
      if (selectedPaisId.value) await fetchEstadosByPaisAPI(selectedPaisId.value);
      $q.notify({ type: 'positive', message: 'Estado eliminado.' });
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar estado.' });
    } finally {
      $q.loading.hide();
    }
  });
}

// --- MUNICIPIOS ---
async function saveMunicipio() {
  if (!selectedEstadoId.value) {
    $q.notify({ type: 'warning', message: 'Por favor, seleccione un estado primero.' });
    return;
  }
  municipioForm.id_estado = selectedEstadoId.value;
  try {
    $q.loading.show();
    await saveMunicipioAPI(municipioForm);
    resetMunicipioForm(municipioForm);
    if (selectedEstadoId.value) await fetchMunicipiosByEstadoAPI(selectedEstadoId.value);
    $q.notify({ type: 'positive', message: 'Municipio guardado.' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar municipio.' });
  } finally {
    $q.loading.hide();
  }
}

async function confirmDeleteMunicipio(id: number) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de que desea eliminar este municipio? Esto eliminará también sus colonias asociadas.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show();
      await deleteMunicipioAPI(id);
      if (selectedMunicipioId.value === id) {
        selectMunicipio(null);
      }
      if (selectedEstadoId.value) await fetchMunicipiosByEstadoAPI(selectedEstadoId.value);
      $q.notify({ type: 'positive', message: 'Municipio eliminado.' });
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar municipio.' });
    } finally {
      $q.loading.hide();
    }
  });
}

// --- COLONIAS ---
async function saveColonia() {
  if (!selectedMunicipioId.value) {
    $q.notify({ type: 'warning', message: 'Por favor, seleccione un municipio primero.' });
    return;
  }
  coloniaForm.id_municipio = selectedMunicipioId.value;
  try {
    $q.loading.show();
    await saveColoniaAPI(coloniaForm);
    resetColoniaForm(coloniaForm);
    if (selectedMunicipioId.value) await fetchColoniasByMunicipioAPI(selectedMunicipioId.value);
    $q.notify({ type: 'positive', message: 'Colonia guardada.' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar colonia.' });
  } finally {
    $q.loading.hide();
  }
}

async function confirmDeleteColonia(id: number) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de que desea eliminar esta colonia?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show();
      await deleteColoniaAPI(id);
      if (selectedMunicipioId.value) await fetchColoniasByMunicipioAPI(selectedMunicipioId.value);
      $q.notify({ type: 'positive', message: 'Colonia eliminada.' });
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar colonia.' });
    } finally {
      $q.loading.hide();
    }
  });
}


// --- Lógica de Selección y Carga ---
function selectPais(paisId: number | null) {
  selectedPaisId.value = paisId;
  // Resetear selecciones y datos de niveles inferiores
  selectedEstadoId.value = null;
  selectedMunicipioId.value = null;
  estados.value = []; municipios.value = []; colonias.value = [];

  // Resetear formularios de niveles inferiores
  resetEstadoForm(estadoForm); resetMunicipioForm(municipioForm); resetColoniaForm(coloniaForm);

  if (paisId !== null) { fetchEstadosByPaisAPI(paisId); }
}

function selectEstado(estadoId: number | null) {
  selectedEstadoId.value = estadoId;
  selectedMunicipioId.value = null;

  municipios.value = []; colonias.value = [];

  resetMunicipioForm(municipioForm); resetColoniaForm(coloniaForm);

  if (estadoId !== null) { fetchMunicipiosByEstadoAPI(estadoId); }
}

function selectMunicipio(municipioId: number | null) {
  selectedMunicipioId.value = municipioId;

  colonias.value = [];
  resetColoniaForm(coloniaForm);

  if (municipioId !== null) { fetchColoniasByMunicipioAPI(municipioId); }
}

// --- Ciclo de Vida ---
onMounted(() => {
  fetchPaisesAPI();
});

</script>

<style lang="scss" scoped>
.configuracion-ubicacion {
  // Puedes añadir estilos personalizados aquí si es necesario,
  // pero intenta usar las clases de utilidad de Quasar tanto como sea posible.
  // Ejemplo:
  // .q-card { min-height: 400px; }
}
</style>
