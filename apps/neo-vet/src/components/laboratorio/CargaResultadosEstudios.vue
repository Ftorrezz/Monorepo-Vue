<template>
  <div class="carga-resultados-estudios">
    <div v-if="!orden.estudios || orden.estudios.length === 0" class="text-grey-7 text-center q-pa-md">
      No hay estudios para cargar resultados
    </div>

    <!-- Tabs por tipo de muestra -->
    <q-tabs
      v-else
      v-model="tabActiva"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
      @update:model-value="tabActualizacion"
    >
      <q-tab
        v-for="tipoMuestra in tiposMuestraUnicos"
        :key="tipoMuestra"
        :name="tipoMuestra"
        :label="`${tipoMuestra} (${obtenerEstudiosPorMuestra(tipoMuestra).length})`"
      />
    </q-tabs>

    <q-separator />

    <!-- Contenido de los estudios por muestra -->
    <q-tab-panels v-model="tabActiva" animated class="bg-white">
      <q-tab-panel
        v-for="tipoMuestra in tiposMuestraUnicos"
        :key="tipoMuestra"
        :name="tipoMuestra"
        class="q-pa-md"
      >
        <!-- Información de la muestra específica -->
        <div class="q-mb-md p-ma-md bg-blue-1 rounded-borders">
          <div class="text-subtitle2 q-mb-sm">Información de Muestra</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="texto-pequeño">
                <strong>Número:</strong> {{ obtenerNumeroMuestra(tipoMuestra) }}
              </div>
              <div class="texto-pequeño">
                <strong>Tipo:</strong> {{ tipoMuestra }}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="texto-pequeño">
                <strong>Estado:</strong> {{ obtenerEstadoMuestra(tipoMuestra) }}
              </div>
              <div class="texto-pequeño">
                <strong>Estudios:</strong> {{ obtenerEstudiosPorMuestra(tipoMuestra).length }}
              </div>
            </div>
          </div>
        </div>

        <!-- Formularios de resultados por estudio -->
        <div
          v-for="(estudio, idx) in obtenerEstudiosPorMuestra(tipoMuestra)"
          :key="estudio.codigo"
          class="q-mb-lg q-pa-md bg-grey-1 rounded-borders"
        >
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle3">{{ estudio.nombre }}</div>
              <div class="text-caption text-grey-7">{{ estudio.codigo }}</div>
            </div>
            <q-chip
              :color="obtenerColorEstado(estudio.estado)"
              text-color="white"
              size="sm"
              dense
              :label="estudio.estado"
            />
          </div>

          <q-separator class="q-mb-md" />

          <!-- Formulario de resultado -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="resultadosFormulario[estudio.codigo].valor"
                label="Valor / Resultado"
                outlined
                dense
                :readonly="estudio.estado === 'validado'"
                @update:model-value="marcarComoModificado(estudio.codigo)"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="resultadosFormulario[estudio.codigo].unidad"
                label="Unidad"
                outlined
                dense
                :readonly="estudio.estado === 'validado'"
                @update:model-value="marcarComoModificado(estudio.codigo)"
              />
            </div>

            <!-- Valor de referencia - AUTOCOMPLETADO dinámicamente -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="resultadosFormulario[estudio.codigo].referencia"
                label="Valor de Referencia"
                outlined
                dense
                readonly
                hint="Calculado automáticamente según especie y edad"
              />
            </div>

            <!-- Indicador de rango dinámico -->
            <div class="col-12 col-md-6" v-if="obtenerValidacionResultado(estudio.codigo)">
              <div class="row items-center">
                <q-icon
                  :name="obtenerValidacionResultado(estudio.codigo).dentroDeRango ? 'check_circle' : 'warning'"
                  :color="obtenerValidacionResultado(estudio.codigo).dentroDeRango ? 'positive' : 'warning'"
                  size="24px"
                  class="q-mr-sm"
                />
                <span :class="obtenerValidacionResultado(estudio.codigo).dentroDeRango ? 'text-positive' : 'text-warning'">
                  {{ obtenerValidacionResultado(estudio.codigo).dentroDeRango ? '✓ Dentro de rango' : '⚠ Fuera de rango' }}
                </span>
              </div>
            </div>

            <!-- Mensajes de validación -->
            <div v-if="obtenerValidacionResultado(estudio.codigo)?.mensajes.length > 0" class="col-12">
              <q-banner class="bg-warning-1 text-warning-9" dense>
                <template v-slot:avatar>
                  <q-icon name="warning" />
                </template>
                <div v-for="(msg, i) in obtenerValidacionResultado(estudio.codigo).mensajes" :key="i" class="text-caption">
                  {{ msg }}
                </div>
              </q-banner>
            </div>

            <div class="col-12">
              <q-input
                v-model="resultadosFormulario[estudio.codigo].observaciones"
                label="Observaciones"
                outlined
                dense
                type="textarea"
                rows="2"
                :readonly="estudio.estado === 'validado'"
                @update:model-value="marcarComoModificado(estudio.codigo)"
              />
            </div>
          </div>

          <!-- Acciones por estudio -->
          <div class="row q-gutter-sm justify-end">
            <q-btn
              v-if="estudio.estado === 'pendiente'"
              color="primary"
              label="Guardar"
              size="sm"
              @click="guardarResultado(estudio, idx)"
              :disable="!tieneValor(estudio.codigo)"
            />
            <q-btn
              v-if="estudio.estado === 'cargado' && !estudioNoModificado(estudio.codigo)"
              color="warning"
              label="Actualizar"
              size="sm"
              @click="actualizarResultado(estudio, idx)"
            />
            <q-btn
              v-if="estudio.estado === 'cargado'"
              color="positive"
              label="Validar"
              size="sm"
              @click="validarResultado(estudio, idx)"
            />
            <q-btn
              v-if="estudio.estado === 'validado'"
              flat
              color="secondary"
              label="Editar"
              size="sm"
              @click="reabrirResultado(estudio)"
            />
          </div>

          <!-- Comparación y análisis (si está validado) -->
          <div v-if="estudio.estado === 'validado'" class="q-mt-md q-pt-md" style="border-top: 1px dashed #ccc;">
            <q-expansion-item
              label="Ver Análisis y Comparación"
              icon="analytics"
              dense
            >
              <div class="q-pa-md bg-white">
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <strong>Resultado Registrado:</strong> {{ resultadosFormulario[estudio.codigo].valor }}
                    {{ resultadosFormulario[estudio.codigo].unidad }}
                  </div>
                  <div class="col-12">
                    <strong>Rango de Referencia:</strong> {{ resultadosFormulario[estudio.codigo].referencia }}
                  </div>
                  <div class="col-12">
                    <strong>Estado:</strong>
                    <q-chip
                      :color="resultadosFormulario[estudio.codigo].validoReferencia ? 'positive' : 'warning'"
                      text-color="white"
                      size="sm"
                      dense
                      :label="resultadosFormulario[estudio.codigo].validoReferencia ? 'Dentro de rango' : 'Fuera de rango'"
                    />
                  </div>
                  <!-- Aquí podrías agregar comparación con estudios previos -->
                </div>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { OrdenLaboratorio, Estudio, TipoMuestra, ResultadoEstudio, EstadoResultado } from 'src/types/laboratorio'
