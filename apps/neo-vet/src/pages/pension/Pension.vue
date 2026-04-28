<template>
  <div class="pensiones-container q-pa-md">
    <!-- Header principal -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md rounded-16 shadow-2">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="hotel" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Módulo de Pensión Veterinaria</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticas.activas }} mascotas hospedadas - 
              {{ estadisticas.jaulasLibres }} jaulas disponibles - 
              {{ estadisticas.reservadas }} reservas pendientes
            </div>
          </div>
          <div class="col-auto">
            <div class="row q-gutter-sm">
              <q-btn 
                flat
                round
                icon="add_circle"
                @click="abrirNuevaPension"
                :disable="modoLectura"
              >
                <q-tooltip>Nueva Reservación/Ingreso</q-tooltip>
              </q-btn>
              <q-btn 
                flat
                round
                icon="picture_as_pdf"
                @click="mostrarModalReportes = true"
              >
                <q-tooltip>Generar Reportes</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabs de navegación -->
    <q-card flat class="q-mb-md rounded-12 shadow-1">
      <q-tabs
        v-model="tabSeleccionada"
        dense
        no-caps
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="dashboard" icon="dashboard" label="Dashboard" />
        <q-tab name="pensiones" icon="pets" label="Pensiones Activas" />
        <q-tab name="jaulas" icon="grid_view" label="Mapa de Jaulas" />
        <q-tab name="turnos" icon="assignment" label="Turnos y Cuidados" />
        <q-tab name="historial" icon="history" label="Historial" />
      </q-tabs>
    </q-card>

    <q-tab-panels v-model="tabSeleccionada" animated class="bg-transparent">
      <!-- PANEL DE DASHBOARD -->
      <q-tab-panel name="dashboard" class="q-pa-none">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-primary" v-ripple>
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="pets" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Activas</div>
                    <div class="text-h4 text-weight-bolder">{{ estadisticas.activas }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-secondary" v-ripple>
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="door_front" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Jaulas Libres</div>
                    <div class="text-h4 text-weight-bolder">{{ estadisticas.jaulasLibres }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-warning" v-ripple>
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="event" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Próximas Entradas</div>
                    <div class="text-h4 text-weight-bolder">{{ estadisticas.reservadas }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-danger" v-ripple>
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="payments" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Ingresos Mes</div>
                    <div class="text-h4 text-weight-bolder">${{ estadisticas.ingresosMes }}</div>

                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-7">
            <q-card flat bordered class="rounded-16 shadow-1">
              <q-card-section class="bg-grey-1 row items-center">
                <q-icon name="notifications_active" color="primary" size="sm" class="q-mr-sm"/>
                <span class="text-h6 text-weight-medium">Actividades de Hoy</span>
              </q-card-section>
              <q-list separator class="scroll" style="max-height: 400px">
                <template v-if="turnosHoy.length > 0">
                  <q-item v-for="act in turnosHoy" :key="act.id">
                    <q-item-section avatar>
                      <q-avatar color="indigo-1" text-color="primary" icon="schedule" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ act.actividad }}</q-item-label>
                      <q-item-label caption>{{ act.jaula ? act.jaula.nombre : 'S/J' }} - {{ act.personal_nombre }}</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <q-chip dense :color="getTurnoEstadoColor(act.estado)" text-color="white" size="sm">
                        {{ act.estado }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
                <q-item v-else class="text-center text-grey q-py-lg">
                  <q-item-section>No hay actividades programadas para hoy</q-item-section>
                </q-item>
              </q-list>

            </q-card>
          </div>
          <div class="col-12 col-md-5">
            <q-card flat bordered class="rounded-16 shadow-1 bg-gradient-info text-white">
              <q-card-section class="q-pa-lg text-center">
                <q-icon name="picture_as_pdf" size="xl" class="q-mb-md opacity-90"/>
                <div class="text-h5 q-mb-sm text-weight-bold">Reportes de Pensión</div>
                <p class="opacity-80">Genera reportes de ocupación, historial y cortes de caja específicos del módulo.</p>
                <q-btn color="white" text-color="primary" unelevated label="Abrir Reportes" icon="description" @click="mostrarModalReportes = true" class="full-width rounded-8" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- PANEL DE PENSIONES -->
      <q-tab-panel name="pensiones" class="q-pa-none">
        <q-card flat class="q-mb-md rounded-12 shadow-1">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input v-model="filtroTexto" placeholder="Buscar mascota o propietario..." outlined dense bg-color="grey-1">
                  <template v-slot:prepend><q-icon name="search" color="primary" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-2">
                <q-select v-model="filtroEstado" :options="opcionesEstado" label="Estado" outlined dense bg-color="grey-1" emit-value map-options clearable />
              </div>
              <q-space />
              <q-btn color="primary" icon="add" label="Ingreso" @click="abrirNuevaPension" unelevated class="rounded-8" />
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md">
          <div v-for="pension in pensionesFiltradas" :key="pension.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card flat bordered class="pension-card hover-shadow rounded-16 shadow-1">
              <div class="status-bar" :style="{ backgroundColor: getEstadoColor(pension.estado) }"></div>
              <q-card-section class="q-pa-md">
                <div class="row items-start no-wrap justify-between">
                  <div class="col">
                    <div class="text-h6 text-primary text-weight-bold text-truncate">{{ pension.mascota?.nombre || 'Sin nombre' }}</div>
                    <div class="text-caption text-grey-7">{{ pension.mascota?.especie }} • {{ pension.mascota?.raza || 'Mestizo' }}</div>
                  </div>
                  <q-chip dense :color="getEstadoColor(pension.estado)" text-color="white" size="xs" class="text-weight-bold">
                    {{ pension.estado }}
                  </q-chip>
                </div>

                <q-separator class="q-my-sm" />

                <div class="info-row">
                  <q-icon name="person" size="xs" color="grey-6" />
                  <span class="text-body2 q-ml-sm text-grey-9">{{ pension.propietario?.nombre || 'Desconocido' }}</span>
                </div>
                <div class="info-row">
                  <q-icon name="door_front" size="xs" color="grey-6" />
                  <span class="text-body2 q-ml-sm text-grey-9">{{ pension.jaula?.nombre || 'No asignada' }}</span>
                </div>
                <div class="info-row">
                  <q-icon name="login" size="xs" color="grey-6" />
                  <span class="text-body2 q-ml-sm text-grey-9">Entrada: {{ formatDate(pension.fecha_entrada_estimada) }}</span>
                </div>
                <div class="info-row">
                  <q-icon name="logout" size="xs" color="grey-6" />
                  <span class="text-body2 q-ml-sm text-grey-9">Salida: {{ formatDate(pension.fecha_salida_estimada) }}</span>
                </div>

                <div class="row q-mt-md justify-between items-center">
                  <div class="text-subtitle1 text-weight-bolder text-primary">${{ pension.precio_total?.toFixed(2) || '0.00' }}</div>
                  <div class="row q-gutter-xs">
                    <q-btn flat round dense icon="visibility" color="blue" @click="verDetalle(pension)">
                      <q-tooltip>Ver Detalles</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="login" color="positive" v-if="pension.estado === 'RESERVADA'" @click="procesarCheckIn(pension)">
                      <q-tooltip>Registrar Entrada</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="logout" color="negative" v-if="pension.estado === 'ACTIVA'" @click="procesarCheckOut(pension)">
                      <q-tooltip>Registrar Salida</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- PANEL DE JAULAS -->
      <q-tab-panel name="jaulas" class="q-pa-none">
        <q-card flat class="q-mb-md rounded-12 shadow-1">
          <q-card-section class="q-pa-md row items-center justify-between">
            <div class="text-h6 text-primary"><q-icon name="grid_view" class="q-mr-sm" />Estado de Jaulas</div>
            <div class="row q-gutter-sm">
               <q-chip dense outline color="positive">Disponibles: {{ jaulas.filter(j => j.estado === 'DISPONIBLE').length }}</q-chip>
               <q-chip dense outline color="negative">Ocupadas: {{ jaulas.filter(j => j.estado === 'OCUPADA').length }}</q-chip>
               <q-btn color="primary" label="Nueva Jaula" icon="add" unelevated size="sm" @click="abrirModalJaula" />
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md">
          <div v-for="jaula in jaulas" :key="jaula.id" class="col-12 col-sm-4 col-md-3">
            <q-card flat bordered :class="['jaula-card', jaula.estado.toLowerCase(), 'rounded-16 shadow-1 transition-all']">
              <q-card-section class="text-center">
                <div class="text-h6 text-weight-bold">{{ jaula.nombre }}</div>
                <div class="text-caption">{{ jaula.tipo_label || 'Estándar' }}</div>
                <q-icon :name="jaula.estado === 'OCUPADA' ? 'pets' : 'door_front'" size="3rem" :color="jaula.estado === 'OCUPADA' ? 'negative' : 'positive'" class="q-my-md" />
                <div class="text-weight-bold" :class="jaula.estado === 'OCUPADA' ? 'text-negative' : 'text-positive'">
                  {{ jaula.estado }}
                </div>
                <div v-if="jaula.estado === 'OCUPADA'" class="text-caption text-grey-8 q-mt-sm">
                  Ocupado por: <strong>{{ jaula.pensionActual?.mascota?.nombre }}</strong>
                </div>
              </q-card-section>
              <q-card-actions align="center">
                <q-btn flat dense round icon="edit" color="grey-7" @click="editarJaula(jaula)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- PANEL DE TURNOS -->
      <q-tab-panel name="turnos" class="q-pa-none">
        <q-card flat class="rounded-12 shadow-1">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-primary">Agenda de Cuidados</div>
            <div class="row q-gutter-sm">
              <q-input v-model="fechaTurnos" type="date" outlined dense dense-label label="Fecha" />
              <q-btn color="primary" icon="add" label="Nuevo Turno" unelevated @click="abrirModalTurno" />
            </div>
          </q-card-section>
          <q-table
            :rows="turnos"
            :columns="columnasTurnos"
            row-key="id"
            flat
            bordered
            :loading="cargando"
          >
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip :color="getTurnoEstadoColor(props.value)" text-color="white" dense size="sm">
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="text-right">
                <q-btn flat round dense icon="check" color="positive" v-if="props.row.estado !== 'COMPLETADO'" @click="completarTurno(props.row)" />
                <q-btn flat round dense icon="edit" color="primary" @click="editarTurno(props.row)" />
                <q-btn flat round dense icon="delete" color="negative" @click="eliminarTurno(props.row.id)" />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>

      <!-- PANEL DE HISTORIAL -->
      <q-tab-panel name="historial" class="q-pa-none">
         <q-card flat class="rounded-12 shadow-1">
           <q-table
            :rows="historial"
            :columns="columnasHistorial"
            row-key="id"
            flat
            bordered
            :filter="filtroHistorial"
          >
            <template v-slot:top>
              <div class="text-h6 text-primary">Historial de Estancias</div>
              <q-space />
              <q-input v-model="filtroHistorial" placeholder="Buscar..." outlined dense>
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </template>
            <template v-slot:body-cell-total="props">
              <q-td :props="props" class="text-weight-bold text-primary">
                ${{ props.value?.toFixed(2) }}
              </q-td>
            </template>
          </q-table>
         </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- MODALES -->

    <!-- Modal Nueva Pensión -->
    <q-dialog v-model="modalPension" maximized transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="bg-grey-2">
        <q-card-section class="bg-primary text-white q-py-sm">
          <div class="row items-center no-wrap">
            <q-icon name="hotel" size="md" class="q-mr-md" />
            <div class="col">
              <div class="text-h6 text-weight-bold">{{ pensionEditando ? 'Editar Pensión' : 'Nueva Reservación / Ingreso' }}</div>
            </div>
            <q-btn flat round icon="close" @click="cerrarModalPension" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card flat bordered class="rounded-16 shadow-1 full-height">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">Información del Paciente</div>
                  <q-select
                    v-model="pensionForm.mascota"
                    :options="mascotasOpciones"
                    label="Seleccionar Mascota *"
                    outlined
                    dense
                    use-input
                    @filter="filtrarMascotas"
                    class="q-mb-md"
                  />
                  <div v-if="pensionForm.mascota" class="bg-indigo-1 q-pa-md rounded-12 q-mb-md">
                     <div class="row items-center no-wrap">
                        <q-avatar size="60px" color="white" text-color="primary" icon="pets" />
                        <div class="q-ml-md">
                           <div class="text-h6 text-primary">{{ pensionForm.mascota.nombre }}</div>
                           <div class="text-caption text-grey-8">{{ pensionForm.mascota.especie }} • {{ pensionForm.mascota.propietario }}</div>
                        </div>
                     </div>
                  </div>
                  <q-input v-model="pensionForm.contacto_emergencia_nombre" label="Contacto de Emergencia" outlined dense class="q-mb-sm" />
                  <q-input v-model="pensionForm.contacto_emergencia_telefono" label="Teléfono Emergencia" outlined dense class="q-mb-sm" />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-5">
               <q-card flat bordered class="rounded-16 shadow-1">
                 <q-card-section class="q-gutter-y-md">
                    <div class="text-subtitle1 text-weight-bold text-primary">Detalles de la Estancia</div>
                    <div class="row q-col-gutter-sm">
                       <div class="col-6">
                          <q-select v-model="pensionForm.id_tipo_pension" :options="tiposPensionOpciones" label="Tipo de Pensión *" outlined dense emit-value map-options />
                       </div>
                       <div class="col-6">
                          <q-select v-model="pensionForm.id_jaula" :options="jaulasOpciones" label="Jaula Asignada *" outlined dense emit-value map-options :option-disable="opt => opt.estado === 'OCUPADA' && opt.id !== pensionEditando?.id_jaula" />
                       </div>
                    </div>
                    <div class="row q-col-gutter-sm">
                       <div class="col-6">
                          <q-input v-model="pensionForm.fecha_entrada_estimada" label="Entrada Estimada *" outlined dense type="datetime-local" stack-label />
                       </div>
                       <div class="col-6">
                          <q-input v-model="pensionForm.fecha_salida_estimada" label="Salida Estimada *" outlined dense type="datetime-local" stack-label />
                       </div>
                    </div>
                    <q-input v-model="pensionForm.instrucciones_especiales" label="Instrucciones de Alimentación / Cuidados" outlined dense type="textarea" rows="3" />
                    <q-input v-model="pensionForm.observaciones" label="Observaciones Médicas" outlined dense type="textarea" rows="2" />
                 </q-card-section>
               </q-card>
            </div>

            <div class="col-12 col-md-3">
              <q-card flat bordered class="rounded-16 shadow-4 bg-white sticky-summary">
                 <q-card-section class="bg-indigo-9 text-white q-py-sm">
                    <div class="text-subtitle1 text-weight-bold">Resumen de Cuenta</div>
                 </q-card-section>
                 <q-card-section class="q-pa-md">
                    <div class="row justify-between q-mb-sm">
                       <span class="text-grey-7">Precio por Día:</span>
                       <q-input v-model.number="pensionForm.precio_dia" type="number" dense borderless input-class="text-right text-weight-bold" style="width: 100px" />
                    </div>
                    <div class="row justify-between q-mb-sm">
                       <span class="text-grey-7">Estancia (días):</span>
                       <span class="text-weight-bold">{{ calcularDiasEstancia }}</span>
                    </div>
                    <div class="row justify-between q-mb-sm">
                       <span class="text-grey-7">Subtotal:</span>
                       <span class="text-weight-bold">${{ (calcularDiasEstancia * pensionForm.precio_dia).toFixed(2) }}</span>
                    </div>
                    <div class="row justify-between q-mb-sm">
                       <span class="text-grey-7">Descuento (%):</span>
                       <q-input v-model.number="pensionForm.descuento" type="number" dense borderless input-class="text-right" style="width: 60px" />
                    </div>
                    <q-separator class="q-my-md" />
                    <div class="row justify-between items-center q-mb-lg">
                       <span class="text-h6">TOTAL:</span>
                       <span class="text-h5 text-weight-bolder text-primary">${{ calcularTotalFinal.toFixed(2) }}</span>
                    </div>
                    <q-btn color="primary" :label="pensionEditando ? 'Actualizar' : 'Registrar'" class="full-width q-py-md rounded-12 text-weight-bold" unelevated @click="guardarPension" :loading="cargando" />
                    <q-btn flat color="grey-7" label="Cancelar" class="full-width q-mt-sm" @click="cerrarModalPension" />
                 </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal Reportes -->
    <q-dialog v-model="mostrarModalReportes">
      <q-card style="min-width: 400px" class="rounded-16">
        <q-card-section class="bg-gradient-info text-white row items-center">
          <div class="text-h6"><q-icon name="description" class="q-mr-sm" /> Módulo de Reportería</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md">
           <q-list bordered separator class="rounded-borders">
             <q-item clickable v-ripple @click="descargarReporte('activas')">
               <q-item-section avatar><q-avatar color="primary" text-color="white" icon="pets" /></q-item-section>
               <q-item-section>
                 <q-item-label class="text-weight-bold">Pensiones Activas</q-item-label>
                 <q-item-label caption>Listado de mascotas hospedadas actualmente.</q-item-label>
               </q-item-section>
             </q-item>
             <q-item clickable v-ripple @click="descargarReporte('historial_mes')">
               <q-item-section avatar><q-avatar color="secondary" text-color="white" icon="history" /></q-item-section>
               <q-item-section>
                 <q-item-label class="text-weight-bold">Historial Mensual</q-item-label>
                 <q-item-label caption>Resumen de todas las estancias cerradas este mes.</q-item-label>
               </q-item-section>
             </q-item>
           </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal Proceso (Check-in / Check-out) -->
    <q-dialog v-model="modalProceso" persistent>
       <q-card style="width: 450px" class="rounded-16 shadow-10">
          <q-card-section :class="[procesoTipo === 'IN' ? 'bg-positive' : 'bg-negative', 'text-white']">
             <div class="text-h6">{{ procesoTipo === 'IN' ? 'Confirmar Entrada' : 'Confirmar Salida' }}</div>
             <div class="text-caption opacity-80">{{ procesoPension?.mascota?.nombre }}</div>
          </q-card-section>
          <q-card-section class="q-pa-md q-gutter-y-md">
             <q-input v-model="procesoForm.fecha" type="datetime-local" label="Fecha y Hora Real" outlined dense stack-label />
             <q-input v-model="procesoForm.observaciones" type="textarea" label="Observaciones del Proceso" outlined dense rows="3" />
             <div v-if="procesoTipo === 'OUT'" class="bg-grey-2 q-pa-sm rounded-8">
                <q-input v-model.number="procesoForm.costo_adicional" type="number" label="Cargos Extra / Adicionales" outlined dense prefix="$" />
             </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
             <q-btn flat label="Cancelar" v-close-popup />
             <q-btn :color="procesoTipo === 'IN' ? 'positive' : 'negative'" :label="procesoTipo === 'IN' ? 'Ingresar' : 'Dar de Alta'" unelevated @click="confirmarProceso" />
          </q-card-actions>
       </q-card>
    </q-dialog>

    <!-- Modal Jaula -->
    <q-dialog v-model="modalJaula" persistent>
      <q-card style="width: 400px" class="rounded-16 shadow-5">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ jaulaForm.id ? 'Editar Jaula' : 'Nueva Jaula' }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-input v-model="jaulaForm.nombre" label="Nombre / Identificador *" outlined dense />
          <q-input v-model="jaulaForm.numero" label="Número (opcional)" outlined dense />
          <q-select v-model="jaulaForm.id_tipo_jaula" :options="tiposJaula" label="Tipo de Jaula" outlined dense emit-value map-options :option-label="opt => opt.nombre" :option-value="opt => opt.id" />
          <q-input v-model.number="jaulaForm.capacidad" type="number" label="Capacidad" outlined dense />
          <q-select v-model="jaulaForm.estado" :options="['DISPONIBLE', 'MANTENIMIENTO']" label="Estado Inicial" outlined dense />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" unelevated @click="guardarJaula" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Turno -->
    <q-dialog v-model="modalTurno" persistent>
      <q-card style="width: 450px" class="rounded-16 shadow-5">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ turnoForm.id ? 'Editar Turno' : 'Programar Actividad' }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-select v-model="turnoForm.id_jaula" :options="jaulasOpciones" label="Jaula *" outlined dense emit-value map-options />
          <q-input v-model="turnoForm.personal_nombre" label="Personal a cargo *" outlined dense />
          <q-input v-model="turnoForm.actividad" label="Actividad / Tarea *" outlined dense placeholder="Ej: Alimentación, Paseo..." />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model="turnoForm.fecha" type="date" label="Fecha" outlined dense stack-label />
            </div>
            <div class="col-6">
              <q-input v-model="turnoForm.hora_inicio" type="time" label="Hora" outlined dense stack-label />
            </div>
          </div>
          <q-input v-model="turnoForm.notas" label="Instrucciones adicionales" outlined dense type="textarea" rows="2" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Agendar" unelevated @click="guardarTurno" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="cargando">
      <q-spinner-tail size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import pensionService from 'src/services/pension.service'
