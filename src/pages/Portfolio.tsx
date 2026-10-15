import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ════════════════════════════════════════════════════════════════════════════
   بيانات التواصل
   ════════════════════════════════════════════════════════════════════════════ */

const WHATSAPP_DISPLAY = '01208955733';
const WHATSAPP_INTL = '201208955733'; // 20 = مصر + الرقم بدون الصفر
const WHATSAPP_TEXT = 'مرحباً، أرغب في الاطلاع على عرض توضيحي (ديمو) لنظام الربط مع هيئة الزكاة والضريبة والجمارك.';
const whatsappHref = `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

/* ════════════════════════════════════════════════════════════════════════════
   صور المشروع الحقيقي
   الأولوية: لو الصور داخل  src/example/  بيقراها الكود لوحده.
   لو مش موجودة هناك، بيجيبها من public حسب PUBLIC_DIR والأسماء تحت.
   ════════════════════════════════════════════════════════════════════════════ */

const PUBLIC_DIR = '/example'; // لو الصور في جذر public مباشرة خليها ''

const publicFiles = [
  'Screenshot 2026-10-15 190631.png',
  'Screenshot 2026-10-15 190710.png',
  'Screenshot 2026-10-15 190728.png',
  'Screenshot 2026-10-15 190758.png',
  'Screenshot 2026-10-15 190827.png',
  'Screenshot 2026-10-15 190946.png',
];

// عناوين الشاشات (المفتاح = اسم الملف بدون .png). عدّل الباقي حسب شاشاتك
const exampleTitles: Record<string, string> = {
  'Screenshot 2026-10-15 190631': 'تسجيل الدخول',
  // 'Screenshot 2026-10-15 190710': 'اسم الشاشة',
};

const exampleModules = import.meta.glob('./example/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const rawExamples = Object.keys(exampleModules).length
  ? Object.entries(exampleModules)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([path, src]) => ({ name: path.split('/').pop()!.replace(/\.[^.]+$/, ''), src }))
  : publicFiles.map((f) => ({ name: f.replace(/\.[^.]+$/, ''), src: `${PUBLIC_DIR}/${encodeURIComponent(f)}` }));

const examples = rawExamples.map((e, i) => ({ src: e.src, title: exampleTitles[e.name] ?? `شاشة ${i + 1} من النظام` }));

/* ════════════════════════════════════════════════════════════════════════════
   أيقونات SVG (بدون إيموجي)
   ════════════════════════════════════════════════════════════════════════════ */

const iconPaths: Record<string, string> = {
  receipt: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2z M9 7h6 M9 11h6 M9 15h4',
  device: 'M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z M11 18h2',
  card: 'M3 6h18v12H3z M3 10h18 M7 15h3',
  chart: 'M4 20V10 M10 20V4 M16 20v-7 M2 20h20',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1 M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  check: 'M5 12l5 5L20 7',
  close: 'M6 6l12 12M18 6L6 18',
  chevron: 'M15 6l-6 6 6 6',
  arrow: 'M7 17L17 7M8 7h9v9',
  bulb: 'M9 18h6 M10 21h4 M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z',
  list: 'M9 4h6v3H9z M7 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-1 M9 12h6 M9 16h4',
  play: 'M6 4l14 8-14 8V4z',
  store: 'M3 9l1-5h16l1 5 M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0 M5 12v8h14v-8 M10 20v-5h4v5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z M9 12l2 2 4-4',
};

const Icon: React.FC<{ name: keyof typeof iconPaths; className?: string }> = ({ name, className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={iconPaths[name]} />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════════════════
   مسار التسجيل في هيئة الزكاة والضريبة والجمارك (الفوترة الإلكترونية)
   ════════════════════════════════════════════════════════════════════════════ */

interface PathStep {
  id: string;
  title: string;
  summary: string;
  needs: string[];
  actions: string[];
  tip: string;
  link?: { label: string; href: string };
}

const pathSteps: PathStep[] = [
  {
    id: 'register',
    title: 'تسجيل المنشأة لدى الهيئة',
    summary: 'قبل أي ربط تقني، يجب أن تكون المنشأة مسجلة لدى الهيئة ولها رقم ضريبي.',
    needs: ['السجل التجاري', 'بيانات المنشأة والعنوان الوطني', 'هوية صاحب المنشأة أو المفوّض عنها'],
    actions: [
      'الدخول إلى بوابة هيئة الزكاة والضريبة والجمارك.',
      'تسجيل المنشأة في ضريبة القيمة المضافة (والزكاة بحسب نوع المنشأة).',
      'استلام الرقم الضريبي المكوّن من 15 رقماً.',
    ],
    tip: 'الرقم الضريبي هو أساس كل الخطوات التالية، لذا تأكد من تطابق بيانات المنشأة مع السجل التجاري.',
    link: { label: 'بوابة الهيئة', href: 'https://zatca.gov.sa' },
  },
  {
    id: 'otp',
    title: 'استخراج رمز OTP من بوابة فاتورة',
    summary: 'رمز تحقق يربط منشأتك بالنظام الذي سيصدر الفواتير.',
    needs: ['الرقم الضريبي أو البريد الإلكتروني المسجل', 'حساب نشط في بوابة فاتورة'],
    actions: [
      'تسجيل الدخول إلى بوابة فاتورة بالرقم الضريبي أو البريد المسجل.',
      'فتح تبويب التأهيل (Onboarding) واختيار تأهيل وحدة إصدار فواتير.',
      'نسخ رمز OTP الذي يظهر على الشاشة.',
    ],
    tip: 'الرمز صالح لمدة ساعة تقريباً ولا يمكن توليده إلا من البوابة، فاستخرجه قبل الاستخدام مباشرة.',
    link: { label: 'بوابة فاتورة', href: 'https://fatoora.zatca.gov.sa' },
  },
  {
    id: 'csr',
    title: 'إنشاء CSR والحصول على شهادة الامتثال',
    summary: 'يولّد النظام طلب شهادة (CSR) ويرسله مع رمز OTP للحصول على شهادة الامتثال.',
    needs: ['رمز OTP من الخطوة السابقة', 'بيانات المنشأة والوحدة (الرقم الضريبي، الاسم، الرقم التسلسلي)'],
    actions: [
      'إنشاء طلب الشهادة (CSR) مع مفتاح خاص يُحفظ بأمان.',
      'إرسال الطلب مع رمز OTP إلى واجهة الامتثال لدى الهيئة.',
      'استلام شهادة الامتثال (Compliance CSID) وبيانات الدخول الخاصة بها.',
    ],
    tip: 'يجب تخزين المفتاح الخاص وبيانات الشهادة بشكل آمن، فهي التي توقّع بها الفواتير.',
  },
  {
    id: 'compliance',
    title: 'فحص الامتثال',
    summary: 'إرسال فواتير تجريبية للتأكد من أن النظام ينتج مستندات سليمة قبل الإصدار الفعلي.',
    needs: ['شهادة الامتثال', 'نماذج فواتير بصيغة XML موقّعة'],
    actions: [
      'إرسال فاتورة ضريبية وفاتورة مبسطة.',
      'إرسال إشعار دائن وإشعار مدين لكل نوع منهما.',
      'التأكد من قبول الهيئة للأنواع الستة جميعها دون أخطاء.',
    ],
    tip: 'نقص أي نوع يؤدي إلى رفض طلب شهادة الإنتاج. يُنصح بالتجربة أولاً في بيئة المحاكاة.',
  },
  {
    id: 'production',
    title: 'شهادة الإنتاج (Production CSID)',
    summary: 'بعد نجاح الفحص تُستبدل شهادة الامتثال بشهادة الإنتاج الرسمية.',
    needs: ['اجتياز جميع فحوصات الامتثال', 'معرّف طلب الامتثال'],
    actions: [
      'طلب شهادة الإنتاج باستخدام معرّف طلب الامتثال (دون رمز OTP جديد).',
      'استلام الشهادة وبيانات دخولها وحفظها.',
      'تسجيل تاريخ انتهاء الشهادة لتجديدها قبل موعده.',
    ],
    tip: 'الشهادة صالحة لمدة سنة تقريباً ولكل وحدة شهادتها الخاصة. جدّدها قبل الانتهاء حتى لا يتوقف الإصدار.',
  },
  {
    id: 'live',
    title: 'الإصدار والإرسال للهيئة',
    summary: 'من هنا تُوقَّع كل فاتورة وتُرسل للهيئة بحسب نوعها.',
    needs: ['شهادة الإنتاج', 'فاتورة XML موقّعة ومرفقة برمز QR'],
    actions: [
      'الفاتورة الضريبية (للأعمال) تُرسل للهيئة للاعتماد قبل تسليمها للعميل.',
      'الفاتورة المبسطة (للأفراد) تُصدر للعميل ثم يُبلَّغ عنها للهيئة خلال 24 ساعة.',
      'تُحفظ الفاتورة مع رمز QR وتُرسل للعميل مع إشعار الدفع.',
    ],
    tip: 'الزكاة تُقدَّم بإقرار سنوي منفصل من حساب المنشأة في بوابة الهيئة، وهي مستقلة عن الفوترة الإلكترونية.',
    link: { label: 'دليل الفوترة الإلكترونية', href: 'https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx' },
  },
];

/* ════════════════════════════════════════════════════════════════════════════
   محتوى عام
   ════════════════════════════════════════════════════════════════════════════ */

const navLinks = [
  { href: '#features', label: 'المميزات' },
  { href: '#examples', label: 'أمثلة من المشروع' },
  { href: '#path', label: 'مسار التسجيل' },
  { href: '#how', label: 'كيف يعمل' },
];

const howSteps = [
  { title: 'استقبال بيانات الطلب', description: 'يستقبل النظام الطلب من مشروعك ويجلب نسب الزكاة والضريبة المعتمدة.' },
  { title: 'الحساب التلقائي', description: 'تُحتسب الزكاة (2.5%) وضريبة القيمة المضافة (15%) فوراً دون تدخل يدوي.' },
  { title: 'الفاتورة والإرسال', description: 'تُصدر فاتورة إلكترونية برمز QR وتُرسل للهيئة وللعميل.' },
];

const ease = [0.22, 1, 0.36, 1] as const;

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.12, duration: 0.7, ease } }),
};

/* ─── Preloader ────────────────────────────────────────────────────────────── */

const Preloader: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // انتظر 2.2 ثانية (شريط التحميل = 1.6s delay 0.5s) ثم ابدأ exit
    const t = setTimeout(() => {
      const el = ref.current;
      if (!el) { onDone(); return; }
      el.classList.add('preloader-exit');
      el.addEventListener('animationend', onDone, { once: true });
    }, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div ref={ref} className="preloader" aria-label="جاري التحميل" role="status">
      <div className="preloader-glow" aria-hidden="true" />
      <img
        src="/logob.png"
        alt="Zackpocket"
        width={88}
        height={88}
        className="preloader-logo rounded-2xl object-contain"
      />
      <span className="preloader-name">Zackpocket</span>
      <div className="preloader-bar-wrap" aria-hidden="true">
        <div className="preloader-bar" />
      </div>
    </div>
  );
};

/* ─── Navbar ───────────────────────────────────────────────────────────────── */


const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? 'navbar-blur py-2' : 'bg-transparent py-4'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="التنقل الرئيسي">
        <a href="#top" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src="/logob.png" alt="Zackpocket" className="h-10 w-10 rounded-xl object-contain lg:h-11 lg:w-11" />
          <span className="text-lg font-extrabold tracking-tight text-white lg:text-xl">Zackpocket</span>
        </a>

        <ul className="hidden list-none items-center gap-8 !p-0 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link text-sm font-semibold text-white/85 transition-colors hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href={whatsappHref} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full bg-zp-teal px-5 py-2.5 text-sm font-bold text-zp-dark transition hover:bg-white lg:inline-flex">
          <WhatsAppIcon className="h-4 w-4" />
          واتساب
        </a>

        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white lg:hidden"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-1.5'}`} />
          <span className={`absolute h-0.5 w-5 bg-current transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-1.5'}`} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div className="lg:hidden" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease }}>
            <ul className="flex list-none flex-col gap-1 px-5 pb-6 pt-4 !ps-5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-lg font-bold text-white/90 transition hover:bg-white/10">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-3">
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-zp-teal px-4 py-3 text-lg font-bold text-zp-dark">
                  <WhatsAppIcon />
                  تواصل عبر واتساب
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

