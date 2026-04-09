<template>
  <div class="laboratorio-container">
    <!-- Barra Superior de Título y Estadísticas -->
    <div class="top-bar">
      <div class="title-section">
        <q-icon name="science" size="28px" color="primary" />
        <div>
          <div class="title-main">Gestión de Laboratorio</div>
          <div class="title-sub">Órdenes, estudios y resultados</div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-chip">
          <div class="stat-number">{{ totalesPorEstado.borrador }}</div>
          <div class="stat-name">Borrador</div>
        </div>
        <div class="stat-chip">
          <div class="stat-number">{{ totalesPorEstado.generada }}</div>
          <div class="stat-name">Generada</div>
        </div>
        <div class="stat-chip">
          <div class="stat-number">{{ totalesPorEstado.recepcionada }}</div>
          <div class="stat-name">Recepcionada</div>
        </div>
        <div class="stat-chip">
          <div class="stat-number">{{ totalesPorEstado.en_proceso }}</div>
          <div class="stat-name">En Proceso</div>
        </div>
        <div class="stat-chip">
          <div class="stat-number">{{ totalesPorEstado.completada }}</div>
          <div class="stat-name">Completada</div>
        </div>
      </div>
    </div>

    <!-- Barra de Herramientas / Acciones -->
    <div class="action-toolbar">
      <q-btn
        color="primary"
        icon="add"
        label="Nueva Orden"
        @click="mostrarFormulario = true"
        no-caps
        class="action-btn"
      />
      <q-btn
        color="secondary"
        icon="science"
        label="Registro de Muestras"
        @click="irARegistroMuestras"
        no-caps
        class="action-btn"
      />
      <q-btn
        color="info"
        icon="analytics"
        label="Cargar Resultados"
        :disable="!ordenSeleccionada?.id"
        @click="irACargaResultadosConOrden(ordenSeleccionada)"
        no-caps
        class="action-btn"
      />
      <q-separator vertical />
      <q-btn
        color="blue-9"
        icon="visibility"
        label="Ver Detalle"
        :disable="!ordenSeleccionada?.id"
        @click="verOrden(ordenSeleccionada)"
        no-caps
        class="action-btn"
      />
      <q-btn
        color="teal"
        icon="download"
        label="Exportar"
        :disable="!ordenSeleccionada?.id"
        @click="exportarOrden"
        no-caps
        class="action-btn"
      />
      <q-btn
        color="orange"
        icon="print"
        label="Imprimir"
        :disable="!ordenSeleccionada?.id"
        @click="imprimirOrden"
        no-caps
        class="action-btn"
      />
    </div>

    <!-- Contenido Principal - Tabla + Panel Lateral -->
    <div class="content-area">
      <!-- Tabla de Órdenes (lado izquierdo - principal) -->
      <div class="tabla-container">
        <div class="tabla-header">
          <span>Listado de Órdenes</span>
          <q-linear-progress 
            v-if="loading" 
            indeterminate 
            color="primary" 
            class="q-mt-sm"
          />
        </div>
        
        <TablaOrdenes
          :ordenes="ordenes"
          :loading="loading"
          @seleccionar-orden="seleccionarOrden"
          @ver-orden="verOrden"
          @recibir-orden="irARegistroMuestrasConOrden"
          @cargar-resultados="irACargaResultadosConOrden"
          @crear-nuevo="mostrarFormulario = true"
        />
      </div>

      <!-- Panel Lateral con Detalles de la Orden Seleccionada -->
      <div class="right-panel" v-if="ordenSeleccionada?.id">
        <div class="panel-header">
          <q-icon name="info" />
          <span>Orden Seleccionada</span>
        </div>

        <div class="panel-content">
          <div class="detail-item">
            <div class="detail-label">Número</div>
            <div class="detail-value">{{ ordenSeleccionada.numeroOrden }}</div>
          </div>

          <q-separator />

          <div class="detail-item">
            <div class="detail-label">Paciente</div>
            <div class="detail-value">{{ ordenSeleccionada.paciente }}</div>
          </div>

          <q-separator />

          <div class="detail-item">
            <div class="detail-label">Estado</div>
            <q-badge :color="getColorEstado(ordenSeleccionada.estado)" class="detail-badge">
              {{ ordenSeleccionada.estado }}
            </q-badge>
          </div>

          <q-separator />

          <div class="detail-item">
            <div class="detail-label">Estudios</div>
            <div class="detail-value">{{ resumenOrdenSeleccionada.estudios }}</div>
          </div>

          <q-separator />

          <div class="detail-item">
            <div class="detail-label">Pruebas Totales</div>
            <div class="detail-value">{{ resumenOrdenSeleccionada.totalPruebas }}</div>
          </div>

          <q-separator />

          <div class="resumen-pruebas">
            <div class="resumen-item pendientes">
              <div class="resumen-count">{{ resumenOrdenSeleccionada.pendientes }}</div>
              <div class="resumen-label">Pendientes</div>
            </div>
            <div class="resumen-item cargadas">
              <div class="resumen-count">{{ resumenOrdenSeleccionada.cargadas }}</div>
              <div class="resumen-label">Cargadas</div>
            </div>
            <div class="resumen-item validadas">
              <div class="resumen-count">{{ resumenOrdenSeleccionada.validadas }}</div>
              <div class="resumen-label">Validadas</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de Nueva Orden -->
    <q-dialog v-model="mostrarFormulario" persistent>
      <FormularioOrdenSimple @cancelar="mostrarFormulario = false" @guardar="guardarOrden" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TablaOrdenes from 'src/components/laboratorio/TablaOrdenes.vue'
