# Análisis: ServicioConsultaGeneral vs ServicioVacunacion

## 🔍 Hallazgos Principales

### **PROBLEMA IDENTIFICADO:**
El componente `ServicioConsultaGeneral.vue` tiene un **error en el flujo de guardado** a base de datos:

1. **En AtencionPaciente.vue** línea 1107, la función `completarServicio` NO mapea "consulta" a ningún método especializado
2. Solo guarda en la tabla principal `ATENCION_SERVICIOS` 
3. No llama a `atencionServicioService.guardarConsulta()` como lo hace con vacunación y desparasitación
4. Los datos específicos de la consulta se pierden

### **Comparativa de Flujos:**

#### ✅ **ServicioVacunacion.vue** (CORRECTO)
```
1. usuario llena datos → emit('servicio-completado', {...vacunas})
2. AtencionPaciente.vue recibe evento
3. completarServicio(): detecta clave === 'vacunacion'
4. Guarda en tabla principal: atencionServicioService.completar()
5. Guarda en tabla especializada: atencionServicioService.guardarVacunacion()
6. Descuenta inventario: inventarioService.lotes.ajustarCantidad()
```

#### ❌ **ServicioConsultaGeneral.vue** (CON PROBLEMA)
```
1. usuario llena datos → emit('servicio-completado', {...consulta})
2. AtencionPaciente.vue recibe evento
3. completarServicio(): detecta clave === 'consulta'
4. Guarda en tabla principal: atencionServicioService.completar()
5. ❌ NO GUARDA EN TABLA ESPECIALIZADA!
6. Los datos de anamnesis, diagnóstico, etc. se pierden
```

---

## 📊 Estructura de Tabla Necesaria

### **Tabla: `ATENCION_SERVICIO_CONSULTA`**

```sql
CREATE TABLE IF NOT EXISTS [dbo].[ATENCION_SERVICIO_CONSULTA](
    [id] [int] IDENTITY(1,1) PRIMARY KEY,
    
    -- FK
    [id_atencion_servicio] [int] NOT NULL,
    
    -- Motivo de Consulta
    [id_motivo] [int] NULL,  -- FK a catálogo MOTIVO_CONSULTA
    [motivo_consulta] [varchar](500) NULL,
    [motivo_detallado] [varchar](max) NULL,
    
    -- Historia Clínica
    [anamnesis] [varchar](max) NULL,
    [hallazgos_examen] [varchar](max) NULL,
    
    -- Diagnóstico
    [id_diagnostico] [int] NULL,  -- FK a catálogo DIAGNOSTICO
    [diagnostico] [varchar](500) NULL,
    [diagnostico_complemento] [varchar](max) NULL,
    
    -- Plan de Tratamiento
    [plan_tratamiento] [varchar](max) NULL,
    [indicaciones_medicas] [varchar](max) NULL,
    [receta_indicaciones] [varchar](max) NULL,
    
    -- Seguimiento
    [pronostico] [varchar](500) NULL,
    [proxima_cita] [date] NULL,
    [observaciones] [varchar](max) NULL,
    
    -- Auditoría
    [fecha_creacion] [datetime] DEFAULT GETDATE(),
    [id_usuario_crea] [int] NULL,
    
    CONSTRAINT [FK_ATENCION_SRV_CONSULTA] FOREIGN KEY ([id_atencion_servicio]) 
        REFERENCES [dbo].[ATENCION_SERVICIOS]([id])
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

-- Índices para optimización
CREATE INDEX [IX_ATENCION_SERVICIO_CONSULTA_ATENCION] 
ON [dbo].[ATENCION_SERVICIO_CONSULTA] ([id_atencion_servicio])
```

---

## 🔧 Implementación Necesaria

### **1. Backend**
- [ ] Crear tabla `ATENCION_SERVICIO_CONSULTA` (arriba)
- [ ] Crear endpoint POST `/atencionservicioconsulta` para guardar
- [ ] Crear endpoint PUT `/atencionservicioconsulta/{id}` para actualizar
- [ ] Verificar que el modelo DTO coincida con la estructura

### **2. Frontend - Actualizar `AtencionPaciente.vue`**

En la función `completarServicio()` línea 1107, agregar el bloque para "consulta":

