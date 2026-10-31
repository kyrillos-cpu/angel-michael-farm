# مزرعة الملاك ميخائيل – ديروط

نظام حسابات تأسيس المزرعة: ٨ حوش × ٥.٥ فدان، وشريكين ٥٠/٥٠.

- **الداتا:** Google Sheet اسمه "مزرعة الملاك ميخائيل – ديروط" في فولدر Dayrut.
- **السيرفر:** Google Apps Script جوه الشيت (الملف `apps-script/Code.gs`).
- **الأب:** صفحة على GitHub Pages (الملفات `index.html` و `app.js` و `style.css`).

## خطوات التركيب (مرة واحدة)

### ١. السكريبت
1. افتح الشيت ← **Extensions ← Apps Script**.
2. امسح الكود الموجود في `Code.gs` والصق محتوى الملف `apps-script/Code.gs` من هنا، ودوس حفظ.
3. ارجع للشيت واعمل Refresh. هتظهر قايمة **الأب** فوق ← **تحديد الكود السري** ← اكتب كود (٦ حروف أو أرقام على الأقل).
   أول مرة جوجل هيطلب صلاحيات: Continue ← اختار حسابك ← Advanced ← Go to … ← Allow.
4. من Apps Script: **Deploy ← New deployment** ← الترس جنب Select type ← **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy ← انسخ **Web app URL**.

### ٢. GitHub Pages
**Settings ← Pages** ← Source: **Deploy from a branch** ← Branch: **main** و **/(root)** ← Save.
بعد دقيقة الأب هيبقى على: `https://kyrillos-cpu.github.io/<اسم المشروع>/`

### ٣. أول دخول
افتح لينك الأب ← الصق Web app URL ← اكتب الكود السري واسمك ← ادخل.

## لما يتعدّل السكريبت
الصق الكود الجديد في Apps Script ← **Deploy ← Manage deployments** ← القلم ← Version: **New version** ← Deploy.
كده اللينك بيفضل زي ما هو.

## ملاحظات
- كل الحسابات بتتعمل بمعادلات جوه الشيت، والأب بيقرا منها ويكتب في تابات الإدخال بس.
- التعديل والمسح بيتعملوا من الشيت.
- الكود السري مش موجود في الملفات هنا، بيتحفظ جوه السكريبت بس.
