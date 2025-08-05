<template>
  <div class="resultados-container">
    <!-- Header con filtros y acciones -->
    <div class="resultados-header">
      <div class="header-title">
        <q-icon name="analytics" size="24px" color="primary" />
        <span class="title-text">Resultados de Laboratorio</span>
        <q-chip 
          :color="getEstadoColorOrden()" 
          text-color="white" 
          size="sm"
          :label="`${contadorEstados.validados}/${contadorEstados.total} validados`"
        />
      </div>
      
      <div class="header-actions">
        <q-input
          v-model="filtro"
          dense
          outlined
          placeholder="Buscar prueba, estudio o sector..."
          class="search-input"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
        
        <q-separator vertical inset class="q-mx-sm" />
        
        <q-btn-group flat>
          <q-btn
            :color="modoValidacionMasiva ? 'primary' : 'grey-7'"
            :icon="modoValidacionMasiva ? 'check_box' : 'check_box_outline_blank'"
            :label="modoValidacionMasiva ? 'Cancelar selección' : 'Selección múltiple'"
            size="sm"
            @click="toggleModoValidacionMasiva"
          />
          
          <q-btn
            v-if="modoValidacionMasiva"
            color="positive"
            icon="verified"
            label="Validar seleccionados"
            :disable="!hayResultadosSeleccionados"
            size="sm"
            @click="validarSeleccionados"
          />
          
          <q-btn
            v-if="modoValidacionMasiva"
            color="warning"
            icon="undo"
            label="Desvalidar seleccionados"
            :disable="!hayValidadosSeleccionados"
            size="sm"
            @click="desvalidarSeleccionados"
          />
        </q-btn-group>
      </div>
    </div>

    <!-- Tabla moderna -->
    <div class="tabla-wrapper">
      <q-table
        :rows="pruebasFiltradasYOrdenadas"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 50, sortBy: 'sectorNombre' }"
        :filter="filtro"
        :filter-method="filtrarPruebas"
        class="tabla-moderna"
        separator="horizontal"
        :selected-rows-label="getSelectedString"
        :selection="modoValidacionMasiva ? 'multiple' : 'none'"
        v-model:selected="pruebasSeleccionadas"
      >
        <!-- Encabezados personalizados -->
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-if="modoValidacionMasiva" auto-width>
              <q-checkbox 
                v-model="props.selected" 
                size="sm"
              />
            </q-th>
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              :class="col.headerClass"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Filas personalizadas -->
        <template v-slot:body="props">
          <q-tr 
            :props="props" 
            :class="getRowClass(props.row)"
            @click="modoValidacionMasiva && toggleSelection(props.row)"
          >
            <!-- Checkbox de selección -->
            <q-td v-if="modoValidacionMasiva" auto-width>
              <q-checkbox 
                v-model="props.selected" 
                size="sm"
                :disable="props.row.estado === 'pendiente'"
              />
            </q-td>
            
            <!-- Sector -->
            <q-td key="sectorNombre" :props="props">
              <div class="sector-info">
                <div 
                  class="sector-indicator"
                  :style="{ backgroundColor: getSectorColor(props.row.sectorId) }"
                />
                <div>
                  <div class="sector-name">{{ props.row.sectorNombre }}</div>
                  <div class="sector-id">{{ props.row.sectorId }}</div>
                </div>
              </div>
            </q-td>
            
            <!-- Estudio -->
            <q-td key="estudioNombre" :props="props">
              <div class="estudio-info">
                <div class="estudio-nombre">{{ props.row.estudioNombre }}</div>
                <div class="estudio-codigo">{{ props.row.codigo }}</div>
              </div>
            </q-td>
            
            <!-- Prueba -->
            <q-td key="nombre" :props="props">
              <div class="prueba-nombre">{{ props.row.nombre }}</div>
            </q-td>

            <!-- Rango Normal -->
            <q-td key="rango" :props="props">
              <div class="rango-info">
                <span v-if="props.row.valorMinimo || props.row.valorMaximo" class="rango-valores">
                  {{ formatearRango(props.row) }}
                </span>
                <span v-else class="no-rango">-</span>
              </div>
            </q-td>

            <!-- Unidad -->
            <q-td key="unidad" :props="props">
              <div class="unidad-info">
                <span v-if="props.row.unidad" class="unidad-text">{{ props.row.unidad }}</span>
                <span v-else class="no-unidad">-</span>
              </div>
            </q-td>
            
            <!-- Resultado -->
            <q-td key="resultado" :props="props" class="resultado-cell">
              <div class="resultado-container">
                <q-input
                  :model-value="getResultadoValue(props.row.id)"
                  @update:model-value="(val) => updateResultadoValue(props.row.id, val)"
                  type="text"
                  dense
                  outlined
                  square
                  :disable="props.row.estado === 'validado'"
                  @keyup.enter="focusNextResult(props.rowIndex)"
                  @blur="() => procesarResultadoFinal(props.row.id)"
                  :error="estaFueraDeRango(props.row)"
                  :error-message="getMensajeError(props.row)"
                  class="resultado-input"
                  :class="getInputClass(props.row)"
                  :placeholder="props.row.tipo === 'numerico' ? 'Ej: 12.5' : 'Ingrese resultado'"
                />
                
                <!-- Indicador de validación rápida -->
                <div v-if="getResultadoValue(props.row.id) && props.row.estado !== 'validado'" class="validacion-rapida">
                  <q-btn
                    dense
                    flat
                    round
                    size="sm"
                    icon="check"
                    color="positive"
                    @click="validarResultadoRapido(props.row)"
                  >
                    <q-tooltip>Validar resultado</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-td>
            
            <!-- Estado -->
            <q-td key="estado" :props="props">
              <q-badge 
                :color="getEstadoColor(props.row.estado)"
                :label="props.row.estado.toUpperCase()"
                class="estado-badge"
              />
            </q-td>
            
            <!-- Usuario que cargó -->
            <q-td key="usuarioCargo" :props="props">
              <div v-if="props.row.usuarioCargo" class="usuario-info">
                <div class="usuario-nombre">{{ props.row.usuarioCargo }}</div>
                <div v-if="props.row.fechaCarga" class="fecha-accion">
                  {{ formatearFecha(props.row.fechaCarga) }}
                </div>
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
            
            <!-- Usuario que validó -->
            <q-td key="usuarioValido" :props="props">
              <div v-if="props.row.usuarioValido" class="usuario-info">
                <div class="usuario-nombre">{{ props.row.usuarioValido }}</div>
                <div v-if="props.row.fechaValidacion" class="fecha-accion">
                  {{ formatearFecha(props.row.fechaValidacion) }}
                </div>
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
            
            <!-- Acciones -->
            <q-td key="acciones" :props="props">
              <div class="acciones-cell">
                <q-btn-group flat dense>
                  <q-btn
                    v-if="props.row.estado === 'cargado'"
                    dense
                    flat
                    round
                    icon="verified"
                    color="positive"
                    size="sm"
                    @click="validarResultado(props.row)"
                  >
                    <q-tooltip>Validar resultado</q-tooltip>
                  </q-btn>
                  
                  <q-btn
                    v-if="props.row.estado === 'validado'"
                    dense
                    flat
                    round
                    icon="undo"
                    color="warning"
                    size="sm"
                    @click="desvalidarResultado(props.row)"
                  >
                    <q-tooltip>Desvalidar resultado</q-tooltip>
                  </q-btn>
                  
                  <q-btn
                    dense
                    flat
                    round
                    icon="history"
                    color="info"
                    size="sm"
                    @click="mostrarHistorial(props.row)"
                  >
                    <q-tooltip>Ver historial</q-tooltip>
                  </q-btn>
                  
                  <q-btn
                    v-if="estaFueraDeRango(props.row)"
                    dense
                    flat
                    round
                    icon="warning"
                    color="orange"
                    size="sm"
                  >
                    <q-tooltip>Valor fuera de rango normal</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- Slot para cuando no hay datos -->
        <template v-slot:no-data>
          <div class="no-data-container">
            <q-icon name="science" size="48px" color="grey-4" />
            <div class="no-data-text">No hay resultados para mostrar</div>
            <div class="no-data-subtitle">Los resultados aparecerán aquí una vez que se genere la orden</div>
          </div>
        </template>
      </q-table>
    </div>

    <!-- Footer con estadísticas -->
    <div class="tabla-footer">
      <div class="estadisticas">
        <q-chip outline color="grey-7" size="sm">
          <q-icon name="assignment" class="q-mr-xs" />
          Total: {{ contadorEstados.total }}
        </q-chip>
        <q-chip outline color="orange" size="sm">
          <q-icon name="pending" class="q-mr-xs" />
          Pendientes: {{ contadorEstados.pendientes }}
        </q-chip>
        <q-chip outline color="blue" size="sm">
          <q-icon name="edit" class="q-mr-xs" />
          Cargados: {{ contadorEstados.cargados }}
        </q-chip>
        <q-chip outline color="positive" size="sm">
          <q-icon name="check_circle" class="q-mr-xs" />
          Validados: {{ contadorEstados.validados }}
        </q-chip>
      </div>
      
      <div class="progreso-validacion">
        <q-linear-progress
          :value="progresoValidacion"
          color="positive"
          size="4px"
          class="q-mt-xs"
        />
        <div class="progreso-texto">
          {{ Math.round(progresoValidacion * 100) }}% completado
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, reactive } from 'vue'
import { useQuasar } from 'quasar'

