const fs = require('fs');
const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the unwanted divs
const unwantedDivs = [
    '<div class="card-gradient-border"></div>',
    '<div class="card-dot-pattern"></div>',
    '<div class="card-decorative-circle"></div>'
];

unwantedDivs.forEach(div => {
    const regex = new RegExp(`\\s*${div.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    content = content.replace(regex, '');
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Template cleaned up.');