import FormularioOrdenSimple from 'src/components/laboratorio/FormularioOrdenSimple.vue'
import useLaboratorioOrdenes from 'src/composables/laboratorio/useLaboratorioOrdenes'
import { useRouter } from 'vue-router'

const router = useRouter()
const mostrarFormulario = ref(false)
const { ordenes, loading, ordenSeleccionada, cargarOrdenes, seleccionarOrden, crearOrden } = useLaboratorioOrdenes()

const cargarDatos = async () => {
  await cargarOrdenes()
}

const totalesPorEstado = computed(() => {
  const estados = {
    borrador: 0,
    generada: 0,
    recepcionada: 0,
    en_proceso: 0,
    completada: 0
  }

  ordenes.value.forEach((orden: any) => {
    const estado = orden?.estado as keyof typeof estados
    if (estado && estados.hasOwnProperty(estado)) {
      estados[estado] += 1
    }
  })

  return estados
})

const getColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    borrador: 'grey-7',
    generada: 'blue',
    recepcionada: 'orange',
    en_proceso: 'teal',
    completada: 'positive'
  }
  return colores[estado] || 'grey-5'
}

const verOrden = async (orden: any) => {
  if (orden?.id) {
    await seleccionarOrden(orden)
    router.push({ name: 'laboratorio-orden', params: { id: orden.id } })
  }
}

const irARegistroMuestras = () => {
  router.push({ name: 'laboratorio-registro-muestras' })
}

const irARegistroMuestrasConOrden = async (orden: any) => {
  if (!orden?.id) return
  await seleccionarOrden(orden)
  router.push({ name: 'laboratorio-registro-muestras', query: { id: orden.id.toString() } })
}

const irACargaResultadosConOrden = async (orden: any) => {
  if (!orden?.id) return
  await seleccionarOrden(orden)
  router.push({ name: 'laboratorio-carga-resultados', query: { id: orden.id.toString() } })
}

const resumenOrdenSeleccionada = computed(() => {
  if (!ordenSeleccionada.value || !Array.isArray(ordenSeleccionada.value.estudios)) {
    return {
      estudios: 0,
      totalPruebas: 0,
      pendientes: 0,
      cargadas: 0,
      validadas: 0
    }
  }

  const estudios = ordenSeleccionada.value.estudios.length
  const pruebas = ordenSeleccionada.value.estudios.flatMap((estudio: any) => Array.isArray(estudio.pruebas) ? estudio.pruebas : [])
  const pendientes = pruebas.filter((prueba: any) => prueba.estado === 'pendiente').length
  const cargadas = pruebas.filter((prueba: any) => prueba.estado === 'cargado').length
  const validadas = pruebas.filter((prueba: any) => prueba.estado === 'validado').length

  return {
    estudios,
    totalPruebas: pruebas.length,
    pendientes,
    cargadas,
    validadas
  }
})

