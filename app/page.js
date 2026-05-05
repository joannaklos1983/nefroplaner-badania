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
  const [currentEdit, setCurrentEdit] = useState(null)
  const [selectedExams, setSelectedExams] = useState([]) // [{ name, status }]
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

  const statuses = [
    'Zlecone',
    'W trakcie',
    'Wykonane',
    'Anulowane',
    'Do przygotowania',
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Zlecone':
        return 'bg-gray-200 text-gray-800'
      case 'W trakcie':
        return 'bg-blue-500 text-white'
      case 'Wykonane':
        return 'bg-green-500 text-white'
      case 'Anulowane':
        return 'bg-gray-300 text-gray-500 line-through'
      case 'Do przygotowania':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-200 text-gray-800'
    }
  }

  const getCurrentDay = () => {
    const dayIndex = new Date().getDay()
    const mapping = [6, 0, 1, 2, 3, 4, 5]
    return days[mapping[dayIndex]]
  }

  const currentDay = getCurrentDay()

  const getTodayExams = () => {
    const todayExams = []
    patients.forEach(patient => {
      const exams = patient.exams[currentDay] || []
      if (exams.length > 0) {
        todayExams.push({
          room: patient.room,
          name: patient.name,
          exams: exams
        })
      }
    })
    return todayExams
  }

  const todayExams = getTodayExams()

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
    
    setCurrentEdit({ patientId, day })
    setSelectedExams(existingExams.map(exam => ({
      name: exam.name,
      status: exam.status
    })))
    setOtherExam('')
    setModalOpen(true)
  }

  const toggleExam = (examName) => {
    const existing = selectedExams.find(e => e.name === examName)
    if (existing) {
      setSelectedExams(selectedExams.filter(e => e.name !== examName))
    } else {
      setSelectedExams([...selectedExams, { name: examName, status: 'Zlecone' }])
    }
  }

  const updateExamStatus = (examName, newStatus) => {
    setSelectedExams(selectedExams.map(exam => 
      exam.name === examName ? { ...exam, status: newStatus } : exam
    ))
  }

  const saveExam = () => {
    if (!currentEdit) return

    let allExams = [...selectedExams]
    
    // Dodaj własne badanie jeśli wpisane
    if (otherExam.trim()) {
      const customExams = otherExam.split(',').map(e => e.trim()).filter(e => e)
      allExams = [...allExams, ...customExams.map(name => ({ name, status: 'Zlecone' }))]
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

        {/* Badania na dziś */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Badania na dziś ({currentDay})
            </h2>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          {todayExams.length > 0 ? (
            <div className="space-y-3">
              {todayExams.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {item.room}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">
                      {item.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.exams.map((exam, examIdx) => (
                        <span key={examIdx} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status === 'Do przygotowania' && <span>⚠️</span>}
                          {exam.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Brak zaplanowanych badań na dziś</p>
              <p className="text-sm mt-2">Kliknij w komórkę dnia w tabeli poniżej, aby dodać badanie</p>
            </div>
          )}
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
                    <th key={day} className={`px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider ${day === currentDay ? 'bg-yellow-400 text-gray-900' : ''}`}>
                      {day}
                    </th>
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
                      const isToday = day === currentDay
                      return (
                        <td 
                          key={day} 
                          className={`px-6 py-4 text-center cursor-pointer hover:bg-blue-100 transition-colors ${isToday ? 'bg-yellow-50' : ''}`}
                          onClick={() => openModal(patient.id, day)}
                        >
                          <div className="text-sm text-gray-700 min-h-[40px] flex flex-col items-center justify-center gap-1">
                            {exams.length > 0 ? (
                              exams.map((exam, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(exam.status)}`}>
                                  {exam.status === 'Do przygotowania' && <span>⚠️</span>}
                                  {exam.name}
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
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Badania - {currentEdit?.day}
            </h3>
            
            {/* Lista badań z checkboxami i statusami */}
            <div className="space-y-3 mb-6">
              {examsList.map(examName => {
                const selected = selectedExams.find(e => e.name === examName)
                return (
                  <div key={examName} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => toggleExam(examName)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="flex-1 text-gray-700 font-medium">{examName}</span>
                      
                      {selected && (
                        <select
                          value={selected.status}
                          onChange={(e) => updateExamStatus(examName, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )
              })}
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
