/**
 * ============================================================================
 * IMPLEMENTACIÓN COMPLETA: CATÁLOGOS LABORATORIALES
 * ============================================================================
 *
 * FECHA: Abril 2026
 * OBJETIVO: Sistema sofisticado de gestión de estudios, pruebas, valores
 *          de referencia y tipos de muestra
 */

// ============================================================================
// 📋 CHECKLIST DE ARCHIVOS CREADOS - FRONTEND
// ============================================================================

/**
 * 1. TIPOS E INTERFACES
 * ├── /apps/neo-vet/src/types/laboratorio-catalogo.ts
 * │   ├── export interface TipoMuestra
 * │   ├── export interface Estudio
 * │   ├── export interface Prueba
 * │   ├── export interface ValorReferencia
 * │   └── export enum Especie, Sexo, CategoriaEstudio
 * │
 * └── /apps/neo-vet/src/types/BACKEND_ESTRUCTURA.md
 *     └── Documentación de entidades, DTOs y endpoints requeridos
 */

/**
 * 2. SERVICIOS FRONTEND (Ya creados)
 * ├── /apps/neo-vet/src/services/estudios.service.ts
 * │   ├── obtenerEstudios(page, limit)
 * │   ├── crearEstudio(data)
 * │   ├── actualizarEstudio(id, data)
 * │   ├── importarCSV(file)
 * │   └── exportarCSV()
 * │
 * ├── /apps/neo-vet/src/services/pruebas.service.ts
 * │   ├── obtenerPruebas(page, limit)
 * │   ├── obtenerPorEstudio(idEstudio)
 * │   ├── crearMultiples(idEstudio, pruebas)
 * │   └── etc
 * │
 * ├── /apps/neo-vet/src/services/valores-referencia.service.ts ⭐ CRÍTICO
 * │   ├── obtenerValorAplicable(idPrueba, especie, edad?, peso?, sexo?)
 * │   ├── validarResultado(idPrueba, valor, especie, edad?, peso?, sexo?)
 * │   ├── importarCSV(file)
 * │   └── exportarCSV()
 * │
 * └── /apps/neo-vet/src/services/tipos-muestra.service.ts
 *     ├── obtenerTipos(page, limit)
 *     ├── crearTipo(data)
 *     └── etc
 */

/**
 * 3. COMPONENTES CRUD (Ya creados)
 * ├── /apps/neo-vet/src/components/laboratorio/catalogo/AbmEstudios.vue
 * │   └── Gestión de estudios (CRUD + búsqueda + import/export)
 * │
 * ├── /apps/neo-vet/src/components/laboratorio/catalogo/AbmPruebas.vue
 * │   └── Gestión de pruebas (agregar tests a estudios)
 * │
 * ├── /apps/neo-vet/src/components/laboratorio/catalogo/AbmValoresReferencia.vue ⭐
 * │   └── Gestión de rangos normales por ESPECIE/EDAD/SEXO/PESO
 * │
 * ├── /apps/neo-vet/src/components/laboratorio/catalogo/AbmTiposMuestra.vue
 * │   └── Gestión de tipos de muestras (sangre, orina, etc)
 * │
 * └── /apps/neo-vet/src/components/laboratorio/catalogo/DashboardCatalogos.vue
 *     └── Dashboard con estadísticas y recomendaciones
 */

/**
 * 4. PÁGINA DE ADMINISTRACIÓN
 * └── /apps/neo-vet/src/pages/laboratorio/AdminCatalogos.vue
 *     └── Página principal con tabs para acceder a todos los catálogos
 */

// ============================================================================
// 🔧 PASOS DE IMPLEMENTACIÓN - BACKEND (NestJS)
// ============================================================================

