<template>
  <div class="servicio-resumen-dashboard q-pa-md">
    <!-- Header: Acciones Globales y Progreso -->
    <div class="row items-center justify-between q-mb-md">
      <div class="column">
        <div class="text-h6 text-primary flex items-center">
          <q-icon name="analytics" class="q-mr-sm" />
          Resumen Clínico de la Atención
        </div>
        <div class="text-caption text-grey-7">Vista consolidada para toma de decisiones rápidas</div>
      </div>
      <div class="row q-gutter-x-sm">
        <q-btn
          unelevated
          rounded
          color="secondary"
          icon="print"
          label="Imprimir Resumen"
          no-caps
          class="q-px-md"
          @click="$emit('imprimir-resumen')"
        />
        <div class="progress-chip bg-blue-1 rounded-borders q-px-md q-py-xs flex items-center">
          <q-circular-progress
            show-value
            font-size="10px"
            :value="porcentajeProgreso"
            size="30px"
            :thickness="0.2"
            color="primary"
            track-color="blue-2"
            class="q-mr-sm"
          >
            {{ porcentajeProgreso }}%
          </q-circular-progress>
          <div class="text-caption text-weight-bold text-primary">
            {{ serviciosCompletados.length }} / {{ serviciosAplicados.length }} Servicios
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="row q-col-gutter-md">
      
      <!-- COLUMNA IZQUIERDA: Signos Vitales -->
      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-borders full-height bg-grey-1 shadow-sm">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-weight-bold q-mb-md flex items-center">
              <q-icon name="monitor_heart" color="red" class="q-mr-sm" />
              Signos Vitales
            </div>
            
            <div v-if="datosVitals.existe" class="column q-gutter-y-sm">
              <div v-for="(v, idx) in datosVitals.vitals" :key="idx" class="vital-item row items-center justify-between q-pa-sm bg-white rounded-borders">
                <div class="column">
                  <span class="text-caption text-grey-6">{{ v.label }}</span>
                  <span class="text-weight-bold">{{ v.value }} {{ v.unit }}</span>
                </div>
                <q-icon :name="v.icon" :color="v.color" size="xs" />
              </div>
            </div>
            <div v-else class="flex flex-center q-pa-xl text-italic text-grey-6 text-center">
              No se han registrado constantes vitales.
            </div>

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 text-weight-bold q-mb-sm flex items-center">
              <q-icon name="person_search" color="primary" class="q-mr-sm" />
              Motivo
            </div>
            <div class="bg-blue-1 q-pa-sm rounded-borders text-body2">
              {{ datosConsulta.motivo || 'No especificado' }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- COLUMNA CENTRAL: Evaluación y Diagnóstico -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-borders full-height shadow-sm">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle2 text-weight-bold flex items-center text-primary">
                <q-icon name="medical_information" class="q-mr-sm" />
                Evaluación Clínica
              </div>
              <div class="row q-gutter-x-xs">
                <q-btn v-if="datosConsulta.full" flat round dense icon="print" size="sm" color="primary" @click="$emit('imprimir-servicio', datosConsulta.full, 'especial')">
                  <q-tooltip>Imprimir Consulta</q-tooltip>
                </q-btn>
                <q-btn v-if="datosConsulta.id" flat round dense icon="launch" size="sm" color="grey-6" @click="$emit('seleccionar-pestaña', datosConsulta.id)">
                  <q-tooltip>Ver detalles</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="clinical-note-area q-mb-md">
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">Hallazgos</div>
              <div class="text-body2 scroll-area q-pa-sm bg-grey-1 rounded-borders" style="max-height: 150px; overflow-y: auto;">
                {{ datosConsulta.hallazgos || 'Sin hallazgos registrados.' }}
              </div>
            </div>

            <div class="diagnostico-highlight text-white q-pa-md rounded-borders">
              <div class="row items-start no-wrap">
                <q-icon name="psychology" size="md" class="q-mr-md" />
                <div class="column">
                  <div class="text-caption text-blue-2 text-uppercase text-weight-bold">Diagnóstico</div>
                  <div class="text-h6">{{ datosConsulta.diagnostico || 'Pendiente' }}</div>
                  <div v-if="datosConsulta.complemento" class="text-caption text-blue-1">{{ datosConsulta.complemento }}</div>
                </div>
              </div>
            </div>

            <div class="q-mt-md">
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">Plan y Pronóstico</div>
              <div class="text-body2 q-pa-sm border-grey rounded-borders min-height-50">
                {{ datosConsulta.pronostico || 'No especificado' }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- COLUMNA DERECHA: Tratamientos y Línea de Vida -->
      <div class="col-12 col-md-3">
        <div class="column q-gutter-y-md full-height">
          <!-- Preventivos -->
          <q-card flat bordered class="rounded-borders shadow-sm">
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle2 text-weight-bold q-mb-sm flex items-center text-green-9">
                <q-icon name="verified_user" class="q-mr-sm" />
                Preventivos
              </div>
              <q-list dense>
                <q-item v-if="datosPreventivos.vacunasCount > 0" class="q-px-xs">
                  <q-item-section avatar side><q-icon name="vaccines" color="positive" size="xs" /></q-item-section>
                  <q-item-section><div class="text-caption">{{ datosPreventivos.vacunasCount }} Vacunas</div></q-item-section>
                  <q-item-section side><q-btn flat round dense icon="print" size="xs" color="grey-6" @click="$emit('imprimir-servicio', datosPreventivos.vacunaFull, 'especial')" /></q-item-section>
                </q-item>
                <q-item v-if="datosPreventivos.tieneDesparasitacion" class="q-px-xs">
                  <q-item-section avatar side><q-icon name="bug_report" color="orange" size="xs" /></q-item-section>
                  <q-item-section><div class="text-caption">Desparac.</div></q-item-section>
                  <q-item-section side><q-btn flat round dense icon="print" size="xs" color="grey-6" @click="$emit('imprimir-servicio', datosPreventivos.despFull, 'especial')" /></q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Receta -->
          <q-card flat bordered class="rounded-borders shadow-sm bg-indigo-1">
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle2 text-weight-bold q-mb-xs flex items-center text-secondary">
                <q-icon name="receipt_long" class="q-mr-sm" />
                Receta
              </div>
              <div v-if="datosReceta.existe" class="column">
                <div class="text-caption text-grey-8 ellipsis-2-lines">{{ datosReceta.indicaciones }}</div>
                <div class="row justify-end q-mt-xs">
                  <q-btn flat dense rounded icon="print" color="secondary" size="xs" @click="$emit('imprimir-servicio', datosReceta.full, 'especial')" />
                </div>
              </div>
              <div v-else class="text-caption text-grey-6 text-italic text-center">Sin receta.</div>
            </q-card-section>
          </q-card>

          <!-- Timeline -->
          <q-card flat bordered class="col column rounded-borders shadow-sm bg-white overflow-hidden">
            <q-card-section class="q-pa-sm col column">
               <div class="text-caption text-weight-bold q-mb-sm">Línea de Vida</div>
               <div class="col scroll q-px-md">
                 <q-timeline dense color="primary">
                   <q-timeline-entry
                     v-for="s in serviciosAplicados"
                     :key="s.id"
                     :icon="s.icono"
                     :color="s.completado ? 'positive' : 'orange'"
                     class="q-mb-sm"
                   >
                     <template v-slot:title>
                       <div class="text-caption text-weight-bold" @click="$emit('seleccionar-pestaña', s.id)">{{ s.nombre }}</div>
                     </template>
                     <div class="text-grey-6" style="font-size: 10px;">{{ s.timestamp }}</div>
                   </q-timeline-entry>
                 </q-timeline>
               </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  serviciosAplicados: {
    type: Array,
    required: true
  }
})

