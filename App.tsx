import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  Clock, 
  FileText, 
  RotateCcw, 
  Plus, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  Printer, 
  Copy, 
  Bookmark, 
  X, 
  Trash2,
  TrendingUp,
  Workflow
} from 'lucide-react';

interface PatientRecord {
  id: string;
  fileNo: string;
  name: string;
  age: string;
  weight: string;
  height: string;
  systolicBp: string;
  diastolicBp: string;
  medicalHistory: string;
  currentMeds: string;
  status: 'stable' | 'alert' | 'warning';
  lastUpdated: string;
  analysisDate?: string;
  analysisResult?: string;
}

const TEMPLATE_CASES = [
  {
    name: "سكري وضغط الدم (المريض النموذجي)",
    fileNo: "#44920",
    patientName: "أحمد عبد الله",
    age: "45",
    weight: "82.5",
    height: "175",
    systolicBp: "140",
    diastolicBp: "90",
    medicalHistory: "المريض يعاني من داء السكري من النوع الثاني منذ 5 سنوات، وارتفاع ضغط الدم الشرياني. لا يوجد حساسيات معروفة.",
    currentMeds: "Metformin 500mg (مرتين يومياً), Lisinopril 10mg (مرة صباحاً), Atorvastatin 20mg (قبل النوم).",
    status: "stable" as const
  },
  {
    name: "مريض ربو حاد مع قصور ووظائف الكلى",
    fileNo: "#37219",
    patientName: "فاطمة أحمد",
    age: "58",
    weight: "64",
    height: "160",
    systolicBp: "125",
    diastolicBp: "82",
    medicalHistory: "ربو شعبي حاد متكرر، بداية قصور كلوي مزمن (درجة ثانية)، ألم مفاصل مزمن.",
    currentMeds: "Salbutamol Inhaler (عند اللزوم), Sereetide Diskus (مرتين يومياً), Ibuprofen 400mg (ثلاث مرات يومياً عند اللزوم للألم).",
    status: "warning" as const
  },
  {
    name: "كبار سن مع فشل قلبي وجفاف نسبي",
    fileNo: "#51082",
    patientName: "محمود حسن",
    age: "78",
    weight: "59",
    height: "168",
    systolicBp: "95",
    diastolicBp: "55",
    medicalHistory: "فشل قلبي احتقاني (CHF)، جفاف سريري بسيط نتيجة الإسهال أمس، دوخة مستمرة عند الوقوف.",
    currentMeds: "Furosemide 40mg (مرة صباحاً), Spironolactone 25mg (مرة صباحاً), Digoxin 0.25mg (مرة صباحاً).",
    status: "alert" as const
  }
];

