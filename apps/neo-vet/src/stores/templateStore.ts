// src/stores/template.ts
import { defineStore } from 'pinia'
import { api } from '../boot/axios'
import PeticionService from 'src/services/peticion.service';
import type {
  CertificateType,
  CertificateTemplate,
  TemplateField,
  IssuedCertificate,
  CreateTemplateDto,
  GenerateCertificateDto,
  PreviewCertificateDto
} from '../common/interface/certificate.interfaz'

interface TemplateState {
  templates: CertificateTemplate[]
  certificateTypes: CertificateType[]
  templateFields: TemplateField[]
  issuedCertificates: IssuedCertificate[]
  loading: boolean
  error: string | null
}

export const useTemplateStore = defineStore('template', {
  state: (): TemplateState => ({
    templates: [],
    certificateTypes: [],
    templateFields: [],
    issuedCertificates: [],
    loading: false,
    error: null
  }),

  getters: {
    getTemplateById: (state) => (id: number): CertificateTemplate | undefined => {
      return state.templates.find(template => template.id === id)
    },

    getActiveTemplates: (state): CertificateTemplate[] => {
      return state.templates.filter(template => template.is_active)
    },

    getTemplatesByType: (state) => (typeId: number): CertificateTemplate[] => {
      return state.templates.filter(template => template.certificate_type_id === typeId)
    },

    getCertificateTypeById: (state) => (id: number): CertificateType | undefined => {
      return state.certificateTypes.find(type => type.id === id)
    }
  },

  actions: {
    async fetchCertificateTypes(): Promise<void> {
      try {
        this.loading = true
        this.error = null
        const response = await api.get<CertificateType[]>('/certificate-types')
        this.certificateTypes = response.data
      } catch (error: any) {
        this.error = error.message || 'Error fetching certificate types'
        console.error('Error fetching certificate types:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTemplates(): Promise<void> {
      try {
        this.loading = true
        this.error = null
        const response = await api.get<CertificateTemplate[]>('/certificate-templates')
        this.templates = response.data
      } catch (error: any) {
        this.error = error.message || 'Error fetching templates'
        console.error('Error fetching templates:', error)
      } finally {
        this.loading = false
      }
    },

    async createTemplate(templateData: CreateTemplateDto): Promise<CertificateTemplate> {
      try {
        this.loading = true
        this.error = null
        const response = await api.post<CertificateTemplate>('/certificate-templates', templateData)
        this.templates.push(response.data)
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating template'
        console.error('Error creating template:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTemplate(id: number, templateData: Partial<CreateTemplateDto>): Promise<CertificateTemplate> {
      try {
        this.loading = true
        this.error = null
        const response = await api.put<CertificateTemplate>(`/certificate-templates/${id}`, templateData)
        const index = this.templates.findIndex(t => t.id === id)
        if (index !== -1) {
          this.templates[index] = response.data
        }
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating template'
        console.error('Error updating template:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTemplate(id: number): Promise<void> {
      try {
        this.loading = true
        this.error = null
        await api.delete(`/certificate-templates/${id}`)
        this.templates = this.templates.filter(t => t.id !== id)
      } catch (error: any) {
        this.error = error.message || 'Error deleting template'
        console.error('Error deleting template:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTemplateFields(templateId: number): Promise<TemplateField[]> {
      try {
        this.loading = true
        this.error = null
        const response = await api.get<TemplateField[]>(`/certificate-templates/${templateId}/fields`)
        this.templateFields = response.data
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error fetching template fields'
        console.error('Error fetching template fields:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async generateCertificate(data: GenerateCertificateDto): Promise<IssuedCertificate> {
      try {
        this.loading = true
        this.error = null
        const response = await api.post<IssuedCertificate>('/certificates/generate', data)
        this.issuedCertificates.push(response.data)
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error generating certificate'
        console.error('Error generating certificate:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchIssuedCertificates(patientId?: number): Promise<void> {
      try {
        this.loading = true
        this.error = null
        const url = patientId ? `/certificates?patient_id=${patientId}` : '/certificates'
        const response = await api.get<IssuedCertificate[]>(url)
        this.issuedCertificates = response.data
      } catch (error: any) {
        this.error = error.message || 'Error fetching issued certificates'
        console.error('Error fetching issued certificates:', error)
      } finally {
        this.loading = false
      }
    },

    async previewTemplate(data: PreviewCertificateDto): Promise<string> {
      try {
        this.loading = true
        this.error = null
        const response = await api.post<{ html: string }>('/certificates/preview', data)
        return response.data.html
      } catch (error: any) {
        this.error = error.message || 'Error previewing template'
        console.error('Error previewing template:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError(): void {
      this.error = null
    },

    resetState(): void {
      this.templates = []
      this.certificateTypes = []
      this.templateFields = []
      this.issuedCertificates = []
      this.loading = false
      this.error = null
    }
  }
})