/* ─── Hero ─────────────────────────────────────────────────────────────────── */

const heroDesktop = encodeURI('/Zackpocket Arabic Dashboard Mockup.png');
const heroMobile = encodeURI('/Zackpocket Financial Dashboard Mockup.png');

const Hero: React.FC = () => (
  <section id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-zp-dark">
    <picture>
      <source media="(min-width: 768px)" srcSet={heroDesktop} />
      <img
        src={heroMobile}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover blur-[3px]"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/logob.png';
        }}
      />
    </picture>
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zp-dark/80 via-zp-dark/65 to-zp-dark/90" />
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(26,122,74,0.45),transparent_70%)]" />

    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-32 text-center lg:px-8 lg:pt-36">
      <motion.h1 className="text-4xl font-black leading-[1.3] text-white sm:text-5xl md:text-6xl" variants={heroItem} initial="hidden" animate="visible">
        اربط مشروعك التجاري بهيئة الزكاة والضريبة
        <br className="hidden sm:block" /> من أول فاتورة
      </motion.h1>
      <motion.p className="mx-auto mt-6 max-w-2xl text-base leading-9 text-white/85 md:text-xl" variants={heroItem} custom={1} initial="hidden" animate="visible">
        نظام يستقبل مبيعاتك، يحسب الزكاة والضريبة، ويصدر الفاتورة الإلكترونية ويرسلها إلى ZATCA تلقائياً، لتتفرغ أنت لتنمية عملك.
      </motion.p>
      <motion.div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4" variants={heroItem} custom={2} initial="hidden" animate="visible">
        <a href="#examples" className="rounded-full bg-zp-teal px-7 py-3.5 font-bold text-zp-dark shadow-lg shadow-zp-teal/20 transition hover:-translate-y-0.5 hover:bg-white">
          شاهد النظام وهو يعمل
        </a>
        <a href="#path" className="glass-strong rounded-full px-7 py-3.5 font-bold text-white transition hover:bg-white/20">
          كيف تسجّل منشأتك في الهيئة
        </a>
      </motion.div>
      <motion.ul className="mt-12 flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-3 !ps-0 text-sm font-semibold text-white/80" variants={heroItem} custom={3} initial="hidden" animate="visible">
        {['حساب تلقائي للزكاة والضريبة', 'فواتير إلكترونية برمز QR', 'ربط مباشر مع منصة فاتورة'].map((x) => (
          <li key={x} className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-zp-teal" />
            {x}
          </li>
        ))}
      </motion.ul>
    </div>
  </section>
);

