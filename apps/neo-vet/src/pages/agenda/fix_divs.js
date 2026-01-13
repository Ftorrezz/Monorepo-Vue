const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

const templateStart = content.indexOf('<template>');
const templateEnd = content.indexOf('</template>');

if (templateStart === -1 || templateEnd === -1) {
    console.error('Could not find template section');
    process.exit(1);
}

const template = content.substring(templateStart, templateEnd + 11);

const openDivs = (template.match(/<div/g) || []).length;
const closeDivs = (template.match(/<\/div>/g) || []).length;

console.log(`Open divs: ${openDivs}`);
console.log(`Close divs: ${closeDivs}`);

if (openDivs !== closeDivs) {
    console.log('Mismatched divs detected!');
    // If we need more closing divs, add them before </template>
    if (openDivs > closeDivs) {
        const diff = openDivs - closeDivs;
        const closingTags = '</div>'.repeat(diff);
        const newTemplate = template.replace('</template>', closingTags + '\n</template>');
        const newContent = content.substring(0, templateStart) + newTemplate + content.substring(templateEnd + 11);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Added ${diff} missing closing div(s)`);
    }
} else {
    console.log('Divs are balanced.');
}