// Types
interface Prueba {
  id: string
  estudioId: string
  codigo: string
  nombre: string
  tipo: 'numerico' | 'texto'
  resultado: string | number | null
  valorMinimo?: number
  valorMaximo?: number
  unidad?: string
  estado: 'pendiente' | 'cargado' | 'validado'
  sectorId: string
  sectorNombre: string
  estudioNombre: string
  usuarioCargo?: string
  fechaCarga?: string
  usuarioValido?: string
  fechaValidacion?: string
}

// Props
const props = defineProps<{
  orden: {
    estudios: Array<{
      id: number
      codigo: string
      nombre: string
      sectorId: string
      sector: { nombre: string }
      estado: string
      pruebas: Prueba[]
    }>
  }
}>()

// Emits
const emit = defineEmits(['resultados-actualizados'])

// Composables
const $q = useQuasar()

// Estados reactivos
const filtro = ref('')
const modoValidacionMasiva = ref(false)
const pruebasSeleccionadas = ref<Prueba[]>([])

// Estado local para manejar los valores de los inputs independientemente
const valoresResultados = reactive<Record<string, string>>({})

// Inicializar valores de resultados
const inicializarValoresResultados = () => {
  if (!props.orden?.estudios) return
  
  props.orden.estudios.forEach(estudio => {
    if (Array.isArray(estudio.pruebas)) {
      estudio.pruebas.forEach(prueba => {
        if (!valoresResultados[prueba.id]) {
          valoresResultados[prueba.id] = prueba.resultado?.toString() || ''
        }
      })
    }
  })
}

