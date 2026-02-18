/**
 * utils.js - دوال مساعدة عامة
 */

/**
 * تحويل LID إلى JID حقيقي
 * @param {string} jid - الـ JID أو LID
 * @param {object} conn - اتصال baileys
 * @param {string} groupChatId - معرف المجموعة (اختياري)
 * @returns {Promise<string>}
 */
async function resolveLidToRealJid(jid, conn, groupChatId = null) {
    try {
        if (!jid || typeof jid !== 'string') return jid

        // إذا مش LID، رجّعه كما هو
        if (!jid.endsWith('@lid')) {
            return jid.includes('@') ? jid : `${jid}@s.whatsapp.net`
        }

        // إذا عندنا resolveLidToRealJid على String.prototype (من simple.js) استخدمها
        if (typeof String.prototype.resolveLidToRealJid === 'function') {
            const resolved = await String.prototype.resolveLidToRealJid.call(
                jid,
                groupChatId,
                conn,
                3,
                5000
            )
            if (resolved && !resolved.endsWith('@lid')) return resolved
        }

        // fallback: حاول من metadata المجموعة
        if (groupChatId?.endsWith('@g.us') && conn?.groupMetadata) {
            try {
                const metadata = await conn.groupMetadata(groupChatId)
                const lidNum = jid.split('@')[0]
                for (const p of metadata.participants || []) {
                    try {
                        const contact = await conn.onWhatsApp?.(p.jid)
                        if (contact?.[0]?.lid?.split('@')[0] === lidNum) {
                            return p.jid
                        }
                    } catch {}
                }
            } catch {}
        }

        return jid
    } catch (e) {
        console.error('[resolveLidToRealJid] Error:', e.message)
        return jid
    }
}

export { resolveLidToRealJid }
export default { resolveLidToRealJid }
