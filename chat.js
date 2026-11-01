// chat.js â€” LifeBridge Hospital-à¦à¦° AI à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦šà§à¦¯à¦¾à¦Ÿ
// à¦¬à¦¾à¦‚à¦²à¦¾: à¦à¦‡ à¦«à¦¾à¦‡à¦² à¦¬à§à¦°à¦¾à¦‰à¦œà¦¾à¦°à§‡ à¦šà¦²à§‡à¥¤ à¦à¦–à¦¾à¦¨à§‡ Node.js-à¦à¦° require() à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦•à¦°à¦¾ à¦¯à¦¾à¦¬à§‡ à¦¨à¦¾à¥¤
// à¦¬à¦¾à¦‚à¦²à¦¾: reports.js à¦¥à§‡à¦•à§‡ à¦¹à¦¿à¦¸à¦¾à¦¬ à¦¨à¦¿à§Ÿà§‡ à¦à¦•à¦‡ à¦“à§Ÿà§‡à¦¬à¦¸à¦¾à¦‡à¦Ÿà§‡à¦° /ask à¦¸à¦¾à¦°à§à¦­à¦¾à¦° à¦ à¦¿à¦•à¦¾à¦¨à¦¾à§Ÿ à¦ªà¦¾à¦ à¦¾à§Ÿà¥¤

