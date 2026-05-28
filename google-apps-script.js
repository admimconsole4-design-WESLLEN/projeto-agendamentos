// ============================================================
// COLE TODO ESTE CÓDIGO NO APPS SCRIPT DA PLANILHA
// Acesse: Extensões → Apps Script → cole aqui → salve
//
// Depois execute setupSheets() e seedData() UMA VEZ
// Em seguida: Implantar → Nova implantação → Web App
//   - Executar como: EU (sua conta)
//   - Quem pode acessar: Qualquer pessoa
// Copie a URL gerada e coloque no .env como GOOGLE_SCRIPT_URL
// ============================================================

var SS_ID = '1QkKz_LRAGymYp2VlKxYO_xasUniSsoR91n-n55ypY3U';

function getSheet(name) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(name);
}

function jsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function generateId() {
  return Utilities.getUuid();
}

function nowIso() {
  return new Date().toISOString();
}

// Normaliza qualquer formato de data para YYYY-MM-DD
function normalizeDate(val) {
  if (!val) return '';
  var str = String(val);
  if (str.length <= 10) return str; // já está no formato certo
  var d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
}

// ===== EQUIPAMENTOS =====

function getEquipments() {
  var sheet = getSheet('Equipment');
  var rows = sheet.getDataRange().getValues().slice(1);
  return rows
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return { id: String(r[0]), name: String(r[1]), description: String(r[2]), createdAt: String(r[3]), updatedAt: String(r[4]) };
    })
    .sort(function(a, b) { return a.name.localeCompare(b.name); });
}

function createEquipment(body) {
  var sheet = getSheet('Equipment');
  var id = generateId();
  var ts = nowIso();
  sheet.appendRow([id, body.name, body.description || '', ts, ts]);
  return { id: id, name: body.name, description: body.description || '', createdAt: ts, updatedAt: ts };
}

function deleteEquipment(id) {
  var sheet = getSheet('Equipment');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Equipment not found' };
}

// ===== PERÍODOS =====

function getPeriods() {
  var periodsSheet = getSheet('Periods');
  var lessonsSheet = getSheet('Lessons');

  var periodsRows = periodsSheet.getDataRange().getValues().slice(1);
  var lessonsRows = lessonsSheet.getDataRange().getValues().slice(1);

  var periods = periodsRows
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return { id: String(r[0]), name: String(r[1]), order: Number(r[2]), createdAt: String(r[3]), updatedAt: String(r[4]), lessons: [] };
    })
    .sort(function(a, b) { return a.order - b.order; });

  var lessons = lessonsRows
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return { id: String(r[0]), periodId: String(r[1]), lessonNumber: Number(r[2]), label: String(r[3]), order: Number(r[4]), createdAt: String(r[5]), updatedAt: String(r[6]) };
    });

  periods.forEach(function(p) {
    p.lessons = lessons
      .filter(function(l) { return l.periodId === p.id; })
      .sort(function(a, b) { return a.order - b.order; });
  });

  return periods;
}

// ===== AULAS =====

function getLessons() {
  var lessonsSheet = getSheet('Lessons');
  var periodsSheet = getSheet('Periods');

  var periodsRows = periodsSheet.getDataRange().getValues().slice(1);
  var periodsMap = {};
  periodsRows.forEach(function(r) {
    periodsMap[String(r[0])] = { id: String(r[0]), name: String(r[1]), order: Number(r[2]) };
  });

  return lessonsSheet.getDataRange().getValues().slice(1)
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return {
        id: String(r[0]), periodId: String(r[1]), lessonNumber: Number(r[2]),
        label: String(r[3]), order: Number(r[4]), createdAt: String(r[5]), updatedAt: String(r[6]),
        period: periodsMap[String(r[1])] || null
      };
    })
    .sort(function(a, b) { return a.order - b.order; });
}

function getLessonsByPeriod(periodId) {
  var sheet = getSheet('Lessons');
  return sheet.getDataRange().getValues().slice(1)
    .filter(function(r) { return r[0] !== '' && String(r[1]) === String(periodId); })
    .map(function(r) {
      return { id: String(r[0]), periodId: String(r[1]), lessonNumber: Number(r[2]), label: String(r[3]), order: Number(r[4]), createdAt: String(r[5]), updatedAt: String(r[6]) };
    })
    .sort(function(a, b) { return a.order - b.order; });
}

