# Script SQL para Crear Tabla ATENCION_SERVICIO_CONSULTA

## Para SQL Server

```sql
-- Crear tabla ATENCION_SERVICIO_CONSULTA en esquema VET
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[vet].[ATENCION_SERVICIO_CONSULTA]') AND type in (N'U'))
BEGIN
    CREATE TABLE [vet].[ATENCION_SERVICIO_CONSULTA](
        [id] [int] IDENTITY(1,1) PRIMARY KEY,
        
        -- Relación con ATENCION_SERVICIOS
        [id_atencion_servicio] [int] NOT NULL,
        
        -- Motivo de Consulta
        [id_motivo] [int] NULL,
        [motivo_consulta] [varchar](500) NULL,
        [motivo_detallado] [varchar](max) NULL,
        
        -- Historia Clínica - Anamnesis y Examen
        [anamnesis] [varchar](max) NULL,
        [hallazgos_examen] [varchar](max) NULL,
        
        -- Diagnóstico
        [id_diagnostico] [int] NULL,
        [diagnostico] [varchar](500) NULL,
        [diagnostico_complemento] [varchar](max) NULL,
        
        -- Plan de Tratamiento
        [plan_tratamiento] [varchar](max) NULL,
        [indicaciones_medicas] [varchar](max) NULL,
        [receta_indicaciones] [varchar](max) NULL,
        
        -- Seguimiento
        [pronostico] [varchar](500) NULL,
        [proxima_cita] [date] NULL,
        
        -- Observaciones Generales
        [observaciones] [varchar](max) NULL,
        
        -- Auditoría
        [fecha_creacion] [datetime] DEFAULT GETDATE(),
        [id_usuario_crea] [int] NULL,
        
        -- Constraint
        CONSTRAINT [FK_ATENCION_SRV_CONSULTA] FOREIGN KEY ([id_atencion_servicio]) 
            REFERENCES [vet].[ATENCION_SERVICIOS]([id]) ON DELETE CASCADE
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END

-- Crear índices para optimización
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ATENCION_SERVICIO_CONSULTA_ATENCION')
BEGIN
    CREATE INDEX [IX_ATENCION_SERVICIO_CONSULTA_ATENCION] 
    ON [vet].[ATENCION_SERVICIO_CONSULTA] ([id_atencion_servicio])
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ATENCION_SERVICIO_CONSULTA_MOTIVO')
BEGIN
    CREATE INDEX [IX_ATENCION_SERVICIO_CONSULTA_MOTIVO] 
    ON [vet].[ATENCION_SERVICIO_CONSULTA] ([id_motivo]) 
    WHERE [id_motivo] IS NOT NULL
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ATENCION_SERVICIO_CONSULTA_DIAGNOSTICO')
BEGIN
    CREATE INDEX [IX_ATENCION_SERVICIO_CONSULTA_DIAGNOSTICO] 
    ON [vet].[ATENCION_SERVICIO_CONSULTA] ([id_diagnostico])
    WHERE [id_diagnostico] IS NOT NULL
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ATENCION_SERVICIO_CONSULTA_PROXIMA_CITA')
BEGIN
    CREATE INDEX [IX_ATENCION_SERVICIO_CONSULTA_PROXIMA_CITA] 
    ON [vet].[ATENCION_SERVICIO_CONSULTA] ([proxima_cita])
    WHERE [proxima_cita] IS NOT NULL
END

PRINT 'Tabla ATENCION_SERVICIO_CONSULTA creada exitosamente en esquema VET'
```

---

## Para PostgreSQL

```sql
-- Crear tabla ATENCION_SERVICIO_CONSULTA
CREATE TABLE IF NOT EXISTS ATENCION_SERVICIO_CONSULTA (
    id SERIAL PRIMARY KEY,
    
    -- Relación con ATENCION_SERVICIOS
    id_atencion_servicio INT NOT NULL,
    
    -- Motivo de Consulta
    id_motivo INT,
    motivo_consulta VARCHAR(500),
    motivo_detallado TEXT,
    
    -- Historia Clínica - Anamnesis y Examen
    anamnesis TEXT,
    hallazgos_examen TEXT,
    
    -- Diagnóstico
    id_diagnostico INT,
    diagnostico VARCHAR(500),
    diagnostico_complemento TEXT,
    
    -- Plan de Tratamiento
    plan_tratamiento TEXT,
    indicaciones_medicas TEXT,
    receta_indicaciones TEXT,
    
    -- Seguimiento
    pronostico VARCHAR(500),
    proxima_cita DATE,
    
    -- Observaciones Generales
    observaciones TEXT,
    
    -- Auditoría
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_crea INT,
    
    -- Constraint
    CONSTRAINT fk_atencion_srv_consulta FOREIGN KEY (id_atencion_servicio) 
        REFERENCES ATENCION_SERVICIOS(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX idx_atencion_servicio_consulta_atencion ON ATENCION_SERVICIO_CONSULTA(id_atencion_servicio);
CREATE INDEX idx_atencion_servicio_consulta_motivo ON ATENCION_SERVICIO_CONSULTA(id_motivo);
CREATE INDEX idx_atencion_servicio_consulta_diagnostico ON ATENCION_SERVICIO_CONSULTA(id_diagnostico);
CREATE INDEX idx_atencion_servicio_consulta_proxima_cita ON ATENCION_SERVICIO_CONSULTA(proxima_cita);

PRINT 'Tabla ATENCION_SERVICIO_CONSULTA creada exitosamente';
```

