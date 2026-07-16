# Backend - موقع تسوق (Node.js + Express + MongoDB)

## 1. تشغيل المشروع محليًا

```bash
npm install
cp .env.example .env
# افتح .env واملأ القيم (خصوصًا MONGO_URI و JWT_SECRET)
npm run dev
```

## 2. عمل قاعدة بيانات مجانية على MongoDB Atlas

1. روح على https://www.mongodb.com/cloud/atlas وعمل حساب مجاني
2. اعمل Cluster جديد (اختار الخطة المجانية M0)
3. من "Database Access" اعمل يوزر وباسورد لقاعدة البيانات
4. من "Network Access" اضغط "Allow Access from Anywhere" (0.0.0.0/0)
5. من "Connect" > "Drivers" هتلاقي رابط زي ده:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   ```
6. حط الرابط ده في `MONGO_URI` في ملف `.env`

## 3. رفع المشروع على GitHub

```bash
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

## 4. النشر على Railway

1. روح على https://railway.app وسجل دخول بـ GitHub
2. اضغط **New Project** > **Deploy from GitHub repo**
3. اختار الريبو بتاع الباك اند
4. Railway هيكتشف إنه مشروع Node.js تلقائيًا ويعمل build
5. روح على تبويب **Variables** وضيف نفس المتغيرات اللي في `.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (حط رابط موقع الفرونت اند بتاعك، مثلاً من Vercel)
   - لا تضيف `PORT` — Railway بيحددها لوحده تلقائيًا
6. بعد ما ينتهي الـ Deploy، روح على **Settings** > **Networking** واضغط **Generate Domain** عشان تاخد رابط عام للـ API زي:
   ```
   https://your-app-name.up.railway.app
   ```

## 5. ربطه بموقع React

في مشروع React، غير الرابط اللي بتبعت عليه الـ requests (axios/fetch) لرابط Railway:

```js
const API_URL = "https://your-app-name.up.railway.app/api";
```

يفضل تحطه في ملف `.env` بتاع React كمان:
```
REACT_APP_API_URL=https://your-app-name.up.railway.app/api
```

## نقاط الـ API المتاحة

| Method | Route | الوصف | محتاج توكن؟ |
|--------|-------|-------|------------|
| POST | /api/auth/register | تسجيل مستخدم جديد | لا |
| POST | /api/auth/login | تسجيل دخول | لا |
| GET | /api/auth/profile | بيانات المستخدم | نعم |
| GET | /api/products | كل المنتجات | لا |
| GET | /api/products/:id | منتج واحد | لا |
| POST | /api/products | إضافة منتج | نعم (أدمن) |
| PUT | /api/products/:id | تعديل منتج | نعم (أدمن) |
| DELETE | /api/products/:id | حذف منتج | نعم (أدمن) |
| POST | /api/orders | إنشاء طلب | نعم |
| GET | /api/orders/myorders | طلباتي | نعم |
| GET | /api/orders | كل الطلبات | نعم (أدمن) |
| PUT | /api/orders/:id/status | تعديل حالة الطلب | نعم (أدمن) |

## ملاحظات مهمة عن Railway المجاني

- الخطة المجانية بتديك كريدت شهري محدود (500 ساعة تقريبًا)
- لو خلص الكريدت، السيرفر بيقف لحد الشهر الجاي
- مفيش "نوم" زي Render، لكن لو حابب توفر كريدت ممكن تطفي السيرفر وقت مش بتستخدمه من الداشبورد