/* ─── Features: حركة قوية ─────────────────────────────────────────────────── */

interface FeatureItem {
  title: string;
  description: string;
  icon: keyof typeof iconPaths;
  span: string;
  featured?: boolean;
  wide?: boolean;
}

const features: FeatureItem[] = [
  {
    title: 'يربط أي مشروع تجاري',
    description: 'متجر إلكتروني أو برنامج محاسبة أو نقاط بيع. يتصل النظام بما تستخدمه حالياً دون أن تغيّر طريقة عملك.',
    icon: 'link',
    span: 'sm:col-span-2 lg:col-span-4',
    featured: true,
  },
  { title: 'حساب الزكاة والضريبة', description: 'احتساب تلقائي وفق قواعد هيئة الزكاة والضريبة والجمارك.', icon: 'receipt', span: 'lg:col-span-2' },
  { title: 'فواتير إلكترونية متوافقة', description: 'فواتير PDF برمز QR وفق اشتراطات الفوترة الإلكترونية السعودية.', icon: 'card', span: 'lg:col-span-2' },
  { title: 'لوحة تحكم تحليلية', description: 'تابع المبيعات والضرائب والأرباح لحظياً من لوحة واضحة.', icon: 'chart', span: 'lg:col-span-2' },
  { title: 'يعمل على كل الأجهزة', description: 'واجهة متجاوبة للهاتف والتابلت والكمبيوتر دون فقدان أي وظيفة.', icon: 'device', span: 'lg:col-span-2' },
  {
    title: 'إعداد سريع',
    description: 'من الربط إلى الإطلاق في مسار واضح، نتولى فيه الجانب التقني كاملاً.',
    icon: 'bolt',
    span: 'sm:col-span-2 lg:col-span-6',
    wide: true,
  },
];