---

## Para MySQL

```sql
-- Crear tabla ATENCION_SERVICIO_CONSULTA
CREATE TABLE IF NOT EXISTS ATENCION_SERVICIO_CONSULTA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación con ATENCION_SERVICIOS
    id_atencion_servicio INT NOT NULL,
    
    -- Motivo de Consulta
    id_motivo INT NULL,
    motivo_consulta VARCHAR(500) NULL,
    motivo_detallado LONGTEXT NULL,
    
    -- Historia Clínica - Anamnesis y Examen
    anamnesis LONGTEXT NULL,
    hallazgos_examen LONGTEXT NULL,
    
    -- Diagnóstico
    id_diagnostico INT NULL,
    diagnostico VARCHAR(500) NULL,
    diagnostico_complemento LONGTEXT NULL,
    
    -- Plan de Tratamiento
    plan_tratamiento LONGTEXT NULL,
    indicaciones_medicas LONGTEXT NULL,
    receta_indicaciones LONGTEXT NULL,
    
    -- Seguimiento
    pronostico VARCHAR(500) NULL,
    proxima_cita DATE NULL,
    
    -- Observaciones Generales
    observaciones LONGTEXT NULL,
    
    -- Auditoría
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_crea INT NULL,
    
    -- Constraint
    CONSTRAINT fk_atencion_srv_consulta FOREIGN KEY (id_atencion_servicio) 
        REFERENCES ATENCION_SERVICIOS(id) ON DELETE CASCADE,
    
    -- Índices
    KEY idx_atencion_servicio_consulta_atencion (id_atencion_servicio),
    KEY idx_atencion_servicio_consulta_motivo (id_motivo),
    KEY idx_atencion_servicio_consulta_diagnostico (id_diagnostico),
    KEY idx_atencion_servicio_consulta_proxima_cita (proxima_cita)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabla ATENCION_SERVICIO_CONSULTA creada exitosamente';
```

---

## Cambios Necesarios en el Backend

### 1. **DTO/Model**

Asegurate que exista la interfaz `AtencionServicioConsulta` con estos campos:

```typescript
export interface AtencionServicioConsulta {
    id?: number
    id_atencion_servicio: number
    id_motivo?: number
    motivo_consulta?: string
    motivo_detallado?: string
    anamnesis?: string
    hallazgos_examen?: string
    id_diagnostico?: number
    diagnostico?: string
    diagnostico_complemento?: string
    plan_tratamiento?: string
    indicaciones_medicas?: string
    receta_indicaciones?: string
    pronostico?: string
    proxima_cita?: string | null
    observaciones?: string
}
```

### 2. **Endpoints Necesarios**

#### **POST /atencionservicioconsulta**
```
Request Body:
{
  "id_atencion_servicio": 123,
  "id_motivo": 5,
  "motivo_consulta": "Chequeo general",
  "motivo_detallado": "Revisión de rutina",
  "anamnesis": "Mascota en buen estado...",
  "hallazgos_examen": "Sin anomalías...",
  "id_diagnostico": 12,
  "diagnostico": "Normal",
  "diagnostico_complemento": "Examen clínico normal",
  "indicaciones_medicas": "Reposo 24 horas",
  "proxima_cita": "2025-05-10",
  "observaciones": "Sin observaciones"
}

Response:
{
  "id": 456,
  "id_atencion_servicio": 123,
  ...
}
```

#### **PUT /atencionservicioconsulta/{id}**
```
Request Body: (mismos campos, todos opcionales)

Response: mensaje de éxito
```

#### **GET /atencionservicioconsulta/{id}**
```
Response:
{
  "id": 456,
  "id_atencion_servicio": 123,
  ...
}
```

#### **GET /atencionservicioconsulta?id_atencion_servicio={id}** (opcional)
```
Response: Lista de consultas para un servicio
```

### 3. **Validaciones Backend**

- `id_atencion_servicio` es requerido y debe ser FK válido
- `id_motivo` e `id_diagnostico` deben validar que existan en catálogos
- `proxima_cita` debe ser fecha válida
- Campos de texto pueden ser null pero no strings vacíos

### 4. **Respuesta Esperada**

El servicio `atencionServicioService.guardarConsulta()` llamará a:
```
POST /atencionservicioconsulta
```

Y debe retornar `void` (confirmación de éxito).

---

## Checklist de Verificación Backend

- [ ] Tabla creada en BD
- [ ] Índices creados para performance
- [ ] DTO/Model definido
- [ ] Endpoint POST implementado
- [ ] Endpoint PUT implementado (para ediciones futuras)
- [ ] Endpoint GET implementado (para lectura)
- [ ] Validaciones de FK funcionan
- [ ] Auditoría (id_usuario_crea, fecha_creacion) se registra
- [ ] Tests unitarios creados
- [ ] Tests de integración pasan

---

## Conexión desde Frontend Verificada

✅ El endpoint es llamado por:
```
File: apps/neo-vet/src/services/atencionServicio.service.ts
Method: guardarConsulta()
Endpoint: POST /atencionservicioconsulta
```

✅ Es triggerizado cuando:
```
File: apps/neo-vet/src/pages/AtencionPaciente.vue
Event: completarServicio() → clave === 'consulta'
```

✅ Datos enviados desde:
```
File: apps/neo-vet/src/components/servicios/ServicioConsultaGeneral.vue
Event: emit('servicio-completado', {...atencionConsulta})
```
