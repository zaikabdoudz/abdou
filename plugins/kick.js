export default {
  command: ['طرد'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m, args, usedPrefix, command) => {
    // التحقق من المستخدم
    if (!m.mentionedJid[0] && !m.quoted) {
      return m.reply('*《✧》ضع علامة على الشخص أو رد على رسالة الشخص الذي تريد حذفه.*')
    }
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender

    // معلومات المجموعة
    const groupInfo = await client.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'
    const participant = groupInfo.participants.find(
      (p) => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user
    )

    // تحقق من وجود المستخدم في المجموعة
    if (!participant) {
      return client.reply(
        m.chat,
        `《✧》 *@${user.split('@')[0]}* ya no está en el grupo.`,
        m,
        { mentions: [user] }
      )
    }

    // حماية البوت والمالكين
    if (user === client.decodeJid(client.user.id)) {
      return m.reply('*《✧》 لا أستطيع حذف البوت من المجموعة.*')
    }
    if (user === ownerGroup) {
      return m.reply('*《✧》 لا أستطيع حذف مالك المجموعة.*')
    }
    if (user === ownerBot) {
      return m.reply('*《✧》 لا أستطيع حذف مالك البوت.*')
    }

    try {
      // تنفيذ الطرد
      await client.groupParticipantsUpdate(m.chat, [user], 'remove')

      // رسالة الطرد المخصصة
      m.reply(
        `*❍━━━══━━❪🍄❫━━══━━━❍*\n*｢🍨｣⇇ تم طردك بنجاح*\n*｢🍷｣⇇ بأمر من ↜┊@${m.sender.split('@')[0]}┊*\n*❍━━━══━━❪🍄❫━━══━━━❍*`,
        { mentions: [m.sender] }
      )
    } catch (e) {
      return m.reply(
        `> حدث خطأ أثناء تنفيذ الأمر *${usedPrefix + command}*.\n> حاول مرة أخرى أو اتصل بالدعم إذا استمرت المشكلة.\n> [Error: *${e.message}*]`
      )
    }
  },
};