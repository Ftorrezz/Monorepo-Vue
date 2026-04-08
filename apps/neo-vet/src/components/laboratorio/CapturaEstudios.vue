<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6 q-mb-md">Captura de Estudios y Generación de Muestras</div>
      
      <!-- Resumen -->
      <div class="row q-col-gutter-sm q-mb-lg">
        <q-chip 
          color="primary" 
          text-color="white" 
          :label="`Estudios: ${resumenOrden.totalEstudios}`" 
          dense 
        />
        <q-chip 
          color="info" 
          text-color="white" 
          :label="`Muestras: ${resumenOrden.totalMuestras}`" 
          dense 
        />
        <q-chip 
          color="teal" 
          text-color="white" 
          :label="`Tipos: ${resumenOrden.tiposMuestra}`" 
          dense 
        />
        <q-chip 
          color="orange" 
          text-color="white" 
          :label="`Pendientes: ${resumenOrden.pendientes}`" 
          dense 
        />
        <q-chip 
          color="positive" 
          text-color="white" 
          :label="`Validadas: ${resumenOrden.validados}`" 
          dense 
        />
      </div>

      <q-separator class="q-my-md" />

      <!-- Selector de Estudios -->
      <div class="text-subtitle2 q-mb-md">Agregar Estudios</div>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-select
            v-model="estudioAgregado.codigo"
            :options="estudiosDisponibles"
            option-label="nombre"
            option-value="codigo"
            label="Seleccionar Estudio"
            outlined
            dense
            use-input
            input-debounce="200"
            @update:model-value="actualizarEmpezarEstudio"
          >
            <template v-slot:prepend>
              <q-icon name="science" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <div class="text-weight-bold">{{ scope.opt.nombre }}</div>
                  <div class="text-caption text-grey-7">{{ scope.opt.codigo }} • {{ scope.opt.tipoMuestra }}</div>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="estudioAgregado.tipoMuestra"
            :options="['sangre', 'orina', 'heces']"
            label="Tipo de Muestra"
            outlined
            dense
            @update:model-value="mostrarConfiguracionMuestra"
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="estudioAgregado.prioridad"
            :options="['normal', 'urgente']"
            label="Prioridad"
            outlined
            dense
          />
        </div>

        <div class="col-12">
          <q-banner 
            v-if="configuracionMuestraActual"
            class="bg-blue-1 text-dark"
          >
            <div class="text-subtitle2">{{ configuracionMuestraActual.tipoMuestra }}</div>
            <div class="text-caption q-mt-sm">
              <strong>Contenedor:</strong> {{ configuracionMuestraActual.contenedor }}<br>
              <strong>Volumen mínimo:</strong> {{ configuracionMuestraActual.volumenMinimo }}<br>
              <strong>Estabilidad:</strong> {{ configuracionMuestraActual.estabilidad }}<br>
              <strong>Instrucciones:</strong>
              <ul class="q-pl-md q-my-sm">
                <li v-for="(instr, idx) in configuracionMuestraActual.instruccionesEspeciales" :key="idx">
                  {{ instr }}
                </li>
              </ul>
            </div>
          </q-banner>
        </div>

        <div class="col-12">
          <q-btn
            color="primary"
            label="Agregar Estudio"
            icon="add"
            @click="agregarEstudio"
            :disable="!estudioAgregado.codigo"
            class="full-width"
          />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- Lista de Estudios Agregados -->
      <div class="text-subtitle2 q-mb-md">Estudios Capturados ({{ orden.estudios.length }})</div>
      
      <div v-if="orden.estudios.length === 0" class="text-grey-7 text-center q-pa-md">
        No hay estudios agregados
      </div>

      <!-- Agrupar por tipo de muestra -->
      <div v-for="(muestras, idx) in muestrasUnicas" :key="idx" class="q-mb-lg">
        <div class="text-subtitle3 bg-grey-2 q-pa-sm rounded-borders q-mb-md">
          <q-icon name="local_shipping" class="q-mr-sm" />
          Muestra: <strong>{{ muestras.numeroMuestra }}</strong> ({{ muestras.tipoMuestra }})
        </div>

        <q-table
          :rows="estudiosAgrupadosPorMuestra.get(muestras.tipoMuestra) || []"
          :columns="columnasEstudios"
          row-key="codigo"
          flat
          bordered
          dense
          separator="cell"
        >
          <template v-slot:body-cell-estado="props">
            <q-td>
              <q-chip 
                :color="colorEstado(props.row.estado)"
                text-color="white"
                size="sm"
                dense
                :label="props.row.estado"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td align="center">
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete"
                color="negative"
                @click="removerEstudio(orden.estudios.indexOf(props.row))"
              />
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Información de muestras -->
      <q-separator class="q-my-md" v-if="orden.estudios.length > 0" />
      
      <div v-if="orden.estudios.length > 0" class="q-pa-md bg-grey-1 rounded-borders">
        <div class="text-subtitle2 q-mb-md">Información de Muestras Generadas</div>
        <q-table
          :rows="orden.muestras"
          :columns="columnasMuestras"
          row-key="numeroMuestra"
          flat
          bordered
          dense
          separator="cell"
        >
          <template v-slot:body-cell-estado="props">
            <q-td>
              <q-chip 
                color="blue"
                text-color="white"
                size="sm"
                dense
                :label="props.row.estado"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import useGestionEstudios from 'src/composables/laboratorio/useGestionEstudios'
import { TipoMuestra } from 'src/types/laboratorio'

const props = defineProps<{
  numeroOrden: string
}>()

const emit = defineEmits<{
  (e: 'estudios-actualizados', orden: any): void
}>()

const {
  orden,
  estudioAgregado,
  estudiosDisponibles,
  agregarEstudio: agregarEstudioComposable,
  removerEstudio,
  estudiosAgrupadosPorMuestra,
  muestrasUnicas,
  resumenOrden,
  obtenerConfiguracionMuestra
} = useGestionEstudios({
  numeroOrden: props.numeroOrden
})

const configuracionMuestraActual = ref<any>(null)

const columnasEstudios = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const columnasMuestras = [
  { name: 'numeroMuestra', label: 'Número de Muestra', field: 'numeroMuestra', align: 'left' },
  { name: 'tipoMuestra', label: 'Tipo', field: 'tipoMuestra', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' }
]

const colorEstado = (estado: string) => {
  const colores: Record<string, string> = {
    pendiente: 'orange',
    cargado: 'blue',
    validado: 'positive',
    rechazado: 'negative',
    enmendado: 'warning'
  }
  return colores[estado] || 'grey'
}

const mostrarConfiguracionMuestra = (tipo: TipoMuestra) => {
  configuracionMuestraActual.value = obtenerConfiguracionMuestra(tipo)
}

const actualizarEmpezarEstudio = (codigo: string) => {
  const estudio = estudiosDisponibles.value.find(e => e.codigo === codigo)
  if (estudio) {
    estudioAgregado.value = {
      ...estudioAgregado.value,
      ...estudio
    }
    mostrarConfiguracionMuestra(estudio.tipoMuestra)
  }
}

const agregarEstudio = () => {
  agregarEstudioComposable()
  emit('estudios-actualizados', orden.value)
}
</script>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 4px;
}
</style>
