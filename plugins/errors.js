// تخزين الأخطاء
if (!global.errorLogs) global.errorLogs = []
if (!global.errorLogsSetup) {
  global.errorLogsSetup = true
  const origConsoleError = console.error.bind(console)
  console.error = (...args) => {
    const msg = args.map(a => {
      if (a instanceof Error) return `${a.message}\n  at ${a.stack?.split('\n')[1]?.trim() || ''}`
      return String(a)
    }).join(' ')
    global.errorLogs.unshift({ time: new Date().toLocaleTimeString('ar'), msg })
    if (global.errorLogs.length > 20) global.errorLogs.pop()
    origConsoleError(...args)
  }
}

const handler = async (m, { conn }) => {
  if (!global.errorLogs || global.errorLogs.length === 0) {
    return m.reply('✅ لا توجد أخطاء مسجلة!')
  }

  let msg = `*🚨 آخر ${global.errorLogs.length} خطأ:*\n\n`
  global.errorLogs.slice(0, 10).forEach((log, i) => {
    msg += `*${i + 1}. [${log.time}]*\n`
    msg += `\`\`\`${log.msg.slice(0, 300)}${log.msg.length > 300 ? '...' : ''}\`\`\`\n\n`
  })

  msg += `\nاكتب *.مسح_مشاكل* لمسح السجل`
  await m.reply(msg.trim())
}

handler.command = /^مشاكل|errors$/i
handler.rowner = true

export default handler
