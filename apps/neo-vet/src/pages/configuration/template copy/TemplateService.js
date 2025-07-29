import { api } from 'src/boot/axios'; // Tu configuración de Axios
import Mustache from 'mustache';
import jsPDF from 'jspdf';

class TemplateService {
  
  // Obtener plantilla por ID
  async getTemplate(id) {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener la plantilla');
    }
  }

  // Guardar plantilla
  async saveTemplate(template) {
    try {
      const method = template.id ? 'put' : 'post';
      const url = template.id ? `/templates/${template.id}` : '/templates';
      
      const response = await api[method](url, template);
      return response.data;
    } catch (error) {
      throw new Error('Error al guardar la plantilla');
    }
  }

  // Listar todas las plantillas
  async getTemplates() {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener las plantillas');
    }
  }

  // Renderizar plantilla con datos
  renderTemplate(template, data) {
    try {
      return Mustache.render(template, data);
    } catch (error) {
      console.error('Error rendering template:', error);
      return template; // Devolver template original si falla
    }
  }

  // Generar PDF
  async generatePDF({ content, data, name }) {
    const renderedContent = this.renderTemplate(content, data);
    
    const pdf = new jsPDF();
    
    // Convertir HTML a PDF (esto es básico, podrías usar html2pdf.js)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderedContent;
    
    // Extraer texto plano para el PDF básico
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    pdf.text(textContent, 10, 10);
    pdf.save(`${name}.pdf`);
  }

  // Plantillas predefinidas
  getDefaultTemplates() {
    return {
      vacunacion: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1976d2; margin-bottom: 10px;">{{clinica.nombre}}</h2>
          <p style="color: #666;">{{clinica.direccion}} | Tel: {{clinica.telefono}}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px; display: inline-block;">
            CERTIFICADO DE VACUNACIÓN
          </h3>
        </div>

        <div style="margin-bottom: 25px;">
          <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
            DATOS DEL PROPIETARIO
          </h4>
          <p><strong>Nombre:</strong> {{propietario.nombre}}</p>
          <p><strong>Documento:</strong> {{propietario.documento}}</p>
          <p><strong>Teléfono:</strong> {{propietario.telefono}}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
            DATOS DE LA MASCOTA
          </h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Nombre:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">{{mascota.nombre}}</td>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Especie:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">{{mascota.especie}}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Raza:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">{{mascota.raza}}</td>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Edad:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">{{mascota.edad}}</td>
            </tr>
          </table>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1976d2; margin-bottom: 15px;">VACUNACIÓN APLICADA</h4>
          <p><strong>Tipo:</strong> {{servicio.tipo}}</p>
          <p><strong>Descripción:</strong> {{servicio.descripcion}}</p>
          <p><strong>Fecha:</strong> {{fecha.cita}}</p>
          <p><strong>Observaciones:</strong> {{servicio.observaciones}}</p>
        </div>

        <div style="margin-top: 60px; text-align: center;">
          <div style="border-top: 2px solid #333; width: 300px; margin: 0 auto; padding-top: 15px;">
            <p style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">{{veterinario.nombre}}</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 3px;">{{veterinario.titulo}}</p>
            <p style="font-size: 12px; color: #666;">Cédula Profesional: {{veterinario.cedula}}</p>
          </div>
        </div>
      `,
      
      receta: `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #4caf50; padding-bottom: 20px;">
          <div>
            <h2 style="color: #4caf50; margin: 0;">{{clinica.nombre}}</h2>
            <p style="color: #666; margin: 5px 0;">{{clinica.direccion}}</p>
            <p style="color: #666; margin: 5px 0;">Tel: {{clinica.telefono}} | {{clinica.email}}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="color: #4caf50; margin: 0;">RECETA MÉDICA</h3>
            <p style="color: #666; margin: 5px 0;">Fecha: {{fecha.actual}}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h4 style="color: #333; border-bottom: 2px solid #4caf50; padding-bottom: 5px;">PROPIETARIO</h4>
            <p><strong>Nombre:</strong> {{propietario.nombre}}</p>
            <p><strong>Teléfono:</strong> {{propietario.telefono}}</p>
            <p><strong>Dirección:</strong> {{propietario.direccion}}</p>
          </div>
          <div>
            <h4 style="color: #333; border-bottom: 2px solid #4caf50; padding-bottom: 5px;">PACIENTE</h4>
            <p><strong>Nombre:</strong> {{mascota.nombre}}</p>
            <p><strong>Especie:</strong> {{mascota.especie}} - {{mascota.raza}}</p>
            <p><strong>Peso:</strong> {{mascota.peso}} | <strong>Edad:</strong> {{mascota.edad}}</p>
          </div>
        </div>

        <div style="background: #f1f8e9; padding: 25px; border-radius: 10px; border-left: 5px solid #4caf50; margin-bottom: 30px;">
          <h4 style="color: #4caf50; margin-bottom: 20px;">📋 PRESCRIPCIÓN</h4>
          <div style="background: white; padding: 20px; border-radius: 8px; min-height: 150px; border: 2px dashed #4caf50;">
            <p style="color: #666; text-align: center; margin-top: 50px;">
              <em>Escribir prescripción médica aquí...</em>
            </p>
          </div>
        </div>

        <div style="margin-top: 50px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="text-align: center; border-top: 2px solid #333; width: 250px; padding-top: 10px;">
              <p style="font-weight: bold;">{{veterinario.nombre}}</p>
              <p style="font-size: 14px; color: #666;">{{veterinario.especialidad}}</p>
              <p style="font-size: 12px; color: #666;">Reg. Prof: {{veterinario.cedula}}</p>
            </div>
            <div style="text-align: center; border-top: 2px solid #333; width: 200px; padding-top: 10px;">
              <p style="font-weight: bold;">SELLO Y FIRMA</p>
              <div style="height: 60px;"></div>
            </div>
          </div>
        </div>
      `
    };
  }
}

export const templateService = new TemplateService();