// chat.js — LifeBridge Hospital-এর AI রিপোর্ট চ্যাট
// বাংলা: এই ফাইল ব্রাউজারে চলে। এখানে Node.js-এর require() ব্যবহার করা যাবে না।
// বাংলা: reports.js থেকে হিসাব নিয়ে একই ওয়েবসাইটের /ask সার্ভার ঠিকানায় পাঠায়।

(function () {
  'use strict';

  // বাংলা: উত্তর আসা পর্যন্ত দ্বিতীয় প্রশ্ন পাঠানো আটকায়
  var busy = false;

  // বাংলা: সংখ্যাকে দুই অঙ্কে দেখায়
  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  // বাংলা: স্থানীয় সময় ব্যবহার করে YYYY-MM-DD তারিখ বানায়
  function localDateString(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  // বাংলা: আজ থেকে নির্দিষ্ট দিন পেছনের তারিখ দেয়
  function daysAgoString(days) {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - days);
    return localDateString(date);
  }

  // বাংলা: সপ্তাহের শুরু শনিবার ধরে তারিখ বের করে
  function saturdayWeekStart() {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    var daysSinceSaturday = (date.getDay() + 1) % 7;
    date.setDate(date.getDate() - daysSinceSaturday);
    return localDateString(date);
  }

  // বাংলা: reports.js-এর collection ফলাফলকে চ্যাটের জন্য ছোট করে
  function collectionForRange(from, to) {
    var report = window.getDailyCollection(from, to);
    return {
      visits: Number(report.totalVisits) || 0,
      lab: Number(report.totalLab) || 0,
      total: Number(report.totalReceived) || 0
    };
  }

  // বাংলা: reports.js-এর ডাক্তার তালিকাকে চ্যাটের জন্য ছোট করে
  function doctorsForRange(from, to) {
    var report = window.getDoctorReport(from, to);
    return report.rows.map(function (doctor) {
      return {
        name: doctor.name,
        department: doctor.department,
        visits: Number(doctor.visits) || 0,
        fees: Number(doctor.fees) || 0
      };
    });
  }

  // বাংলা: শুধু db.js এবং reports.js-এর public function দিয়ে AI-কে রিপোর্ট ডেটা দেয়
  function buildReportData() {
    var today = localDateString(new Date());
    var weekStart = saturdayWeekStart();
    var monthStart = today.slice(0, 8) + '01';
    var last30DaysStart = daysAgoString(29);
    var labMonth = window.getLabReport(monthStart, today);
    var labAllDates = window.getLabReport('1900-01-01', '2999-12-31');
    var dueList = window.getDueList();

    return {
      today: today,
      weekStart: weekStart,
      monthStart: monthStart,
      collectionToday: collectionForRange(today, today),
      collectionThisWeek: collectionForRange(weekStart, today),
      collectionThisMonth: collectionForRange(monthStart, today),
      newPatientsToday: window.getPatientsInRange(today, today).count,
      newPatientsThisWeek: window.getPatientsInRange(weekStart, today).count,
      newPatientsThisMonth: window.getPatientsInRange(monthStart, today).count,
      totalPatients: window.getPatientsInRange('1900-01-01', '2999-12-31').count,
      doctorsThisMonth: doctorsForRange(monthStart, today),
      doctorsLast30Days: doctorsForRange(last30DaysStart, today),
      labThisMonth: {
        ordered: Number(labMonth.totalOrdered) || 0,
        done: Number(labMonth.totalDone) || 0,
        pending: Number(labMonth.totalPending) || 0
      },
      labPendingNow: Number(labAllDates.totalPending) || 0,
      totalDue: Number(dueList.totalDue) || 0,
      patientsWithDue: dueList.rows.map(function (patient) {
        return {
          patientId: patient.patientId,
          name: patient.name,
          phone: patient.phone,
          due: Number(patient.due) || 0
        };
      }),
      note: 'Week starts Saturday. Money is in Taka (Tk).'
    };
  }

  // বাংলা: টেক্সটকে HTML হিসেবে দেখানোর আগে নিরাপদ করে
  function escapeHtmlText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // বাংলা: escape করা টেক্সটে **শব্দ** bold করে; অবশিষ্ট তারকা সরায়
  function addBoldMarkup(escapedLine) {
    return escapedLine
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\*/g, '');
  }

  // বাংলা: AI-এর উত্তরে bullet, bold এবং line break সাজায়
  function formatAnswer(answer) {
    var lines = escapeHtmlText(answer).split(/\r?\n/);
    var output = '';
    var inList = false;
    var previousWasText = false;

    lines.forEach(function (line) {
      var bullet = line.match(/^\s*-\s+(.*)$/);
      if (bullet) {
        if (!inList) {
          output += '<ul>';
          inList = true;
        }
        output += '<li>' + addBoldMarkup(bullet[1]) + '</li>';
        previousWasText = false;
        return;
      }

      if (inList) {
        output += '</ul>';
        inList = false;
      }

      if (line.trim() === '') {
        if (previousWasText) output += '<br>';
        previousWasText = false;
        return;
      }

      if (previousWasText) output += '<br>';
      output += addBoldMarkup(line);
      previousWasText = true;
    });

    if (inList) output += '</ul>';
    return output;
  }

  // বাংলা: chat.html-এর নির্দিষ্ট element খুঁজে দেয়
  function getMessagesElement() {
    return document.getElementById('chatMessages');
  }

  function getThinkingElement() {
    return document.getElementById('thinkingIndicator');
  }

  // বাংলা: নতুন chat bubble যোগ করে
  function addBubble(type, html) {
    var messages = getMessagesElement();
    if (!messages) {
      console.error('chat.html-এ id="chatMessages" পাওয়া যায়নি।');
      return;
    }

    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + type;
    bubble.innerHTML = html;

    var thinking = getThinkingElement();
    if (thinking && thinking.parentNode === messages) {
      messages.insertBefore(bubble, thinking);
    } else {
      messages.appendChild(bubble);
    }
    messages.scrollTop = messages.scrollHeight;
  }

  // বাংলা: Thinking indicator দেখায় বা লুকায়
  function showThinking(show) {
    var thinking = getThinkingElement();
    var messages = getMessagesElement();
    if (!thinking || !messages) return;

    if (show) {
      messages.appendChild(thinking);
      thinking.style.display = 'block';
    } else {
      thinking.style.display = 'none';
    }
    messages.scrollTop = messages.scrollHeight;
  }

  // বাংলা: উত্তর আসার সময় ইনপুট বন্ধ করে, শেষে আবার চালু করে
  function setBusy(value) {
    busy = value;
    var input = document.getElementById('chatInput');
    var button = document.getElementById('sendBtn');
    if (input) input.disabled = value;
    if (button) button.disabled = value;
    showThinking(value);
    if (!value && input) input.focus();
  }

  // বাংলা: server response আগে text হিসেবে পড়ে, তারপর JSON কি না যাচাই করে
  // বাংলা: এতে খালি response-এ 'Unexpected end of JSON input' না এসে বুঝতে সুবিধা হয়
  async function readJsonResponse(response) {
    var responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Server returned an empty response (HTTP ' + response.status + '). Check the server terminal and the browser Network request.');
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      var preview = responseText.slice(0, 180).replace(/\s+/g, ' ');
      throw new Error('Server did not return valid JSON (HTTP ' + response.status + '). Response starts: ' + preview);
    }
  }

  // বাংলা: প্রশ্ন ও রিপোর্ট ডেটা একই origin-এর /ask endpoint-এ পাঠায়
  async function sendQuestion(question) {
    var cleanQuestion = String(question || '').trim();
    if (!cleanQuestion || busy) return;

    addBubble('user', escapeHtmlText(cleanQuestion));
    setBusy(true);

    try {
      var reportData = buildReportData();
      var requestBody = {
        question: cleanQuestion,
        data: reportData
      };

      try {
        var sessionKey = sessionStorage.getItem('hms_chattermate_key');
        if (sessionKey) requestBody.apiKey = sessionKey;
      } catch (_) {}

      // Bangla: key never sent from the browser; the server uses its own key

      var response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      var result = await readJsonResponse(response);
      if (!response.ok || result.error) {
        throw new Error(result.error || ('Server error (HTTP ' + response.status + ').'));
      }

      addBubble('assistant', formatAnswer(result.answer || 'No response text received.'));
    } catch (error) {
      console.error('[Chat Error]', error);
      addBubble('error-bubble', escapeHtmlText(error && error.message ? error.message : error));
    } finally {
      setBusy(false);
    }
  }

  // বাংলা: form submit হলে প্রশ্ন পাঠায়
  function handleChatSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (busy) return false;

    var input = document.getElementById('chatInput');
    if (!input) {
      addBubble('error-bubble', 'Chat input was not found. Check the chat.html element id.');
      return false;
    }

    var question = input.value.trim();
    if (!question) return false;
    input.value = '';
    sendQuestion(question);
    return false;
  }

  // বাংলা: উদাহরণ প্রশ্নের বাটন থেকে প্রশ্ন পাঠায়
  function askPreset(question) {
    var input = document.getElementById('chatInput');
    if (!input || busy) return false;
    input.value = question;
    return handleChatSubmit({ preventDefault: function () {} });
  }

  // বাংলা: chat.html-এর inline event এবং Console test-এর জন্য function global করে
  window.buildReportData = buildReportData;
  window.handleChatSubmit = handleChatSubmit;
  window.askPreset = askPreset;
})();
