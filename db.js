// db.js â€” LifeBridge Hospital: à¦®à§‚à¦² à¦¡à§‡à¦Ÿà¦¾à¦¬à§‡à¦¸, à¦²à§‹à¦•à¦¾à¦²à¦¸à§à¦Ÿà§‹à¦°à§‡à¦œ à¦¹à§à¦¯à¦¾à¦¨à§à¦¡à¦²à¦¾à¦° à¦“ à¦¹à§‡à¦²à§à¦ªà¦¾à¦° à¦«à¦¾à¦‚à¦¶à¦¨
// à¦•à§‹à¦¨à§‹ à¦à¦•à§à¦¸à¦Ÿà¦¾à¦°à§à¦¨à¦¾à¦² à¦ªà§à¦¯à¦¾à¦•à§‡à¦œ à¦›à¦¾à§œà¦¾ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦¬à§à¦°à¦¾à¦‰à¦œà¦¾à¦° à¦œà¦¾à¦­à¦¾à¦¸à§à¦•à§à¦°à¦¿à¦ªà§à¦Ÿ à¦¦à¦¿à§Ÿà§‡ à¦¤à§ˆà¦°à¦¿

(function () {
  'use strict';

  // ============================================================
  // à§§. à§§à§«à¦Ÿà¦¿ à¦²à§à¦¯à¦¾à¦¬ à¦Ÿà§‡à¦¸à§à¦Ÿà§‡à¦° à¦…à¦«à¦¿à¦¸à¦¿à¦¯à¦¼à¦¾à¦² à¦®à§‚à¦²à§à¦¯ à¦¤à¦¾à¦²à¦¿à¦•à¦¾ (Part 1 à¦à¦° à¦¸à§à¦ªà§‡à¦• à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€)
  // ============================================================
  var LAB_TESTS = [
    { name: 'CBC', price: 500 },
    { name: 'Blood Sugar (Fasting)', price: 150 },
    { name: 'Blood Sugar (Random)', price: 120 },
    { name: 'Lipid Profile', price: 1200 },
    { name: 'Urine R/E', price: 200 },
    { name: 'Serum Creatinine', price: 400 },
    { name: 'Liver Function Test', price: 900 },
    { name: 'Thyroid (TSH)', price: 800 },
    { name: 'X-Ray Chest', price: 700 },
    { name: 'ECG', price: 400 },
    { name: 'Ultrasound Whole Abdomen', price: 1500 },
    { name: 'Dengue NS1', price: 1000 },
    { name: 'HbA1c', price: 900 },
    { name: 'Stool R/E', price: 200 },
    { name: 'Echocardiogram', price: 2500 }
  ];

  // ============================================================
  // à§¨. LocalStorage à¦°à¦¿à¦¡ à¦“ à¦°à¦¾à¦‡à¦Ÿ à¦«à¦¾à¦‚à¦¶à¦¨ (JSON à¦°à§‚à¦ªà¦¾à¦¨à§à¦¤à¦°à¦¸à¦¹)
  // ============================================================
  function load(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error loading key: ' + key, e);
      return [];
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving key: ' + key, e);
      alert('LocalStorage storage limit reached or disabled!');
    }
  }

  // Structured workspace preferences, stored as expandable JSON.
  function getSettings() {
    try {
      var raw = localStorage.getItem('hms_settings');
      var settings = raw ? JSON.parse(raw) : {};
      return settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {};
    } catch (e) { console.error('Error loading hospital settings', e); return {}; }
  }

  function updateSettings(updates) {
    var settings = getSettings();
    Object.keys(updates || {}).forEach(function (key) {
      var value = updates[key];
      if (value && typeof value === 'object' && !Array.isArray(value) && settings[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
        settings[key] = Object.assign({}, settings[key], value);
      } else settings[key] = value;
    });
    try { localStorage.setItem('hms_settings', JSON.stringify(settings)); }
    catch (e) { console.error('Error saving hospital settings', e); }
    return settings;
  }

  // ============================================================
  // à§©. à¦¤à¦¾à¦°à¦¿à¦– à¦“ à¦¸à¦®à¦¯à¦¼ à¦¸à¦‚à¦•à§à¦°à¦¾à¦¨à§à¦¤ à¦«à¦¾à¦‚à¦¶à¦¨ (à¦•à¦–à¦¨à§‹ toISOString à¦¨à¦¯à¦¼, à¦¶à¦¤à¦­à¦¾à¦— à¦²à§‹à¦•à¦¾à¦² à¦Ÿà¦¾à¦‡à¦®)
  // ============================================================
  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // à¦†à¦œà¦•à§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– (YYYY-MM-DD à¦«à¦°à¦®à§à¦¯à¦¾à¦Ÿà§‡)
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  // à¦•à§‹à¦¨à§‹ à¦¤à¦¾à¦°à¦¿à¦–à§‡à¦° à¦¸à¦¾à¦¥à§‡ à¦¦à¦¿à¦¨ à¦¯à§‹à¦— à¦¬à¦¾ à¦¬à¦¿à¦¯à¦¼à§‹à¦— à¦•à¦°à¦¾
  function addDays(dateStr, n) {
    var parts = dateStr.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  // à¦¸à¦ªà§à¦¤à¦¾à¦¹ à¦¶à¦¨à¦¿à¦¬à¦¾à¦° à¦¥à§‡à¦•à§‡ à¦¶à§à¦°à§: à¦à¦‡ à¦¸à¦ªà§à¦¤à¦¾à¦¹à§‡à¦° à¦¶à§à¦°à§à¦° à¦¶à¦¨à¦¿à¦¬à¦¾à¦° à¦¬à§‡à¦° à¦•à¦°à¦¾
  function weekStartStr() {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    var daysSinceSaturday = (d.getDay() + 1) % 7;
    d.setDate(d.getDate() - daysSinceSaturday);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  // à¦šà¦²à¦¤à¦¿ à¦®à¦¾à¦¸à§‡à¦° à§§ à¦¤à¦¾à¦°à¦¿à¦– à¦¬à§‡à¦° à¦•à¦°à¦¾
  function monthStartStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-01';
  }

  // ============================================================
  // à§ª. à¦§à¦¾à¦°à¦¾à¦¬à¦¾à¦¹à¦¿à¦• à¦†à¦‡à¦¡à¦¿ à¦¤à§ˆà¦°à¦¿ (à¦¯à§‡à¦®à¦¨: P-0001, V-0001, C-0001)
  // ============================================================
  function nextId(prefix, list, padLength) {
    padLength = padLength || 4;
    var maxNum = 0;
    if (Array.isArray(list)) {
      list.forEach(function (item) {
        if (item && item.id && item.id.indexOf(prefix) === 0) {
          var numPart = parseInt(item.id.substring(prefix.length), 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        }
      });
    }
    var next = maxNum + 1;
    var numStr = '' + next;
    while (numStr.length < padLength) {
      numStr = '0' + numStr;
    }
    return prefix + numStr;
  }

  // ============================================================
  // à§«. à¦Ÿà¦¾à¦•à¦¾ à¦“ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦«à¦°à¦®à§à¦¯à¦¾à¦Ÿà¦¿à¦‚
  // ============================================================
  function formatMoney(n) {
    var val = Math.round(Number(n) || 0);
    return 'Tk ' + val.toLocaleString('en-US');
  }

  function formatDate(str) {
    if (!str) return '';
    return str;
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ============================================================
  // à§¬. à¦°à§‹à¦—à§€ à¦“ à¦¡à¦¾à¦•à§à¦¤à¦¾à¦° à¦–à§‹à¦à¦œà¦¾à¦° à¦¸à¦¹à¦¾à¦¯à¦¼à¦• à¦«à¦¾à¦‚à¦¶à¦¨
  // ============================================================
  function getPatientName(id) {
    var patients = load('hms_patients');
    for (var i = 0; i < patients.length; i++) {
      if (patients[i].id === id) return patients[i].name;
    }
    return id || 'Unknown';
  }

  function getDoctor(id) {
    var doctors = load('hms_doctors');
    for (var i = 0; i < doctors.length; i++) {
      if (doctors[i].id === id) return doctors[i];
    }
    return null;
  }

  // Returns nurses and other hospital employees stored in localStorage.
  function getStaff() {
    return load('hms_staff');
  }

  // ============================================================
  // à§­. à¦°à§‹à¦—à§€ à¦¯à§‹à¦— à¦•à¦°à¦¾
  // ============================================================
  function addPatient(obj) {
    var list = load('hms_patients');
    var newId = nextId('P-', list, 4);
    var patient = {
      id: newId,
      name: (obj.name || '').trim(),
      age: Number(obj.age) || 0,
      sex: obj.sex || 'Other',
      phone: (obj.phone || '').trim(),
      address: (obj.address || '').trim(),
      regDate: obj.regDate || todayStr()
    };
    list.push(patient);
    save('hms_patients', list);
    return patient;
  }

  // ============================================================
  // à§®. à¦¡à¦•à§à¦Ÿà¦° à¦­à¦¿à¦œà¦¿à¦Ÿ à¦¯à§‹à¦— à¦•à¦°à¦¾ (à¦à¦¬à¦‚ à¦¸à¦¾à¦¥à§‡ à¦¸à¦¾à¦¥à§‡ à¦šà¦¾à¦°à§à¦œ à¦¤à§ˆà¦°à¦¿)
  // ============================================================
  function addVisit(obj) {
    var visits = load('hms_visits');
    var charges = load('hms_charges');

    var vId = nextId('V-', visits, 4);
    var cId = nextId('C-', charges, 4);

    var fee = Number(obj.fee) || 0;
    var visitDate = obj.date || todayStr();

    var visit = {
      id: vId,
      patientId: obj.patientId,
      doctorId: obj.doctorId,
      date: visitDate,
      problem: (obj.problem || '').trim(),
      medicines: (obj.medicines || '').trim(),
      fee: fee
    };
    visits.push(visit);
    save('hms_visits', visits);

    var charge = {
      id: cId,
      patientId: obj.patientId,
      type: 'visit',
      refId: vId,
      date: visitDate,
      amount: fee,
      paid: 0
    };
    charges.push(charge);
    save('hms_charges', charges);

    return visit;
  }

  // ============================================================
  // à§¯. à¦²à§à¦¯à¦¾à¦¬ à¦…à¦°à§à¦¡à¦¾à¦° à¦¦à§‡à¦“à¦¯à¦¼à¦¾ à¦“ à¦°à§‡à¦œà¦¾à¦²à§à¦Ÿ à¦¸à§‡à¦­ à¦•à¦°à¦¾
  // ============================================================
  function addLabOrder(patientId, testName, price, date) {
    var orders = load('hms_labOrders');
    var charges = load('hms_charges');

    var oId = nextId('L-', orders, 4);
    var cId = nextId('C-', charges, 4);

    var orderDate = date || todayStr();
    var p = Number(price) || 0;

    var order = {
      id: oId,
      patientId: patientId,
      date: orderDate,
      testName: testName,
      price: p,
      status: 'Pending',
      result: '',
      doneDate: ''
    };
    orders.push(order);
    save('hms_labOrders', orders);

    var charge = {
      id: cId,
      patientId: patientId,
      type: 'lab',
      refId: oId,
      date: orderDate,
      amount: p,
      paid: 0
    };
    charges.push(charge);
    save('hms_charges', charges);

    return order;
  }

  function markLabDone(orderId, resultText) {
    var orders = load('hms_labOrders');
    var found = false;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === orderId) {
        orders[i].status = 'Done';
        orders[i].result = (resultText || '').trim();
        orders[i].doneDate = todayStr();
        found = true;
        break;
      }
    }
    if (found) {
      save('hms_labOrders', orders);
    }
    return found;
  }

  // ============================================================
  // à§§à§¦. à¦¬à¦¿à¦²à¦¿à¦‚ à¦“ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¬à¦£à§à¦Ÿà¦¨ (à¦¸à¦¬à¦šà§‡à¦¯à¦¼à§‡ à¦ªà§à¦°à§‹à¦¨à§‹ à¦šà¦¾à¦°à§à¦œ à¦†à¦—à§‡ à¦ªà¦°à¦¿à¦¶à§‹à¦§ à¦¹à¦¬à§‡)
  // ============================================================
  function getPatientCharges(patientId) {
    var charges = load('hms_charges');
    return charges.filter(function (c) {
      return c.patientId === patientId;
    });
  }

  function getPatientDue(patientId) {
    var pCharges = getPatientCharges(patientId);
    var totalDue = 0;
    pCharges.forEach(function (c) {
      var due = (c.amount || 0) - (c.paid || 0);
      if (due > 0) totalDue += due;
    });
    return totalDue;
  }

  function payBill(patientId, amount, method, date) {
    var payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    var totalDue = getPatientDue(patientId);
    if (payAmount > totalDue) {
      throw new Error('Payment cannot exceed patient total due (' + formatMoney(totalDue) + ').');
    }

    var charges = load('hms_charges');
    var payments = load('hms_payments');

    var patientUnpaid = [];
    charges.forEach(function (c, index) {
      if (c.patientId === patientId) {
        var due = (c.amount || 0) - (c.paid || 0);
        if (due > 0) {
          patientUnpaid.push({ charge: c, originalIndex: index, due: due });
        }
      }
    });

    patientUnpaid.sort(function (a, b) {
      if (a.charge.date !== b.charge.date) {
        return a.charge.date.localeCompare(b.charge.date);
      }
      return a.charge.id.localeCompare(b.charge.id);
    });

    var receiptId = nextId('R-', payments.map(function (p) { return { id: p.receiptId }; }), 4);
    var payDate = date || todayStr();
    var remainingToPay = payAmount;

    for (var i = 0; i < patientUnpaid.length; i++) {
      if (remainingToPay <= 0) break;

      var item = patientUnpaid[i];
      var canPayThis = Math.min(remainingToPay, item.due);

      charges[item.originalIndex].paid = (charges[item.originalIndex].paid || 0) + canPayThis;

      var payId = nextId('PAY-', payments, 4);
      var paymentRow = {
        id: payId,
        receiptId: receiptId,
        patientId: patientId,
        chargeId: item.charge.id,
        type: item.charge.type,
        amount: canPayThis,
        method: method || 'Cash',
        date: payDate
      };
      payments.push(paymentRow);
      remainingToPay -= canPayThis;
    }

    save('hms_charges', charges);
    save('hms_payments', payments);

    return receiptId;
  }

  // ============================================================
  // à§§à§§. à¦¸à¦¾à¦‡à¦¡à¦¬à¦¾à¦° à¦®à§‡à¦¨à§ à¦°à§‡à¦¨à§à¦¡à¦¾à¦°
  // ============================================================
  function renderSidebar(activePage) {
    var sidebarEl = document.getElementById('sidebar');
    if (!sidebarEl) return;

    var menu = [
      { id: 'dashboard', label: 'Dashboard', file: 'index.html', icon: 'DB' },
      { id: 'patients', label: 'Patients', file: 'patients.html', icon: 'PT' },
      { id: 'visits', label: 'Doctor Visits', file: 'visits.html', icon: 'DV' },
      { id: 'lab', label: 'Lab Tests', file: 'lab.html', icon: 'LB' },
      { id: 'billing', label: 'Billing', file: 'billing.html', icon: 'BL' },
      { id: 'reports', label: 'Reports', file: 'reports.html', icon: 'RP' },
      { id: 'chat', label: 'AI Assistant', file: 'chat.html', icon: 'AI' },
      { id: 'settings', label: 'Settings', file: 'settings.html', icon: 'ST' }
    ];

    var html = '<div class="sidebar-brand"><span class="brand-mark" aria-hidden="true">+</span>LifeBridge Hospital<small>Management System</small></div><ul class="sidebar-menu">';
    menu.forEach(function (item) {
      var activeClass = (activePage === item.id) ? 'active' : '';
      html += '<li class="' + activeClass + '"><a class="' + activeClass + '" href="' + item.file + '"><span class="menu-icon" aria-hidden="true">' + item.icon + '</span><span>' + item.label + '</span></a></li>';
    });
    html += '</ul>';
    html += '<div class="sidebar-footer"><span class="status-dot"></span><span>System Online | Local DB</span></div>';

    sidebarEl.innerHTML = html;
  }

  // ============================================================
  // à§§à§¨. à¦—à§à¦²à§‹à¦¬à¦¾à¦² à¦‰à¦‡à¦¨à§à¦¡à§‹à¦¤à§‡ à¦¸à¦¬ à¦«à¦¾à¦‚à¦¶à¦¨ à¦à¦•à§à¦¸à¦ªà§‹à¦°à§à¦Ÿ à¦•à¦°à¦¾
  // ============================================================
  window.LAB_TESTS = LAB_TESTS;
  window.load = load;
  window.save = save;
  window.getSettings = getSettings;
  window.updateSettings = updateSettings;
  window.todayStr = todayStr;
  window.addDays = addDays;
  window.weekStartStr = weekStartStr;
  window.monthStartStr = monthStartStr;
  window.nextId = nextId;
  window.formatMoney = formatMoney;
  window.formatDate = formatDate;
  window.escapeHtml = escapeHtml;
  window.getPatientName = getPatientName;
  window.getDoctor = getDoctor;
  window.getStaff = getStaff;
  window.addPatient = addPatient;
  window.addVisit = addVisit;
  window.addLabOrder = addLabOrder;
  window.markLabDone = markLabDone;
  window.getPatientCharges = getPatientCharges;
  window.getPatientDue = getPatientDue;
  window.payBill = payBill;
  window.renderSidebar = renderSidebar;

})();
