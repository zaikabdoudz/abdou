const handler = async (m, { conn }) => {
  const count = global.errorLogs?.length || 0
  global.errorLogs = []
  await m.reply(`✅ تم مسح ${count} خطأ من السجل`)
}

handler.command = /^مسح_مشاكل|clearerrors$/i
handler.rowner = true

export default handler
