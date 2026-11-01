/* ============================================================
   LifeBridge Hospital - Deterministic Sample Data Generator (sample-data.js)
   এটি চালালে পূর্বের সব ডেটা মুছে গিয়ে ৫০ জন রোগী, ১৩০টি ভিজিট,
   ৭০টি ল্যাব টেস্ট ও সামঞ্জস্যপূর্ণ পেমেন্ট লোড হয়।
   সবার জন্য একই ফলাফল পেতে Mulberry32 সিডেড র‍্যান্ডম ব্যবহৃত হয়েছে।
   ============================================================ */

// সিডেড র‍্যান্ডম জেনারেটর (Mulberry32) - যাতে রিফ্রেশ বা বারবার লোড করলেও ফিক্সড ডেটা আসে
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ফিক্সড সিড
var rnd = mulberry32(123456789);

// র‍্যান্ডম ইন্টিজার জেনারেটর [min, max]
function randInt(min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

// অ্যারে থেকে র‍্যান্ডম আইটেম পছন্দ করা
function randChoice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/* ------------------------------------------------------------
   সব ডেটা মুছে ফেলার ফাংশন (Reset)
   ------------------------------------------------------------ */
function clearAllData() {
  if (confirm("Are you sure you want to delete ALL hospital data? This cannot be undone.")) {
    localStorage.removeItem("hms_patients");
    localStorage.removeItem("hms_doctors");
    localStorage.removeItem("hms_staff");
    localStorage.removeItem("hms_visits");
    localStorage.removeItem("hms_labOrders");
    localStorage.removeItem("hms_charges");
    localStorage.removeItem("hms_payments");
    localStorage.removeItem("hms_settings");
    localStorage.removeItem("hms_hospital_profile");
    localStorage.removeItem("hms_theme");
    alert("All hospital data has been cleared.");
    location.reload();
  }
}

/* ------------------------------------------------------------
   নমুনা ডেটা জেনারেট ও লোড করার মূল ফাংশন
   ------------------------------------------------------------ */
function loadSampleData() {
  if (!confirm("This will REPLACE all current hospital data with fresh sample data. Continue?")) {
    return;
  }

  // সিড রিসেট করা যাতে প্রতিবার ঠিক একই সিকোয়েন্সে ডেটা তৈরি হয়
  rnd = mulberry32(987654321);

  var today = todayStr();

  /* ----------------------------------------------------------
     ১. নির্দিষ্ট ৫ জন ডাক্তার তৈরি (Spec অনুযায়ী হুবহু)
     ---------------------------------------------------------- */
  var doctors = [
    { id: "D-001", name: "Dr. Rahman", department: "Medicine", fee: 800 },
    { id: "D-002", name: "Dr. Sultana", department: "Cardiology", fee: 1000 },
    { id: "D-003", name: "Dr. Karim", department: "Pediatrics", fee: 600 },
    { id: "D-004", name: "Dr. Nasrin", department: "Gynecology", fee: 900 },
    { id: "D-005", name: "Dr. Hasan", department: "Orthopedics", fee: 700 }
  ];

  var staff = [
    { id: "S-001", name: "Nadia Akter", role: "Nurse", department: "Emergency", shift: "Morning", phone: "01711000001", status: "On duty" },
    { id: "S-002", name: "Rafiq Hasan", role: "Lab Technician", department: "Laboratory", shift: "Day", phone: "01711000002", status: "On duty" },
    { id: "S-003", name: "Mitu Chowdhury", role: "Receptionist", department: "Front Desk", shift: "Morning", phone: "01711000003", status: "On duty" },
    { id: "S-004", name: "Jamal Uddin", role: "Pharmacist", department: "Pharmacy", shift: "Evening", phone: "01711000004", status: "On duty" },
    { id: "S-005", name: "Sonia Rahman", role: "Nurse", department: "Outpatient", shift: "Day", phone: "01711000005", status: "Off duty" }
  ];

  /* ----------------------------------------------------------
     ২. ৫০ জন বাংলাদেশি রোগীর তথ্য তৈরি (গত ৩০ দিনের মধ্যে ছড়ানো)
     ---------------------------------------------------------- */
  var firstNamesMale = ["Mohammad", "Abdul", "Rahim", "Karim", "Tanvir", "Sabbir", "Arif", "Mahmud", "Fahim", "Shafiq", "Zubair", "Nasir", "Kamal", "Tariq", "Imran"];
  var firstNamesFemale = ["Fatima", "Ayesha", "Nusrat", "Rina", "Shirin", "Sadia", "Tahmina", "Rokeya", "Farhana", "Mousumi", "Tasnim", "Sharmin", "Jesmin", "Nahid", "Sultana"];
  var lastNames = ["Khan", "Ahmed", "Chowdhury", "Hossain", "Islam", "Rahman", "Ali", "Sarker", "Bhuiyan", "Uddin", "Miah", "Hasan", "Akter", "Begum"];
  var areas = ["Mirpur, Dhaka", "Dhanmondi, Dhaka", "Uttara, Dhaka", "Mohammadpur, Dhaka", "Gulshan, Dhaka", "Badda, Dhaka", "Banani, Dhaka", "Motijheel, Dhaka", "Old Dhaka", "Malibagh, Dhaka", "Khilgaon, Dhaka", "Rampura, Dhaka"];

  var patients = [];
  for (var i = 1; i <= 50; i++) {
    var pId = "P-" + String(i).padStart(4, "0");
    var sex = (rnd() > 0.48) ? "Male" : "Female";
    var firstName = (sex === "Male") ? randChoice(firstNamesMale) : randChoice(firstNamesFemale);
    var lastName = randChoice(lastNames);
    var fullName = firstName + " " + lastName;

    var age;
    var ageR = rnd();
    if (ageR < 0.15) age = randInt(1, 12);        // শিশু
    else if (ageR < 0.35) age = randInt(13, 29);  // তরুণ
    else if (ageR < 0.75) age = randInt(30, 59);  // মধ্যবয়সী
    else age = randInt(60, 80);                   // বয়স্ক

    var phone = "01" + randChoice(["3", "7", "8", "9", "5", "6"]) + String(randInt(10000000, 99999999));
    var address = randChoice(areas);

    // রেজিস্ট্রেশন ডেট: গত ৩০ দিনের ভেতর (কয়েকজন আজ, কয়েকজন গত ৭ দিনে)
    var daysAgo;
    if (i <= 5) {
      daysAgo = 0; // আজ ৫ জন
    } else if (i <= 18) {
      daysAgo = randInt(1, 7); // গত ৭ দিনে ১৩ জন
    } else {
      daysAgo = randInt(8, 30); // বাকিরা ৮ থেকে ৩০ দিন আগে
    }
    var regDate = addDays(today, -daysAgo);

    patients.push({
      id: pId,
      name: fullName,
      age: age,
      sex: sex,
      phone: phone,
      address: address,
      regDate: regDate
    });
  }

  /* ----------------------------------------------------------
     ৩. প্রায় ১৩০টি ডাক্তার ভিজিট (Visits) ও চার্জ তৈরি
     শর্ত: Dr. Rahman (~35%), Dr. Karim (~25%), বাকিরা বাকিটুকু।
     ভিজিট রোগীর regDate-এর আগে হতে পারবে না।
     ---------------------------------------------------------- */
  var problems = [
    { p: "Fever and persistent cough for 4 days", m: "Tab Napa Extra 1+1+1, Syp Adryx 2 tsp thrice daily" },
    { p: "Severe chest pain and shortness of breath", m: "Tab Angilock 50mg 1+0+0, Tab Monas 10mg 0+0+1" },
    { p: "High blood pressure and morning headache", m: "Tab Camlosart 5/20 1+0+0, Lifestyle advice given" },
    { p: "Severe lower back pain radiating to left leg", m: "Tab Naprosyn 500mg 1+0+1, Tab Maxpro 20mg 1+0+1" },
    { p: "Child has acute diarrhea and vomiting", m: "Oral Rehydration Saline (ORS), Syp Zinc 1 tsp daily" },
    { p: "Generalized abdominal pain after heavy meals", m: "Cap Seclo 20mg 1+0+1, Syp Entacyd 2 tsp after meals" },
    { p: "Joint stiffness and knee swelling", m: "Tab Cartilage 1+0+1, Gel Fastum local application" },
    { p: "Pregnancy routine checkup with mild nausea", m: "Tab Folison 1+0+0, Tab Vomioff as needed" },
    { p: "Chronic fatigue, dizziness and pale skin", m: "Cap Fefol-Z 0+1+0, High protein diet" },
    { p: "Skin rash and itching on both hands", m: "Tab Bilastin 20mg 0+0+1, Dermasol-N ointment" }
  ];

  var visits = [];
  var charges = [];
  var visitCounter = 1;
  var chargeCounter = 1;

  for (var v = 1; v <= 130; v++) {
    var patient = randChoice(patients);

    // রোগীর regDate থেকে আজকের মধ্যে ভিজিটের তারিখ নির্ধারণ
    var daysSinceReg = 0;
    // তারিখের পার্থক্য হিসাব
    var regParts = patient.regDate.split("-");
    var todayParts = today.split("-");
    var dReg = new Date(regParts[0], regParts[1] - 1, regParts[2]);
    var dToday = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
    var diffDays = Math.max(0, Math.round((dToday - dReg) / (1000 * 60 * 60 * 24)));

    var visitDaysOffset = randInt(0, diffDays);
    var visitDate = addDays(patient.regDate, visitDaysOffset);

    // ডাক্তারের ভিজিট বণ্টন (Dr. Rahman 35%, Karim 25%, Sultana 15%, Nasrin 15%, Hasan 10%)
    var docR = rnd();
    var doc;
    if (docR < 0.35) doc = doctors[0];       // Dr. Rahman (Medicine)
    else if (docR < 0.60) doc = doctors[2];  // Dr. Karim (Pediatrics)
    else if (docR < 0.75) doc = doctors[1];  // Dr. Sultana (Cardiology)
    else if (docR < 0.90) doc = doctors[3];  // Dr. Nasrin (Gynecology)
    else doc = doctors[4];                   // Dr. Hasan (Orthopedics)

    var prob = randChoice(problems);
    var vId = "V-" + String(visitCounter++).padStart(4, "0");

    visits.push({
      id: vId,
      patientId: patient.id,
      doctorId: doc.id,
      date: visitDate,
      problem: prob.p,
      medicines: prob.m,
      fee: doc.fee
    });

    // প্রতি ভিজিটে চার্জ তৈরি
    var cId = "C-" + String(chargeCounter++).padStart(4, "0");
    charges.push({
      id: cId,
      patientId: patient.id,
      type: "visit",
      refId: vId,
      date: visitDate,
      amount: doc.fee,
      paid: 0 // নিচে পেমেন্ট সেকশনে আপডেট হবে
    });
  }

  /* ----------------------------------------------------------
     ৪. প্রায় ৭০টি ল্যাব টেস্ট অর্ডার ও চার্জ তৈরি
     শর্ত: ২৫% Pending (সাম্প্রতিক), ৭৫% Done সাথে রেজাল্ট টেক্সট।
     ---------------------------------------------------------- */
  var labResults = [
    "Normal limits. Hb: 13.5 g/dL, ESR: 12 mm/hr.",
    "Elevated fasting blood sugar: 7.8 mmol/L.",
    "Normal. Serum Creatinine: 0.9 mg/dL.",
    "Total Cholesterol high: 235 mg/dL, Triglycerides: 190 mg/dL.",
    "Pus cells 10-12 /HPF, RBC nil. UTI indicated.",
    "Chest X-Ray clear, no active lung lesion.",
    "Sinus rhythm, normal ECG tracing.",
    "Mild fatty liver grade-1, other organs normal.",
    "Dengue NS1 Antigen POSITIVE (+ve).",
    "TSH within normal range: 2.45 uIU/mL."
  ];

  var labOrders = [];
  var labCounter = 1;

  for (var l = 1; l <= 70; l++) {
    var lPatient = randChoice(patients);

    var lRegParts = lPatient.regDate.split("-");
    var lTodayParts = today.split("-");
    var ldReg = new Date(lRegParts[0], lRegParts[1] - 1, lRegParts[2]);
    var ldToday = new Date(lTodayParts[0], lTodayParts[1] - 1, lTodayParts[2]);
    var lDiffDays = Math.max(0, Math.round((ldToday - ldReg) / (1000 * 60 * 60 * 24)));

    var labDaysOffset = randInt(0, lDiffDays);
    var labDate = addDays(lPatient.regDate, labDaysOffset);

    var test = randChoice(LAB_TESTS);
    var lId = "L-" + String(labCounter++).padStart(4, "0");

    // সাম্প্রতিক টেস্টগুলো এবং সামগ্রিক ২৫% Pending থাকবে
    var isRecent = (labDate >= addDays(today, -3));
    var isPending = (isRecent && rnd() < 0.6) || (rnd() < 0.20);

    var status = isPending ? "Pending" : "Done";
    var resultText = isPending ? "" : randChoice(labResults);
    var doneDate = isPending ? "" : ((labDate === today) ? today : addDays(labDate, randInt(0, 1)));
    if (doneDate > today) doneDate = today;

    labOrders.push({
      id: lId,
      patientId: lPatient.id,
      date: labDate,
      testName: test.name,
      price: test.price,
      status: status,
      result: resultText,
      doneDate: doneDate
    });

    // প্রতি ল্যাব টেস্টের জন্য চার্জ তৈরি
    var cLabId = "C-" + String(chargeCounter++).padStart(4, "0");
    charges.push({
      id: cLabId,
      patientId: lPatient.id,
      type: "lab",
      refId: lId,
      date: labDate,
      amount: test.price,
      paid: 0 // নিচে পেমেন্ট সেকশনে আপডেট হবে
    });
  }

  /* ----------------------------------------------------------
     ৫. পেমেন্ট তৈরি ও চার্জের সাথে নিখুঁতভাবে সমন্বয় (Payments Allocation)
     শর্ত: ~৭০% ফুল পেইড, ~১৫% আংশিক পেইড, ~১৫% আনপেইড।
     আজকের তারিখে অন্তত ৮টি পেমেন্ট থাকবে (visit ও lab দুটোই)।
     কমপক্ষে ৮ জন রোগীর বকেয়া (Due) থাকবে।
     কোনো ওভারপেমেন্ট হবে না। charge.paid = sum(payments)
     ---------------------------------------------------------- */
  var payments = [];
  var payCounter = 1;
  var receiptCounter = 1;
  var paymentMethods = ["Cash", "Card", "bKash"];

  // চার্জগুলোকে তারিখ অনুযায়ী সাজানো
  charges.sort(function(a, b) {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return a.id.localeCompare(b.id);
  });

  // রোগী অনুযায়ী চার্জ গ্রুপ করা
  var chargesByPatient = {};
  for (var cIdx = 0; cIdx < charges.length; cIdx++) {
    var ch = charges[cIdx];
    if (!chargesByPatient[ch.patientId]) {
      chargesByPatient[ch.patientId] = [];
    }
    chargesByPatient[ch.patientId].push(ch);
  }

  // নিশ্চিতভাবে কমপক্ষে ৮ জন রোগীকে বকেয়া (Due) রাখতে সিলেক্ট করা হলো
  var duePatientIds = {};
  for (var dp = 1; dp <= 10; dp++) {
    var pDue = patients[patients.length - dp]; // শেষের দিকের রোগী
    duePatientIds[pDue.id] = true;
  }

  // প্রতিটি চার্জের জন্য পেমেন্ট নির্ধারণ
  for (var k = 0; k < charges.length; k++) {
    var targetCharge = charges[k];
    var isDesignatedDuePatient = !!duePatientIds[targetCharge.patientId];

    // পেমেন্টের স্ট্যাটাস ভাগ করা
    var payRoll = rnd();
    var payAmount = 0;

    if (isDesignatedDuePatient && payRoll < 0.70) {
      // এই ১০ জন রোগীর ক্ষেত্রে বকেয়া তৈরি রাখা হবে (Unpaid বা Partial)
      if (payRoll < 0.40) {
        payAmount = 0; // Unpaid
      } else {
        // আংশিক পরিশোধ (Partial)
        payAmount = Math.floor((targetCharge.amount * 0.4) / 50) * 50;
        if (payAmount <= 0) payAmount = Math.min(100, targetCharge.amount);
      }
    } else {
      // সাধারণ ক্ষেত্রে: ৭০% ফুল, ১৫% পার্ট, ১৫% আনপেইড
      if (payRoll < 0.72) {
        payAmount = targetCharge.amount; // Fully Paid
      } else if (payRoll < 0.86) {
        payAmount = Math.floor((targetCharge.amount * 0.5) / 50) * 50; // Partial
        if (payAmount <= 0) payAmount = Math.min(100, targetCharge.amount);
      } else {
        payAmount = 0; // Unpaid
      }
    }

    if (payAmount > 0) {
      targetCharge.paid = payAmount;

      // পেমেন্টের তারিখ নির্ধারণ (চার্জের দিন বা পরে, কিন্তু আজকের পরে নয়)
      var pDaysDiff = 0;
      var cParts = targetCharge.date.split("-");
      var tParts = today.split("-");
      var dC = new Date(cParts[0], cParts[1] - 1, cParts[2]);
      var dT = new Date(tParts[0], tParts[1] - 1, tParts[2]);
      var maxOffset = Math.max(0, Math.round((dT - dC) / (1000 * 60 * 60 * 24)));

      var pOffset = randInt(0, Math.min(maxOffset, 3));
      var paymentDate = addDays(targetCharge.date, pOffset);
      if (paymentDate > today) paymentDate = today;

      var rId = "R-" + String(receiptCounter++).padStart(4, "0");
      var payId = "PAY-" + String(payCounter++).padStart(4, "0");

      payments.push({
        id: payId,
        receiptId: rId,
        patientId: targetCharge.patientId,
        chargeId: targetCharge.id,
        type: targetCharge.type,
        amount: payAmount,
        method: randChoice(paymentMethods),
        date: paymentDate
      });
    }
  }

  // নিশ্চিত করা: আজকের তারিখে যেন অন্তত ৮টি পেমেন্ট থাকে (visit ও lab দুটোই)
  var todayPayments = payments.filter(function(p) { return p.date === today; });
  if (todayPayments.length < 8) {
    // কিছু সাম্প্রতিক পেমেন্টের তারিখ আজকের তারিখ বানিয়ে নিশ্চিত করা
    var needed = 8 - todayPayments.length;
    var modified = 0;
    for (var m = payments.length - 1; m >= 0 && modified < needed; m--) {
      if (payments[m].date !== today) {
        payments[m].date = today;
        modified++;
      }
    }
  }

  // ল্যাব এবং ভিজিট উভয় ধরনের অন্তত ২টি পেমেন্ট আজ আছে কিনা যাচাই ও ঠিক করা
  var todayVisits = payments.filter(function(p) { return p.date === today && p.type === "visit"; });
  var todayLabs = payments.filter(function(p) { return p.date === today && p.type === "lab"; });

  if (todayVisits.length < 2) {
    for (var tv = 0; tv < payments.length; tv++) {
      if (payments[tv].type === "visit") {
        payments[tv].date = today;
        break;
      }
    }
  }
  if (todayLabs.length < 2) {
    for (var tl = 0; tl < payments.length; tl++) {
      if (payments[tl].type === "lab") {
        payments[tl].date = today;
        break;
      }
    }
  }

  /* ----------------------------------------------------------
     ৬. ডেটাবেসে সংরক্ষণ
     ---------------------------------------------------------- */
  save("hms_doctors", doctors);
  save("hms_staff", staff);
  save("hms_patients", patients);
  save("hms_visits", visits);
  save("hms_labOrders", labOrders);
  save("hms_charges", charges);
  save("hms_payments", payments);

  // কতজন রোগীর বকেয়া আছে হিসাব
  var patientsWithDue = 0;
  for (var pi = 0; pi < patients.length; pi++) {
    if (getPatientDue(patients[pi].id) > 0) {
      patientsWithDue++;
    }
  }

  // আজ কত টাকা পেমেন্ট হলো
  var todayCollection = 0;
  for (var ti = 0; ti < payments.length; ti++) {
    if (payments[ti].date === today) {
      todayCollection += payments[ti].amount;
    }
  }

  // সফল মেসেজ দেখানো (English)
  var summaryMsg = "Sample Data Loaded Successfully!\n\n" +
    "- Doctors: " + doctors.length + "\n" +
    "- Hospital Staff: " + staff.length + "\n" +
    "- Patients: " + patients.length + " (" + patientsWithDue + " have due)\n" +
    "- Doctor Visits: " + visits.length + "\n" +
    "- Lab Orders: " + labOrders.length + "\n" +
    "- Total Charges: " + charges.length + "\n" +
    "- Total Payments: " + payments.length + "\n" +
    "- Today's Collection: " + formatMoney(todayCollection);

  alert(summaryMsg);
  location.reload();
}
