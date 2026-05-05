<div className="mb-8">
  <h1 className="text-4xl font-bold text-gray-900 mb-2">
    NefroPlaner Badania
  </h1>
  <p className="text-gray-600 mb-4">
    Aplikacja do planowania badań pacjentów
  </p>
  
  {/* Legenda statusów */}
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <p className="text-sm font-medium text-gray-700 mb-2">Legenda statusów:</p>
    <div className="flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
        Zlecone
      </span>
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
        W trakcie
      </span>
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
        Wykonane
      </span>
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-300 text-gray-500 line-through">
        Anulowane
      </span>
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
        <span>⚠️</span>
        Do przygotowania
      </span>
    </div>
  </div>
</div>
