const fs = require('fs');
const path = require('path');

const backendRoot = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Backend-Neodimio-NestJs';

const services = [
    { base: 'exploracion', classPrefix: 'AtencionServicioExploracion' },
    { base: 'certificado', classPrefix: 'AtencionServicioCertificado' },
    { base: 'receta', classPrefix: 'AtencionServicioReceta' },
    { base: 'medicamentos', classPrefix: 'AtencionServicioMedicamentos' },
    { base: 'cirugia', classPrefix: 'AtencionServicioCirugia' },
    { base: 'laboratorio', classPrefix: 'AtencionServicioLaboratorio' },
    { base: 'rayosx', classPrefix: 'AtencionServicioRayosx' },
    { base: 'hospitalizacion', classPrefix: 'AtencionServicioHospitalizacion' },
    { base: 'estetica', classPrefix: 'AtencionServicioEstetica' },
    { base: 'ultrasonido', classPrefix: 'AtencionServicioUltrasonido' },
    { base: 'emergencia', classPrefix: 'AtencionServicioEmergencia' },
    { base: 'rehabilitacion', classPrefix: 'AtencionServicioRehabilitacion' }
];

const getTabla = (s) => `ATENCION_SERVICIO_${s.base.toUpperCase()}`;
const getPrefix = (s) => `atencion_servicio_${s.base}`;

const createDirIfNotExist = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const templates = {
    model: (s) => `export interface ${getPrefix(s)}_modelo {
    id?: number;
    id_atencion_servicio: number;
    datos_servicio?: string;
    observaciones?: string;
    fecha_aplicacion?: Date;
    fecha_registro?: Date;
    id_usuario?: number;
}
`,

    repository: (s) => `import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ${getPrefix(s)}_modelo } from '../../models/general/${getPrefix(s)}.model';
import { atencion_servicios } from './atencion_servicios.repository';

@Table({
    tableName: '${getTabla(s)}',
    timestamps: false,
    schema: 'VET',
    comment: 'Detalle especializado de ${s.base} en una atencion',
})
export class ${getPrefix(s)} extends Model<${getPrefix(s)}_modelo, ${getPrefix(s)}_modelo> implements ${getPrefix(s)}_modelo {

    @Column({ field: 'id', primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
    id?: number;

    @ForeignKey(() => atencion_servicios)
    @Column({ field: 'id_atencion_servicio', type: DataType.INTEGER, allowNull: false })
    id_atencion_servicio: number;

    @Column({ field: 'datos_servicio', type: DataType.STRING('MAX') })
    datos_servicio?: string;

    @Column({ field: 'observaciones', type: DataType.STRING('MAX') })
    observaciones?: string;

    @Column({ field: 'fecha_aplicacion', type: DataType.DATE })
    fecha_aplicacion?: Date;

    @Column({ field: 'fecha_registro', type: DataType.DATE, defaultValue: DataType.NOW })
    fecha_registro?: Date;

    @Column({ field: 'id_usuario', type: DataType.INTEGER })
    id_usuario?: number;

    @BelongsTo(() => atencion_servicios)
    atencion_servicio?: atencion_servicios;
}
`,

    dto: (s) => `import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { Dto } from '../../../../../common/dtos/dto.dto';

export class ${s.classPrefix}Dto extends Dto {
    id?: number;

    @IsNumber()
    id_atencion_servicio: number;

    @IsOptional()
    @IsString()
    datos_servicio?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsOptional()
    @IsDateString()
    fecha_aplicacion?: string;
}
`,

    service: (s) => `import { Injectable } from '@nestjs/common';
import { Servicio } from '../../../../common/services/servicio.service';

@Injectable()
export class ${s.classPrefix}Service extends Servicio {
    constructor() {
        super('${getPrefix(s)}');
    }
}
`,

    controller: (s) => `import { Body, Controller, Param, Post, Put, Req } from '@nestjs/common';
import { Controlador } from '../../../../../common/controllers/controlador.controller';
import { ${s.classPrefix}Service } from 'apps/neo-vet/src/aplication/general/${getPrefix(s)}.service';
import { ${s.classPrefix}Dto } from './${getPrefix(s)}.dto';

@Controller('${getPrefix(s).replace(/_/g, '')}')
export class ${s.classPrefix}Controller extends Controlador {
    constructor(private readonly service: ${s.classPrefix}Service) {
        super(service);
    }

    @Post()
    public crear(@Body() unDto: ${s.classPrefix}Dto, @Req() request: Request) {
        return super.crear(unDto, request);
    }

    @Put(':id')
    public actualizar(@Param('id') id: number, @Body() unDto: ${s.classPrefix}Dto, @Req() request: Request) {
        return super.actualizar(+id, unDto, request);
    }
}
`
};

// Rutas base
const modelsDir = path.join(backendRoot, 'apps/common/domain/models/general');
const reposDir = path.join(backendRoot, 'apps/common/domain/repository/general');
const aplicationGeneralDir = path.join(backendRoot, 'apps/neo-vet/src/aplication/general');
const infraGeneralDir = path.join(backendRoot, 'apps/neo-vet/src/infraestructure/general');

