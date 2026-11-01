/* ============================================================
   LifeBridge Hospital - Deterministic Sample Data Generator (sample-data.js)
   à¦à¦Ÿà¦¿ à¦šà¦¾à¦²à¦¾à¦²à§‡ à¦ªà§‚à¦°à§à¦¬à§‡à¦° à¦¸à¦¬ à¦¡à§‡à¦Ÿà¦¾ à¦®à§à¦›à§‡ à¦—à¦¿à¦¯à¦¼à§‡ à§«à§¦ à¦œà¦¨ à¦°à§‹à¦—à§€, à§§à§©à§¦à¦Ÿà¦¿ à¦­à¦¿à¦œà¦¿à¦Ÿ,
   à§­à§¦à¦Ÿà¦¿ à¦²à§à¦¯à¦¾à¦¬ à¦Ÿà§‡à¦¸à§à¦Ÿ à¦“ à¦¸à¦¾à¦®à¦žà§à¦œà¦¸à§à¦¯à¦ªà§‚à¦°à§à¦£ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦²à§‹à¦¡ à¦¹à§Ÿà¥¤
   à¦¸à¦¬à¦¾à¦° à¦œà¦¨à§à¦¯ à¦à¦•à¦‡ à¦«à¦²à¦¾à¦«à¦² à¦ªà§‡à¦¤à§‡ Mulberry32 à¦¸à¦¿à¦¡à§‡à¦¡ à¦°â€à§à¦¯à¦¾à¦¨à§à¦¡à¦® à¦¬à§à¦¯à¦¬à¦¹à§ƒà¦¤ à¦¹à§Ÿà§‡à¦›à§‡à¥¤
   ============================================================ */

// à¦¸à¦¿à¦¡à§‡à¦¡ à¦°â€à§à¦¯à¦¾à¦¨à§à¦¡à¦® à¦œà§‡à¦¨à¦¾à¦°à§‡à¦Ÿà¦° (Mulberry32) - à¦¯à¦¾à¦¤à§‡ à¦°à¦¿à¦«à§à¦°à§‡à¦¶ à¦¬à¦¾ à¦¬à¦¾à¦°à¦¬à¦¾à¦° à¦²à§‹à¦¡ à¦•à¦°à¦²à§‡à¦“ à¦«à¦¿à¦•à§à¦¸à¦¡ à¦¡à§‡à¦Ÿà¦¾ à¦†à¦¸à§‡
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// à¦«à¦¿à¦•à§à¦¸à¦¡ à¦¸à¦¿à¦¡
var rnd = mulberry32(123456789);

