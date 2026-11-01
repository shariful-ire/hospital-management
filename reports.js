// reports.js - à¦¬à¦¿à¦¶à§à¦¦à§à¦§ à¦¹à¦¿à¦¸à¦¾à¦¬-à¦¨à¦¿à¦•à¦¾à¦¶ à¦«à¦¾à¦‚à¦¶à¦¨à¦¸à¦®à§‚à¦¹ (Pure calculation functions)
// à¦à¦‡ à¦«à¦¾à¦‡à¦²à§‡ à¦•à§‹à¦¨à§‹ DOM à¦¬à¦¾ HTML à¦•à§‹à¦¡ à¦¨à§‡à¦‡à¥¤ à¦¶à§à¦§à§ à¦¡à§‡à¦Ÿà¦¾ à¦ªà§à¦°à¦¸à§‡à¦¸à¦¿à¦‚à¥¤
// chat.js à¦à¦‡ à¦«à¦¾à¦‚à¦¶à¦¨à¦—à§à¦²à§‹à¦‡ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦°à¦¿-à¦‡à¦‰à¦œ à¦•à¦°à¦¬à§‡, à¦¯à¦¾à¦¤à§‡ à¦¸à¦¬ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿà§‡ à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦¹à§à¦¬à¦¹à§ à¦®à§‡à¦²à§‡à¥¤

/**
 * à§§. à¦¦à§ˆà¦¨à¦¿à¦• à¦†à¦¦à¦¾à§Ÿà§‡à¦° à¦¹à¦¿à¦¸à¦¾à¦¬ (Daily Collection Report)
 * @param {string} from - à¦¶à§à¦°à§ à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @param {string} to - à¦¶à§‡à¦· à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @returns {object} { rows: [{date, visits, lab, total}], totalVisits, totalLab, totalReceived, totalDue }
 */
