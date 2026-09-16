(function(){
  "use strict";

  /* ============ الوضع الليلي ============ */
  const themeToggleBtn = document.getElementById('themeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const THEME_KEY = 'omar-chek:theme';

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      sunIcon.style.display = 'block'; moonIcon.style.display = 'none';
    } else {
      document.documentElement.classList.remove('dark');
      sunIcon.style.display = 'none'; moonIcon.style.display = 'block';
    }
  }

  let savedTheme = 'light';
  try { savedTheme = window.localStorage.getItem(THEME_KEY) || 'light'; } catch(e) {}
  if (!window.localStorage.getItem(THEME_KEY) && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { savedTheme = 'dark'; }
  applyTheme(savedTheme === 'dark');

  themeToggleBtn.addEventListener('click', () => {
    const newTheme = !document.documentElement.classList.contains('dark');
    applyTheme(newTheme);
    try { window.localStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light'); } catch(e) {}
  });

  /* ============ خوارزميات تحويل الأرقام ============ */
  
  // 1. العربية (تم حذف "لا غير")
  const arOnes = ['', 'واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'];
  const arTeens = ['عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'];
  const arTens = ['','','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
  // الصيغة العربية الفصيحة الصحيحة عند إضافة "مائة" تُسقط تاء التأنيث المربوطة
  // من العدد قبلها (ثلاثمائة لا "ثلاثةمائة"، تسعمائة لا "تسعةمائة"...). الكود
  // السابق كان يُلصق arOnes[hundred] مباشرة بـ"مائة" فينتج عنه خطأ نحوي متكرر
  // في كل مبلغ تكون خانة مئاته من 3 إلى 9 — وهو خطأ خطير في أداة لتحرير صكوك.
  const arHundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const arScales = [{singular:'ألف', dual:'ألفان', plural:'آلاف'},{singular:'مليون', dual:'مليونان', plural:'ملايين'},{singular:'مليار', dual:'ملياران', plural:'مليارات'}];
  // أعلى رقم تدعمه القوائم أعلاه بأمان (حتى مليارات فقط). أي رقم أكبر كان سابقًا
  // يُفقد اسم الشريحة بصمت (997 مليار تريليون تتحول لعبارة بلا "تريليون" مثلاً)
  // وهو خطأ خطير في أداة لتعبئة صكوك مالية. الآن نمنع ذلك صراحة بدل تجاهله.
  const MAX_SUPPORTED_DINARS = 999999999999; // < 1000 مليار (تريليون واحد)
  
  function arThreeDigits(n){
    if(n===0) return ''; const parts=[]; const hundred = Math.floor(n/100); const rest = n%100;
    if(hundred>0){ parts.push(arHundreds[hundred]); }
    if(rest>0){
      if(rest<10) parts.push(arOnes[rest]);
      else if(rest<20) parts.push(arTeens[rest-10]);
      else{ const t=Math.floor(rest/10), o=rest%10; if(o===0) parts.push(arTens[t]); else parts.push(arOnes[o]+' و'+arTens[t]); }
    }
    return parts.join(' و');
  }
  function arInteger(num){
    num = Math.floor(num); if(num===0) return 'صفر';
    const groups=[]; let n=num; while(n>0){ groups.push(n%1000); n=Math.floor(n/1000); } const out=[];
    for(let i=groups.length-1;i>=0;i--){
      const g=groups[i]; if(g===0) continue;
      if(i===0) out.push(arThreeDigits(g));
      else {
        const scale = arScales[i-1]; if(!scale){ out.push(arThreeDigits(g)); continue; }
        if(g===1) out.push(scale.singular); else if(g===2) out.push(scale.dual);
        else if(g>=3 && g<=10) out.push(arThreeDigits(g)+' '+scale.plural); else out.push(arThreeDigits(g)+' '+scale.singular);
      }
    }
    return out.join(' و');
  }
  function amountToArabicWords(dinars, centimes){
    const parts=[];
    if(dinars>0) {
      if(dinars===1) parts.push('دينار جزائري واحد'); else if(dinars===2) parts.push('ديناران جزائريان');
      else if(dinars>=3 && dinars<=10) parts.push(arInteger(dinars)+' دنانير جزائرية'); else parts.push(arInteger(dinars)+' دينار جزائري');
    }
    if(centimes>0) {
      if(centimes===1) parts.push('سنتيم واحد'); else if(centimes===2) parts.push('سنتيمان');
      else if(centimes>=3 && centimes<=10) parts.push(arInteger(centimes)+' سنتيمات'); else parts.push(arInteger(centimes)+' سنتيم');
    }
    if(parts.length===0) return 'صفر دينار جزائري';
    return parts.join(' و');
  }

  // 2. الفرنسية (تم حذف "seulement")
  const frUnits = ['', 'un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
  const frTens = ['', '', 'vingt','trente','quarante','cinquante','soixante','soixante','quatre-vingt','quatre-vingt'];
  function frTwoDigits(n){
    if(n<20) return frUnits[n]; const t=Math.floor(n/10), u=n%10;
    if(t===7 || t===9){ const base = (t===7)?'soixante':'quatre-vingt'; if(u===1 && t===7) return base+'-et-onze'; return base+'-'+frUnits[10+u]; }
    if(u===0) return (t===8)?'quatre-vingts':frTens[t]; if(u===1 && t!==8) return frTens[t]+'-et-un'; return frTens[t]+'-'+frUnits[u];
  }
  function frThreeDigits(n){
    const h=Math.floor(n/100), r=n%100; const parts=[];
    if(h>0){ if(h===1) parts.push('cent'); else parts.push(frUnits[h]+' cent'+((r===0)?'s':'')); }
    if(r>0) parts.push(frTwoDigits(r)); return parts.join(' ');
  }
  function amountToFrenchWords(dinars, centimes){
    const frInteger = (num) => {
      if(num===0) return 'zéro';
      const groups=[]; let n=num; while(n>0){ groups.push(n%1000); n=Math.floor(n/1000); }
      const scaleNames=['','mille','million','milliard']; const parts=[];
      for(let i=groups.length-1;i>=0;i--){
        const g=groups[i]; if(g===0) continue; let w;
        if(i===1) w = (g===1) ? 'mille' : frThreeDigits(g)+' mille';
        else if(i>=2) w = (g===1) ? 'un '+scaleNames[i] : frThreeDigits(g)+' '+scaleNames[i]+((g>1)?'s':''); else w = frThreeDigits(g);
        parts.push(w);
      }
      return parts.join(' ');
    };
    const parts=[];
    if(dinars>0) parts.push(frInteger(dinars)+' dinar'+((dinars>1)?'s':'')+' algérien'+((dinars>1)?'s':''));
    if(centimes>0) parts.push(frInteger(centimes)+' centime'+((centimes>1)?'s':''));
    if(parts.length===0) return 'zéro dinar algérien';
    return parts.join(' et ');
  }

  // 3. الإنجليزية (تم حذف "only")
  const enOnes = ['', 'one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const enTens = ['', '','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function enThreeDigits(n) {
    if (n === 0) return ''; let str = ''; let h = Math.floor(n / 100); let rest = n % 100;
    if (h > 0) { str += enOnes[h] + ' hundred'; if (rest > 0) str += ' and '; }
    if (rest > 0) {
      if (rest < 20) { str += enOnes[rest]; } 
      else { let t = Math.floor(rest / 10); let o = rest % 10; str += enTens[t]; if (o > 0) str += '-' + enOnes[o]; }
    }
    return str;
  }
  function enInteger(num) {
    if (num === 0) return 'zero'; const scales = ['', 'thousand', 'million', 'billion'];
    let groups = []; let n = num; while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); } let parts = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      let g = groups[i]; if (g === 0) continue; let p = enThreeDigits(g); if (i > 0) p += ' ' + scales[i]; parts.push(p);
    }
    return parts.join(' ');
  }
  function amountToEnglishWords(dinars, centimes) {
    let parts = [];
    if (dinars > 0) { parts.push(enInteger(dinars) + (dinars === 1 ? ' Algerian dinar' : ' Algerian dinars')); }
    if (centimes > 0) { parts.push(enInteger(centimes) + (centimes === 1 ? ' centime' : ' centimes')); }
    if (parts.length === 0) return 'zero Algerian dinars';
    return parts.join(' and ');
  }

  function fmtDZD(dinars, centimes){
    return String(dinars).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + String(centimes).padStart(2,'0') ;
  }

  /* ============ تموضع الحقول على صورة الصك (مصدر واحد للحقيقة) ============
     كل قيمة بالنسبة المئوية من أبعاد الصورة الحقيقية (cheque-ccp.jpg).
     تُستخدم هذه القيم لضبط المعاينة الحية (CSS) ولحساب إحداثيات الرسم
     عند التصدير كصورة (canvas)، بدل تكرار الأرقام في مكانين منفصلين
     كما كان سابقًا (وهو ما كان يسبب اختلاف المعاينة عن الصورة المصدَّرة).
     لإعادة المعايرة عند تغيير صورة الصك: عدّل top/right/width هنا فقط. */
  const CHECK_LAYOUT = {
    // القيم مُعايَرة يدويًا بقياس بكسلات صورة cheque-ccp.jpg (3030×1332) لتقع الكتابة
    // فوق الخطوط المطبوعة فعليًا بدل الارتفاع عنها أو التداخل مع "إدفعوا مقابل هذا الصك" / "لأمر".
    amountNum:   { top: 7.1,  right: 5.2, width: 22,   fontPct: 0.021 },
    // السطر الأول لكتابة المبلغ بالحروف يشارك مساحته مع "Payez, contre ce chèque"
    // فمساحته المتاحة أضيق من السطر الثاني (الفارغ بالكامل تحته)، لذلك عرضان مختلفان.
    words1:      { top: 21.3, right: 30,  width: 47,   fontPct: 0.025 },
    words2:      { top: 29.1, right: 2,   width: 95,   fontPct: 0.025 },
    beneficiary: { top: 37.3, right: 5.6, width: 80,   fontPct: 0.026 },
    // خانة "المكان" الفارغة الواقعة قبل كلمة Le مباشرة (يسار الصورة)، تُستخدم
    // تقليديًا لاسم المدينة/عنوان مركز الإصدار قبل "le [التاريخ]".
    address:     { top: 45.6, right: 24.3, width: 12.5, fontPct: 0.021 },
    date:        { top: 45.6, right: 7.9, width: 12.5, fontPct: 0.021 }
  };

  function applyCheckLayout(){
    const container = document.getElementById('checkMockup');
    const containerWidth = container.clientWidth || 400;
    Object.entries({
      amountNum: chkAmountNum, words1: chkWords, words2: chkWords2,
      beneficiary: chkBeneficiary, address: chkAddress, date: chkDate
    }).forEach(([key, el])=>{
      const pos = CHECK_LAYOUT[key];
      el.style.top = pos.top + '%';
      el.style.right = pos.right + '%';
      el.style.width = pos.width + '%';
      // نفس fontPct المستخدم في تصدير الصورة (canvas) يُستخدم هنا أيضًا،
      // بدل نسبة عائمة (rem) منفصلة، لتبقى المعاينة الحية والصورة المصدَّرة متطابقتين دائمًا.
      el.style.fontSize = (containerWidth * pos.fontPct) + 'px';
    });
  }
  // إعادة حساب حجم الخط عند تغيّر عرض الحاوية (تجاوب مع حجم الشاشة)
  window.addEventListener('resize', applyCheckLayout);

  /* ============ DOM & STATE ============ */
  let mode = 'dinar';
  let current = { dinars:0, centimes:0 };
  let currentLang = 'ar';
  let generatedWords = { ar: '', fr: '', en: '' };
  
  const amountInput = document.getElementById('amount');
  const beneficiaryInput = document.getElementById('beneficiaryInput');
  const addressInput = document.getElementById('addressInput');
  
  const chkAmountNum = document.getElementById('chkAmountNum');
  const chkWords = document.getElementById('chkWords');
  const chkWords2 = document.getElementById('chkWords2');
  const chkBeneficiary = document.getElementById('chkBeneficiary');
  const chkAddress = document.getElementById('chkAddress');
  const chkDate = document.getElementById('chkDate');
  
  const outputWords = document.getElementById('outputWords');
  const langTabs = document.querySelectorAll('.lang-tab');

  /* التبديل بين اللغات (Tabs) */
  langTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      langTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      e.currentTarget.classList.add('active');
      e.currentTarget.setAttribute('aria-selected','true');
      currentLang = e.currentTarget.dataset.lang;
      updateWordsDisplay();
    });
  });

  function updateWordsDisplay() {
    outputWords.textContent = generatedWords[currentLang];
    if(currentLang === 'ar') {
      outputWords.classList.remove('ltr');
      outputWords.style.direction = 'rtl';
    } else {
      outputWords.classList.add('ltr');
      outputWords.style.direction = 'ltr';
    }
  }

  /* يفسّر إدخال المستخدم بشكل صحيح حتى لو خلط بين الفاصلة والنقطة معًا
     (مثال: "1,234.56" أو "1.234,56")، بخلاف الكود السابق الذي كان
     يستبدل أول فاصلة فقط ويكسر الرقم في هذه الحالة. الفاصل الأخير في
     النص هو الفاصل العشري دائمًا، وأي فواصل قبله تُعامل كفواصل آلاف. */
  function parseAmountInput(str){
    const s = str.trim().replace(/\s/g,'');
    if(s === '') return NaN;
    const sepIndex = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'));
    if(sepIndex === -1) return parseFloat(s);
    const intPart = s.slice(0, sepIndex).replace(/[.,]/g,'') || '0';
    const fracPart = s.slice(sepIndex + 1).replace(/[^\d]/g,'') || '0';
    return parseFloat(intPart + '.' + fracPart);
  }

  /* يقسّم نص "المبلغ بالحروف" على سطرَي الصك الحقيقيَّين. السطر الأول أضيق
     (يشارك مساحته مع "Payez, contre ce chèque")، لذلك نملأه بأكبر عدد كلمات
     يسع عرضه الفعلي، والباقي يذهب للسطر الثاني الأوسع تحته — بنفس منطق
     "measureText" المستخدم أيضًا عند تصدير الصك كصورة (مصدر واحد للحقيقة). */
  const _measureCanvas = document.createElement('canvas');
  const _measureCtx = _measureCanvas.getContext('2d');
  function splitCheckWords(text){
    const words = text.split(' ');
    const cs1 = getComputedStyle(chkWords);
    _measureCtx.font = cs1.fontWeight + ' ' + cs1.fontSize + ' ' + cs1.fontFamily;
    const max1 = chkWords.clientWidth;
    let line1 = '', i = 0;
    for(; i < words.length; i++){
      const test = line1 ? line1 + ' ' + words[i] : words[i];
      if(line1 && _measureCtx.measureText(test).width > max1) break;
      line1 = test;
    }
    return { line1, line2: words.slice(i).join(' ') };
  }

  /* حساب وتحديث الواجهة */
  function recalc(){
    const val = parseAmountInput(amountInput.value);
    let overLimit = false;
    if(isNaN(val) || val<0) { current = {dinars:0, centimes:0}; }
    else if(mode==='centime'){
      const tc = Math.round(val); current = { dinars: Math.floor(tc/100), centimes: tc%100 };
    } else {
      const d = Math.floor(val); current = { dinars: d, centimes: Math.min(Math.round((val-d)*100),99) };
    }
    // حماية من تجاوز أقصى رقم تدعمه ألفاظ التحويل بأمان (انظر MAX_SUPPORTED_DINARS)
    if(current.dinars > MAX_SUPPORTED_DINARS){ current = {dinars:0, centimes:0}; overLimit = true; }

    document.getElementById('chipDinar').textContent = String(current.dinars).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    document.getElementById('chipCentime').textContent = String(current.centimes).padStart(2,'0');

    if(overLimit){
      const warn = 'الرقم كبير جدًا وغير مدعوم — الحد الأقصى 999,999,999,999';
      generatedWords.ar = warn; generatedWords.fr = warn; generatedWords.en = warn;
    } else {
      generatedWords.ar = amountToArabicWords(current.dinars, current.centimes);
      generatedWords.fr = amountToFrenchWords(current.dinars, current.centimes);
      generatedWords.en = amountToEnglishWords(current.dinars, current.centimes);
    }
    
    updateWordsDisplay();
    
    const wordsSplit = splitCheckWords(generatedWords.ar);
    chkWords.textContent = wordsSplit.line1;
    chkWords2.textContent = wordsSplit.line2;
    chkAmountNum.textContent = fmtDZD(current.dinars, current.centimes);
    chkBeneficiary.textContent = beneficiaryInput.value.trim();
    chkAddress.textContent = addressInput.value.trim();

    updateFee();
  }

  amountInput.addEventListener('input', recalc);
  beneficiaryInput.addEventListener('input', recalc);
  addressInput.addEventListener('input', recalc);

  document.getElementById('modeDinarBtn').addEventListener('click', function(){
    mode='dinar'; this.classList.add('active'); this.setAttribute('aria-pressed','true');
    const other = document.getElementById('modeCentimeBtn');
    other.classList.remove('active'); other.setAttribute('aria-pressed','false');
    document.getElementById('unitSuffix').textContent = 'دج'; recalc();
  });
  document.getElementById('modeCentimeBtn').addEventListener('click', function(){
    mode='centime'; this.classList.add('active'); this.setAttribute('aria-pressed','true');
    const other = document.getElementById('modeDinarBtn');
    other.classList.remove('active'); other.setAttribute('aria-pressed','false');
    document.getElementById('unitSuffix').textContent = 'سنتيم'; recalc();
  });

  const today = new Date();
  chkDate.textContent = today.toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', year:'numeric'});

  /* ============ الإدخال الصوتي ============
     ملاحظات توافق المتصفحات:
     - يتطلب Web Speech API سياقًا آمنًا (HTTPS أو localhost)، وإلا فبعض المتصفحات
       (خصوصًا Chrome على الموبايل) ترفض حتى إظهار طلب إذن الميكروفون بصمت.
     - Firefox (سطح المكتب والموبايل) لا يدعم SpeechRecognition أصلًا حتى الآن.
     - Safari يدعمه عبر webkitSpeechRecognition لكنه أكثر حساسية لحالة إذن
       الميكروفون، ولذلك نطلب الإذن صراحةً عبر getUserMedia أولاً لتوحيد السلوك
       ولتمييز "رفض الإذن" عن "لا يوجد ميكروفون" عن "غير مدعوم" بوضوح للمستخدم.
     - محرّكات التعرف على العربية قد تُرجع النتيجة بأرقام هندية (١٢٣)، أو
       بأرقام مكتوبة بالحروف بالكامل ("خمسة آلاف")، أو بصيغة مختلطة شائعة
       جدًا في Chrome (رقم مباشر متبوعًا بكلمة الألوف/الملايين، مثل
       "5 آلاف" بدل "خمسة آلاف")؛ لذلك نطبّع الأرقام الهندية إلى لاتينية،
       ونستخدم محلّلًا واحدًا يفهم الأرقام المباشرة وكلمات الألوف/الملايين
       معًا حتى لا يُفقد ضرب "ألف/مليون" عند ظهور رقم صريح داخل الجملة. */
  const micBtn = document.getElementById('micBtn');
  const micHint = document.getElementById('micHint');
  const defaultMicHint = micHint.textContent;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSecureCtx = window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  // يحوّل الأرقام الهندية (٠١٢٣٤٥٦٧٨٩) والفارسية إلى أرقام لاتينية عادية
  function normalizeDigits(str){
    return str.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, d =>
      String(d.charCodeAt(0) & 0xf)
    );
  }

  // محلّل للأرقام العربية المكتوبة بالحروف (مفرد/جمع/مثنى، مع واو الربط
  // منفصلة أو ملتصقة)، لأن محرّكات التعرف الصوتي على العربية غالبًا تُرجع
  // الأرقام مكتوبة بالحروف بدل الأرقام العادية.
  // أمثلة: "خمسة آلاف ومئتين" -> 5200 ، "عشرون فاصلة خمسة" -> 20.5
  const _numUnits = {'صفر':0,'واحد':1,'واحده':1,'احد':1,'اثنان':2,'اثنين':2,'اثنتان':2,'اثنتين':2,
    'ثلاثه':3,'ثلاث':3,'اربعه':4,'اربع':4,'خمسه':5,'خمس':5,'سته':6,'ست':6,
    'سبعه':7,'سبع':7,'ثمانيه':8,'ثمان':8,'ثمانى':8,'تسعه':9,'تسع':9};
  const _numTeens = {'عشره':10,'عشر':10,'احدعشر':11,'حداشر':11,'اثناعشر':12,'اثنيعشر':12,
    'ثلاثهعشر':13,'اربعهعشر':14,'خمسهعشر':15,'سنهعشر':16,'سنعشر':16,'سبعهعشر':17,
    'ثمانيهعشر':18,'تسعهعشر':19};
  const _numTens = {'عشرون':20,'عشرين':20,'ثلاثون':30,'ثلاثين':30,'اربعون':40,'اربعين':40,
    'خمسون':50,'خمسين':50,'ستون':60,'ستين':60,'سبعون':70,'سبعين':70,
    'ثمانون':80,'ثمانين':80,'تسعون':90,'تسعين':90};
  const _numHundreds = {'مئه':100,'مائه':100,'مئتان':200,'مئتين':200,'مائتان':200,'مائتين':200,
    'ثلاثمئه':300,'ثلاثمائه':300,'اربعمئه':400,'اربعمائه':400,'خمسمئه':500,'خمسمائه':500,
    'ستمئه':600,'ستمائه':600,'سبعمئه':700,'سبعمائه':700,'ثمانمئه':800,'ثمانمائه':800,
    'تسعمئه':900,'تسعمائه':900};
  const _numThousand = new Set(['الف','آلاف','الاف']);
  const _numThousandDual = new Set(['الفين','الفان']);
  const _numMillion = new Set(['مليون','ملايين']);
  const _numMillionDual = new Set(['مليونين','مليونان']);
  const _numDecimalMarkers = new Set(['فاصله','نقطه']);

  function _tokenizeArabicNumber(text){
    const clean = text
      .replace(/[أإآ]/g,'ا')
      .replace(/ة/g,'ه')
      .replace(/[^\u0600-\u06FF0-9.\s]/g,' ');
    return clean.split(/\s+/).filter(Boolean).map(tok=>{
      // نزيل واو الربط الملتصقة بالكلمة (مثل "وعشرون")
      if(tok.length > 2 && tok[0] === 'و'){
        const stripped = tok.slice(1);
        if(_numUnits[stripped]!==undefined || _numTens[stripped]!==undefined || _numHundreds[stripped]!==undefined ||
           _numThousand.has(stripped) || _numThousandDual.has(stripped) || _numMillion.has(stripped) ||
           _numMillionDual.has(stripped) || _numDecimalMarkers.has(stripped)){
          return stripped;
        }
      }
      return tok;
    });
  }

  function _parseSmallGroup(tokens){
    let value = 0, matched = false;
    for(let i=0;i<tokens.length;i++){
      const t = tokens[i];
      // بعض محركات التعرف الصوتي (خصوصًا Chrome) تُرجع النتيجة بصيغة
      // مختلطة: رقمًا مباشرًا متبوعًا بكلمة "ألف/مليون" بدل نطق كامل
      // الرقم حروفًا (مثال: "5 آلاف" بدل "خمسة آلاف")، لذلك نتعرّف على
      // أي رمز رقم مباشر ضمن المجموعة كما نتعرّف على الكلمات المنطوقة.
      if(/^\d+(\.\d+)?$/.test(t)){ value += parseFloat(t); matched = true; continue; }
      const two = t + (tokens[i+1] || '');
      if(_numTeens[two] !== undefined){ value += _numTeens[two]; matched = true; i++; continue; }
      if(_numHundreds[t] !== undefined){ value += _numHundreds[t]; matched = true; continue; }
      if(_numTeens[t] !== undefined){ value += _numTeens[t]; matched = true; continue; }
      if(_numTens[t] !== undefined){ value += _numTens[t]; matched = true; continue; }
      if(_numUnits[t] !== undefined){ value += _numUnits[t]; matched = true; continue; }
    }
    return matched ? value : NaN;
  }

  function _parseIntPhrase(tokens){
    if(!tokens.length) return NaN;
    let total = 0, group = [], matchedAny = false;
    for(let i=0;i<tokens.length;i++){
      const t = tokens[i];
      if(_numMillion.has(t) || _numMillionDual.has(t)){
        const groupVal = _parseSmallGroup(group);
        const mult = _numMillionDual.has(t) ? 2 : (isNaN(groupVal) ? 1 : groupVal);
        total += mult * 1000000; group = []; matchedAny = true; continue;
      }
      if(_numThousand.has(t) || _numThousandDual.has(t)){
        const groupVal = _parseSmallGroup(group);
        const mult = _numThousandDual.has(t) ? 2 : (isNaN(groupVal) ? 1 : groupVal);
        total += mult * 1000; group = []; matchedAny = true; continue;
      }
      group.push(t);
    }
    const rest = _parseSmallGroup(group);
    if(!isNaN(rest)){ total += rest; matchedAny = true; }
    return matchedAny ? total : NaN;
  }

  function wordsToNumber(text){
    const tokens = _tokenizeArabicNumber(text);
    const markerIdx = tokens.findIndex(t => _numDecimalMarkers.has(t));
    if(markerIdx === -1) return _parseIntPhrase(tokens);
    const intPart = _parseIntPhrase(tokens.slice(0, markerIdx));
    const fracVal = _parseIntPhrase(tokens.slice(markerIdx + 1));
    if(isNaN(intPart)) return NaN;
    if(isNaN(fracVal)) return intPart;
    return parseFloat(intPart + '.' + fracVal);
  }

  function extractAmount(rawTranscript){
    // نجرّب أولًا المحلّل المُدمج (يفهم الأرقام المباشرة وكلمات الألوف/الملايين
    // معًا)، لأن بعض محركات التعرف الصوتي تُرجع مزيجًا من الاثنين، مثل
    // "5 آلاف" أو "50 ألف" بدل "خمسة آلاف" أو "خمسون ألف" كاملةً بالحروف.
    // الاعتماد على استخراج الأرقام فقط (كما كان سابقًا) كان يتجاهل كلمة
    // "ألف/مليون" تمامًا في هذه الحالة، فيُدخل الرقم بدون أصفاره.
    const transcript = normalizeDigits(rawTranscript).replace(/(\d),(\d)/g, '$1.$2');
    const parsed = wordsToNumber(transcript);
    if(!isNaN(parsed)) return String(parsed);
    // احتياطي أخير: نص أرقام صرفة لم يلتقطه المحلّل لأي سبب
    const digits = transcript.replace(/[^\d.]/g,'');
    if(digits) return digits;
    return null;
  }

  function setMicUnsupported(msg){
    micBtn.classList.add('mic-unsupported');
    micBtn.style.opacity = '0.4';
    micHint.textContent = msg;
    micBtn.onclick = ()=>{ micHint.textContent = msg; };
  }

  if(!SpeechRec){
    setMicUnsupported('الإدخال الصوتي غير مدعوم في هذا المتصفح (جرّب Chrome أو Edge أو Safari) — يمكنك كتابة المبلغ يدويًا.');
  } else if(!isSecureCtx){
    setMicUnsupported('الإدخال الصوتي يحتاج اتصالًا آمنًا (HTTPS) ولا يعمل عند فتح الملف مباشرة من القرص — افتح الصفحة عبر رابط GitHub Pages أو خادم محلي.');
  } else {
    const rec = new SpeechRec();
    const langChain = ['ar-DZ', 'ar-SA', 'ar'];
    let langIdx = 0;
    rec.lang = langChain[0];
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let listening = false;
    let permissionAsked = false;
    let safetyTimer = null;

    function stopSafetyTimer(){ if(safetyTimer){ clearTimeout(safetyTimer); safetyTimer = null; } }

    function startRecognition(){
      try{
        rec.lang = langChain[langIdx];
        rec.start();
      }catch(e){
        listening = false;
        micBtn.classList.remove('listening');
        micHint.textContent = 'تعذّر بدء الاستماع، حاول مرة أخرى.';
      }
    }

    micBtn.addEventListener('click', async ()=>{
      if(listening){ rec.stop(); return; }
      // نطلب إذن الميكروفون صراحةً أولاً (يوحّد السلوك بين Chrome و Safari
      // ويسمح بإظهار رسالة رفض واضحة بدل خطأ صامت من SpeechRecognition نفسه)
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !permissionAsked){
        try{
          const stream = await navigator.mediaDevices.getUserMedia({audio:true});
          stream.getTracks().forEach(t => t.stop());
          permissionAsked = true;
          langIdx = 0;
          startRecognition();
        }catch(permErr){
          if(permErr && (permErr.name === 'NotAllowedError' || permErr.name === 'SecurityError')){
            micHint.textContent = 'تم رفض إذن الميكروفون — فعّله من إعدادات المتصفح لهذا الموقع ثم أعد المحاولة.';
          } else if(permErr && permErr.name === 'NotFoundError'){
            micHint.textContent = 'لم يتم العثور على ميكروفون متصل بهذا الجهاز.';
          } else {
            micHint.textContent = 'تعذّر الوصول إلى الميكروفون، تحقّق من إعدادات الجهاز والمتصفح.';
          }
        }
      } else {
        langIdx = 0;
        startRecognition();
      }
    });

    rec.addEventListener('start', ()=>{
      listening = true;
      micBtn.classList.add('listening');
      micHint.textContent = '...أستمع الآن';
      stopSafetyTimer();
      // بعض متصفحات الموبايل (خصوصًا Safari/iOS) قد لا تُصدر حدث "end" بشكل
      // موثوق؛ مؤقّت أمان يعيد الزر لحالته الطبيعية إن لم يحدث شيء لمدة طويلة
      safetyTimer = setTimeout(()=>{ try{ rec.stop(); }catch(e){} }, 15000);
    });

    rec.addEventListener('end', ()=>{
      listening = false;
      micBtn.classList.remove('listening');
      stopSafetyTimer();
      if(micHint.textContent === '...أستمع الآن'){ micHint.textContent = defaultMicHint; }
    });

    rec.addEventListener('result', (e)=>{
      const rawTranscript = e.results[0][0].transcript;
      const amount = extractAmount(rawTranscript);
      if(amount !== null){
        amountInput.value = amount; recalc();
        const unit = mode === 'centime' ? 'سنتيم' : 'دج';
        const shown = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        micHint.textContent = 'تم فهم: «'+rawTranscript+'» ← '+shown+' '+unit+' — تحقّق من الرقم قبل الاستعمال.';
      } else {
        micHint.textContent = 'لم أتعرف على رقم في: «'+rawTranscript+'» — جرّب الكتابة يدويًا.';
      }
    });

    rec.addEventListener('error', (e)=>{
      stopSafetyTimer();
      const code = e && e.error;
      if(code === 'not-allowed' || code === 'service-not-allowed'){
        micHint.textContent = 'تم رفض إذن الميكروفون — فعّله من إعدادات المتصفح لهذا الموقع ثم أعد المحاولة.';
      } else if(code === 'no-speech'){
        micHint.textContent = 'لم أسمع أي كلام، حاول التحدث بعد الضغط على الزر مباشرة.';
      } else if(code === 'audio-capture'){
        micHint.textContent = 'لم يتم العثور على ميكروفون صالح للاستخدام.';
      } else if(code === 'network'){
        micHint.textContent = 'تعذّر الوصول للخدمة، تحقّق من اتصالك بالإنترنت.';
      } else if(code === 'language-not-supported' && langIdx < langChain.length - 1){
        langIdx++;
        micHint.textContent = 'جارٍ إعادة المحاولة بضبط لغة مختلف...';
        startRecognition();
        return;
      } else {
        micHint.textContent = 'تعذّر الوصول للميكروفون، تحقّق من الأذونات والاتصال بالإنترنت.';
      }
      listening = false;
      micBtn.classList.remove('listening');
    });
  }


  /* ============ تصدير الصك كصورة ومشاركته ============ */
  // نميّز بين "لم تكتمل بعد" و"فشل التحميل تمامًا" لإعطاء المستخدم رسالة
  // دقيقة بدل رسالة واحدة عامة تُربكه في الحالتين (كان الكود السابق يعرض
  // نفس التنبيه سواء كانت الصورة لا تزال تُحمَّل أو أن مسارها خاطئ أصلاً).
  let checkImgFailed = false;
  document.getElementById('checkBgImg').addEventListener('error', ()=>{ checkImgFailed = true; });

  // يبني نفس صورة الصك المُصدَّرة (Canvas) — مصدر واحد للحقيقة يستخدمه
  // كل من زر "تحميل الصك كصورة" وزر "مشاركة الصك"، بدل تكرار منطق الرسم.
  function buildChequeCanvas(){
    const img = document.getElementById('checkBgImg');
    if(checkImgFailed){
      alert("تعذّر تحميل صورة نموذج الصك (الملف مفقود أو مساره غير صحيح). تأكد من وجود cheque-ccp.jpg بجانب هذا الملف.");
      return null;
    }
    if(!img.complete || img.naturalWidth === 0) {
      alert("يرجى الانتظار حتى تكتمل تحميل صورة الخلفية أولاً.");
      return null;
    }

    const canvas = document.createElement('canvas');
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, w, h);
    ctx.fillStyle = '#1C2B45';
    ctx.textAlign = 'right';

    // نفس نسب CHECK_LAYOUT المستخدمة في المعاينة الحية بالضبط (مصدر واحد للحقيقة).
    // المبلغ بالحروف مقسَّم مسبقًا على سطرين (chkWords/chkWords2) بنفس منطق
    // splitCheckWords المستخدم في المعاينة الحية، فنرسم كل سطر في مكانه الحقيقي مباشرة
    // بدل إعادة الالتفاف هنا بعرض واحد (وهو ما كان يسبب تداخل السطر الأول مع "Payez...").
    function drawField(text, layout){
      const fontSize = w * layout.fontPct;
      ctx.font = 'bold ' + fontSize + 'px Cairo, Arial';
      const x = w * (1 - layout.right / 100);
      const baseY = h * (layout.top / 100) + fontSize;
      ctx.fillText(text, x, baseY);
    }

    drawField(chkAmountNum.textContent, CHECK_LAYOUT.amountNum);
    drawField(chkWords.textContent, CHECK_LAYOUT.words1);
    if(chkWords2.textContent) drawField(chkWords2.textContent, CHECK_LAYOUT.words2);
    drawField(chkBeneficiary.textContent, CHECK_LAYOUT.beneficiary);
    drawField(chkAddress.textContent, CHECK_LAYOUT.address);
    drawField(chkDate.textContent, CHECK_LAYOUT.date);
    // ملاحظة: عنوان مركز البريد يُرسم في خانة "المكان" قبل Le مباشرة (انظر أعلاه).
    return canvas;
  }

  function chequeFileName(){
    return 'CCP_Cheque_' + current.dinars + 'DA.jpg';
  }

  function downloadCanvasAsJpg(canvas, onDone){
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = chequeFileName();
      link.href = dataUrl;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      if(onDone) onDone(true);
    } catch(err) {
      alert("تعذر حفظ الصورة محلياً بسبب قيود الأمان (CORS). يفضل تشغيل الملف عبر خادم محلي أو استضافته.");
      if(onDone) onDone(false);
    }
  }

  document.getElementById('exportImgBtn').addEventListener('click', function(){
    const btn = this;
    const canvas = buildChequeCanvas();
    if(!canvas) return;
    downloadCanvasAsJpg(canvas, (ok)=>{
      if(!ok) return;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = 'تم الحفظ بنجاح!';
      setTimeout(()=> btn.innerHTML = originalHtml, 2000);
    });
  });

  /* ============ مشاركة الصك (ماسنجر، واتساب، تيليغرام، وغيرها) ============
     نعتمد أولًا على Web Share API مع ملف الصورة (navigator.share مع files)،
     وهي الطريقة الوحيدة التي تفتح "قائمة المشاركة" الحقيقية لنظام الجهاز
     وتضم كل التطبيقات المثبَّتة القادرة على استقبال صورة (واتساب، تيليغرام،
     ماسنجر، وغيرها) — مدعومة على أغلب متصفحات الموبايل (Chrome/Safari على
     أندرويد و iOS) وعلى Safari/Chrome على macOS، لكن غير مدعومة على أغلب
     متصفحات سطح المكتب (خصوصًا Firefox وChrome على Linux). عند عدم الدعم،
     نُنزّل الصورة تلقائيًا ونعرض روابط مباشرة لفتح واتساب/تيليغرام بنص جاهز،
     مع تنبيه بضرورة إرفاق الصورة المحمَّلة يدويًا (لأنه لا يوجد رابط مباشر
     على الويب لإرسال ملف صورة محلي إلى ماسنجر أو غيره بدون استضافتها أونلاين). */
  function shareCaption(){
    const amountTxt = fmtDZD(current.dinars, current.centimes) + ' دج';
    return 'صك بريد جزائري (وهمي) بقيمة ' + amountTxt + ' — أُنشئ بواسطة أداة «عمّر الشاك».';
  }

  function openShareFallbackPanel(){
    const caption = shareCaption();
    document.getElementById('shareWaLink').href = 'https://wa.me/?text=' + encodeURIComponent(caption);
    document.getElementById('shareTgLink').href = 'https://t.me/share/url?url=&text=' + encodeURIComponent(caption);
    document.getElementById('shareFallbackPanel').classList.add('open');
  }

  document.getElementById('shareChequeBtn').addEventListener('click', async function(){
    const btn = this;
    const canvas = buildChequeCanvas();
    if(!canvas) return;

    canvas.toBlob(async (blob)=>{
      if(!blob){
        alert('تعذّر إنشاء صورة الصك للمشاركة.');
        return;
      }
      const file = new File([blob], chequeFileName(), { type: 'image/jpeg' });
      const canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [file] }));

      if(navigator.share && canShareFiles){
        try{
          await navigator.share({ files: [file], text: shareCaption() });
          return; // نجحت المشاركة عبر قائمة المشاركة الأصلية للجهاز
        }catch(err){
          // المستخدم أغلق قائمة المشاركة (AbortError) — لا حاجة لأي رسالة أو احتياطي
          if(err && err.name === 'AbortError') return;
          // أي خطأ آخر: ننتقل للاحتياطي أدناه
        }
      }

      // احتياطي: لا يوجد دعم لمشاركة الملفات في هذا المتصفح (أغلب متصفحات
      // سطح المكتب) — نُنزّل الصورة أولًا، ثم نعرض روابط مشاركة نصية جاهزة
      const originalHtml = btn.innerHTML;
      btn.innerHTML = 'جارٍ تحميل الصورة...';
      downloadCanvasAsJpg(canvas, ()=>{
        btn.innerHTML = originalHtml;
        openShareFallbackPanel();
      });
    }, 'image/jpeg', 0.9);
  });

  document.getElementById('shareMsgBtn').addEventListener('click', async function(){
    const caption = shareCaption();
    // بعض متصفحات سطح المكتب (Chrome/Edge) تدعم navigator.share للنص فقط
    // بدون ملفات؛ نجرّبها هنا كخيار أفضل من مجرد النسخ عند توفرها.
    if(navigator.share){
      try{ await navigator.share({ text: caption }); return; }catch(e){ if(e && e.name === 'AbortError') return; }
    }
    try{
      await navigator.clipboard.writeText(caption);
      alert('تم نسخ نص المشاركة. افتح ماسنجر (أو أي تطبيق آخر)، وأرفق الصورة التي تم تحميلها مع لصق النص.');
    }catch(e){
      alert('افتح ماسنجر (أو أي تطبيق آخر) وأرفق الصورة التي تم تحميلها.');
    }
  });

  /* ============ حاسبة رسوم بريد الجزائر ============
     الثوابت أدناه تمثّل شرائح الرسوم (رسم ثابت + رسم متغيّر لكل 1000 دج
     من كل شريحة). سُمّيت بوضوح بدل أرقام غامضة (magic numbers) مبعثرة
     داخل الحساب، حتى يسهل تحديثها مستقبلًا إن غيّر بريد الجزائر تعريفته
     الرسمية دون الحاجة لقراءة الكود بالكامل لفهم كل رقم. */
  const CCP_FEE = {
    BASE_FEE: 18,           // رسم ثابت لكل صك بغض النظر عن المبلغ
    TRANCHE1_LIMIT: 18000,  // نهاية الشريحة الأولى (دج)
    TRANCHE2_LIMIT: 1000000,// نهاية الشريحة الثانية (دج)
    TRANCHE1_RATE: 2,       // دج لكل 1000 دج ضمن الشريحة الأولى
    TRANCHE2_RATE: 3,       // دج لكل 1000 دج ضمن الشريحة الثانية
    TRANCHE3_RATE: 6        // دج لكل 1000 دج لما بعد الشريحة الثانية
  };

  function calculateCCPFee(dinars) {
    if (dinars <= 0) return 0;
    let variableFee = 0;

    const tranche1 = Math.min(dinars, CCP_FEE.TRANCHE1_LIMIT);
    variableFee += Math.ceil(tranche1 / 1000) * CCP_FEE.TRANCHE1_RATE;

    if (dinars > CCP_FEE.TRANCHE1_LIMIT) {
      const tranche2 = Math.min(dinars - CCP_FEE.TRANCHE1_LIMIT, CCP_FEE.TRANCHE2_LIMIT - CCP_FEE.TRANCHE1_LIMIT);
      variableFee += Math.ceil(tranche2 / 1000) * CCP_FEE.TRANCHE2_RATE;
    }

    if (dinars > CCP_FEE.TRANCHE2_LIMIT) {
      const tranche3 = dinars - CCP_FEE.TRANCHE2_LIMIT;
      variableFee += Math.ceil(tranche3 / 1000) * CCP_FEE.TRANCHE3_RATE;
    }

    return CCP_FEE.BASE_FEE + variableFee;
  }

  function updateFee(){
    const feeDinars = calculateCCPFee(current.dinars);
    const feeCentimes = feeDinars * 100;
    const totalWithdrawnCentimes = current.dinars * 100 + current.centimes;
    const totalAccountDebitCentimes = totalWithdrawnCentimes + feeCentimes;
    
    document.getElementById('feeAmount').textContent = fmtDZD(Math.floor(feeCentimes/100), feeCentimes%100) + ' دج';
    document.getElementById('feeTotal').textContent = fmtDZD(Math.floor(totalAccountDebitCentimes/100), totalAccountDebitCentimes%100) + ' دج';
  }

  /* ============ المفضلة (Local Storage) ============
     كل عنصر محفوظ يخزّن الآن أيضًا: الرسوم البريدية المحسوبة وقت الحفظ
     (fee)، وتاريخ/وقت الحفظ (savedAt) — لتمييز "سحب فعلي" بختم زمني عن مجرد
     مبلغ مفضّل. المدخلات القديمة (من نسخة سابقة بدون هذين الحقلين) تبقى
     صالحة: نحسب رسومها عند العرض ونعرض تاريخها كـ"—". */
  const favList = document.getElementById('favList');
  const favEmpty = document.getElementById('favEmpty');
  const favTotals = document.getElementById('favTotals');
  const favTotalWithdrawEl = document.getElementById('favTotalWithdraw');
  const favTotalFeesEl = document.getElementById('favTotalFees');
  const favLabelInput = document.getElementById('favLabel');
  const favAddBtn = document.getElementById('favAddBtn');
  const FAV_KEY = 'omar-chek:favorites';
  let favorites = [];

  function loadFavorites(){
    try{ const stored = window.localStorage.getItem(FAV_KEY); if(stored) favorites = JSON.parse(stored); }catch(e){}
    renderFavorites();
  }
  function saveFavorites(){
    try{ window.localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); }catch(e){}
  }
  // رسوم العنصر: نستخدم القيمة المحفوظة إن وُجدت (سجل تاريخي دقيق)، وإلا
  // نحسبها الآن (توافقًا مع مدخلات محفوظة من نسخة سابقة).
  function favFee(f){
    return (typeof f.fee === 'number') ? f.fee : calculateCCPFee(f.dinars);
  }
  function formatSavedAt(iso){
    if(!iso) return { date:'—', time:'—' };
    const d = new Date(iso);
    if(isNaN(d.getTime())) return { date:'—', time:'—' };
    const datePart = d.toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', year:'numeric'});
    const timePart = d.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
    return { date: datePart, time: timePart };
  }
  function renderFavorites(){
    favList.innerHTML=''; favEmpty.style.display = favorites.length ? 'none' : 'block';
    favTotals.classList.toggle('show', favorites.length > 0);

    let totalWithdrawCentimes = 0;
    let totalFeeCentimes = 0;

    favorites.forEach((f, idx)=>{
      const fee = favFee(f);
      totalWithdrawCentimes += f.dinars * 100 + (f.centimes || 0);
      totalFeeCentimes += fee * 100;
      const when = formatSavedAt(f.savedAt);

      const row = document.createElement('div'); row.className='fav-item';

      const head = document.createElement('div'); head.className='fav-item-head';
      const labelEl = document.createElement('span'); labelEl.className='fav-item-label'; labelEl.textContent = f.label;
      const delBtn = document.createElement('button'); delBtn.className='fav-item-del'; delBtn.type='button';
      delBtn.setAttribute('aria-label','حذف'); delBtn.innerHTML = '✕';
      delBtn.addEventListener('click', ()=>{ favorites.splice(idx,1); saveFavorites(); renderFavorites(); });
      head.appendChild(labelEl); head.appendChild(delBtn);

      const useBtn = document.createElement('button'); useBtn.className='fav-item-use'; useBtn.type='button';
      useBtn.innerHTML =
        '<div class="fav-item-grid">' +
          '<div class="fav-field withdraw"><span>إجمالي السحوبات</span><b></b></div>' +
          '<div class="fav-field fee"><span>إجمالي الرسوم</span><b></b></div>' +
          '<div class="fav-field"><span>الوقت</span><b></b></div>' +
          '<div class="fav-field"><span>التاريخ</span><b></b></div>' +
        '</div>';
      const values = useBtn.querySelectorAll('.fav-field b');
      values[0].textContent = fmtDZD(f.dinars, f.centimes || 0) + ' دج';
      values[1].textContent = fmtDZD(fee, 0) + ' دج';
      values[2].textContent = when.time;
      values[3].textContent = when.date;
      useBtn.addEventListener('click', ()=>{
        document.getElementById('modeDinarBtn').click();
        amountInput.value = f.dinars + (f.centimes ? '.'+String(f.centimes).padStart(2,'0') : '');
        recalc(); window.scrollTo({top:0, behavior:'smooth'});
      });

      row.appendChild(head); row.appendChild(useBtn); favList.appendChild(row);
    });

    favTotalWithdrawEl.textContent = fmtDZD(Math.floor(totalWithdrawCentimes/100), totalWithdrawCentimes%100) + ' دج';
    favTotalFeesEl.textContent = fmtDZD(Math.floor(totalFeeCentimes/100), totalFeeCentimes%100) + ' دج';
  }
  favAddBtn.addEventListener('click', ()=>{
    const label = favLabelInput.value.trim() || 'مبلغ محفوظ';
    if(current.dinars===0 && current.centimes===0) return;
    favorites.unshift({
      label,
      dinars: current.dinars,
      centimes: current.centimes,
      fee: calculateCCPFee(current.dinars),
      savedAt: new Date().toISOString()
    });
    favorites = favorites.slice(0,20);
    favLabelInput.value=''; saveFavorites(); renderFavorites();
  });

  /* ============ أزرار التفاعل: نسخ، نطق، مشاركة ============ */
  function flashCopied(btn){
    const original = btn.innerHTML;
    btn.classList.add('copied-flash');
    btn.lastChild.textContent = ' تم النسخ';
    setTimeout(()=>{ btn.innerHTML = original; btn.classList.remove('copied-flash'); }, 1400);
  }
  
  function copyText(txt, btn){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(()=>flashCopied(btn)).catch(()=>fallbackCopy(txt,btn));
    } else fallbackCopy(txt, btn);
  }
  
  function fallbackCopy(txt, btn){
    const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); flashCopied(btn); }catch(e){} document.body.removeChild(ta);
  }

  document.getElementById('copyBtn').addEventListener('click', function() {
    copyText(generatedWords[currentLang], this);
  });

  document.getElementById('readBtn').addEventListener('click', function() {
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    let u = new SpeechSynthesisUtterance(generatedWords[currentLang]);
    u.lang = currentLang === 'ar' ? 'ar-SA' : (currentLang === 'fr' ? 'fr-FR' : 'en-US');
    window.speechSynthesis.speak(u);
  });

  document.getElementById('shareBtn').addEventListener('click', function() {
    const text = generatedWords[currentLang];
    if(navigator.share){ navigator.share({ text }).catch(()=>{}); } else { copyText(text, this); }
  });

  /* ============ محوّل CCP ↔ RIP ============
     بادئة بريد الجزائر: 007 (رمز البنك/CCP) + 99999 (رمز الوكالة المركزية).
     مفتاح المراقبة (آخر رقمين من الـ20) غير مُحسَب هنا عمدًا: لم نعثر على
     صيغة رياضية موثّقة رسميًا ومؤكدة بأمثلة حقيقية متعددة، ورقم مالي خاطئ
     أخطر من عدم عرضه إطلاقًا. استخراج رقم الحساب من RIP كامل (الاتجاه
     المعاكس) لا يحتاج أي حساب — فقط اقتطاع نفس الموضع الثابت دومًا — لذلك
     هو الوحيد المفعّل تلقائيًا حاليًا. */
  const CCP_BANK_PREFIX = '00799999';
  const ccpInput = document.getElementById('ccpInput');
  const ripInput = document.getElementById('ripInput');
  const ccpNote = document.getElementById('ccpNote');
  const ripNote = document.getElementById('ripNote');
  const ccpRipSwapBtn = document.getElementById('ccpRipSwapBtn');

  function onlyDigits(s){ return (s || '').replace(/\D/g, ''); }

  function refreshCcpNote(){
    const d = ccpInput.value;
    if(!d){ ccpNote.textContent=''; ccpNote.className='format-note'; return; }
    if(d.length < 10){
      ccpNote.textContent = `أدخل ${10 - d.length} رقم إضافي (10 أرقام إجمالاً).`;
      ccpNote.className = 'format-note warn';
    } else {
      ccpNote.textContent = 'صيغة الحساب صحيحة (10 أرقام).';
      ccpNote.className = 'format-note ok';
    }
  }

  function refreshRipNote(){
    const d = ripInput.value;
    if(!d){ ripNote.textContent=''; ripNote.className='format-note'; return; }
    if(d.length < 20){
      ripNote.textContent = `أدخل ${20 - d.length} رقم إضافي (20 رقمًا إجمالاً).`;
      ripNote.className = 'format-note warn';
    } else if(!d.startsWith(CCP_BANK_PREFIX)){
      ripNote.textContent = 'تنبيه: لا يبدأ بالبادئة المعروفة لبريد الجزائر (00799999) — تأكد من الرقم.';
      ripNote.className = 'format-note err';
    } else {
      ripNote.textContent = 'الطول والبادئة صحيحان. (لم يُتحقق من مفتاح المراقبة بعد).';
      ripNote.className = 'format-note ok';
    }
  }

  ccpInput.addEventListener('input', ()=>{
    ccpInput.value = onlyDigits(ccpInput.value).slice(0,10);
    refreshCcpNote();
  });
  ripInput.addEventListener('input', ()=>{
    ripInput.value = onlyDigits(ripInput.value).slice(0,20);
    refreshRipNote();
  });

  function flashSwap(){
    ccpRipSwapBtn.classList.add('copied-flash');
    setTimeout(()=> ccpRipSwapBtn.classList.remove('copied-flash'), 700);
  }

  ccpRipSwapBtn.addEventListener('click', ()=>{
    const rip = ripInput.value;
    const ccp = ccpInput.value;
    if(rip.length === 20){
      // استخراج رقم الحساب (10 أرقام) من موضعه الثابت داخل RIP — بلا أي حساب.
      ccpInput.value = rip.slice(8, 18);
      refreshCcpNote();
      flashSwap();
    } else if(ccp.length > 0){
      ripInput.value = CCP_BANK_PREFIX + ccp.padStart(10, '0');
      refreshRipNote();
      flashSwap();
    }
  });

  document.getElementById('copyCcpBtn').addEventListener('click', function(){
    if(ccpInput.value) copyText(ccpInput.value, this);
  });
  document.getElementById('copyRipBtn').addEventListener('click', function(){
    if(ripInput.value) copyText(ripInput.value, this);
  });

  /* ---- حفظ الحسابات بالاسم (تخزين محلي منفصل عن مفضلة المبالغ) ---- */
  const contactList = document.getElementById('contactList');
  const contactEmpty = document.getElementById('contactEmpty');
  const contactLabelInput = document.getElementById('contactLabel');
  const contactAddBtn = document.getElementById('contactAddBtn');
  const CONTACTS_KEY = 'omar-chek:contacts';
  let contacts = [];

  function loadContacts(){
    try{ const stored = window.localStorage.getItem(CONTACTS_KEY); if(stored) contacts = JSON.parse(stored); }catch(e){}
    renderContacts();
  }
  function saveContacts(){
    try{ window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts)); }catch(e){}
  }
  function renderContacts(){
    contactList.innerHTML = '';
    contactEmpty.style.display = contacts.length ? 'none' : 'block';

    contacts.forEach((c, idx)=>{
      const row = document.createElement('div'); row.className = 'fav-item';

      const head = document.createElement('div'); head.className = 'fav-item-head';
      const labelEl = document.createElement('span'); labelEl.className = 'fav-item-label'; labelEl.textContent = c.label;
      const delBtn = document.createElement('button'); delBtn.className = 'fav-item-del'; delBtn.type = 'button';
      delBtn.setAttribute('aria-label', 'حذف'); delBtn.innerHTML = '✕';
      delBtn.addEventListener('click', ()=>{ contacts.splice(idx, 1); saveContacts(); renderContacts(); });
      head.appendChild(labelEl); head.appendChild(delBtn);
      row.appendChild(head);

      if(c.ccp){
        const p = document.createElement('p'); p.style.cssText = 'margin:0;font-size:.8rem;color:var(--ink-soft);';
        p.innerHTML = 'CCP: <b class="ltr" style="color:var(--ink);">' + c.ccp + '</b>';
        row.appendChild(p);
      }
      if(c.rip){
        const p2 = document.createElement('p'); p2.style.cssText = 'margin:0;font-size:.8rem;color:var(--ink-soft);word-break:break-all;';
        p2.innerHTML = 'RIP: <b class="ltr" style="color:var(--ink);">' + c.rip + '</b>';
        row.appendChild(p2);
      }

      const actions = document.createElement('div'); actions.className = 'actions-row'; actions.style.marginTop = '4px';
      const useBtn = document.createElement('button'); useBtn.className = 'icon-btn'; useBtn.type = 'button'; useBtn.textContent = 'استخدام';
      useBtn.addEventListener('click', ()=>{
        ccpInput.value = c.ccp || ''; ripInput.value = c.rip || '';
        refreshCcpNote(); refreshRipNote();
        beneficiaryInput.value = c.label; recalc();
        window.scrollTo({top:0, behavior:'smooth'});
      });
      const copyRipContactBtn = document.createElement('button'); copyRipContactBtn.className = 'icon-btn'; copyRipContactBtn.type = 'button'; copyRipContactBtn.textContent = 'نسخ RIP';
      copyRipContactBtn.addEventListener('click', function(){ if(c.rip) copyText(c.rip, this); });
      actions.appendChild(useBtn); actions.appendChild(copyRipContactBtn);
      row.appendChild(actions);

      contactList.appendChild(row);
    });
  }
  contactAddBtn.addEventListener('click', ()=>{
    const label = contactLabelInput.value.trim() || 'جهة اتصال';
    if(!ccpInput.value && !ripInput.value) return;
    contacts.unshift({ label, ccp: ccpInput.value, rip: ripInput.value, savedAt: new Date().toISOString() });
    contacts = contacts.slice(0, 30);
    contactLabelInput.value = '';
    saveContacts(); renderContacts();
  });

  /* ============ التنقّل بين الصفحة الرئيسية وصفحة CCP/RIP ============
     "صفحة" داخل نفس الملف (تبديل عرض بجافاسكريبت) بدل ملف HTML منفصل:
     قرارٌ مقصود بعد التحقق أن localStorage في متصفحات اليوم يُعامل كل
     رابط file:// كمصدر منفصل بتخزين خاص به (غير مضمون التشارك حتى بين
     ملفين في نفس المجلد)، فملف منفصل كان سيهدد مزامنة المفضلة وجهات
     الاتصال المحفوظة عند فتح التطبيق محليًا بدون خادم. */
  const mainView = document.getElementById('mainView');
  const ripView = document.getElementById('ripView');
  const ripNavBtn = document.getElementById('ripNavBtn');
  const ripBackBtn = document.getElementById('ripBackBtn');

  function showRipView(){
    mainView.style.display = 'none';
    ripView.style.display = 'flex';
    ripNavBtn.classList.add('active');
    window.scrollTo({top:0});
  }
  function showMainView(){
    ripView.style.display = 'none';
    mainView.style.display = 'flex';
    ripNavBtn.classList.remove('active');
    window.scrollTo({top:0});
  }
  ripNavBtn.addEventListener('click', showRipView);
  ripBackBtn.addEventListener('click', showMainView);

  /* ============ بدء التشغيل ============ */
  applyCheckLayout();
  recalc();
  loadFavorites();
  loadContacts();

  /* ============ اختبارات انحدار داخلية لتحويل الأرقام ============
     منطق تحويل الأرقام إلى حروف حساس جدًا للأخطاء (خطأ صياغة واحد يعني
     صكًا مكتوبًا بشكل خاطئ)، ولم يكن له أي اختبار سابقًا. هذه مجموعة قيم
     مرجعية صحيحة (تم التحقق منها يدويًا) تُقارَن تلقائيًا بمخرجات الدوال
     الحالية عند تفعيلها، لتكشف أي كسر مستقبلي عند تعديل الكود. لا تعمل
     تلقائيًا لتبقى الكونسول نظيفًا للمستخدم العادي — فعّلها بإضافة
     ?selftest=1 لعنوان الملف في المتصفح. */
  if (window.location.search.includes('selftest')) {
    const cases = [
      [0,0,'صفر دينار جزائري'], [1,0,'دينار جزائري واحد'], [2,0,'ديناران جزائريان'],
      [3,0,'ثلاثة دنانير جزائرية'], [11,0,'أحد عشر دينار جزائري'],
      [100,0,'مائة دينار جزائري'], [200,0,'مئتان دينار جزائري'],
      [300,0,'ثلاثمائة دينار جزائري'], [999,0,'تسعمائة وتسعة وتسعون دينار جزائري'],
      [1000,0,'ألف دينار جزائري'], [2000,0,'ألفان دينار جزائري'],
      [125430,50,'مائة وخمسة وعشرون ألف وأربعمائة وثلاثون دينار جزائري وخمسون سنتيم'],
      [999999999999,0,'تسعمائة وتسعة وتسعون مليار وتسعمائة وتسعة وتسعون مليون وتسعمائة وتسعة وتسعون ألف وتسعمائة وتسعة وتسعون دينار جزائري'],
      [0,1,'سنتيم واحد'], [0,2,'سنتيمان'], [0,3,'ثلاثة سنتيمات']
    ];
    let pass = 0;
    cases.forEach(([d,c,expected]) => {
      const actual = amountToArabicWords(d,c);
      const ok = actual === expected;
      if(ok) pass++;
      console.assert(ok, `فشل اختبار (${d} دج ${c} سنتيم): توقعت "${expected}" لكن حصلت على "${actual}"`);
    });
    console.log(`اختبارات تحويل الأرقام: ${pass}/${cases.length} ناجحة`);
  }

})();
