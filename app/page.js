'use client';

import { useState } from 'react';

export default function Home() {
  const [patients, setPatients] = useState([
    { id: 1, room: '101', initials: 'JK', notes: 'Dializa Pn/Śr/Pt', exams: {} },
    { id: 2, room: '102', initials: 'AM', notes: '', exams: {} },
  ]);

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({ room: '', initials: '', notes: '' });
  
  const [examModal, setExamModal] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [examList, setExamList] = useState([]);
  const [currentExamForm, setCurrentExamForm] = useState({
    type: '',
    customType: '',
    status: 'Zlecone',
    priority: 'standard',
    timeOfDay: '',
    checklist: [],
    otherPreparation: ''
  });

  const [currentView, setCurrentView] = useState('week');
  const [filters, setFilters] = useState({
    incomplete: false,
    preparation: false,
    urgent: false,
    room: ''
  });

  const days = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd'];
  const examTypes = [
    'USG', 'TK', 'Angio-TK', 'MR', 'RTG', 'Echo', 'EKG',
    'konsultacja', 'laboratorium', 'biopsja', 'inne'
  ];
  const checklistOptions = [
    'na czczo', 'zgoda', 'wenflon', 'kreatynina', 
    'transport', 'odstawienie leków', 'inne'
  ];

  const resetExamForm = () => {
    setCurrentExamForm({
      type: '',
      customType: '',
      status: 'Zlecone',
      priority: 'standard',
      timeOfDay: '',
      checklist: [],
      otherPreparation: ''
    });
  };

  const handleAddPatient = () => {
    if (newPatient.room && newPatient.initials) {
      setPatients([
        ...patients,
        {
          id: Date.now(),
          room: newPatient.room,
          initials: newPatient.initials,
          notes: newPatient.notes,
          exams: {}
        }
      ]);
      setNewPatient({ room: '', initials: '', notes: '' });
      setShowAddPatient(false);
    }
  };

  const handleEditPatient = () => {
    if (editingPatient && newPatient.room && newPatient.initials) {
      setPatients(patients.map(p => 
        p.id === editingPatient.id 
          ? { ...p, room: newPatient.room, initials: newPatient.initials, notes: newPatient.notes }
          : p
      ));
      setNewPatient({ room: '', initials: '', notes: '' });
      setEditingPatient(null);
    }
  };

  const handleDeletePatient = (id) => {
    if (confirm('Czy na pewno usunąć tego pacjenta?')) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const openEditPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient({
      room: patient.room,
      initials: patient.initials,
      notes: patient.notes
    });
  };

  const closePatientModal = () => {
    setShowAddPatient(false);
    setEditingPatient(null);
    setNewPatient({ room: '', initials: '', notes: '' });
  };

  const openExamModal = (patientId, day) => {
    setExamModal({ patientId, day });
    setEditingExam(null);
    setExamList([]);
    resetExamForm();
  };

  const openEditExam = (patientId, day, exam) => {
    setExamModal({ patientId, day });
    setEditingExam(exam);
    setExamList([]);
    const isStandardExam = examTypes.includes(exam.type);
    setCurrentExamForm({
      type: isStandardExam ? exam.type : 'inne',
      customType: isStandardExam ? '' : exam.type,
      status: exam.status,
      priority: exam.priority,
      timeOfDay: exam.timeOfDay,
      checklist: exam.checklist || [],
      otherPreparation: exam.otherPreparation || ''
    });
  };

  const addToExamList = () => {
    if (currentExamForm.type === 'inne' && !currentExamForm.customType.trim()) {
      alert('Proszę wpisać nazwę badania');
      return;
    }
    if (!currentExamForm.type && !currentExamForm.customType) return;

    const examType = currentExamForm.type === 'inne' ? currentExamForm.customType : currentExamForm.type;
    setExamList([
      ...examList,
      {
        id: Date.now(),
        type: examType,
        status: currentExamForm.status,
        priority: currentExamForm.priority,
        timeOfDay: currentExamForm.timeOfDay,
        checklist: currentExamForm.checklist,
        otherPreparation: currentExamForm.otherPreparation
      }
    ]);
    resetExamForm();
  };

  const removeFromExamList = (examId) => {
    setExamList(examList.filter(e => e.id !== examId));
  };

  const saveAllExams = () => {
    if (examList.length === 0) return;
    setPatients(patients.map(p => {
      if (p.id === examModal.patientId) {
        const dayExams = p.exams[examModal.day] || [];
        return {
          ...p,
          exams: {
            ...p.exams,
            [examModal.day]: [...dayExams, ...examList]
          }
        };
      }
      return p;
    }));
    setExamModal(null);
    setExamList([]);
  };

  const saveEditedExam = () => {
    if (currentExamForm.type === 'inne' && !currentExamForm.customType.trim()) {
      alert('Proszę wpisać nazwę badania');
      return;
    }
    if (!currentExamForm.type && !currentExamForm.customType) return;

    const examType = currentExamForm.type === 'inne' ? currentExamForm.customType : currentExamForm.type;
    setPatients(patients.map(p => {
      if (p.id === examModal.patientId) {
        return {
          ...p,
          exams: {
            ...p.exams,
            [examModal.day]: (p.exams[examModal.day] || []).map(e =>
              e.id === editingExam.id
                ? {
                    ...e,
                    type: examType,
                    status: currentExamForm.status,
                    priority: currentExamForm.priority,
                    timeOfDay: currentExamForm.timeOfDay,
                    checklist: currentExamForm.checklist,
                    otherPreparation: currentExamForm.otherPreparation
                  }
                : e
            )
          }
        };
      }
      return p;
    }));
    setExamModal(null);
    setEditingExam(null);
  };

  const handleDeleteExam = (patientId, day, examId) => {
    if (confirm('Usunąć to badanie?')) {
      setPatients(patients.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            exams: {
              ...p.exams,
              [day]: p.exams[day].filter(e => e.id !== examId)
            }
          };
        }
        return p;
      }));
    }
  };

  const toggleChecklist = (item) => {
    const newChecklist = currentExamForm.checklist.includes(item)
      ? currentExamForm.checklist.filter(i => i !== item)
      : [...currentExamForm.checklist, item];

    setCurrentExamForm({
      ...currentExamForm,
      checklist: newChecklist,
      otherPreparation: item === 'inne' && !newChecklist.includes('inne') ? '' : currentExamForm.otherPreparation
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Zlecone': return 'bg-gray-200 text-gray-800';
      case 'W trakcie': return 'bg-blue-200 text-blue-800';
      case 'Wykonane': return 'bg-green-200 text-green-800';
      case 'Przygotowanie': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'pilne') return '🔴';
    if (priority === 'do dnia') return '⏰';
    return '';
  };

  const formatChecklist = (checklist, otherPreparation) => {
    if (!checklist || checklist.length === 0) return '';
    return checklist.map(item => {
      if (item === 'inne' && otherPreparation) return `inne: ${otherPreparation}`;
      return item;
    }).join(', ');
  };

  const getTodayExams = () => {
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    const todayName = days[dayIndex];
    return patients.flatMap(patient => {
      const dayExams = patient.exams[todayName] || [];
      return dayExams.map(exam => ({
        ...exam,
        patient: patient.initials,
        room: patient.room,
        day: todayName,
        patientId: patient.id
      }));
    });
  };

  const filterPatients = () => {
    return patients.filter(patient => {
      if (filters.room && !patient.room.includes(filters.room)) return false;
      if (filters.incomplete || filters.preparation || filters.urgent) {
        const allExams = Object.values(patient.exams).flat();
        if (allExams.length === 0) return false;
        if (filters.incomplete) {
          const hasIncomplete = allExams.some(exam => exam.status !== 'Wykonane');
          if (!hasIncomplete) return false;
        }
        if (filters.preparation) {
          const hasPreparation = allExams.some(exam => exam.status === 'Przygotowanie');
          if (!hasPreparation) return false;
        }
        if (filters.urgent) {
          const hasUrgent = allExams.some(exam => exam.priority === 'pilne');
          if (!hasUrgent) return false;
        }
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">NefroPlaner Badania</h1>

          <div className="flex gap-4 mb-6">
            <button onClick={() => setCurrentView('week')} className={`px-4 py-2 rounded ${currentView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Widok tygodniowy</button>
            <button onClick={() => setCurrentView('today')} className={`px-4 py-2 rounded ${currentView === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Dzisiaj</button>
          </div>

          {currentView === 'week' && (
            <div className="mb-6 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-3">Filtry:</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={filters.incomplete} onChange={(e) => setFilters({...filters, incomplete: e.target.checked})} />Niewykonane</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={filters.preparation} onChange={(e) => setFilters({...filters, preparation: e.target.checked})} />Przygotowanie</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={filters.urgent} onChange={(e) => setFilters({...filters, urgent: e.target.checked})} />Pilne</label>
                <input type="text" placeholder="Numer pokoju" value={filters.room} onChange={(e) => setFilters({...filters, room: e.target.value})} className="px-3 py-1 border rounded" />
                <button onClick={() => setFilters({incomplete: false, preparation: false, urgent: false, room: ''})} className="px-3 py-1 bg-gray-300 rounded text-sm">Wyczyść filtry</button>
              </div>
            </div>
          )}

          {currentView === 'week' && (
            <>
              <button onClick={() => setShowAddPatient(true)} className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">+ Dodaj pacjenta</button>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-sm">Akcje</th>
                      <th className="border p-2 text-sm">Pokój</th>
                      <th className="border p-2 text-sm">Pacjent</th>
                      <th className="border p-2 text-sm">Uwagi</th>
                      {days.map(day => <th key={day} className="border p-2 text-sm">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filterPatients().map(patient => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="border p-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => openEditPatient(patient)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600" title="Edytuj pacjenta">✏️</button>
                            <button onClick={() => handleDeletePatient(patient.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600" title="Usuń pacjenta">🗑️</button>
                          </div>
                        </td>
                        <td className="border p-2 text-center font-semibold">{patient.room}</td>
                        <td className="border p-2 text-center font-semibold">{patient.initials}</td>
                        <td className="border p-2 text-sm text-gray-600">{patient.notes}</td>
                        {days.map(day => (
                          <td key={day} className="border p-2 cursor-pointer hover:bg-blue-50" onClick={() => openExamModal(patient.id, day)} title="Kliknij, aby dodać badanie">
                            <div className="space-y-1">
                              {(patient.exams[day] || []).map(exam => (
                                <div key={exam.id} className={`text-xs p-1 rounded ${getStatusColor(exam.status)} cursor-pointer hover:opacity-80`} onClick={(e) => { e.stopPropagation(); openEditExam(patient.id, day, exam); }} title="Kliknij, aby edytować badanie">
                                  <div className="flex justify-between items-start">
                                    <span className="font-semibold">{getPriorityBadge(exam.priority)} {exam.type}{exam.status === 'Przygotowanie' && ' ⚠️'}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(patient.id, day, exam.id); }} className="text-red-600 hover:text-red-800 ml-1" title="Usuń badanie">×</button>
                                  </div>
                                  {exam.timeOfDay && <div className="text-xs opacity-75 mt-1">{exam.timeOfDay}</div>}
                                  {exam.checklist?.length > 0 && <div className="text-xs opacity-75 mt-1">✓ {formatChecklist(exam.checklist, exam.otherPreparation)}</div>}
                                </div>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {currentView === 'today' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Badania na dziś</h2>
              <div className="space-y-2">
                {getTodayExams().length === 0 ? <p className="text-gray-500">Brak badań zaplanowanych na dziś</p> : getTodayExams().map(exam => (
                  <div key={exam.id} className={`p-4 rounded-lg ${getStatusColor(exam.status)} cursor-pointer hover:opacity-90`} onClick={() => openEditExam(exam.patientId, exam.day, exam)} title="Kliknij, aby edytować badanie">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-lg">{getPriorityBadge(exam.priority)} {exam.type}{exam.status === 'Przygotowanie' && ' ⚠️'}</div>
                        <div className="text-sm mt-1">Pacjent: {exam.patient} | Pokój: {exam.room}</div>
                        {exam.timeOfDay && <div className="text-sm mt-1">Pora: {exam.timeOfDay}</div>}
                        {exam.checklist?.length > 0 && <div className="text-sm mt-2"><strong>Do przygotowania:</strong><ul className="list-disc list-inside mt-1">{exam.checklist.map((item, i) => <li key={i}>{item === 'inne' && exam.otherPreparation ? `inne: ${exam.otherPreparation}` : item}</li>)}</ul></div>}
                      </div>
                      <div className="text-sm font-semibold">{exam.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {(showAddPatient || editingPatient) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingPatient ? 'Edytuj pacjenta' : 'Dodaj pacjenta'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold mb-1">Pokój:</label><input type="text" value={newPatient.room} onChange={(e) => setNewPatient({...newPatient, room: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="np. 101" /></div>
              <div><label className="block text-sm font-semibold mb-1">Inicjały:</label><input type="text" value={newPatient.initials} onChange={(e) => setNewPatient({...newPatient, initials: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="np. JK" /></div>
              <div><label className="block text-sm font-semibold mb-1">Uwagi:</label><textarea value={newPatient.notes} onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="np. Dializa Pn/Śr/Pt" rows="3" /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={editingPatient ? handleEditPatient : handleAddPatient} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{editingPatient ? 'Zapisz zmiany' : 'Dodaj'}</button>
              <button onClick={closePatientModal} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Anuluj</button>
            </div>
          </div>
        </div>
      )}

      {examModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h2 className="text-xl font-bold mb-2">{editingExam ? `Edytuj badanie - ${examModal.day}` : `Dodaj badania - ${examModal.day}`}</h2>
            <p className="text-sm text-gray-600 mb-4">{editingExam ? 'Zmień status lub szczegóły badania i kliknij Zapisz zmiany.' : 'Wybierz badanie, ustaw szczegóły i kliknij + Dodaj do listy. Na końcu zapisz wszystkie badania.'}</p>
            <div className="space-y-4 border-b pb-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Rodzaj badania:</label>
                <select value={currentExamForm.type} onChange={(e) => setCurrentExamForm({...currentExamForm, type: e.target.value})} className="w-full border rounded px-3 py-2">
                  <option value="">-- wybierz --</option>
                  {examTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              {currentExamForm.type === 'inne' && <div><label className="block text-sm font-semibold mb-2">Własne badanie:</label><input type="text" value={currentExamForm.customType} onChange={(e) => setCurrentExamForm({...currentExamForm, customType: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="Wpisz nazwę badania" />{!currentExamForm.customType.trim() && <p className="text-xs text-red-600 mt-1">Nazwa badania jest wymagana</p>}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2">Status:</label><select value={currentExamForm.status} onChange={(e) => setCurrentExamForm({...currentExamForm, status: e.target.value})} className="w-full border rounded px-3 py-2"><option value="Zlecone">Zlecone</option><option value="W trakcie">W trakcie</option><option value="Wykonane">Wykonane</option><option value="Przygotowanie">Przygotowanie</option></select></div>
                <div><label className="block text-sm font-semibold mb-2">Priorytet:</label><select value={currentExamForm.priority} onChange={(e) => setCurrentExamForm({...currentExamForm, priority: e.target.value})} className="w-full border rounded px-3 py-2"><option value="standard">Standard</option><option value="pilne">Pilne</option><option value="do dnia">Do dnia</option></select></div>
              </div>
              <div><label className="block text-sm font-semibold mb-2">Pora dnia:</label><select value={currentExamForm.timeOfDay} onChange={(e) => setCurrentExamForm({...currentExamForm, timeOfDay: e.target.value})} className="w-full border rounded px-3 py-2"><option value="">-- nie dotyczy --</option><option value="rano">rano</option><option value="przed południem">przed południem</option><option value="po południu">po południu</option><option value="przed dializą">przed dializą</option><option value="po dializie">po dializie</option></select></div>
              <div>
                <label className="block text-sm font-semibold mb-2">Lista kontrolna przygotowania:</label>
                <div className="grid grid-cols-2 gap-2">{checklistOptions.map(option => <label key={option} className="flex items-center gap-2"><input type="checkbox" checked={currentExamForm.checklist.includes(option)} onChange={() => toggleChecklist(option)} /><span className="text-sm">{option}</span></label>)}</div>
                {currentExamForm.checklist.includes('inne') && <div className="mt-3"><label className="block text-sm font-semibold mb-2">Opisz inne przygotowanie:</label><input type="text" value={currentExamForm.otherPreparation} onChange={(e) => setCurrentExamForm({...currentExamForm, otherPreparation: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="np. podpisać zgodę od rodziny" /></div>}
              </div>
              {!editingExam && <button onClick={addToExamList} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">+ Dodaj do listy</button>}
            </div>
            {!editingExam && examList.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Badania do dodania:</h3>
                <div className="space-y-2">{examList.map(exam => <div key={exam.id} className={`p-3 rounded ${getStatusColor(exam.status)}`}><div className="flex justify-between items-start"><div className="flex-1"><div className="font-semibold text-sm mb-1">{getPriorityBadge(exam.priority)} {exam.type}</div><div className="text-xs space-y-1"><div>Status: {exam.status} | Priorytet: {exam.priority}</div>{exam.timeOfDay && <div>Pora: {exam.timeOfDay}</div>}{exam.checklist.length > 0 && <div>Przygotowanie: {formatChecklist(exam.checklist, exam.otherPreparation)}</div>}</div></div><button onClick={() => removeFromExamList(exam.id)} className="text-red-600 hover:text-red-800 font-bold ml-2" title="Usuń z listy">×</button></div></div>)}</div>
              </div>
            )}
            <div className="flex gap-2">
              {editingExam ? <><button onClick={saveEditedExam} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Zapisz zmiany</button><button onClick={() => setExamModal(null)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Anuluj</button></> : <><button onClick={saveAllExams} disabled={examList.length === 0} className={`flex-1 py-2 rounded ${examList.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Zapisz wszystkie ({examList.length})</button><button onClick={() => setExamModal(null)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Anuluj</button></>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
