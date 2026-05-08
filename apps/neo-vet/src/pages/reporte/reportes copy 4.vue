<template>
  <q-page padding class="reports-container bg-grey-2">
    <div class="row q-col-gutter-lg">
      
      <!-- Menú Lateral -->
      <div class="col-12 col-md-3">
        <q-card flat class="sidebar-card shadow-1">
          <div class="q-pa-md border-bottom bg-grey-1">
            <div class="text-subtitle1 text-weight-bolder text-primary">Reportes</div>
            <div class="text-caption text-grey-6">Catálogo de informes</div>
          </div>
          
          <q-list padding class="q-py-md">
            <template v-for="(group, category) in reportesAgrupados" :key="category">
              <q-item-label header class="text-overline text-grey-8 q-mt-sm">{{ category }}</q-item-label>
              
              <q-item
                v-for="reporte in group"
                :key="reporte.IDENTIFICADOR"
                clickable
                v-ripple
                :active="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR"
                active-class="active-report-item"
                class="report-item"
                @click="seleccionarReporte(reporte)"
              >
                <q-item-section avatar>
                  <q-icon :name="reporte.ICONO || 'description'" :color="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR ? 'primary' : 'grey-5'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ reporte.TITULO }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR">
                  <q-icon name="chevron_right" color="primary" />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card>
      </div>

      <!-- Panel de Control y Visor -->
      <div class="col-12 col-md-9 column q-gutter-y-md">
        
        <!-- Estado Vacío -->
        <q-card v-if="!selectedReport" flat class="col flex flex-center bg-transparent border-dashed">
          <div class="text-center text-grey-6">
            <q-icon name="analytics" size="5rem" color="grey-4" />
            <div class="text-h6 q-mt-md">Seleccione un reporte para comenzar</div>
          </div>
        </q-card>

        <template v-else>
          <!-- Cabecera y Filtros Compactos -->
          <q-card flat class="shadow-1">
            <q-card-section class="q-pa-md bg-white">
              <div class="row items-center justify-between q-mb-md">
                <div class="row items-center">
                  <q-btn flat round icon="arrow_back" color="grey-7" class="q-mr-sm md-hide lg-hide" @click="selectedReport = null" />
                  <div>
                    <div class="text-h6 text-weight-bold">{{ selectedReport.TITULO }}</div>
                    <div class="text-caption text-grey-7">{{ selectedReport.DESCRIPCION }}</div>
                  </div>
                </div>
                <div class="row q-gutter-sm">
                  <q-btn unelevated color="primary" icon="play_circle" label="Generar" :loading="isLoading" @click="generarReporte('pdf')" />
                  <q-btn outline color="grey-7" icon="download" label="Excel" :loading="loadingExcel" @click="generarReporte('excel')" />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-sm items-end">
                <div v-for="filtro in selectedReport.FILTROS" :key="filtro.id" class="col-12 col-sm-4 col-md-3">
                  <div class="text-caption text-grey-8 q-mb-xs text-weight-bold">{{ filtro.label }}</div>
                  
                  <q-input
                    v-if="filtro.type === 'date'"
                    v-model="filtro.value"
                    type="date"
                    outlined
                    dense
                    bg-color="white"
                  />

                  <q-select
                    v-else-if="filtro.type === 'select'"
                    v-model="filtro.value"
                    :options="filtro.options"
                    outlined
                    dense
                    emit-value
                    map-options
                    bg-color="white"
                  />

                  <q-input
                    v-else
                    v-model="filtro.value"
                    outlined
                    dense
                    bg-color="white"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Visor de PDF -->
          <q-card flat class="col shadow-1 overflow-hidden column no-wrap bg-grey-4">
            <div v-if="reporteBase64" class="col column no-wrap">
              <div class="q-pa-sm bg-white border-bottom row items-center">
                <q-icon name="visibility" color="primary" class="q-mr-sm" />
                <div class="text-caption text-weight-bold">Vista Previa</div>
                <q-space />
                <q-btn flat dense round icon="print" color="grey-7" @click="imprimirReporte" />
                <q-btn flat dense round icon="download" color="grey-7" @click="descargarReporte" />
              </div>
              <div class="col flex flex-center scroll">
                <iframe
                  v-if="reporteSrc"
                  ref="iframeReporte"
                  :src="reporteSrc"
                  frameborder="0"
                  class="full-width"
                  style="height: 850px; background: white;"
                ></iframe>
              </div>
            </div>
            
            <div v-else class="col flex flex-center text-grey-5">
              <div class="text-center">
                <q-icon name="picture_as_pdf" size="4rem" />
                <p>Presione "Generar" para ver el documento aquí</p>
              </div>
            </div>

            <q-inner-loading :showing="isLoading">
              <q-spinner-oval size="50px" color="primary" />
            </q-inner-loading>
          </q-card>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useLoading } from "../../../../../libs/shared/src/composables/useLoading";