const guardarOrden = async (orden: any) => {
  await crearOrden(orden)
  mostrarFormulario.value = false
  // Recargar órdenes después de crear una nueva
  await cargarDatos()
}

const exportarOrden = () => {
  // TODO: Implementar exportación
  console.log('Exportar orden:', ordenSeleccionada.value)
}

const imprimirOrden = () => {
  // TODO: Implementar impresión
  console.log('Imprimir orden:', ordenSeleccionada.value)
}

onMounted(cargarDatos)
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
}

.laboratorio-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;

  // Barra superior: Título + Estadísticas
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(90deg, #fff 0%, #f8f9fa 100%);
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 20px;
    flex-shrink: 0;
    gap: 20px;

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;

      .title-main {
        font-size: 18px;
        font-weight: 600;
        color: #1976d2;
      }

      .title-sub {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }

    .stats-section {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: flex-end;

      .stat-chip {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 6px 12px;
        text-align: center;
        min-width: 60px;
        
        .stat-number {
          font-size: 16px;
          font-weight: bold;
          color: #1976d2;
        }

        .stat-name {
          font-size: 11px;
          color: #999;
          margin-top: 2px;
        }
      }
    }
  }

  // Barra de herramientas
  .action-toolbar {
    display: flex;
    align-items: center;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 8px 20px;
    flex-shrink: 0;
    gap: 4px;

    .action-btn {
      padding: 6px 14px;
      font-size: 13px;
      height: 36px;

      &[disable] {
        opacity: 0.5;
      }
    }
  }

  // Contenido principal - Layout con tabla + panel lateral
  .content-area {
    display: flex;
    flex: 1;
    overflow: hidden;
    gap: 12px;
    padding: 12px;

    .tabla-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
      min-width: 0; // Importante para que el contenedor sea flexible

      .tabla-header {
        padding: 12px 16px;
        font-weight: 600;
        font-size: 14px;
        border-bottom: 1px solid #e0e0e0;
        flex-shrink: 0;
        color: #333;
      }

      // Tabla crece dentro del contenedor
      ::v-deep(.q-table) {
        flex: 1;
        overflow: auto;
      }
    }
  }

  // Panel lateral con detalles
  .right-panel {
    width: 280px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
      font-size: 13px;
      color: #333;
      background: #f8f9fa;
      flex-shrink: 0;
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;

      .detail-item {
        margin-bottom: 8px;

        .detail-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          word-break: break-word;
        }

        .detail-badge {
          font-size: 12px;
          padding: 4px 8px;
        }
      }

      .resumen-pruebas {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;

        .resumen-item {
          padding: 8px;
          border-radius: 6px;
          text-align: center;

          &.pendientes {
            background: #fff3e0;
            border: 1px solid #ffe0b2;
          }

          &.cargadas {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
          }

          &.validadas {
            background: #e8f5e9;
            border: 1px solid #c8e6c9;
          }

          .resumen-count {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }

          .resumen-label {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
            text-transform: uppercase;
          }
        }
      }
    }
  }
}

// Responsive
@media (max-width: 1200px) {
  .laboratorio-container {
    .content-area {
      gap: 8px;
      padding: 8px;
    }

    .right-panel {
      width: 240px;
    }

    .action-toolbar {
      .action-btn {
        padding: 6px 10px;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 1024px) {
  .laboratorio-container {
    .top-bar {
      flex-direction: column;
      align-items: flex-start;

      .stats-section {
        width: 100%;
        justify-content: flex-start;
      }
    }

    .content-area {
      flex-direction: column;
    }

    .right-panel {
      width: 100%;
      max-height: 200px;
    }
  }
}

@media (max-width: 640px) {
  .laboratorio-container {
    .top-bar {
      padding: 8px 12px;

      .stats-section {
        gap: 6px;

        .stat-chip {
          padding: 4px 8px;
          font-size: 10px;

          .stat-number {
            font-size: 14px;
          }
        }
      }
    }

    .action-toolbar {
      padding: 6px 12px;
      overflow-x: auto;
      flex-wrap: nowrap;

      .action-btn {
        padding: 4px 8px;
        font-size: 11px;
        white-space: nowrap;
      }
    }

    .right-panel {
      display: none;
    }
  }
}
</style>
