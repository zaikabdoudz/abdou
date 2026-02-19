// ============================================
// 🔧 DEBUG PLUGIN - احذفه بعد التشخيص
// أوامر متاحة:
//   .debug       ← معلومات sender + admin
//   .debuggroup  ← كل participants في المجموعة
//   .debugme     ← بياناتك الكاملة
//   .debugmsg    ← بيانات الرسالة الكاملة
// ============================================

const handler = async (m, { conn, participants, isAdmin, isBotAdmin, isOwner, isROwner, userGroup, botGroup, groupMetadata }) => {
  const cmd = m.text?.replace(/^[.!#/]/, '').trim().toLowerCase()

  // ━━━ .debug ━━━
  if (cmd === 'debug') {
    const meta = await conn.groupMetadata(m.chat).catch(() => ({}))
    const p = meta.participants || []
    const senderNum = m.sender?.split('@')[0]
    const botNum = conn.user?.jid?.split('@')[0] || conn.user?.id?.split(':')[0]

    const you_raw = p.find(x => {
      const uid = x.jid || x.id || ''
      return uid.includes(senderNum)
    })
    const bot_raw = p.find(x => {
      const uid = x.jid || x.id || ''
      return uid.includes(botNum)
    })

    const info = [
      `━━━ SENDER ━━━`,
      `m.sender: ${m.sender}`,
      `key.participant: ${m.key?.participant}`,
      `fromMe: ${m.fromMe}`,
      ``,
      `━━━ ADMIN (handler vars) ━━━`,
      `isAdmin: ${isAdmin}`,
      `isOwner: ${isOwner}`,
      `isBotAdmin: ${isBotAdmin}`,
      `userGroup: ${JSON.stringify(userGroup)}`,
      ``,
      `━━━ YOUR RAW PARTICIPANT ━━━`,
      `${JSON.stringify(you_raw)}`,
      ``,
      `━━━ BOT RAW PARTICIPANT ━━━`,
      `${JSON.stringify(bot_raw)}`,
      ``,
      `━━━ META INFO ━━━`,
      `total participants: ${p.length}`,
      `first participant: ${JSON.stringify(p[0])}`,
      `conn.user.jid: ${conn.user?.jid}`,
      `conn.user.id: ${conn.user?.id}`,
    ].join('\n')

    console.log('\n🔧 [DEBUG]\n' + info + '\n')
    await m.reply('```\n' + info + '\n```')
  }

  // ━━━ .debuggroup ━━━
  else if (cmd === 'debuggroup') {
    const meta = await conn.groupMetadata(m.chat).catch(() => ({}))
    const p = meta.participants || []
    const lines = p.map((x, i) =>
      `${i+1}. jid=${x.jid||'-'} | id=${x.id||'-'} | lid=${x.lid||'-'} | admin=${x.admin||'none'}`
    )
    const out = `PARTICIPANTS (${p.length}):\n` + lines.join('\n')
    console.log('\n🔧 [DEBUGGROUP]\n' + out + '\n')
    // إرسال على دفعات لو طويل
    const chunks = out.match(/.{1,3000}/gs) || [out]
    for (const chunk of chunks) await m.reply('```\n' + chunk + '\n```')
  }

  // ━━━ .debugme ━━━
  else if (cmd === 'debugme') {
    const out = [
      `sender: ${m.sender}`,
      `pushName: ${m.pushName}`,
      `mtype: ${m.mtype}`,
      `chat: ${m.chat}`,
      `isGroup: ${m.isGroup}`,
      `isAdmin: ${isAdmin}`,
      `isROwner: ${isROwner}`,
      `isOwner: ${isOwner}`,
      `isBotAdmin: ${isBotAdmin}`,
      `text: ${m.text}`,
      `isBaileys: ${m.isBaileys}`,
    ].join('\n')
    console.log('\n🔧 [DEBUGME]\n' + out + '\n')
    await m.reply('```\n' + out + '\n```')
  }

  // ━━━ .debugmsg ━━━
  else if (cmd === 'debugmsg') {
    const out = JSON.stringify(m.message, null, 2).slice(0, 3000)
    console.log('\n🔧 [DEBUGMSG]\n' + out + '\n')
    await m.reply('```\n' + out + '\n```')
  }
}

handler.command = /^(debug|debuggroup|debugme|debugmsg)$/i
handler.group = true
export default handler