export default function App() {
  // Input states
  const [age, setAge] = useState<string>('45');
  const [weight, setWeight] = useState<string>('82.5');
  const [height, setHeight] = useState<string>('175');
  const [systolicBp, setSystolicBp] = useState<string>('140');
  const [diastolicBp, setDiastolicBp] = useState<string>('90');
  const [medicalHistory, setMedicalHistory] = useState<string>(
    'المريض يعاني من داء السكري من النوع الثاني منذ 5 سنوات، وارتفاع ضغط الدم الشرياني. لا يوجد حساسيات معروفة.'
  );
  const [currentMeds, setCurrentMeds] = useState<string>(
    'Metformin 500mg (مرتين يومياً), Lisinopril 10mg (مرة صباحاً), Atorvastatin 20mg (قبل النوم).'
  );
  const [patientName, setPatientName] = useState<string>('أحمد عبد الله');
  const [fileNo, setFileNo] = useState<string>('#44920');

  // Application states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [reportText, setReportText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [history, setHistory] = useState<PatientRecord[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  
  // Dynamic metrics
  const [bmi, setBmi] = useState<number>(26.9);
  const [bmiCategory, setBmiCategory] = useState<string>('زيادة في الوزن');
  const [bpAssessment, setBpAssessment] = useState<{ label: string; colorClass: string; isHigh: boolean }>({
    label: 'الضغط مرتفع وقيد الانتساب (المرحلة الأولى)',
    colorClass: 'text-red-600 bg-red-50 border-red-100',
    isHigh: true
  });

  // Calculate BMI and BP classification in real-time
  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const hMeter = h / 100;
      const calculatedBmi = w / (hMeter * hMeter);
      const roundedBmi = Math.round(calculatedBmi * 10) / 10;
      setBmi(roundedBmi);

      if (roundedBmi < 18.5) {
        setBmiCategory('نقص في الوزن (نحافة)');
      } else if (roundedBmi < 25) {
        setBmiCategory('وزن طبيعي ومثالي');
      } else if (roundedBmi < 30) {
        setBmiCategory('زيادة في الوزن (زيادة طفيفة)');
      } else {
        setBmiCategory('سمنة مفرطة');
      }
    } else {
      setBmi(0);
      setBmiCategory('بانتظار البيانات');
    }
  }, [weight, height]);

  useEffect(() => {
    const sys = parseInt(systolicBp);
    const dia = parseInt(diastolicBp);
    
    if (isNaN(sys) || isNaN(dia)) {
      setBpAssessment({
        label: 'يرجى إدخال الضغط السليم',
        colorClass: 'text-slate-500 bg-slate-50 border-slate-100',
        isHigh: false
      });
      return;
    }

    if (sys < 90 || dia < 60) {
      setBpAssessment({
        label: 'انخفاض في ضغط الدم الشرياني',
        colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
        isHigh: true
      });
    } else if (sys < 120 && dia < 80) {
      setBpAssessment({
        label: 'شرياني مثالي وطبيعي تماماً',
        colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        isHigh: false
      });
    } else if (sys >= 120 && sys < 130 && dia < 80) {
      setBpAssessment({
        label: 'ضغط مرتفع قليلاً (ما قبل ضغط الدم)',
        colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
        isHigh: false
      });
    } else if ((sys >= 130 && sys < 140) || (dia >= 80 && dia < 90)) {
      setBpAssessment({
        label: 'ضغط دم مرتفع (المرحلة الأولى سريراً)',
        colorClass: 'text-red-600 bg-red-50 border-red-100 border',
        isHigh: true
      });
    } else if (sys >= 140 || dia >= 90) {
      setBpAssessment({
        label: 'ضغط مرتفع بشدة (المرحلة الثانية)',
        colorClass: 'text-red-700 bg-red-100 border-red-200 border',
        isHigh: true
      });
    }
  }, [systolicBp, diastolicBp]);

  // Load history from local storage
  useEffect(() => {
    const cached = localStorage.getItem('clinica_records');
    if (cached) {
      try {
        setHistory(JSON.parse(cached));
      } catch (e) {
        console.error('Error loading history', e);
      }
    }
  }, []);

  // Sync back to local storage
  const saveToHistory = (newRecord: PatientRecord) => {
    const updated = [newRecord, ...history.filter(h => h.id !== newRecord.id)];
    setHistory(updated);
    localStorage.setItem('clinica_records', JSON.stringify(updated));
  };

  const removeRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('clinica_records', JSON.stringify(updated));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
    }
  };

  const loadCaseTemplate = (tpl: typeof TEMPLATE_CASES[0]) => {
    setAge(tpl.age);
    setWeight(tpl.weight);
    setHeight(tpl.height);
    setSystolicBp(tpl.systolicBp);
    setDiastolicBp(tpl.diastolicBp);
    setMedicalHistory(tpl.medicalHistory);
    setCurrentMeds(tpl.currentMeds);
    setPatientName(tpl.patientName);
    setFileNo(tpl.fileNo);
    // Clear old result to avoid confusion
    setReportText('');
    setErrorMessage('');
  };

  // Automated loading steps simulation
  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  // Handle Analysis Action
  const handleAnalyze = async () => {
    if (!age || !weight || !systolicBp || !diastolicBp) {
      setErrorMessage('يرجى ملء البيانات الأساسية والعلامات الحيوية قبل إجراء التحليل.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setReportText('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age,
          weight,
          height,
          systolicBp,
          diastolicBp,
          medicalHistory,
          currentMeds,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'حدث خطأ غير متوقع أثناء استدعاء المحلل.');
      }

      setReportText(data.analysis);

      // Create a history entry
      const newRecord: PatientRecord = {
        id: Date.now().toString(),
        fileNo: fileNo || `#${Math.floor(10000 + Math.random() * 90000)}`,
        name: patientName || 'مريض مجهول',
        age,
        weight,
        height,
        systolicBp,
        diastolicBp,
        medicalHistory,
        currentMeds,
        status: bpAssessment.isHigh ? 'warning' : 'stable',
        lastUpdated: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        analysisDate: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        analysisResult: data.analysis
      };

      saveToHistory(newRecord);
      setSelectedHistoryId(newRecord.id);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'فشل الاتصال بخدمة التحليل السريري. يرجى التحقق من الخادم والمحاولة مجدداً.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadPastRecord = (record: PatientRecord) => {
    setAge(record.age);
    setWeight(record.weight);
    setHeight(record.height);
    setSystolicBp(record.systolicBp);
    setDiastolicBp(record.diastolicBp);
    setMedicalHistory(record.medicalHistory);
    setCurrentMeds(record.currentMeds);
    setPatientName(record.name);
    setFileNo(record.fileNo);
    setReportText(record.analysisResult || '');
    setErrorMessage('');
    setSelectedHistoryId(record.id);
  };

  const handleClear = () => {
    setAge('');
    setWeight('');
    setHeight('');
    setSystolicBp('');
    setDiastolicBp('');
    setMedicalHistory('');
    setCurrentMeds('');
    setPatientName('مريض جديد');
    setFileNo('#' + Math.floor(10000 + Math.random() * 90000));
    setReportText('');
    setErrorMessage('');
    setSelectedHistoryId(null);
  };

  const handleCopyReport = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText);
      alert('تم نسخ تقرير المريض إلى الحافظة بنجاح.');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const loadingMessages = [
    "جارٍ مراجعة وفحص التداخلات الدوائية المحتملة...",
    "جارٍ تقييم قراءات ضغط الدم والتصنيف السريري الأمثل...",
    "جارٍ فحص التلاؤم العلاجي وحساب معامل كتلة الجسم الدقيق وصياغة الدلائل الإرشادية...",
    "صياغة التقرير النهائي وتنظيم التحذيرات الطبية العاجلة..."
  ];

  // Helper parser for simple Markdown rendering in application
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split text by lines to parse headers, bullet list items or default paragraphs
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Render level 1/2/3 headings
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} className="text-md font-bold text-slate-800 mt-6 mb-2 flex items-center gap-2 border-r-4 border-emerald-500 pr-2">
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-blue-950 mt-8 mb-4 flex items-center gap-2 border-b pb-1">
            {trimmed.replace('##', '').trim()}
          </h3>
        );
      }
      if (trimmed.startsWith('#')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-blue-900 mt-10 mb-4 bg-blue-50/50 p-2 rounded">
            {trimmed.replace('#', '').trim()}
          </h2>
        );
      }
      
      // Bullet lists
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const renderedText = trimmed.substring(1).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <li key={idx} className="mr-6 mb-1.5 list-disc text-slate-700 leading-relaxed text-sm pr-1" 
              dangerouslySetInnerHTML={{ __html: renderedText }} />
        );
      }

      // Safe paragraph handling with bold parser **text**
      if (trimmed === '') return <div key={idx} className="h-3" />;
      
      const parsedText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>');
      return (
        <p key={idx} 
           className="text-slate-700 text-sm leading-relaxed mb-2.5" 
           dangerouslySetInnerHTML={{ __html: parsedText }} />
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col font-sans" dir="rtl" id="clinica_app">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-200">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              بيانات المريض السريرية 
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">مساعد القرار السريري</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">منصة تحليل الخطط العلاجية والتفاعلات الدوائية بالذكاء الاصطناعي</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
            <span className="text-slate-450 text-xs">رقم ملف المريض:</span> 
            <input 
              type="text" 
              value={fileNo} 
              onChange={(e) => setFileNo(e.target.value)} 
              className="font-mono font-bold bg-transparent border-none p-0 outline-none w-18 text-slate-800 text-center focus:ring-1 focus:ring-blue-100 rounded" 
              placeholder="#"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-450 text-xs">الاسم:</span> 
            <input 
              type="text" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              className="font-bold bg-transparent border-none p-0 outline-none w-28 text-slate-800 text-right focus:ring-1 focus:ring-blue-100 rounded text-sm" 
              placeholder="اسم المريض"
            />
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ring-1 transition-all ${
            bpAssessment.isHigh 
              ? 'bg-amber-100 text-amber-850 ring-amber-200' 
              : 'bg-emerald-100 text-emerald-850 ring-emerald-200'
          }`}>
            ● الحالة الإكلينيكية: {bpAssessment.isHigh ? "فحص مطلوب" : "مستقرة"}
          </span>
        </div>
      </header>

      {/* CORE BODY GRID */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-x-hidden">
        
        {/* TEMPLATE CASES AND HISTORIC LIST (SIDEBAR - 3 COLUMNS) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-5 lg:max-h-[calc(110vh-210px)] lg:overflow-y-auto pr-1">
          
          {/* Section: Predefined presets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-sm mb-3 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>الحالات السريرية النموذجية</span>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              اختر حالة نموذجية معبأة مسبقاً لاختبار قدرات المحلل السريري الذكي بسرعة:
            </p>

            <div className="space-y-2">
              {TEMPLATE_CASES.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => loadCaseTemplate(tpl)}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-xs transition-all active:scale-[0.98] group flex justify-between items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-700 group-hover:text-blue-800 truncate">{tpl.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 mt-1 flex items-center gap-2">
                      <span>العمر: {tpl.age} سنة</span>
                      <span>•</span>
                      <span>الضغط: {tpl.systolicBp}/{tpl.diastolicBp}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mr-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Section: History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between text-slate-700 font-bold text-sm mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-emerald-600" />
                <span>سجل الفحوصات الجارية ({history.length})</span>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={() => {
                    localStorage.removeItem('clinica_records');
                    setHistory([]);
                    setSelectedHistoryId(null);
                  }}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5"
                  title="مسح كامل السجل"
                >
                  <Trash2 className="w-3 h-3" />
                  مسح
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-slate-450 border-2 border-dashed border-slate-100 rounded-xl">
                <FileText className="w-8 h-8 text-slate-300 mb-1.5" />
                <span className="text-xs font-bold text-slate-400">سجل التحليل فارغ</span>
                <span className="text-[10px] text-slate-400 mt-0.5 max-w-[160px]">سيتم حفظ الحالات السريرية هنا تلقائياً بعد التحليل</span>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[300px] lg:max-h-none flex-1 pr-1">
                {history.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => loadPastRecord(record)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs relative group ${
                      selectedHistoryId === record.id 
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' 
                        : 'border-slate-150 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{record.fileNo}</span>
                      <button
                        onClick={(e) => removeRecord(record.id, e)}
                        className="text-slate-300 hover:text-red-600 p-0.5 rounded transition-colors"
                        title="حذف هذه الحالة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-bold text-slate-800 mt-1">{record.name}</div>
                    <div className="text-[10px] text-slate-450 mt-1 flex justify-between items-center">
                      <span>العمر: {record.age} سنة • {record.weight}كجم</span>
                      <span className="bg-white/80 border border-slate-200 px-1 py-0.5 rounded text-[9px] font-mono">{record.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* INPUT FORM CONTENT (9 COLUMNS IF NO REPORT, SPLIT IF REPORT EXISTS) */}
        <div className={`col-span-1 lg:col-span-9 grid grid-cols-1 ${reportText ? 'xl:grid-cols-12' : ''} gap-6`}>
          
          {/* Main Clinical Editor Forms */}
          <div className={`${reportText ? 'xl:col-span-5' : 'w-full'} flex flex-col gap-6`}>
            
            {/* 1. Basic Bio inputs card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                <span>المعلومات الأساسية للمريض</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono text-[10px]">BIO METRICS</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">العمر (سنة)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl px-3 py-2 font-mono text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-center"
                      placeholder="العمر"
                      min="1"
                      max="125"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] text-slate-400">سنة</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الوزن (كجم)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl px-3 py-2 font-mono text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-center"
                      placeholder="الوزن"
                      min="1"
                      max="400"
                    />
                    <span className="absolute bottom-1 right-0.5 text-[8px] text-slate-400">كجم</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الطول (سم)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl px-3 py-2 font-mono text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-center"
                      placeholder="الطول"
                      min="30"
                      max="250"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] text-slate-400">سم</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vital signs card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                  <span>العلامات الحيوية المستهدفة</span>
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-mono text-[10px]">VITALS</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 ">ضغط الدم الشرياني (mmHg)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          value={systolicBp} 
                          onChange={(e) => setSystolicBp(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-250 focus:border-blue-600 rounded-xl py-2 font-mono text-lg text-center font-black text-red-650 focus:outline-none focus:ring-2 focus:ring-red-100"
                          placeholder="الإنقباضي"
                        />
                        <span className="absolute top-0.5 right-1.5 text-[8px] font-bold text-slate-400 uppercase">SYS</span>
                      </div>
                      <span className="text-slate-400 font-bold">/</span>
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          value={diastolicBp} 
                          onChange={(e) => setDiastolicBp(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-250 focus:border-blue-600 rounded-xl py-2 font-mono text-lg text-center font-black text-red-650 focus:outline-none focus:ring-2 focus:ring-red-100"
                          placeholder="الانبساطي"
                        />
                        <span className="absolute top-0.5 right-1.5 text-[8px] font-bold text-slate-400 uppercase">DIA</span>
                      </div>
                    </div>
                    {/* Live Blood Pressure Rating alert banner */}
                    <div className={`mt-2 p-2 rounded-lg text-[11px] font-semibold border ${bpAssessment.colorClass} transition-all duration-300`}>
                      * تقييم الضغط النبضي: {bpAssessment.label}
                    </div>
                  </div>

                  {/* BMI Widget */}
                  <div className="pt-2">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">مؤشر كتلة الجسم الحسابي (BMI)</div>
                        <div className="text-3xl font-extrabold text-blue-900 mt-1 leading-none">{bmi > 0 ? bmi : '...'}</div>
                        <div className="text-[10px] text-blue-700 font-bold mt-1.5 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{bmiCategory}</span>
                        </div>
                      </div>
                      
                      {/* Interactive Visual Scale Gauge */}
                      <div className="w-24 h-11 bg-white/60 border border-blue-200 rounded-lg p-1.5 flex flex-col justify-between">
                        <span className="text-[8px] text-blue-500 font-medium text-center">النطاق السريري للـ BMI</span>
                        <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden flex">
                          <div className="bg-amber-300 w-1/4" title="نحافة" />
                          <div className="bg-emerald-500 w-2/4" title="مثالي" />
                          <div className="bg-amber-500 w-1/4" title="زيادة وزن" />
                          <div className="bg-red-500 w-1/4" title="سمنة" />
                        </div>
                        {/* Dot indicator position */}
                        <div className="w-full relative h-1.5">
                          <div 
                            className="absolute bg-blue-800 w-2 h-2 rounded-full -top-1"
                            style={{ 
                              left: bmi <= 0 ? '50%' : `${Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))}%` 
                            }} 
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Control Buttons Container */}
              <div className="pt-4 grid grid-cols-2 gap-2 mt-4">
                <button 
                  onClick={handleClear}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  تفريغ حقول النموذج
                </button>
                <div className="text-center flex items-center justify-center text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 ml-1" />
                  التحديث: الآن
                </div>
              </div>

            </div>

          </div>

          {/* HISTORIES & INPUT FIELDS TEXTAREAS */}
          <div className={`${reportText ? 'xl:col-span-7' : 'w-full'} flex flex-col gap-6`}>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col h-full">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                <span>الوقائع الطبية والعقاقير الصيدلانية</span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono text-[10px]">HISTORIES & DRUGS</span>
              </h3>
              
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex flex-col flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">الأمراض المزمنة والتاريخ المرضي والتحسسي</label>
                  <textarea 
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="مثال: داء السكري، ربو شعبي، حساسية السلفا، قصور كبدي خفيف..."
                    className="w-full flex-1 min-h-[100px] max-h-[180px] bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl p-3.5 text-slate-800 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">قائمة الأدوية الحالية والجرعات بالتفصيل (مفصولة بفاصلة)</label>
                  <textarea 
                    value={currentMeds}
                    onChange={(e) => setCurrentMeds(e.target.value)}
                    placeholder="مثال: Metformin 500mg, Lisinopril 10mg, Aspirin 81mg..."
                    className="w-full flex-1 min-h-[120px] max-h-[200px] bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl p-3.5 text-slate-800 text-sm leading-relaxed font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 mr-1">
                    * يفضل كتابة الأدوية بالاسم العلمي لضمان أقصى درجات الدقة في رصد التدخلات الدوائية.
                  </p>
                </div>
              </div>

              {/* ACTION EXECUTION PANEL AND RUN-ANALYSIS ACTION BUTTON */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Workflow className="w-4 h-4 text-slate-405" />
                  <span>محرك التحليل الاستشاري: Gemini Flash-Lite v3.5</span>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:shadow-blue-300 active:scale-95 flex items-center justify-center gap-2 ${
                    isAnalyzing ? 'opacity-80 cursor-wait' : ''
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>تحليل الخطة العلاجية إلكترونياً</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ERROR MESSAGE TOAST BANNER */}
      {errorMessage && (
        <div className="mx-6 md:mx-12 my-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 shadow-sm" id="error_toast">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">خطأ في معالجة الطلب</div>
            <div className="text-xs text-red-700 mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* DETAILED INTERACTIVE ANALYSIS RESULTS PANEL (IF LOADING OR TEXT COMPLETED) */}
      {(isAnalyzing || reportText) && (
        <section className="mx-4 md:mx-6 lg:mx-8 mb-8 mt-2 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden" id="report_render_panel">
          
          {/* Output Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="font-black text-sm md:text-md uppercase tracking-wide flex items-center gap-1.5 text-slate-100">
                  <Plus className="w-4.5 h-4.5 text-blue-400" />
                  تقرير التحليل ودعم القرار السريري الصادر
                </h3>
                <p className="text-[10px] text-slate-400">مبني على الدلائل العلاجية بالتعاون مع المساعد الذكي</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {reportText && (
                <>
                  <button 
                    onClick={handleCopyReport}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    title="نسخ التقرير إلى الحافظة"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    نسخ النص
                  </button>
                  <button 
                    onClick={handlePrintReport}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    title="طباعة التقرير الطبي"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    تحضير للطباعة (PDF)
                  </button>
                </>
              )}
              {isAnalyzing && (
                <span className="text-xs text-blue-300 font-mono animate-pulse">
                  جارِ التحليل المباشر الآن...
                </span>
              )}
            </div>
          </div>

          {/* Report Internal Container */}
          <div className="p-6 md:p-8">
            
            {/* Loading Skeleton block */}
            {isAnalyzing && (
              <div className="py-8 flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                <div className="relative mb-4">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                  <Heart className="w-5 h-5 text-red-500 absolute top-3.5 right-3.5" />
                </div>
                
                <h4 className="text-xs font-bold text-slate-700">تحليل الخطة العلاجية جارٍ بنجاح</h4>
                
                {/* Dynamically rotating messaging queue to make the loading smooth */}
                <div className="mt-2 h-10 overflow-hidden text-xs text-blue-600 font-medium transition-all">
                  <p className="animate-bounce">{loadingMessages[loadingStep]}</p>
                </div>
                
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-1000"
                    style={{ width: `${(loadingStep + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}

            {/* Markdown Clinical presentation content text */}
            {reportText && (
              <div className="prose max-w-none text-slate-900 border border-slate-150 p-6 md:p-8 rounded-xl bg-slate-50/50">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-slate-200">
                  <div>
                    <span className="text-xs text-slate-450 uppercase">المريض المستهدف</span>
                    <h5 className="font-extrabold text-md text-slate-800">{patientName || 'مريض مجهول الاسم'}</h5>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-slate-455 block">تاريخ إصدار الفحص</span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Formatted report display area */}
                <div className="space-y-4">
                  {renderMarkdown(reportText)}
                </div>

                {/* Warning note sign off */}
                <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-950 block mb-0.5">تنويه استشاري هام للقرار السريري:</strong>
                    هذا التقرير هو فحص أوتوماتيكي مساعد استرشادي لدعم القرار الطبي السريري ولا يحمل صفة التشخيص المستقل. 
                    يجب على مقدم الرعاية الصحية المرخص تقييم الحالة السريرية الكاملة وتخصيص الجرعات الدوائية بناءً على معطيات الفحص المباشر للمريض والعمليات المخبرية المتكاملة.
                  </div>
                </div>
              </div>
            )}

          </div>

        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-800 text-slate-400 px-6 py-4 text-xs flex flex-col md:flex-row justify-between items-center gap-3 shrink-0 mt-auto border-t border-slate-700">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>نظام القرار السريري والاستشاري الذكي Gemini AI v2.4</span>
        </div>
        
        <div className="flex gap-4 md:gap-6 uppercase tracking-wider font-semibold">
          <a href="#clinica_app" className="hover:text-white transition-colors">الدعم الطبي السريع</a>
          <span>•</span>
          <a href="#clinica_app" className="hover:text-white transition-colors">سرية وحماية بيانات المرضى Hipaa</a>
          <span>•</span>
          <a href="#clinica_app" className="hover:text-white transition-colors">سجل العمليات السريرية</a>
        </div>
      </footer>
    </div>
  );
}
