<template>
  <q-page padding class="configuracion-ubicacion">
    <h1 class="q-mb-md text-h4">Configuración de Ubicaciones Geográficas</h1>

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
                filled
                v-model="paisForm.descripcion"
                label="Descripción *"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Por favor, ingrese una descripción']"
              />
              <q-input
                filled
                type="number"
                v-model.number="paisForm.id_configuracion"
                label="ID Configuración *"
                lazy-rules
                :rules="[ val => val !== null && val !== undefined || 'Por favor, ingrese un ID de configuración']"
              />
              <q-input
                filled
                v-model="paisForm.paridad"
                label="Paridad"
              />
              <q-checkbox v-model="paisForm.activo" label="Activo" />

              <q-card-actions align="right">
                <q-btn :label="paisForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="resetPaisForm" v-if="paisForm.id" />
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
              <q-item-section side top>
                <q-badge :color="pais.activo ? 'green' : 'red'" :label="pais.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs" />
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="editPais(pais)" :text-color="selectedPaisId === pais.id ? 'white' : 'primary'"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="deletePais(pais.id!)" :text-color="selectedPaisId === pais.id ? 'white' : 'negative'"/>
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
              <q-input filled v-model="estadoForm.descripcion" label="Descripción *" lazy-rules :rules="[ val => val && val.length > 0 || 'Ingrese una descripción']"/>
              <q-checkbox v-model="estadoForm.activo" label="Activo" />
              <q-card-actions align="right">
                <q-btn :label="estadoForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="resetEstadoForm" v-if="estadoForm.id" />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-list bordered separator v-if="selectedPaisId">
            <q-item-label header v-if="!estados.length && !loadingEstados">No hay estados para este país.</q-item-label>
            <q-item v-for="estado in estados" :key="estado.id" clickable v-ripple @click="selectEstado(estado.id!)" :active="selectedEstadoId === estado.id" active-class="bg-primary text-white">
              <q-item-section>{{ estado.descripcion }}</q-item-section>
              <q-item-section side top>
                <q-badge :color="estado.activo ? 'green' : 'red'" :label="estado.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs"/>
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="editEstado(estado)" :text-color="selectedEstadoId === estado.id ? 'white' : 'primary'"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="deleteEstado(estado.id!)" :text-color="selectedEstadoId === estado.id ? 'white' : 'negative'"/>
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
              <q-input filled v-model="municipioForm.descripcion" label="Descripción *" lazy-rules :rules="[ val => val && val.length > 0 || 'Ingrese una descripción']"/>
              <q-checkbox v-model="municipioForm.activo" label="Activo" />
              <q-card-actions align="right">
                <q-btn :label="municipioForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="resetMunicipioForm" v-if="municipioForm.id" />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-list bordered separator v-if="selectedEstadoId">
            <q-item-label header v-if="!municipios.length && !loadingMunicipios">No hay municipios para este estado.</q-item-label>
            <q-item v-for="municipio in municipios" :key="municipio.id" clickable v-ripple @click="selectMunicipio(municipio.id!)" :active="selectedMunicipioId === municipio.id" active-class="bg-primary text-white">
              <q-item-section>{{ municipio.descripcion }}</q-item-section>
              <q-item-section side top>
                <q-badge :color="municipio.activo ? 'green' : 'red'" :label="municipio.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs"/>
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="editMunicipio(municipio)" :text-color="selectedMunicipioId === municipio.id ? 'white' : 'primary'"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="deleteMunicipio(municipio.id!)" :text-color="selectedMunicipioId === municipio.id ? 'white' : 'negative'"/>
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
              <q-input filled v-model="coloniaForm.descripcion" label="Descripción *" lazy-rules :rules="[ val => val && val.length > 0 || 'Ingrese una descripción']"/>
              <q-checkbox v-model="coloniaForm.activo" label="Activo" />
              <q-card-actions align="right">
                <q-btn :label="coloniaForm.id ? 'Actualizar' : 'Guardar'" type="submit" color="primary"/>
                <q-btn label="Cancelar" type="button" color="grey" flat @click="resetColoniaForm" v-if="coloniaForm.id" />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-list bordered separator v-if="selectedMunicipioId">
            <q-item-label header v-if="!colonias.length && !loadingColonias">No hay colonias para este municipio.</q-item-label>
            <q-item v-for="colonia in colonias" :key="colonia.id"> <!-- No clickable, no active state for last level -->
              <q-item-section>{{ colonia.descripcion }}</q-item-section>
              <q-item-section side top>
                <q-badge :color="colonia.activo ? 'green' : 'red'" :label="colonia.activo ? 'Activo' : 'Inactivo'" class="q-mb-xs"/>
                <div class="q-gutter-xs">
                  <q-btn size="sm" flat dense round icon="edit" @click.stop="editColonia(colonia)" text-color="primary"/>
                  <q-btn size="sm" flat dense round icon="delete" @click.stop="deleteColonia(colonia.id!)" text-color="negative"/>
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
import { ref, reactive, onMounted, nextTick } from 'vue';
import { QForm, useQuasar } from 'quasar'; // Import QForm for potential ref usage, useQuasar for Notify