function getDailyCollection(from, to) {
  // hms_payments à¦¥à§‡à¦•à§‡ à¦¸à¦¬ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦°à§‡à¦•à¦°à§à¦¡ à¦²à§‹à¦¡ à¦•à¦°à¦¿
  const payments = (typeof load === 'function') ? load('hms_payments') : [];
  const charges = (typeof load === 'function') ? load('hms_charges') : [];

  // à¦¤à¦¾à¦°à¦¿à¦– à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦—à§à¦°à§à¦ª à¦•à¦°à¦¾à¦° à¦…à¦¬à¦œà§‡à¦•à§à¦Ÿ
  const dayMap = {};

  payments.forEach(p => {
    const pDate = p.date;
    // à¦¤à¦¾à¦°à¦¿à¦– à¦°à§‡à¦žà§à¦œà§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦†à¦›à§‡ à¦•à¦¿à¦¨à¦¾ à¦¯à¦¾à¦šà¦¾à¦‡ (à¦‡à¦¨à¦•à§à¦²à§à¦¸à¦¿à¦­)
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

  // à¦¤à¦¾à¦°à¦¿à¦– à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦¸à¦¾à¦œà¦¿à§Ÿà§‡ à¦…à§à¦¯à¦¾à¦°à§‡ à¦¬à¦¾à¦¨à¦¾à¦¨à§‹
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

  // à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦®à§‹à¦Ÿ à¦¬à¦•à§‡à§Ÿà¦¾ (à¦¸à¦¬ à¦šà¦¾à¦°à§à¦œà§‡à¦° unpaid à¦…à¦‚à¦¶, à¦¤à¦¾à¦°à¦¿à¦– à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦›à¦¾à§œà¦¾)
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
 * à§¨. à¦¤à¦¾à¦°à¦¿à¦– à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦°à§‹à¦—à§€ (Patients Registered in Range)
 * @param {string} from - à¦¶à§à¦°à§ à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @param {string} to - à¦¶à§‡à¦· à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @returns {object} { rows: [patient objects, newest first], count }
 */
function getPatientsInRange(from, to) {
  const patients = (typeof load === 'function') ? load('hms_patients') : [];

  // à¦°à§‡à¦žà§à¦œà§‡à¦° à¦­à§‡à¦¤à¦°à§‡à¦° à¦°à§‹à¦—à§€à¦•à§‡ à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦•à¦°à¦¿
  const filtered = patients.filter(p => {
    return p.regDate >= from && p.regDate <= to;
  });

  // à¦¨à¦¤à§à¦¨ à¦¥à§‡à¦•à§‡ à¦ªà§à¦°à§‹à¦¨à§‹ à¦•à§à¦°à¦®à§‡ à¦¸à¦¾à¦œà¦¾à¦¨à§‹ (Newest first: à¦¤à¦¾à¦°à¦¿à¦– à¦¬à§œ à¦¥à§‡à¦•à§‡ à¦›à§‹à¦Ÿ, à¦¤à¦¾à¦°à¦ªà¦° à¦†à¦‡à¦¡à¦¿ à¦¬à§œ à¦¥à§‡à¦•à§‡ à¦›à§‹à¦Ÿ)
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
 * à§©. à¦¡à¦¾à¦•à§à¦¤à¦¾à¦° à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦­à¦¿à¦œà¦¿à¦Ÿ à¦“ à¦«à¦¿ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ (Doctor-wise Report)
 * @param {string} from - à¦¶à§à¦°à§ à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @param {string} to - à¦¶à§‡à¦· à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @returns {object} { rows: [{doctorId, name, department, visits, fees}], totalVisits, totalFees }
 */
function getDoctorReport(from, to) {
  const doctors = (typeof load === 'function') ? load('hms_doctors') : [];
  const visits = (typeof load === 'function') ? load('hms_visits') : [];

  // à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦¡à¦¾à¦•à§à¦¤à¦¾à¦°à§‡à¦° à¦œà¦¨à§à¦¯ à¦ªà§à¦°à¦¾à¦¥à¦®à¦¿à¦• à¦•à¦¾à¦‰à¦¨à§à¦Ÿà¦¾à¦°
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

  // à¦­à¦¿à¦œà¦¿à¦Ÿ à¦¡à§‡à¦Ÿà¦¾ à¦¯à§‹à¦— à¦•à¦°à¦¾ (visit date à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦°)
  visits.forEach(v => {
    if (v.date >= from && v.date <= to) {
      if (docStats[v.doctorId]) {
        docStats[v.doctorId].visits += 1;
        docStats[v.doctorId].fees += (Number(v.fee) || 0);
      }
    }
  });

  // à¦…à§à¦¯à¦¾à¦°à§‡à¦•à§‡ visits à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦…à¦¨à§à¦¸à¦¾à¦°à§‡ à¦¬à§œ à¦¥à§‡à¦•à§‡ à¦›à§‹à¦Ÿ (descending) à¦¸à¦¾à¦œà¦¾à¦¨à§‹
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
 * à§ª. à¦²à§à¦¯à¦¾à¦¬ à¦Ÿà§‡à¦¸à§à¦Ÿ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ (Lab Tests Report)
 * @param {string} from - à¦¶à§à¦°à§ à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @param {string} to - à¦¶à§‡à¦· à¦¤à¦¾à¦°à¦¿à¦– YYYY-MM-DD
 * @returns {object} { rows: [{testName, ordered, done, pending, amount}], totalOrdered, totalDone, totalPending, totalAmount }
 */
function getLabReport(from, to) {
  const labOrders = (typeof load === 'function') ? load('hms_labOrders') : [];

  // à¦¶à§à¦§à§ à¦…à¦°à§à¦¡à¦¾à¦° à¦¹à¦“à§Ÿà¦¾ à¦Ÿà§‡à¦¸à§à¦Ÿà¦—à§à¦²à§‹ à¦—à¦£à¦¨à¦¾à§Ÿ à¦†à¦¸à¦¬à§‡
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

  // à¦…à¦°à§à¦¡à¦¾à¦° à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦¬à§œ à¦¥à§‡à¦•à§‡ à¦›à§‹à¦Ÿ à¦¸à¦¾à¦œà¦¾à¦¨à§‹
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
 * à§«. à¦¬à¦•à§‡à§Ÿà¦¾ à¦¤à¦¾à¦²à¦¿à¦•à¦¾ (Patients with Due List)
 * @returns {object} { rows: [{patientId, name, phone, due}], totalDue }
 */
function getDueList() {
  const patients = (typeof load === 'function') ? load('hms_patients') : [];
  const charges = (typeof load === 'function') ? load('hms_charges') : [];

  // à¦°à§‹à¦—à§€ à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦¬à¦•à§‡à§Ÿà¦¾ à¦¬à§‡à¦° à¦•à¦°à¦¾
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

  // à¦°à§‹à¦—à§€ à¦¤à¦¾à¦²à¦¿à¦•à¦¾à¦° à¦¨à¦¾à¦® à¦“ à¦«à§‹à¦¨ à¦¸à¦¹ à¦œà§‹à§œà¦¾ à¦²à¦¾à¦—à¦¾à¦¨à§‹
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

  // à¦¬à¦•à§‡à§Ÿà¦¾ à¦Ÿà¦¾à¦•à¦¾ à¦…à¦¨à§à¦¯à¦¾à§Ÿà§€ à¦¬à§œ à¦¥à§‡à¦•à§‡ à¦›à§‹à¦Ÿ à¦¸à¦¾à¦œà¦¾à¦¨à§‹
  rows.sort((a, b) => b.due - a.due);

  return {
    rows: rows,
    totalDue: totalDue
  };
}