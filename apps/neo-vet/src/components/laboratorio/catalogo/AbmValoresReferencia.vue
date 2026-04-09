<template>
  <div class="laboratorio-abm">
    <!-- Cabecera -->
    <div class="abm-header">
      <div class="header-title">
        <q-icon name="assessment" size="32px" color="primary" class="q-mr-md" />
        <div>
          <div class="text-h5">Valores de Referencia</div>
          <div class="text-subtitle2 text-grey-7">Rangos normales por especie, edad, sexo y peso</div>
        </div>
      </div>
    </div>

    <!-- Barra de herramientas -->
    <div class="abm-toolbar">
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Valor"
        @click="abrirModal()"
        no-caps
      />

      <q-select
        v-model="filtroEspecie"
        :options="especiesDisponibles"
        outlined
        dense
        clearable
        placeholder="Filtrar por especie"
        emit-value
        map-options
        class="filter-select"
      />

      <q-select
        v-model="filtroPrueba"
        :options="pruebasDisponibles"
        outlined
        dense
        clearable
        placeholder="Filtrar por prueba"
        emit-value
        map-options
        option-label="nombre"
        option-value="id"
        class="filter-select"
      />

      <q-space />

      <q-btn
        flat
        round
        icon="download"
        color="info"
        @click="exportarCSV"
      >
        <q-tooltip>Exportar CSV</q-tooltip>
      </q-btn>

      <q-btn
        flat
        round
        icon="upload"
        color="info"
        @click="$refs.fileUpload.click()"
      >
        <q-tooltip>Importar CSV</q-tooltip>
      </q-btn>

      <input
        ref="fileUpload"
        type="file"
        accept=".csv"
        style="display: none"
        @change="importarCSV"
      />

      <q-btn
        flat
        round
        icon="refresh"
        color="info"
        @click="cargarValores"
        :loading="cargando"
      />
    </div>

    <!-- TABLA -->
    <q-card class="abm-tabla">
      <q-table
        :rows="valoresFiltrados"
        :columns="columns"
        row-key="id"
        :loading="cargando"
        :pagination.sync="pagination"
        @request="cargarValores"
        dense
      >
        <template v-slot:body-cell-prueba="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ obtenerNombrePrueba(props.row.idPrueba) }}</div>
            <div class="text-caption text-grey-7">{{ obtenerCodigoPrueba(props.row.idPrueba) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-especie="props">
          <q-td :props="props">
            <q-badge :label="capitalizarPrimera(props.row.especie)" color="blue" />
          </q-td>
        </template>

        <template v-slot:body-cell-sexo="props">
          <q-td :props="props">
            {{ props.row.sexo ? capitalizarPrimera(props.row.sexo) : 'Indistinto' }}
          </q-td>
        </template>

        <template v-slot:body-cell-edad="props">
          <q-td :props="props">
            <span v-if="props.row.edadMinima || props.row.edadMaxima">
              {{ props.row.edadMinima || 0 }} - {{ props.row.edadMaxima || '∞' }} años
            </span>
            <span v-else class="text-grey-7">Todas las edades</span>
          </q-td>
        </template>

        <template v-slot:body-cell-rango="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.valorMinimo }} - {{ props.row.valorMaximo }}</div>
            <div class="text-caption text-grey-7">
              ⚠️ {{ props.row.alertaMinima || '—' }} / 🔴 {{ props.row.alertaMaxima || '—' }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :label="props.row.estado"
              :color="props.row.estado === 'activo' ? 'positive' : 'negative'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              size="sm"
              icon="edit"
              color="primary"
              @click="abrirModal(props.row)"
            />
            <q-btn
              flat
              round
              size="sm"
              icon="delete"
              color="negative"
              @click="eliminarValor(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL -->
    <q-dialog v-model="mostrarModal" @hide="resetFormulario">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editando ? 'Editar Valor' : 'Nuevo Valor de Referencia' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="q-gutter-md">
            <!-- Prueba -->
            <q-select
              v-model="formulario.idPrueba"
              :options="pruebasDisponibles"
              label="Prueba *"
              outlined
              dense
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              :rules="[val => !!val || 'Requerido']"
            />

            <!-- Especie -->
            <q-select
              v-model="formulario.especie"
              :options="especiesDisponibles"
              label="Especie *"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Requerido']"
            />

            <!-- Sexo (opcional) -->
            <q-select
              v-model="formulario.sexo"
              :options="['macho', 'hembra']"
              label="Sexo (Opcional - dejar vacío para ambos)"
              outlined
              dense
              clearable
              emit-value
              map-options
            />

            <div class="row q-col-gutter-md">
              <!-- Edad Mínima -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.edadMinima"
                  label="Edad Mínima (años, opcional)"
                  outlined
                  dense
                  type="number"
                  min="0"
                />
              </div>

              <!-- Edad Máxima -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.edadMaxima"
                  label="Edad Máxima (años, opcional)"
                  outlined
                  dense
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <!-- Peso Mínimo -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.pesoMinimo"
                  label="Peso Mínimo (kg, opcional)"
                  outlined
                  dense
                  type="number"
                  min="0"
                  step="0.1"
                />
              </div>

              <!-- Peso Máximo -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.pesoMaximo"
                  label="Peso Máximo (kg, opcional)"
                  outlined
                  dense
                  type="number"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <!-- Valor Mínimo -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.valorMinimo"
                  label="Valor Mínimo (Rango Normal) *"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  :rules="[val => val !== null || 'Requerido']"
                />
              </div>

              <!-- Valor Máximo -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.valorMaximo"
                  label="Valor Máximo (Rango Normal) *"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  :rules="[val => val !== null || 'Requerido']"
                />
              </div>
            </div>

            <div class="text-caption bg-blue-1 q-pa-md rounded-borders">
              <strong>Valores de Alerta</strong> (Opcional - para destacar resultados anómalos)
            </div>

            <div class="row q-col-gutter-md">
              <!-- Alerta Mínima -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.alertaMinima"
                  label="Valor Crítico BAJO (opcional)"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  hint="Ej: 9.0 (para resaltar en naranja)"
                />
              </div>

              <!-- Alerta Máxima -->
              <div class="col-6">
                <q-input
                  v-model.number="formulario.alertaMaxima"
                  label="Valor Crítico ALTO (opcional)"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  hint="Ej: 18.0 (para resaltar en rojo)"
                />
              </div>
            </div>

            <!-- Observaciones -->
            <q-input
              v-model="formulario.observaciones"
              label="Observaciones"
              outlined
              type="textarea"
              rows="2"
            />

            <!-- Estado -->
            <q-select
              v-model="formulario.estado"
              :options="['activo', 'inactivo']"
              label="Estado"
              outlined
              dense
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="secondary" v-close-popup />
          <q-btn
            flat
            label="Guardar"
            color="primary"
            @click="guardarValor"
            :loading="guardando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ValoresReferenciaService from 'src/services/valores-referencia.service'
import PruebasService from 'src/services/pruebas.service'
import { ValorReferencia, CreateValorReferencia, Especie } from 'src/types/laboratorio-catalogo'

const $q = useQuasar()

// Estado
const cargando = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const editando = ref(false)
const valores = ref<ValorReferencia[]>([])
const pruebas = ref<any[]>([])

// Filtros
const filtroEspecie = ref<Especie | null>(null)
const filtroPrueba = ref<number | null>(null)

// Formulario
const formulario = ref<CreateValorReferencia>({
  idPrueba: null as any,
  especie: Especie.CANINO,
  sexo: undefined,
  edadMinima: undefined,
  edadMaxima: undefined,
  pesoMinimo: undefined,
  pesoMaximo: undefined,
  valorMinimo: 0,
  valorMaximo: 0,
  alertaMinima: undefined,
  alertaMaxima: undefined,
  observaciones: '',
  estado: 'activo'
})

const valorEditando = ref<ValorReferencia | null>(null)

// Paginación
const pagination = ref({
  sortBy: 'especie',
  descending: false,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const columns = [
  { name: 'prueba', label: 'Prueba', field: 'idPrueba', align: 'left' },
  { name: 'especie', label: 'Especie', field: 'especie', align: 'left' },
  { name: 'sexo', label: 'Sexo', field: 'sexo', align: 'center' },
  { name: 'edad', label: 'Edad', field: 'edad', align: 'left' },
  { name: 'rango', label: 'Rango Normal / Alertas', field: 'rango', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Datos disponibles
const especiesDisponibles = Object.values(Especie).map(e => ({
  label: e.charAt(0).toUpperCase() + e.slice(1),
  value: e
}))

const pruebasDisponibles = computed(() => {
  return pruebas.value.map(p => ({
    id: p.id,
    nombre: `${p.codigo} - ${p.nombre}`,
    codigo: p.codigo
  }))
})

// Computed
const valoresFiltrados = computed(() => {
  return valores.value.filter(v => {
    const coincideEspecie = !filtroEspecie.value || v.especie === filtroEspecie.value
    const coincidePrueba = !filtroPrueba.value || v.idPrueba === filtroPrueba.value
    return coincideEspecie && coincidePrueba
  })
})

// Métodos
const cargarValores = async () => {
  cargando.value = true
  try {
    const res = await ValoresReferenciaService.obtenerValores({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage
    })
    valores.value = res.data.data
    pagination.value.rowsNumber = res.data.total
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar valores'
    })
  } finally {
    cargando.value = false
  }
}

const cargarPruebas = async () => {
  try {
    const res = await PruebasService.obtenerActivas()
    pruebas.value = res.data
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar pruebas'
    })
  }
}

const abrirModal = (valor?: ValorReferencia) => {
  if (valor) {
    editando.value = true
    valorEditando.value = valor
    formulario.value = { ...valor }
  } else {
    editando.value = false
    resetFormulario()
  }
  mostrarModal.value = true
}

const resetFormulario = () => {
  formulario.value = {
    idPrueba: null as any,
    especie: Especie.CANINO,
    sexo: undefined,
    edadMinima: undefined,
    edadMaxima: undefined,
    pesoMinimo: undefined,
    pesoMaximo: undefined,
    valorMinimo: 0,
    valorMaximo: 0,
    alertaMinima: undefined,
    alertaMaxima: undefined,
    observaciones: '',
    estado: 'activo'
  }
}

const guardarValor = async () => {
  guardando.value = true
  try {
    if (editando.value && valorEditando.value) {
      await ValoresReferenciaService.actualizarValor(valorEditando.value.id, formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Valor actualizado'
      })
    } else {
      await ValoresReferenciaService.crearValor(formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Valor creado'
      })
    }
    mostrarModal.value = false
    cargarValores()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar'
    })
  } finally {
    guardando.value = false
  }
}

