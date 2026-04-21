<template>
  <div class="fullscreen-calendar">
    <div class="app-layout">
      <!-- Sidebar de servicios -->
      <div class="services-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- Header del sidebar -->
        <div class="sidebar-header">
          <div class="sidebar-logo" v-show="!sidebarCollapsed">
            <q-icon name="local_hospital" size="28px" color="white" />
            <span class="logo-text">Agenda de Citas</span>
          </div>
          
          <q-btn
            flat
            round
            :icon="sidebarCollapsed ? 'menu' : 'menu_open'"
            color="white"
            size="sm"
            @click="toggleSidebar"
            class="toggle-btn"
          />
        </div>

        <!-- Lista de servicios -->
        <div class="services-list">
          <div class="services-header" v-show="!sidebarCollapsed">
            <span class="services-title">Servicios Disponibles</span>
            <q-badge color="white" text-color="primary" :label="filteredServices.length" />
          </div>

          <!-- Servicios filtrados -->
          <div class="services-items">
            <div
              v-for="service in filteredServices"
              :key="service.id"
              class="service-item"
              :class="{ 
                'active': selectedService?.id === service.id,
                'collapsed': sidebarCollapsed 
              }"
              @click="selectService(service)"
            >
              <div class="service-icon-container">
                <q-avatar 
                  :color="selectedService?.id === service.id ? 'white' : service.color" 
                  :text-color="selectedService?.id === service.id ? service.color : 'white'"
                  size="40px"
                  class="service-avatar"
                >
                  <q-icon :name="service.icon" size="20px" />
                </q-avatar>
                
                <!-- Indicador de servicio activo -->
                <div 
                  v-if="selectedService?.id === service.id" 
                  class="active-indicator"
                ></div>
              </div>

              <div class="service-content" v-show="!sidebarCollapsed">
                <div class="service-name">{{ service.name }}</div>
                
                <!-- Estadísticas del servicio -->
                <div class="service-stats" v-if="selectedService?.id === service.id">
                  <div class="stat-mini">
                    <span class="stat-value">{{ getServiceStats(service.id).todayAppointments }}</span>
                    <span class="stat-label">Hoy</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-value">{{ getServiceStats(service.id).weekAppointments }}</span>
                    <span class="stat-label">Semana</span>
                  </div>
                </div>
              </div>

              <!-- Tooltip para sidebar colapsado -->
              <q-tooltip 
                v-if="sidebarCollapsed" 
                anchor="center right" 
                self="center left"
                :offset="[10, 0]"
                class="service-tooltip"
              >
                <div class="tooltip-content">
                  <div class="tooltip-title">{{ service.name }}</div>
                  <div class="tooltip-details">
                    <div>{{ service.duration }} minutos</div>
                    <div>${{ service.price }}</div>
                  </div>
                </div>
              </q-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
        <!-- Header principal -->
        <div class="main-header">
          <div class="header-left">
            <div class="breadcrumb" v-if="selectedService">
              <q-icon :name="selectedService.icon" size="30px" :color="selectedService.color"/>
              <span class="service-name-encabezado">{{ selectedService.name }}</span>
              <q-icon name="keyboard_arrow_right" size="16px" color="grey-5" />
              <span class="view-name">{{ viewMode === 'month' ? 'Vista Mensual' : 'Vista Diaria' }}</span>
              <q-separator/>
              <span>Estadísticas de Hoy</span>

              <div class="current-stats" v-if="selectedService">
                <div class="stats-grid">
                  <div class="mini-stat available">
                    <div class="mini-stat-value">{{ currentStats.available }} </div>
                    <div class="mini-stat-label">Libres</div>
                  </div>
                  <div class="mini-stat booked">
                    <div class="mini-stat-value">{{ currentStats.booked }}</div>
                    <div class="mini-stat-label">Ocupados</div>
                  </div>
                </div>
              </div>
            </div>
            <h1 v-else class="welcome-title">Selecciona un Servicio</h1>
          </div>
          
          <div class="header-actions" v-if="selectedService">
            <!-- Toggle de vista principal -->
            <div class="view-toggle">
              <q-btn-toggle
                v-model="viewMode"
                :options="[
                  { label: 'Mes', value: 'month', icon: 'calendar_view_month' },
                  { label: 'Día', value: 'day', icon: 'calendar_view_day' }
                ]"
                color="primary"
                outline
                no-caps
                rounded
                unelevated
                toggle-text-color="black"
              />
            </div>

            <!-- Toggle de vista diaria (solo visible en modo día) -->
            <div v-if="viewMode === 'day'" class="view-toggle">
              <q-btn-toggle
                v-model="dayViewMode"
                :options="[
                  { label: 'Tarjetas', value: 'cards', icon: 'view_module' },
                  { label: 'Tabla', value: 'table', icon: 'table_rows' }
                ]"
                color="secondary"
                outline
                no-caps
                rounded
                unelevated
                toggle-text-color="black"
              />
            </div>

            <!-- Navegación por mes -->
            <div v-if="viewMode === 'month'" class="navigation-controls">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="previousMonth"
                color="primary"
                size="md"
              />
              <div class="period-display">
                {{ currentMonthName }} {{ currentYear }}
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="nextMonth"
                color="primary"
                size="md"
              />
            </div>

            <!-- Navegación por día -->
            <div v-if="viewMode === 'day'" class="navigation-controls">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="previousDay"
                color="primary"
                size="md"
              />
              <div class="period-display">
                {{ selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                }) }}
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="nextDay"
                color="primary"
                size="md"
              />
            </div>

            <q-btn
              color="primary"
              icon="today"
              label="Hoy"
              @click="goToToday"
              no-caps
            />

            <q-btn
              color="secondary"
              icon="refresh"
              label="Refrescar"
              @click="refrescarDisponibilidad"
              no-caps
              :loading="isLoadingDisponibilidad"
            >
              <q-tooltip>Actualizar disponibilidad</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Contenido del calendario -->
        <div class="calendar-content">
          <!-- Indicador de carga -->
          <div v-if="isLoadingDisponibilidad" class="loading-overlay">
            <q-spinner-dots color="primary" size="50px" />
            <div class="loading-text">Cargando disponibilidad...</div>
          </div>

          <!-- Vista mensual -->
          <div v-if="selectedService && viewMode === 'month'" class="calendar-container">
            <!-- Días de la semana -->
            <div class="weekdays-header">
              <div
                v-for="day in weekdays"
                :key="day"
                class="weekday-cell"
              >
                {{ day }}
              </div>
            </div>

            <!-- Grid del calendario -->
            <div class="calendar-grid">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="day-cell"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'weekend': day.isWeekend,
                  'past': day.isPast
                }"
                @click="selectDayForDayView(day)"
              >
                <div class="day-header">
                  <span class="day-number">{{ day.date }}</span>
                  <div class="day-stats" v-if="day.isCurrentMonth && !day.isPast && day.hasAgenda">
                    <span class="available-badge">{{ day.availableSlots }}</span>
                    <span class="booked-badge">{{ day.bookedSlots }}</span>
                  </div>
                </div>

                <!-- Horarios del día -->
                <div class="day-slots-summary" v-if="day.isCurrentMonth && !day.isPast && day.hasAgenda">
                  <div
                    v-for="(slot, index) in day.slots.slice(0, 4)"
                    :key="slot.time"
                    class="time-slot-mini"
                    :class="{
                      'available': slot.status === 'available',
                      'booked': slot.status === 'booked' || slot.status === 'confirmed'
                    }"
                  >
                    <div class="slot-time-mini">{{ slot.time }}</div>
                  </div>
                  <div v-if="day.slots.length > 4" class="more-slots">
                    +{{ day.slots.length - 4 }} más
                  </div>
                </div>

                                <!-- Mensaje para días sin agenda -->
                <div v-if="day.isCurrentMonth && !day.isPast && !day.hasAgenda" class="no-agenda-day">
                  <q-icon name="event_busy" size="sm" color="grey-4" />
                  <span>Sin Agenda</span>
                </div>

                <!-- Mensaje para días inactivos -->
                <div v-if="(day.isPast || day.isWeekend) && day.isCurrentMonth" class="inactive-day">
                  <q-icon
                    :name="day.isWeekend ? 'weekend' : 'event_busy'"
                    size="md"
                    color="grey-4"
                  />
                  <span>{{ day.isWeekend ? 'Fin de semana' : 'Día pasado' }}</span>
                </div>
              </div>
            </div>
          </div>

                    <!-- Vista diaria - Modo Tarjetas -->
          <div v-if="selectedService && viewMode === 'day' && dayViewMode === 'cards'" class="day-view-container">
            <div class="day-view-header">
              <div class="day-info">
                <div class="day-meta">
                  <q-chip color="positive" text-color="white" icon="check_circle">
                    {{ daySlots.filter(s => s.status === 'available').length }} disponibles
                  </q-chip>
                  <q-chip color="negative" text-color="white" icon="event_busy">
                    {{ daySlots.filter(s => (s.status === 'booked' || s.status === 'confirmed')).length }} ocupados
                  </q-chip>
                </div>
              </div>

              <q-btn
                outline
                color="primary"
                icon="calendar_month"
                label="Cambiar Fecha"
                @click="showDatePicker = true"
                no-caps
              />
            </div>

            <!-- Grid de citas -->
            <div class="appointments-grid">
              <div 
                v-for="slot in daySlots" 
                :key="slot.time"
                class="modern-appointment-card"
                :class="{
                  'available': slot.status === 'available',
                  'booked': slot.status === 'booked' || slot.status === 'confirmed',
                  'selected': slot.status === 'selected'
                }"
                @click="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, slot)"
              >
                                                <div class="card-status-bar"></div>
                
                <div class="card-header">
                  <div class="time-badge">
                    <q-icon :name="getTimeIcon(slot.status)" size="16px" />
                    <span>{{ slot.time }}</span>
                  </div>
                  <div class="status-indicator" :class="slot.status">
                    {{ getStatusLabel(slot.status) }}
                  </div>
                </div>

                <div class="card-body">
                  <template v-if="slot.appointment">
                    <div class="appointment-info">
                      <div class="info-row">
                        <q-avatar size="36px" class="info-avatar person">
                          <q-icon name="person" />
                        </q-avatar>
                        <div class="info-text">
                          <div class="label">Propietario</div>
                          <div class="value">{{ slot.appointment.ownerName }}</div>
                        </div>
                      </div>
                      <div class="info-row">
                        <q-avatar size="36px" class="info-avatar pet">
                          <q-icon name="pets" />
                        </q-avatar>
                        <div class="info-text">
                          <div class="label">Mascota</div>
                          <div class="value">{{ slot.appointment.petName }} <span class="pet-type">({{ slot.appointment.petType || 'Mascota' }})</span></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="available-info">
                      <q-icon name="add_circle_outline" size="40px" color="positive" class="add-icon" />
                      <div class="available-text">Disponible</div>
                      <div class="available-subtext">Toca para agendar</div>
                    </div>
                  </template>
                </div>

                <div class="card-footer" v-if="slot.appointment">
                  <div class="service-tag">
                    <q-icon :name="selectedService.icon" size="14px" />
                    <span>{{ selectedService.name }}</span>
                  </div>
                  <div class="action-btns">
                    <q-btn flat round dense icon="print" color="secondary" @click.stop="imprimirCertificadoCita(slot)">
                      <q-tooltip>Imprimir Certificado</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="visibility" color="primary" @click.stop="viewAppointment(slot)" />
                    <q-btn flat round dense icon="delete_outline" color="negative" @click.stop="cancelAppointment(slot)" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vista diaria - Modo Tabla -->
          <div v-if="selectedService && viewMode === 'day' && dayViewMode === 'table'" class="day-table-view">
            <div class="day-view-header">
              <div class="day-info">
                <div class="day-meta">
                  <q-chip color="positive" text-color="white" icon="check_circle">
                    {{ daySlots.filter(s => s.status === 'available').length }} disponibles
                  </q-chip>
                  <q-chip color="negative" text-color="white" icon="event_busy">
                    {{ daySlots.filter(s => (s.status === 'booked' || s.status === 'confirmed')).length }} ocupados
                  </q-chip>
                </div>
              </div>

              <q-btn
                outline
                color="primary"
                icon="calendar_month"
                label="Cambiar Fecha"
                @click="showDatePicker = true"
                no-caps
              />
            </div>

            <!-- Tabla de horarios -->
            <div class="table-container">
              <q-table
                :rows="daySlots"
                :columns="dayColumns"
                row-key="time"
                flat
                bordered
                :rows-per-page-options="[0]"
                hide-pagination
                class="appointments-table"
                :table-style="{ backgroundColor: 'white' }"
              >
                <template v-slot:body="props">
                  <q-tr 
                    :props="props"
                    :class="{
                      'available-row': props.row.status === 'available',
                      'booked-row': props.row.status === 'booked' || props.row.status === 'confirmed',
                      'selected-row': props.row.status === 'selected'
                    }"
                    @click="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, props.row)"
                    class="table-row"
                  >

                    <q-td key="time" :props="props" class="time-column">
                      <div class="time-display-table">
                        <q-icon 
                          :name="getTimeIcon(props.row.status)" 
                          size="sm"
                          :color="getTimeIconColor(props.row.status)" 
                          class="time-icon"
                        />
                        <span class="time-text-table">{{ props.row.time }}</span>
                      </div>
                    </q-td>

                    <q-td key="status" :props="props" class="status-column">
                      <q-badge
                        :color="(props.row.status === 'booked' || props.row.status === 'confirmed') ? 'negative' : props.row.status === 'available' ? 'positive' : 'primary'"
                        :label="getStatusLabel(props.row.status)"
                        class="status-badge-table"
                      />
                    </q-td>

                    <q-td key="owner" :props="props" class="owner-column">
                      <div v-if="props.row.appointment" class="owner-info-table">
                        <q-avatar size="32px" color="primary" text-color="white" class="owner-avatar">
                          <q-icon name="person" />
                        </q-avatar>
                        <div class="owner-details-table">
                          <div class="owner-name-table">{{ props.row.appointment.ownerName }}</div>
                          <div class="owner-meta-table">Cliente</div>
                        </div>
                      </div>
                      <div v-else class="available-slot-table">
                        <q-icon name="person_add" size="sm" color="positive" />
                        <span class="available-text">Disponible para agendar</span>
                      </div>
                    </q-td>

                    <q-td key="pet" :props="props" class="pet-column">
                      <div v-if="props.row.appointment" class="pet-info-table">
                        <q-avatar size="32px" color="secondary" text-color="white" class="pet-avatar-table">
                          <q-icon name="pets" />
                        </q-avatar>
                        <div class="pet-details-table">
                          <div class="pet-name-table">{{ props.row.appointment.petName }}</div>
                          <div class="pet-type-table">{{ props.row.appointment.petType || 'Mascota' }}</div>
                        </div>
                      </div>
                      <div v-else class="no-pet-table">
                        <q-icon name="pets" size="sm" color="grey-5" />
                        <span class="text-grey-5">Sin asignar</span>
                      </div>
                    </q-td>

                    <q-td key="service" :props="props" class="service-column">
                      <div v-if="props.row.appointment" class="service-info-table">
                        <q-icon :name="selectedService.icon" size="sm" :color="selectedService.color" />
                        <div class="service-details-table">
                          <div class="service-name-table">{{ selectedService.name }}</div>
                          <div class="service-duration-table">{{ selectedService.duration }} min</div>
                        </div>
                      </div>
                      <div v-else class="no-service-table">
                        <q-icon :name="selectedService.icon" size="sm" color="grey-5" />
                        <span class="text-grey-5">{{ selectedService.name }}</span>
                      </div>
                    </q-td>

                    <q-td key="actions" :props="props" class="actions-column">
                      <div class="action-buttons-table">
                        <q-btn
                          v-if="props.row.status === 'available'"
                          size="sm"
                          color="positive"
                          icon="add"
                          round
                          flat
                          @click.stop="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, props.row)"
                          class="action-btn"
                        >
                          <q-tooltip>Agendar cita</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-if="props.row.status === 'booked' || props.row.status === 'confirmed'"
                          size="sm"
                          color="secondary"
                          icon="print"
                          round
                          flat
                          @click.stop="imprimirCertificadoCita(props.row)"
                          class="action-btn"
                        >
                          <q-tooltip>Imprimir Certificado</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-if="props.row.status === 'booked' || props.row.status === 'confirmed'"
                          size="sm"
                          color="info"
                          icon="visibility"
                          round
                          flat
                          @click.stop="viewAppointment(props.row)"
                          class="action-btn"
                        >
                          <q-tooltip>Ver detalles</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-if="props.row.status === 'booked' || props.row.status === 'confirmed'"
                          size="sm"
                          color="negative"
                          icon="cancel"
                          round
                          flat
                          @click.stop="cancelAppointment(props.row)"
                          class="action-btn"
                        >
                          <q-tooltip>Cancelar cita</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-if="props.row.status === 'selected'"
                          size="sm"
                          color="primary"
                          icon="edit"
                          round
                          flat
                          @click.stop="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, props.row)"
                          class="action-btn"
                        >
                          <q-tooltip>Confirmar cita</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>

                <template v-slot:no-data>
                  <div class="no-appointments">
                    <q-icon name="event_busy" size="48px" color="grey-5" />
                    <div class="no-appointments-text">
                      <h5>No hay horarios disponibles</h5>
                      <p>Este día no tiene horarios configurados o está fuera del horario laboral.</p>
                    </div>
                  </div>
                </template>
              </q-table>
            </div>
          </div>

          <!-- Estado sin servicio seleccionado -->
          <div v-else-if="!selectedService" class="no-service-selected">
            <div class="welcome-content">
              <q-icon name="medical_services" size="120px" color="primary" class="welcome-icon" />
              <h2>Bienvenido a VetCalendar</h2>
              <p>Selecciona un servicio del menú lateral para comenzar a gestionar las citas</p>
              
              <!-- Estadísticas generales -->
              <div class="welcome-stats">
                <div class="welcome-stat">
                  <q-icon name="event" size="24px" color="primary" />
                  <div class="stat-info">
                    <div class="stat-number">{{ totalAppointmentsToday }}</div>
                    <div class="stat-text">Citas hoy</div>
                  </div>
                </div>
                <div class="welcome-stat">
                  <q-icon name="trending_up" size="24px" color="positive" />
                  <div class="stat-info">
                    <div class="stat-number">{{ totalServicesActive }}</div>
                    <div class="stat-text">Servicios activos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog selector de fecha -->
    <q-dialog v-model="showDatePicker">
      <q-date
        v-model="selectedDateString"
        @update:model-value="updateSelectedDate"
        color="primary"
        :options="dateOptions"
      />
    </q-dialog>
    <!-- Al final del template, antes de </div> final -->
    <DialogoAsignarCita
      v-model:visible="mostrarDialogoAsignarCita"
      :slot-info="slotSeleccionado"
      :servicio="selectedService"
      @cita-creada="onCitaCreada"
    />
  </div>
