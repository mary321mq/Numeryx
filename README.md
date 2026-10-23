# Numeryx · Numerical Methods Lab

Aplicación web local para explorar métodos numéricos y ejecutar cálculos verificables. Conserva un catálogo de 6 categorías y 24 métodos; en la Fase 4 están disponibles cinco métodos: tres de regresión y dos de interpolación.

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

- **Regresión lineal simple**: ajusta `ŷ = b₀ + b₁x` y presenta sumas, medias, pendiente, intercepto, predicciones, residuos, SSE, SST, R² y RMSE.
- **Regresión polinómica**: permite grados de 1 a `min(n − 1, 8)` y calcula los coeficientes mediante QR de Householder, sin invertir matrices.
- **Regresión lineal múltiple**: admite observaciones y predictores editables y detecta rango insuficiente o multicolinealidad.

### Interpolación — Fase 4

- **Interpolación de Lagrange**: construye `Pₙ(x) = Σ yᵢLᵢ(x)`, muestra cada base, la sustitución con los nodos reales, la contribución `yᵢLᵢ` y comprueba todos los nodos.
- **Newton por diferencias divididas**: genera la tabla triangular completa, explica las operaciones que producen sus columnas y muestra el polinomio incremental junto con su comprobación en cada nodo.

En ambos métodos se pueden añadir y eliminar puntos `(x, y)`, definir el valor objetivo y conservar los datos al corregir errores. Las entradas se validan antes del cálculo: no se aceptan celdas vacías, números no finitos ni valores `x` duplicados o demasiado cercanos. Un único nodo se admite como el polinomio constante `P₀`.

Los dos métodos calculan sin redondeos intermedios. Si el valor objetivo queda fuera del intervalo de los nodos, Numeryx lo marca como **extrapolación**.

## Visualización y exportación

Cada resultado incluye una gráfica Plotly con nodos, polinomio interpolante y valor objetivo; permite explorarla y descargarla como PNG. El botón **Exportar Excel** genera un `.xlsx` real con ExcelJS que incorpora:

- método, fecha, puntos originales, valor objetivo, grado, forma del polinomio y resultado;
- bases de Lagrange o tabla de diferencias divididas de Newton;
- verificación `Pₙ(xᵢ) − yᵢ` para cada nodo;
- procedimiento calculado a partir de las entradas y la imagen PNG de la gráfica cuando Plotly está listo.

ExcelJS inserta la gráfica como imagen; no crea una gráfica nativa editable de Excel.

## Arquitectura

```text
src/
  components/
    forms/           tabla XY reutilizable para regresión e interpolación
    interpolation/   espacio de trabajo, resultados y pasos visuales
    regression/      formularios, resultados y cálculo de regresión
    charts/          Plotly, captura y descarga PNG
  config/            catálogo de 24 métodos y sus estados
  features/
    interpolation/   algoritmos puros de Lagrange y Newton + pruebas
    regression/      QR de Householder y pruebas matemáticas
    export/          generador de libros ExcelJS
    methods/         contratos de espacios de trabajo
```

Los algoritmos de interpolación viven fuera de React y no usan `eval`. `interpolation.ts` crea las bases de Lagrange, la tabla de diferencias divididas y evalúa Newton en forma anidada para conservar estabilidad operativa razonable.

## Pruebas

Las pruebas cubren:

- regresión lineal, polinómica y múltiple, incluidas condiciones de error;
- una recta y un cuadrático interpolados por Lagrange y Newton;
- reproducción de los nodos, acuerdo entre ambos métodos, `x` repetida y valores no finitos;
- el caso opcional de un solo nodo `P₀`;
- creación y reapertura en memoria de un libro `.xlsx`.

## Límites actuales

No se implementan todavía ecuaciones no lineales, sistemas lineales, integración ni EDO. Un polinomio interpolante de grado elevado puede oscilar entre nodos (fenómeno de Runge), especialmente al extrapolar; la gráfica y la etiqueta de extrapolación no sustituyen el análisis del problema. No hay backend, historial persistente ni autenticación.