const eliminarValor = async (id: number) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este valor de referencia?',
    cancel: true
  }).onOk(async () => {
    try {
      await ValoresReferenciaService.eliminarValor(id)
      $q.notify({ type: 'positive', message: 'Eliminado' })
      cargarValores()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

const exportarCSV = async () => {
  try {
    const blob = await ValoresReferenciaService.exportarCSV()
    const url = window.URL.createObjectURL(blob.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `valores-referencia-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: 'Error al exportar' })
  }
}

const importarCSV = async (event: any) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const res = await ValoresReferenciaService.importarCSV(file)
    $q.notify({
      type: 'positive',
      message: `${res.data.importados} valores importados`
    })
    cargarValores()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al importar'
    })
  }
}

const obtenerNombrePrueba = (idPrueba: number): string => {
  return pruebas.value.find(p => p.id === idPrueba)?.nombre || 'Desconocida'
}

const obtenerCodigoPrueba = (idPrueba: number): string => {
  return pruebas.value.find(p => p.id === idPrueba)?.codigo || ''
}

const capitalizarPrimera = (texto: string): string => {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Ciclo de vida
onMounted(() => {
  cargarPruebas()
  cargarValores()
})
</script>

<style scoped lang="scss">
.laboratorio-abm {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.abm-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .header-title {
    display: flex;
    align-items: center;
  }
}

.abm-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .filter-select {
    min-width: 200px;
  }
}

.abm-tabla {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rounded-borders {
  border-radius: 4px;
}
</style>
