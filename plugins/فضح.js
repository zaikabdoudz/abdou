var handler = async (m, { conn }) => {
    if (!m.quoted || !m.quoted.viewOnce) 
        throw '✧✦┇*رد على فيديو أو صورة تم تعيينها للمشاهدة مرة واحدة فقط.*┇✦✧'

    let buffer = await m.quoted.download()
    let caption = m.quoted.msg?.caption || ''
    let mtype = (m.quoted.mtype || '').replace(/Message$/, '')

    if (mtype === 'image' || mtype === 'video') {
        caption += '\n\n *لا يسمح لك بإخفاء شيء هنا! 🤫*'
    }

    await conn.sendMessage(m.chat, { 
        [mtype]: buffer, 
        caption 
    }, { quoted: m })
}

handler.help = ['readviewonce']
handler.tags = ['media']
handler.command = /^فضح|افضح|افضحه$/i

export default handler