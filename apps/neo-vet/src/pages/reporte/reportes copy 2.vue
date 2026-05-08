<template>
  <q-page padding class="bg-grey-1">
    <!-- Header Premium -->
    <div class="row items-center q-mb-xl q-col-gutter-md">
      <div class="col-auto">
        <div class="report-icon-container shadow-2">
          <q-icon name="analytics" size="2.5rem" color="white" />
        </div>
      </div>
      <div class="col">
        <h4 class="text-h4 text-weight-bolder q-my-none text-primary">Inteligencia de Datos</h4>
        <p class="text-subtitle1 text-grey-7 q-mb-none">Gestione su clínica con reportes operativos y estratégicos en tiempo real.</p>
      </div>
    </div>

    <q-splitter v-model="splitterModel" :limits="[20, 50]" style="height: calc(100vh - 200px)" class="bg-white shadow-1 rounded-borders overflow-hidden">
      
      <!-- Panel Izquierdo: Catálogo -->
      <template v-slot:before>
        <div class="q-pa-md bg-grey-2 full-height overflow-auto">
          <div class="row items-center q-mb-lg">
            <q-icon name="menu_book" color="primary" size="sm" class="q-mr-sm" />
            <div class="text-overline text-weight-bold text-grey-8">Catálogo de Reportes</div>
          </div>

          <q-list class="q-gutter-y-sm">
            <q-expansion-item
              v-for="(group, category) in reportesAgrupados"
              :key="category"
              :label="category"
              header-class="text-weight-bold text-uppercase text-caption text-grey-8 letter-spacing-1"
              expand-icon-class="text-grey-6"
              default-opened
              dense
            >
              <q-list padding>
                <q-item
                  v-for="reporte in group"
                  :key="reporte.IDENTIFICADOR"
                  clickable
                  v-ripple
                  :active="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR"
                  class="rounded-borders q-mb-xs transition-3"
                  active-class="report-item-active"
                  @click="seleccionarReporte(reporte)"
                >
                  <q-item-section avatar>
                    <q-avatar :icon="reporte.ICONO || 'assessment'" :color="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR ? 'primary' : 'grey-4'" :text-color="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR ? 'white' : 'grey-7'" size="40px" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ reporte.TITULO }}</q-item-label>
                    <q-item-label caption lines="1">{{ reporte.DESCRIPCION }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-icon name="chevron_right" size="xs" :class="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR ? 'text-primary' : 'text-grey-4'" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </div>
      </template>

      <!-- Panel Derecho: Filtros y Visor -->
      <template v-slot:after>
        <div class="full-height column no-wrap overflow-hidden bg-white">
          
          <!-- Estado vacío -->
          <div v-if="!selectedReport" class="col flex flex-center text-center q-pa-xl animate-fade">
            <div class="max-width-400">
              <div class="q-mb-lg bg-blue-1 text-primary q-pa-xl rounded-circle inline-block">
                <q-icon name="dashboard_customize" size="4rem" />
              </div>
              <div class="text-h5 text-weight-bold text-grey-9 q-mb-sm">Seleccione un Reporte</div>
              <p class="text-body1 text-grey-6">Explore nuestro catálogo a la izquierda para visualizar datos clave de su operación.</p>
            </div>
          </div>

          <!-- Configuración de Filtros -->
          <div v-else class="col column no-wrap">
            <div class="q-pa-lg border-bottom bg-white z-top">
              <div class="row items-start justify-between">
                <div>
                  <div class="text-overline text-primary text-weight-bold">{{ selectedReport.CATEGORIA }}</div>
                  <div class="text-h5 text-weight-bolder text-grey-9">{{ selectedReport.TITULO }}</div>
                  <div class="text-body2 text-grey-7 q-mt-xs">{{ selectedReport.DESCRIPCION }}</div>
                </div>
                <div class="row q-gutter-sm">
                  <q-btn flat round icon="close" @click="selectedReport = null; reporteBase64 = null" />
                </div>
              </div>

              <q-form @submit.prevent="generarReporte('pdf')" class="q-mt-xl">
                <div class="row q-col-gutter-lg">
                  <div v-for="filtro in selectedReport.FILTROS" :key="filtro.id" class="col-12 col-sm-6 col-md-4">
                    
                    <!-- Filtro Fecha -->
                    <q-input
                      v-if="filtro.type === 'date'"
                      v-model="filtro.value"
                      :label="filtro.label"
                      type="date"
                      stack-label
                      outlined
                      dense
                      class="custom-input"
                      :rules="filtro.required ? [val => !!val || 'Requerido'] : []"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" color="grey-6" />
                      </template>
                    </q-input>

                    <!-- Filtro Texto -->
                    <q-input
                      v-else-if="filtro.type === 'text'"
                      v-model="filtro.value"
                      :label="filtro.label"
                      outlined
                      dense
                      class="custom-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" color="grey-6" />
                      </template>
                    </q-input>

                    <!-- Filtro Selección -->
                    <q-select
                      v-else-if="filtro.type === 'select'"
                      v-model="filtro.value"
                      :options="filtro.options"
                      :label="filtro.label"
                      emit-value
                      map-options
                      outlined
                      dense
                      class="custom-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="list" color="grey-6" />
                      </template>
                    </q-select>
                  </div>
                </div>

                <div class="row q-mt-lg items-center justify-end q-gutter-sm">
                  <q-btn
                    unelevated
                    label="Exportar Excel"
                    icon="table_view"
                    color="green-7"
                    class="rounded-borders text-weight-bold"
                    @click="generarReporte('excel')"
                    :loading="loadingExcel"
                    outline
                  />
                  <q-btn
                    unelevated
                    label="Generar Reporte PDF"
                    icon="picture_as_pdf"
                    color="primary"
                    type="submit"
                    class="rounded-borders text-weight-bold"
                    :loading="isLoading"
                    padding="10px 25px"
                  />
                </div>
              </q-form>
            </div>

            <!-- Visor de Resultados -->
            <div class="col bg-grey-2 relative-position">
              <div v-if="reporteBase64" class="full-height column">
                <div class="bg-grey-3 q-pa-sm row items-center border-bottom shadow-1 z-top">
                  <q-chip outline color="primary" icon="description" class="text-weight-bold bg-white">Vista Previa Generada</q-chip>
                  <q-space />
                  <q-btn-group flat class="bg-white rounded-borders border">
                    <q-btn flat icon="print" @click="imprimirReporte" label="Imprimir" class="text-weight-bold" />
                    <q-separator vertical />
                    <q-btn flat icon="download" @click="descargarReporte" label="Descargar" class="text-weight-bold" />
                  </q-btn-group>
                </div>
                <div class="col overflow-hidden bg-grey-8 flex flex-center">
                  <iframe
                    ref="iframeReporte"
                    :src="reporteSrc"
                    frameborder="0"
                    class="report-iframe shadow-10 animate-zoom"
                  ></iframe>
                </div>
              </div>

              <!-- Placeholder si no hay reporte generado -->
              <div v-else class="full-height flex flex-center text-center q-pa-xl text-grey-5">
                <div>
                  <q-icon name="pending_actions" size="5rem" />
                  <p class="text-h6 q-mt-md">Complete los filtros y haga clic en "Generar"</p>
                </div>
              </div>

              <!-- Overlay de carga -->
              <q-inner-loading :showing="isLoading" class="bg-white-80">
                <q-spinner-dots size="4rem" color="primary" />
                <div class="text-primary text-weight-bold q-mt-md">Consultando base de datos...</div>
              </q-inner-loading>
            </div>
          </div>
        </div>
      </template>

    </q-splitter>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useLoading } from "../../../../../libs/shared/src/composables/useLoading";