import PeticionService from 'src/services/peticion.service'
import { Modulo, Tabla } from 'src/common/enums/configuracion.enum'

const $q = useQuasar()
const peticionService = new PeticionService()

// PROPS
const props = defineProps({
  modoLectura: { type: Boolean, default: false }
})

// ESTADOS DE NAVEGACIÓN
const tabSeleccionada = ref('dashboard')
const cargando = ref(false)

// DATOS PRINCIPALES
const pensiones = ref([])
const jaulas = ref([])
const turnos = ref([])
const historial = ref([])
const estadisticas = ref({
  activas: 0,
  reservadas: 0,
  ingresosMes: 0,
  totalJaulas: 0,
  jaulasLibres: 0,
  jaulasOcupadas: 0
})

// CATALOGOS
const tiposPension = ref([])
const tiposJaula = ref([])
const serviciosAdicionales = ref([])

// FILTROS
const filtroTexto = ref('')
const filtroEstado = ref(null)
const fechaTurnos = ref(new Date().toISOString().split('T')[0])
const filtroHistorial = ref('')

// MODALES Y FORMULARIOS
const modalPension = ref(false)
const pensionEditando = ref(null)
const pensionForm = reactive({
  id: null,
  mascota: null,
  id_mascota: null,
  id_propietario: null,
  id_jaula: null,
  id_tipo_pension: null,
  fecha_entrada_estimada: '',
  fecha_salida_estimada: '',
  precio_dia: 150,
  descuento: 0,
  instrucciones_especiales: '',
  observaciones: '',
  contacto_emergencia_nombre: '',
  contacto_emergencia_telefono: ''
})

