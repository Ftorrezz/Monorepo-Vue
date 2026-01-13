<template>
  <div class="busqueda-rapida-container">
    <!-- Search Fields -->
    <div class="row q-col-gutter-sm q-mb-md items-center">
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-input
          v-model="formData.primerapellido"
          outlined
          dense
          label="Primer Apellido"
          class="uppercase"
          clearable
          @update:model-value="busquedaAutomatica ? realizarBusqueda() : null"
          @keyup.enter="buscar"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-input
          v-model="formData.segundoapellido"
          outlined
          dense
          label="Segundo Apellido"
          class="uppercase"
          clearable
          @update:model-value="busquedaAutomatica ? realizarBusqueda() : null"
          @keyup.enter="buscar"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-input
          v-model="formData.nombre"
          outlined
          dense
          label="Nombres"
          class="uppercase"
          clearable
          @update:model-value="busquedaAutomatica ? realizarBusqueda() : null"
          @keyup.enter="buscar"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-input
          v-model="formData.email"
          outlined
          dense
          label="Email"
          type="email"
          clearable
          @update:model-value="busquedaAutomatica ? realizarBusqueda() : null"
          @keyup.enter="buscar"
        >
          <template v-slot:prepend>
            <q-icon name="mail" size="xs" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-input
          v-model="formData.telefono1"
          outlined
          dense
          label="Teléfono"
          clearable
          @update:model-value="busquedaAutomatica ? realizarBusqueda() : null"
          @keyup.enter="buscar"
        >
          <template v-slot:prepend>
            <q-icon name="phone" size="xs" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="row items-center no-wrap q-gutter-sm">
          <q-btn
            v-if="!busquedaAutomatica"
            color="primary"
            icon="search"
            label="Buscar"
            @click="buscar"
            :disable="!tieneMinimoCaracteres"
            class="col"
          />
          
          <q-btn
            flat
            dense
            color="grey-7"
            icon="restart_alt"
            label="Limpiar"
            @click="limpiarBusqueda"
            :disable="!tieneAlgunCampoLleno"
            class="q-px-sm"
          >
            <q-tooltip>Reiniciar filtros</q-tooltip>
          </q-btn>

          <q-toggle
            v-model="busquedaAutomatica"
            color="primary"
            icon="auto_mode"
            size="sm"
          >
            <q-tooltip>
              {{ busquedaAutomatica ? 'Búsqueda automática' : 'Búsqueda manual' }}
            </q-tooltip>
          </q-toggle>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="text-center q-pa-md">
      <q-spinner color="primary" size="40px" />
      <p class="text-grey-7 q-mt-sm">Buscando...</p>
    </div>

    <!-- Results Table -->
    <q-table
      v-else-if="resultados.length > 0"
      :rows="resultados"
      :columns="columns"
      row-key="_rowId"
      flat
      bordered
      :pagination="{ rowsPerPage: 5 }"
      :rows-per-page-options="[5, 10, 15]"
      class="resultados-table"
    >
      <template v-slot:top>
        <div class="row items-center justify-between full-width">
          <span class="text-subtitle2">
            {{ resultados.length }} propietario(s) encontrado(s)
          </span>
          <q-btn
            unelevated
            color="primary"
            icon="person_add"
            label="Nuevo Propietario"
            @click="emit('nuevo-propietario')"
            size="sm"
          />
        </div>
      </template>

      <template v-slot:header-cell-expand="props">
        <q-th :props="props" auto-width />
      </template>

      <template v-slot:body="props">
        <q-tr
          :props="props"
          class="cursor-pointer"
          @click="seleccionarPropietario(props.row)"
        >
          <q-td v-for="col in props.cols" :key="col.name" :props="props" :auto-width="col.name === 'expand'">
            <template v-if="col.name === 'expand'">
              <q-btn
                v-if="props.row.mascotas && props.row.mascotas.length > 0"
                size="sm"
                color="primary"
                round
                dense
                flat
                @click.stop="props.expand = !props.expand"
                :icon="props.expand ? 'expand_less' : 'expand_more'"
              >
                <q-tooltip>{{ props.expand ? 'Ocultar' : 'Ver' }} mascotas</q-tooltip>
              </q-btn>
            </template>

            <template v-else-if="col.name === 'nombre_completo'">
              <div class="text-weight-medium">{{ col.value }}</div>
            </template>

            <template v-else-if="col.name === 'num_mascotas'">
              <q-badge :color="col.value > 0 ? 'positive' : 'grey'">
                {{ col.value }} mascota{{ col.value !== 1 ? 's' : '' }}
              </q-badge>
            </template>

            <template v-else>
              {{ col.value || '-' }}
            </template>
          </q-td>
        </q-tr>

        <!-- Expanded row with pets list -->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="q-pa-sm bg-blue-1">
              <div class="text-subtitle2 text-primary q-mb-xs">
                <q-icon name="pets" size="sm" class="q-mr-xs" />
                Mascotas de {{ getNombreCompleto(props.row) }}:
              </div>
              <div class="row q-col-gutter-sm">
                <div 
                  v-for="(mascota, index) in props.row.mascotas" 
                  :key="index"
                  class="col-auto"
                >
                  <q-chip
                    square
                    color="secondary"
                    text-color="white"
                    icon="pets"
                    size="sm"
                  >
                    {{ mascota.nombre }}
                    <q-tooltip v-if="mascota.especie || mascota.raza">
                      {{ mascota.especie || '' }} {{ mascota.raza ? `- ${mascota.raza}` : '' }}
                    </q-tooltip>
                  </q-chip>
                </div>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Empty State -->
    <div v-else-if="tieneAlgunCampoLleno && !cargando" class="empty-state">
      <q-icon name="search_off" size="64px" color="grey-5" />
      <p class="text-grey-7 q-mt-md">No se encontraron propietarios con los criterios especificados</p>
    </div>

    <!-- Initial State -->
    <div v-else class="initial-state">
      <q-icon name="person_search" size="64px" color="grey-4" />
      <p class="text-grey-6 q-mt-md">
        Ingresa al menos <strong>3 caracteres</strong> en cualquier campo para buscar
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NdPeticionControl from 'src/controles/rest.control'
import { DtoParametros } from 'src/controles/dto.parametros'
import { useQuasar } from 'quasar'