// Inicializar valores al montar el componente
inicializarValoresResultados()

// Columnas de la tabla
const columns = [
  { 
    name: 'sectorNombre', 
    label: 'Sector', 
    field: 'sectorNombre', 
    align: 'left', 
    sortable: true,
    style: 'width: 140px'
  },
  { 
    name: 'estudioNombre', 
    label: 'Estudio', 
    field: 'estudioNombre', 
    align: 'left', 
    sortable: true,
    style: 'width: 180px'
  },
  { 
    name: 'nombre', 
    label: 'Prueba', 
    field: 'nombre', 
    align: 'left', 
    sortable: true,
    style: 'width: 200px'
  },
  { 
    name: 'rango', 
    label: 'Rango Normal', 
    field: 'rango', 
    align: 'center',
    style: 'width: 120px'
  },
  { 
    name: 'unidad', 
    label: 'Unidad', 
    field: 'unidad', 
    align: 'center',
    style: 'width: 80px'
  },
  { 
    name: 'resultado', 
    label: 'Resultado', 
    field: 'resultado', 
    align: 'center',
    style: 'width: 140px'
  },
  { 
    name: 'estado', 
    label: 'Estado', 
    field: 'estado', 
    align: 'center', 
    sortable: true,
    style: 'width: 100px'
  },
  { 
    name: 'usuarioCargo', 
    label: 'Cargado por', 
    field: 'usuarioCargo', 
    align: 'left',
    style: 'width: 120px'
  },
  { 
    name: 'usuarioValido', 
    label: 'Validado por', 
    field: 'usuarioValido', 
    align: 'left',
    style: 'width: 120px'
  },
  { 
    name: 'acciones', 
    label: 'Acciones', 
    field: '', 
    align: 'center',
    style: 'width: 120px'
  }
]

