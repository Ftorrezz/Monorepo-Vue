<template>
  <q-page class="q-pa-md full-width">
    <!-- Header con información del paciente y acciones -->
    <q-card class="q-mb-md rounded-borders shadow-2">
      <q-card-section class="header-gradient text-white q-py-md q-px-lg">
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="64px" icon="pets" color="white" text-color="primary" />
          </div>
          <div class="col">
            <div class="text-h5 text-weight-bold">{{ paciente.nombre }}</div>
            <div class="text-subtitle1 q-mt-xs">
              {{ paciente.especie }} - {{ paciente.raza }} <span v-if="paciente.edad"> - {{ paciente.edad }} años</span>
            </div>
            <div class="text-caption q-mt-sm">
              <q-icon name="person" class="q-mr-xs" size="xs" />
              Propietario: {{ paciente.propietario?.nombre }} {{ paciente.propietario?.primerapellido }}
              <span v-if="paciente.propietario?.telefono1"> | <q-icon name="phone" class="q-mr-xs" size="xs" /> Tel: {{ paciente.propietario?.telefono1 }}</span>
            </div>
          </div>
          <div class="col-auto q-gutter-sm">
            <q-btn
              outline
              label="Nueva Atención"
              icon="add"
              color="white"
              class="q-px-md"
              @click="nuevaAtencion"
            />
            <q-btn
              outline
              label="Atenciones Anteriores"
              icon="history"
              color="white"
              class="q-px-md"
              @click="mostrarAtenciones"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Selector de atenciones como tarjetas -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="event" class="q-mr-sm" />
          Atenciones del Paciente
        </div>
        
        <div style="display: flex; overflow-x: auto; gap: 16px; padding-bottom: 8px;">
            <div
              v-for="(atencion, index) in atenciones"
              :key="atencion.id"
              @click="atencionActual = index"
              :class="[
                'mini-card-atencion',
                atencionActual === index ? 'mini-card-atencion--active' : '',
                $q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-dark'
              ]"
              style="min-width: 260px; max-width: 340px; cursor: pointer; user-select: none;"
            >
              <div class="row items-center no-wrap q-mb-xs">
                <q-icon :name="atencion.estado === 'En curso' ? 'play_circle' : 'check_circle'" :color="atencionActual === index ? 'primary' : 'grey-6'" size="sm" class="q-mr-xs" />
                <span class="text-weight-medium" style="font-size: 1rem;">{{ atencion.numero }}</span>
                <q-btn
                  v-if="atencionActual === index"
                  dense flat round size="sm"
                  icon="expand_more"
                  @click.stop="atencionExpandida = atencionExpandida === index ? null : index"
                  :aria-label="atencionExpandida === index ? 'Ocultar detalles' : 'Mostrar detalles'"
                  class="q-ml-xs"
                  :class="{'rotate-180': atencionExpandida === index}"
                />
              </div>
              <div class="row items-center no-wrap text-caption text-grey-7 q-mb-xs" style="font-size: 0.92rem;">
                <q-icon name="event" size="xs" class="q-mr-xs" />
                <span>{{ atencion.fecha }} {{ atencion.hora }}</span>
                <q-chip
                  :color="atencion.estado === 'En curso' ? 'orange' : 'green'"
                  text-color="white"
                  :label="atencion.estado"
                  size="sm"
                  class="q-ml-sm"
                  style="font-size: 0.85rem;"
                />
              </div>
              <transition name="fade">
                <div v-if="atencionExpandida === index && atencionActual === index" class="q-mt-xs" style="font-size: 0.92rem;">
                  <div class="text-caption text-grey-7">Veterinario: {{ atencion.veterinario }}</div>
                  <div class="text-caption">Servicios: {{ atencion.servicios.length }}</div>
                  <div
                    v-if="atencion.fechaFinalizacion"
                    class="row items-center no-wrap text-caption text-grey-7 q-mb-xs"
                    style="font-size: 0.92rem;"
                  >
                    <q-icon name="event_available" size="xs" class="q-mr-xs" />
                    <span>Finalizada: {{ atencion.fechaFinalizacion }} {{ atencion.horaFinalizacion }}</span>
                  </div>
                  <div v-if="atencionActual === index" class="text-primary text-caption q-mt-xs"><q-icon name="check_circle" size="xs" /> Activa</div>
                </div>
              </transition>
            </div>
          </div>
        </q-card-section>
      </q-card>

    <!-- Información de la atención actual (simplificada) -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-grey-1">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">Atención Actual: {{ atenciones[atencionActual].numero }}</div>
            <div class="text-subtitle2">
              {{ atenciones[atencionActual].fecha }} - {{ atenciones[atencionActual].hora }} | 
              {{ atenciones[atencionActual].veterinario }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn 
              outline 
              color="primary" 
              icon="visibility"
              label="Ver Detalles"
              @click="verDetallesAtencion"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-gutter-md no-wrap">
      <!-- Panel de servicios disponibles -->
      <div class="col-2">
        <q-card style="height: 600px;">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="medical_services" class="q-mr-sm" />
              Servicios Disponibles
            </div>
            
            <q-list>
              <q-item 
                v-for="servicio in serviciosDisponibles" 
                :key="servicio.id"
                clickable
                @click="agregarServicio(servicio)"
                class="q-mb-sm"
              >
                <q-item-section avatar>
                  <q-icon :name="servicio.icono" :color="servicio.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ servicio.nombre }}</q-item-label>
                  <q-item-label caption>{{ servicio.descripcion }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn 
                    round 
                    flat 
                    icon="add" 
                    size="sm"
                    color="primary"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Panel de servicios aplicados -->
      <div class="col-10">
        <q-card style="height: 600px;">
          <q-card-section class="full-height">
            <div class="text-h6 q-mb-md">
              <q-icon name="assignment" class="q-mr-sm" />
              Servicios Aplicados ({{ serviciosAplicados.length }})
            </div>

            <div v-if="serviciosAplicados.length === 0" class="text-center q-py-xl text-grey-6" style="height: 500px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <q-icon name="info" size="xl" class="q-mb-md" />
              <div class="text-h6">No se han aplicado servicios aún</div>
              <div class="text-subtitle2">Selecciona un servicio del panel izquierdo</div>
            </div>

            <div v-else class="scroll" style="height: 500px;">
              <q-expansion-item
                v-for="servicio in serviciosAplicados"
                :key="servicio.id"
                :icon="servicio.icono"
                :label="servicio.nombre"
                :caption="servicio.timestamp"
                :header-class="`text-${servicio.color}`"
                class="q-mb-sm"
              >
                <q-card>
                  <q-card-section>
                    <!-- Formulario dinámico según el tipo de servicio -->
                    <component 
                      :is="getComponenteServicio(servicio.tipo)"
                      :servicio="servicio"
                      @actualizar="actualizarServicio"
                      @eliminar="eliminarServicio"
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Botones de acción -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn-group>
        <q-btn 
          fab 
          icon="save" 
          color="primary"
          @click="guardarAtencion"
        />
        <q-btn 
          fab 
          icon="close" 
          color="negative"
          @click="finalizarAtencion"
        />
      </q-btn-group>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useMascotaSeleccionadaStore } from 'src/stores/mascotaSeleccionadaStore';

// Componentes para cada tipo de servicio
const ServicioVacunacion = {
  props: ['servicio'],
  emits: ['actualizar', 'eliminar'],
  setup(props, { emit }) {
    const vacuna = ref(props.servicio.datos?.vacuna || '')
    const laboratorio = ref(props.servicio.datos?.laboratorio || '')
    const lote = ref(props.servicio.datos?.lote || '')
    const fechaVencimiento = ref(props.servicio.datos?.fechaVencimiento || '')
    const observaciones = ref(props.servicio.datos?.observaciones || '')

    const actualizar = () => {
      emit('actualizar', props.servicio.id, {
        vacuna: vacuna.value,
        laboratorio: laboratorio.value,
        lote: lote.value,
        fechaVencimiento: fechaVencimiento.value,
        observaciones: observaciones.value
      })
    }

    return {
      vacuna, laboratorio, lote, fechaVencimiento, observaciones,
      actualizar,
      eliminar: () => emit('eliminar', props.servicio.id)
    }
  },
  template: `
    <div class="q-gutter-md">
      <div class="row q-gutter-md">
        <div class="col">
          <q-select
            v-model="vacuna"
            :options="['Triple Felina', 'Rabia', 'Parvovirus', 'Hepatitis', 'Moquillo']"
            label="Tipo de Vacuna"
            outlined
            @update:model-value="actualizar"
          />
        </div>
        <div class="col">
          <q-input
            v-model="laboratorio"
            label="Laboratorio"
            outlined
            @update:model-value="actualizar"
          />
        </div>
      </div>
      
      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            v-model="lote"
            label="Número de Lote"
            outlined
            @update:model-value="actualizar"
          />
        </div>
        <div class="col">
          <q-input
            v-model="fechaVencimiento"
            label="Fecha de Vencimiento"
            outlined
            type="date"
            @update:model-value="actualizar"
          />
        </div>
      </div>
      
      <q-input
        v-model="observaciones"
        label="Observaciones"
        outlined
        type="textarea"
        rows="2"
        @update:model-value="actualizar"
      />
      
      <div class="row justify-end">
        <q-btn 
          flat 
          color="negative" 
          icon="delete" 
          label="Eliminar"
          @click="eliminar"
        />
      </div>
    </div>
  `
}

const ServicioDesparacitacion = {
  props: ['servicio'],
  emits: ['actualizar', 'eliminar'],
  setup(props, { emit }) {
    const producto = ref(props.servicio.datos?.producto || '')
    const dosis = ref(props.servicio.datos?.dosis || '')
    const peso = ref(props.servicio.datos?.peso || '')
    const proximaDosis = ref(props.servicio.datos?.proximaDosis || '')
    const observaciones = ref(props.servicio.datos?.observaciones || '')

    const actualizar = () => {
      emit('actualizar', props.servicio.id, {
        producto: producto.value,
        dosis: dosis.value,
        peso: peso.value,
        proximaDosis: proximaDosis.value,
        observaciones: observaciones.value
      })
    }

    return {
      producto, dosis, peso, proximaDosis, observaciones,
      actualizar,
      eliminar: () => emit('eliminar', props.servicio.id)
    }
  },
  template: `
    <div class="q-gutter-md">
      <div class="row q-gutter-md">
        <div class="col">
          <q-select
            v-model="producto"
            :options="['Drontal', 'Canex', 'Bravecto', 'Milbemax', 'Otro']"
            label="Producto"
            outlined
            @update:model-value="actualizar"
          />
        </div>
        <div class="col">
          <q-input
            v-model="dosis"
            label="Dosis (ml/mg)"
            outlined
            @update:model-value="actualizar"
          />
        </div>
      </div>
      
      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            v-model="peso"
            label="Peso del Animal (kg)"
            outlined
            type="number"
            step="0.1"
            @update:model-value="actualizar"
          />
        </div>
        <div class="col">
          <q-input
            v-model="proximaDosis"
            label="Próxima Dosis"
            outlined
            type="date"
            @update:model-value="actualizar"
          />
        </div>
      </div>
      
      <q-input
        v-model="observaciones"
        label="Observaciones"
        outlined
        type="textarea"
        rows="2"
        @update:model-value="actualizar"
      />
      
      <div class="row justify-end">
        <q-btn 
          flat 
          color="negative" 
          icon="delete" 
          label="Eliminar"
          @click="eliminar"
        />
      </div>
    </div>
  `
}

const ServicioExploracion = {
  props: ['servicio'],
  emits: ['actualizar', 'eliminar'],
  setup(props, { emit }) {
    const temperatura = ref(props.servicio.datos?.temperatura || '')
    const peso = ref(props.servicio.datos?.peso || '')
    const frecuenciaCardiaca = ref(props.servicio.datos?.frecuenciaCardiaca || '')
    const frecuenciaRespiratoria = ref(props.servicio.datos?.frecuenciaRespiratoria || '')
    const estadoGeneral = ref(props.servicio.datos?.estadoGeneral || '')
    const hallazgos = ref(props.servicio.datos?.hallazgos || '')

    const actualizar = () => {
      emit('actualizar', props.servicio.id, {
        temperatura: temperatura.value,
        peso: peso.value,
        frecuenciaCardiaca: frecuenciaCardiaca.value,
        frecuenciaRespiratoria: frecuenciaRespiratoria.value,
        estadoGeneral: estadoGeneral.value,
        hallazgos: hallazgos.value
      })
    }

    return {
      temperatura, peso, frecuenciaCardiaca, frecuenciaRespiratoria, estadoGeneral, hallazgos,
      actualizar,
      eliminar: () => emit('eliminar', props.servicio.id)
    }
  },
  template: `
    <div class="q-gutter-md">
      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            v-model="temperatura"
            label="Temperatura (°C)"
            outlined
            type="number"
            step="0.1"
            @update:model-value="actualizar"
          />
        </div>
        <div class="col">
          <q-input
            v-model="peso"
            label="Peso (kg)"
            outlined
            type="number"
            step="0.1"
            @update:model-value="actualizar"
          />
        </div>
      </div>
      
      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            v-model="frecuenciaCardiaca"
            label="Frecuencia Cardíaca (bpm)"
            outlined
            type="number"
            @update:model-value="actualizar"
          />
        </div>
        <div class="col">
          <q-input
            v-model="frecuenciaRespiratoria"
            label="Frecuencia Respiratoria (rpm)"
            outlined
            type="number"
            @update:model-value="actualizar"
          />
        </div>
      </div>
      
      <q-select
        v-model="estadoGeneral"
        :options="['Excelente', 'Bueno', 'Regular', 'Malo', 'Crítico']"
        label="Estado General"
        outlined
        @update:model-value="actualizar"
      />
      
      <q-input
        v-model="hallazgos"
        label="Hallazgos de la Exploración"
        outlined
        type="textarea"
        rows="3"
        @update:model-value="actualizar"
      />
      
      <div class="row justify-end">
        <q-btn 
          flat 
          color="negative" 
          icon="delete" 
          label="Eliminar"
          @click="eliminar"
        />
      </div>
    </div>
  `
}

const ServicioCertificado = {
  props: ['servicio'],
  emits: ['actualizar', 'eliminar'],
  setup(props, { emit }) {
    const tipoCertificado = ref(props.servicio.datos?.tipoCertificado || '')
    const proposito = ref(props.servicio.datos?.proposito || '')
    const observaciones = ref(props.servicio.datos?.observaciones || '')
    const impreso = ref(props.servicio.datos?.impreso || false)

    const actualizar = () => {
      emit('actualizar', props.servicio.id, {
        tipoCertificado: tipoCertificado.value,
        proposito: proposito.value,
        observaciones: observaciones.value,
        impreso: impreso.value
      })
    }

    return {
      tipoCertificado, proposito, observaciones, impreso,
      actualizar,
      eliminar: () => emit('eliminar', props.servicio.id)
    }
  },
  template: `
    <div class="q-gutter-md">
      <q-select
        v-model="tipoCertificado"
        :options="['Certificado de Salud', 'Certificado de Vacunación', 'Certificado de Defunción', 'Certificado Zoosanitario']"
        label="Tipo de Certificado"
        outlined
        @update:model-value="actualizar"
      />
      
      <q-input
        v-model="proposito"
        label="Propósito del Certificado"
        outlined
        placeholder="Ej: Viaje, Adopción, Trámite legal..."
        @update:model-value="actualizar"
      />
      
      <q-input
        v-model="observaciones"
        label="Observaciones"
        outlined
        type="textarea"
        rows="2"
        @update:model-value="actualizar"
      />
      
      <q-checkbox
        v-model="impreso"
        label="Certificado impreso"
        @update:model-value="actualizar"
      />
      
      <div class="row justify-between">
        <q-btn 
          flat 
          color="primary" 
          icon="print" 
          label="Imprimir Certificado"
          :disable="!tipoCertificado"
        />
        <q-btn 
          flat 
          color="negative" 
          icon="delete" 
          label="Eliminar"
          @click="eliminar"
        />
      </div>
    </div>
  `
}

export default {
  name: 'AtencionPaciente',
  components: {
    ServicioVacunacion,
    ServicioDesparacitacion,
    ServicioExploracion,
    ServicioCertificado
  },
  setup() {
    const $q = useQuasar()
    const mascotaSeleccionadaStore = useMascotaSeleccionadaStore()
    // Datos del paciente (ahora vienen del store)
    const paciente = computed(() => mascotaSeleccionadaStore.mascota || {
      id: '', nombre: '', especie: '', raza: '', edad: '', propietario: '', telefono: ''
    })

    // Lista de atenciones del paciente
    const atenciones = ref([
      {
        id: 1,
        numero: 'A-2024-001',
        fecha: '2024-01-15',
        hora: '10:30',
        fechaFinalizacion: '',
        horaFinalizacion: '',
        veterinario: 'Dr. Carlos Mendoza',
        estado: 'En curso',
        servicios: []
      },
      {
        id: 2,
        numero: 'A-2024-002',
        fecha: '2024-01-10',
        hora: '09:15',
        fechaFinalizacion: '2024-01-10',
        horaFinalizacion: '10:00',
        veterinario: 'Dr. Ana Ruiz',
        estado: 'Finalizada',
        servicios: [
          { tipo: 'vacunacion', nombre: 'Vacunación', datos: { vacuna: 'Rabia' } },
          { tipo: 'exploracion', nombre: 'Exploración Física', datos: { temperatura: '38.5' } }
        ]
      },
      {
        id: 3,
        numero: 'A-2024-003',
        fecha: '2024-01-05',
        hora: '11:45',
        fechaFinalizacion: '2024-01-05',
        horaFinalizacion: '12:20',
        veterinario: 'Dr. Carlos Mendoza',
        estado: 'Finalizada',
        servicios: [
          { tipo: 'desparacitacion', nombre: 'Desparacitación', datos: { producto: 'Drontal' } }
        ]
      }
    ])

    // Atención actual seleccionada
    const atencionActual = ref(0) // Índice de la atención actual
    const atencionExpandida = ref(null)

    // Servicios disponibles
    const serviciosDisponibles = ref([
      {
        id: 'vacunacion',
        nombre: 'Vacunación',
        descripcion: 'Aplicación de vacunas',
        icono: 'vaccines',
        color: 'green',
        tipo: 'vacunacion'
      },
      {
        id: 'desparacitacion',
        nombre: 'Desparacitación',
        descripcion: 'Tratamiento antiparasitario',
        icono: 'medication',
        color: 'orange',
        tipo: 'desparacitacion'
      },
      {
        id: 'exploracion',
        nombre: 'Exploración Física',
        descripcion: 'Examen clínico general',
        icono: 'health_and_safety',
        color: 'blue',
        tipo: 'exploracion'
      },
      {
        id: 'certificado',
        nombre: 'Certificado',
        descripcion: 'Emisión de certificados',
        icono: 'description',
        color: 'purple',
        tipo: 'certificado'
      },
      {
        id: 'cirugia',
        nombre: 'Cirugía',
        descripcion: 'Procedimiento quirúrgico',
        icono: 'local_hospital',
        color: 'red',
        tipo: 'cirugia'
      },
      {
        id: 'laboratorio',
        nombre: 'Laboratorio',
        descripcion: 'Análisis de laboratorio',
        icono: 'biotech',
        color: 'teal',
        tipo: 'laboratorio'
      }
    ])

    // Servicios aplicados en esta atención
    const serviciosAplicados = computed(() => {
      return atenciones.value[atencionActual.value]?.servicios || []
    })

    // Cambiar atención seleccionada
    const cambiarAtencion = (index) => {
      atencionActual.value = index
    }

    // Ver detalles de la atención
    const verDetallesAtencion = () => {
      const atencion = atenciones.value[atencionActual.value]
      $q.dialog({
        title: `Detalles de ${atencion.numero}`,
        message: `
          <div>
            <strong>Fecha:</strong> ${atencion.fecha} ${atencion.hora}<br>
            <strong>Veterinario:</strong> ${atencion.veterinario}<br>
            <strong>Estado:</strong> ${atencion.estado}<br>
            <strong>Servicios:</strong> ${atencion.servicios.length}
          </div>
        `,
        html: true,
        ok: 'Cerrar'
      })
    }

    // Nueva atención
    const nuevaAtencion = () => {
      $q.dialog({
        title: 'Nueva Atención',
        message: '¿Desea crear una nueva atención para este paciente?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        // Generar nuevo número de atención
        const fecha = new Date()
        const numeroAtencion = `A-${fecha.getFullYear()}-${String(atenciones.value.length + 1).padStart(3, '0')}`
        
        // Crear nueva atención
        const nuevaAtencionData = {
          id: atenciones.value.length + 1,
          numero: numeroAtencion,
          fecha: fecha.toISOString().split('T')[0],
          hora: fecha.toTimeString().split(' ')[0].substring(0, 5),
          veterinario: 'Dr. Carlos Mendoza',
          estado: 'En curso',
          servicios: []
        }
        
        // Agregar la nueva atención
        atenciones.value.unshift(nuevaAtencionData)
        
        // Seleccionar la nueva atención
        atencionActual.value = 0
        
        $q.notify({
          type: 'positive',
          message: 'Nueva atención creada',
          position: 'top-right'
        })
      })
    }

    const mostrarAtenciones = () => {
      $q.dialog({
        title: 'Historial de Atenciones',
        message: `Este paciente tiene ${atenciones.value.length} atenciones registradas. Haga clic en cualquier tarjeta para seleccionarla.`,
        ok: 'Entendido'
      })
    }

    const agregarServicio = (servicio) => {
      // Verificar si ya existe un servicio del mismo tipo en la atención actual
      const serviciosActuales = atenciones.value[atencionActual.value].servicios
      const yaExiste = serviciosActuales.some(s => s.tipo === servicio.tipo)
      if (yaExiste) {
        $q.notify({
          type: 'negative',
          message: `El servicio "${servicio.nombre}" ya ha sido agregado a esta atención`,
          position: 'top-right'
        })
        return
      }
      const nuevoServicio = {
        ...servicio,
        id: `${servicio.tipo}_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        datos: {}
      }
      // Agregar el servicio solo a la atención actual
      serviciosActuales.push(nuevoServicio)
      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado a la atención`,
        position: 'top-right'
      })
    }

    // Actualizar datos de un servicio
    const actualizarServicio = (servicioId, datos) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      if (servicio) {
        servicio.datos = { ...servicio.datos, ...datos }
      }
    }

    // Eliminar un servicio
    const eliminarServicio = (servicioId) => {
      const servicios = atenciones.value[atencionActual.value].servicios
      const index = servicios.findIndex(s => s.id === servicioId)
      if (index > -1) {
        servicios.splice(index, 1)
        $q.notify({
          type: 'negative',
          message: 'Servicio eliminado',
          position: 'top-right'
        })
      }
    }

    // Obtener componente según tipo de servicio
    const getComponenteServicio = (tipo) => {
      const componentes = {
        vacunacion: 'ServicioVacunacion',
        desparacitacion: 'ServicioDesparacitacion',
        exploracion: 'ServicioExploracion',
        certificado: 'ServicioCertificado'
      }
      return componentes[tipo] || 'div'
    }

    // Guardar atención
    const guardarAtencion = () => {
      $q.notify({
        type: 'positive',
        message: 'Atención guardada correctamente',
        position: 'top-right'
      })

      // Aquí iría la lógica para guardar en la base de datos
      console.log('Guardando atención:', atenciones.value[atencionActual.value])
    }

    // Finalizar atención
    const finalizarAtencion = () => {
      $q.dialog({
        title: 'Finalizar Atención',
        message: '¿Está seguro de que desea finalizar esta atención? Una vez finalizada no se podrá modificar.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        // Cambiar estado a finalizada
        atenciones.value[atencionActual.value].estado = 'Finalizada'
        
        $q.notify({
          type: 'positive',
          message: 'Atención finalizada correctamente',
          position: 'top-right'
        })

        // Redireccionar o limpiar
        // this.$router.push('/pacientes')
      })
    }

    // Limpiar el store al salir de la pantalla
    onBeforeUnmount(() => {
      mascotaSeleccionadaStore.limpiarMascota()
    })

    return {
      paciente,
      atenciones,
      atencionActual,
      atencionExpandida,
      serviciosDisponibles,
      serviciosAplicados,
      cambiarAtencion,
      verDetallesAtencion,
      nuevaAtencion,
      mostrarAtenciones,
      agregarServicio,
      actualizarServicio,
      eliminarServicio,
      getComponenteServicio,
      guardarAtencion,
      finalizarAtencion
    }
  }
}
</script>

