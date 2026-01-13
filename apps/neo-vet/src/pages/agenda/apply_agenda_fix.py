import os

file_path = r"c:\Fuentes\Desarrollo web\Neodimio\Frontend-Neodimio-VueJs\Monorepo-Vue\apps\neo-vet\src\pages\agenda\Agenda.vue"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update day-header
old_header = '<div class="day-stats" v-if="day.isCurrentMonth && !day.isPast">'
new_header = '<div class="day-stats" v-if="day.isCurrentMonth && !day.isPast && day.hasAgenda">'
if old_header in content:
    content = content.replace(old_header, new_header)
    print("Updated day-header")
else:
    print("Could not find day-header to update")

# 2. Update day-slots-summary
old_summary = '<div class="day-slots-summary" v-if="day.isCurrentMonth && !day.isPast">'
new_summary = '<div class="day-slots-summary" v-if="day.isCurrentMonth && !day.isPast && day.hasAgenda">'
if old_summary in content:
    content = content.replace(old_summary, new_summary)
    print("Updated day-slots-summary")
else:
    print("Could not find day-slots-summary to update")

# 3. Insert Sin Agenda message
insert_marker = '<!-- Mensaje para días inactivos -->'
sin_agenda_html = """                <!-- Mensaje para días sin agenda -->
                <div v-if="day.isCurrentMonth && !day.isPast && !day.hasAgenda" class="no-agenda-day">
                  <q-icon name="event_busy" size="sm" color="grey-4" />
                  <span>Sin Agenda</span>
                </div>

                """
if insert_marker in content:
    content = content.replace(insert_marker, sin_agenda_html + insert_marker)
    print("Inserted Sin Agenda message")
else:
    print("Could not find insert marker for Sin Agenda message")

# 4. Add CSS
css_marker = """.inactive-day {
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
}"""

new_css = css_marker + """

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
}"""

if css_marker in content:
    content = content.replace(css_marker, new_css)
    print("Added CSS")
else:
    print("Could not find CSS marker")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied changes to Agenda.vue")