/** أيقونة بترسم نفسها لما تظهر على الشاشة */
const DrawIcon: React.FC<{ name: keyof typeof iconPaths; className?: string; delay?: number }> = ({ name, className = 'h-6 w-6', delay = 0 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <motion.path d={iconPaths[name]} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay, ease: 'easeInOut' }} />
  </svg>
);

/** عنوان تظهر كلماته واحدة تلو الأخرى */
const RevealText: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <h2 className={className} aria-label={text}>
    {text.split(' ').map((w, i) => (
      <React.Fragment key={i}>
        <span className="inline-block overflow-hidden py-1 align-bottom leading-[1.5]" aria-hidden="true">
          <motion.span className="inline-block" initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.09, ease }}>
            {w}
          </motion.span>
        </span>{' '}
      </React.Fragment>
    ))}
  </h2>
);

/* ─── مخطط الربط: مشروعك ← النظام ← الهيئة ─── */

const FlowNode: React.FC<{ icon: keyof typeof iconPaths; title: string; caption: string; highlight?: boolean; delay?: number }> = ({ icon, title, caption, highlight, delay = 0 }) => (
  <motion.div
    className="relative flex w-full max-w-[15rem] flex-col items-center text-center md:w-52"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 160, damping: 16, delay }}
  >
    <span
      className={`relative flex h-20 w-20 items-center justify-center rounded-3xl border text-white backdrop-blur ${
        highlight ? 'pulse-ring border-zp-teal bg-zp-green shadow-lg shadow-zp-teal/30' : 'border-white/20 bg-white/10'
      }`}
    >
      <DrawIcon name={icon} className="h-9 w-9" delay={delay + 0.2} />
    </span>
    <p className="mt-4 text-lg font-extrabold text-white">{title}</p>
    <p className="mt-1 text-sm text-white/60">{caption}</p>
  </motion.div>
);

const FlowLink: React.FC<{ label: string; delay?: number }> = ({ label, delay = 0 }) => (
  <div className="flex flex-1 items-center justify-center py-1 md:px-3 md:py-0">
    <div className="relative h-14 w-px bg-gradient-to-b from-white/10 via-white/35 to-white/10 md:h-px md:w-full md:bg-gradient-to-l">
      <span className="flow-dot" style={{ animationDelay: `${delay}s` }} />
      <span className="flow-dot" style={{ animationDelay: `${delay + 1.2}s` }} />
      <span className="absolute start-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-white/60 md:start-auto md:bottom-full md:left-1/2 md:top-auto md:mb-3 md:-translate-x-1/2 md:translate-y-0">
        {label}
      </span>
    </div>
  </div>
);

