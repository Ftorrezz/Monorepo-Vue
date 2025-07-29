// services/templateService.js
import { api } from 'src/boot/axios' // Tu instancia de axios

class TemplateService {
  constructor() {
    this.baseURL = '/api/templates'
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutos
  }

  // Métodos principales de CRUD
  async getTemplate(id) {
    try {
      // Verificar cache primero
      const cacheKey = `template_${id}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await api.get(`${this.baseURL}/${id}`)
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
      
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el template')
    }
  }

  async saveTemplate(templateData, options = {}) {
    try {
      const { silent = false } = options
      let response

      if (templateData.metadata.id) {
        // Actualizar template existente
        response = await api.put(`${this.baseURL}/${templateData.metadata.id}`, templateData)
      } else {
        // Crear nuevo template
        response = await api.post(this.baseURL, templateData)
      }

      // Invalidar cache
      this.invalidateCache(templateData.metadata.id)

      return response.data
    } catch (error) {
      throw this.handleError(error, 'Error al guardar el template')
    }
  }

  async deleteTemplate(id) {
    try {
      const response = await api.delete(`${this.baseURL}/${id}`)
      this.invalidateCache(id)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar el template')
    }
  }

  async getTemplates(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value)
        }
      })

      const response = await api.get(`${this.baseURL}?${params}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Error al obtener los templates')
    }
  }

  // Procesamiento de templates
  async processTemplate(content, variables) {
    try {
      let processedContent = content

      // Procesar variables de reemplazo simple {{variable}}
      variables.forEach(variable => {
        const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g')
        processedContent = processedContent.replace(regex, variable.value || '')
      })

      // Procesar variables con formateo {variable|format}
      const formatRegex = /\{([^|}\s]+)\|([^}]+)\}/g
      processedContent = processedContent.replace(formatRegex, (match, varName, format) => {
        const variable = variables.find(v => v.name === varName)
        if (!variable) return match

        return this.formatValue(variable.value, format)
      })

