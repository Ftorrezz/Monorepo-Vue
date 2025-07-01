<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-md q-pa-md-lg">
      <div class="q-mb-lg">
        <h4 class="text-h4 text-weight-bold q-my-none">Módulo de Reportes</h4>
        <p class="text-subtitle1 text-grey-7">Seleccione, filtre y genere los reportes que necesite.</p>
      </div>

      <q-splitter v-model="splitterModel" style="height: calc(100vh - 180px)" separator-class="bg-grey-3">

        <template v-slot:before>
          <div class="q-pa-md">
            <q-input
              v-model="searchTerm"
              placeholder="Buscar reporte..."
              outlined
              dense
              clearable
              class="q-mb-lg"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Lista de Reportes con nuevo diseño -->
            <q-scroll-area style="height: calc(100vh - 280px); padding-right: 10px;">
              <div v-if="Object.keys(filteredReportesAgrupados).length > 0">
                <div v-for="(group, category) in filteredReportesAgrupados" :key="category" class="q-mb-lg">
                  <div class="text-overline text-grey-6 q-mb-sm">{{ category }}</div>
                  <div class="q-gutter-y-md">
                    <q-card
                      v-for="reporte in group"
                      :key="reporte.IDENTIFICADOR"
                      class="report-card"
                      :class="{ 'report-card--active': selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR }"
                      @click="seleccionarReporte(reporte)"
                      flat
                      bordered
                    >
                      <q-card-section class="row items-center no-wrap q-pa-sm">
                        <div class="col-auto">
                          <q-avatar color="grey-2" text-color="primary" icon="summarize" size="lg" />
                        </div>
                        <div class="col q-pl-md">
                          <div class="text-weight-bold">{{ reporte.TITULO }}</div>
                          <div class="text-caption text-grey-7 ellipsis">{{ reporte.DESCRIPCION }}</div>
                        </div>
                        <div class="col-auto">
                          <q-icon name="chevron_right" color="grey-5" size="sm" />
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
               <div v-else class="text-center text-grey-6 q-mt-xl">
                <q-icon name="search_off" size="3rem" />
                <p>No se encontraron reportes.</p>
              </div>
            </q-scroll-area>
          </div>
        </template>

        <template v-slot:after>
          <div class="q-pa-md full-height">
            <!-- Sección de Filtros -->
            <q-card v-if="selectedReport" flat bordered class="full-height column no-wrap">
              <q-card-section>
                <div class="text-h6">Filtros para: {{ selectedReport.TITULO }}</div>
                <p class="text-caption text-grey-7 q-mb-none">{{ selectedReport.DESCRIPCION }}</p>
              </q-card-section>
              <q-separator />
              <q-card-section class="col scroll q-gutter-y-md">
                <q-form @submit.prevent="generarReporte">
                  <!-- Renderizado dinámico de filtros -->
                  <div v-for="filtro in selectedReport.FILTROS" :key="filtro.id">
                    <!-- Filtro tipo Fecha -->
                    <q-input
                      v-if="filtro.type === 'date'"
                      v-model="filtro.value"
                      :label="filtro.label"
                      type="date"
                      stack-label
                      outlined
                      dense
                    />
                    <!-- Filtro tipo Texto -->
                    <q-input
                      v-if="filtro.type === 'text'"
                      v-model="filtro.value"
                      :label="filtro.label"
                      outlined
                      dense
                    />
                    <!-- Filtro tipo Selección -->
                    <q-select
                      v-if="filtro.type === 'select'"
                      v-model="filtro.value"
                      :options="filtro.options"
                      :label="filtro.label"
                      emit-value
                      map-options
                      outlined
                      dense
                    />
                  </div>

                  <q-btn
                    label="Generar Reporte"
                    type="submit"
                    color="primary"
                    icon="assessment"
                    :loading="isLoading"
                    class="q-mt-md"
                  />
                </q-form>
              </q-card-section>
            </q-card>

            <!-- Visor de Reporte -->
            <q-card v-if="reporteBase64" flat bordered class="q-mt-md">
              <q-bar class="bg-grey-2">
                <div class="text-weight-bold text-grey-8">Visor de Reporte</div>
                <q-space />
                <q-btn dense flat icon="print" @click="imprimirReporte" text-color="grey-8">
                  <q-tooltip>Imprimir</q-tooltip>
                </q-btn>
                 <q-btn dense flat icon="close" @click="reporteBase64 = null" text-color="grey-8">
                  <q-tooltip>Cerrar Visor</q-tooltip>
                </q-btn>
              </q-bar>
              <q-card-section class="q-pa-none">
                <iframe
                  ref="iframeReporte"
                  :src="reporteSrc"
                  frameborder="0"
                  style="width: 100%; height: calc(100vh - 450px);"
                ></iframe>
              </q-card-section>
            </q-card>

            <!-- Placeholder moderno si no hay reporte seleccionado o generado -->
            <div v-else-if="!selectedReport" class="flex flex-center column text-center text-grey-6 full-height">
              <q-icon name="ballot" size="8rem" color="grey-4" />
              <div class="text-h5 q-mt-md text-weight-light">Bienvenido al Módulo de Reportes</div>
              <p class="q-mt-sm text-body1 text-grey-7" style="max-width: 400px;">
                Selecciona un reporte del catálogo de la izquierda para comenzar.
              </p>
            </div>

          </div>
        </template>

      </q-splitter>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { reportesConfig } from 'src/config/reportesConfig'; // Importamos nuestra config
