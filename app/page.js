'use client'

import { useState } from 'react'

export default function Home() {
  const [patients, setPatients] = useState([
    { id: 1, room: '101', name: 'J.K.', notes: 'Dializa', exams: {} },
    { id: 2, room: '102', name: 'A.N.', notes: '', exams: {} },
  ])

  const [formData, setFormData] = useState({
    room: '',
    name: '',
    notes: '',
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [currentEdit, setCurrentEdit] = useState(null) // { patientId, day }
  const [selectedExams, setSelectedExams] = useState([])
  const [otherExam, setOtherExam] = useState('')

  const days = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd']
  
  const examsList = [
    'USG',
    'TK',
    'Angio-TK',
    'MR',
    'RTG',
    'Echo',
    'EKG',
    'konsultacja',
    'laboratorium',
    'biopsja',
  ]

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
      exams: {},
    }

    setPatients([...patients, newPatient])
    setFormData({ room: '', name: '', notes: '' })
  }

  const handleDelete = (id) => {
    if (confirm('Czy na pewno usunąć tego pacjenta?')) {
      setPatients(patients.filter(p => p.id !== id))
    }
  }

  const openModal = (patientId, day) => {
    const patient = patients.find(p => p.id === patientId)
    const existingExams = patient.exams[day] || []
    
    // Rozdziel na badania z listy i "inne"
    const standardExams = existingExams.filter(exam => examsList.includes(exam))
    const customExams = existingExams.filter(exam => !examsList.includes(exam))
    
    setCurrentEdit({ patientId, day })
    setSelectedExams(standardExams)
    setOtherExam(customExams.join(', '))
    setModalOpen(true)
  }

  const toggleExam = (exam) => {
    if (selectedExams.includes(exam)) {
      setSelectedExams(selectedExams.filter(e => e !== exam))
    } else {
      setSelectedExams([...selectedExams, exam])
    }
  }

  const saveExam = () => {
    if (!currentEdit) return

    let allExams = [...selectedExams]
    
    // Dodaj własne badanie jeśli wpisane
    if (otherExam.trim()) {
      const customExams = otherExam.split(',').map(e => e.trim()).filter(e => e)
      allExams = [...allExams, ...customExams]
    }

    setPatients(patients.map(patient => {
      if (patient.id === currentEdit.patientId) {
        return {
          ...patient,
          exams: {
            ...patient.exams,
            [currentEdit.day]: allExams
          }
        }
      }
      return patient
    }))

    closeModal()
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrentEdit(null)
    setSelectedExams([])
    setOtherExam('')
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
                  {days.map(day => (
                    <th key={day} className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">{day}</th>
                  ))}
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
                    {days.map(day => {
                      const exams = patient.exams[day] || []
                      return (
                        <td 
                          key={day} 
                          className="px-6 py-4 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => openModal(patient.id, day)}
                        >
                          <div className="text-sm text-gray-700 min-h-[40px] flex flex-col items-center justify-center gap-1">
                            {exams.length > 0 ? (
                              exams.map((exam, idx) => (
                                <span key={idx} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                  {exam}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Badania - {currentEdit?.day}
            </h3>
            
            {/* Lista badań */}
            <div className="space-y-2 mb-6">
              {examsList.map(exam => (
                <label key={exam} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedExams.includes(exam)}
                    onChange={() => toggleExam(exam)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{exam}</span>
                </label>
              ))}
            </div>

            {/* Pole "inne" */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inne badanie (własne):
              </label>
              <input
                type="text"
                value={otherExam}
                onChange={(e) => setOtherExam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="np. Badanie specjalistyczne"
              />
              <p className="mt-1 text-xs text-gray-500">
                Możesz wpisać kilka badań oddzielonych przecinkiem
              </p>
            </div>

            {/* Przyciski */}
            <div className="flex gap-3">
              <button
                onClick={saveExam}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Zapisz
              </button>
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
