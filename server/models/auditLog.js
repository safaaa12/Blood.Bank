const mongoose = require('mongoose');

// סכמת לוג
const auditLogSchema = new mongoose.Schema({
    action: String,           // סוג הפעולה (Create, Update, Delete וכו')
    user: String,             // שם המשתמש שביצע את הפעולה
    userRole: String,         // תפקיד המשתמש
    timestamp: { type: Date, default: Date.now },  // זמן ביצוע הפעולה
    details: mongoose.Schema.Types.Mixed  // מידע נוסף על הפעולה (כמו נתונים שונו, מזהי רשומות וכו')
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
