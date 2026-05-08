<template>
  <q-page class="reporting-analytics bg-indigo-50">
    <!-- Header Vibrant -->
    <div class="header-section q-pa-xl text-white">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-overline text-indigo-200 text-weight-bold letter-spacing-2">SISTEMA DE INTELIGENCIA CLÍNICA</div>
          <h2 class="text-h2 text-weight-bolder q-my-none font-outfit tracking-tight">Reportes & Insights</h2>
          <p class="text-subtitle1 text-indigo-100 q-mt-sm opacity-80">Visualice el pulso de su negocio en tiempo real con datos precisos.</p>
        </div>
        <div class="col-auto">
          <div class="stats-mini row q-gutter-md">
            <div class="stat-box">
              <div class="text-caption text-indigo-300">REPORTES</div>
              <div class="text-h6">{{ catalogoReportes.length }}</div>
            </div>
            <div class="stat-box active">
              <q-icon name="auto_awesome" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="workspace-container q-px-xl q-pb-xl">
      <div class="row q-col-gutter-xl">
        
        <!-- Sidebar Navigation (Glass) -->
        <div class="col-12 col-md-3">
          <q-card class="sidebar-glass border-radius-xl shadow-24 overflow-hidden border-indigo-100">
            <div class="q-pa-lg">
              <q-input v-model="search" placeholder="Buscar reporte..." standout dense dark color="white" class="search-glass">
                <template v-slot:prepend><q-icon name="search" color="white" /></template>
              </q-input>
            </div>

            <q-list padding class="q-pb-md">
              <template v-for="(group, category) in reportesAgrupados" :key="category">
                <div class="q-px-lg q-pt-md q-pb-xs text-indigo-200 text-overline text-weight-bold">{{ category }}</div>
                
                <q-item
                  v-for="reporte in group"
                  :key="reporte.IDENTIFICADOR"
                  clickable
                  v-ripple
                  :active="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR"
                  class="nav-item q-mx-md q-mb-xs rounded-borders"
                  active-class="nav-item-active"
                  @click="seleccionarReporte(reporte)"
                >
                  <q-item-section avatar>
                    <q-icon :name="reporte.ICONO || 'analytics'" :color="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR ? 'white' : 'indigo-200'" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold" :class="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR ? 'text-white' : 'text-indigo-100'">
                      {{ reporte.TITULO }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR">
                    <div class="glow-dot"></div>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-card>
        </div>

        <!-- Content Area -->
        <div class="col-12 col-md-9 q-gutter-y-xl">
          
          <!-- State Empty -->
          <div v-if="!selectedReport" class="empty-workspace flex flex-center bg-white shadow-xl border-radius-xl">
            <div class="text-center">
              <div class="hero-icon-container q-mb-lg">
                <q-icon name="query_stats" size="8rem" color="indigo-1" />
              </div>
              <h4 class="text-h4 text-weight-bolder text-indigo-900 font-outfit">¿Qué desea analizar hoy?</h4>
              <p class="text-subtitle1 text-grey-5">Seleccione un reporte del panel izquierdo para comenzar.</p>
            </div>
          </div>

          <template v-else>
            <!-- Filters Section -->
            <q-card class="filter-card border-radius-xl shadow-xl border-indigo-50">
              <div class="q-pa-xl bg-gradient-indigo text-white row items-center justify-between">
                <div>
                  <q-badge :label="selectedReport.CATEGORIA" color="white" text-color="indigo-10" class="text-weight-bold q-mb-sm" />
                  <div class="text-h4 text-weight-bolder font-outfit">{{ selectedReport.TITULO }}</div>
                  <div class="text-subtitle2 opacity-80">{{ selectedReport.DESCRIPCION }}</div>
                </div>
                <div class="row q-gutter-sm">
                  <q-btn
                    unelevated
                    color="white"
                    text-color="indigo-10"
                    label="Generar Reporte"
                    icon="auto_awesome"
                    class="btn-vibrant text-weight-bold"
                    padding="12px 30px"
                    :loading="isLoading"
                    @click="generarReporte('pdf')"
                  />
                  <q-btn
                    outline
                    color="white"
                    icon="file_download"
                    class="rounded-lg"
                    @click="generarReporte('excel')"
                    :loading="loadingExcel"
                  />
                </div>
              </div>

              <q-card-section class="q-pa-xl row q-col-gutter-xl">
                <div v-for="filtro in selectedReport.FILTROS" :key="filtro.id" class="col-12 col-sm-4">
                  <div class="text-overline text-indigo-400 text-weight-bold q-mb-sm">{{ filtro.label }}</div>
                  <q-input
                    v-if="filtro.type === 'date'"
                    v-model="filtro.value"
                    type="date"
                    outlined
                    bg-color="indigo-50"
                    class="vibrant-input"
                  />
                  <q-select
                    v-else-if="filtro.type === 'select'"
                    v-model="filtro.value"
                    :options="filtro.options"
                    outlined
                    emit-value
                    map-options
                    bg-color="indigo-50"
                    class="vibrant-input"
                  />
                  <q-input
                    v-else
                    v-model="filtro.value"
                    outlined
                    bg-color="indigo-50"
                    class="vibrant-input"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- Viewer Section -->
            <q-card class="viewer-card border-radius-xl shadow-24 overflow-hidden bg-indigo-900">
              <div v-if="reporteBase64" class="full-height column no-wrap">
                <div class="viewer-header q-pa-md bg-white border-bottom row items-center">
                  <div class="window-dots row q-gutter-xs q-mr-md">
                    <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
                  </div>
                  <div class="text-indigo-900 text-weight-bolder">VISOR DE DOCUMENTO</div>
                  <q-space />
                  <div class="row q-gutter-sm">
                    <q-btn flat round color="indigo-10" icon="print" @click="imprimirReporte" />
                    <q-btn flat round color="indigo-10" icon="download" @click="descargarReporte" />
                  </div>
                </div>
                <div class="col q-pa-xl bg-viewer-pattern flex flex-center overflow-auto">
                  <iframe
                    v-if="reporteSrc"
                    ref="iframeReporte"
                    :src="reporteSrc"
                    frameborder="0"
                    class="document-iframe shadow-24"
                  ></iframe>
                </div>
              </div>

              <div v-else class="q-pa-xl flex flex-center bg-indigo-50" style="min-height: 400px">
                <div class="text-center opacity-40">
                  <q-icon name="visibility" size="5rem" color="indigo-200" />
                  <div class="text-h6 text-indigo-300">La vista previa aparecerá aquí</div>
                </div>
              </div>

              <q-inner-loading :showing="isLoading" class="bg-indigo-900-80">
                <q-spinner-cube size="5rem" color="white" />
                <div class="text-white text-weight-bold q-mt-md letter-spacing-1">CONSTRUYENDO REPORTE...</div>
              </q-inner-loading>
            </q-card>
          </template>
        </div>
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
    list = list.filter(r => r.TITULO.toLowerCase().includes(s) || r.DESCRIPCION.toLowerCase().includes(s));
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
    console.error("Error:", error);
    $q.notify({ type: 'negative', message: 'Fallo de conexión.' });
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

  if (formato === 'pdf') isLoading.value = true;
  else loadingExcel.value = true;

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
    $q.notify({ type: 'negative', message: 'Error al generar reporte.' });
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

.font-outfit { font-family: 'Outfit', sans-serif; }
.tracking-tight { letter-spacing: -2px; }
.letter-spacing-2 { letter-spacing: 2px; }
.letter-spacing-1 { letter-spacing: 1px; }

.reporting-analytics {
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  border-radius: 0 0 60px 60px;
  box-shadow: 0 10px 30px rgba(30, 27, 75, 0.2);
  margin-bottom: -50px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.stat-box.active {
  background: #4f46e5;
  color: white;
}

.sidebar-glass {
  background: rgba(30, 27, 75, 0.95);
  backdrop-filter: blur(10px);
  min-height: 700px;
}

.search-glass {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
}

.nav-item {
  transition: all 0.3s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-item-active {
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%) !important;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

.glow-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px #fff;
}

.workspace-container {
  position: relative;
  z-index: 10;
}

.border-radius-xl { border-radius: 30px; }

.empty-workspace {
  min-height: 700px;
}

.bg-gradient-indigo {
  background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
}

.vibrant-input :deep(.q-field__control) {
  border-radius: 15px;
  border: 1px solid #e0e7ff;
  background: white !important;
  transition: all 0.3s;
}

.vibrant-input :deep(.q-field__control):hover {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.btn-vibrant {
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.viewer-header {
  border-bottom: 1px solid #f1f5f9;
}

.window-dots .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.bg-viewer-pattern {
  background-color: #1e1b4b;
  background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 30px 30px;
}

.document-iframe {
  width: 90%;
  height: 850px;
  background: white;
  border-radius: 12px;
}

.bg-indigo-900-80 {
  background: rgba(30, 27, 75, 0.8);
}

.opacity-80 { opacity: 0.8; }
.opacity-40 { opacity: 0.4; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.viewer-card {
  animation: fadeIn 0.5s ease-out;
}
</style>