// Computed properties
const pruebasAplanadas = computed(() => {
  const pruebas: Prueba[] = []
  
  if (!props.orden?.estudios) return pruebas

  props.orden.estudios.forEach(estudio => {
    if (Array.isArray(estudio.pruebas)) {
      estudio.pruebas.forEach(prueba => {
        pruebas.push({
          ...prueba,
          sectorNombre: estudio.sector?.nombre || '',
          estudioNombre: estudio.nombre,
          estudioId: estudio.id.toString(),
          resultado: prueba.resultado ?? null
        })
      })
    }
  })
  
  return pruebas
})

const pruebasFiltradasYOrdenadas = computed(() => {
  return pruebasAplanadas.value.sort((a, b) => {
    if (a.sectorNombre !== b.sectorNombre) {
      return a.sectorNombre.localeCompare(b.sectorNombre)
    }
    if (a.estudioNombre !== b.estudioNombre) {
      return a.estudioNombre.localeCompare(b.estudioNombre)
    }
    return a.nombre.localeCompare(b.nombre)
  })
})

const contadorEstados = computed(() => {
  const total = pruebasAplanadas.value.length
  const pendientes = pruebasAplanadas.value.filter(p => p.estado === 'pendiente').length
  const cargados = pruebasAplanadas.value.filter(p => p.estado === 'cargado').length
  const validados = pruebasAplanadas.value.filter(p => p.estado === 'validado').length
  
  return { total, pendientes, cargados, validados }
})

const progresoValidacion = computed(() => {
  if (contadorEstados.value.total === 0) return 0
  return contadorEstados.value.validados / contadorEstados.value.total
})

const hayResultadosSeleccionados = computed(() => 
  pruebasSeleccionadas.value.some(p => p.estado === 'cargado')
)

const hayValidadosSeleccionados = computed(() => 
  pruebasSeleccionadas.value.some(p => p.estado === 'validado')
)

// Métodos para manejar los valores de los inputs
const getResultadoValue = (pruebaId: string): string => {
  return valoresResultados[pruebaId] || ''
}

const updateResultadoValue = (pruebaId: string, valor: string) => {
  console.log(`Actualizando valor - ID: ${pruebaId}, Valor: "${valor}"`)
  valoresResultados[pruebaId] = valor
}

const procesarResultadoFinal = (pruebaId: string) => {
  console.log(`Procesando resultado final - ID: ${pruebaId}`)
  
  const prueba = pruebasAplanadas.value.find(p => p.id === pruebaId)
  if (!prueba) return
  
  const valor = valoresResultados[pruebaId]?.trim() || ''
  
  if (!valor) {
    // Valor vacío
    prueba.estado = 'pendiente'
    prueba.usuarioCargo = undefined
    prueba.fechaCarga = undefined
    prueba.resultado = null
  } else {
    // Hay valor, procesear según tipo
    if (prueba.tipo === 'numerico') {
      const valorNumerico = parseFloat(valor.replace(',', '.'))
      
      if (!isNaN(valorNumerico)) {
        prueba.resultado = valorNumerico
      } else {
        prueba.resultado = valor
        $q.notify({
          type: 'warning',
          message: `"${valor}" no es un número válido para ${prueba.nombre}`,
          position: 'top-right',
          timeout: 3000
        })
      }
    } else {
      prueba.resultado = valor
    }
    
    // Actualizar estado si no está validado
    if (prueba.estado !== 'validado') {
      prueba.estado = 'cargado'
      prueba.usuarioCargo = 'Usuario Actual'
      prueba.fechaCarga = new Date().toISOString()
    }
    
    // Verificar rango
    if (estaFueraDeRango(prueba)) {
      $q.notify({
        type: 'warning',
        message: `Valor fuera del rango normal: ${formatearRango(prueba)}`,
        position: 'top-right',
        timeout: 4000
      })
    }
  }
  
  // Emitir cambios
  emit('resultados-actualizados', [prueba])
  console.log(`Resultado procesado - Estado: ${prueba.estado}, Resultado: ${prueba.resultado}`)
}