<style scoped>
/* Estilos para las tarjetas de atención */
.min-width-250 {
  min-width: 250px;
}

/* Transiciones suaves para las tarjetas */
.transition-all {
  transition: all 0.3s ease;
}

.duration-300 {
  transition-duration: 300ms;
}

/* Hover effects */
.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Scroll horizontal para las tarjetas */
.row[style*="overflow-x: auto"] {
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f0f0f0;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar {
  height: 8px;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

/* Estilos para el estado de la atención */
.border-primary {
  border-color: #1976d2 !important;
}

.border-grey-3 {
  border-color: #e0e0e0 !important;
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Estilos para los servicios */
.q-expansion-item {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
}

.q-expansion-item.q-expansion-item--expanded {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Estilos para el panel de servicios disponibles */
.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.q-item:hover {
  background-color: #f5f5f5;
  transform: translateX(4px);
}

/* Estilos para el área de servicios aplicados */
.scroll {
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f0f0f0;
}

.scroll::-webkit-scrollbar {
  width: 8px;
}

.scroll::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.scroll::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.scroll::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

/* Estilos para los botones flotantes */
.q-page-sticky .q-btn-group {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-page-sticky .q-btn {
  margin: 0 2px;
}

/* Estilos para el header del paciente */
.q-card-section.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

/* Estilos para los chips de estado */
.q-chip {
  font-weight: 500;
  border-radius: 12px;
}

/* Estilos para los formularios de servicios */
.q-field--outlined .q-field__control {
  border-radius: 8px;
}

.q-field--outlined .q-field__control:hover {
  border-color: #1976d2;
}

/* Estilos para los iconos */
.q-icon {
  color: inherit;
}

/* Animaciones para los elementos */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.q-expansion-item .q-card {
  animation: fadeInUp 0.3s ease;
}

/* Estilos responsive */
@media (max-width: 768px) {
  .row.q-gutter-md.no-wrap {
    flex-direction: column;
  }
  
  .col-3, .col-9 {
    width: 100%;
    max-width: 100%;
  }
  
  .min-width-250 {
    min-width: 200px;
  }
  
  .q-card[style*="height: 600px"] {
    height: auto !important;
    min-height: 400px;
  }
}

/* Estilos para mejorar la accesibilidad */
.q-btn:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.q-item:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Estilos para el estado vacío */
.text-grey-6 {
  color: #757575;
}

/* Estilos para mejorar la legibilidad */
.q-item-label {
  font-weight: 500;
}

.q-item-label[caption] {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Estilos para las transiciones de estado */
.q-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn {
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
}

.q-btn:active {
  transform: translateY(0);
}

.mini-card-atencion {
  /* El color de fondo ahora lo da la clase dinámica */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 10px 14px;
  transition: box-shadow 0.2s, border 0.2s, background 0.2s;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 260px;
  max-width: 320px;
}
.mini-card-atencion:hover {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.10);
  /* El color de fondo en hover lo da la clase dinámica */
}
.mini-card-atencion--active {
  border: 2px solid #1976d2;
  /* El color de fondo activo lo da la clase dinámica */
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.15);
}
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.header-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); /* Degradado de azul principal */
  position: relative;
  overflow: hidden;
}

/* Efecto de luz/textura para el degradado */
.header-gradient::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at top left, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(-15deg);
  pointer-events: none; /* Asegura que no interfiera con los clics */
}
</style>