const $q = useQuasar(); // For Quasar plugins like Notify

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
  activo: boolean;
}

interface Municipio {
  id?: number;
  id_estado: number;
  descripcion: string;
  activo: boolean;
}

interface Colonia {
  id?: number;
  id_municipio: number;
  descripcion: string;
  activo: boolean;
}

// --- Estado Reactivo ---
const paises = ref<Pais[]>([]);
const estados = ref<Estado[]>([]);
const municipios = ref<Municipio[]>([]);
const colonias = ref<Colonia[]>([]);

const selectedPaisId = ref<number | null>(null);
const selectedEstadoId = ref<number | null>(null);
const selectedMunicipioId = ref<number | null>(null);

const loadingPaises = ref(false);
const loadingEstados = ref(false);
const loadingMunicipios = ref(false);
const loadingColonias = ref(false);

const paisForm = reactive({
  id: undefined as number | undefined,
  id_configuracion: 0,
  descripcion: '',
  paridad: '',
  activo: true,
});

const estadoForm = reactive({
  id: undefined as number | undefined,
  id_pais: 0,
  descripcion: '',
  activo: true,
});

const municipioForm = reactive({
  id: undefined as number | undefined,
  id_estado: 0,
  descripcion: '',
  activo: true,
});

const coloniaForm = reactive({
  id: undefined as number | undefined,
  id_municipio: 0,
  descripcion: '',
  activo: true,
});

// --- Mock API (Simulación) ---
let nextPaisId = 1;
let nextEstadoId = 1;
let nextMunicipioId = 1;
let nextColoniaId = 1;

let mockPaisesDB: Pais[] = [];
let mockEstadosDB: Estado[] = [];
let mockMunicipiosDB: Municipio[] = [];
let mockColoniasDB: Colonia[] = [];

async function fetchPaises() {
  loadingPaises.value = true;
  await new Promise(resolve => setTimeout(resolve, 200)); // Simula delay
  paises.value = [...mockPaisesDB];
  loadingPaises.value = false;
}

