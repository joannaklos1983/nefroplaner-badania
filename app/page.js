'use client'

import { useState } from 'react'

export default function Home() {
  const [patients, setPatients] = useState([
    { id: 1, room: '101', name: 'J.K.', notes: 'Dializa' },
    { id: 2, room: '102', name: 'A.N.', notes: '' },
  ])

  const [formData, setFormData] = useState({
    room: '',
    name: '',
    notes: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.room || !formData.name) {
      alert('Wypełnij numer pokoju i inicjały pacjenta')
      return
    }

    const newPatient = {
      id: Date.now(),
      room: formData.room,
      name: formData.name,
      notes: formData.notes,
    }

    setPatients([...patients, newPatient])
    setFormData({ room: '', name: '', notes: '' })
  }

  const handleDelete = (id) => {
    if (confirm('Czy na pewno usunąć tego pacjenta?')) {
      setPatients(patients.filter(p => p.id !== id))
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            NefroPlaner Badania
          </h1>
          <p className="text-gray-600">
            Aplikacja do planowania badań pacjentów
          </p>
        </div>

        {/* Formularz dodawania pacjenta */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dodaj pacjenta
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pokój
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="np. 101"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pacjent (inicjały)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="np. J.K."
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uwagi
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="opcjonalnie"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dodaj pacjenta
            </button>
          </form>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Usuń</th>
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
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        ✕
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{patient.room}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      {patient.notes && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {patient.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