const modalProceso = ref(false)
const procesoTipo = ref('IN') // 'IN' o 'OUT'
const procesoPension = ref(null)
const procesoForm = reactive({
  fecha: '',
  observaciones: '',
  costo_adicional: 0
})

const modalJaula = ref(false)
const jaulaForm = reactive({ id: null, nombre: '', numero: '', capacidad: 1, id_tipo_jaula: null, estado: 'DISPONIBLE' })

const modalTurno = ref(false)
const turnoForm = reactive({ id: null, id_jaula: null, personal_nombre: '', fecha: '', hora_inicio: '', actividad: '', notas: '' })

const mostrarModalReportes = ref(false)

// OPCIONES PARA SELECTS
const opcionesEstado = [
  { label: 'Reservada', value: 'RESERVADA' },
  { label: 'Activa', value: 'ACTIVA' },
  { label: 'Finalizada', value: 'FINALIZADA' },
  { label: 'Cancelada', value: 'CANCELADA' }
]

const mascotasDisponibles = ref([])
const mascotasOpciones = ref([])

const tiposPensionOpciones = computed(() => tiposPension.value.map(t => ({ label: t.nombre, value: t.id })))
const jaulasOpciones = computed(() => jaulas.value.map(j => ({ 
  label: `${j.nombre} ${j.numero ? '#' + j.numero : ''} (${j.estado})`, 
  value: j.id,
  estado: j.estado 
})))

