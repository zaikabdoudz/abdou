import { promises as fs } from 'fs'

let proposals = {}

const verifi = async () => {
    try {
        const data = await fs.readFile('./package.json', 'utf-8')
        const pkg = JSON.parse(data)
        return pkg.repository?.url === 'git+https://github.com/The-King-Destroy/YukiBot-MD.git'
    } catch {
        return false
    }
}

let handler = async (m, { conn, command, usedPrefix }) => {
    if (!await verifi()) return conn.reply(m.chat, `>* هذا الأمر متاح فقط للنسخة الرسمية من البوت.\n> https://github.com/The-King-Destroy/YukiBot-MD`, m)
    try {
        const sender = m.sender
        const mentionedJid = m.mentionedJid
        const target = m.quoted?.sender || mentionedJid?.[0]

        if (command === 'تزوج') {
            if (!target) return conn.reply(m.chat, `❀ الرجاء ذكر الشخص الذي تريد الزواج منه أو الرد على رسالته.\n> مثال: *${usedPrefix}تزوج @username*`, m)
            if (sender === target) return conn.reply(m.chat, `❌ لا يمكنك الزواج من نفسك.`, m)
            
            const senderData = global.db.data.users[sender] || {}
            const targetData = global.db.data.users[target] || {}

            if (senderData.marry) return conn.reply(m.chat, `ꕥ أنت بالفعل متزوج/ة من *${senderData.marryName || senderData.marry}*.`, m)
            if (targetData.marry) return conn.reply(m.chat, `ꕥ الشخص الذي تريد الزواج منه متزوج/ة بالفعل.`, m)

            if (proposals[target] && proposals[target] === sender) {
                // قبول الزواج
                delete proposals[target]
                senderData.marry = target
                senderData.marryName = targetData.name || target.split('@')[0]
                targetData.marry = sender
                targetData.marryName = senderData.name || sender.split('@')[0]

                await conn.reply(m.chat, `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩
🎉 تم الزواج! 🥰
• الزوج/الزوجة: ${senderData.marryName}
• الزوج/الزوجة: ${targetData.marryName}
استمتعوا بحياتكم الزوجية 💖
✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`, m)

                global.db.data.users[sender] = senderData
                global.db.data.users[target] = targetData
            } else {
                // اقتراح الزواج
                proposals[sender] = target
                setTimeout(() => { delete proposals[sender] }, 2 * 60 * 1000) // تنتهي الاقتراحات بعد دقيقتين
                await conn.reply(m.chat, `♡ *اقتراح زواج*
• ${senderData.name || sender.split('@')[0]} يريد الزواج من ${targetData.name || target.split('@')[0]}.
⚘ للقبول: رد على الرسالة بـ *${usedPrefix}تزوج*
*اقتراح الزواج سينتهي خلال دقيقتين*`, m)
            }
        }

        if (command === 'طلق') {
            const userData = global.db.data.users[sender] || {}
            if (!userData.marry) return conn.reply(m.chat, `✎ أنت لست متزوج/ة حالياً.`, m)
            const spouse = userData.marry
            const spouseData = global.db.data.users[spouse] || {}

            userData.marry = ''
            userData.marryName = ''
            spouseData.marry = ''
            spouseData.marryName = ''

            await conn.reply(m.chat, `💔 تم الطلاق بينك وبين *${spouseData.name || spouse.split('@')[0]}*.`, m)

            global.db.data.users[sender] = userData
            global.db.data.users[spouse] = spouseData
        }

    } catch (error) {
        await m.reply(`⚠︎ حدث خطأ.\n> استخدم *${usedPrefix}report* للإبلاغ.\n\n${error.message}`)
    }
}

handler.help = ['تزوج', 'طلق']
handler.tags = ['علاقات']
handler.command = ['تزوج', 'طلق']
handler.group = true

export default handler