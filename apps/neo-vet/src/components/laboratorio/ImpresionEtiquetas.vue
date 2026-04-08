<template>
  <div class="impresion-etiquetas">
    <!-- Vista previa -->
    <div v-if="!imprimiendo" class="q-pa-md">
      <div class="text-h6 q-mb-md">Impresión de Etiquetas de Muestras</div>
      
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-3">
          <q-select
            v-model="formatoEtiqueta"
            :options="['50x30mm', '50x25mm', 'térmica_80mm', 'térmica_58mm']"
            label="Formato de Etiqueta"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-md-3">
          <q-input
            v-model.number="copiasPorMuestra"
            type="number"
            label="Copias por muestra"
            outlined
            dense
            min="1"
            max="5"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-checkbox v-model="incluirCodigoBarras" label="Incluir código de barras" />
          <q-checkbox v-model="incluirInstrucciones" label="Incluir instrucciones de manejo" />
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12">
          <q-btn
            color="primary"
            label="Vista Previa"
            icon="preview"
            @click="mostrarVistaPrevia = true"
            class="q-mr-md"
          />
          <q-btn
            color="accent"
            label="Imprimir"
            icon="print"
            @click="imprimirEtiquetas"
          />
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <!-- Tabla de muestras a imprimir -->
      <div class="text-subtitle2 q-mb-md">Muestras a Imprimir ({{ muestras.length }})</div>
      <q-table
        :rows="muestras"
        :columns="columnasMuestras"
        row-key="numeroMuestra"
        flat
        bordered
        dense
        pagination
      >
        <template v-slot:body-cell-acciones="props">
          <q-td align="center">
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="preview"
              color="primary"
              @click="previsualizarMuestra(props.row)"
              title="Previsualizar"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Vista previa de etiqueta -->
    <q-dialog v-model="mostrarVistaPrevia">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista Previa de Etiqueta</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div :class="`etiqueta-preview formato-${formatoEtiqueta}`">
            <div class="etiqueta-contenido">
              <div class="orden-numero">
                <strong>ORDEN: {{ mueestraPreview?.numeroMuestra }}</strong>
              </div>

              <div v-if="incluirCodigoBarras" class="codigo-barras q-my-sm">
                [Código de barras: {{ mueestraPreview?.numeroMuestra }}]
              </div>

              <div class="tipo-muestra">
                <strong>Tipo:</strong> {{ mueestraPreview?.tipoMuestra }}
              </div>

              <div class="descripcion">
                <strong>Desc:</strong> {{ mueestraPreview?.descripcion }}
              </div>

              <div class="fecha">
                <strong>Fecha:</strong> {{ formatearFecha(mueestraPreview?.fechaGeneracion) }}
              </div>

              <div v-if="incluirInstrucciones" class="instrucciones q-mt-sm text-caption">
                <strong>Instrucciones:</strong>
                <ul class="q-pl-md q-my-xs">
                  <li v-for="(instr, idx) in obtenerInstrucciones(mueestraPreview?.tipoMuestra)" :key="idx" class="text-caption">
                    {{ instr }}
                  </li>
                </ul>
              </div>

              <div class="almacenamiento q-mt-sm text-caption">
                <strong>Almacenamiento:</strong> {{ obtenerAlmacenamiento(mueestraPreview?.tipoMuestra) }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn
            color="accent"
            label="Imprimir Esto"
            icon="print"
            @click="imprimirMuestraEspecifica(mueestraPreview)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Generando impresión -->
    <q-dialog v-model="imprimiendo" persistent>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Preparando Impresión</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-linear-progress :value="progreso" />
          <div class="text-center q-mt-md">
            <div class="text-body2">{{ mensajeProgreso }}</div>
            <div class="text-caption text-grey-7 q-mt-sm">{{ muestrasImpresas }} / {{ muestras.length }} muestras</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Muestra, TipoMuestra } from 'src/types/laboratorio'
import GeneradorMuestrasService from 'src/services/generadorMuestras.service'

