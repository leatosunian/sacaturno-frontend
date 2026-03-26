import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que estás buscando no existe o fue eliminada.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Suspense fallback={null}>
        {/* <TranslucentNavBlack /> */}
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold text-gray-900 ">Error 404</h1>
            <h2 className="mb-4 text-2xl font-semibold text-gray-700">Página no encontrada.</h2>
            <p className="mb-8 text-gray-600">
              La página que estás buscando no existe, ha sido eliminada o no está disponible.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </Suspense>
    </>
  )
}