/**
 * Estos son los pasos que DEBES hacer en tu backend NestJS:
 *
 * PASO 1: Crear las Migraciones/Entidades TypeORM
 * ================================================
 *
 * a) Crear archivo: src/modules/laboratorio-catalogo/entities/estudio.entity.ts
 *
 *    @Entity('estudios')
 *    export class EstudioEntity {
 *      @PrimaryGeneratedColumn()
 *      id: number
 *
 *      @Column({ unique: true, length: 50 })
 *      codigo: string
 *
 *      @Column({ length: 255 })
 *      nombre: string
 *
 *      @Column({ length: 100 })
 *      categoria: string
 *
 *      @Column({ type: 'text', nullable: true })
 *      descripcion: string
 *
 *      @Column({ type: 'decimal', precision: 10, scale: 2 })
 *      costo: number
 *
 *      @Column()
 *      tiempoResultado: number
 *
 *      @Column({ default: 'activo' })
 *      estado: 'activo' | 'inactivo'
 *
 *      @CreateDateColumn()
 *      creado: Date
 *
 *      @UpdateDateColumn()
 *      actualizado: Date
 *
 *      @OneToMany(() => PruebaEntity, prueba => prueba.estudio, { cascade: true })
 *      pruebas: PruebaEntity[]
 *    }
 *
 * b) Repetir para: PruebaEntity, ValorReferenciaEntity, TipoMuestraEntity
 *    (Ver BACKEND_ESTRUCTURA.md para SQL completos)
 *
 * c) Ejecutar migración:
 *    npm run typeorm migration:run
 *
 *
 * PASO 2: Crear DTOs
 * ==================
 *
 * a) src/modules/laboratorio-catalogo/dtos/create-estudio.dto.ts
 *
 *    export class CreateEstudioDto {
 *      @IsString()
 *      @IsNotEmpty()
 *      codigo: string
 *
 *      @IsString()
 *      @IsNotEmpty()
 *      nombre: string
 *
 *      @IsNumber()
 *      @IsNotEmpty()
 *      costo: number
 *
 *      // ... resto de campos
 *    }
 *
 * b) Repetir para otros DTOs (CreatePruebaDto, CreateValorReferenciaDto, etc)
 *
 *
 * PASO 3: Crear Servicios
 * =======================
 *
 * a) src/modules/laboratorio-catalogo/services/estudios.service.ts
 *
 *    @Injectable()
 *    export class EstudiosService {
 *      constructor(
 *        @InjectRepository(EstudioEntity)
 *        private repo: Repository<EstudioEntity>
 *      ) {}
 *
 *      async obtenerEstudios(page: number, limit: number) {
 *        const skip = (page - 1) * limit
 *        const [data, total] = await this.repo.findAndCount({
 *          skip,
 *          take: limit,
 *          relations: ['pruebas']
 *        })
 *        return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
 *      }
 *
 *      async crearEstudio(dto: CreateEstudioDto) {
 *        const estudio = this.repo.create(dto)
 *        return await this.repo.save(estudio)
 *      }
 *
 *      // ... resto de métodos
 *    }
 *
 * b) ⭐ Crear ValoresReferenciaService (el más crítico)
 *
 *    Este debe tener el método:
 *
 *    async obtenerValorAplicable(
 *      idPrueba: number,
 *      especie: string,
 *      edad?: number,
 *      peso?: number,
 *      sexo?: string
 *    ) {
 *      // Buscar el valor de referencia más apropiado
 *      // Prioridad: EXACTO > POR EDAD/PESO > GENERAL
 *      return await this.repo
 *        .createQueryBuilder('vr')
 *        .where('vr.idPrueba = :idPrueba', { idPrueba })
 *        .andWhere('vr.especie = :especie', { especie })
 *        .andWhere('vr.sexo IS NULL OR vr.sexo = :sexo', { sexo })
 *        .andWhere('vr.edadMinima IS NULL OR vr.edadMinima <= :edad', { edad })
 *        .andWhere('vr.edadMaxima IS NULL OR vr.edadMaxima >= :edad', { edad })
 *        .andWhere('vr.pesoMinimo IS NULL OR vr.pesoMinimo <= :peso', { peso })
 *        .andWhere('vr.pesoMaximo IS NULL OR vr.pesoMaximo >= :peso', { peso })
 *        .orderBy('CASE WHEN vr.sexo IS NOT NULL THEN 0 ELSE 1 END', 'ASC')
 *        .addOrderBy('CASE WHEN vr.edadMinima IS NOT NULL THEN 0 ELSE 1 END', 'ASC')
 *        .getOne()
 *    }
 *
 *    async validarResultado(
 *      idPrueba: number,
 *      valor: number,
 *      especie: string,
 *      edad?: number,
 *      peso?: number,
 *      sexo?: string
 *    ) {
 *      const ref = await this.obtenerValorAplicable(
 *        idPrueba, especie, edad, peso, sexo
 *      )
 *
 *      if (!ref) {
 *        return {
 *          esValido: false,
 *          estado: 'sin_referencia',
 *          mensaje: 'No hay valor de referencia para esta combinación'
 *        }
 *      }
 *
 *      const esValido = valor >= ref.valorMinimo && valor <= ref.valorMaximo
 *      let estado = esValido ? 'normal' : 'fuera_rango'
 *
 *      if (ref.alertaMinima && valor < ref.alertaMinima) estado = 'critico_bajo'
 *      if (ref.alertaMaxima && valor > ref.alertaMaxima) estado = 'critico_alto'
 *
 *      return {
 *        esValido,
 *        estado,
 *        mensaje: `Valor ${esValido ? 'dentro' : 'fuera'} del rango normal`,
 *        rango: { minimo: ref.valorMinimo, maximo: ref.valorMaximo }
 *      }
 *    }
 *
 *
 * PASO 4: Crear Controladores
 * ============================
 *
 * a) src/modules/laboratorio-catalogo/controllers/estudios.controller.ts
 *
 *    @Controller('laboratorio/estudios')
 *    export class EstudiosController {
 *      constructor(private service: EstudiosService) {}
 *
 *      @Get()
 *      async obtener(
 *        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
 *        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
 *      ) {
 *        return await this.service.obtenerEstudios(page, limit)
 *      }
 *
 *      @Post()
 *      async crear(@Body() dto: CreateEstudioDto) {
 *        return await this.service.crearEstudio(dto)
 *      }
 *
 *      @Put(':id')
 *      async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstudioDto) {
 *        return await this.service.actualizarEstudio(id, dto)
 *      }
 *
 *      @Delete(':id')
 *      async eliminar(@Param('id', ParseIntPipe) id: number) {
 *        return await this.service.eliminarEstudio(id)
 *      }
 *
 *      @Post('import')
 *      @UseInterceptors(FileInterceptor('file'))
 *      async importar(@UploadedFile() file: Express.Multer.File) {
 *        const csv = file.buffer.toString()
 *        return await this.service.importarCSV(csv)
 *      }
 *
 *      @Get('export')
 *      async exportar(@Res() res: Response) {
 *        const csv = await this.service.exportarCSV()
 *        res.type('text/csv')
 *        res.send(csv)
 *      }
 *    }
 *
 * b) Repetir para: PruebasController, ValoresReferenciaController, TiposMuestraController
 *
 * c) ⭐ ValoresReferenciaController debe incluir:
 *
 *    @Post('validar')
 *    async validarResultado(@Body() dto: ValidarResultadoDto) {
 *      return await this.service.validarResultado(dto.idPrueba, dto.valor, ...)
 *    }
 *
 *
 * PASO 5: Crear el Módulo
 * =======================
 *
 * src/modules/laboratorio-catalogo/laboratorio-catalogo.module.ts
 *
 * @Module({
 *   imports: [TypeOrmModule.forFeature([
 *     EstudioEntity, PruebaEntity, ValorReferenciaEntity, TipoMuestraEntity
 *   ])],
 *   controllers: [
 *     EstudiosController, PruebasController, ValoresReferenciaController, TiposMuestraController
 *   ],
 *   providers: [
 *     EstudiosService, PruebasService, ValoresReferenciaService, TiposMuestraService
 *   ],
 *   exports: [EstudiosService, PruebasService, ValoresReferenciaService, TiposMuestraService]
 * })
 * export class LaboratorioCatalogoModule {}
 *
 *
 * PASO 6: Importar el Módulo en AppModule
 * =======================================
 *
 * @Module({
 *   imports: [
 *     // ... otros módulos
 *     LaboratorioCatalogoModule,
 *     // ...
 *   ]
 * })
 * export class AppModule {}
 */

