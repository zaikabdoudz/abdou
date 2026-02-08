const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion, 
    MessageRetryMap,
    makeCacheableSignalKeyStore, 
    jidNormalizedUser,
    PHONENUMBER_MCC
} = await import('@whiskeysockets/baileys');

import moment from 'moment-timezone';
import NodeCache from 'node-cache';
import readline from 'readline';
import qrcode from "qrcode";
import crypto from 'crypto';
import fs from "fs";
import pino from 'pino';
import * as ws from 'ws';
const { CONNECTING } = ws;
import { Boom } from '@hapi/boom';
import { makeWASocket } from '../lib/simple.js';

if (!Array.isArray(global.conns)) {
    global.conns = [];
}

let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner }) => {
    let parent = args[0] && args[0] === 'plz' ? _conn : await global.conn;
    if (!((args[0] && args[0] === 'plz') || (await global.conn).user.jid === _conn.user.jid)) {
        return m.reply(`🏦 ⇦ هـذا الأمـر مـخـصـوص للبـوت الأصـلي.\n\nادخـل جروب البـوت الأصـلي للتنصيب:\nwa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`);
    }

    async function serbot() {
        let authFolderB = crypto.randomBytes(10).toString('hex').slice(0, 8);

        if (!fs.existsSync("./JadiBots/" + authFolderB)) {
            fs.mkdirSync("./JadiBots/" + authFolderB, { recursive: true });
        }
        if (args[0]) {
            fs.writeFileSync("./JadiBots/" + authFolderB + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));
        }

        const { state, saveState, saveCreds } = await useMultiFileAuthState(`./JadiBots/${authFolderB}`);
        const msgRetryCounterCache = new NodeCache();
        const { version } = await fetchLatestBaileysVersion();
        let phoneNumber = m.sender.split('@')[0];

        const methodCode = !!phoneNumber || process.argv.includes("code");
        const MethodMobile = process.argv.includes("mobile");

        const connectionOptions = {
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            mobile: MethodMobile, 
            browser: ["Ubuntu", "Chrome", "20.0.04"], 
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true, 
            generateHighQualityLinkPreview: true, 
            getMessage: async (clave) => {
                let jid = jidNormalizedUser(clave.remoteJid);
                let msg = await store.loadMessage(jid, clave.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: undefined,   
            version
        };

        let conn = makeWASocket(connectionOptions);

        if (methodCode && !state.creds.registered) {
            if (!phoneNumber) return m.reply('⚠️ لم يتم التعرف على رقمك.');

            let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');

            // ✅ إصلاح خطأ PHONENUMBER_MCC
            try {
                if (typeof PHONENUMBER_MCC === 'object' && PHONENUMBER_MCC !== null) {
                    if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) {
                        console.log('❌ رقم غير مدعوم');
                        return m.reply('⚠️ رقمك غير مدعوم لإنشاء الجلسة.');
                    }
                } else {
                    console.log('⚠️ PHONENUMBER_MCC غير معرف، تم تخطي التحقق.');
                }
            } catch (err) {
                console.log('⚠️ تخطي التحقق من MCC لوجود خطأ:', err.message);
            }

            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(cleanedNumber);
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;

                let txt = `
🏦 ⇦ *أهـلًا بك فـي نظـام التنصيب الفرعـي للبـوت!*

*╮──⊰ [📦 الخطوات] ⊱──╭*
1️⃣ ⇦ افتـح واتساب من هاتفك  
2️⃣ ⇦ اضغـط على *الثلاث نقاط ⋮* بالأعلى  
3️⃣ ⇦ ادخل إلى *الأجهزة المرتبطة*  
4️⃣ ⇦ اختر *ربط جهاز برقم الهاتف*  
5️⃣ ⇦ اكتـب الكـود أدنـاه 👇  
*╯──⊰ ❄️ ⊱──╰*

الكـود الخاص بك ⬇️
> *${codeBot}*

⚠️ ملاحظة: هذا الكود يعمل فقط على نفس الرقم الذي طلب التنصيب.
`;
                await parent.reply(m.chat, txt, m);
            }, 3000);
        }

        conn.isInit = false;
        let isInit = true;

        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin } = update;
            if (isNewLogin) conn.isInit = true;
            const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            
            if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
                let i = global.conns.indexOf(conn);
                if (i < 0) return console.log(await creloadHandler(true).catch(console.error));
                delete global.conns[i];
                global.conns.splice(i, 1);
                if (code !== DisconnectReason.connectionClosed) {
                    parent.sendMessage(m.chat, { text: "⚠️ تم فقد الاتصال بالبوت الفرعي." }, { quoted: m });
                }
            }

            if (connection === 'open') {
                conn.isInit = true;
                global.conns.push(conn);
                await parent.reply(m.chat, `✅ تم الاتصال بنجاح مع واتساب الفرعي.\n\n⚠️ ملاحظة: هذا مؤقت.\nإذا تم إعادة تشغيل البوت الرئيسي، سيتم إيقاف البوت الفرعي أيضًا.\n\n📂 مجلد الجلسة: ./JadiBots/${authFolderB}`, m);
                
                await sleep(5000);
                if (args[0]) return;

                await parent.reply(conn.user.jid, `❄️ ⇦ استخدم هذا الأمر مستقبلاً لتسجيل الدخول بسرعة:`, m);
                await parent.sendMessage(conn.user.jid, { text: usedPrefix + command + " " + Buffer.from(fs.readFileSync("./JadiBots/" + authFolderB + "/creds.json"), "utf-8").toString("base64") }, { quoted: m });
            }
        }

        setInterval(async () => {
            if (!conn.user) {
                try { conn.ws.close(); } catch { }
                conn.ev.removeAllListeners();
                let i = global.conns.indexOf(conn);
                if (i < 0) return;
                delete global.conns[i];
                global.conns.splice(i, 1);
            }
        }, 60000);

        let handler = await import('../handler.js');
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
                if (Object.keys(Handler || {}).length) handler = Handler;
            } catch (e) {
                console.error(e);
            }
            if (restatConn) {
                try { conn.ws.close(); } catch { }
                conn.ev.removeAllListeners();
                conn = makeWASocket(connectionOptions);
                isInit = true;
            }

            if (!isInit) {
                conn.ev.off('messages.upsert', conn.handler);
                conn.ev.off('connection.update', conn.connectionUpdate);
                conn.ev.off('creds.update', conn.credsUpdate);
            }

            conn.handler = handler.handler.bind(conn);
            conn.connectionUpdate = connectionUpdate.bind(conn);
            conn.credsUpdate = saveCreds.bind(conn, true);

            conn.ev.on('messages.upsert', conn.handler);
            conn.ev.on('connection.update', conn.connectionUpdate);
            conn.ev.on('creds.update', conn.credsUpdate);
            isInit = false;
            return true;
        }
        creloadHandler(false);
    }

    serbot();
};

handler.help = ['تنصيب'];
handler.tags = ['jadibot'];
handler.command = ['تنصيب', 'code'];
handler.rowner = false;

export default handler;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}