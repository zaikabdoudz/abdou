let handler = async (m, { conn, args }) => {
    // التحقق من وجود منشن + مبلغ
    if (!m.mentionedJid[0]) return m.reply('🏦 ⇦ منشن الشخص اللي تبغى تحول له المبلغ.\nمثال:\n*.تحويل 1000 @الشخص*');
    if (!args[0]) return m.reply('🏦 ⇦ اكتب المبلغ اللي تبغى تحوله.\nمثال:\n*.تحويل 1000 @الشخص*');

    let target = m.mentionedJid[0]; // المستلم
    let sender = m.sender; // المحول
    let amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) return m.reply('⚠️ ⇦ اكتب مبلغ صالح للتحويل.');

    // الحصول على بيانات المستخدمين
    let userSender = global.db.data.users[sender];
    let userReceiver = global.db.data.users[target];

    if (!userSender || !userReceiver) return m.reply('⚠️ ⇦ أحد المستخدمين غير موجود في قاعدة البيانات.');

    if (userSender.bank < amount) return m.reply('💸 ⇦ رصيدك في البنك لا يكفي لإجراء التحويل.');

    // خصم العمولة
    let fee = 10;
    let receivedAmount = amount - fee;
    if (receivedAmount <= 0) return m.reply('⚠️ ⇦ المبلغ صغير جدًا بعد خصم العمولة.');

    // تنفيذ التحويل
    userSender.bank -= amount;
    userReceiver.bank += receivedAmount;

    // توليد رقم تحويل عشوائي من 10 أرقام
    let transferId = Math.floor(1000000000 + Math.random() * 9000000000);

    // نص الفاتورة
    let caption = `
*╮──⊰ [💳 فـاتـوره 𝙰𝚁𝚃_𝙱𝙾𝚃] ⊱──╭*
🏦 ⇦ الـمـحول: @${sender.split('@')[0]}
💰 ⇦ الـمـستـلم: @${target.split('@')[0]}

💸 ⇦ الـمـبلغ: 〘${amount}〙
💵 ⇦ الـمـبلغ الـمستلم: 〘${receivedAmount}〙

🧾 ⇦ رقًـم الـتـحويـله: 〘${transferId}〙
⚠️ ⇦ مـلاحـظـه: بـنًـك  𝙰𝚁𝚃𝙷𝚄𝚁 يـخـصم 10 عـمـل كـل تـحـويله🔄
*╯──⊰ ⚡ ⊱──╰*
`;

    await conn.reply(m.chat, caption, m, { mentions: [sender, target] });
};

handler.help = ['تحويل <المبلغ> @منشن'];
handler.tags = ['economy'];
handler.command = ['تحويل']; 
handler.register = true;

export default handler;