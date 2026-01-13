const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update day-header
    const oldHeader = '<div class="day-stats" v-if="day.isCurrentMonth && !day.isPast">';
    const newHeader = '<div class="day-stats" v-if="day.isCurrentMonth && !day.isPast && day.hasAgenda">';
    if (content.includes(oldHeader)) {
        content = content.replace(oldHeader, newHeader);
        console.log("Updated day-header");
    } else {
        console.log("Could not find day-header to update");
    }

    // 2. Update day-slots-summary
    const oldSummary = '<div class="day-slots-summary" v-if="day.isCurrentMonth && !day.isPast">';
    const newSummary = '<div class="day-slots-summary" v-if="day.isCurrentMonth && !day.isPast && day.hasAgenda">';
    if (content.includes(oldSummary)) {
        content = content.replace(oldSummary, newSummary);
        console.log("Updated day-slots-summary");
    } else {
        console.log("Could not find day-slots-summary to update");
    }

    // 3. Insert Sin Agenda message
    const insertMarker = '<!-- Mensaje para días inactivos -->';
    const sinAgendaHtml = `                <!-- Mensaje para días sin agenda -->
                <div v-if="day.isCurrentMonth && !day.isPast && !day.hasAgenda" class="no-agenda-day">
                  <q-icon name="event_busy" size="sm" color="grey-4" />
                  <span>Sin Agenda</span>
                </div>

                `;
    if (content.includes(insertMarker)) {
        content = content.replace(insertMarker, sinAgendaHtml + insertMarker);
        console.log("Inserted Sin Agenda message");
    } else {
        console.log("Could not find insert marker for Sin Agenda message");
    }

    // 4. Add CSS
    const cssMarker = `.inactive-day {
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
}`;

    const newCss = cssMarker + `

.no-agenda-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 11px;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 4px;
}`;

    if (content.includes(cssMarker)) {
        content = content.replace(cssMarker, newCss);
        console.log("Added CSS");
    } else {
        console.log("Could not find CSS marker");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully applied changes to Agenda.vue");

} catch (err) {
    console.error("Error:", err);
}
