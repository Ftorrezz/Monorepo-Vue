<template>
  <div class="reporte-orden">
    <div v-if="!mostrarReporte" class="q-pa-md">
      <div class="text-h6 q-mb-md">Reporte de Orden de Laboratorio</div>
      
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="formatoReporte"
            :options="['PDF', 'Impresión', 'Email']"
            label="Formato de Salida"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-md-4">
          <q-checkbox v-model="incluirMuestras" label="Incluir Muestras" />
          <q-checkbox v-model="incluirInstrucciones" label="Incluir Instrucciones" />
        </div>
        <div class="col-12 col-md-4">
          <q-checkbox v-model="incluirResultados" label="Incluir Resultados" :disable="!tieneResultados" />
          <q-checkbox v-model="firmaDigital" label="Firma Digital" />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-btn
            color="primary"
            label="Vista Previa"
            icon="preview"
            @click="mostrarReporte = true"
            class="q-mr-md"
          />
          <q-btn
            v-if="formatoReporte === 'PDF'"
            color="accent"
            label="Descargar PDF"
            icon="download"
            @click="descargarPDF"
          />
          <q-btn
            v-else-if="formatoReporte === 'Impresión'"
            color="accent"
            label="Imprimir"
            icon="print"
            @click="imprimirReporte"
          />
          <q-btn
            v-else
            color="accent"
            label="Enviar Email"
            icon="email"
            @click="enviarEmail"
          />
        </div>
      </div>
    </div>

    <!-- Vista previa del reporte -->
    <q-dialog v-model="mostrarReporte" full-width>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Previsualización del Reporte</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-scroll-area style="height: 600px; width: 100%">
          <div class="reporte-contenido q-pa-lg">
            <!-- Encabezado -->
            <div class="text-center q-mb-lg">
              <div class="text-h5 text-weight-bold">ORDEN DE LABORATORIO</div>
              <div class="text-caption">Sistema LIS - Veterinaria</div>
            </div>

            <q-separator class="q-mb-lg" />

            <!-- Datos Generales -->
            <div class="q-mb-lg">
              <div class="text-subtitle2 text-weight-bold q-mb-md">DATOS GENERALES</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="dato-fila">
                    <span class="label">Número de Orden:</span>
                    <span class="valor">{{ orden.numeroOrden }}</span>
                  </div>
                  <div class="dato-fila">
                    <span class="label">Paciente:</span>
                    <span class="valor">{{ orden.paciente }}</span>
                  </div>
                  <div class="dato-fila">
                    <span class="label">Especie:</span>
                    <span class="valor">{{ orden.especie || 'N/A' }}</span>
                  </div>
                  <div class="dato-fila">
                    <span class="label">Edad:</span>
                    <span class="valor">{{ orden.edad || 'N/A' }}</span>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="dato-fila">
                    <span class="label">Sexo:</span>
                    <span class="valor">{{ orden.sexo || 'N/A' }}</span>
                  </div>
                  <div class="dato-fila">
                    <span class="label">Raza:</span>
                    <span class="valor">{{ orden.raza || 'N/A' }}</span>
                  </div>
                  <div class="dato-fila">
                    <span class="label">Urgente:</span>
                    <span class="valor">{{ orden.esUrgente ? 'SÍ' : 'NO' }}</span>
                  </div>
                  <div class="dato-fila">
                    <span class="label">Fecha de Creación:</span>
                    <span class="valor">{{ formatearFecha(orden.fechaCreacion) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-mb-lg" />

            <!-- Información Clínica -->
            <div class="q-mb-lg">
              <div class="text-subtitle2 text-weight-bold q-mb-md">INFORMACIÓN CLÍNICA</div>
              <div class="dato-fila">
                <span class="label">Profesional Solicitante:</span>
                <span class="valor">{{ orden.profesionalSolicitante }}</span>
              </div>
              <div class="dato-fila q-mt-md" v-if="orden.diagnostico">
                <span class="label">Diagnóstico Presuntivo:</span>
                <div class="valor">{{ orden.diagnostico }}</div>
              </div>
              <div class="dato-fila q-mt-md" v-if="orden.indicacionesEspeciales">
                <span class="label">Indicaciones Especiales:</span>
                <div class="valor">{{ orden.indicacionesEspeciales }}</div>
              </div>
              <div class="dato-fila q-mt-md" v-if="orden.observaciones">
                <span class="label">Observaciones:</span>
                <div class="valor">{{ orden.observaciones }}</div>
              </div>
            </div>

            <q-separator class="q-mb-lg" />

            <!-- Estudios Solicitados -->
            <div class="q-mb-lg">
              <div class="text-subtitle2 text-weight-bold q-mb-md">ESTUDIOS SOLICITADOS</div>
              <q-table
                :rows="orden.estudios"
                :columns="columnasEstudios"
                row-key="codigo"
                flat
                dense
                separator="cell"
                class="estudio-table"
              >
                <template v-slot:body-cell-estado="props">
                  <q-td>{{ props.row.estado }}</q-td>
                </template>
              </q-table>
            </div>

            <!-- Muestras (si está habilitado) -->
            <div v-if="incluirMuestras" class="q-mb-lg">
              <q-separator class="q-mb-lg" />
              <div class="text-subtitle2 text-weight-bold q-mb-md">INFORMACIÓN DE MUESTRAS</div>
              <div v-for="(muestra, idx) in orden.muestras" :key="idx" class="q-mb-md q-pa-md bg-grey-1 rounded-borders">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="texto-pequeño">
                      <strong>Número de Muestra:</strong> {{ muestra.numeroMuestra }}
                    </div>
                    <div class="texto-pequeño">
                      <strong>Tipo:</strong> {{ muestra.tipoMuestra }}
                    </div>
                    <div class="texto-pequeño">
                      <strong>Estado:</strong> {{ muestra.estado }}
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="texto-pequeño">
                      <strong>Descripción:</strong> {{ muestra.descripcion }}
                    </div>
                    <div class="texto-pequeño">
                      <strong>Fecha de Generación:</strong> {{ formatearFecha(muestra.fechaGeneracion) }}
                    </div>
                  </div>
                </div>

                <!-- Instrucciones de muestra -->
                <div v-if="incluirInstrucciones && obtenerInstrucciones(muestra.tipoMuestra).length > 0" class="q-mt-md q-pt-md" style="border-top: 1px dashed #ccc;">
                  <strong class="text-caption">Instrucciones de Manejo:</strong>
                  <ul class="q-pl-md q-my-sm text-caption">
                    <li v-for="(instr, i) in obtenerInstrucciones(muestra.tipoMuestra)" :key="i">
                      {{ instr }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Resultados (si están disponibles) -->
            <div v-if="incluirResultados && tieneResultados" class="q-mb-lg">
              <q-separator class="q-mb-lg" />
              <div class="text-subtitle2 text-weight-bold q-mb-md">RESULTADOS</div>
              <q-table
                :rows="orden.estudios.filter(e => e.resultado)"
                :columns="columnasResultados"
                row-key="codigo"
                flat
                dense
                separator="cell"
              >
              </q-table>
            </div>

            <!-- Pie de página -->
            <div class="q-mt-xl q-pt-lg" style="border-top: 1px solid #ccc;">
              <div class="row items-end justify-between">
                <div class="col-6 text-center">
                  <div class="q-mt-lg">_______________________</div>
                  <div class="texto-pequeño">Firma del Laboratorista</div>
                </div>
                <div class="col-6 text-center">
                  <div class="texto-pequeño">{{ new Date().toLocaleDateString('es-ES') }}</div>
                  <div class="texto-pequeño">Fecha de Emisión</div>
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn
            v-if="formatoReporte === 'PDF'"
            color="accent"
            label="Descargar PDF"
            icon="download"
            @click="descargarPDF"
          />
          <q-btn
            v-else-if="formatoReporte === 'Impresión'"
            color="accent"
            label="Imprimir"
            icon="print"
            @click="imprimirReporte"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { OrdenLaboratorio, TipoMuestra } from 'src/types/laboratorio'
import GeneradorMuestrasService from 'src/services/generadorMuestras.service'

const props = defineProps<{
  orden: OrdenLaboratorio
}>()

const emit = defineEmits<{
  (e: 'reporte-generado', generado: boolean): void
}>()

const formatoReporte = ref('PDF')
const incluirMuestras = ref(true)
const incluirInstrucciones = ref(true)
const incluirResultados = ref(true)
const firmaDigital = ref(false)
const mostrarReporte = ref(false)

const columnasEstudios = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre del Estudio', field: 'nombre', align: 'left' },
  { name: 'tipoMuestra', label: 'Tipo de Muestra', field: 'tipoMuestra', align: 'left' },
  { name: 'prioridad', label: 'Prioridad', field: 'prioridad', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' }
]

const columnasResultados = [
  { name: 'nombre', label: 'Estudio', field: 'nombre', align: 'left' },
  { name: 'valor', label: 'Resultado', field: (row: any) => row.resultado?.valor, align: 'left' },
  { name: 'unidad', label: 'Unidad', field: (row: any) => row.resultado?.unidad, align: 'center' },
  { name: 'referencia', label: 'Valor de Referencia', field: (row: any) => row.resultado?.referencia, align: 'left' },
  { name: 'observaciones', label: 'Observaciones', field: (row: any) => row.resultado?.observaciones, align: 'left' }
]

const tieneResultados = computed(() => {
  return props.orden.estudios.some(e => e.resultado)
})

const formatearFecha = (fecha?: string): string => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const obtenerInstrucciones = (tipoMuestra?: TipoMuestra): string[] => {
  if (!tipoMuestra) return []
  return GeneradorMuestrasService.obtenerInstrucciones(tipoMuestra)
}

const descargarPDF = async () => {
  // Aquí implementarías la descarga de PDF
  console.log('Descargando PDF...')
  emit('reporte-generado', true)
}

const imprimirReporte = async () => {
  window.print()
}

const enviarEmail = async () => {
  // Aquí implementarías la lógica para enviar email
  console.log('Enviando email...')
}
</script>

<style scoped lang="scss">
.reporte-contenido {
  background: white;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.5;

  .dato-fila {
    display: flex;
    margin: 8px 0;

    .label {
      font-weight: bold;
      min-width: 180px;
    }

    .valor {
      flex: 1;
    }
  }

  .texto-pequeño {
    font-size: 11px;
    margin: 4px 0;
  }

  .estudio-table {
    font-size: 11px;
  }

  .rounded-borders {
    border-radius: 4px;
  }

  :deep(.q-table__card) {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

@media print {
  .reporte-contenido {
    margin: 0;
    padding: 0;
  }
}
</style>
