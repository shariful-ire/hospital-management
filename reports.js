// reports.js - বিশুদ্ধ হিসাব-নিকাশ ফাংশনসমূহ (Pure calculation functions)
// এই ফাইলে কোনো DOM বা HTML কোড নেই। শুধু ডেটা প্রসেসিং।
// chat.js এই ফাংশনগুলোই সরাসরি রি-ইউজ করবে, যাতে সব রিপোর্টে সংখ্যা সবসময় হুবহু মেলে।

/**
 * ১. দৈনিক আদায়ের হিসাব (Daily Collection Report)
 * @param {string} from - শুরু তারিখ YYYY-MM-DD
 * @param {string} to - শেষ তারিখ YYYY-MM-DD
 * @returns {object} { rows: [{date, visits, lab, total}], totalVisits, totalLab, totalReceived, totalDue }
 */
function getDailyCollection(from, to) {
  // hms_payments থেকে সব পেমেন্ট রেকর্ড লোড করি
  const payments = (typeof load === 'function') ? load('hms_payments') : [];
  const charges = (typeof load === 'function') ? load('hms_charges') : [];

  // তারিখ অনুযায়ী পেমেন্ট গ্রুপ করার অবজেক্ট
  const dayMap = {};

  payments.forEach(p => {
    const pDate = p.date;
    // তারিখ রেঞ্জের মধ্যে আছে কিনা যাচাই (ইনক্লুসিভ)
    if (pDate >= from && pDate <= to) {
      if (!dayMap[pDate]) {
        dayMap[pDate] = { visits: 0, lab: 0, total: 0 };
      }
      const amt = Number(p.amount) || 0;
      if (p.type === 'visit') {
        dayMap[pDate].visits += amt;
      } else if (p.type === 'lab') {
        dayMap[pDate].lab += amt;
      }
      dayMap[pDate].total += amt;
    }
  });

  // তারিখ অনুযায়ী সাজিয়ে অ্যারে বানানো
  const sortedDates = Object.keys(dayMap).sort();
  let totalVisits = 0;
  let totalLab = 0;
  let totalReceived = 0;

  const rows = sortedDates.map(d => {
    const item = dayMap[d];
    totalVisits += item.visits;
    totalLab += item.lab;
    totalReceived += item.total;
    return {
      date: d,
      visits: item.visits,
      lab: item.lab,
      total: item.total
    };
  });

  // বর্তমান মোট বকেয়া (সব চার্জের unpaid অংশ, তারিখ ফিল্টার ছাড়া)
  let totalDue = 0;
  charges.forEach(c => {
    const amt = Number(c.amount) || 0;
    const paid = Number(c.paid) || 0;
    const due = amt - paid;
    if (due > 0) {
      totalDue += due;
    }
  });

  return {
    rows: rows,
    totalVisits: totalVisits,
    totalLab: totalLab,
    totalReceived: totalReceived,
    totalDue: totalDue
  };
}

/**
 * ২. তারিখ অনুযায়ী নিবন্ধিত রোগী (Patients Registered in Range)
 * @param {string} from - শুরু তারিখ YYYY-MM-DD
 * @param {string} to - শেষ তারিখ YYYY-MM-DD
 * @returns {object} { rows: [patient objects, newest first], count }
 */
function getPatientsInRange(from, to) {
  const patients = (typeof load === 'function') ? load('hms_patients') : [];

  // রেঞ্জের ভেতরের রোগীকে ফিল্টার করি
  const filtered = patients.filter(p => {
    return p.regDate >= from && p.regDate <= to;
  });

  // নতুন থেকে পুরোনো ক্রমে সাজানো (Newest first: তারিখ বড় থেকে ছোট, তারপর আইডি বড় থেকে ছোট)
  filtered.sort((a, b) => {
    if (b.regDate !== a.regDate) {
      return b.regDate.localeCompare(a.regDate);
    }
    return b.id.localeCompare(a.id);
  });

  return {
    rows: filtered,
    count: filtered.length
  };
}

/**
 * ৩. ডাক্তার অনুযায়ী ভিজিট ও ফি রিপোর্ট (Doctor-wise Report)
 * @param {string} from - শুরু তারিখ YYYY-MM-DD
 * @param {string} to - শেষ তারিখ YYYY-MM-DD
 * @returns {object} { rows: [{doctorId, name, department, visits, fees}], totalVisits, totalFees }
 */
