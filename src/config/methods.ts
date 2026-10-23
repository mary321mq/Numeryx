import { getCategoryBySlug } from '@/config/categories'
import type { MethodDefinition } from '@/types/catalog'

export const METHODS: readonly MethodDefinition[] = [
  { id: 'graphical-method', categoryId: 'nonlinear-roots', slug: 'metodo-grafico', name: 'Método gráfico', description: 'Explora visualmente intervalos donde puede existir una raíz.', status: 'planned', tags: ['funciones', 'visualización'] },
  { id: 'bisection', categoryId: 'nonlinear-roots', slug: 'biseccion', name: 'Bisección', description: 'Acota una raíz reduciendo un intervalo con cambio de signo.', status: 'planned', tags: ['iterativo', 'acotado'] },
  { id: 'false-position', categoryId: 'nonlinear-roots', slug: 'regla-falsa', name: 'Regla falsa', description: 'Combina acotación y una interpolación lineal para aproximar la raíz.', status: 'planned', tags: ['iterativo', 'acotado'] },
  { id: 'fixed-point', categoryId: 'nonlinear-roots', slug: 'punto-fijo', name: 'Punto fijo', description: 'Genera una sucesión a partir de una formulación equivalente.', status: 'planned', tags: ['iterativo', 'convergencia'] },
  { id: 'newton-raphson', categoryId: 'nonlinear-roots', slug: 'newton-raphson', name: 'Newton-Raphson', description: 'Usa la derivada para mejorar aproximaciones sucesivas a una raíz.', status: 'planned', tags: ['iterativo', 'derivadas'] },
  { id: 'secant', categoryId: 'nonlinear-roots', slug: 'secante', name: 'Secante', description: 'Aproxima la pendiente con dos puntos consecutivos.', status: 'planned', tags: ['iterativo', 'sin derivada'] },
  { id: 'gaussian-elimination', categoryId: 'linear-systems', slug: 'eliminacion-gaussiana', name: 'Eliminación gaussiana', description: 'Transforma el sistema para resolverlo mediante sustitución.', status: 'planned', tags: ['directo', 'matrices'] },
  { id: 'gauss-jordan', categoryId: 'linear-systems', slug: 'gauss-jordan', name: 'Gauss-Jordan', description: 'Lleva la matriz aumentada a una forma escalonada reducida.', status: 'planned', tags: ['directo', 'matrices'] },
  { id: 'cramer-rule', categoryId: 'linear-systems', slug: 'regla-cramer', name: 'Regla de Cramer', description: 'Resuelve sistemas cuadrados mediante determinantes.', status: 'planned', tags: ['directo', 'determinantes'] },
  { id: 'forward-back-substitution', categoryId: 'linear-systems', slug: 'sustitucion-progresiva-regresiva', name: 'Sustitución progresiva y regresiva', description: 'Resuelve sistemas triangulares en el orden adecuado.', status: 'planned', tags: ['directo', 'triangular'] },
  { id: 'lu-factorization', categoryId: 'linear-systems', slug: 'factorizacion-lu', name: 'Factorización LU', description: 'Descompone una matriz para resolver sistemas eficientemente.', status: 'planned', tags: ['directo', 'matrices'] },
  { id: 'jacobi', categoryId: 'linear-systems', slug: 'jacobi', name: 'Jacobi', description: 'Actualiza las incógnitas con valores de la iteración anterior.', status: 'planned', tags: ['iterativo', 'matrices'] },
  { id: 'gauss-seidel', categoryId: 'linear-systems', slug: 'gauss-seidel', name: 'Gauss-Seidel', description: 'Aprovecha valores recién actualizados dentro de cada iteración.', status: 'planned', tags: ['iterativo', 'matrices'] },
  { id: 'simple-linear-regression', categoryId: 'regression', slug: 'regresion-lineal-simple', name: 'Regresión lineal simple', description: 'Ajusta una recta a pares de observaciones y mide su ajuste.', status: 'implemented', priority: 'next', tags: ['datos', 'ajuste'] },
  { id: 'polynomial-regression', categoryId: 'regression', slug: 'regresion-polinomica', name: 'Regresión polinómica', description: 'Ajusta un polinomio de grado controlado a una serie de datos.', status: 'implemented', priority: 'next', tags: ['datos', 'polinomios'] },
  { id: 'multiple-linear-regression', categoryId: 'regression', slug: 'regresion-lineal-multiple', name: 'Regresión lineal múltiple', description: 'Relaciona una variable de respuesta con varios predictores.', status: 'implemented', priority: 'next', tags: ['datos', 'multivariable'] },
  { id: 'trapezoidal-rule', categoryId: 'integration', slug: 'regla-trapecio', name: 'Regla del trapecio', description: 'Aproxima el área mediante segmentos trapezoidales.', status: 'planned', tags: ['cuadratura', 'integrales'] },
  { id: 'simpson-one-third', categoryId: 'integration', slug: 'simpson-1-3', name: 'Simpson 1/3', description: 'Usa parábolas sobre subintervalos pares para aproximar una integral.', status: 'planned', tags: ['cuadratura', 'integrales'] },
  { id: 'simpson-three-eighths', categoryId: 'integration', slug: 'simpson-3-8', name: 'Simpson 3/8', description: 'Aplica una aproximación cúbica en grupos de tres subintervalos.', status: 'planned', tags: ['cuadratura', 'integrales'] },
  { id: 'euler', categoryId: 'differential-equations', slug: 'euler', name: 'Euler', description: 'Avanza la solución usando la pendiente al inicio de cada paso.', status: 'planned', tags: ['edo', 'iterativo'] },
  { id: 'improved-euler', categoryId: 'differential-equations', slug: 'euler-mejorado', name: 'Euler mejorado', description: 'Corrige el paso de Euler al considerar una pendiente promedio.', status: 'planned', tags: ['edo', 'iterativo'] },
  { id: 'runge-kutta-4', categoryId: 'differential-equations', slug: 'runge-kutta-orden-4', name: 'Runge-Kutta de orden 4', description: 'Combina cuatro estimaciones de pendiente por cada paso.', status: 'planned', tags: ['edo', 'iterativo'] },
  { id: 'lagrange-interpolation', categoryId: 'interpolation', slug: 'interpolacion-lagrange', name: 'Interpolación de Lagrange', description: 'Construye y verifica un polinomio usando bases asociadas a cada nodo.', status: 'implemented', priority: 'next', tags: ['datos', 'polinomios'] },
  { id: 'newton-divided-differences', categoryId: 'interpolation', slug: 'newton-diferencias-divididas', name: 'Newton por diferencias divididas', description: 'Construye y verifica el polinomio desde una tabla de diferencias divididas.', status: 'implemented', priority: 'next', tags: ['datos', 'polinomios'] },
] as const

export function getMethodBySlug(categorySlug: string, methodSlug: string) {
  const category = getCategoryBySlug(categorySlug)
  return METHODS.find((method) => method.slug === methodSlug && method.categoryId === category?.id)
}

export function getMethodsByCategory(categoryId: string) {
  return METHODS.filter((method) => method.categoryId === categoryId)
}
