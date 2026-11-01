# Shanti Care Hospital (হাসপাতাল ম্যানেজমেন্ট সাইট)

সাধারণ HTML, CSS ও JavaScript দিয়ে বানানো। ডেটা থাকে ব্রাউজারের localStorage-এ।
AI রিপোর্ট চ্যাট ChatterMate API ব্যবহার করে।

## ফোল্ডারে কী আছে
- index.html, patients.html, visits.html, lab.html, billing.html, reports.html, chat.html, settings.html : সাইটের পেজ
- style.css, db.js, reports.js, sample-data.js, chat.js, polish.js : শেয়ার্ড কোড (polish.js শুধু সাজসজ্জার জন্য)
- api/ask.js, api/settings/status.js, api/_lib.js : Vercel-এর ব্যাকএন্ড (AI চ্যাটের জন্য)
- server.js : শুধু নিজের কম্পিউটারে (localhost:3000) চালানোর জন্য, Vercel-এ লাগে না

## Vercel-এ চালানো (নিজের পিসিতে Node.js ইনস্টল ছাড়া)
1. এই ফোল্ডারটা GitHub রিপোজিটরিতে পুশ করো।
2. vercel.com এ GitHub দিয়ে লগইন করে Add New > Project > এই রিপোজিটরি Import করো। (Framework: Other, বাকি সব ডিফল্ট)
3. Deploy চাপার আগে Environment Variables-এ দাও:
   Name  = CHATTERMATE_API_KEY
   Value = তোমার ChatterMate key (cm_live_...)
4. Deploy চাপো। হয়ে গেলে লিঙ্কে সাইট খুলবে।
5. পরে key বদলালে: Settings > Environment Variables এ বদলে Deployments > Redeploy করো।

## Codespaces বা নিজের কম্পিউটারে চালানো
.env ফাইলে একটা লাইন: CHATTERMATE_API_KEY=cm_live_...
চালাও: node --env-file=.env server.js   তারপর http://localhost:3000

## সাবধান
- .env কখনো GitHub-এ বা ZIP-এ দেবে না (.gitignore-এ আছে)।
- GitHub Pages-এ AI চ্যাট চলবে না, Vercel ব্যবহার করো।
- প্রথমবার Dashboard থেকে "Load sample data" চাপো।
