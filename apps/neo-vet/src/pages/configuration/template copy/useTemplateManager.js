import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { templateService } from './TemplateService.js';

export function useTemplateManager() {
  const $q = useQuasar();
  
  const templateContent = ref('');
  const templateName = ref('Nueva Plantilla');
  const currentTemplateId = ref(null);

  // Datos de ejemplo para vista previa
  const sampleData = reactive({
    clinica: {
      nombre: "Clínica Veterinaria San Martín",
      direccion: "Av. Principal #123, Ciudad Ejemplo",
      telefono: "(555) 123-4567",
      email: "info@veterinariasanmartin.com",
      website: "www.veterinariasanmartin.com"
    },
    veterinario: {
      nombre: "Dr. Carlos Mendoza Rivera",
      cedula: "12345678",
      especialidad: "Medicina Veterinaria General",
      titulo: "Médico Veterinario Zootecnista"
    },
    propietario: {
      nombre: "Ana García López",
      telefono: "(555) 987-6543",
      email: "ana.garcia@email.com",
      direccion: "Calle Secundaria #456, Ciudad Ejemplo",
      documento: "12.345.678-9"
    },
    mascota: {
      nombre: "Max",
      especie: "Canino",
      raza: "Golden Retriever",
      edad: "3 años",
      peso: "25 kg",
      color: "Dorado",
      sexo: "Macho",
      chip: "982000123456789"
    },
    fecha: {
      actual: new Date().toLocaleDateString('es-ES'),
      cita: "28/07/2025",
      hora: "14:30"
    },
    servicio: {
      tipo: "Vacunación",
      descripcion: "Aplicación de vacuna antirrábica y polivalente",
      precio: "$50.000",
      observaciones: "Próxima dosis en 1 año"
    }
  });

  // Plantillas disponibles
  const availableTemplates = ref([
    {
      id: 'vacunacion',
      name: 'Certificado de Vacunación',
      category: 'certificados'
    },
    {
      id: 'desparacitacion',
      name: 'Certificado de Desparasitación',
      category: 'certificados'
    },
    {
      id: 'consulta',
      name: 'Reporte de Consulta',
      category: 'reportes'
    },
    {
      id: 'cirugia',
      name: 'Reporte Quirúrgico',
      category: 'reportes'
    },
    {
      id: 'receta',
      name: 'Receta Médica',
      category: 'prescripciones'
    }
  ]);

  // Cargar plantilla
  const loadTemplate = async (templateId) => {
    try {
      $q.loading.show({
        message: 'Cargando plantilla...'
      });

      const template = await templateService.getTemplate(templateId);
      
      templateContent.value = template.content;
      templateName.value = template.name;
      currentTemplateId.value = templateId;

      $q.notify({
        color: 'positive',
        message: `Plantilla "${template.name}" cargada`,
        icon: 'check'
      });

    } catch (error) {
      $q.notify({
        color: 'negative',
        message: 'Error al cargar la plantilla',
        icon: 'error'
      });
    } finally {
      $q.loading.hide();
    }
  };

  // Guardar plantilla
  const saveTemplate = async () => {
    if (!templateName.value.trim()) {
      $q.notify({
        color: 'warning',
        message: 'Por favor ingresa un nombre para la plantilla',
        icon: 'warning'
      });
      return;
    }

    try {
      $q.loading.show({
        message: 'Guardando plantilla...'
      });

      const templateData = {
        id: currentTemplateId.value,
        name: templateName.value,
        content: templateContent.value,
        updatedAt: new Date()
      };

      await templateService.saveTemplate(templateData);

      $q.notify({
        color: 'positive',
        message: 'Plantilla guardada exitosamente',
        icon: 'save',
        actions: [
          { 
            label: 'Ver', 
            color: 'white',
            handler: () => console.log('Ver plantilla') 
          }
        ]
      });

    } catch (error) {
      $q.notify({
        color: 'negative',
        message: 'Error al guardar la plantilla',
        icon: 'error'
      });
    } finally {
      $q.loading.hide();
    }
  };

  // Insertar variable en el editor
  const insertVariable = (variable) => {
    templateContent.value += variable;
    
    $q.notify({
      color: 'info',
      message: 'Variable insertada',
      timeout: 1000,
      position: 'top'
    });
  };

  // Generar PDF
  const generatePDF = async () => {
    try {
      $q.loading.show({
        message: 'Generando PDF...'
      });

      // Aquí integrarías con jsPDF o una librería similar
      await templateService.generatePDF({
        content: templateContent.value,
        data: sampleData,
        name: templateName.value
      });

      $q.notify({
        color: 'positive',
        message: 'PDF generado exitosamente',
        icon: 'picture_as_pdf'
      });

    } catch (error) {
      $q.notify({
        color: 'negative',
        message: 'Error al generar PDF',
        icon: 'error'
      });
    } finally {
      $q.loading.hide();
    }
  };

  // Imprimir plantilla
  const printTemplate = () => {
    const printWindow = window.open('', '_blank');
    const renderedContent = templateService.renderTemplate(templateContent.value, sampleData);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${templateName.value}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${renderedContent}</body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return {
    templateContent,
    templateName,
    currentTemplateId,
    availableTemplates,
    sampleData,
    loadTemplate,
    saveTemplate,
    insertVariable,
    generatePDF,
    printTemplate
  };
}