import { reporteService } from '../../services/reporte.service';

const $q = useQuasar();
const { showLoading, hideLoading } = useLoading();

const search = ref('');
const catalogoReportes = ref([]);
const selectedReport = ref(null);
const reporteBase64 = ref(null);
const objectURL = ref(null);
const iframeReporte = ref(null);

const isLoading = ref(false);
const loadingExcel = ref(false);

const reportesAgrupados = computed(() => {
  let list = catalogoReportes.value;
  if (search.value) {
    const s = search.value.toLowerCase();
    list = list.filter(r => r.TITULO.toLowerCase().includes(s));
  }
  
  return list.reduce((acc, reporte) => {
    const category = reporte.CATEGORIA || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(reporte);
    return acc;
  }, {});
});

const reporteSrc = computed(() => objectURL.value || '');

async function cargarCatalogo() {
  try {
    isLoading.value = true;
    catalogoReportes.value = await reporteService.getCatalogo();
  } catch (error) {
    console.error("Error al cargar catálogo:", error);
  } finally {
    isLoading.value = false;
  }
}

function seleccionarReporte(reporte) {
  selectedReport.value = JSON.parse(JSON.stringify(reporte));
  selectedReport.value.FILTROS.forEach(f => {
    if (f.default !== undefined) f.value = f.default;
    else if (f.type === 'date') f.value = new Date().toISOString().substr(0, 10);
    else f.value = '';
  });
  
  reporteBase64.value = null;
  if (objectURL.value) {
    URL.revokeObjectURL(objectURL.value);
    objectURL.value = null;
  }
}

async function generarReporte(formato = 'pdf') {
  if (!selectedReport.value) return;
  if (typeof formato !== 'string') formato = 'pdf';

  isLoading.value = (formato === 'pdf');
  loadingExcel.value = (formato === 'excel');

  try {
    const filtrosPayload = selectedReport.value.FILTROS.reduce((acc, filtro) => {
      acc[filtro.id] = filtro.value;
      return acc;
    }, {});

    const base64 = await reporteService.generar(
      selectedReport.value.IDENTIFICADOR, 
      filtrosPayload, 
      formato
    );

    if (formato === 'pdf') {
      reporteBase64.value = base64;
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      if (objectURL.value) URL.revokeObjectURL(objectURL.value);
      objectURL.value = URL.createObjectURL(blob);
    } else {
      descargarBase64(base64, `${selectedReport.value.IDENTIFICADOR}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
  } catch (error) {
    console.error("Error:", error);
    $q.notify({ type: 'negative', message: 'Fallo al generar el reporte.' });
  } finally {
    isLoading.value = false;
    loadingExcel.value = false;
  }
}

function imprimirReporte() {
  if (iframeReporte.value) iframeReporte.value.contentWindow.print();
}

function descargarReporte() {
  if (reporteBase64.value) {
    descargarBase64(reporteBase64.value, `${selectedReport.value.IDENTIFICADOR}.pdf`, 'application/pdf');
  }
}

function descargarBase64(base64, filename, mimeType) {
  const linkSource = `data:${mimeType};base64,${base64}`;
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = filename;
  downloadLink.click();
}

onMounted(() => {
  cargarCatalogo();
});
</script>

<style scoped>
.reports-container {
  min-height: 100vh;
}

.sidebar-card {
  border-radius: 12px;
  background: white;
}

.report-item {
  border-radius: 8px;
  margin: 2px 12px;
  transition: background 0.3s;
}

.report-item:hover {
  background: #f0f4f8;
}

.active-report-item {
  background: #e3f2fd !important;
  color: #1976d2 !important;
  font-weight: 600;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.border-dashed {
  border: 2px dashed #bdbdbd;
  min-height: 500px;
}

.rounded-lg {
  border-radius: 12px;
}

.q-card {
  border-radius: 12px;
}
</style>
