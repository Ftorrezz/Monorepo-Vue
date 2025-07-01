<template>
  <q-page padding>
    <div class="q-mb-md">
      <h4 class="text-h4 text-weight-bold q-my-none">Módulo de Reportes</h4>
      <p class="text-subtitle1 text-grey-7">Seleccione, filtre y genere los reportes que necesite.</p>
    </div>

    <q-splitter v-model="splitterModel" style="height: calc(100vh - 150px)">

      <template v-slot:before>
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">Catálogo de Reportes</div>

          <!-- Lista de Reportes Agrupados por Categoría -->
          <q-list bordered separator>
            <q-expansion-item
              v-for="(group, category) in reportesAgrupados"
              :key="category"
              :label="category"
              group="report-categories"
              header-class="bg-grey-2 text-primary text-weight-bold"
              expand-icon-class="text-primary"
              default-opened
            >
              <q-list separator>
                <q-item
                  v-for="reporte in group"
                  :key="reporte.IDENTIFICADOR"
                  clickable
                  v-ripple
                  :active="selectedReport?.IDENTIFICADOR === reporte.IDENTIFICADOR"
                  active-class="bg-teal-1 text-grey-8"
                  @click="seleccionarReporte(reporte)"
                >
                  <q-item-section>
                    <q-item-label>{{ reporte.TITULO }}</q-item-label>
                    <q-item-label caption>{{ reporte.DESCRIPCION }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-md">
          <!-- Sección de Filtros -->
          <q-card v-if="selectedReport" flat bordered>
            <q-card-section>
              <div class="text-h6">Filtros para: {{ selectedReport.TITULO }}</div>
              <p class="text-caption text-grey-7">{{ selectedReport.DESCRIPCION }}</p>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <q-form @submit.prevent="generarReporte" class="q-gutter-md">
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
                />
              </q-form>
            </q-card-section>
          </q-card>

          <!-- Visor de Reporte -->
          <q-card v-if="reporteBase64" flat bordered class="q-mt-md">
            <q-bar>
              <div class="text-weight-bold">Visor de Reporte</div>
              <q-space />
              <q-btn dense flat icon="print" @click="imprimirReporte">
                <q-tooltip>Imprimir</q-tooltip>
              </q-btn>
            </q-bar>
            <q-card-section class="q-pa-none">
              <iframe
                ref="iframeReporte"
                :src="reporteSrc"
                frameborder="0"
                style="width: 100%; height: calc(100vh - 400px);"
              ></iframe>
            </q-card-section>
          </q-card>

          <!-- Placeholder si no hay reporte seleccionado o generado -->
          <div v-else class="flex flex-center text-center text-grey-6" style="height: 50vh;">
            <div>
              <q-icon name="rule" size="4rem" />
              <p class="text-h6">{{ selectedReport ? 'Complete los filtros y genere el reporte.' : 'Seleccione un reporte del catálogo para comenzar.' }}</p>
            </div>
          </div>
        </div>
      </template>

    </q-splitter>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { reportesConfig } from 'src/config/reportesConfig'; // Importamos nuestra config
// import PeticionService from 'src/services/peticion.service'; // Descomentar para uso real

const $q = useQuasar();
// const peticionService = new PeticionService(); // Descomentar para uso real

const splitterModel = ref(30); // Porcentaje inicial del splitter
const selectedReport = ref(null);
const reporteBase64 = ref(null); // Aquí guardaremos el base64 del backend
const isLoading = ref(false);
const iframeReporte = ref(null);

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