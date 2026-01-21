const fs = require('fs');
const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Transitions to the Template
const calendarContentRegex = /<div class="calendar-content">([\s\S]*?)<\/div>\s*<\/div>/;
const calendarContentWithTransitions = `<div class="calendar-content">
          <!-- Indicador de carga -->
          <transition name="fade">
            <div v-if="isLoadingDisponibilidad" class="loading-overlay">
              <q-spinner-dots color="primary" size="50px" />
              <div class="loading-text">Cargando disponibilidad...</div>
            </div>
          </transition>

          <transition name="slide-fade" mode="out-in">
            <!-- Vista mensual -->
            <div v-if="selectedService && viewMode === 'month'" key="month" class="calendar-container">
              <!-- ... (rest of month view) -->
            </div>

            <!-- Vista diaria - Modo Tarjetas -->
            <div v-else-if="selectedService && viewMode === 'day' && dayViewMode === 'cards'" key="cards" class="day-view-container">
              <!-- ... (rest of cards view) -->
            </div>

            <!-- Vista diaria - Modo Tabla -->
            <div v-else-if="selectedService && viewMode === 'day' && dayViewMode === 'table'" key="table" class="day-table-view">
              <!-- ... (rest of table view) -->
            </div>

            <!-- Estado sin servicio seleccionado -->
            <div v-else-if="!selectedService" key="no-service" class="no-service-selected">
              <!-- ... (rest of no-service view) -->
            </div>
          </transition>
        </div>`;

// Note: Replacing the entire calendar-content block is risky with regex if it's large.
// I'll try to be more surgical or use a simpler approach.
// Actually, I'll just add the CSS for transitions first, as the template structure is already quite complex.

// 2. Add Transition CSS
const finalStyleRegex = /<\/style>/;
const transitionCSS = `
/* Transiciones de Vista */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Mejoras en el Sidebar */
.service-item {
  border: 1px solid transparent;
}
.service-item.active {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

/* Mejoras en el Header */
.main-header {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.service-name-encabezado {
  font-weight: 800;
  font-size: 24px;
  color: #1e293b;
}
</style>`;

if (finalStyleRegex.test(content)) {
    content = content.replace(finalStyleRegex, transitionCSS);
    console.log('Transition CSS added.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully.');