// import PeticionService from 'src/services/peticion.service'; // Descomentar para uso real

const $q = useQuasar();
// const peticionService = new PeticionService(); // Descomentar para uso real

const splitterModel = ref(35); // Porcentaje inicial del splitter
const selectedReport = ref(null);
const reporteBase64 = ref(null); // Aquí guardaremos el base64 del backend
const isLoading = ref(false);
const iframeReporte = ref(null);
const searchTerm = ref('');

// Agrupamos los reportes por su categoría para mostrarlos en el menú
const reportesAgrupados = computed(() => {
  return reportesConfig.reduce((acc, reporte) => {
    const category = reporte.CATEGORIA || 'Sin Categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(reporte);
    return acc;
  }, {});
});

// Filtramos los reportes agrupados según el término de búsqueda
const filteredReportesAgrupados = computed(() => {
  if (!searchTerm.value) {
    return reportesAgrupados.value;
  }

  const lowerCaseSearch = searchTerm.value.toLowerCase();
  const result = {};

  for (const category in reportesAgrupados.value) {
    const filteredReports = reportesAgrupados.value[category].filter(reporte =>
      reporte.TITULO.toLowerCase().includes(lowerCaseSearch) ||
      reporte.DESCRIPCION.toLowerCase().includes(lowerCaseSearch)
    );

    if (filteredReports.length > 0) {
      result[category] = filteredReports;
    }
  }
  return result;
});

const reporteSrc = computed(() => {
  if (!reporteBase64.value) return '';
  // Asumimos que el reporte es un PDF. Cambiar 'application/pdf' si es otro tipo (p.ej. 'image/png')
  return `data:application/pdf;base64,${reporteBase64.value}`;
});

function seleccionarReporte(reporte) {
  selectedReport.value = reporte;
  reporteBase64.value = null; // Limpiamos el visor al cambiar de reporte
}

async function generarReporte() {
  if (!selectedReport.value) return;

  isLoading.value = true;
  reporteBase64.value = null;

  // Preparamos los filtros para enviar al backend
  const filtrosPayload = selectedReport.value.FILTROS.reduce((acc, filtro) => {
    acc[filtro.id] = filtro.value;
    return acc;
  }, {});

  const payload = {
    identificador: selectedReport.value.IDENTIFICADOR,
    filtros: filtrosPayload
  };

  console.log('Enviando al backend:', payload);

  try {
    // --- SIMULACIÓN DE LLAMADA AL BACKEND ---
    // En un caso real, aquí llamarías a tu servicio:
    // const respuesta = await peticionService.crear('generar-reporte', payload);
    // reporteBase64.value = respuesta.elemento.base64;

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular espera de red
    // Dummy Base64 de un PDF de una página en blanco. Reemplazar con la respuesta real.
    const dummyBase64 = 'JVBERi0xLjcgCiXi48/TIAoxIDAgb2JqIAo8PCAKL1R5cGUgL0NhdGFsb2cgCi9QYWdlcyAyIDAgUiAKPj4gCmVuZG9iagoyIDAgb2JqIAo8PCAKL1R5cGUgL1BhZ2VzIAovQ291bnQgMSAKL0tpZHMgWyAzIDAgUiBdIAo+PiAKZW5kb2JqCjMgMCBvYmogCjw8IAovVHlwZSAvUGFnZSACKi9QYXJlbnQgMiAwIFIgCi9SZXNvdXJjZXMgPDwgCi9Gb250IDw8IAovRjEgNiAwIFIgCj4+IAo+PiAKL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXSAKL0NvbnRlbnRzIDQgMCBSIAo+PiAKZW5kb2JqCjQgMCBvYmogCjw8IC9MZW5ndGggNTggPj4gCnN0cmVhbQogIEJUCiAgICAvRjEgMTIgVGYKICAgIDcyIDc1MDIgVGQKICAgIChIZWxsbyBXb3JsZCkgVGoKICBFVAplbmRzdHJlYW0KZW5kb2JqCjYgMCBvYmogCjw8IAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL05hbWUgL0YxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+IAplbmRkb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDYyIDAwMDAwIG4gCjAwMDAwMDAxMjkgMDAwMDAgbiAKMDAwMDAwMDI4MCAwMDAwMCBuIAowMDAwMDAwMzY0IDAwMDAwIG4gCjAwMDAwMDA0MjIgMDAwMDAgbiAKdHJhaWxlcgo8PCAKL1NpemUgNwovUm9vdCAxIDAgUgopPj4Kc3RhcnR4cmVmCjU0NAolJUVPRgo=';
    reporteBase64.value = dummyBase64;

  } catch (error) {
    console.error("Error al generar el reporte:", error);
    $q.notify({ type: 'negative', message: 'No se pudo generar el reporte.' });
  } finally {
    isLoading.value = false;
  }
}

function imprimirReporte() {
  if (iframeReporte.value) {
    iframeReporte.value.contentWindow.print();
  }
}
</script>

<style scoped>
.report-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.report-card--active {
  border-left-color: var(--q-primary);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.full-height {
  height: 100%;
}
</style>