      // Procesar condicionales {if:variable}...{/if}
      const conditionalRegex = /\{if:([^}]+)\}([\s\S]*?)\{\/if\}/g
      processedContent = processedContent.replace(conditionalRegex, (match, varName, content) => {
        const variable = variables.find(v => v.name === varName)
        if (!variable || !variable.value) return ''
        return content
      })

      // Procesar bucles {for:variable}...{/for}
      const loopRegex = /\{for:([^}]+)\}([\s\S]*?)\{\/for\}/g
      processedContent = processedContent.replace(loopRegex, (match, varName, template) => {
        const variable = variables.find(v => v.name === varName)
        if (!variable || !Array.isArray(variable.value)) return ''
        
        return variable.value.map(item => {
          let itemContent = template
          Object.entries(item).forEach(([key, value]) => {
            const itemRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            itemContent = itemContent.replace(itemRegex, value)
          })
          return itemContent
        }).join('')
      })

      return {
        content: processedContent,
        processedAt: new Date().toISOString(),
        variables: variables
      }
    } catch (error) {
      throw this.handleError(error, 'Error al procesar el template')
    }
  }

  // Exportación de templates
  async exportTemplate(processedContent, format = 'pdf', options = {}) {
    try {
      const exportData = {
        content: processedContent.content,
        format: format.toLowerCase(),
        options: {
          filename: options.filename || 'template',
          pageSize: options.pageSize || 'A4',
          orientation: options.orientation || 'portrait',
          margins: options.margins || { top: 20, right: 20, bottom: 20, left: 20 },
          ...options
        }
      }

      const response = await api.post(`${this.baseURL}/export`, exportData, {
        responseType: 'blob'
      })

      const contentType = response.headers['content-type']
      const filename = this.getFilenameFromResponse(response) || 
                      `${exportData.options.filename}.${format}`

      return {
        data: response.data,
        filename,
        mimeType: contentType,
        format
      }
    } catch (error) {
      throw this.handleError(error, 'Error al exportar el template')
    }
  }

  // Validación de templates
  async validateTemplate(content, variables) {
    try {
      const response = await api.post(`${this.baseURL}/validate`, {
        content,
        variables
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Error al validar el template')
    }
  }

  // Importación de variables
  async importVariables(source, type = 'json') {
    try {
      let variables = []

      switch (type.toLowerCase()) {
        case 'json':
          variables = this.parseJSONVariables(source)
          break
        case 'csv':
          variables = await this.parseCSVVariables(source)
          break
        case 'excel':
          variables = await this.parseExcelVariables(source)
          break
        default:
          throw new Error(`Tipo de importación no soportado: ${type}`)
      }

      return variables
    } catch (error) {
      throw this.handleError(error, 'Error al importar variables')
    }
  }

  // Templates predefinidos
  async getTemplateCategories() {
    try {
      const response = await api.get(`${this.baseURL}/categories`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Error al obtener categorías')
    }
  }

  async getPresetTemplates(category = null) {
    try {
      const params = category ? `?category=${category}` : ''
      const response = await api.get(`${this.baseURL}/presets${params}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Error al obtener templates predefinidos')
    }
  }

  // Métodos de utilidad privados
  formatValue(value, format) {
    if (!value) return ''

    const formatParts = format.split(':')
    const formatType = formatParts[0]
    const formatOptions = formatParts[1]

    switch (formatType) {
      case 'date':
        return this.formatDate(value, formatOptions)
      case 'number':
        return this.formatNumber(value, formatOptions)
      case 'currency':
        return this.formatCurrency(value, formatOptions)
      case 'uppercase':
        return value.toString().toUpperCase()
      case 'lowercase':
        return value.toString().toLowerCase()
      case 'capitalize':
        return this.capitalize(value.toString())
      default:
        return value
    }
  }

  formatDate(value, format = 'DD/MM/YYYY') {
    try {
      const date = new Date(value)
      if (isNaN(date)) return value

      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()

      switch (format) {
        case 'DD/MM/YYYY':
          return `${day}/${month}/${year}`
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`
        default:
          return date.toLocaleDateString()
      }
    } catch {
      return value
    }
  }

  formatNumber(value, format = '0,0') {
    try {
      const num = parseFloat(value)
      if (isNaN(num)) return value

      const parts = format.split('.')
      const integerFormat = parts[0]
      const decimalPlaces = parts[1] ? parts[1].length : 0

      const formatted = num.toFixed(decimalPlaces)
      
      if (integerFormat.includes(',')) {
        const [integer, decimal] = formatted.split('.')
        const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return decimal ? `${withCommas}.${decimal}` : withCommas
      }

      return formatted
    } catch {
      return value
    }
  }

  formatCurrency(value, currency = 'USD') {
    try {
      const num = parseFloat(value)
      if (isNaN(num)) return value

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(num)
    } catch {
      return value
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  parseJSONVariables(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      const variables = []

      Object.entries(data).forEach(([key, value]) => {
        variables.push({
          id: Date.now().toString() + Math.random(),
          name: key,
          type: this.inferType(value),
          value: value,
          description: `Importado desde JSON`,
          required: false
        })
      })

      return variables
    } catch (error) {
      throw new Error('JSON inválido')
    }
  }

  async parseCSVVariables(csvContent) {
    try {
      // Aquí usarías una librería como Papa Parse
      // Por simplicidad, implementación básica
      const lines = csvContent.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const variables = []

      if (lines.length > 1) {
        const firstRow = lines[1].split(',').map(v => v.trim())
        
        headers.forEach((header, index) => {
          const value = firstRow[index] || ''
          variables.push({
            id: Date.now().toString() + index,
            name: header,
            type: this.inferType(value),
            value: value,
            description: `Importado desde CSV`,
            required: false
          })
        })
      }

      return variables
    } catch (error) {
      throw new Error('Error al procesar CSV')
    }
  }

  async parseExcelVariables(excelFile) {
    // Implementación con librería como xlsx o similar
    throw new Error('Importación de Excel no implementada aún')
  }

  inferType(value) {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'object' && Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    
    // Intentar inferir tipos específicos de string
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date'
      if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return 'email'
      if (/^https?:\/\//.test(value)) return 'url'
      if (/^\+?[\d\s\-\(\)]+$/.test(value)) return 'phone'
    }
    
    return 'text'
  }

  getFilenameFromResponse(response) {
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match) return match[1]
    }
    return null
  }

  invalidateCache(templateId = null) {
    if (templateId) {
      this.cache.delete(`template_${templateId}`)
    } else {
      this.cache.clear()
    }
  }

  handleError(error, defaultMessage) {
    console.error('TemplateService Error:', error)
    
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response
      const message = data?.message || data?.error || defaultMessage
      
      return new Error(`${message} (${status})`)
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.')
    } else {
      // Error de configuración
      return new Error(error.message || defaultMessage)
    }
  }

  // Métodos de configuración
  setBaseURL(url) {
    this.baseURL = url
  }

  setCacheTimeout(timeout) {
    this.cacheTimeout = timeout
  }

  clearCache() {
    this.cache.clear()
  }

  // Estadísticas de uso
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    }
  }
}

// Instancia singleton
export const templateService = new TemplateService()

// Exportar también la clase para testing
export { TemplateService }