export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          NefroPlaner Badania
        </h1>
        
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pokój</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pacjent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uwagi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Śr</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Czw</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sb</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nd</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">101</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">J.K.</td>
                <td className="px-4 py-4 text-sm text-gray-500">Dializa</td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">102</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">A.N.</td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
                <td className="px-4 py-4 text-sm text-gray-500"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