const emit = defineEmits(['propietario-seleccionado', 'nuevo-propietario'])
const $q = useQuasar()

// State
const busquedaAutomatica = ref(true)
const formData = ref({
  primerapellido: '',
  segundoapellido: '',
  nombre: '',
  email: '',
  telefono1: ''
})
const resultados = ref([])
const cargando = ref(false)
let timeoutBusqueda = null

// Computed
const tieneAlgunCampoLleno = computed(() => {
  return formData.value.primerapellido.trim() !== '' ||
         formData.value.segundoapellido.trim() !== '' ||
         formData.value.nombre.trim() !== '' ||
         formData.value.email.trim() !== '' ||
         formData.value.telefono1.trim() !== ''
})

const tieneMinimoCaracteres = computed(() => {
  const min = 3
  return formData.value.primerapellido.trim().length >= min ||
         formData.value.segundoapellido.trim().length >= min ||
         formData.value.nombre.trim().length >= min ||
         formData.value.email.trim().length >= min ||
         formData.value.telefono1.trim().length >= min
})

// Columns - Fixed to match backend response
const columns = [
  {
    name: 'expand',
    label: '',
    field: row => '',
    align: 'left'
  },
  {
    name: 'nombre_completo',
    label: 'Nombre Completo',
    field: row => {
      const nombre = row.propietario.nombre || row.propietario.nombres || ''
      const primer = row.propietario.primerapellido || row.propietario.primer_apellido || ''
      const segundo = row.propietario.segundoapellido || row.propietario.segundo_apellido || ''
      return `${primer} ${segundo} ${nombre}`.trim() || '-'
    },
    align: 'left',
    sortable: true
  },
  {
    name: 'telefono1',
    label: 'Teléfono',
    field: row => row.propietario.contacto?.telefono1 || row.propietario.telefono1 || row.propietario.telefono || '-',
    align: 'left',
    sortable: true
  },
  {
    name: 'email',
    label: 'Correo electrónico',
    field: row => row.propietario.contacto?.email || row.propietario.email || row.propietario.correo || '-',
    align: 'left',
    sortable: true
  },
  {
    name: 'num_mascotas',
    label: 'Mascotas',
    field: row => row.mascotas?.length || 0,
    align: 'center',
    sortable: true
  }
]

// Methods
const realizarBusqueda = () => {
  // Clear results if not enough data
  if (!tieneMinimoCaracteres.value) {
    resultados.value = []
    return
  }

  clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(async () => {
    await buscar()
  }, 400)
}

const buscar = async () => {
  if (!tieneMinimoCaracteres.value) {
    $q.notify({
      type: 'warning',
      message: 'Ingresa al menos 3 caracteres para buscar',
      position: 'top'
    })
    return
  }

  cargando.value = true
  try {
    const peticion = new NdPeticionControl()
    
    // Use the same pattern as BusquedaPropietarioMascota.vue
    const dtoParametros = new DtoParametros()
    dtoParametros.filtro = {
      id_sitio: 1, // TODO: get from global context
      nombre: formData.value.nombre,
      primerapellido: formData.value.primerapellido,
      segundoapellido: formData.value.segundoapellido,
      email: formData.value.email,
      telefono1: formData.value.telefono1
    }
    
    const response = await peticion.invocarMetodo('filtropropietariomascota/filtro', 'post', dtoParametros)
    const data = Array.isArray(response) ? response : (response?.data || [])
    
    // Garantizar IDs únicos para evitar problemas de expansión/selección múltiple
    resultados.value = data.map((item, index) => ({
      ...item,
      _rowId: item.propietario?.id ? `${item.propietario.id}_${index}` : `row_${index}`
    }))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al buscar propietarios',
      caption: error.message
    })
    resultados.value = []
  } finally {
    cargando.value = false
  }
}

const limpiarBusqueda = () => {
  formData.value = {
    primerapellido: '',
    segundoapellido: '',
    nombre: '',
    email: '',
    telefono1: ''
  }
  resultados.value = []
}

const seleccionarPropietario = (row) => {
  emit('propietario-seleccionado', row)
}

const getNombreCompleto = (row) => {
  if (!row?.propietario) return '-'
  const p = row.propietario
  const nombre = p.nombre || p.nombres || ''
  const primer = p.primerapellido || p.primer_apellido || ''
  const segundo = p.segundoapellido || p.segundo_apellido || ''
  return `${primer} ${segundo} ${nombre}`.trim() || '-'
}
</script>

<style scoped>
.busqueda-rapida-container {
  min-height: 300px;
}

.resultados-table {
  border-radius: 8px;
  overflow: hidden;
}

.resultados-table :deep(tbody tr) {
  transition: background-color 0.2s ease;
}

.resultados-table :deep(tbody tr:hover) {
  background-color: #f8faff;
}

.empty-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