async function savePais() {
  if (!paisForm.descripcion || paisForm.id_configuracion === null || paisForm.id_configuracion === undefined) {
    // $q.notify({ type: 'negative', message: 'Descripción e ID Configuración son requeridos.' });
    alert('Descripción e ID Configuración son requeridos.'); // Placeholder
    return;
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  // $q.loading.show(); // Example of Quasar loading
  if (paisForm.id) {
    const index = mockPaisesDB.findIndex(p => p.id === paisForm.id);
    if (index !== -1) mockPaisesDB[index] = { ...paisForm, id: paisForm.id };
  } else {
    mockPaisesDB.push({ ...paisForm, id: nextPaisId++ });
  }
  resetPaisForm();
  // $q.loading.hide();
  fetchPaises();
}

async function deletePais(id: number) {
  await new Promise(resolve => setTimeout(resolve, 100));
  mockPaisesDB = mockPaisesDB.filter(p => p.id !== id);
  mockEstadosDB = mockEstadosDB.filter(e => e.id_pais !== id); // Cascading delete effect
  if (selectedPaisId.value === id) selectPais(null);
  fetchPaises();
}

function editPais(pais: Pais) { Object.assign(paisForm, pais); }
function resetPaisForm() {
  Object.assign(paisForm, { id: undefined, id_configuracion: 0, descripcion: '', paridad: '', activo: true });
}

async function fetchEstadosByPais(paisId: number | null) {
  loadingEstados.value = true;
  await new Promise(resolve => setTimeout(resolve, 200));
  estados.value = paisId === null ? [] : mockEstadosDB.filter(e => e.id_pais === paisId);
  loadingEstados.value = false;
}

async function saveEstado() {
  if (!estadoForm.descripcion) {
    // $q.notify({ type: 'negative', message: 'Descripción del estado es requerida.' });
    alert('Descripción del estado es requerida.'); // Placeholder
    return;
  }
  if (!selectedPaisId.value) { /* $q.notify({ type: 'warning', message: 'Seleccione un país primero.' }); */ alert('Seleccione un país primero.'); return; }
  estadoForm.id_pais = selectedPaisId.value;
  await new Promise(resolve => setTimeout(resolve, 100));
  // $q.loading.show();
  if (estadoForm.id) {
    const index = mockEstadosDB.findIndex(e => e.id === estadoForm.id);
    if (index !== -1) mockEstadosDB[index] = { ...estadoForm, id: estadoForm.id };
  } else {
    mockEstadosDB.push({ ...estadoForm, id: nextEstadoId++ });
  }
  resetEstadoForm();
  // $q.loading.hide();
  if (selectedPaisId.value) fetchEstadosByPais(selectedPaisId.value);
}

async function deleteEstado(id: number) {
  await new Promise(resolve => setTimeout(resolve, 100));
  mockEstadosDB = mockEstadosDB.filter(e => e.id !== id);
  mockMunicipiosDB = mockMunicipiosDB.filter(m => m.id_estado !== id); // Cascading
  if (selectedEstadoId.value === id) selectEstado(null);
  if (selectedPaisId.value) fetchEstadosByPais(selectedPaisId.value);
}

function editEstado(estado: Estado) { Object.assign(estadoForm, estado); }
function resetEstadoForm() {
  Object.assign(estadoForm, { id: undefined, descripcion: '', activo: true });
  // id_pais se mantiene implícitamente por el contexto del país seleccionado
}

async function fetchMunicipiosByEstado(estadoId: number | null) {
  loadingMunicipios.value = true;
  await new Promise(resolve => setTimeout(resolve, 200));
  municipios.value = estadoId === null ? [] : mockMunicipiosDB.filter(m => m.id_estado === estadoId);
  loadingMunicipios.value = false;
}

async function saveMunicipio() {
  if (!municipioForm.descripcion) {
    // $q.notify({ type: 'negative', message: 'Descripción del municipio es requerida.' });
    alert('Descripción del municipio es requerida.'); // Placeholder
    return;
  }
  if (!selectedEstadoId.value) { /* $q.notify({ type: 'warning', message: 'Seleccione un estado primero.' }); */ alert('Seleccione un estado primero.'); return; }
  municipioForm.id_estado = selectedEstadoId.value;
  await new Promise(resolve => setTimeout(resolve, 100));
  // $q.loading.show();
  if (municipioForm.id) {
    const index = mockMunicipiosDB.findIndex(m => m.id === municipioForm.id);
    if (index !== -1) mockMunicipiosDB[index] = { ...municipioForm, id: municipioForm.id };
  } else {
    mockMunicipiosDB.push({ ...municipioForm, id: nextMunicipioId++ });
  }
  resetMunicipioForm();
  // $q.loading.hide();
  if (selectedEstadoId.value) fetchMunicipiosByEstado(selectedEstadoId.value);
}

async function deleteMunicipio(id: number) {
  await new Promise(resolve => setTimeout(resolve, 100));
  mockMunicipiosDB = mockMunicipiosDB.filter(m => m.id !== id);
  mockColoniasDB = mockColoniasDB.filter(c => c.id_municipio !== id); // Cascading
  if (selectedMunicipioId.value === id) selectMunicipio(null);
  if (selectedEstadoId.value) fetchMunicipiosByEstado(selectedEstadoId.value);
}

function editMunicipio(municipio: Municipio) { Object.assign(municipioForm, municipio); }
function resetMunicipioForm() {
  Object.assign(municipioForm, { id: undefined, descripcion: '', activo: true });
}

async function fetchColoniasByMunicipio(municipioId: number | null) {
  loadingColonias.value = true;
  await new Promise(resolve => setTimeout(resolve, 200));
  colonias.value = municipioId === null ? [] : mockColoniasDB.filter(c => c.id_municipio === municipioId);
  loadingColonias.value = false;
}

async function saveColonia() {
  if (!coloniaForm.descripcion) {
    // $q.notify({ type: 'negative', message: 'Descripción de la colonia es requerida.' });
    alert('Descripción de la colonia es requerida.'); // Placeholder
    return;
  }
  if (!selectedMunicipioId.value) { /* $q.notify({ type: 'warning', message: 'Seleccione un municipio primero.' }); */ alert('Seleccione un municipio primero.'); return; }
  coloniaForm.id_municipio = selectedMunicipioId.value;
  await new Promise(resolve => setTimeout(resolve, 100));
  // $q.loading.show();
  if (coloniaForm.id) {
    const index = mockColoniasDB.findIndex(c => c.id === coloniaForm.id);
    if (index !== -1) mockColoniasDB[index] = { ...coloniaForm, id: coloniaForm.id };
  } else {
    mockColoniasDB.push({ ...coloniaForm, id: nextColoniaId++ });
  }
  resetColoniaForm();
  // $q.loading.hide();
  if (selectedMunicipioId.value) fetchColoniasByMunicipio(selectedMunicipioId.value);
}

async function deleteColonia(id: number) {
  await new Promise(resolve => setTimeout(resolve, 100));
  mockColoniasDB = mockColoniasDB.filter(c => c.id !== id);
  if (selectedMunicipioId.value) fetchColoniasByMunicipio(selectedMunicipioId.value);
}

function editColonia(colonia: Colonia) { Object.assign(coloniaForm, colonia); }
function resetColoniaForm() {
  Object.assign(coloniaForm, { id: undefined, descripcion: '', activo: true });
}

// --- Lógica de Selección y Carga ---
function selectPais(paisId: number | null) {
  selectedPaisId.value = paisId;
  // Resetear selecciones y datos de niveles inferiores
  selectedEstadoId.value = null;
  selectedMunicipioId.value = null;
  estados.value = []; municipios.value = []; colonias.value = [];

  // Resetear formularios de niveles inferiores
  resetEstadoForm(); resetMunicipioForm(); resetColoniaForm();

  if (paisId !== null) { fetchEstadosByPais(paisId); }
}

function selectEstado(estadoId: number | null) {
  selectedEstadoId.value = estadoId;
  selectedMunicipioId.value = null;

  municipios.value = []; colonias.value = [];

  resetMunicipioForm(); resetColoniaForm();

  if (estadoId !== null) { fetchMunicipiosByEstado(estadoId); }
}

function selectMunicipio(municipioId: number | null) {
  selectedMunicipioId.value = municipioId;

  colonias.value = [];
  resetColoniaForm();

  if (municipioId !== null) { fetchColoniasByMunicipio(municipioId); }
}

// --- Ciclo de Vida ---
onMounted(() => {
  fetchPaises();
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