// Métodos para estilos y colores
const getSectorColor = (sectorId: string) => {
  const colores: Record<string, string> = {
    'HEM': '#7c3aed',
    'BQ': '#0d9488', 
    'QUI': '#059669',
    'MICRO': '#475569'
  }
  return colores[sectorId] || '#6b7280'
}

const getEstadoColor = (estado: string) => {
  const colores: Record<string, string> = {
    'pendiente': 'grey-5',
    'cargado': 'orange',
    'validado': 'positive'
  }
  return colores[estado] || 'grey-5'
}

const getEstadoColorOrden = () => {
  const { validados, total } = contadorEstados.value
  if (validados === total && total > 0) return 'positive'
  if (validados > 0) return 'orange'
  return 'grey-5'
}

const getRowClass = (prueba: Prueba) => {
  return [
    'tabla-row',
    `estado-${prueba.estado}`,
    { 'fuera-rango': estaFueraDeRango(prueba) },
    { 'row-selectable': modoValidacionMasiva.value }
  ]
}

const getInputClass = (prueba: Prueba) => {
  return [
    'resultado-input-modern',
    { 'input-validado': prueba.estado === 'validado' },
    { 'input-error': estaFueraDeRango(prueba) },
    { 'input-cargado': prueba.estado === 'cargado' }
  ]
}

// Métodos de validación
const estaFueraDeRango = (prueba: Prueba) => {
  if (prueba.tipo !== 'numerico' || !prueba.resultado) return false
  
  let valorNumerico: number
  if (typeof prueba.resultado === 'string') {
    valorNumerico = parseFloat(prueba.resultado.replace(',', '.'))
    if (isNaN(valorNumerico)) return false
  } else {
    valorNumerico = Number(prueba.resultado)
  }
  
  return (
    (prueba.valorMinimo !== undefined && valorNumerico < prueba.valorMinimo) ||
    (prueba.valorMaximo !== undefined && valorNumerico > prueba.valorMaximo)
  )
}

const getMensajeError = (prueba: Prueba) => {
  if (!estaFueraDeRango(prueba)) return ''
  return `Valor fuera del rango normal (${formatearRango(prueba)})`
}

// Métodos de formateo
const formatearRango = (prueba: Prueba) => {
  if (!prueba.valorMinimo && !prueba.valorMaximo) return 'No definido'
  if (prueba.valorMinimo && prueba.valorMaximo) {
    return `${prueba.valorMinimo} - ${prueba.valorMaximo}`
  }
  if (prueba.valorMinimo) return `≥ ${prueba.valorMinimo}`
  if (prueba.valorMaximo) return `≤ ${prueba.valorMaximo}`
  return ''
}

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos de navegación
const focusNextResult = async (currentIndex: number) => {
  await nextTick()
  
  const inputs = document.querySelectorAll('.tabla-moderna .resultado-input input')
  
  if (inputs && currentIndex + 1 < inputs.length) {
    const nextInput = inputs[currentIndex + 1] as HTMLInputElement
    if (nextInput && !nextInput.disabled) {
      nextInput.focus()
      nextInput.select()
    }
  }
}

const validarResultadoRapido = (prueba: Prueba) => {
  if (!getResultadoValue(prueba.id)) return
  
  // Primero procesar el resultado
  procesarResultadoFinal(prueba.id)
  
  // Luego validar
  prueba.estado = 'validado'
  prueba.usuarioValido = 'Usuario Actual'
  prueba.fechaValidacion = new Date().toISOString()
  
  emit('resultados-actualizados', [prueba])
  
  $q.notify({
    type: 'positive',
    message: 'Resultado validado',
    position: 'top-right',
    timeout: 1500
  })
}

const validarResultado = (prueba: Prueba) => {
  validarResultadoRapido(prueba)
}