console.log("Creando archivos base...");
services.forEach(s => {
    const prefix = getPrefix(s);
    // Model
    fs.writeFileSync(path.join(modelsDir, \`\${prefix}.model.ts\`), templates.model(s));
    
    // Repository
    fs.writeFileSync(path.join(reposDir, \`\${prefix}.repository.ts\`), templates.repository(s));
    
    // Application Service
    fs.writeFileSync(path.join(aplicationGeneralDir, \`\${prefix}.service.ts\`), templates.service(s));

    // Infraestructure Controller & DTO
    const controllerDir = path.join(infraGeneralDir, prefix);
    createDirIfNotExist(controllerDir);
    fs.writeFileSync(path.join(controllerDir, \`\${prefix}.dto.ts\`), templates.dto(s));
    fs.writeFileSync(path.join(controllerDir, \`\${prefix}.controller.ts\`), templates.controller(s));
});

// Registrar exports en índices
console.log("Actualizando index.ts...");

// 1. common/domain/repository/general/index.ts
const repoIndexPath = path.join(reposDir, 'index.ts');
let repoIndex = fs.readFileSync(repoIndexPath, 'utf8');
services.forEach(s => {
    const expStr = \`export { \${getPrefix(s)} } from './\${getPrefix(s)}.repository';\`;
    if (!repoIndex.includes(expStr)) repoIndex += '\\n' + expStr;
});
fs.writeFileSync(repoIndexPath, repoIndex);

// 2. aplication/general/index.ts
const appIndexPath = path.join(aplicationGeneralDir, 'index.ts');
let appIndex = fs.readFileSync(appIndexPath, 'utf8');
services.forEach(s => {
    const expStr = \`export { \${s.classPrefix}Service } from './\${getPrefix(s)}.service';\`;
    if (!appIndex.includes(expStr)) appIndex += '\\n' + expStr;
});
fs.writeFileSync(appIndexPath, appIndex);

// 3. infraestructure/general/index.ts
const infraIndexPath = path.join(infraGeneralDir, 'index.ts');
let infraIndex = fs.readFileSync(infraIndexPath, 'utf8');
services.forEach(s => {
    const expStr = \`export { \${s.classPrefix}Controller } from './\${getPrefix(s)}/\${getPrefix(s)}.controller';\`;
    if (!infraIndex.includes(expStr)) infraIndex += '\\n' + expStr;
});
fs.writeFileSync(infraIndexPath, infraIndex);

// Modificar Repositorio Principal (repositorio.repository.ts)
console.log("Actualizando repositorio.repository.ts...");
const repoMainPath = path.join(backendRoot, 'apps/common/domain/repositorio.repository.ts');
let repoMain = fs.readFileSync(repoMainPath, 'utf8');
services.forEach(s => {
    const pfx = getPrefix(s);
    if (!repoMain.includes(\`\${pfx},\`)) {
        repoMain = repoMain.replace(/atencion_servicio_consulta/g, \`atencion_servicio_consulta, \${pfx}\`);
    }
    if (!repoMain.includes(\`identificador == '\${pfx}'\`)) {
        repoMain = repoMain.replace(/(if \\(identificador == 'atencion_servicio_consulta'\\) return atencion_servicio_consulta;)/g,
            \`$1\\n            if (identificador == '\${pfx}') return \${pfx};\`);
    }
});
fs.writeFileSync(repoMainPath, repoMain);

// Modificar basedatos.db.ts
console.log("Actualizando basedatos.db.ts...");
const baseDatosPath = path.join(backendRoot, 'apps/neo-vet/src/domain/basedatos.db.ts');
let baseDatos = fs.readFileSync(baseDatosPath, 'utf8');
services.forEach(s => {
    const pfx = getPrefix(s);
    if (!baseDatos.includes(\`\${pfx},\`)) {
        baseDatos = baseDatos.replace(/atencion_servicio_consulta } from/g, \`atencion_servicio_consulta, \${pfx} } from\`);
        baseDatos = baseDatos.replace(/atencion_servicio_consulta,/g, \`atencion_servicio_consulta,\\n      \${pfx},\`);
    }
});
fs.writeFileSync(baseDatosPath, baseDatos);

// Modificar general.module.ts
console.log("Actualizando general.module.ts...");
const generalModulePath = path.join(infraGeneralDir, 'general.module.ts');
let genModule = fs.readFileSync(generalModulePath, 'utf8');
services.forEach(s => {
    const ctrlImport = \`\${s.classPrefix}Controller,\`;
    const svcImport = \`\${s.classPrefix}Service,\`;
    
    if (!genModule.includes(ctrlImport)) {
        genModule = genModule.replace(/AtencionServicioConsultaController,/g, \`AtencionServicioConsultaController,\\n  \${ctrlImport}\`);
        genModule = genModule.replace(/AtencionServicioConsultaService,/g, \`AtencionServicioConsultaService,\\n  \${svcImport}\`);
    }
});
fs.writeFileSync(generalModulePath, genModule);

// Generar SQL Script
console.log("Generando script SQL...");
let sqlContent = '-- Script de generación de tablas de servicios médicos (Backend)\\n\\n';
services.forEach(s => {
    sqlContent += \`CREATE TABLE VET.\${getTabla(s)} (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_atencion_servicio INT NOT NULL FOREIGN KEY REFERENCES VET.ATENCION_SERVICIOS(id) ON DELETE CASCADE,
    datos_servicio NVARCHAR(MAX) NULL,
    observaciones NVARCHAR(MAX) NULL,
    fecha_aplicacion DATETIME NULL,
    fecha_registro DATETIME DEFAULT GETDATE(),
    id_usuario INT NULL
);
GO

\`;
});
fs.writeFileSync('C:\\\\Users\\\\Flavio\\\\.gemini\\\\antigravity\\\\brain\\\\85b9d6c8-a315-4563-9047-6cd2692e340f\\\\tablas_servicios_faltantes.sql', sqlContent);
// Opcionalmente como copia para que este accesible fácilmente en la raiz de frontend
fs.writeFileSync('C:\\\\Fuentes\\\\Desarrollo web\\\\Neodimio\\\\tablas_servicios_faltantes.sql', sqlContent);

console.log("Generación finalizada exitosamente.");
