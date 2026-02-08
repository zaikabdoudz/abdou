/**
 * Roulette / رهان (أحمر / أسود)
 */

const rouletteState = {} // per chatId -> { bets: [], running: boolean, timerId: Timeout }

const DEFAULT_DURATION = 10_000 // مدة الجولة بالمللي ثانية (10s)
const MIN_BET = 500
const MAX_BET = 100000

function normalizeColor(input) {
  if (!input) return null
  const c = input.toString().trim().toLowerCase()
  if (["red", "أحمر", "احمر"].includes(c)) return "red"
  if (["black", "أسود", "اسود"].includes(c)) return "black"
  return null
}

function formatCurrency(n) {
  return `${n}` // يمكنك تعديل التنسيق لو أردت فواصل أو رموز
}

async function resolveRouletteForChat(chatId, conn) {
  const state = rouletteState[chatId]
  if (!state || !state.bets || state.bets.length === 0) {
    if (state && state.timerId) clearTimeout(state.timerId)
    delete rouletteState[chatId]
    return
  }

  const colors = ["red", "black"]
  const resultColor = colors[Math.floor(Math.random() * colors.length)]

  const winners = []
  const losers = []
  const mentions = []

  for (const bet of state.bets) {
    const userId = bet.user
    if (!global.db) global.db = { data: { users: {} } }
    if (!global.db.data) global.db.data = { users: {} }
    if (!global.db.data.users[userId]) global.db.data.users[userId] = { credit: 0 }

    const userDB = global.db.data.users[userId]

    if (bet.color === resultColor) {
      const payout = bet.amount * 2
      userDB.credit = (userDB.credit || 0) + payout
      winners.push(`🟢 @${userId.split("@")[0]} ربح ${formatCurrency(payout)}`)
      mentions.push(userId)
    } else {
      losers.push(`🔴 @${userId.split("@")[0]} خسر ${formatCurrency(bet.amount)}`)
      mentions.push(userId)
    }
  }

  let msg = `🎰 *نتيجة الروليت*\nالكرة هبطت على: *${resultColor === 'red' ? 'أحمر' : 'أسود'}*\n\n`
  if (winners.length) {
    msg += `🎉 *الفائزون:*\n${winners.join("\n")}\n\n`
  } else {
    msg += `❌ لا يوجد فائزين هذه الجولة.\n\n`
  }

  msg += `📉 *الخاسرون:*\n${losers.length ? losers.join("\n") : 'لا أحد'}`

  try {
    await conn.sendMessage(chatId, { text: msg, mentions })
  } catch (e) {
    console.error('خطأ في إرسال رسالة الروليت:', e)
  }

  if (state.timerId) clearTimeout(state.timerId)
  delete rouletteState[chatId]
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const chatId = m.chat
  const sender = m.sender

  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }
  if (!global.db.data.users[sender]) global.db.data.users[sender] = { credit: 0 }

  const userDB = global.db.data.users[sender]

  // تحقق من وجود المبلغ واللون
  if (!args || args.length < 2) {
    return conn.sendMessage(chatId, { text: `✳️ الاستخدام الصحيح:\n${usedPrefix + command} <المبلغ> <اللون>\nمثال: ${usedPrefix + command} 500 أحمر\nرصيدك الحالي: ${formatCurrency(userDB.credit)}` }, { quoted: m })
  }

  const amount = parseInt(args[0])
  const color = normalizeColor(args[1])

  if (isNaN(amount) || amount <= 0) {
    return conn.sendMessage(chatId, { text: `🔢 الرجاء إدخال مبلغ صالح بالارقام\nرصيدك الحالي: ${formatCurrency(userDB.credit)}` }, { quoted: m })
  }
  if (amount < MIN_BET) {
    return conn.sendMessage(chatId, { text: `✳️ الحد الأدنى للرهان هو ${MIN_BET}\nرصيدك الحالي: ${formatCurrency(userDB.credit)}` }, { quoted: m })
  }
  if (amount > MAX_BET) {
    return conn.sendMessage(chatId, { text: `🟥 الحد الأقصى للرهان هو ${MAX_BET}\nرصيدك الحالي: ${formatCurrency(userDB.credit)}` }, { quoted: m })
  }
  if (!color) {
    return conn.sendMessage(chatId, { text: '✳️ اختر لون صالح: أحمر أو أسود', quoted: m })
  }
  if ((userDB.credit || 0) < amount) {
    return conn.sendMessage(chatId, { text: `✳️ رصيدك غير كافٍ لوضع هذا الرهان\nرصيدك الحالي: ${formatCurrency(userDB.credit)}` }, { quoted: m })
  }

  // خصم المبلغ فورًا (حجز)
  userDB.credit -= amount

  if (!rouletteState[chatId]) rouletteState[chatId] = { bets: [], running: false, timerId: null }

  rouletteState[chatId].bets.push({ user: sender, amount, color, time: Date.now() })

  await conn.sendMessage(chatId, { text: `✅ تم تسجيل رهانك: ${formatCurrency(amount)} على ${color === 'red' ? 'أحمر' : 'أسود'}\nرصيدك الحالي: ${formatCurrency(userDB.credit)}\n⏳ يمكنك إضافة رهانات أخرى أو انتظر انتهاء الجولة.` }, { quoted: m })

  // عرض إجمالي الرهانات
  try {
    const allBets = rouletteState[chatId].bets
    const totalRed = allBets.filter(b => b.color === 'red').reduce((s, b) => s + b.amount, 0)
    const totalBlack = allBets.filter(b => b.color === 'black').reduce((s, b) => s + b.amount, 0)

    await conn.sendMessage(chatId, { text: `💰 مجموع الرهانات: أحمر=${formatCurrency(totalRed)} | أسود=${formatCurrency(totalBlack)}\n(ستبدأ النتيجة خلال ${Math.round(DEFAULT_DURATION/1000)} ثانية)` }, { quoted: m })
  } catch (e) {}

  if (!rouletteState[chatId].running) {
    rouletteState[chatId].running = true
    rouletteState[chatId].timerId = setTimeout(async () => {
      try {
        await resolveRouletteForChat(chatId, conn)
      } catch (e) {
        console.error('خطأ أثناء حل الروليت:', e)
        try {
          await conn.sendMessage(chatId, { text: 'حدث خطأ أثناء حساب نتيجة الروليت. سيتم استرجاع الرهانات.' }, { quoted: m })
        } catch (_) {}
        const state = rouletteState[chatId]
        if (state && state.bets) {
          for (const b of state.bets) {
            if (global.db && global.db.data && global.db.data.users[b.user]) {
              global.db.data.users[b.user].credit += b.amount
            }
          }
        }
        if (rouletteState[chatId]?.timerId) clearTimeout(rouletteState[chatId].timerId)
        delete rouletteState[chatId]
      }
    }, DEFAULT_DURATION)
  }
}

handler.help = ['رهان <المبلغ> <اللون>']
handler.tags = ['economy']
handler.command = ['رهان', 'roulette', 'bet']
handler.group = true

export default handler