const desvalidarResultado = (prueba: Prueba) => {
  prueba.estado = 'cargado'
  prueba.usuarioValido = undefined
  prueba.fechaValidacion = undefined
  
  emit('resultados-actualizados', [prueba])
  
  $q.notify({
    type: 'info',
    message: 'Resultado desvalidado',
    position: 'top-right',
    timeout: 1500
  })
}

// Métodos de validación masiva
const toggleModoValidacionMasiva = () => {
  modoValidacionMasiva.value = !modoValidacionMasiva.value
  if (!modoValidacionMasiva.value) {
    pruebasSeleccionadas.value = []
  }
}

const toggleSelection = (prueba: Prueba) => {
  if (prueba.estado === 'pendiente') return
  
  const index = pruebasSeleccionadas.value.findIndex(p => p.id === prueba.id)
  if (index > -1) {
    pruebasSeleccionadas.value.splice(index, 1)
  } else {
    pruebasSeleccionadas.value.push(prueba)
  }
}

const validarSeleccionados = () => {
  const pruebasAValidar = pruebasSeleccionadas.value.filter(p => p.estado === 'cargado')
  
  pruebasAValidar.forEach(prueba => {
    prueba.estado = 'validado'
    prueba.usuarioValido = 'Usuario Actual'
    prueba.fechaValidacion = new Date().toISOString()
  })
  
  emit('resultados-actualizados', pruebasAValidar)
  pruebasSeleccionadas.value = []
  
  $q.notify({
    type: 'positive',
    message: `${pruebasAValidar.length} resultados validados`,
    position: 'top-right'
  })
}

const desvalidarSeleccionados = () => {
  const pruebasADesvalidar = pruebasSeleccionadas.value.filter(p => p.estado === 'validado')
  
  pruebasADesvalidar.forEach(prueba => {
    prueba.estado = 'cargado'
    prueba.usuarioValido = undefined
    prueba.fechaValidacion = undefined
  })
  
  emit('resultados-actualizados', pruebasADesvalidar)
  pruebasSeleccionadas.value = []
  
  $q.notify({
    type: 'info',
    message: `${pruebasADesvalidar.length} resultados desvalidados`,
    position: 'top-right'
  })
}

// Métodos auxiliares
const filtrarPruebas = (rows: Prueba[], terms: string) => {
  if (!terms) return rows
  
  const terminos = terms.toLowerCase().split(' ')
  return rows.filter(row => 
    terminos.every(termino => 
      row.nombre.toLowerCase().includes(termino) ||
      row.estudioNombre.toLowerCase().includes(termino) ||
      row.sectorNombre.toLowerCase().includes(termino) ||
      row.codigo.toLowerCase().includes(termino)
    )
  )
}

const getSelectedString = () => {
  return pruebasSeleccionadas.value.length === 0 
    ? '' 
    : `${pruebasSeleccionadas.value.length} de ${pruebasAplanadas.value.length} seleccionados`
}

const mostrarHistorial = (prueba: Prueba) => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de historial en desarrollo',
    position: 'top-right'
  })
}
</script>

<style scoped>
/* Contenedor principal */
.resultados-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 16px 0;
}

/* Header */
.resultados-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.search-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.search-input :deep(.q-field__native) {
  color: white;
}

.search-input :deep(.q-field__native)::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

/* Tabla wrapper */
.tabla-wrapper {
  background: white;
  min-height: 400px;
}

/* Tabla moderna con diseño limpio */
.tabla-moderna {
  background: white;
}

.tabla-moderna :deep(.q-table__top) {
  display: none;
}

.tabla-moderna :deep(.q-table thead) {
  background: #f8fafc;
}

.tabla-moderna :deep(.q-table thead th) {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
}

.tabla-moderna :deep(.q-table thead th:last-child) {
  border-right: none;
}

.tabla-moderna :deep(.q-table tbody td) {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  border-right: 1px solid #f8fafc;
  vertical-align: middle;
  font-size: 13px;
}

.tabla-moderna :deep(.q-table tbody td:last-child) {
  border-right: none;
}

/* Filas de la tabla */
.tabla-row {
  transition: all 0.2s ease;
}

.tabla-row:hover {
  background-color: #f8fafc !important;
}

.tabla-row.row-selectable {
  cursor: pointer;
}