(function () {
  'use strict';

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦‰à¦¤à§à¦¤à¦° à¦†à¦¸à¦¾ à¦ªà¦°à§à¦¯à¦¨à§à¦¤ à¦¦à§à¦¬à¦¿à¦¤à§€à§Ÿ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦†à¦Ÿà¦•à¦¾à§Ÿ
  var busy = false;

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦¸à¦‚à¦–à§à¦¯à¦¾à¦•à§‡ à¦¦à§à¦‡ à¦…à¦™à§à¦•à§‡ à¦¦à§‡à¦–à¦¾à§Ÿ
  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦¸à§à¦¥à¦¾à¦¨à§€à§Ÿ à¦¸à¦®à§Ÿ à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦•à¦°à§‡ YYYY-MM-DD à¦¤à¦¾à¦°à¦¿à¦– à¦¬à¦¾à¦¨à¦¾à§Ÿ
  function localDateString(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦†à¦œ à¦¥à§‡à¦•à§‡ à¦¨à¦¿à¦°à§à¦¦à¦¿à¦·à§à¦Ÿ à¦¦à¦¿à¦¨ à¦ªà§‡à¦›à¦¨à§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– à¦¦à§‡à§Ÿ
  function daysAgoString(days) {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - days);
    return localDateString(date);
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦¸à¦ªà§à¦¤à¦¾à¦¹à§‡à¦° à¦¶à§à¦°à§ à¦¶à¦¨à¦¿à¦¬à¦¾à¦° à¦§à¦°à§‡ à¦¤à¦¾à¦°à¦¿à¦– à¦¬à§‡à¦° à¦•à¦°à§‡
  function saturdayWeekStart() {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    var daysSinceSaturday = (date.getDay() + 1) % 7;
    date.setDate(date.getDate() - daysSinceSaturday);
    return localDateString(date);
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: reports.js-à¦à¦° collection à¦«à¦²à¦¾à¦«à¦²à¦•à§‡ à¦šà§à¦¯à¦¾à¦Ÿà§‡à¦° à¦œà¦¨à§à¦¯ à¦›à§‹à¦Ÿ à¦•à¦°à§‡
  function collectionForRange(from, to) {
    var report = window.getDailyCollection(from, to);
    return {
      visits: Number(report.totalVisits) || 0,
      lab: Number(report.totalLab) || 0,
      total: Number(report.totalReceived) || 0
    };
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: reports.js-à¦à¦° à¦¡à¦¾à¦•à§à¦¤à¦¾à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾à¦•à§‡ à¦šà§à¦¯à¦¾à¦Ÿà§‡à¦° à¦œà¦¨à§à¦¯ à¦›à§‹à¦Ÿ à¦•à¦°à§‡
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

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦¶à§à¦§à§ db.js à¦à¦¬à¦‚ reports.js-à¦à¦° public function à¦¦à¦¿à§Ÿà§‡ AI-à¦•à§‡ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦¡à§‡à¦Ÿà¦¾ à¦¦à§‡à§Ÿ
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

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦Ÿà§‡à¦•à§à¦¸à¦Ÿà¦•à§‡ HTML à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦¦à§‡à¦–à¦¾à¦¨à§‹à¦° à¦†à¦—à§‡ à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦•à¦°à§‡
  function escapeHtmlText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: escape à¦•à¦°à¦¾ à¦Ÿà§‡à¦•à§à¦¸à¦Ÿà§‡ **à¦¶à¦¬à§à¦¦** bold à¦•à¦°à§‡; à¦…à¦¬à¦¶à¦¿à¦·à§à¦Ÿ à¦¤à¦¾à¦°à¦•à¦¾ à¦¸à¦°à¦¾à§Ÿ
  function addBoldMarkup(escapedLine) {
    return escapedLine
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\*/g, '');
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: AI-à¦à¦° à¦‰à¦¤à§à¦¤à¦°à§‡ bullet, bold à¦à¦¬à¦‚ line break à¦¸à¦¾à¦œà¦¾à§Ÿ
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

  // à¦¬à¦¾à¦‚à¦²à¦¾: chat.html-à¦à¦° à¦¨à¦¿à¦°à§à¦¦à¦¿à¦·à§à¦Ÿ element à¦–à§à¦à¦œà§‡ à¦¦à§‡à§Ÿ
  function getMessagesElement() {
    return document.getElementById('chatMessages');
  }

  function getThinkingElement() {
    return document.getElementById('thinkingIndicator');
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦¨à¦¤à§à¦¨ chat bubble à¦¯à§‹à¦— à¦•à¦°à§‡
  function addBubble(type, html) {
    var messages = getMessagesElement();
    if (!messages) {
      console.error('chat.html-à¦ id="chatMessages" à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤');
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

  // à¦¬à¦¾à¦‚à¦²à¦¾: Thinking indicator à¦¦à§‡à¦–à¦¾à§Ÿ à¦¬à¦¾ à¦²à§à¦•à¦¾à§Ÿ
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

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦‰à¦¤à§à¦¤à¦° à¦†à¦¸à¦¾à¦° à¦¸à¦®à§Ÿ à¦‡à¦¨à¦ªà§à¦Ÿ à¦¬à¦¨à§à¦§ à¦•à¦°à§‡, à¦¶à§‡à¦·à§‡ à¦†à¦¬à¦¾à¦° à¦šà¦¾à¦²à§ à¦•à¦°à§‡
  function setBusy(value) {
    busy = value;
    var input = document.getElementById('chatInput');
    var button = document.getElementById('sendBtn');
    if (input) input.disabled = value;
    if (button) button.disabled = value;
    showThinking(value);
    if (!value && input) input.focus();
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: server response à¦†à¦—à§‡ text à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦ªà§œà§‡, à¦¤à¦¾à¦°à¦ªà¦° JSON à¦•à¦¿ à¦¨à¦¾ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§‡
  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦à¦¤à§‡ à¦–à¦¾à¦²à¦¿ response-à¦ 'Unexpected end of JSON input' à¦¨à¦¾ à¦à¦¸à§‡ à¦¬à§à¦à¦¤à§‡ à¦¸à§à¦¬à¦¿à¦§à¦¾ à¦¹à§Ÿ
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

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦ªà§à¦°à¦¶à§à¦¨ à¦“ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦¡à§‡à¦Ÿà¦¾ à¦à¦•à¦‡ origin-à¦à¦° /ask endpoint-à¦ à¦ªà¦¾à¦ à¦¾à§Ÿ
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
      addBubble('error-bubble', 'âš ï¸ ' + escapeHtmlText(error && error.message ? error.message : error));
    } finally {
      setBusy(false);
    }
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: form submit à¦¹à¦²à§‡ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦ à¦¾à§Ÿ
  function handleChatSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (busy) return false;

    var input = document.getElementById('chatInput');
    if (!input) {
      addBubble('error-bubble', 'âš ï¸ Chat input was not found. Check the chat.html element id.');
      return false;
    }

    var question = input.value.trim();
    if (!question) return false;
    input.value = '';
    sendQuestion(question);
    return false;
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: à¦‰à¦¦à¦¾à¦¹à¦°à¦£ à¦ªà§à¦°à¦¶à§à¦¨à§‡à¦° à¦¬à¦¾à¦Ÿà¦¨ à¦¥à§‡à¦•à§‡ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦ à¦¾à§Ÿ
  function askPreset(question) {
    var input = document.getElementById('chatInput');
    if (!input || busy) return false;
    input.value = question;
    return handleChatSubmit({ preventDefault: function () {} });
  }

  // à¦¬à¦¾à¦‚à¦²à¦¾: chat.html-à¦à¦° inline event à¦à¦¬à¦‚ Console test-à¦à¦° à¦œà¦¨à§à¦¯ function global à¦•à¦°à§‡
  window.buildReportData = buildReportData;
  window.handleChatSubmit = handleChatSubmit;
  window.askPreset = askPreset;
})();
