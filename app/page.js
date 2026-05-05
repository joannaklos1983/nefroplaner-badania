export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            NefroPlaner Badania
          </h1>
          <p className="text-gray-600">
            Aplikacja do planowania badań pacjentów - wersja startowa
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Pokój</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Pacjent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Uwagi</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Pn</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Wt</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Śr</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Czw</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Pt</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Sb</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Nd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">101</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">J.K.</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Dializa
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">102</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">A.N.</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