import { reporteService } from '../../services/reporte.service';

const $q = useQuasar();
const { showLoading, hideLoading } = useLoading();

const splitterModel = ref(30);
const selectedReport = ref(null);
const reporteBase64 = ref(null);
const iframeReporte = ref(null);
const isLoading = ref(false);
const loadingExcel = ref(false);
const catalogoReportes = ref([]);

// Agrupamos los reportes por su categoría
const reportesAgrupados = computed(() => {
  return catalogoReportes.value.reduce((acc, reporte) => {
    const category = reporte.CATEGORIA || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(reporte);
    return acc;
  }, {});
});

const objectURL = ref(null);

const reporteSrc = computed(() => {
  return objectURL.value || '';
});

async function cargarCatalogo() {
  try {
    isLoading.value = true;
    catalogoReportes.value = await reporteService.getCatalogo();
  } catch (error) {
    console.error("Error al cargar catálogo:", error);
    $q.notify({ type: 'negative', message: 'No se pudo cargar el catálogo de reportes.' });
  } finally {
    isLoading.value = false;
  }
}

function seleccionarReporte(reporte) {
  // Clonar para que los cambios en inputs no afecten la base
  selectedReport.value = JSON.parse(JSON.stringify(reporte));
  
  // Inicializar valores de filtros con sus defaults si existen
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

  // Salvaguarda: si Vue pasa el evento por error, forzamos 'pdf'
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
      
      // Convertir base64 a Blob para el visor (más estable que data URI)
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      if (objectURL.value) URL.revokeObjectURL(objectURL.value);
      objectURL.value = URL.createObjectURL(blob);

      $q.notify({ type: 'positive', message: 'Reporte generado correctamente.', icon: 'check_circle', position: 'top' });
    } else {
      // Para Excel descargamos directamente
      descargarBase64(base64, `${selectedReport.value.IDENTIFICADOR}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      $q.notify({ type: 'positive', message: 'Archivo Excel generado.', icon: 'download' });
    }

  } catch (error) {
    console.error("Error al generar reporte:", error);
    $q.notify({ type: 'negative', message: 'Ocurrió un error al procesar el reporte.' });
  } finally {
    isLoading.value = false;
    loadingExcel.value = false;
  }
}

function imprimirReporte() {
  if (iframeReporte.value) {
    iframeReporte.value.contentWindow.print();
  }
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
.report-icon-container {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  padding: 15px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-item-active {
  background: rgba(37, 99, 235, 0.08) !important;
  color: #2563eb !important;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.transition-3 {
  transition: all 0.3s ease;
}

.rounded-circle {
  border-radius: 50%;
}

.max-width-400 {
  max-width: 400px;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.border-bottom {
  border-bottom: 1px solid #edf2f7;
}

.border {
  border: 1px solid #e2e8f0;
}

.custom-input :deep(.q-field__control) {
  border-radius: 8px;
}

.report-iframe {
  width: 85%;
  height: 92%;
  border-radius: 4px;
  background-color: white;
}

.bg-white-80 {
  background-color: rgba(255, 255, 255, 0.85);
}

.animate-zoom {
  animation: zoomIn 0.4s ease-out;
}

.animate-fade {
  animation: fadeIn 0.6s ease-in;
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
