import { api } from '@/boot/axios'

export interface Template {
  id?: string
  name: string
  code: string
  description?: string
  modules: string[]
  content: string
  active: boolean
  paperSize?: string
  orientation?: string
  includeLogo?: boolean
  requireSignature?: boolean
  createdAt?: string
  updatedAt?: string
}

export const templateService = {
  async getTemplates() {
    const { data } = await api.get<Template[]>('/templates')
    return data
  },

  async createTemplate(template: Template) {
    const { data } = await api.post<Template>('/templates', template)
    return data
  },

  async updateTemplate(id: string, template: Template) {
    const { data } = await api.put<Template>(`/templates/${id}`, template)
    return data
  },

  async deleteTemplate(id: string) {
    await api.delete(`/templates/${id}`)
  },

  async toggleTemplateStatus(id: string) {
    const { data } = await api.patch<Template>(`/templates/${id}/toggle-status`)
    return data
  }
}