// ============================================================================
// 🎯 CÓMO USAR EN FRONTEND
// ============================================================================

/**
 * 1. NAVEGAR A LA PÁGINA DE ADMINISTRACIÓN
 *
 * Agregar ruta en src/pages/laboratorio/routes.ts o router.ts:
 *
 * {
 *   path: 'admin-catalogos',
 *   component: () => import('src/pages/laboratorio/AdminCatalogos.vue'),
 *   meta: { requiresAuth: true, adminOnly: true }
 * }
 *
 * Luego acceder a: http://localhost:8080/#/laboratorio/admin-catalogos
 *
 *
 * 2. USAR EN SELECTOR DE ESTUDIOS
 *
 * En SelectorEstudios.vue, cambiar el array hardcodeado:
 *
 * // ANTES:
 * const estudiosDisponibles = ref([
 *   { id: 'hem_completa', codigo: 'HEM001', ... }
 * ])
 *
 * // DESPUÉS:
 * const estudios = ref([])
 * const cargarEstudios = async () => {
 *   const res = await EstudiosService.obtenerActivos()
 *   estudios.value = res.data
 * }
 *
 * onMounted(() => {
 *   cargarEstudios()
 * })
 *
 *
 * 3. VALIDAR RESULTADOS AL CARGAR
 *
 * En CargaResultados.vue (cuando ingresa un resultado):
 *
 * async guardarResultado(idPrueba, valor, especie, edad, peso, sexo) {
 *   const validacion = await ValoresReferenciaService.validarResultado(
 *     idPrueba, valor, especie, edad, peso, sexo
 *   )
 *
 *   if (validacion.estado === 'normal') {
 *     // Mostrar en verde
 *   } else if (validacion.estado === 'alerta_alta') {
 *     // Mostrar en naranja
 *   } else if (validacion.estado === 'critico_alto') {
 *     // Mostrar en rojo
 *   }
 * }
 */

