# NúMERA · Laboratorio de Métodos Numéricos

Primera fase de una aplicación web local para explorar, estudiar y posteriormente resolver ejercicios de Métodos Numéricos. Esta entrega establece la arquitectura, el catálogo y la experiencia visual; no simula cálculos que todavía no existen.

## Ejecutar localmente

Requisito: Node.js 24+ y npm 11+.

```bash
npm install
npm run dev
```

Abre la dirección que muestre Vite (normalmente `http://localhost:5173`).

Comandos de control de calidad:

```bash
npm run test
npm run build
```

## Qué incluye la fase 1

- Inicio, catálogo, páginas de categoría, fichas de método y plantilla de teoría.
- Las 6 categorías y los 24 métodos solicitados, declarados desde una configuración central.
- Búsqueda por nombre/tema y filtro por categoría.
- Estados claros: `Pendiente`, `Base preparada` y `Disponible` (reservado para algoritmos implementados). Ningún método pendiente puede ejecutarse.
- Prioridad preparada para regresión e interpolación: contratos de entrada, gráfica y exportación ya registrados para sus cinco métodos.
- Componentes de UI configurados para shadcn/ui, Tailwind CSS, Lucide y accesibilidad de teclado.
- Componentes reutilizables de KaTeX, Plotly, tablas y espacio de trabajo para las próximas fases.
- Utilidad segura basada en Math.js para evaluar expresiones numéricas futuras, sin `eval()` nativo.

## Arquitectura

```text
src/
  components/       UI, navegación, catálogo, fórmulas, tablas, gráficas y formularios
  config/           categorías y catálogo de métodos (fuente única de verdad)
  features/
    export/         generador reutilizable de libros Excel
    methods/        registro de contratos de integración por método
  pages/            rutas y pantallas de la aplicación
  types/            contratos de catálogo, cálculo y exportación
  test/             configuración común de Vitest
```

Para añadir un método se registra su metadato en `src/config/methods.ts` y, cuando corresponde, su contrato de entrada/cálculo en `src/features/methods/registry.ts`. Los algoritmos no se mezclan con componentes React.

## Exportación a Excel

`src/features/export/excel-export.ts` contiene una base reutilizable con título, secciones, formatos, filas alternadas, resultados destacados, datos numéricos y anchos de columna. Puede recibir una imagen PNG de una gráfica para insertarla en el libro.

ExcelJS se utiliza con licencia MIT. Su modelo no ofrece creación de gráficas nativas editables de Excel; por ello esta fase deja explícita la opción fiable de exportar datos estructurados y la gráfica como PNG. Si una fase futura exige gráficos editables, debe evaluarse una biblioteca especializada sin sustituir esta exportación de datos. Plotly.js (MIT) queda preparado para la gráfica web y Math.js (Apache-2.0) para los cálculos futuros.

## Decisiones técnicas

- React 19 + TypeScript estricto + Vite 8.
- Tailwind CSS 4 mediante el plugin de Vite y configuración `components.json` compatible con shadcn/ui.
- React Router para rutas navegables sin backend.
- Carga diferida de ExcelJS cuando se produzca una exportación, evitando incorporarlo al flujo principal de estudio.
- Vitest + Testing Library para pruebas automatizadas básicas.

### Nota de seguridad

Tras actualizar Math.js a 15.2.0 y KaTeX a 0.19.0, `npm audit --omit=dev` no reporta vulnerabilidades altas ni críticas. Persisten dos avisos moderados procedentes de `uuid` dentro de ExcelJS 4.4.0, la versión actual de la biblioteca. La única sugerencia automática de npm degrada ExcelJS a 3.4.0, por lo que no se aplica. Conviene revisar futuras versiones de ExcelJS antes de activar exportaciones con datos sensibles.

## Límites conscientes de la fase

No se implementaron algoritmos, resultados calculados, formularios reales de resolución ni teoría académica extensa. Tampoco hay usuarios, backend, base de datos, historial ni exportaciones conectadas a un cálculo: esos elementos requieren las fases posteriores y validación matemática específica.
