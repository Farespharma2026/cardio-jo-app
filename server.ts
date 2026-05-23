import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const app = express();
app.use(express.json());

// تشغيل مفتاح واجهة برمجة تطبيقات Gemini
const apiKey = process.env.GEMINI_API_KEY;

app.post('/api/analyze', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        error: 'مفتاح API الخاص بـ Gemini غير مهيأ. يرجى تهيئته في الإعدادات البيئية للمشروع.'
      });
    }

    const { age, weight, height, systolicBp, diastolicBp, medicalHistory, currentMeds } = req.body;

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `
أنت مساعد طبي استشاري ذكي وخبير في الصيدلة السريرية وتحليل الخطط العلاجية وتحديد التفاعلات الدوائية (Clinical Decision Support System).
قم بتحليل بيانات المريض السريرية التالية تحليلاً متعمقاً ودقيقاً:

المعلومات الأساسية:
- العمر: ${age} سنة
- الوزن: ${weight} كجم
- الطول: ${height || 'غير محدد'} سم
- ضغط الدم الشرياني: ${systolicBp}/${diastolicBp} mmHg
- الأمراض المزمنة والتاريخ الطبي: ${medicalHistory}
- الأدوية الحالية المستعملة: ${currentMeds}

يرجى تزويدي بتقرير تحليل سريري منظم باللغة العربية (صيغة Markdown متناسقة وجميلة) يحتوي على النقاط التالية بدقة:
1. تقييم الحالة العامة والعلامات الحيوية:
   - تصنيف مستوى ضغط الدم (مثلاً: طبيعي، مرتفع طفيف، مرحلة أولى، مرحلة ثانية، إلخ) مع التوضيح العلمي السريري.
   - حساب مؤشر كتلة الجسم (BMI) تلقائياً بناءً على الوزن ${weight} والطول ${height} وتصنيفه والتعليق عليه بوضوح مع نصيحة قصيرة.
2. فحص تفاعلات الأدوية (Drug-Drug Interactions):
   - افحص إن كان هناك تفاعلات خطيرة أو متوسطة أو طفيفة بين الأدوية المذكورة.
   - صنف درجة خطورة التفاعل بوضوح (شديد، متوسط، طفيف، آمن).
   - اشرح الآلية الحيوية للتفاعل إن وجدت ومقدار تأثيرها.
3. توصيات الخطة العلاجية وإرشادات الطبيب (Clinical Recommendations):
   - تعليقات حول كفاءة الخطة الحالية وصلاحية الجرعات المكتوبة إن أمكن.
   - التحشيد والاحتياطات الهامة للمريض (مثلاً: أدوية تؤخذ قبل النوم، أدوية تفضل مع الطعام لتجنب الآثار الجانبية).
   - الفحوصات والتحاليل الدورية الموصى بمتابعتها لهذا المريض (مثل وظائف الكلى CrCl لبعض الأدوية، فحص السكري التراكمي HbA1c، نسبة البوتاسيوم في الدم لبعض مدرات البول أو مثبطات ACE كـ Lisinopril).
4. تنبيهات حمراء (Red Flags):
   - متى يجب على المريض مراجعة الطوارئ أو التواصل الفوري مع الطبيب (الخط الخطر).

اجعل الأسلوب رسمياً، علمياً دقيقاً، ومرتباً بصورة كتل معلوماتية واضحة وجاذبة سهلة القراءة السريعة من قِبل الطبيب أو الممارس الصحي.
`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    res.json({ analysis: result.text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء إجراء التحليل الطبي.' });
  }
});

// إعداد الخادم ومسار الملفات بطريقة صحيحة 100%
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  import('vite').then((viteModule) => {
    viteModule.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Dev] Server is listening on port ${PORT}`);
      });
    });
  });
} else {
  // توجيه الخادم بدقة لمجلد الواجهة الصحيح
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`[Prod] Server is listening on port ${PORT}`);
  });
}