const FlowDiagram: React.FC = () => (
  <motion.div
    className="hero-bg relative mb-14 overflow-hidden rounded-[2rem] border border-white/10 px-5 py-10 shadow-2xl shadow-zp-green/20 md:px-12 md:py-16"
    initial={{ opacity: 0, y: 50, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.9, ease }}
  >
    <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-zp-teal/20 blur-3xl" aria-hidden="true" />
    <div className="relative flex flex-col items-center md:flex-row md:justify-between">
      <FlowNode icon="store" title="مشروعك التجاري" caption="متجر أو محاسبة أو نقاط بيع" delay={0.1} />
      <FlowLink label="طلبات ومبيعات" delay={0} />
      <FlowNode icon="bolt" title="Zackpocket" caption="حساب وتوقيع وإرسال" highlight delay={0.3} />
      <FlowLink label="فواتير موقّعة برمز QR" delay={0.6} />
      <FlowNode icon="shield" title="هيئة الزكاة والضريبة" caption="ZATCA" delay={0.5} />
    </div>
    <p className="relative mt-10 text-center text-sm text-white/65">كل عملية تُحسب وتُوقَّع وتُرسل تلقائياً، دون إدخال يدوي.</p>
  </motion.div>
);

/* ─── كارت ميزة: spotlight + ميلان ثلاثي الأبعاد ─── */