// ===== RESERVAS =====

function getReservations(date) {
  var resSheet = getSheet('Reservations');
  var eqSheet = getSheet('Equipment');

  var eqMap = {};
  eqSheet.getDataRange().getValues().slice(1).forEach(function(r) {
    eqMap[String(r[0])] = { id: String(r[0]), name: String(r[1]), description: String(r[2]) };
  });

  var reservations = resSheet.getDataRange().getValues().slice(1)
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return {
        id: String(r[0]), equipmentId: String(r[1]), name: String(r[2]), phone: String(r[3]),
        date: normalizeDate(r[4]), periodId: String(r[5]), lessonNumber: Number(r[6]),
        createdAt: String(r[7]), updatedAt: String(r[8]),
        equipment: eqMap[String(r[1])] || null
      };
    });

  if (date) {
    reservations = reservations.filter(function(r) { return r.date === String(date); });
  }

  return reservations.sort(function(a, b) {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.periodId !== b.periodId) return a.periodId.localeCompare(b.periodId);
    return a.lessonNumber - b.lessonNumber;
  });
}

function findExistingReservation(equipmentId, date, periodId, lessonNumber) {
  var sheet = getSheet('Reservations');
  var rows = sheet.getDataRange().getValues().slice(1);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (
      String(r[1]) === String(equipmentId) &&
      normalizeDate(r[4]) === normalizeDate(date) &&
      String(r[5]) === String(periodId) &&
      Number(r[6]) === Number(lessonNumber)
    ) {
      return r;
    }
  }
  return null;
}

function createReservation(body) {
  var existing = findExistingReservation(body.equipmentId, body.date, body.periodId, body.lessonNumber);
  if (existing) {
    throw new Error('Esta aula já está reservada para este equipamento');
  }

  var sheet = getSheet('Reservations');
  var id = generateId();
  var ts = nowIso();
  var dateStr = normalizeDate(body.date);
  var newRow = sheet.getLastRow() + 1;
  var range = sheet.getRange(newRow, 1, 1, 9);
  range.setNumberFormat('@');
  range.setValues([[id, body.equipmentId, body.name, body.phone || '', dateStr, body.periodId, Number(body.lessonNumber), ts, ts]]);

  var eqSheet = getSheet('Equipment');
  var eqRows = eqSheet.getDataRange().getValues().slice(1);
  var eq = null;
  for (var i = 0; i < eqRows.length; i++) {
    if (String(eqRows[i][0]) === String(body.equipmentId)) {
      eq = { id: String(eqRows[i][0]), name: String(eqRows[i][1]), description: String(eqRows[i][2]) };
      break;
    }
  }

  return {
    id: id, equipmentId: body.equipmentId, name: body.name, phone: body.phone || '',
    date: body.date, periodId: body.periodId, lessonNumber: Number(body.lessonNumber),
    createdAt: ts, updatedAt: ts, equipment: eq
  };
}

function createReservationBatch(body) {
  var created = [];
  var errors = [];

  for (var i = 0; i < body.reservations.length; i++) {
    var r = body.reservations[i];
    try {
      var res = createReservation({
        equipmentId: body.equipmentId,
        name: body.name,
        date: body.date,
        phone: body.phone || '',
        periodId: r.periodId,
        lessonNumber: r.lessonNumber
      });
      created.push(res);
    } catch (err) {
      errors.push({ periodId: r.periodId, lessonNumber: r.lessonNumber, error: err.message });
    }
  }

  return { success: true, created: created, errors: errors };
}

function deleteReservation(id) {
  var sheet = getSheet('Reservations');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Reservation not found' };
}

function checkAvailability(body) {
  var existing = findExistingReservation(body.equipmentId, body.date, body.periodId, body.lessonNumber);
  return { available: !existing };
}

function deleteExpiredReservations() {
  var today = new Date().toISOString().split('T')[0];
  var sheet = getSheet('Reservations');
  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = data.length - 1; i >= 1; i--) {
    if (normalizeDate(data[i][4]) < today) {
      sheet.deleteRow(i + 1);
      count++;
    }
  }

  return { count: count, message: count > 0 ? (count + ' reserva(s) expirada(s) removida(s)') : 'Nenhuma reserva expirada encontrada' };
}

