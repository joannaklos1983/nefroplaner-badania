'use client';

import { useState, useMemo, useEffect } from 'react';

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 999px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 999px;
    transition: background 0.2s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #f1f5f9;
  }
`;

'use client';

import { useState, useMemo, useEffect } from 'react';

export default function Home() {
  // Funkcje pomocnicze do zarządzania datami
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}, ${hours}:${minutes}`;
  };

  const formatDeadlineDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  };

  const formatMonthYear = (date) => {
    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatWeekRange = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const monthNames = [
      'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const year = start.getFullYear();
    
    if (start.getMonth() === end.getMonth()) {
      return `${startDay}–${endDay} ${startMonth} ${year}`;
    } else {
      return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
    }
  };

  const getDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Sprawdza czy badanie jest zaległe
  const isExamOverdue = (exam) => {
    if (exam.priority !== 'badanie z terminem') return false;
    if (!exam.deadlineDate) return false;
    if (exam.status === 'Wykonane') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(exam.deadlineDate);
    deadline.setHours(0, 0, 0, 0);
    
    return deadline < today;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  // Funkcja do wczytania danych z localStorage
  const loadPatientsFromStorage = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('nefroPlaner_patients');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Błąd wczytywania danych:', error);
    }
    return null;
  };

  // Domyślni pacjenci (jeśli brak danych w localStorage)
  const defaultPatients = [
    { id: 1, room: '101', initials: 'JK', notes: 'Dializa Pn/Śr/Pt', exams: {} },
    { id: 2, room: '102', initials: 'AM', notes: '', exams: {} },
  ];

  const [patients, setPatients] = useState(() => {
    const stored = loadPatientsFromStorage();
    return stored || defaultPatients;
  });

  // Zapisz do localStorage przy każdej zmianie patients
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nefroPlaner_patients', JSON.stringify(patients));
      } catch (error) {
        console.error('Błąd zapisywania danych:', error);
      }
    }
  }, [patients]);

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
    otherPreparation: '',
    createdBy: '',
    deadlineDate: ''
  });

  const [currentView, setCurrentView] = useState('week');
  const [filters, setFilters] = useState({
    incomplete: false,
    preparation: false,
    urgent: false,
    overdue: false,
    room: ''
  });

  const dayNames = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd'];
  
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentWeekStart]);

  // Generuj dni kalendarzowe dla widoku miesięcznego
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(calendarStart.getDate() - startOffset);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [currentMonth]);

  // Funkcja do pobrania szczegółów badań dla danego dnia
  const getDayExamsDetails = (date) => {
    const dateKey = getDateKey(date);
    const allExams = [];
    
    patients.forEach(patient => {
      const dayExams = patient.exams[dateKey] || [];
      dayExams.forEach(exam => {
        allExams.push({
          ...exam,
          patientInitials: patient.initials,
          patientRoom: patient.room
        });
      });
    });
    
    return allExams;
  };

  // Funkcja do liczenia badań dla danego dnia
  const getDayExamsStats = (date) => {
    const dateKey = getDateKey(date);
    let total = 0;
    let urgent = 0;
    let deadline = 0;
    
    patients.forEach(patient => {
      const dayExams = patient.exams[dateKey] || [];
      total += dayExams.length;
      dayExams.forEach(exam => {
        if (exam.priority === 'pilne') urgent++;
        if (exam.priority === 'badanie z terminem') deadline++;
      });
    });
    
    return { total, urgent, deadline };
  };

  const examTypes = [
    'USG', 'TK', 'Angio-TK', 'MR', 'RTG', 'Echo', 'EKG',
    'konsultacja', 'laboratorium', 'biopsja', 'inne'
  ];
  const checklistOptions = [
    'na czczo', 'zgoda', 'wenflon', 'kreatynina', 
    'transport', 'odstawienie leków', 'inne'
  ];

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleDayClick = (date) => {
    setCurrentWeekStart(getWeekStart(date));
    setCurrentView('week');
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

  const openExamModal = (patientId, date) => {
    setExamModal({ patientId, date });
    setEditingExam(null);
    setExamList([]);
    setCurrentExamForm({
      type: '',
      customType: '',
      status: 'Zlecone',
      priority: 'standard',
      timeOfDay: '',
      checklist: [],
      otherPreparation: '',
      createdBy: '',
      deadlineDate: ''
    });
  };

  const openEditExam = (patientId, date, exam) => {
    setExamModal({ patientId, date });
    setEditingExam(exam);
    setExamList([]);
    
    const isStandardExam = examTypes.includes(exam.type);
    
    setCurrentExamForm({
      type: isStandardExam ? exam.type : 'inne',
      customType: isStandardExam ? '' : exam.type,
      status: exam.status,
      priority: exam.priority,
      timeOfDay: exam.timeOfDay || '',
      checklist: exam.checklist || [],
      otherPreparation: exam.otherPreparation || '',
      createdBy: exam.createdBy || '',
      deadlineDate: exam.deadlineDate || ''
    });
  };

  // Szybka zmiana statusu (bez modala)
  const cycleExamStatus = (patientId, date, examId, e) => {
    e.stopPropagation();
    
    const dateKey = getDateKey(date);
    
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          exams: {
            ...p.exams,
            [dateKey]: (p.exams[dateKey] || []).map(exam => {
              if (exam.id === examId) {
                let newStatus;
                if (exam.status === 'Zlecone') newStatus = 'W trakcie';
                else if (exam.status === 'W trakcie') newStatus = 'Wykonane';
                else if (exam.status === 'Wykonane') newStatus = 'Zlecone';
                else newStatus = 'Zlecone';
                
                return { ...exam, status: newStatus };
              }
              return exam;
            })
          }
        };
      }
      return p;
    }));
  };

  const addToExamList = () => {
    // Walidacja nazwy badania
    if (currentExamForm.type === 'inne' && !currentExamForm.customType.trim()) {
      alert('Proszę wpisać nazwę badania');
      return;
    }
    
    if (!currentExamForm.type && !currentExamForm.customType) return;

    // WALIDACJA POLA "Kto zlecił / dodał" - OBOWIĄZKOWE
    if (!currentExamForm.createdBy.trim()) {
      alert('Uzupełnij pole: Kto zlecił / dodał.');
      return;
    }

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
        otherPreparation: currentExamForm.otherPreparation,
        createdBy: currentExamForm.createdBy,
        createdAt: new Date().toISOString(),
        deadlineDate: currentExamForm.deadlineDate
      }
    ]);

    setCurrentExamForm({
      type: '',
      customType: '',
      status: 'Zlecone',
      priority: 'standard',
      timeOfDay: '',
      checklist: [],
      otherPreparation: '',
      createdBy: currentExamForm.createdBy,
      deadlineDate: ''
    });
  };

  const removeFromExamList = (examId) => {
    setExamList(examList.filter(e => e.id !== examId));
  };

  const saveAllExams = () => {
    if (examList.length === 0) return;

    const dateKey = getDateKey(examModal.date);
    
    setPatients(patients.map(p => {
      if (p.id === examModal.patientId) {
        const dayExams = p.exams[dateKey] || [];
        return {
          ...p,
          exams: {
            ...p.exams,
            [dateKey]: [...dayExams, ...examList]
          }
        };
      }
      return p;
    }));

    setExamModal(null);
    setExamList([]);
  };

  const saveEditedExam = () => {
    // Walidacja nazwy badania
    if (currentExamForm.type === 'inne' && !currentExamForm.customType.trim()) {
      alert('Proszę wpisać nazwę badania');
      return;
    }
    
    if (!currentExamForm.type && !currentExamForm.customType) return;

    // WALIDACJA POLA "Kto zlecił / dodał" - OBOWIĄZKOWE
    if (!currentExamForm.createdBy.trim()) {
      alert('Uzupełnij pole: Kto zlecił / dodał.');
      return;
    }

    const examType = currentExamForm.type === 'inne' ? currentExamForm.customType : currentExamForm.type;
    const dateKey = getDateKey(examModal.date);

    setPatients(patients.map(p => {
      if (p.id === examModal.patientId) {
        return {
          ...p,
          exams: {
            ...p.exams,
            [dateKey]: (p.exams[dateKey] || []).map(e =>
              e.id === editingExam.id
                ? {
                    ...e,
                    type: examType,
                    status: currentExamForm.status,
                    priority: currentExamForm.priority,
                    timeOfDay: currentExamForm.timeOfDay,
                    checklist: currentExamForm.checklist,
                    otherPreparation: currentExamForm.otherPreparation,
                    createdBy: currentExamForm.createdBy,
                    deadlineDate: currentExamForm.deadlineDate
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

  const handleDeleteExam = (patientId, date, examId) => {
    if (confirm('Usunąć to badanie?')) {
      const dateKey = getDateKey(date);
      setPatients(patients.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            exams: {
              ...p.exams,
              [dateKey]: (p.exams[dateKey] || []).filter(e => e.id !== examId)
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
    
    if (item === 'inne' && !newChecklist.includes('inne')) {
      setCurrentExamForm({
        ...currentExamForm,
        checklist: newChecklist,
        otherPreparation: ''
      });
    } else {
      setCurrentExamForm({
        ...currentExamForm,
        checklist: newChecklist
      });
    }
  };

  const handlePriorityChange = (newPriority) => {
    setCurrentExamForm({
      ...currentExamForm,
      priority: newPriority,
      deadlineDate: newPriority === 'badanie z terminem' ? currentExamForm.deadlineDate : ''
    });
  };

  // Nowoczesne kolory statusów
  const getStatusColor = (status) => {
    switch(status) {
      case 'Zlecone': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'W trakcie': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Wykonane': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Przygotowanie': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'pilne') return '🔴';
    if (priority === 'badanie z terminem') return '⏰';
    return '';
  };

  const formatChecklist = (checklist, otherPreparation) => {
    if (!checklist || checklist.length === 0) return '';
    
    return checklist.map(item => {
      if (item === 'inne' && otherPreparation) {
        return `inne: ${otherPreparation}`;
      }
      return item;
    }).join(', ');
  };

  const getTodayExams = () => {
    const today = new Date();
    const todayKey = getDateKey(today);

    return patients.flatMap(patient => {
      const dayExams = patient.exams[todayKey] || [];
      return dayExams.map(exam => ({
        ...exam,
        patient: patient.initials,
        room: patient.room,
        dateKey: todayKey,
        date: today,
        patientId: patient.id
      }));
    });
  };

  // Pobierz wszystkie zaległe badania
  const getOverdueExams = () => {
    const allExams = [];
    
    patients.forEach(patient => {
      Object.entries(patient.exams).forEach(([dateKey, dayExams]) => {
        dayExams.forEach(exam => {
          if (isExamOverdue(exam)) {
            allExams.push({
              ...exam,
              patient: patient.initials,
              room: patient.room,
              dateKey: dateKey,
              date: new Date(dateKey),
              patientId: patient.id
            });
          }
        });
      });
    });
    
    return allExams;
  };

  // Oblicz statystyki dla widoku "Dzisiaj"
  const getTodayStats = () => {
    const todayExams = getTodayExams();
    
    return {
      total: todayExams.length,
      urgent: todayExams.filter(e => e.priority === 'pilne').length,
      deadline: todayExams.filter(e => e.priority === 'badanie z terminem').length,
      preparation: todayExams.filter(e => e.status === 'Przygotowanie').length,
      completed: todayExams.filter(e => e.status === 'Wykonane').length,
      incomplete: todayExams.filter(e => e.status !== 'Wykonane').length,
      overdue: getOverdueExams().length
    };
  };

  const filterPatients = () => {
    return patients.filter(patient => {
      if (filters.room && !patient.room.includes(filters.room)) return false;
      
      if (filters.incomplete || filters.preparation || filters.urgent || filters.overdue) {
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

        if (filters.overdue) {
          const hasOverdue = allExams.some(exam => isExamOverdue(exam));
          if (!hasOverdue) return false;
        }
      }

      return true;
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
        {/* PREMIUM BACKGROUND - Delikatny medical gradient + glassmorphism */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50"></div>
        <div className="fixed top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
          {/* PREMIUM CARD - Glassmorphism effect */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              NefroPlaner Badania
            </h1>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setCurrentView('week')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'week'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/60 text-gray-700 hover:bg-white border border-gray-200'
                }`}
              >
                Widok tygodniowy
              </button>
              <button
                onClick={() => setCurrentView('today')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'today'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/60 text-gray-700 hover:bg-white border border-gray-200'
                }`}
              >
                Dzisiaj
              </button>
              <button
                onClick={() => setCurrentView('month')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'month'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/60 text-gray-700 hover:bg-white border border-gray-200'
                }`}
              >
                Miesiąc
              </button>
            </div>

            {currentView === 'week' && (
              <div className="mb-4 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <button
                  onClick={goToPreviousWeek}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 border border-blue-200 font-medium transition-all mb-2 md:mb-0"
                >
                  ← Poprzedni tydzień
                </button>
                <div className="text-center mb-2 md:mb-0">
                  <div className="text-lg font-semibold text-gray-800">
                    Tydzień: {formatWeekRange(currentWeekStart)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={goToCurrentWeek}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Bieżący tydzień
                  </button>
                  <button
                    onClick={goToNextWeek}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 border border-blue-200 font-medium transition-all"
                  >
                    Następny tydzień →
                  </button>
                </div>
              </div>
            )}

            {currentView === 'month' && (
              <div className="mb-4 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <button
                  onClick={goToPreviousMonth}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 border border-blue-200 font-medium transition-all mb-2 md:mb-0"
                >
                  ← Poprzedni miesiąc
                </button>
                <div className="text-center mb-2 md:mb-0">
                  <div className="text-lg font-semibold text-gray-800">
                    {formatMonthYear(currentMonth)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={goToCurrentMonth}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Bieżący miesiąc
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 border border-blue-200 font-medium transition-all"
                  >
                    Następny miesiąc →
                  </button>
                </div>
              </div>
            )}

            {currentView === 'week' && (
              <div className="mb-6 p-4 bg-white/60 rounded-xl border border-gray-200">
                <h3 className="font-semibold mb-3 text-gray-700">Filtry:</h3>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.incomplete}
                      onChange={(e) => setFilters({...filters, incomplete: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Niewykonane</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.preparation}
                      onChange={(e) => setFilters({...filters, preparation: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Przygotowanie</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.urgent}
                      onChange={(e) => setFilters({...filters, urgent: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Pilne</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.overdue}
                      onChange={(e) => setFilters({...filters, overdue: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Zaległe</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Numer pokoju"
                    value={filters.room}
                    onChange={(e) => setFilters({...filters, room: e.target.value})}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setFilters({incomplete: false, preparation: false, urgent: false, overdue: false, room: ''})}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    Wyczyść filtry
                  </button>
                </div>
              </div>
            )}

            {currentView === 'month' && (
              <div className="mb-4">
                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center font-semibold text-sm p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isToday = getDateKey(date) === getDateKey(new Date());
                    const stats = getDayExamsStats(date);
                    const examsDetails = getDayExamsDetails(date);
                    
                    const examsToShow = examsDetails.slice(0, 3);
                    const remainingCount = examsDetails.length - 3;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDayClick(date)}
                        className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white/80'
                        } ${isToday ? 'ring-2 ring-blue-500 shadow-lg' : 'border-gray-200'}`}
                      >
                        <div className="font-semibold text-sm mb-2">
                          {date.getDate()}
                        </div>
                        {stats.total > 0 && (
                          <div className="space-y-1 text-xs">
                            <div className="text-gray-700 font-semibold mb-1">
                              Badań: {stats.total}
                            </div>
                            
                            {examsToShow.map((exam, idx) => (
                              <div key={idx} className="text-gray-600 text-[10px] leading-tight">
                                • {exam.type} — {exam.patientInitials} / {exam.patientRoom}
                              </div>
                            ))}
                            
                            {remainingCount > 0 && (
                              <div className="text-gray-500 text-[10px] italic">
                                + {remainingCount} więcej
                              </div>
                            )}
                            
                            {stats.urgent > 0 && (
                              <div className="text-red-600 mt-1">
                                🔴 Pilne: {stats.urgent}
                              </div>
                            )}
                            {stats.deadline > 0 && (
                              <div className="text-orange-600">
                                ⏰ Badanie z terminem: {stats.deadline}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentView === 'week' && (
              <>
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="mb-4 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  + Dodaj pacjenta
                </button>

                {/* ✅ STICKY HEADER + STICKY COLUMNS + CUSTOM SCROLLBAR */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 relative custom-scrollbar">
                  <table className="w-full border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-30">
                      <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
                        <th className="sticky left-0 z-40 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 p-3 text-sm font-semibold text-gray-700 w-20 border-r border-gray-300">Akcje</th>
                        <th className="sticky left-20 z-40 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 p-3 text-sm font-semibold text-gray-700 w-16 border-r border-gray-300">Pokój</th>
                        <th className="sticky left-36 z-40 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 p-3 text-sm font-semibold text-gray-700 w-20 border-r border-gray-300">Pacjent</th>
                        <th className="border-b border-gray-200 p-3 text-sm font-semibold text-gray-700 w-48">Uwagi</th>
                        {weekDates.map((date, index) => (
                          <th key={index} className="border-b border-gray-200 p-3 text-sm font-semibold text-gray-700 min-w-[140px]">
                            {dayNames[index]} {formatDate(date)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white/50">
                      {filterPatients().map(patient => (
                        <tr key={patient.id} className="hover:bg-blue-100/50 hover:shadow-sm transition-all group">
                          <td className="sticky left-0 z-20 bg-white/50 group-hover:bg-blue-100/50 border-b border-gray-100 border-r border-gray-300 p-2 text-center transition-all">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => openEditPatient(patient)}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edytuj pacjenta"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeletePatient(patient.id)}
                                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                                title="Usuń pacjenta"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                          <td className="sticky left-20 z-20 bg-white/50 group-hover:bg-blue-100/50 border-b border-gray-100 border-r border-gray-300 p-2 text-center font-semibold text-gray-800 transition-all">{patient.room}</td>
                          <td className="sticky left-36 z-20 bg-white/50 group-hover:bg-blue-100/50 border-b border-gray-100 border-r border-gray-300 p-2 text-center font-semibold text-gray-800 transition-all">{patient.initials}</td>
                          <td className="border-b border-gray-100 p-2 text-sm text-gray-600 break-words">{patient.notes}</td>
                          {weekDates.map((date, index) => {
                            const dateKey = getDateKey(date);
                            const dayExams = patient.exams[dateKey] || [];
                            
                            return (
                              <td
                                key={index}
                                className="border-b border-gray-100 p-2 cursor-pointer hover:bg-blue-50/50 align-top transition-colors"
                                onClick={() => openExamModal(patient.id, date)}
                                title="Kliknij, aby dodać badanie"
                              >
                                <div className="space-y-2">
                                  {dayExams.map(exam => {
                                    const overdue = isExamOverdue(exam);
                                    
                                    return (
                                      <div
                                        key={exam.id}
                                        className={`text-xs p-3 rounded-xl border transition-all ${getStatusColor(exam.status)} ${
                                          overdue ? 'ring-2 ring-red-500 shadow-md' : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditExam(patient.id, date, exam);
                                        }}
                                        title="Kliknij, aby edytować badanie"
                                      >
                                        {overdue && (
                                          <div className="text-red-700 font-bold text-xs mb-2 flex items-center gap-1">
                                            ⚠️ TERMIN MINĄŁ
                                          </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="font-semibold text-sm text-gray-800">
                                            {getPriorityBadge(exam.priority)} {exam.type}
                                            {exam.status === 'Przygotowanie' && ' ⚠️'}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteExam(patient.id, date, exam.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 ml-2 text-lg leading-none transition-colors"
                                            title="Usuń badanie"
                                          >
                                            ×
                                          </button>
                                        </div>
                                        
                                        {/* KLIKALNA ZMIANA STATUSU */}
                                        <div
                                          onClick={(e) => cycleExamStatus(patient.id, date, exam.id, e)}
                                          className={`inline-block px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95 transition-all ${getStatusColor(exam.status)}`}
                                          title="Kliknij aby zmienić status"
                                        >
                                          {exam.status}
                                        </div>
                                        
                                        {exam.priority === 'badanie z terminem' && exam.deadlineDate && (
                                          <div className="text-xs text-gray-600 mt-2">
                                            termin: {formatDeadlineDate(exam.deadlineDate)}
                                          </div>
                                        )}
                                        {exam.timeOfDay && (
                                          <div className="text-xs text-gray-600 mt-1">
                                            {exam.timeOfDay}
                                          </div>
                                        )}
                                        {exam.checklist?.length > 0 && (
                                          <div className="text-xs text-gray-600 mt-1">
                                            ✓ {formatChecklist(exam.checklist, exam.otherPreparation)}
                                          </div>
                                        )}
                                        {(exam.createdAt || exam.createdBy) && (
                                          <div className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-200 space-y-0.5">
                                            {exam.createdAt && (
                                              <div>zlecono: {formatDateTime(exam.createdAt)}</div>
                                            )}
                                            {exam.createdBy && (
                                              <div>dodał: {exam.createdBy}</div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {currentView === 'today' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Badania na dziś</h2>
                
                {/* LICZNIKI BADAŃ */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
                  {(() => {
                    const stats = getTodayStats();
                    return (
                      <>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                          <div className="text-xs text-blue-600 font-medium mt-1">Wszystkie badania</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-2xl font-bold text-red-700">🔴 {stats.urgent}</div>
                          <div className="text-xs text-red-600 font-medium mt-1">Pilne</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-2xl font-bold text-orange-700">⏰ {stats.deadline}</div>
                          <div className="text-xs text-orange-600 font-medium mt-1">Badanie z terminem</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-2xl font-bold text-amber-700">⚠️ {stats.preparation}</div>
                          <div className="text-xs text-amber-600 font-medium mt-1">Przygotowanie</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-2xl font-bold text-emerald-700">✅ {stats.completed}</div>
                          <div className="text-xs text-emerald-600 font-medium mt-1">Wykonane</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-2xl font-bold text-slate-700">📋 {stats.incomplete}</div>
                          <div className="text-xs text-slate-600 font-medium mt-1">Niewykonane</div>
                        </div>

                        <div className="bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow">
                          <div className="text-2xl font-bold text-red-800">🔴 {stats.overdue}</div>
                          <div className="text-xs text-red-700 font-bold mt-1">Zaległe</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* LISTA BADAŃ */}
                <div className="space-y-3">
                  {getTodayExams().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Brak badań zaplanowanych na dziś</p>
                  ) : (
                    getTodayExams().map(exam => {
                      const overdue = isExamOverdue(exam);
                      
                      return (
                        <div
                          key={exam.id}
                          className={`p-5 rounded-xl border transition-all ${
                            overdue ? 'ring-2 ring-red-500 shadow-lg' : 'shadow-sm hover:shadow-md'
                          } bg-white/80 backdrop-blur-sm cursor-pointer`}
                          onClick={() => openEditExam(exam.patientId, exam.date, exam)}
                          title="Kliknij, aby edytować badanie"
                        >
                          {overdue && (
                            <div className="text-red-700 font-bold text-base mb-3 flex items-center gap-2">
                              ⚠️ TERMIN MINĄŁ
                            </div>
                          )}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-800 mb-2">
                                {getPriorityBadge(exam.priority)} {exam.type}
                                {exam.status === 'Przygotowanie' && ' ⚠️'}
                              </div>
                              <div className="text-sm text-gray-600 mb-3">
                                Pacjent: {exam.patient} | Pokój: {exam.room}
                              </div>
                              
                              {/* KLIKALNA ZMIANA STATUSU */}
                              <div
                                onClick={(e) => cycleExamStatus(exam.patientId, exam.date, exam.id, e)}
                                className={`inline-block px-5 py-2.5 rounded-lg text-sm font-semibold border cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 transition-all mb-3 ${getStatusColor(exam.status)}`}
                                title="Kliknij aby zmienić status"
                              >
                                {exam.status}
                              </div>
                              
                              {exam.priority === 'badanie z terminem' && exam.deadlineDate && (
                                <div className="text-sm text-gray-600 mt-2">
                                  Termin: {formatDeadlineDate(exam.deadlineDate)}
                                </div>
                              )}
                              {exam.timeOfDay && (
                                <div className="text-sm text-gray-600 mt-1">Pora: {exam.timeOfDay}</div>
                              )}
                              {exam.checklist?.length > 0 && (
                                <div className="text-sm mt-3">
                                  <strong className="text-gray-700">Do przygotowania:</strong>
                                  <ul className="list-disc list-inside mt-1 text-gray-600">
                                    {exam.checklist.map((item, i) => (
                                      <li key={i}>
                                        {item === 'inne' && exam.otherPreparation
                                          ? `inne: ${exam.otherPreparation}`
                                          : item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {exam.createdAt && (
                                <div className="text-xs text-gray-500 mt-3 italic">
                                  Zlecono: {formatDateTime(exam.createdAt)}
                                </div>
                              )}
                              {exam.createdBy && (
                                <div className="text-xs text-gray-500 italic">
                                  Dodał: {exam.createdBy}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {(showAddPatient || editingPatient) && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {editingPatient ? 'Edytuj pacjenta' : 'Dodaj pacjenta'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Pokój:</label>
                  <input
                    type="text"
                    value={newPatient.room}
                    onChange={(e) => setNewPatient({...newPatient, room: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="np. 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Inicjały:</label>
                  <input
                    type="text"
                    value={newPatient.initials}
                    onChange={(e) => setNewPatient({...newPatient, initials: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="np. JK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Uwagi:</label>
                  <textarea
                    value={newPatient.notes}
                    onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="np. Dializa Pn/Śr/Pt"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingPatient ? handleEditPatient : handleAddPatient}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  {editingPatient ? 'Zapisz zmiany' : 'Dodaj'}
                </button>
                <button
                  onClick={closePatientModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}

        {examModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                {editingExam 
                  ? `Edytuj badanie - ${dayNames[examModal.date.getDay() === 0 ? 6 : examModal.date.getDay() - 1]} ${formatDate(examModal.date)}`
                  : `Dodaj badania - ${dayNames[examModal.date.getDay() === 0 ? 6 : examModal.date.getDay() - 1]} ${formatDate(examModal.date)}`
                }
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                {editingExam 
                  ? 'Zmień status lub szczegóły badania i kliknij Zapisz zmiany.'
                  : 'Wybierz badanie, ustaw szczegóły i kliknij + Dodaj do listy. Na końcu zapisz wszystkie badania.'}
              </p>

              <div className="space-y-4 border-b border-gray-200 pb-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Rodzaj badania:</label>
                  <select
                    value={currentExamForm.type}
                    onChange={(e) => setCurrentExamForm({...currentExamForm, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- wybierz --</option>
                    {examTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {currentExamForm.type === 'inne' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Własne badanie:</label>
                    <input
                      type="text"
                      value={currentExamForm.customType}
                      onChange={(e) => setCurrentExamForm({...currentExamForm, customType: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Wpisz nazwę badania"
                    />
                    {currentExamForm.type === 'inne' && !currentExamForm.customType.trim() && (
                      <p className="text-xs text-red-600 mt-1">Nazwa badania jest wymagana</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Status:</label>
                    <select
                      value={currentExamForm.status}
                      onChange={(e) => setCurrentExamForm({...currentExamForm, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Zlecone">Zlecone</option>
                      <option value="W trakcie">W trakcie</option>
                      <option value="Wykonane">Wykonane</option>
                      <option value="Przygotowanie">Przygotowanie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Priorytet:</label>
                    <select
                      value={currentExamForm.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="pilne">Pilne</option>
                      <option value="badanie z terminem">Badanie z terminem</option>
                    </select>
                  </div>
                </div>

                {currentExamForm.priority === 'badanie z terminem' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Termin wykonania do dnia:</label>
                    <input
                      type="date"
                      value={currentExamForm.deadlineDate}
                      onChange={(e) => setCurrentExamForm({...currentExamForm, deadlineDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Pora dnia:</label>
                  <select
                    value={currentExamForm.timeOfDay}
                    onChange={(e) => setCurrentExamForm({...currentExamForm, timeOfDay: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- nie dotyczy --</option>
                    <option value="rano">rano</option>
                    <option value="przed południem">przed południem</option>
                    <option value="po południu">po południu</option>
                    <option value="przed dializą">przed dializą</option>
                    <option value="po dializie">po dializie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Dodał / zlecił: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentExamForm.createdBy}
                    onChange={(e) => setCurrentExamForm({...currentExamForm, createdBy: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="np. lekarz dyżurny, piel. dyżurna, sekretariat"
                  />
                  {!currentExamForm.createdBy.trim() && (
                    <p className="text-xs text-red-600 mt-1">To pole jest obowiązkowe</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Lista kontrolna przygotowania:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {checklistOptions.map(option => (
                      <label key={option} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={currentExamForm.checklist.includes(option)}
                          onChange={() => toggleChecklist(option)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                  
                  {currentExamForm.checklist.includes('inne') && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Opisz inne przygotowanie:</label>
                      <input
                        type="text"
                        value={currentExamForm.otherPreparation}
                        onChange={(e) => setCurrentExamForm({...currentExamForm, otherPreparation: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="np. podpisać zgodę od rodziny"
                      />
                    </div>
                  )}
                </div>

                {!editingExam && (
                  <button
                    onClick={addToExamList}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    + Dodaj do listy
                  </button>
                )}
              </div>

              {!editingExam && examList.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-3 text-gray-700">Badania do dodania:</h3>
                  <div className="space-y-2">
                    {examList.map(exam => (
                      <div key={exam.id} className={`p-3 rounded-xl border ${getStatusColor(exam.status)}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">
                              {getPriorityBadge(exam.priority)} {exam.type}
                            </div>
                            <div className="text-xs space-y-1 text-gray-600">
                              <div>Status: {exam.status} | Priorytet: {exam.priority}</div>
                              {exam.priority === 'badanie z terminem' && exam.deadlineDate && (
                                <div>Termin: {formatDeadlineDate(exam.deadlineDate)}</div>
                              )}
                              {exam.timeOfDay && <div>Pora: {exam.timeOfDay}</div>}
                              {exam.checklist?.length > 0 && (
                                <div>Przygotowanie: {formatChecklist(exam.checklist, exam.otherPreparation)}</div>
                              )}
                              {exam.createdBy && <div>Dodał: {exam.createdBy}</div>}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromExamList(exam.id)}
                            className="text-red-600 hover:text-red-800 font-bold ml-2 text-xl"
                            title="Usuń z listy"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {editingExam ? (
                  <>
                    <button
                      onClick={saveEditedExam}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      Zapisz zmiany
                    </button>
                    <button
                      onClick={() => setExamModal(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-all font-medium"
                    >
                      Anuluj
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={saveAllExams}
                      disabled={examList.length === 0}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                        examList.length > 0
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Zapisz wszystkie ({examList.length})
                    </button>
                    <button
                      onClick={() => setExamModal(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-all font-medium"
                    >
                      Anuluj
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