const FeatureCard: React.FC<{ f: FeatureItem; index: number }> = ({ f, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 180, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px - 0.5);
    my.set(py - 0.5);
    el.style.setProperty('--sx', `${px * 100}%`);
    el.style.setProperty('--sy', `${py * 100}%`);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      className={f.span}
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.12, ease }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative h-full overflow-hidden rounded-3xl border border-zp-green/15 bg-white p-7 shadow-sm transition-shadow duration-500 hover:border-zp-teal/50 hover:shadow-2xl hover:shadow-zp-green/20 md:p-8"
      >
        {/* بقعة الضوء اللي بتتبع الماوس */}
        <span className="feature-spot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
        {/* أيقونة كبيرة باهتة في الخلفية */}
        <Icon name={f.icon} className="pointer-events-none absolute -bottom-8 -end-8 h-44 w-44 text-zp-green/[0.06] transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110" />

        <div className="relative">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zp-green text-white shadow-lg shadow-zp-green/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <DrawIcon name={f.icon} className="h-7 w-7" delay={0.3 + index * 0.1} />
          </span>
          <h3 className={`mt-5 font-extrabold text-zp-dark ${f.featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{f.title}</h3>
          <p className={`mt-2 leading-8 text-gray-600 ${f.featured ? 'max-w-xl text-base md:text-lg' : 'text-sm'}`}>{f.description}</p>

          {f.wide && (
            <div className="mt-6">
              <div className="h-2 overflow-hidden rounded-full bg-zp-green/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-zp-teal to-zp-green"
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 0.4, ease: 'easeInOut' }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm font-bold text-zp-dark">
                <span>الربط</span>
                <span>الاختبار</span>
                <span>الإطلاق</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Features: React.FC = () => (
  <section id="features" className="scroll-mt-20 overflow-hidden px-5 py-20 lg:px-8 lg:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <RevealText text="ما الذي يقدّمه النظام" className="text-3xl font-extrabold text-zp-dark md:text-5xl" />
        <motion.p
          className="mt-4 text-gray-600 md:text-lg"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5, ease }}
        >
          نظام واحد يصل مشروعك بالهيئة، ويتولى الحساب والفوترة والإرسال نيابةً عنك.
        </motion.p>
      </div>

      <FlowDiagram />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {features.map((f, i) => (
          <FeatureCard key={f.title} f={f} index={i} />
        ))}
      </div>
    </div>
  </section>
);

/* ─── كروت طويلة زجاجية ────────────────────────────────────────────────────── */

const CardDeck: React.FC<{ onOpen: (i: number) => void }> = ({ onOpen }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const mid = (examples.length - 1) / 2;
  const overlap = examples.length > 4 ? 'lg:-ms-16' : 'lg:-ms-12';

  if (examples.length === 0) {
    return <p className="rounded-3xl border border-dashed border-white/30 p-10 text-center text-white/70">لا توجد صور في المجلد حالياً.</p>;
  }

  return (
    <div className="lg:-me-6 xl:-me-16">
      {/* الكونتينر: أفقي scroll على الموبايل، flex عادي على الـ lg+ */}
      <div className="-mx-5 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-5 py-10 sm:gap-4 sm:px-8 lg:mx-0 lg:justify-center lg:gap-0 lg:overflow-visible lg:px-0 lg:py-12">
        {examples.map((ex, i) => {
          const dimmed = hovered !== null && hovered !== i;
          return (
            <motion.button
              key={ex.src}
              type="button"
              aria-label={`تكبير: ${ex.title}`}
              onClick={() => onOpen(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.7, ease }}
              /* موبايل: عرض ثابت ومناسب | lg: مرن مع تداخل */
              className={`group/card relative aspect-[9/17] w-40 shrink-0 cursor-zoom-in snap-center xs:w-44 sm:w-52 lg:min-w-0 lg:max-w-[17rem] lg:shrink lg:flex-1 lg:w-auto ${i > 0 ? overlap : ''}`}
              style={{ zIndex: hovered === i ? 30 : 10 }}
            >
              <motion.span
                className="glass-card absolute inset-0 block rounded-[1.9rem] p-1.5"
                style={{ rotate: (i - mid) * 3.5 }}
                animate={{ opacity: dimmed ? 0.55 : 1, scale: dimmed ? 0.96 : 1 }}
                whileHover={{ y: -32, rotate: 0, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <span className="relative block h-full w-full overflow-hidden rounded-[1.5rem] bg-zp-dark">
                  {/* الصورة بتتحرك أفقياً عند الهوفر لتظهر كلها */}
                  <img
                    src={ex.src}
                    alt={ex.title}
                    loading="lazy"
                    className="card-pan h-full w-full object-cover [object-position:0%_0%] [transition:object-position_2.6s_ease-in-out] group-hover/card:[object-position:100%_0%]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover/card:opacity-100" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-zp-dark/90 to-transparent p-3 pt-10 text-center text-xs font-bold text-white transition-transform duration-500 group-hover/card:translate-y-0 [@media(hover:none)]:translate-y-0">
                    {ex.title}
                  </span>
                </span>
              </motion.span>
            </motion.button>
          );
        })}
      </div>
      <p className="-mt-6 text-center text-xs text-white/50 lg:hidden">اسحب لاستعراض الشاشات، واضغط على أي شاشة لتكبيرها</p>
    </div>
  );
};


/* ─── قائمة المسار ─────────────────────────────────────────────────────────── */

const PathList: React.FC<{ onOpen: (i: number) => void }> = ({ onOpen }) => (
  <ol className="relative mt-6 list-none space-y-3 !ps-0">
    <span aria-hidden="true" className="absolute inset-y-6 start-[2.125rem] w-px bg-gradient-to-b from-zp-teal/60 via-white/15 to-white/5" />
    {pathSteps.map((s, i) => (
      <li key={s.id}>
        <button
          type="button"
          onClick={() => onOpen(i)}
          className="group relative flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 pe-4 text-start backdrop-blur-sm transition duration-300 hover:-translate-x-1 hover:border-zp-teal/50 hover:bg-white/10"
        >
          <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zp-green text-base font-extrabold text-white ring-4 ring-zp-dark transition-colors group-hover:bg-zp-teal group-hover:text-zp-dark">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-white">{s.title}</span>
            <span className="mt-0.5 block truncate text-sm text-white/60">{s.summary}</span>
          </span>
          <Icon name="chevron" className="h-5 w-5 shrink-0 text-white/40 transition group-hover:text-zp-teal" />
        </button>
      </li>
    ))}
  </ol>
);

/* ─── مودال الخطوة: شريط جانبي + محتوى منظم ────────────────────────────────── */

const StepModal: React.FC<{ index: number; onChange: (i: number | null) => void }> = ({ index, onChange }) => {
  const step = pathSteps[index];
  const prev = index > 0 ? index - 1 : null;
  const next = index < pathSteps.length - 1 ? index + 1 : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null);
      if (e.key === 'ArrowLeft' && next !== null) onChange(next);
      if (e.key === 'ArrowRight' && prev !== null) onChange(prev);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onChange]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-zp-dark/80 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onChange(null)}
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
    >
      <motion.div
        className="grid h-[92svh] w-full max-w-4xl grid-rows-[minmax(0,1fr)] overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[min(44rem,88svh)] sm:rounded-3xl md:grid-cols-[17rem_minmax(0,1fr)]"
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.35, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* الشريط الجانبي (شاشات كبيرة) */}
        <aside className="hidden flex-col bg-zp-dark p-6 text-white md:flex">
          <p className="text-sm text-white/60">مسار التسجيل</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">هيئة الزكاة والضريبة والجمارك</h3>
          <ol className="relative mt-6 list-none space-y-1 !ps-0">
            <span aria-hidden="true" className="absolute inset-y-4 start-[1.25rem] w-px bg-white/15" />
            {pathSteps.map((s, i) => {
              const done = i < index;
              const active = i === index;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onChange(i)}
                    aria-current={active ? 'step' : undefined}
                    className={`relative flex w-full items-center gap-3 rounded-xl px-1.5 py-2.5 text-start text-sm transition ${active ? 'bg-white/10 font-bold text-white' : 'text-white/65 hover:text-white'}`}
                  >
                    <span
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-zp-dark ${
                        active ? 'bg-zp-teal text-zp-dark' : done ? 'bg-zp-green text-white' : 'bg-zp-dark text-white/70 outline outline-1 outline-white/25'
                      }`}
                    >
                      {done ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="leading-snug">{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* المحتوى */}
        <div className="flex min-h-0 flex-col">
          <div className="relative border-b border-gray-100 px-6 pb-4 pt-5 sm:px-8">
            <button type="button" aria-label="إغلاق" onClick={() => onChange(null)} className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200">
              <Icon name="close" className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-zp-green">
              الخطوة {index + 1} من {pathSteps.length}
            </p>
            <div className="mt-3 flex gap-1.5 pe-12" aria-hidden="true">
              {pathSteps.map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= index ? 'bg-zp-green' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <h3 className="text-2xl font-extrabold leading-snug text-zp-dark">{step.title}</h3>
                <p className="mt-2 leading-8 text-gray-600">{step.summary}</p>
              </div>

              {/* ما تحتاجه */}
              <section className="rounded-2xl bg-gray-50 p-5">
                <h4 className="flex items-center gap-2 font-bold text-zp-dark">
                  <Icon name="list" className="h-5 w-5 text-zp-green" />
                  ما تحتاجه
                </h4>
                <ul className="mt-3 list-none space-y-2.5 !ps-0">
                  {step.needs.map((n) => (
                    <li key={n} className="flex items-start gap-2.5 text-gray-700">
                      <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-zp-green" />
                      <span className="leading-7">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* ما ستقوم به */}
              <section>
                <h4 className="flex items-center gap-2 font-bold text-zp-dark">
                  <Icon name="play" className="h-4 w-4 text-zp-green" />
                  ما ستقوم به
                </h4>
                <ol className="relative mt-4 list-none space-y-4 !ps-0">
                  <span aria-hidden="true" className="absolute inset-y-3 start-3 w-px bg-zp-green/20" />
                  {step.actions.map((a, i) => (
                    <li key={a} className="relative flex items-start gap-3.5">
                      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zp-green text-xs font-bold text-white ring-4 ring-white">{i + 1}</span>
                      <span className="leading-7 text-gray-700">{a}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* نصيحة */}
              <aside className="flex gap-3 rounded-2xl border border-zp-green/25 bg-zp-green/5 p-4">
                <Icon name="bulb" className="mt-0.5 h-5 w-5 shrink-0 text-zp-green" />
                <p className="text-sm leading-7 text-zp-dark">
                  <span className="font-bold">نصيحة: </span>
                  {step.tip}
                </p>
              </aside>

              {step.link && (
                <a href={step.link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zp-green/40 px-4 py-2 text-sm font-bold text-zp-green transition hover:bg-zp-green hover:text-white">
                  {step.link.label}
                  <Icon name="arrow" className="h-4 w-4" />
                </a>
              )}
            </motion.div>
          </AnimatePresence>

          {/* التنقل */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
            <button type="button" disabled={prev === null} onClick={() => prev !== null && onChange(prev)} className="rounded-full border border-gray-300 px-5 py-2 text-sm font-bold text-gray-700 transition hover:bg-white disabled:opacity-30">
              السابق
            </button>
            {next !== null ? (
              <button type="button" onClick={() => onChange(next)} className="rounded-full bg-zp-green px-6 py-2 text-sm font-bold text-white transition hover:bg-zp-green-dark">
                الخطوة التالية
              </button>
            ) : (
              <button type="button" onClick={() => onChange(null)} className="rounded-full bg-zp-green px-6 py-2 text-sm font-bold text-white transition hover:bg-zp-green-dark">
                إنهاء
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── سكشن المشروع ─────────────────────────────────────────────────────────── */

const Project: React.FC = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <section id="examples" className="hero-bg relative scroll-mt-20 overflow-hidden px-5 py-20 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute -start-32 top-20 h-96 w-96 rounded-full bg-zp-teal/15 blur-3xl" aria-hidden="true" />

      {/* على الموبايل: عمود واحد (عنوان ← كروت ← مسار)   |   lg+: شبكة عمودين */}
      <div className="relative mx-auto flex max-w-[88rem] flex-col gap-8 lg:grid lg:grid-cols-[5fr_6fr] lg:gap-x-12 lg:gap-y-0">
        {/* المقدمة — أعلى الموبايل | يمين السطح */}
        <motion.div className="lg:col-start-1 lg:row-start-1 lg:self-end" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease }}>
          <h2 className="text-3xl font-extrabold leading-snug text-white md:text-4xl">من المشروع الحقيقي</h2>
          <p className="mt-4 max-w-lg leading-8 text-white/70">
            شاشات فعلية من النظام أثناء العمل. مرّر المؤشر على أي بطاقة لاستعراض الشاشة، واضغط عليها لتكبيرها.
          </p>
        </motion.div>

        {/* الكروت — في المنتصف على الموبايل | يسار على السطح يمتد صفين */}
        <div className="order-first lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <CardDeck onOpen={setLightbox} />
        </div>

        {/* المسار — أسفل على الموبايل | يمين تحت المقدمة على السطح */}
        <motion.div className="lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-10" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease }}>
          <h3 id="path" className="scroll-mt-28 text-xl font-bold text-white md:text-2xl">
            كيف تسجّل منشأتك في هيئة الزكاة والضريبة
          </h3>
          <p className="mt-2 text-sm text-white/60">ست خطوات من التسجيل إلى أول فاتورة. اضغط على أي خطوة لعرض تفاصيلها.</p>
          <PathList onOpen={setStepIndex} />
        </motion.div>
      </div>


      <AnimatePresence>
        {lightbox !== null && examples[lightbox] && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-zp-dark/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={examples[lightbox].title}
          >
            <div className="flex h-full w-full overflow-auto">
              <motion.img
                src={examples[lightbox].src}
                alt={examples[lightbox].title}
                className="m-auto h-[70svh] w-auto max-w-none rounded-2xl shadow-2xl sm:h-auto sm:max-h-[90svh] sm:max-w-full"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3, ease }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs text-white/60 sm:hidden">اسحب يميناً ويساراً لمشاهدة الشاشة كاملة</p>
            <button type="button" aria-label="إغلاق" onClick={() => setLightbox(null)} className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{stepIndex !== null && <StepModal index={stepIndex} onChange={setStepIndex} />}</AnimatePresence>
    </section>
  );
};

/* ─── كيف يعمل ─────────────────────────────────────────────────────────────── */

const How: React.FC = () => (
  <section id="how" className="scroll-mt-20 px-5 py-20 lg:px-8 lg:py-28">
    <div className="mx-auto max-w-5xl">
      <div className="mx-auto mb-14 max-w-xl text-center">
        <h2 className="text-3xl font-extrabold text-zp-dark md:text-4xl">كيف يعمل النظام داخل مشروعك</h2>
        <p className="mt-4 text-gray-600">من وصول الطلب إلى وصول الفاتورة للهيئة والعميل.</p>
      </div>
      <ol className="relative grid list-none gap-10 !ps-0 md:grid-cols-3 md:gap-8">
        <span aria-hidden="true" className="absolute inset-x-[16%] top-7 hidden h-0.5 bg-gradient-to-l from-zp-green/10 via-zp-green/40 to-zp-green/10 md:block" />
        {howSteps.map((s, i) => (
          <li key={s.title} className="relative flex flex-col items-center text-center">
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-zp-green text-xl font-extrabold text-white ring-8 ring-gray-50">{i + 1}</span>
            <h3 className="mt-5 text-lg font-bold text-zp-dark">{s.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-7 text-gray-600">{s.description}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ─── CTA + Footer ─────────────────────────────────────────────────────────── */

const Cta: React.FC = () => (
  <section id="contact" className="hero-bg scroll-mt-20 px-5 py-20 text-center text-white md:py-24">
    <div className="mx-auto max-w-3xl">
      <h2 className="text-3xl font-extrabold leading-snug md:text-4xl">هل تريد هذا النظام لمشروعك؟</h2>
      <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/75">
        تواصل معي عبر واتساب وسأرسل لك عرضاً توضيحياً (ديمو) للمشروع، ثم نحدد معاً كيف نربط نشاطك التجاري بهيئة الزكاة والضريبة.
      </p>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 font-bold text-zp-dark shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
      >
        <WhatsAppIcon className="h-7 w-7 shrink-0 sm:h-6 sm:w-6" />
        <span className="flex flex-col items-start leading-tight sm:flex-row sm:items-center sm:gap-3">
          <span>أرسل لي على واتساب</span>
          <span dir="ltr" className="text-sm font-extrabold sm:text-lg">{WHATSAPP_DISPLAY}</span>
        </span>
      </a>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="bg-zp-dark px-5 py-10 text-white/60">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
      <div className="flex items-center gap-3">
        <img src="/logob.png" alt="" className="h-9 w-9 rounded-lg object-contain" />
        <div>
          <p className="font-bold text-white">Zackpocket</p>
          <p className="text-sm">ربط المشاريع التجارية بهيئة الزكاة والضريبة والجمارك</p>
        </div>
      </div>
      <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-zp-teal">
        <WhatsAppIcon className="h-5 w-5" />
        <span dir="ltr">{WHATSAPP_DISPLAY}</span>
      </a>
    </div>
    <p className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center text-sm">© {new Date().getFullYear()} Zackpocket. جميع الحقوق محفوظة.</p>
  </footer>
);

/* ─── Page ─────────────────────────────────────────────────────────────────── */

const Portfolio: React.FC = () => {
  const [ready, setReady] = useState(false);
  const handleDone = useCallback(() => setReady(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!ready && <Preloader onDone={handleDone} />}
      </AnimatePresence>
      <motion.div
        className="min-h-screen overflow-x-clip bg-gray-50 font-sans text-gray-900"
        dir="rtl"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Project />
          <How />
          <Cta />
        </main>
        <Footer />
      </motion.div>
    </MotionConfig>
  );
};

export default Portfolio;