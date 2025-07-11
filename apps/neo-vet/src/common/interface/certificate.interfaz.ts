// src/types/certificate.ts
export interface CertificateType {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
}

export interface TemplateField {
  id?: number
  template_id?: number
  field_name: string
  field_label: string
  field_type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  field_options?: string[]
  is_required: boolean
  field_order: number
  default_value?: string
}

export interface CertificateTemplate {
  id?: number
  veterinary_id: number
  certificate_type_id: number
  name: string
  template_content: string
  header_image?: string
  footer_text?: string
  paper_size: 'A4' | 'Letter' | 'A5'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  is_active: boolean
  created_at?: string
  updated_at?: string
  fields?: TemplateField[]
  certificate_type?: CertificateType
}

export interface IssuedCertificate {
  id: number
  template_id: number
  patient_id: number
  veterinary_id: number
  veterinarian_id: number
  certificate_number: string
  field_values: Record<string, any>
  issued_date: string
  pdf_path?: string
  status: 'draft' | 'issued' | 'cancelled'
  template?: CertificateTemplate
  patient?: any // Ajusta según tu tipo de paciente
}

export interface CreateTemplateDto {
  veterinary_id: number
  certificate_type_id: number
  name: string
  template_content: string
  header_image?: string
  footer_text?: string
  paper_size: 'A4' | 'Letter' | 'A5'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  fields: TemplateField[]
}

export interface GenerateCertificateDto {
  template_id: number
  patient_id: number
  field_values: Record<string, any>
}

export interface PreviewCertificateDto {
  template_id: number
  field_values: Record<string, any>
  patient_id: number
}