defineEmits(['seleccionar-pestaña', 'imprimir-servicio', 'imprimir-resumen'])

const serviciosCompletados = computed(() => props.serviciosAplicados.filter(s => s.completado))
const porcentajeProgreso = computed(() => {
  if (props.serviciosAplicados.length === 0) return 0
  return Math.round((serviciosCompletados.value.length / props.serviciosAplicados.length) * 100)
})

const datosConsulta = computed(() => {
  const s = props.serviciosAplicados.find(s => s.tipo?.toLowerCase() === 'consulta' || s.componente_clave === 'consulta')
  if (!s || !s.datos) return {}
  return {
    id: s.id,
    motivo: s.datos.id_motivo_desc || s.datos.motivo_detallado,
    hallazgos: s.datos.hallazgos_examen || s.datos.anamnesis,
    diagnostico: s.datos.id_diagnostico_desc || (s.datos.id_diagnostico ? `Diagnóstico #${s.datos.id_diagnostico}` : null),
    complemento: s.datos.diagnostico_complemento,
    pronostico: s.datos.pronostico,
    full: s
  }
})

const datosVitals = computed(() => {
  const s = props.serviciosAplicados.find(s => s.tipo?.toLowerCase() === 'exploracion' || s.componente_clave === 'exploracion')
  const consulta = props.serviciosAplicados.find(s => s.tipo?.toLowerCase() === 'consulta' || s.componente_clave === 'consulta')
  const d = s?.datos || consulta?.datos || {}
  const vitals = []
  if (d.temperatura) vitals.push({ label: 'Temp', value: d.temperatura, unit: '°C', icon: 'thermostat', color: 'orange' })
  if (d.peso) vitals.push({ label: 'Peso', value: d.peso, unit: 'kg', icon: 'scale', color: 'blue' })
  if (d.frecuencia_cardiaca) vitals.push({ label: 'FC', value: d.frecuencia_cardiaca, unit: 'bpm', icon: 'favorite', color: 'red' })
  if (d.frecuencia_respiratoria) vitals.push({ label: 'FR', value: d.frecuencia_respiratoria, unit: 'rpm', icon: 'air', color: 'teal' })
  return { existe: vitals.length > 0, vitals }
})

const datosPreventivos = computed(() => {
  const vac = props.serviciosAplicados.find(s => s.tipo?.toLowerCase() === 'vacunacion' || s.componente_clave === 'vacunacion')
  const desp = props.serviciosAplicados.find(s => s.tipo?.toLowerCase() === 'desparasitacion' || s.tipo?.toLowerCase() === 'desparacitacion' || s.componente_clave === 'desparacitacion')
  return {
    vacunasCount: vac?.datos?.vacunas?.length || 0,
    vacunaFull: vac,
    tieneDesparasitacion: !!desp?.completado,
    despFull: desp
  }
})

const datosReceta = computed(() => {
  const s = props.serviciosAplicados.find(s => s.tipo?.toLowerCase() === 'receta' || s.componente_clave === 'receta')
  if (!s || !s.completado) return { existe: false }
  return { existe: true, indicaciones: s.datos.receta_indicaciones, full: s }
})
</script>

<style scoped>
.servicio-resumen-dashboard {
  background-color: #f8f9fb;
  min-height: 500px;
}
.rounded-borders { border-radius: 12px !important; }
.shadow-sm { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.diagnostico-highlight { background: linear-gradient(135deg, #1976D2, #1565C0); }
.min-height-50 { min-height: 50px; }
.clinical-note-area .scroll-area { white-space: pre-wrap; line-height: 1.4; }
.border-grey { border: 1px solid #e0e0e0; }
</style>