```javascript
} else if (clave === 'consulta') {
  // Mapeo de campos: FRONT -> BACK
  await atencionServicioService.guardarConsulta({
    id_atencion_servicio: servicio.idBD,
    id_motivo: datosFinales.id_motivo,
    motivo_consulta: datosFinales.motivo_detallado || '',
    motivo_detallado: datosFinales.motivo_detallado || '',
    anamnesis: datosFinales.anamnesis || '',
    hallazgos_examen: datosFinales.hallazgos_examen || '',
    id_diagnostico: datosFinales.id_diagnostico,
    diagnostico: datosFinales.diagnostico_complemento || '',
    diagnostico_complemento: datosFinales.diagnostico_complemento || '',
    indicaciones_medicas: datosFinales.indicaciones_medicas || '',
    pronostico: datosFinales.pronostico || '',
    proxima_cita: datosFinales.proxima_cita || null,
    observaciones: datosFinales.observaciones || ''
  })
}
```

### **3. Frontend - Mejorar `ServicioConsultaGeneral.vue`**

Agregar tracking del ID de BD:

```javascript
onMounted(async () => {
  await cargarDiagnosticos()
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    Object.assign(atencionConsulta.value, props.datosIniciales)
    // Guardar ID de la consulta si existe
    if (props.datosIniciales.id) {
      atencionConsulta.value.idBD = props.datosIniciales.id
    }
  }
})
```

---

## 📋 Diferencias Clave Entre Servicios

| Aspecto | Vacunación | Desparasitación | Consulta General |
|---------|-----------|-----------------|-----------------|
| **Tabla Especializada** | ✅ ATENCION_SERVICIO_VACUNACION | ✅ ATENCION_SERVICIO_DESPARASITACION | ❌ FALTA CREAR |
| **Items Anidados** | Múltiples vacunas | Una sola dosis | Único registro |
| **Inventory Impact** | ✅ Descuenta stock | ❌ No | ❌ No |
| **Guardado Actual** | ✅ Implementado | ✅ Implementado | ❌ NO IMPLEMENTADO |
| **Datos Críticos** | Tipo, laboratorio, lote, dosis | Tipo, dosis, próxima fecha | Anamnesis, diagnóstico, próxima cita |

---

## ✅ Checklist de Implementación

### **FASE 1: BACKEND (1-2 días)**
- [ ] DBA: Crear tabla ATENCION_SERVICIO_CONSULTA
- [ ] BE: Crear DTO/Model para AtencionServicioConsulta
- [ ] BE: Crear endpoint POST /atencionservicioconsulta
- [ ] BE: Crear endpoint PUT /atencionservicioconsulta/{id}
- [ ] BE: Agregar validaciones de campos requeridos
- [ ] BE: Tests unitarios

### **FASE 2: FRONTEND (1 día)**
- [ ] Actualizar `completarServicio()` en AtencionPaciente.vue
- [ ] Mejorar ServicioConsultaGeneral.vue para tracking de ID
- [ ] Verificar mapeo de campos FRONT → BACK
- [ ] Tests de e2e

### **FASE 3: QA (1-2 días)**
- [ ] Testing completo del flujo de consulta
- [ ] Verificar datos guardados en BD
- [ ] Pruebas de edición y actualización
- [ ] Testing de impresión de receta con datos guardados

---

## 🚀 Recomendaciones Adicionales

1. **Validación**: Hacer id_motivo e id_diagnostico requeridos (ya está en componente)
2. **Edición**: Agregar soporte para actualizar consulta después de creada
3. **Auditoría**: Registrar quién y cuándo se creó/modificó cada consulta
4. **Impresión**: Asegurar que la receta de impresión retrieve datos de la tabla especializada
5. **Próxima Cita**: Implementar notificaciones para recordar próximas consultas

---

## 📞 Próximos Pasos

**¿Proceder a crear la tabla en backend y actualizar el código frontend?**

Si tienes un backend disponible, puedo:
1. ✅ Proporcionar el script SQL exacto
2. ✅ Actualizar completamente AtencionPaciente.vue
3. ✅ Mejorar ServicioConsultaGeneral.vue
4. ✅ Crear tests de validación

**Confirma:**
- ¿Qué BD utilizas? (SQL Server, PostgreSQL, MySQL)
- ¿Tienes acceso a backend para crear endpoints?
- ¿Quieres que agregue actualización de consultas existentes?