// COLUMNAS TABLAS
const columnasTurnos = [
  { name: 'hora', label: 'Hora', field: 'hora_inicio', align: 'left', sortable: true },
  { name: 'actividad', label: 'Actividad', field: 'actividad', align: 'left' },
  { name: 'jaula', label: 'Jaula', field: row => row.jaula?.nombre, align: 'left' },
  { name: 'personal', label: 'Encargado', field: 'personal_nombre', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' }
]

const columnasHistorial = [
  { name: 'fecha', label: 'Fecha Entrada', field: row => formatDate(row.fecha_entrada_real || row.fecha_entrada_estimada), align: 'left', sortable: true },
  { name: 'mascota', label: 'Mascota', field: row => row.mascota?.nombre, align: 'left' },
  { name: 'dias', label: 'Días', field: row => calcularDiasEntre(row.fecha_entrada_real || row.fecha_entrada_estimada, row.fecha_salida_real || row.fecha_salida_estimada), align: 'center' },
  { name: 'total', label: 'Total Cobrado', field: 'precio_total', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado Final', field: 'estado', align: 'center' }
]

// COMPUTED
const pensionesFiltradas = computed(() => {
  return pensiones.value.filter(p => {
    const cumpleTexto = !filtroTexto.value || 
      p.mascota?.nombre?.toLowerCase().includes(filtroTexto.value.toLowerCase()) ||
      p.propietario?.nombre?.toLowerCase().includes(filtroTexto.value.toLowerCase());
    const cumpleEstado = !filtroEstado.value || p.estado === filtroEstado.value;
    return cumpleTexto && cumpleEstado && p.estado !== 'FINALIZADA' && p.estado !== 'CANCELADA';
  });
})

const turnosHoy = computed(() => turnos.value.filter(t => t.estado !== 'COMPLETADO').slice(0, 5))

const calcularDiasEstancia = computed(() => {
  if (!pensionForm.fecha_entrada_estimada || !pensionForm.fecha_salida_estimada) return 1;
  const d = calcularDiasEntre(pensionForm.fecha_entrada_estimada, pensionForm.fecha_salida_estimada);
  return d > 0 ? d : 1;
})

const calcularTotalFinal = computed(() => {
  const subtotal = calcularDiasEstancia.value * pensionForm.precio_dia;
  const desc = (pensionForm.descuento || 0) / 100;
  return subtotal * (1 - desc);
})

// MÉTODOS DE CARGA
const cargarDatos = async () => {
  cargando.value = true;
  try {
    const [resP, resE, resJ, resT] = await Promise.all([
      pensionService.pensiones.getAll(),
      pensionService.pensiones.getEstadisticas(),
      pensionService.jaulas.getAll(),
      pensionService.turnos.getByFecha(fechaTurnos.value)
    ]);
    pensiones.value = resP.data || [];
    estadisticas.value = resE.data || estadisticas.value;
    jaulas.value = resJ.data || [];
    turnos.value = resT.data || [];
    historial.value = pensiones.value.filter(p => p.estado === 'FINALIZADA' || p.estado === 'CANCELADA');
    await cargarCatalogos();
    await cargarMascotas();
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Error al cargar datos' });
  } finally {
    cargando.value = false;
  }
}

const cargarMascotas = async () => {
  try {
    const response = await peticionService.obtenerGet('mascota');
    if (Array.isArray(response) && response[0]?.elemento) {
       mascotasDisponibles.value = response[0].elemento.map(m => ({
          id: m.id,
          nombre: m.nombre,
          especie: m.especie?.nombre || 'Mascota',
          propietario: m.propietario?.poblador?.nombre || 'S/P',
          id_propietario: m.id_propietario
       }));
    }
    mascotasOpciones.value = [...mascotasDisponibles.value];
  } catch (e) {
    console.warn('Error al cargar mascotas', e);
  }
}

const cargarCatalogos = async () => {
  try {
    const [resT, resJ, resS] = await Promise.all([
      pensionService.catalogos.getTiposPension(),
      pensionService.catalogos.getTiposJaula(),
      pensionService.catalogos.getServiciosAdicionales()
    ]);
    tiposPension.value = resT.data || [];
    tiposJaula.value = resJ.data || [];
    serviciosAdicionales.value = resS.data || [];
  } catch (e) {
    console.warn('Algunos catálogos no pudieron cargarse', e);
  }
}

// ACCIONES
const abrirNuevaPension = () => {
  pensionEditando.value = null;
  Object.assign(pensionForm, {
    id: null, mascota: null, id_mascota: null, id_propietario: null,
    id_jaula: null, id_tipo_pension: null,
    fecha_entrada_estimada: date.formatDate(Date.now(), 'YYYY-MM-DDTHH:mm'),
    fecha_salida_estimada: date.formatDate(date.addToDate(Date.now(), { days: 1 }), 'YYYY-MM-DDTHH:mm'),
    precio_dia: 150, descuento: 0, instrucciones_especiales: '', observaciones: '',
    contacto_emergencia_nombre: '', contacto_emergencia_telefono: ''
  });
  modalPension.value = true;
}

const verDetalle = (pension) => {
  pensionEditando.value = pension;
  Object.assign(pensionForm, {
    ...pension,
    mascota: mascotasDisponibles.value.find(m => m.id === pension.id_mascota),
    fecha_entrada_estimada: date.formatDate(pension.fecha_entrada_estimada, 'YYYY-MM-DDTHH:mm'),
    fecha_salida_estimada: pension.fecha_salida_estimada ? date.formatDate(pension.fecha_salida_estimada, 'YYYY-MM-DDTHH:mm') : ''
  });
  modalPension.value = true;
}

const guardarPension = async () => {
  if (!pensionForm.mascota || !pensionForm.id_jaula) {
    $q.notify({ type: 'warning', message: 'Mascota y Jaula son obligatorias' });
    return;
  }
  cargando.value = true;
  try {
    const payload = { ...pensionForm, id_mascota: pensionForm.mascota.id, id_propietario: pensionForm.mascota.id_propietario, precio_total: calcularTotalFinal.value, estado: pensionEditando.value ? pensionEditando.value.estado : 'RESERVADA' };
    delete payload.mascota;
    if (pensionEditando.value) await pensionService.pensiones.update(pensionEditando.value.id, payload);
    else await pensionService.pensiones.create(payload);
    modalPension.value = false;
    await cargarDatos();
    $q.notify({ type: 'positive', message: 'Guardado con éxito' });
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al guardar' });
  } finally {
    cargando.value = false;
  }
}

const procesarCheckIn = (pension) => {
  procesoTipo.value = 'IN'; procesoPension.value = pension;
  procesoForm.fecha = date.formatDate(Date.now(), 'YYYY-MM-DDTHH:mm');
  procesoForm.observaciones = ''; modalProceso.value = true;
}

const procesarCheckOut = (pension) => {
  procesoTipo.value = 'OUT'; procesoPension.value = pension;
  procesoForm.fecha = date.formatDate(Date.now(), 'YYYY-MM-DDTHH:mm');
  procesoForm.observaciones = ''; procesoForm.costo_adicional = 0; modalProceso.value = true;
}

const confirmarProceso = async () => {
  cargando.value = true;
  try {
    if (procesoTipo.value === 'IN') await pensionService.pensiones.checkIn(procesoPension.value.id, { fecha_real: procesoForm.fecha, observaciones: procesoForm.observaciones });
    else await pensionService.pensiones.checkOut(procesoPension.value.id, { fecha_real: procesoForm.fecha, observaciones: procesoForm.observaciones, costo_adicional: procesoForm.costo_adicional });
    modalProceso.value = false;
    await cargarDatos();
    $q.notify({ type: 'positive', message: 'Proceso completado' });
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al procesar' });
  } finally {
    cargando.value = false;
  }
}

const abrirModalJaula = () => { Object.assign(jaulaForm, { id: null, nombre: '', numero: '', capacidad: 1, id_tipo_jaula: null, estado: 'DISPONIBLE' }); modalJaula.value = true; }
const editarJaula = (jaula) => { Object.assign(jaulaForm, jaula); modalJaula.value = true; }
const guardarJaula = async () => {
  try {
    if (jaulaForm.id) await pensionService.jaulas.update(jaulaForm.id, jaulaForm);
    else await pensionService.jaulas.create(jaulaForm);
    modalJaula.value = false; await cargarDatos();
  } catch (e) { $q.notify({ type: 'negative', message: 'Error al guardar jaula' }); }
}

const abrirModalTurno = () => { Object.assign(turnoForm, { id: null, id_jaula: null, personal_nombre: '', fecha: fechaTurnos.value, hora_inicio: '', actividad: '', notas: '' }); modalTurno.value = true; }
const editarTurno = (turno) => { Object.assign(turnoForm, turno); modalTurno.value = true; }
const guardarTurno = async () => {
  if (!turnoForm.id_jaula || !turnoForm.personal_nombre) { $q.notify({ type: 'warning', message: 'Datos incompletos' }); return; }
  try {
    if (turnoForm.id) await pensionService.turnos.update(turnoForm.id, turnoForm);
    else await pensionService.turnos.create(turnoForm);
    modalTurno.value = false; await cargarDatos();
    $q.notify({ type: 'positive', message: 'Turno guardado' });
  } catch (e) { $q.notify({ type: 'negative', message: 'Error al guardar turno' }); }
}

const completarTurno = async (turno) => {
  try {
    await pensionService.turnos.update(turno.id, { estado: 'COMPLETADO' });
    await cargarDatos();
    $q.notify({ type: 'positive', message: 'Actividad completada' });
  } catch (e) { $q.notify({ type: 'negative', message: 'Error al completar' }); }
}

const eliminarTurno = async (id) => {
  $q.dialog({ title: 'Confirmar', message: '¿Eliminar este turno?', cancel: true, persistent: true }).onOk(async () => {
    try { await pensionService.turnos.delete(id); await cargarDatos(); } catch (e) { $q.notify({ type: 'negative', message: 'Error al eliminar' }); }
  })
}

const descargarReporte = async (tipo) => {
  try {
    const res = await pensionService.reportes.descargarPdf(tipo);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', `Reporte_Pension_${tipo}.pdf`);
    document.body.appendChild(link); link.click();
  } catch (e) { $q.notify({ type: 'negative', message: 'Error al generar PDF' }); }
}

const formatDate = (f) => f ? date.formatDate(f, 'DD/MM/YYYY HH:mm') : '---'
const calcularDiasEntre = (f1, f2) => {
  if (!f1 || !f2) return 1;
  const diff = date.getDateDiff(f2, f1, 'days');
  return diff <= 0 ? 1 : diff;
}
const getEstadoColor = (est) => { const map = { 'RESERVADA': 'blue', 'ACTIVA': 'positive', 'FINALIZADA': 'grey-7', 'CANCELADA': 'negative' }; return map[est] || 'primary'; }
const getTurnoEstadoColor = (est) => { const map = { 'PENDIENTE': 'orange', 'EN_CURSO': 'blue', 'COMPLETADO': 'positive' }; return map[est] || 'grey'; }

const filtrarMascotas = (val, update) => {
  if (val === '') { update(() => { mascotasOpciones.value = mascotasDisponibles.value }); return; }
  update(() => {
    const needle = val.toLowerCase();
    mascotasOpciones.value = mascotasDisponibles.value.filter(v => v.nombre.toLowerCase().includes(needle) || v.propietario.toLowerCase().includes(needle));
  });
}
const cerrarModalPension = () => { modalPension.value = false; }

onMounted(() => { cargarDatos(); })
watch(fechaTurnos, () => { pensionService.turnos.getByFecha(fechaTurnos.value).then(res => { turnos.value = res.data }); })
</script>

<style scoped>
.bg-gradient-primary { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
.bg-gradient-info { background: linear-gradient(135deg, #00b4db 0%, #0083b0 100%); }
.kpi-card { border-radius: 16px; color: white; min-height: 110px; transition: transform 0.3s; }
.kpi-card:hover { transform: translateY(-5px); }
.glass-panel { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
.kpi-primary { background: linear-gradient(45deg, #2196F3, #21CBF3); }
.kpi-secondary { background: linear-gradient(45deg, #4CAF50, #8BC34A); }
.kpi-warning { background: linear-gradient(45deg, #FF9800, #FFC107); }
.kpi-danger { background: linear-gradient(45deg, #F44336, #E91E63); }
.kpi-icon-wrapper { background: rgba(255, 255, 255, 0.2); padding: 10px; border-radius: 12px; }
.pension-card { position: relative; overflow: hidden; border-left: 5px solid transparent; }
.status-bar { position: absolute; top: 0; left: 0; height: 100%; width: 4px; }
.info-row { display: flex; align-items: center; margin-bottom: 4px; }
.jaula-card { border-radius: 16px; border: 2px solid transparent; }
.jaula-card.disponible { border-color: rgba(76, 175, 80, 0.2); background-color: #f1f8e9; }
.jaula-card.ocupada { border-color: rgba(244, 67, 54, 0.2); background-color: #ffebee; }
.rounded-16 { border-radius: 16px; }
.rounded-12 { border-radius: 12px; }
.shadow-2 { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.hover-shadow:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
.transition-all { transition: all 0.3s ease; }
.sticky-summary { position: sticky; top: 20px; }
</style>