import validacionResultadosService from 'src/services/validacionResultados.service'
import { obtenerValorReferencia, valoresReferenciaConfig } from 'src/config/valoresReferencia'

const props = defineProps<{
  orden: OrdenLaboratorio
}>()

const emit = defineEmits<{
  (e: 'resultado-cargado', estudioId: string): void
  (e: 'resultado-validado', estudioId: string): void
}>()

const tabActiva = ref<string>('')
const resultadosFormulario = ref<Record<string, any>>({})
const estudiosModificados = ref<Set<string>>(new Set())
const validacionesPorEstudio = ref<Record<string, any>>({})

// Inicializar formulario de resultados
watch(
  () => props.orden,
  (nuevaOrden) => {
    if (nuevaOrden && nuevaOrden.estudios) {
      nuevaOrden.estudios.forEach(estudio => {
        if (!resultadosFormulario.value[estudio.codigo]) {
          resultadosFormulario.value[estudio.codigo] = {
            valor: estudio.resultado?.valor || '',
            unidad: estudio.resultado?.unidad || '',
            referencia: '',
            observaciones: estudio.resultado?.observaciones || '',
            validoReferencia: estudio.resultado?.validoReferencia ?? true,
            estado: estudio.estado
          }
        }
        
        // Cargar referencia automáticamente
        actualizarReferencia(estudio)
        
        // Validar en tiempo real
        validarResultadoEnTiempoReal(estudio)
        
        // Watch al valor para validar cuando cambia
        watch(
          () => resultadosFormulario.value[estudio.codigo].valor,
          () => {
            validarResultadoEnTiempoReal(estudio)
            marcarComoModificado(estudio.codigo)
          }
        )
      })

      // Establecer tab activa
      if (tiposMuestraUnicos.value.length > 0) {
        tabActiva.value = tiposMuestraUnicos.value[0]
      }
    }
  },
  { immediate: true, deep: true }
)