// ============================================================================
// 📊 FLUJO DE DATOS
// ============================================================================

/**
 * 1. CARGA INICIAL
 *    Usuario → AdminCatalogos.vue
 *    ↓
 *    [Tabs: Estudios | Pruebas | Valores | Tipos | Dashboard]
 *
 * 2. CREAR ESTUDIO
 *    AbmEstudios.vue → [Botón "Nuevo"] → Modal → Form
 *    ↓
 *    EstudiosService.crearEstudio() → POST /api/laboratorio/estudios
 *    ↓
 *    Backend valida y guarda → INSERT INTO estudios
 *    ↓
 *    Recarga list → GET /api/laboratorio/estudios
 *
 * 3. AGREGAR PRUEBAS A ESTUDIO
 *    AbmPruebas.vue → [Filtrar por estudio] → [Agregar prueba]
 *    ↓
 *    PruebasService.crearPrueba() → POST /api/laboratorio/pruebas
 *    ↓
 *    Backend guarda → INSERT INTO pruebas
 *
 * 4. CARGAR VALORES DE REFERENCIA (MÁS IMPORTANTE)
 *    AbmValoresReferencia.vue → [Importar CSV]
 *    ↓
 *    ValoresReferenciaService.importarCSV() → POST /api/laboratorio/valores-referencia/import
 *    ↓
 *    Backend parsea CSV, valida y guarda en lote → BULK INSERT
 *    ↓
 *    Sistema puede ahora validar cualquier resultado
 *
 * 5. USAR EN ORDEN DE LABORATORIO
 *    FormularioOrdenSimple.vue → [Seleccionar estudios] → SelectorEstudios.vue
 *    ↓
 *    SelectorEstudios carga data de EstudiosService (ya no hardcodeado)
 *    ↓
 *    Usuario selecciona estudios → Orden se guarda con pruebas
 *
 * 6. CARGAR RESULTADOS
 *    CargaResultados.vue → [Ingresar resultado para prueba]
 *    ↓
 *    ValoresReferenciaService.validarResultado(idPrueba, valor, especie, edad, peso)
 *    ↓
 *    Backend busca valor de referencia aplicable
 *    ↓
 *    Compara y devuelve estado (normal/alerta/crítico)
 *    ↓
 *    UI resalta resultado con color correspondiente
 */

// ============================================================================
// ⚠️ NOTAS IMPORTANTES
// ============================================================================

/**
 * 1. Valores de Referencia son CRÍTICOS
 *    - Sin ellos, no se puede validar automáticamente
 *    - Se recomienda importar desde CSV (hay plantilla en Dashboard)
 *    - Varían por: ESPECIE > EDAD > SEXO > PESO
 *
 * 2. Las queries de buscar valor aplicable pueden ser complejas
 *    - Necesita lógica para encontrar el "mejor match"
 *    - Ej: Si existe valor para "Canino, Macho, 3 años" usarlo
 *         Si no, buscar "Canino, Indistinto, 3 años"
 *         Si no, buscar "Canino, Cualquier edad"
 *         Si no, error
 *
 * 3. El endpoint de validación debe ser rápido
 *    - Probablemente se llamará 100+ veces por día
 *    - Considerar caché de valores de referencia más usados
 *
 * 4. CSV Import/Export son funciones útiles
 *    - Permite backup y migración de datos
 *    - Facilita actualización masiva de valores
 *
 * 5. Dashboard de estadísticas ayuda a identificar gaps
 *    - Muestra si faltan valores de referencia para ciertas especies
 *    - Alerta si no hay pruebas para estudios
 */

// ============================================================================
// 📚 REFERENCIAS
// ============================================================================

/**
 * - Ver BACKEND_ESTRUCTURA.md para SQL completos
 * - Ver AbmValoresReferencia.vue para interfaz de usuario
 * - Ver ValoresReferenciaService para métodos frontend
 *
 * Backend URL examples:
 * ├── GET  /api/laboratorio/estudios?page=1&limit=20
 * ├── POST /api/laboratorio/estudios
 * ├── PUT  /api/laboratorio/estudios/1
 * ├── DELETE /api/laboratorio/estudios/1
 * ├── POST /api/laboratorio/estudios/import (CSV)
 * ├── GET  /api/laboratorio/estudios/export
 * │
 * ├── POST /api/laboratorio/valores-referencia/validar
 * ├── GET  /api/laboratorio/valores-referencia/prueba/5/especie/canino
 * └── POST /api/laboratorio/valores-referencia/import (CSV)
 */

export default {}
