import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { CatalogPage } from '@/pages/catalog-page'
import { CategoryPage } from '@/pages/category-page'
import { HomePage } from '@/pages/home-page'
import { MethodPage } from '@/pages/method-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { TheoryPage } from '@/pages/theory-page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="catalogo/:categorySlug" element={<CategoryPage />} />
          <Route path="catalogo/:categorySlug/:methodSlug" element={<MethodPage />} />
          <Route path="teoria" element={<TheoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