const props = defineProps<{
  muestras: Muestra[]
  numeroOrden: string
}>()

const emit = defineEmits<{
  (e: 'impresion-completada'): void
}>()

const formatoEtiqueta = ref('50x30mm')
const copiasPorMuestra = ref(1)
const incluirCodigoBarras = ref(true)
const incluirInstrucciones = ref(true)
const mostrarVistaPrevia = ref(false)
const imprimiendo = ref(false)
const progreso = ref(0)
const mensajeProgreso = ref('')
const muestrasImpresas = ref(0)
const mueestraPreview = ref<Muestra | null>(null)

const columnasMuestras = [
  { name: 'numeroMuestra', label: 'Número de Muestra', field: 'numeroMuestra', align: 'left' },
  { name: 'tipoMuestra', label: 'Tipo', field: 'tipoMuestra', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const previsualizarMuestra = (muestra: Muestra) => {
  mueestraPreview.value = muestra
  mostrarVistaPrevia.value = true
}

const obtenerInstrucciones = (tipoMuestra?: TipoMuestra): string[] => {
  if (!tipoMuestra) return []
  return GeneradorMuestrasService.obtenerInstrucciones(tipoMuestra)
}

const obtenerAlmacenamiento = (tipoMuestra?: TipoMuestra): string => {
  if (!tipoMuestra) return 'Consultar instrucciones'
  const config = GeneradorMuestrasService.obtenerConfiguracion(tipoMuestra)
  return config?.estabilidad || 'Consultar instrucciones'
}

const formatearFecha = (fecha?: string): string => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES')
}

const imprimirMuestraEspecifica = async (muestra?: Muestra) => {
  if (!muestra) return
  // Aquí iría la llamada a imprimir una muestra específica
  console.log('Imprimiendo muestra:', muestra)
}

const imprimirEtiquetas = async () => {
  imprimiendo.value = true
  muestrasImpresas.value = 0

  try {
    for (let i = 0; i < props.muestras.length; i++) {
      const muestra = props.muestras[i]
      
      for (let copia = 1; copia <= copiasPorMuestra.value; copia++) {
        mensajeProgreso.value = `Imprimiendo muestra ${i + 1} de  ${props.muestras.length} (Copia ${copia}/${copiasPorMuestra.value})`
        
        // Simular impresión
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Aquí iría la lógica real de impresión
        console.log(`Imprimiendo: ${muestra.numeroMuestra} - Copia ${copia}`)
      }

      muestrasImpresas.value++
      progreso.value = (muestrasImpresas.value / props.muestras.length)
    }

    mensajeProgreso.value = '¡Impresión completada!'
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('impresion-completada')
  } finally {
    imprimiendo.value = false
    progreso.value = 0
  }
}
</script>

<style scoped lang="scss">
.etiqueta-preview {
  border: 2px solid #ccc;
  padding: 8px;
  margin: 16px 0;
  background: white;
  position: relative;

  &.formato-50x30mm {
    width: 200px;
    height: 120px;
    margin: 0 auto;
  }

  &.formato-50x25mm {
    width: 200px;
    height: 100px;
    margin: 0 auto;
  }

  &.formato-térmica_80mm {
    width: 320px;
    height: auto;
    margin: 0 auto;
  }

  &.formato-térmica_58mm {
    width: 232px;
    height: auto;
    margin: 0 auto;
  }

  .etiqueta-contenido {
    font-size: 11px;
    line-height: 1.3;
    font-family: 'Arial', sans-serif;

    .orden-numero {
      text-align: center;
      font-size: 12px;
      margin-bottom: 4px;
      border-bottom: 1px solid #ccc;
    }

    .tipo-muestra,
    .descripcion,
    .fecha {
      margin: 2px 0;
    }

    .instrucciones,
    .almacenamiento {
      font-size: 9px;
      margin-top: 4px;
      border-top: 1px dashed #ccc;
      padding-top: 4px;
    }
  }
}
</style>
