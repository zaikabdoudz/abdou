import fetch from 'node-fetch'

/**
 * Highly hardened wallpaper handler
 * - retries with exponential backoff
 * - supports different API response shapes
 * - validates URLs, content-type, size
 * - fallback behaviors (send link if image too big)
 *
 * Requirements: node-fetch installed (npm i node-fetch)
 */

const MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024 // 10 MB safe limit for WhatsApp
const FETCH_TIMEOUT = 15000 // ms per request
const RETRIES = 3
const BACKOFF_BASE = 500 // ms

// Primary API list (try sequentially until get useful results)
const APIS = [
  q => `https://weeb-api.vercel.app/wallpaper?query=${encodeURIComponent(q)}`,
  q => `https://api.waifu.pics/sfw/waifu`, // fallback generic (may not use query)
]

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms))
}

async function fetchWithRetry(url, opts = {}, tries = RETRIES) {
  let attempt = 0
  while (attempt < tries) {
    attempt++
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    try {
      const res = await fetch(url, { ...opts, signal: controller.signal })
      clearTimeout(id)
      return res
    } catch (e) {
      clearTimeout(id)
      if (attempt >= tries) throw e
      await sleep(BACKOFF_BASE * Math.pow(2, attempt - 1))
    }
  }
}

// get possible image URLs from arbitrary JSON
function extractImageUrlsFromJson(json) {
  try {
    if (!json) return []
    if (Array.isArray(json)) {
      // array of urls or objects
      return json.flatMap(i => typeof i === 'string' ? i : (i.url || i.image || [])).filter(Boolean)
    }
    // common keys
    const keys = ['result', 'images', 'data', 'url', 'image', 'data.url', 'data.image']
    for (const k of keys) {
      const parts = k.split('.')
      let cur = json
      for (const p of parts) {
        if (cur && p in cur) cur = cur[p]
        else { cur = null; break }
      }
      if (!cur) continue
      if (typeof cur === 'string') return [cur]
      if (Array.isArray(cur)) return cur.flatMap(i => typeof i === 'string' ? i : (i.url || i.image)).filter(Boolean)
    }
    // fallback: extract any http(s) links from stringified JSON
    const str = JSON.stringify(json)
    const matches = str.match(/https?:\/\/[^"\s,}]+/g) || []
    return matches
  } catch (e) {
    return []
  }
}

function validUrl(u) {
  try {
    const url = new URL(u)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function getRandomIndexes(max, count) {
  const set = new Set()
  while (set.size < count && set.size < max) set.add(Math.floor(Math.random() * max))
  return Array.from(set)
}

async function downloadImageBuffer(url) {
  if (!validUrl(url)) throw new Error('الرابط غير صالح')
  const res = await fetchWithRetry(url, {}, RETRIES)
  if (!res.ok) throw new Error(`فشل تحميل الصورة (${res.status})`)
  const ct = res.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) throw new Error('المحتوى ليس صورة')
  const lengthHeader = res.headers.get('content-length')
  if (lengthHeader && Number(lengthHeader) > MAX_DOWNLOAD_BYTES) {
    throw new Error('الحجم أكبر من الحد المسموح')
  }
  const ab = await res.arrayBuffer()
  const buf = Buffer.from(ab)
  if (buf.length > MAX_DOWNLOAD_BYTES) throw new Error('الحجم بعد التنزيل أكبر من الحد المسموح')
  return { buffer: buf, contentType: ct, size: buf.length }
}

async function sendBuffer(conn, m, buffer, filename, caption) {
  // try modern sendMessage
  try {
    await conn.sendMessage(m.chat, { image: buffer, caption: caption }, { quoted: m })
    return true
  } catch (e) {
    // fallback to sendFile if available
    try {
      await conn.sendFile(m.chat, buffer, filename, caption, m)
      return true
    } catch (err) {
      // final fallback: cannot send binary, return false
      return false
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) throw `ضع اسم الخلفية بعد الأمر. مثال:\n${usedPrefix + command} Naruto`
  const query = text.trim()

  // try each API until we find image URLs
  let imageUrls = []
  for (const apiFn of APIS) {
    try {
      const apiUrl = apiFn(query)
      const res = await fetchWithRetry(apiUrl, {}, RETRIES)
      if (!res.ok) continue
      let json = null
      try { json = await res.json() } catch { json = null }
      // if API returned a direct image (content-type)
      const ct = res.headers.get('content-type') || ''
      if (ct.startsWith('image/')) {
        const url = apiUrl
        if (validUrl(url)) imageUrls.push(url)
      } else {
        const extracted = extractImageUrlsFromJson(json)
        if (extracted && extracted.length) {
          imageUrls = imageUrls.concat(extracted.filter(validUrl))
        }
      }
    } catch (e) {
      // ignore and try next API
      continue
    }
    if (imageUrls.length) break
  }

  // final fallback: try direct search via weeb-api again but parse raw text
  if (!imageUrls.length) {
    try {
      const fallbackUrl = `https://weeb-api.vercel.app/wallpaper?query=${encodeURIComponent(query)}`
      const res2 = await fetchWithRetry(fallbackUrl, {}, RETRIES)
      const txt = await res2.text().catch(() => '')
      const links = (txt.match(/https?:\/\/[^"\s,}]+/g) || []).filter(validUrl)
      imageUrls = imageUrls.concat(links)
    } catch (e) { /* ignore */ }
  }

  if (!imageUrls.length) throw `لم أجد خلفية باسم: ${query}`

  // dedupe and keep valid ones
  imageUrls = Array.from(new Set(imageUrls)).filter(validUrl)
  const count = Math.min(2, imageUrls.length)
  const idxs = getRandomIndexes(imageUrls.length, count)
  let sentAny = false

  for (const i of idxs) {
    const url = imageUrls[i]
    try {
      const { buffer, contentType, size } = await downloadImageBuffer(url)
      // if too large (just in case), send link instead
      if (size > MAX_DOWNLOAD_BYTES) {
        await conn.sendMessage(m.chat, { text: `وجدت الخلفية لكن حجمها كبير جداً لإرسالها عبر الواتس. الرابط:\n${url}` }, { quoted: m })
        continue
      }
      const ok = await sendBuffer(conn, m, buffer, 'wallpaper.jpg', `خلفية: ${query}`)
      if (!ok) {
        await conn.sendMessage(m.chat, { text: `تعذر إرسال الصورة مباشرة، إليك الرابط:\n${url}` }, { quoted: m })
      } else sentAny = true
    } catch (e) {
      // إذا فشل تنزيل هذه الصورة إستمر إلى التالية
      console.warn('فشل تنزيل/إرسال صورة:', e.message || e)
      continue
    }
  }

  if (!sentAny) {
    // كحل أخير: أرسل أول رابط موجود كنص
    await conn.sendMessage(m.chat, { text: `تعذر إرسال أي صورة. هذه بعض الروابط المحصلة:\n${imageUrls.slice(0, 5).join('\n')}` }, { quoted: m })
  }
}

handler.help = ['wallpaper <query>']
handler.tags = ['downloader']
handler.command = /^(wall|خلفية|خلفيات)$/i

export default handler