function getDoctorReport(from, to) {
  const doctors = (typeof load === 'function') ? load('hms_doctors') : [];
  const visits = (typeof load === 'function') ? load('hms_visits') : [];

  // প্রতিটি ডাক্তারের জন্য প্রাথমিক কাউন্টার
  const docStats = {};
  doctors.forEach(d => {
    docStats[d.id] = {
      doctorId: d.id,
      name: d.name,
      department: d.department,
      visits: 0,
      fees: 0
    };
  });

  // ভিজিট ডেটা যোগ করা (visit date অনুযায়ী ফিল্টার)
  visits.forEach(v => {
    if (v.date >= from && v.date <= to) {
      if (docStats[v.doctorId]) {
        docStats[v.doctorId].visits += 1;
        docStats[v.doctorId].fees += (Number(v.fee) || 0);
      }
    }
  });

  // অ্যারেকে visits সংখ্যা অনুসারে বড় থেকে ছোট (descending) সাজানো
  const rows = Object.values(docStats).sort((a, b) => {
    if (b.visits !== a.visits) {
      return b.visits - a.visits;
    }
    return b.fees - a.fees;
  });

  let totalVisits = 0;
  let totalFees = 0;
  rows.forEach(r => {
    totalVisits += r.visits;
    totalFees += r.fees;
  });

  return {
    rows: rows,
    totalVisits: totalVisits,
    totalFees: totalFees
  };
}

/**
 * ৪. ল্যাব টেস্ট রিপোর্ট (Lab Tests Report)
 * @param {string} from - শুরু তারিখ YYYY-MM-DD
 * @param {string} to - শেষ তারিখ YYYY-MM-DD
 * @returns {object} { rows: [{testName, ordered, done, pending, amount}], totalOrdered, totalDone, totalPending, totalAmount }
 */
function getLabReport(from, to) {
  const labOrders = (typeof load === 'function') ? load('hms_labOrders') : [];

  // শুধু অর্ডার হওয়া টেস্টগুলো গণনায় আসবে
  const testMap = {};

  labOrders.forEach(o => {
    if (o.date >= from && o.date <= to) {
      const name = o.testName;
      if (!testMap[name]) {
        testMap[name] = {
          testName: name,
          ordered: 0,
          done: 0,
          pending: 0,
          amount: 0
        };
      }
      testMap[name].ordered += 1;
      testMap[name].amount += (Number(o.price) || 0);

      if (o.status === 'Done') {
        testMap[name].done += 1;
      } else {
        testMap[name].pending += 1;
      }
    }
  });

  // অর্ডার সংখ্যা অনুযায়ী বড় থেকে ছোট সাজানো
  const rows = Object.values(testMap).sort((a, b) => {
    if (b.ordered !== a.ordered) {
      return b.ordered - a.ordered;
    }
    return b.amount - a.amount;
  });

  let totalOrdered = 0;
  let totalDone = 0;
  let totalPending = 0;
  let totalAmount = 0;

  rows.forEach(r => {
    totalOrdered += r.ordered;
    totalDone += r.done;
    totalPending += r.pending;
    totalAmount += r.amount;
  });

  return {
    rows: rows,
    totalOrdered: totalOrdered,
    totalDone: totalDone,
    totalPending: totalPending,
    totalAmount: totalAmount
  };
}

/**
 * ৫. বকেয়া তালিকা (Patients with Due List)
 * @returns {object} { rows: [{patientId, name, phone, due}], totalDue }
 */
function getDueList() {
  const patients = (typeof load === 'function') ? load('hms_patients') : [];
  const charges = (typeof load === 'function') ? load('hms_charges') : [];

  // রোগী অনুযায়ী বকেয়া বের করা
  const dueMap = {};
  charges.forEach(c => {
    const amt = Number(c.amount) || 0;
    const paid = Number(c.paid) || 0;
    const due = amt - paid;
    if (due > 0) {
      dueMap[c.patientId] = (dueMap[c.patientId] || 0) + due;
    }
  });

  const rows = [];
  let totalDue = 0;

  // রোগী তালিকার নাম ও ফোন সহ জোড়া লাগানো
  Object.keys(dueMap).forEach(pId => {
    const due = dueMap[pId];
    if (due > 0) {
      const p = patients.find(item => item.id === pId);
      const name = p ? p.name : (typeof getPatientName === 'function' ? getPatientName(pId) : pId);
      const phone = p ? p.phone : 'N/A';
      rows.push({
        patientId: pId,
        name: name,
        phone: phone,
        due: due
      });
      totalDue += due;
    }
  });

  // বকেয়া টাকা অনুযায়ী বড় থেকে ছোট সাজানো
  rows.sort((a, b) => b.due - a.due);

  return {
    rows: rows,
    totalDue: totalDue
  };
}