.tabla-row.estado-validado {
  background-color: #f0fdf4;
  border-left: 3px solid #22c55e;
}

.tabla-row.estado-cargado {
  background-color: #fffbeb;
  border-left: 3px solid #f59e0b;
}

.tabla-row.estado-pendiente {
  background-color: #f9fafb;
  border-left: 3px solid #9ca3af;
}

.tabla-row.fuera-rango {
  background-color: #fef2f2;
  border-left: 3px solid #ef4444;
}

/* Sector info */
.sector-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sector-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sector-name {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.sector-id {
  font-size: 10px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

/* Estudio info */
.estudio-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.estudio-nombre {
  font-weight: 500;
  color: #374151;
  font-size: 13px;
  line-height: 1.3;
}

.estudio-codigo {
  font-size: 10px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

/* Prueba nombre */
.prueba-nombre {
  font-weight: 500;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.4;
}

/* Rango info */
.rango-info {
  text-align: center;
}

.rango-valores {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #374151;
  font-weight: 600;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.no-rango {
  color: #9ca3af;
  font-size: 12px;
}

/* Unidad info */
.unidad-info {
  text-align: center;
}

.unidad-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #374151;
  font-weight: 600;
  background: #e0f2fe;
  padding: 4px 8px;
  border-radius: 4px;
}

.no-unidad {
  color: #9ca3af;
  font-size: 12px;
}

/* Resultado cell */
.resultado-cell {
  width: 140px;
}

.resultado-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.resultado-input {
  flex: 1;
}

.resultado-input :deep(.q-field__control) {
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 36px;
}

.resultado-input :deep(.q-field__native) {
  text-align: center;
  padding: 8px 12px;
}

.resultado-input-modern.input-validado :deep(.q-field__control) {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #15803d;
}

.resultado-input-modern.input-cargado :deep(.q-field__control) {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #d97706;
}

.resultado-input-modern.input-error :deep(.q-field__control) {
  background: #fef2f2;
  border-color: #ef4444;
}

.resultado-input-modern.input-error :deep(.q-field__native) {
  color: #dc2626;
}

.resultado-input:focus-within :deep(.q-field__control) {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Validación rápida */
.validacion-rapida {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resultado-container:hover .validacion-rapida {
  opacity: 1;
}

/* Estado badge */
.estado-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Usuario info */
.usuario-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.usuario-nombre {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.fecha-accion {
  font-size: 10px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
}

/* Acciones */
.acciones-cell {
  width: 120px;
  text-align: center;
}

/* No data */
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  color: #9ca3af;
}

.no-data-text {
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
  color: #6b7280;
}

.no-data-subtitle {
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
  color: #9ca3af;
}

/* Footer */
.tabla-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.estadisticas {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.progreso-validacion {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 140px;
}

.progreso-texto {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  margin-top: 4px;
}

/* Selección múltiple */
.tabla-moderna :deep(.q-table tbody tr.selected) {
  background-color: rgba(59, 130, 246, 0.08) !important;
  border-left: 4px solid #3b82f6 !important;
}

/* Responsive */
@media (max-width: 1200px) {
  .resultados-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 768px) {
  .resultados-container {
    border-radius: 0;
    margin: 0 -16px;
  }
  
  .resultados-header {
    padding: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .tabla-moderna :deep(.q-table thead th),
  .tabla-moderna :deep(.q-table tbody td) {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  .tabla-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .estadisticas {
    justify-content: center;
  }
  
  .progreso-validacion {
    align-items: center;
  }
}

/* Animaciones sutiles */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tabla-row {
  animation: fadeIn 0.3s ease;
}

/* Tooltips */
.q-tooltip {
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Estados hover mejorados */
.tabla-moderna :deep(.q-btn:hover) {
  transform: scale(1.05);
  transition: transform 0.1s ease;
}

/* Mejoras para campos de entrada */
.resultado-input :deep(.q-field__messages) {
  font-size: 10px;
  min-height: 14px;
  padding-top: 2px;
}

/* Print styles */
@media print {
  .resultados-header,
  .tabla-footer,
  .acciones-cell,
  .validacion-rapida {
    display: none !important;
  }
  
  .resultados-container {
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }
}
</style>