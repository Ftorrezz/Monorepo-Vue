<template>
  <q-card 
    flat 
    bordered 
    class="estudio-card"
    :data-sector="estudio.sectorId"
  >
    <q-card-section class="q-pa-sm">
      <div class="row items-center q-col-gutter-x-md">
        <!-- Información básica -->
        <div class="col">
          <div class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-medium row items-center">
                {{ estudio.nombre }}
                <q-chip
                  dense
                  size="sm"
                  :color="getSectorColor(estudio.sectorId)"
                  text-color="white"
                  class="q-ml-sm sector-indicator"
                >
                  <q-icon 
                    :name="getSectorIcon(estudio.sectorId)" 
                    size="xs" 
                    class="q-mr-xs"
                  />
                  {{ estudio.sector?.codigo }}
                </q-chip>
              </div>
              <div class="text-caption text-grey-8">
                Código: {{ estudio.codigo }}
                <q-separator vertical inset spaced />
                {{ estudio.tipoMuestra }}
              </div>
            </div>
            
            <!-- Estado -->
            <div class="col-auto">
              <q-chip
                dense
                :color="getEstadoColor(estudio.estado)"
                text-color="white"
              >
                {{ getEstadoLabel(estudio.estado) }}
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="col-auto" v-if="!modoLectura">
          <!-- Observaciones en popover -->
          <q-btn
            flat
            round
            size="sm"
            color="grey-7"
            icon="comment"
            @click="showObservaciones = true"
          >
            <q-tooltip>Agregar observaciones</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            size="sm"
            color="negative"
            icon="delete"
            @click="eliminarEstudio"
          >
            <q-tooltip>Eliminar estudio</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <!-- Dialog para observaciones -->
    <q-dialog v-model="showObservaciones">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Observaciones</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="observacionesLocales"
            type="textarea"
            rows="3"
            outlined
            label="Observaciones específicas"
            @update:model-value="actualizarObservaciones"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Estudio } from './OrdenLaboratorio.vue'

const props = defineProps<{
  estudio: Estudio
  modoLectura: boolean
}>()

const emit = defineEmits(['estudio-actualizado', 'estudio-eliminado'])

const showObservaciones = ref(false)
const observacionesLocales = ref(props.estudio.observaciones || '')

// Métodos para estados y colores
const getEstadoColor = (estado: string) => {
  switch(estado) {
    case 'pendiente': return 'orange'
    case 'cargado': return 'blue'
    case 'validado': return 'positive'
    default: return 'grey'
  }
}

const getEstadoLabel = (estado: string) => {
  switch(estado) {
    case 'pendiente': return 'Pendiente'
    case 'cargado': return 'Cargado'
    case 'validado': return 'Validado'
    default: return 'Sin Estado'
  }
}

const getSectorColor = (sectorId: string) => {
  switch(sectorId) {
    case 'HEM': return 'deep-purple-7'  // Color más oscuro para mejor contraste
    case 'BQ': return 'teal-7'
    case 'MICRO': return 'blue-grey-7'
    default: return 'grey-7'
  }
}

// Agregar método para iconos de sector
const getSectorIcon = (sectorId: string) => {
  switch(sectorId) {
    case 'HEM': return 'opacity'        // Icono para hematología
    case 'BQ': return 'science'         // Icono para bioquímica
    case 'MICRO': return 'bacteria'     // Icono para microbiología
    default: return 'lab_panel'
  }
}

// Métodos
const actualizarObservaciones = () => {
  emit('estudio-actualizado', props.estudio.id, {
    ...props.estudio,
    observaciones: observacionesLocales.value
  })
}

const eliminarEstudio = () => {
  emit('estudio-eliminado', props.estudio.id)
}
</script>

<style scoped>
.estudio-card {
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.estudio-card:hover {
  background: #f8f9fa;
}

.sector-indicator {
  height: 24px;
  font-size: 0.8rem;
}

/* Color del borde según el sector */
.estudio-card[data-sector="HEM"] {
  border-left-color: var(--q-deep-purple-7);
}

.estudio-card[data-sector="BQ"] {
  border-left-color: var(--q-teal-7);
}

.estudio-card[data-sector="MICRO"] {
  border-left-color: var(--q-blue-grey-7);
}
</style>