// ===== HANDLERS HTTP =====

function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === 'equipments') return jsonResponse(getEquipments());
    if (action === 'periods') return jsonResponse(getPeriods());
    if (action === 'lessons') {
      if (e.parameter.periodId) return jsonResponse(getLessonsByPeriod(e.parameter.periodId));
      return jsonResponse(getLessons());
    }
    if (action === 'reservations') return jsonResponse(getReservations(e.parameter.date));
    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'createEquipment') return jsonResponse(createEquipment(body));
    if (action === 'deleteEquipment') return jsonResponse(deleteEquipment(body.id));
    if (action === 'createReservation') return jsonResponse(createReservation(body));
    if (action === 'createReservationBatch') return jsonResponse(createReservationBatch(body));
    if (action === 'deleteReservation') return jsonResponse(deleteReservation(body.id));
    if (action === 'checkAvailability') return jsonResponse(checkAvailability(body));
    if (action === 'deleteExpiredReservations') return jsonResponse(deleteExpiredReservations());

    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ===== SETUP (execute UMA VEZ) =====

function setupSheets() {
  var ss = SpreadsheetApp.openById(SS_ID);

  function ensureSheet(name, headers) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      // Formatar como texto puro para evitar que datas sejam convertidas
      sheet.getRange('A:Z').setNumberFormat('@');
    }
    return sheet;
  }

  ensureSheet('Equipment',     ['id', 'name', 'description', 'createdAt', 'updatedAt']);
  ensureSheet('Periods',       ['id', 'name', 'order', 'createdAt', 'updatedAt']);
  ensureSheet('Lessons',       ['id', 'periodId', 'lessonNumber', 'label', 'order', 'createdAt', 'updatedAt']);
  ensureSheet('Reservations',  ['id', 'equipmentId', 'name', 'phone', 'date', 'periodId', 'lessonNumber', 'createdAt', 'updatedAt']);

  Logger.log('Abas criadas com sucesso!');
}

// Função única: cria abas + insere dados iniciais
function initialize() {
  setupSheets();
  seedData();
  Logger.log('Inicialização completa!');
}

function seedData() {
  setupSheets(); // garante que as abas existem antes de usá-las
  var ss = SpreadsheetApp.openById(SS_ID);
  var ts = nowIso();

  // Períodos
  var periodsSheet = ss.getSheetByName('Periods');
  if (periodsSheet.getLastRow() <= 1) {
    var periods = [
      [generateId(), 'Manhã', '1', ts, ts],
      [generateId(), 'Tarde', '2', ts, ts],
      [generateId(), 'Noite', '3', ts, ts]
    ];
    periods.forEach(function(p) { periodsSheet.appendRow(p); });
  }

  var periodsData = periodsSheet.getDataRange().getValues().slice(1);
  var manhaId  = periodsData.find(function(r) { return r[1] === 'Manhã'; })[0];
  var tardeId  = periodsData.find(function(r) { return r[1] === 'Tarde'; })[0];
  var noiteId  = periodsData.find(function(r) { return r[1] === 'Noite'; })[0];

  // Aulas
  var lessonsSheet = ss.getSheetByName('Lessons');
  if (lessonsSheet.getLastRow() <= 1) {
    var labels = ['1ª Aula', '2ª Aula', '3ª Aula', '4ª Aula', '5ª Aula'];
    var order = 1;
    [[manhaId], [tardeId], [noiteId]].forEach(function(pair) {
      var periodId = pair[0];
      labels.forEach(function(label, i) {
        lessonsSheet.appendRow([generateId(), periodId, String(i + 1), label, String(order++), ts, ts]);
      });
    });
  }

  // Equipamentos
  var equipSheet = ss.getSheetByName('Equipment');
  if (equipSheet.getLastRow() <= 1) {
    ['Câmera A', 'Câmera B', 'Microfone', 'Notebook', 'Tripé'].forEach(function(name) {
      equipSheet.appendRow([generateId(), name, '', ts, ts]);
    });
  }

  Logger.log('Dados iniciais inseridos com sucesso!');
}