</template>

<script setup>
import { useAgenda } from 'src/composables/useAgenda'
import DialogoAsignarCita from 'src/components/agenda/DialogoAsignarCita.vue'

const {
  currentDate, currentYear, currentMonth, selectedService, selectedSlot, viewMode, dayViewMode,
  selectedDate, showDatePicker, sidebarCollapsed, disponibilidadCache, citasCache,
  isLoadingDisponibilidad, weekdays, dayColumns, services, serviceSearch,
  currentMonthName, selectedDateString, filteredServices, totalAppointmentsToday,
  totalServicesActive, daySlots, calendarDays, currentStats, dateOptions,
  toggleSidebar, selectService, getServiceStats, getTimeIcon, getTimeIconColor,
  getStatusLabel, viewAppointment, cancelAppointment, previousMonth, nextMonth,
  previousDay, nextDay, goToToday, selectDayForDayView, updateSelectedDate,
  selectTimeSlot, refrescarDisponibilidad, mostrarDialogoAsignarCita,
  slotSeleccionado, onCitaCreada, imprimirCertificadoCita
} = useAgenda()
</script>

<style scoped>
/* Layout principal */
.fullscreen-calendar {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', sans-serif;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar de servicios */
.services-sidebar {
  width: 320px;
  background: linear-gradient(180deg, #1976D2 0%, #711bc8 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.services-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 80px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.toggle-btn {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.toggle-btn:hover {
  opacity: 1;
}

.services-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.services-header {
  padding: 20px 20px 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.services-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.services-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
}

.service-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.service-item.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.service-item.collapsed {
  justify-content: center;
  padding: 16px 12px;
}

.service-icon-container {
  position: relative;
  flex-shrink: 0;
}

.service-avatar {
  transition: all 0.3s ease;
}

.active-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #4ade80;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(74, 222, 128, 0.4);
}

.service-content {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-name-encabezado {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-stats {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.service-tooltip {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 12px;
}

.tooltip-content {
  text-align: center;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.tooltip-details {
  font-size: 13px;
  opacity: 0.8;
}

.current-stats {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mini-stat {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.mini-stat.available {
  border-left: 3px solid #4ade80;
}

.mini-stat.booked {
  border-left: 3px solid #f87171;
}

.mini-stat-value {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
}

.mini-stat-label {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Contenido principal */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: -10px;
  background: white;
  border-radius: 20px 0 0 0;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.main-content.expanded {
  margin-left: -10px;
}

.main-header {
  background: white;
  padding: 1px 32px;
  border-bottom: 4px solid #247df1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
}

.breadcrumb .service-name {
  font-weight: 600;
  color: #1e293b;
}

.breadcrumb .view-name {
  color: #64748b;
}

.welcome-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.view-toggle, .day-view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-view-toggle {
  background: rgba(103, 58, 183, 0.1);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(103, 58, 183, 0.2);
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.period-display {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  min-width: 200px;
  text-align: center;
  text-transform: capitalize;
}

/* Contenido del calendario */
.calendar-content {
  background: #ffffff;
  flex: 1;
  padding: 24px 32px;
  overflow: auto;
  position: relative;
}

/* Indicador de carga */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
  color: #1976D2;
}

/* Calendario mensual */
.calendar-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
}

.weekday-cell {
  background: #f1f5f9;
  padding: 16px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
}

.day-cell {
  background: white;
  min-height: 120px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.day-cell:hover {
  background: #f8faff;
}

.day-cell.today {
  background: linear-gradient(135deg, #667eea10, #764ba210);
}

.day-cell.other-month {
  background: #f8f9fa;
  color: #adb5bd;
}

.day-cell.past {
  background: #f8f9fa;
  color: #adb5bd;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-number {
  font-weight: 600;
  font-size: 16px;
}

.day-cell.today .day-number {
  color: #667eea;
  font-weight: 700;
}

.day-stats {
  display: flex;
  gap: 6px;
}

.available-badge,
.booked-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.available-badge {
  background: #22c55e;
  color: white;
}

.booked-badge {
  background: #ef4444;
  color: white;
}

.day-slots-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-slot-mini {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.time-slot-mini.available {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.time-slot-mini.booked {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

.slot-time-mini {
  font-weight: 600;
}

.more-slots {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  padding: 4px;
}

.inactive-day {
  position: absolute;
  inset: 0;
  background: rgba(248, 249, 250, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}

/* Vista diaria - Modo Tarjetas */
.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  padding: 16px;
}

.appointment-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid #e2e8f0;
  position: relative;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.appointment-card.available {
  background: white;
  border-color: #4ade80;
}

.appointment-card.booked {
  background: white;
  border-color: #f87171;
}

.appointment-card.selected {
  background: white;
  border-color: #667eea;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-text {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: white;
}

.appointment-content {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.appointment-details {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
}

.client-info, .pet-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.client-details, .pet-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.client-name, .pet-name {
  font-weight: 600;
  color: #1e293b;
}

.client-meta, .pet-type {
  font-size: 12px;
  color: #64748b;
}

.empty-slot {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.empty-slot-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.empty-slot-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-slot-title {
  font-weight: 600;
  color: #047857;
}

.empty-slot-subtitle {
  font-size: 12px;
  color: #64748b;
}

.appointment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.service-info, .duration-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Vista diaria - Modo Tabla */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.appointments-table {
  border: none;
}

.table-row {
  cursor: pointer;
  transition: all 0.2s ease;
  background: white !important;
}

.table-row:hover {
  background: #f8faff !important;
}

.available-row {
  background: white !important;
  border-left: 4px solid #4ade80;
}

.booked-row {
  background: white !important;
  border-left: 4px solid #f87171;
}

.selected-row {
  background: white !important;
  border-left: 4px solid #667eea;
}

/* Estado sin servicio seleccionado */
.no-service-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.welcome-icon {
  margin-bottom: 24px;
  opacity: 0.9;
}

.welcome-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-content p {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
}

.welcome-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 32px;
}

.welcome-stat {
  background: white;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.stat-info {
  text-align: left;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-text {
  font-size: 14px;
  color: #64748b;
}

/* Estilos modernos para tarjetas de citas */
.day-view-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100%;
}

.day-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 16px;
}

.day-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.day-meta {
  display: flex;
  gap: 12px;
}


.modern-appointment-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.modern-appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  z-index: 2;
}

.modern-appointment-card.available .card-status-bar {
  background: #10b981;
}

.modern-appointment-card.booked .card-status-bar {
  background: #ef4444;
}

.modern-appointment-card.selected {
  background: #f8faff;
  border-color: #3b82f6;
}

.modern-appointment-card.selected .card-status-bar {
  background: #3b82f6;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
}

.status-indicator {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-indicator.available {
  background: #ecfdf5;
  color: #059669;
}

.status-indicator.booked, .status-indicator.confirmed {
  background: #fef2f2;
  color: #dc2626;
}

.appointment-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-avatar {
  background: #f1f5f9;
  color: #64748b;
}

.info-text .label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 600;
}

.info-text .value {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.available-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  gap: 4px;
  color: #10b981;
}

.available-text {
  font-weight: 600;
  font-size: 15px;
}

.available-subtext {
  font-size: 11px;
  color: #94a3b8;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.service-tag {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}


.action-btns {
  display: flex;
  gap: 4px;
}

/* Estilos para la tabla moderna */
.day-table-view {
  padding: 24px;
  background: #f8fafc;
}

.appointments-table {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.time-display-table {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-text-table {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.status-badge-table {
  padding: 6px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
}

.owner-info-table, .pet-info-table, .service-info-table {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-name-table, .pet-name-table, .service-name-table {
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.owner-meta-table, .pet-type-table, .service-duration-table {
  font-size: 12px;
  color: #64748b;
}

.available-slot-table {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #15803d;
  font-weight: 600;
}

.no-appointments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: #94a3b8;
}

.no-appointments-text {
  text-align: center;
}

.no-appointments-text h5 {
  margin: 0 0 8px 0;
  color: #475569;
}

.no-appointments-text p {
  margin: 0;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.modern-appointment-card {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Media Queries */
@media (max-width: 768px) {
  .main-header {
    padding: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .navigation-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .period-display {
    min-width: auto;
  }
}

.no-agenda-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
  background: #fcfcfc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  margin: 4px 0;
}
</style>