// à¦°â€à§à¦¯à¦¾à¦¨à§à¦¡à¦® à¦‡à¦¨à§à¦Ÿà¦¿à¦œà¦¾à¦° à¦œà§‡à¦¨à¦¾à¦°à§‡à¦Ÿà¦° [min, max]
function randInt(min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

// à¦…à§à¦¯à¦¾à¦°à§‡ à¦¥à§‡à¦•à§‡ à¦°â€à§à¦¯à¦¾à¦¨à§à¦¡à¦® à¦†à¦‡à¦Ÿà§‡à¦® à¦ªà¦›à¦¨à§à¦¦ à¦•à¦°à¦¾
function randChoice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/* ------------------------------------------------------------
   à¦¸à¦¬ à¦¡à§‡à¦Ÿà¦¾ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾à¦° à¦«à¦¾à¦‚à¦¶à¦¨ (Reset)
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
   à¦¨à¦®à§à¦¨à¦¾ à¦¡à§‡à¦Ÿà¦¾ à¦œà§‡à¦¨à¦¾à¦°à§‡à¦Ÿ à¦“ à¦²à§‹à¦¡ à¦•à¦°à¦¾à¦° à¦®à§‚à¦² à¦«à¦¾à¦‚à¦¶à¦¨
   ------------------------------------------------------------ */
function loadSampleData() {
  if (!confirm("This will REPLACE all current hospital data with fresh sample data. Continue?")) {
    return;
  }

  // à¦¸à¦¿à¦¡ à¦°à¦¿à¦¸à§‡à¦Ÿ à¦•à¦°à¦¾ à¦¯à¦¾à¦¤à§‡ à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¾à¦° à¦ à¦¿à¦• à¦à¦•à¦‡ à¦¸à¦¿à¦•à§‹à¦¯à¦¼à§‡à¦¨à§à¦¸à§‡ à¦¡à§‡à¦Ÿà¦¾ à¦¤à§ˆà¦°à¦¿ à¦¹à¦¯à¦¼
  rnd = mulberry32(987654321);

  var today = todayStr();

  /* ----------------------------------------------------------
     à§§. à¦¨à¦¿à¦°à§à¦¦à¦¿à¦·à§à¦Ÿ à§« à¦œà¦¨ à¦¡à¦¾à¦•à§à¦¤à¦¾à¦° à¦¤à§ˆà¦°à¦¿ (Spec à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦¹à§à¦¬à¦¹à§)
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
     à§¨. à§«à§¦ à¦œà¦¨ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à¦¿ à¦°à§‹à¦—à§€à¦° à¦¤à¦¥à§à¦¯ à¦¤à§ˆà¦°à¦¿ (à¦—à¦¤ à§©à§¦ à¦¦à¦¿à¦¨à§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦›à¦¡à¦¼à¦¾à¦¨à§‹)
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
    if (ageR < 0.15) age = randInt(1, 12);        // à¦¶à¦¿à¦¶à§
    else if (ageR < 0.35) age = randInt(13, 29);  // à¦¤à¦°à§à¦£
    else if (ageR < 0.75) age = randInt(30, 59);  // à¦®à¦§à§à¦¯à¦¬à¦¯à¦¼à¦¸à§€
    else age = randInt(60, 80);                   // à¦¬à¦¯à¦¼à¦¸à§à¦•

    var phone = "01" + randChoice(["3", "7", "8", "9", "5", "6"]) + String(randInt(10000000, 99999999));
    var address = randChoice(areas);

    // à¦°à§‡à¦œà¦¿à¦¸à§à¦Ÿà§à¦°à§‡à¦¶à¦¨ à¦¡à§‡à¦Ÿ: à¦—à¦¤ à§©à§¦ à¦¦à¦¿à¦¨à§‡à¦° à¦­à§‡à¦¤à¦° (à¦•à¦¯à¦¼à§‡à¦•à¦œà¦¨ à¦†à¦œ, à¦•à¦¯à¦¼à§‡à¦•à¦œà¦¨ à¦—à¦¤ à§­ à¦¦à¦¿à¦¨à§‡)
    var daysAgo;
    if (i <= 5) {
      daysAgo = 0; // à¦†à¦œ à§« à¦œà¦¨
    } else if (i <= 18) {
      daysAgo = randInt(1, 7); // à¦—à¦¤ à§­ à¦¦à¦¿à¦¨à§‡ à§§à§© à¦œà¦¨
    } else {
      daysAgo = randInt(8, 30); // à¦¬à¦¾à¦•à¦¿à¦°à¦¾ à§® à¦¥à§‡à¦•à§‡ à§©à§¦ à¦¦à¦¿à¦¨ à¦†à¦—à§‡
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
     à§©. à¦ªà§à¦°à¦¾à¦¯à¦¼ à§§à§©à§¦à¦Ÿà¦¿ à¦¡à¦¾à¦•à§à¦¤à¦¾à¦° à¦­à¦¿à¦œà¦¿à¦Ÿ (Visits) à¦“ à¦šà¦¾à¦°à§à¦œ à¦¤à§ˆà¦°à¦¿
     à¦¶à¦°à§à¦¤: Dr. Rahman (~35%), Dr. Karim (~25%), à¦¬à¦¾à¦•à¦¿à¦°à¦¾ à¦¬à¦¾à¦•à¦¿à¦Ÿà§à¦•à§à¥¤
     à¦­à¦¿à¦œà¦¿à¦Ÿ à¦°à§‹à¦—à§€à¦° regDate-à¦à¦° à¦†à¦—à§‡ à¦¹à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡ à¦¨à¦¾à¥¤
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

    // à¦°à§‹à¦—à§€à¦° regDate à¦¥à§‡à¦•à§‡ à¦†à¦œà¦•à§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦­à¦¿à¦œà¦¿à¦Ÿà§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦£
    var daysSinceReg = 0;
    // à¦¤à¦¾à¦°à¦¿à¦–à§‡à¦° à¦ªà¦¾à¦°à§à¦¥à¦•à§à¦¯ à¦¹à¦¿à¦¸à¦¾à¦¬
    var regParts = patient.regDate.split("-");
    var todayParts = today.split("-");
    var dReg = new Date(regParts[0], regParts[1] - 1, regParts[2]);
    var dToday = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
    var diffDays = Math.max(0, Math.round((dToday - dReg) / (1000 * 60 * 60 * 24)));

    var visitDaysOffset = randInt(0, diffDays);
    var visitDate = addDays(patient.regDate, visitDaysOffset);

    // à¦¡à¦¾à¦•à§à¦¤à¦¾à¦°à§‡à¦° à¦­à¦¿à¦œà¦¿à¦Ÿ à¦¬à¦£à§à¦Ÿà¦¨ (Dr. Rahman 35%, Karim 25%, Sultana 15%, Nasrin 15%, Hasan 10%)
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

    // à¦ªà§à¦°à¦¤à¦¿ à¦­à¦¿à¦œà¦¿à¦Ÿà§‡ à¦šà¦¾à¦°à§à¦œ à¦¤à§ˆà¦°à¦¿
    var cId = "C-" + String(chargeCounter++).padStart(4, "0");
    charges.push({
      id: cId,
      patientId: patient.id,
      type: "visit",
      refId: vId,
      date: visitDate,
      amount: doc.fee,
      paid: 0 // à¦¨à¦¿à¦šà§‡ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¸à§‡à¦•à¦¶à¦¨à§‡ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¹à¦¬à§‡
    });
  }

  /* ----------------------------------------------------------
     à§ª. à¦ªà§à¦°à¦¾à¦¯à¦¼ à§­à§¦à¦Ÿà¦¿ à¦²à§à¦¯à¦¾à¦¬ à¦Ÿà§‡à¦¸à§à¦Ÿ à¦…à¦°à§à¦¡à¦¾à¦° à¦“ à¦šà¦¾à¦°à§à¦œ à¦¤à§ˆà¦°à¦¿
     à¦¶à¦°à§à¦¤: à§¨à§«% Pending (à¦¸à¦¾à¦®à§à¦ªà§à¦°à¦¤à¦¿à¦•), à§­à§«% Done à¦¸à¦¾à¦¥à§‡ à¦°à§‡à¦œà¦¾à¦²à§à¦Ÿ à¦Ÿà§‡à¦•à§à¦¸à¦Ÿà¥¤
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

    // à¦¸à¦¾à¦®à§à¦ªà§à¦°à¦¤à¦¿à¦• à¦Ÿà§‡à¦¸à§à¦Ÿà¦—à§à¦²à§‹ à¦à¦¬à¦‚ à¦¸à¦¾à¦®à¦—à§à¦°à¦¿à¦• à§¨à§«% Pending à¦¥à¦¾à¦•à¦¬à§‡
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

    // à¦ªà§à¦°à¦¤à¦¿ à¦²à§à¦¯à¦¾à¦¬ à¦Ÿà§‡à¦¸à§à¦Ÿà§‡à¦° à¦œà¦¨à§à¦¯ à¦šà¦¾à¦°à§à¦œ à¦¤à§ˆà¦°à¦¿
    var cLabId = "C-" + String(chargeCounter++).padStart(4, "0");
    charges.push({
      id: cLabId,
      patientId: lPatient.id,
      type: "lab",
      refId: lId,
      date: labDate,
      amount: test.price,
      paid: 0 // à¦¨à¦¿à¦šà§‡ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¸à§‡à¦•à¦¶à¦¨à§‡ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¹à¦¬à§‡
    });
  }

  /* ----------------------------------------------------------
     à§«. à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¤à§ˆà¦°à¦¿ à¦“ à¦šà¦¾à¦°à§à¦œà§‡à¦° à¦¸à¦¾à¦¥à§‡ à¦¨à¦¿à¦–à§à¦à¦¤à¦­à¦¾à¦¬à§‡ à¦¸à¦®à¦¨à§à¦¬à§Ÿ (Payments Allocation)
     à¦¶à¦°à§à¦¤: ~à§­à§¦% à¦«à§à¦² à¦ªà§‡à¦‡à¦¡, ~à§§à§«% à¦†à¦‚à¦¶à¦¿à¦• à¦ªà§‡à¦‡à¦¡, ~à§§à§«% à¦†à¦¨à¦ªà§‡à¦‡à¦¡à¥¤
     à¦†à¦œà¦•à§‡à¦° à¦¤à¦¾à¦°à¦¿à¦–à§‡ à¦…à¦¨à§à¦¤à¦¤ à§®à¦Ÿà¦¿ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¥à¦¾à¦•à¦¬à§‡ (visit à¦“ lab à¦¦à§à¦Ÿà§‹à¦‡)à¥¤
     à¦•à¦®à¦ªà¦•à§à¦·à§‡ à§® à¦œà¦¨ à¦°à§‹à¦—à§€à¦° à¦¬à¦•à§‡à¦¯à¦¼à¦¾ (Due) à¦¥à¦¾à¦•à¦¬à§‡à¥¤
     à¦•à§‹à¦¨à§‹ à¦“à¦­à¦¾à¦°à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¹à¦¬à§‡ à¦¨à¦¾à¥¤ charge.paid = sum(payments)
     ---------------------------------------------------------- */
  var payments = [];
  var payCounter = 1;
  var receiptCounter = 1;
  var paymentMethods = ["Cash", "Card", "bKash"];

  // à¦šà¦¾à¦°à§à¦œà¦—à§à¦²à§‹à¦•à§‡ à¦¤à¦¾à¦°à¦¿à¦– à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦¸à¦¾à¦œà¦¾à¦¨à§‹
  charges.sort(function(a, b) {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return a.id.localeCompare(b.id);
  });

  // à¦°à§‹à¦—à§€ à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦šà¦¾à¦°à§à¦œ à¦—à§à¦°à§à¦ª à¦•à¦°à¦¾
  var chargesByPatient = {};
  for (var cIdx = 0; cIdx < charges.length; cIdx++) {
    var ch = charges[cIdx];
    if (!chargesByPatient[ch.patientId]) {
      chargesByPatient[ch.patientId] = [];
    }
    chargesByPatient[ch.patientId].push(ch);
  }

  // à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤à¦­à¦¾à¦¬à§‡ à¦•à¦®à¦ªà¦•à§à¦·à§‡ à§® à¦œà¦¨ à¦°à§‹à¦—à§€à¦•à§‡ à¦¬à¦•à§‡à§Ÿà¦¾ (Due) à¦°à¦¾à¦–à¦¤à§‡ à¦¸à¦¿à¦²à§‡à¦•à§à¦Ÿ à¦•à¦°à¦¾ à¦¹à¦²à§‹
  var duePatientIds = {};
  for (var dp = 1; dp <= 10; dp++) {
    var pDue = patients[patients.length - dp]; // à¦¶à§‡à¦·à§‡à¦° à¦¦à¦¿à¦•à§‡à¦° à¦°à§‹à¦—à§€
    duePatientIds[pDue.id] = true;
  }

  // à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦šà¦¾à¦°à§à¦œà§‡à¦° à¦œà¦¨à§à¦¯ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦£
  for (var k = 0; k < charges.length; k++) {
    var targetCharge = charges[k];
    var isDesignatedDuePatient = !!duePatientIds[targetCharge.patientId];

    // à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿà§‡à¦° à¦¸à§à¦Ÿà§à¦¯à¦¾à¦Ÿà¦¾à¦¸ à¦­à¦¾à¦— à¦•à¦°à¦¾
    var payRoll = rnd();
    var payAmount = 0;

    if (isDesignatedDuePatient && payRoll < 0.70) {
      // à¦à¦‡ à§§à§¦ à¦œà¦¨ à¦°à§‹à¦—à§€à¦° à¦•à§à¦·à§‡à¦¤à§à¦°à§‡ à¦¬à¦•à§‡à¦¯à¦¼à¦¾ à¦¤à§ˆà¦°à¦¿ à¦°à¦¾à¦–à¦¾ à¦¹à¦¬à§‡ (Unpaid à¦¬à¦¾ Partial)
      if (payRoll < 0.40) {
        payAmount = 0; // Unpaid
      } else {
        // à¦†à¦‚à¦¶à¦¿à¦• à¦ªà¦°à¦¿à¦¶à§‹à¦§ (Partial)
        payAmount = Math.floor((targetCharge.amount * 0.4) / 50) * 50;
        if (payAmount <= 0) payAmount = Math.min(100, targetCharge.amount);
      }
    } else {
      // à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦•à§à¦·à§‡à¦¤à§à¦°à§‡: à§­à§¦% à¦«à§à¦², à§§à§«% à¦ªà¦¾à¦°à§à¦Ÿ, à§§à§«% à¦†à¦¨à¦ªà§‡à¦‡à¦¡
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

      // à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿà§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦£ (à¦šà¦¾à¦°à§à¦œà§‡à¦° à¦¦à¦¿à¦¨ à¦¬à¦¾ à¦ªà¦°à§‡, à¦•à¦¿à¦¨à§à¦¤à§ à¦†à¦œà¦•à§‡à¦° à¦ªà¦°à§‡ à¦¨à¦¯à¦¼)
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

  // à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à¦¾: à¦†à¦œà¦•à§‡à¦° à¦¤à¦¾à¦°à¦¿à¦–à§‡ à¦¯à§‡à¦¨ à¦…à¦¨à§à¦¤à¦¤ à§®à¦Ÿà¦¿ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¥à¦¾à¦•à§‡ (visit à¦“ lab à¦¦à§à¦Ÿà§‹à¦‡)
  var todayPayments = payments.filter(function(p) { return p.date === today; });
  if (todayPayments.length < 8) {
    // à¦•à¦¿à¦›à§ à¦¸à¦¾à¦®à§à¦ªà§à¦°à¦¤à¦¿à¦• à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿà§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– à¦†à¦œà¦•à§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– à¦¬à¦¾à¦¨à¦¿à§Ÿà§‡ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à¦¾
    var needed = 8 - todayPayments.length;
    var modified = 0;
    for (var m = payments.length - 1; m >= 0 && modified < needed; m--) {
      if (payments[m].date !== today) {
        payments[m].date = today;
        modified++;
      }
    }
  }

  // à¦²à§à¦¯à¦¾à¦¬ à¦à¦¬à¦‚ à¦­à¦¿à¦œà¦¿à¦Ÿ à¦‰à¦­à¦¯à¦¼ à¦§à¦°à¦¨à§‡à¦° à¦…à¦¨à§à¦¤à¦¤ à§¨à¦Ÿà¦¿ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦†à¦œ à¦†à¦›à§‡ à¦•à¦¿à¦¨à¦¾ à¦¯à¦¾à¦šà¦¾à¦‡ à¦“ à¦ à¦¿à¦• à¦•à¦°à¦¾
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
     à§¬. à¦¡à§‡à¦Ÿà¦¾à¦¬à§‡à¦¸à§‡ à¦¸à¦‚à¦°à¦•à§à¦·à¦£
     ---------------------------------------------------------- */
  save("hms_doctors", doctors);
  save("hms_staff", staff);
  save("hms_patients", patients);
  save("hms_visits", visits);
  save("hms_labOrders", labOrders);
  save("hms_charges", charges);
  save("hms_payments", payments);

  // à¦•à¦¤à¦œà¦¨ à¦°à§‹à¦—à§€à¦° à¦¬à¦•à§‡à¦¯à¦¼à¦¾ à¦†à¦›à§‡ à¦¹à¦¿à¦¸à¦¾à¦¬
  var patientsWithDue = 0;
  for (var pi = 0; pi < patients.length; pi++) {
    if (getPatientDue(patients[pi].id) > 0) {
      patientsWithDue++;
    }
  }

  // à¦†à¦œ à¦•à¦¤ à¦Ÿà¦¾à¦•à¦¾ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¹à¦²à§‹
  var todayCollection = 0;
  for (var ti = 0; ti < payments.length; ti++) {
    if (payments[ti].date === today) {
      todayCollection += payments[ti].amount;
    }
  }

  // à¦¸à¦«à¦² à¦®à§‡à¦¸à§‡à¦œ à¦¦à§‡à¦–à¦¾à¦¨à§‹ (English)
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
