<template>
    <q-card class="servicio-card">
      <q-card-section class="bg-green-1">
        <div class="row items-center">
          <q-icon name="vaccines" color="green" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Vacunación</div>
            <div class="text-caption text-grey-7">Registro de aplicación de vacunas</div>
          </div>
          <q-btn-dropdown 
            flat round 
            icon="more_vert"
            :disable="modoLectura"
          >
            <q-list>
              <q-item clickable @click="completarVacunacion" :disable="!formularioValido">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive"/>
                </q-item-section>
                <q-item-section>Marcar como Completada</q-item-section>
              </q-item>
              <q-item clickable @click="eliminarServicio">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative"/>
                </q-item-section>
                <q-item-section>Eliminar</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-card-section>
      
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-12">
            <q-select
              v-model="datosVacuna.producto"
              :options="productosVacuna"
              label="Buscar Vacuna en Inventario"
              outlined
              use-input
              @filter="buscarVacunas"
              hint="Selecciona para autocompletar lote y laboratorio"
              :readonly="modoLectura"
              @update:model-value="alSeleccionarProducto"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron vacunas disponibles
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.tipoVacuna"
              :options="tiposVacuna"
              label="Tipo de Vacuna *"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.laboratorio"
              :options="laboratorios"
              label="Laboratorio *"
              outlined
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-select
              v-model="datosVacuna.lote"
              :options="lotesDisponibles"
              label="Lote Seleccionado *"
              outlined
              :readonly="modoLectura || !datosVacuna.producto"
              @update:model-value="alSeleccionarLote"
              option-label="numeroLote"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.numeroLote }}</q-item-label>
                    <q-item-label caption>Vence: {{ scope.opt.fechaVencimiento }} | Stock: {{ scope.opt.cantidadDisponible }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.fechaVencimiento"
              label="Fecha de Vencimiento"
              outlined
              type="date"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.dosisAplicada"
              label="Dosis Aplicada (ml) *"
              outlined
              type="number"
              step="0.1"
              min="0"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Detalles de aplicación -->
          <div class="col-12">
            <q-separator class="q-my-md"/>
            <div class="text-subtitle2 q-mb-md">Detalles de Aplicación</div>
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.viaAdministracion"
              :options="viasAdministracion"
              label="Vía de Administración"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-input
              v-model="datosVacuna.sitioAplicacion"
              label="Sitio de Aplicación"
              outlined
              placeholder="Ej: Flanco izquierdo, cuello..."
              :readonly="modoLectura"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-input
              v-model="datosVacuna.proximaVacuna"
              label="Próxima Vacunación"
              outlined
              type="date"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Reacciones adversas -->
          <div class="col-12">
            <q-checkbox
              v-model="datosVacuna.reaccionesAdversas"
              label="¿Se presentaron reacciones adversas?"
              :disable="modoLectura"
            />
          </div>
          
          <div v-if="datosVacuna.reaccionesAdversas" class="col-12">
            <q-input
              v-model="datosVacuna.descripcionReacciones"
              label="Descripción de Reacciones"
              outlined
              type="textarea"
              rows="2"
              :readonly="modoLectura"
            />
          </div>
          
          <!-- Observaciones -->
          <div class="col-12">
            <q-input
              v-model="datosVacuna.observaciones"
              label="Observaciones"
              outlined
              type="textarea"
              rows="2"
              :readonly="modoLectura"
            />
          </div>
        </div>
      </q-card-section>
      
      <!-- Estado y acciones -->
      <q-card-section v-if="!modoLectura" class="bg-grey-1">
        <div class="row items-center justify-between">
          <div class="col-auto">
            <q-chip 
              :color="formularioValido ? 'green' : 'orange'"
              text-color="white"
              :icon="formularioValido ? 'check_circle' : 'warning'"
              :label="formularioValido ? 'Datos Completos' : 'Datos Incompletos'"
            />
          </div>
          
          <div class="col-auto">
            <q-btn
              color="positive"
              icon="check"
              label="Completar Vacunación"
              @click="completarVacunacion"
              :disable="!formularioValido"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import inventarioService from 'src/services/inventario.service'
  import { useQuasar } from 'quasar'

  const $q = useQuasar()
  
  // Props
  const props = defineProps({
    atencionId: {
      type: String,
      required: true
    },
    servicioId: {
      type: String,
      required: true
    },
    modoLectura: {
      type: Boolean,
      default: false
    }
  })
  
  // Emits
  const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado'])
  
  // Estados del formulario
  const datosVacuna = ref({
    producto: null,
    lote: null,
    tipoVacuna: '',
    laboratorio: '',
    numeroLote: '',
    fechaVencimiento: '',
    dosisAplicada: '',
    viaAdministracion: 'subcutanea',
    sitioAplicacion: '',
    proximaVacuna: '',
    reaccionesAdversas: false,
    descripcionReacciones: '',
    observaciones: ''
  })

  const productosVacuna = ref([])
  const lotesDisponibles = ref([])
  
  // Opciones para selects
  const tiposVacuna = [
    { label: 'Triple Felina (FVRCP)', value: 'triple_felina', especies: ['felino'] },
    { label: 'Rabia', value: 'rabia', especies: ['canino', 'felino'] },
    { label: 'Parvovirus Canino', value: 'parvovirus', especies: ['canino'] },
    { label: 'Hepatitis Canina', value: 'hepatitis', especies: ['canino'] },
    { label: 'Moquillo Canino', value: 'moquillo', especies: ['canino'] },
    { label: 'Bordetella', value: 'bordetella', especies: ['canino'] },
    { label: 'Leucemia Felina', value: 'leucemia_felina', especies: ['felino'] },
    { label: 'Otra', value: 'otra', especies: ['canino', 'felino'] }
  ]
  
  const laboratorios = [
    'Zoetis', 'MSD Animal Health', 'Boehringer Ingelheim', 
    'Virbac', 'HIPRA', 'Fort Dodge', 'Otro'
  ]
  
  const viasAdministracion = [
    { label: 'Subcutánea', value: 'subcutanea' },
    { label: 'Intramuscular', value: 'intramuscular' },
    { label: 'Intranasal', value: 'intranasal' },
    { label: 'Oral', value: 'oral' }
  ]
  
  // Validaciones
  const formularioValido = computed(() => {
    return (datosVacuna.value.tipoVacuna || datosVacuna.value.producto) && 
           datosVacuna.value.laboratorio && 
           datosVacuna.value.numeroLote &&
           datosVacuna.value.dosisAplicada
  })
  
  // Métodos
  const calcularProximaVacuna = () => {
    if (datosVacuna.value.tipoVacuna && !datosVacuna.value.proximaVacuna) {
      const hoy = new Date()
      let mesesSiguientes = 12 // Default anual
      
      // Ajustar según tipo de vacuna
      switch(datosVacuna.value.tipoVacuna) {
        case 'parvovirus':
        case 'moquillo':
          mesesSiguientes = 12
          break
        case 'rabia':
          mesesSiguientes = 12
          break
        case 'bordetella':
          mesesSiguientes = 6
          break
      }
      
      hoy.setMonth(hoy.getMonth() + mesesSiguientes)
      datosVacuna.value.proximaVacuna = hoy.toISOString().split('T')[0]
    }
  }
  
  const guardarDatos = () => {
    if (formularioValido.value) {
      emit('servicio-actualizado', props.servicioId, datosVacuna.value)
    }
  }
  
  const buscarVacunas = async (val, update) => {
    if (val.length < 2) {
      update(() => { productosVacuna.value = [] })
      return
    }
    try {
      const res = await inventarioService.productos.search(val)
      update(() => {
        productosVacuna.value = res.data.map(p => ({
          label: p.nombre,
          value: p.id,
          laboratorio: p.proveedor?.nombre || '',
          ...p
        }))
      })
    } catch (error) {
      console.error(error)
    }
  }

  const alSeleccionarProducto = async (producto) => {
    if (!producto) return
    datosVacuna.value.laboratorio = producto.laboratorio
    try {
      const res = await inventarioService.lotes.getByProducto(producto.id)
      lotesDisponibles.value = res.data.filter(l => l.cantidadDisponible > 0)
      if (lotesDisponibles.value.length > 0) {
        // Auto-seleccionar el que vence más pronto (FEFO)
        const proximoVencer = [...lotesDisponibles.value].sort((a,b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))[0]
        datosVacuna.value.lote = proximoVencer
        alSeleccionarLote(proximoVencer)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const alSeleccionarLote = (lote) => {
    if (!lote) return
    datosVacuna.value.numeroLote = lote.numeroLote
    datosVacuna.value.fechaVencimiento = lote.fechaVencimiento
  }

  const completarVacunacion = async () => {
    if (formularioValido.value) {
      try {
        // Si hay un lote seleccionado, descontar del inventario
        if (datosVacuna.value.lote) {
          await inventarioService.lotes.ajustarCantidad(datosVacuna.value.lote.id, {
            tipo: 'salida',
            cantidad: 1, // En vacunas suele ser 1 unidad/frasco por defecto, o según dosis
            motivo: `Consumo en atención #${props.atencionId} (Vacunación)`
          })
          $q.notify({
            color: 'teal',
            message: 'Inventario actualizado: 1 unidad descontada',
            icon: 'inventory_2'
          })
        }

        emit('servicio-completado', props.servicioId, {
          ...datosVacuna.value,
          fechaAplicacion: new Date().toISOString(),
          aplicadaPor: 'Dr. Usuario Actual' // Obtener del contexto
        })
      } catch (error) {
        console.error(error)
        $q.notify({
          color: 'negative',
          message: 'Error al actualizar inventario, pero se registró la vacuna',
          icon: 'warning'
        })
      }
    }
  }
  
  const eliminarServicio = () => {
    emit('servicio-eliminado', props.servicioId)
  }
  
  // Watchers
  watch(() => datosVacuna.value.tipoVacuna, calcularProximaVacuna)
  watch(datosVacuna, guardarDatos, { deep: true })
  </script>
  
  <style scoped>
  .servicio-card {
    margin-bottom: 16px;
  }
  </style>