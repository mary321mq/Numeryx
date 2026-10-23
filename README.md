# Numeryx · Numerical Methods Lab

Aplicación web local para explorar métodos numéricos y ejecutar cálculos verificables. Conserva un catálogo de 6 categorías y 24 métodos; actualmente incluye tres métodos de regresión y dos de interpolación.

## Ejecutar localmente

Requisito: Node.js 24+ y npm 11+.

```bash
npm install
npm run dev
```

Validación:

```bash
npm run lint
npm run test
npm run build
```

## Métodos disponibles

### Regresión

- **Regresión lineal simple**: ajusta `ŷ = b₀ + b₁x` y presenta predicciones, residuos, SSE, SST, R² y RMSE.
- **Regresión polinómica**: permite grados de 1 a `min(n − 1, 8)` y calcula los coeficientes mediante QR de Householder, sin invertir matrices.
- **Regresión lineal múltiple**: admite observaciones y predictores editables y detecta rango insuficiente o multicolinealidad.

### Interpolación

- **Interpolación de Lagrange**: construye `Pₙ(x) = Σ yᵢLᵢ(x)`, muestra cada base, su sustitución y la verificación de los nodos.
- **Newton por diferencias divididas**: genera la tabla triangular de diferencias, sus operaciones y el polinomio incremental.

Los métodos de interpolación validan valores vacíos, no finitos y nodos `x` repetidos; admiten un único nodo como `P₀`. No se aplican redondeos durante los cálculos, y se marca una evaluación fuera del intervalo como **extrapolación**.

## Fase 5: exportación Excel profesional

Se mantiene **ExcelJS 4.4.0** como única biblioteca de exportación. Ya es compatible con Vite y TypeScript en este proyecto, permite hojas múltiples, estilos, filtros, congelación de paneles e imágenes PNG, y evita incorporar `xlsx-js-style` y un segundo flujo de mantenimiento sin una capacidad necesaria.

Para cada ejecución válida, el archivo `.xlsx` se organiza en hojas no vacías según los datos disponibles:

1. **Resumen**: identidad de Numeryx, método, fecha, parámetros, ecuación o polinomio, métricas y notas.
2. **Datos originales**: entradas numéricas de la ejecución actual.
3. **Procedimiento**: pasos y sustituciones generados por el método.
4. **Resultados**: estimaciones y residuos de regresión, o bases/verificaciones/diferencias divididas de interpolación.

El sistema común aplica títulos azul marino, encabezados turquesa/azul medio, resultados en verde moderado, bordes finos, filas alternadas, formatos numéricos, ajuste de texto, anchos de columna, filtros y paneles congelados cuando corresponde. Los valores se exportan como números; solo la visualización de Excel limita sus decimales.

La gráfica Plotly de la ejecución actual se captura e inserta como imagen PNG únicamente cuando está disponible. La descarga PNG independiente sigue activa. ExcelJS no genera gráficas nativas editables, por lo que el libro lo indica explícitamente.

## Arquitectura

```text
src/
  components/
    forms/           tabla XY reutilizable para regresión e interpolación
    interpolation/   espacio de trabajo, resultados y pasos visuales
    regression/      formularios, resultados y cálculo de regresión
    charts/          Plotly, captura y descarga PNG
  features/
    export/          generador ExcelJS común y pruebas de libros reales
    interpolation/   algoritmos puros de Lagrange y Newton + pruebas
    regression/      QR de Householder y pruebas matemáticas
    methods/         contratos de espacios de trabajo
  config/            catálogo de 24 métodos y sus estados
```

Los algoritmos permanecen fuera de React. `interpolation.ts` no usa `eval`; `least-squares.ts` resuelve regresión sin invertir matrices.

## Pruebas

Las pruebas cubren los algoritmos de regresión e interpolación y generan/reabren en memoria cinco archivos Excel reales: regresión lineal simple, polinómica y múltiple; Lagrange; y Newton. Verifican nombres de hojas, títulos, encabezados, datos originales, resultados numéricos, formatos visuales, una imagen PNG insertada y celdas no aplicables vacías en la tabla de Newton.

## Límites actuales

No se implementan todavía ecuaciones no lineales, sistemas lineales, integración ni EDO. Polinomios interpolantes de grado elevado pueden oscilar entre nodos, especialmente al extrapolar. La imagen insertada desde Plotly no es una gráfica editable en Excel. No hay backend, historial persistente ni autenticación.