// Actualizar referencia automáticamente
const actualizarReferencia = (estudio: Estudio) => {
  const referencia = obtenerValorReferencia(
    estudio.codigo,
    props.orden.especie || 'Canino',
    props.orden.edad
  )
  if (referencia) {
    resultadosFormulario.value[estudio.codigo].referencia = `${referencia.minimo}-${referencia.maximo} ${referencia.unidad}`
  }
}

// Validar resultado en tiempo real
const validarResultadoEnTiempoReal = (estudio: Estudio) => {
  const resultado = resultadosFormulario.value[estudio.codigo]
  if (!resultado.valor) {
    validacionesPorEstudio.value[estudio.codigo] = {
      dentroDeRango: true,
      mensajes: []
    }
    return
  }

  const validacion = validacionResultadosService.validarResultado(estudio, resultado, {
    especie: props.orden.especie,
    edad: props.orden.edad,
    sexo: props.orden.sexo
  })

  validacionesPorEstudio.value[estudio.codigo] = validacion
}

// Obtener validación de un resultado
const obtenerValidacionResultado = (codigo: string) => {
  return validacionesPorEstudio.value[codigo]
}

const tiposMuestraUnicos = computed(() => {
  const tipos = new Set<TipoMuestra>()
  props.orden.estudios?.forEach(estudio => {
    if (estudio.tipoMuestra) {
      tipos.add(estudio.tipoMuestra)
    }
  })
  return Array.from(tipos)
})

const obtenerEstudiosPorMuestra = (tipoMuestra: TipoMuestra): Estudio[] => {
  return props.orden.estudios?.filter(e => e.tipoMuestra === tipoMuestra) || []
}

const obtenerNumeroMuestra = (tipoMuestra: TipoMuestra): string => {
  const muestra = props.orden.muestras?.find(m => m.tipoMuestra === tipoMuestra)
  return muestra?.numeroMuestra || 'N/A'
}

const obtenerEstadoMuestra = (tipoMuestra: TipoMuestra): string => {
  const muestra = props.orden.muestras?.find(m => m.tipoMuestra === tipoMuestra)
  return muestra?.estado || 'Desconocido'
}

const obtenerColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    pendiente: 'orange',
    cargado: 'blue',
    validado: 'positive',
    rechazado: 'negative',
    enmendado: 'warning'
  }
  return colores[estado] || 'grey'
}

const tieneValor = (codigoEstudio: string): boolean => {
  const resultado = resultadosFormulario.value[codigoEstudio]
  return !!(resultado && resultado.valor && resultado.valor.toString().trim())
}

const marcarComoModificado = (codigoEstudio: string) => {
  estudiosModificados.value.add(codigoEstudio)
}

const estudioNoModificado = (codigoEstudio: string): boolean => {
  return !estudiosModificados.value.has(codigoEstudio)
}

const guardarResultado = (estudio: Estudio, idx: number) => {
  const resultado = resultadosFormulario.value[estudio.codigo]
  estudio.estado = EstadoResultado.CARGADO
  estudio.resultado = {
    ...resultado,
    estado: EstadoResultado.CARGADO,
    fechaCarga: new Date().toISOString()
  } as ResultadoEstudio

  estudiosModificados.value.delete(estudio.codigo)
  emit('resultado-cargado', estudio.id || estudio.codigo)
}

const actualizarResultado = (estudio: Estudio, idx: number) => {
  const resultado = resultadosFormulario.value[estudio.codigo]
  estudio.resultado = {
    ...resultado,
    estado: 'cargado',
    fechaCarga: new Date().toISOString()
  } as ResultadoEstudio

  estudiosModificados.value.delete(estudio.codigo)
}

const validarResultado = (estudio: Estudio, idx: number) => {
  const resultado = resultadosFormulario.value[estudio.codigo]
  estudio.estado = EstadoResultado.VALIDADO
  estudio.resultado = {
    ...resultado,
    estado: EstadoResultado.VALIDADO,
    fechaValidacion: new Date().toISOString()
  } as ResultadoEstudio

  estudiosModificados.value.delete(estudio.codigo)
  emit('resultado-validado', estudio.id || estudio.codigo)
}

const reabrirResultado = (estudio: Estudio) => {
  estudio.estado = EstadoResultado.CARGADO
}

const tabActualizacion = () => {
  // Método de actualización cuando cambia la pestaña
}
</script>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 4px;
}

.p-ma-md {
  padding: 12px;
  margin: 12px;
}

:deep(.q-expansion-item__header) {
  padding: 8px;
}
</style>
