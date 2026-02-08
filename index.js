process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import './plugins/_allfake.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn, execSync } from 'child_process'
import lodash from 'lodash'
import { yukiJadiBot } from './plugins/sockets-serbot.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'

const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

let { say } = cfonts
console.log(chalk.magentaBright('\n❀ Iniciando...'))
say('ARTHUR', {
  font: 'simple',
  align: 'left',
  gradient: ['green', 'white']
})
say('Made by Destroy Power', {
  font: 'console',
  align: 'center',
  colors: ['cyan', 'magenta', 'yellow']
})
protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}
global.timestamp = { start: new Date() }
const __dirname = global.__dirname(import.meta.url)

// CLI options
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#!./-]')

// ---------- جلسة التخزين: تأكد تضع المتغير في Railway أو المسار الصحيح ----------
global.sessions = process.env.BOT_SESSIONS || '/storage/emulated/0/arthur/Sessions/Principal/'
// ---------------------------------------------------------------------------

global.db = new Low(/https?:\/\//.test(global.opts['db'] || '') ? new cloudDBAdapter(global.opts['db']) : new JSONFile('database.json'))
global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this)
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
      }
    }, 1 * 1000))
  }
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    settings: {},
    ...(global.db.data || {}),
  }
  global.db.chain = chain(global.db.data)
}
await loadDatabase()

// --------- استخدم useMultiFileAuthState مع مجلد الجلسات المُحدد ----------
const { state, saveState, saveCreds } = await useMultiFileAuthState(global.sessions)
// ---------------------------------------------------------------------

const msgRetryCounterMap = new Map()
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()

// رقم البوت الافتراضي من global أو من env
let phoneNumber = process.env.BOT_PHONE || global.botNumber || ''
// نحتفظ بالنص الرقمي فقط (بدون + أو مسافات)
if (phoneNumber) phoneNumber = phoneNumber.replace(/\D/g, '')

// طريقة الربط من متغير البيئة (qr / code / mobile)
const methodEnv = (process.env.BOT_METHOD || '').toLowerCase()
const methodCodeQR = methodEnv === 'qr'
const methodCode = methodEnv === 'code'
const methodMobile = methodEnv === 'mobile'

// خيارات العرض والواجهة
const colors = chalk.bold.white
const qrOption = chalk.blueBright
const textOption = chalk.cyan

// واجهة readline (للطوارئ فقط)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

// تحديد الخيار (opcion) حسب متغير البيئة أو الافتراضي التفاعلي
let opcion
if (methodCodeQR) opcion = '1'
else if (methodCode) opcion = '2'
else if (methodMobile) opcion = '3'

/* لو ما حُدد BOT_METHOD وما في creds.json، نترك السلوك التفاعلي القديم */
const credsPath = join(global.sessions, 'creds.json')

if (!opcion && !fs.existsSync(credsPath)) {
  // حمّل تفضيل المستخدم من CLI/ENV إذا كان موجود ثم اسأل تراكراً مثل السابق
  do {
    opcion = await question(colors("Seleccione una opción:\n") + qrOption("1. Con código QR\n") + textOption("2. Con código de texto de 8 dígitos\n--> "))
    opcion = (opcion || '').trim()
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`No se permiten numeros que no sean 1 o 2, tampoco letras o símbolos especiales.`))
      opcion = null
    }
  } while (!opcion && !fs.existsSync(credsPath))
  // إذا سُئلت تفاعلياً، حافظنا على الخصائص القديمة
}

// منع طباعة info زائدة
console.info = () => {}

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion === '1',
  mobile: opcion === '3',
  browser: ["MacOs", "Safari"],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => {
    try {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store.loadMessage(jid, key.id)
      return msg?.message || ""
    } catch (error) {
      return ""
    }
  },
  msgRetryCounterCache: msgRetryCounterCache || new Map(),
  userDevicesCache: userDevicesCache || new Map(),
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => global.conn?.chats?.[jid] ?? {},
  version: version,
  keepAliveIntervalMs: 55000,
  maxIdleTimeMs: 60000,
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on("creds.update", saveCreds)

// إذا لم توجد creds و اخترت الخيار 2 (code) استخدم BOT_PHONE إن وُجد
if (!fs.existsSync(credsPath)) {
  if (opcion === '2') {
    if (phoneNumber) {
      const addNumber = phoneNumber.replace(/[^0-9]/g, '')
      // نطلب كود الربط باستخدام الرقم المُعرف في المتغير
      try {
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          console.log(chalk.bold.white(chalk.bgMagenta(`[ ✿ ]  Código:`)), chalk.bold.white(chalk.white(codeBot)))
        }, 1500)
      } catch (err) {
        console.error('Error requesting pairing code:', err)
      }
    } else {
      // احتياطي: اسأل المستخدم إذا لم يُعرف BOT_PHONE (حافظت على السلوك القديم للطوارئ)
      try {
        let tempPhone
        do {
          tempPhone = await question(chalk.bgBlack(chalk.bold.greenBright(`[ ✿ ]  Please enter the WhatsApp number.\n${chalk.bold.magentaBright('---> ')}`)))
          tempPhone = (tempPhone || '').replace(/\D/g, '')
          if (!tempPhone.startsWith('+')) tempPhone = `+${tempPhone}`
        } while (!await isValidPhoneNumber(tempPhone))
        rl.close()
        const addNumber = tempPhone.replace(/\D/g, '')
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          console.log(chalk.bold.white(chalk.bgMagenta(`[ ✿ ]  CODE:`)), chalk.bold.white(chalk.white(codeBot)))
        }, 1500)
      } catch (err) {
        console.error('Error getting phone interactively:', err)
      }
    }
  }
}

conn.isInit = false
conn.well = false
conn.logger?.info && conn.logger.info(`[ ✿ ]  ＡＢＤＯＵ\n`)

// حفظ دوري لقاعدة البيانات (استبدلت opts بـ global.opts)
if (!global.opts['test']) {
  if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
    if (global.opts['autocleartmp'] && (global.support || {}).find) {
      const tmp = [os.tmpdir(), 'tmp', `${jadi}`]
      tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']))
    }
  }, 30 * 1000)
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && conn?.ws?.socket == null) {
    await global.reloadHandler(true).catch(console.error)
    global.timestamp.connect = new Date()
  }
  if (global.db.data == null) await loadDatabase()
  if ((update.qr != 0 && update.qr != undefined) || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.green.bold(`[ ✿ ]  Escanea este código QR`))
    }
  }
  if (connection === "open") {
    const userJid = jidNormalizedUser(conn.user.id)
    const userName = conn.user.name || conn.user.verifiedName || "Desconocido"
    await joinChannels(conn)
    console.log(chalk.green.bold(`[ ✿ ]  Conectado a: ${userName}`))
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === "close") {
    if ([401, 440, 428, 405].includes(reason)) {
      console.log(chalk.red(`→ (${code}) › Cierra la session Principal.`))
    }
    console.log(chalk.yellow("→ Reconectando el Bot Principal..."))
    await global.reloadHandler(true).catch(console.error)
  }
}
conn.ev.on('connection.update', connectionUpdate.bind(global.conn))

process.on('uncaughtException', console.error)
let isInit = true
let handlerModule = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handlerModule = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try {
      global.conn.ws.close()
    } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }
  conn.handler = handlerModule.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
}

process.on('unhandledRejection', (reason, promise) => {
  console.error("Rechazo no manejado detectado:", reason)
})

global.rutaJadiBot = join(__dirname, `./${jadi}`)
if (global.yukiJadibts) {
  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true })
    console.log(chalk.bold.cyan(`ꕥ La carpeta: ${jadi} se creó correctamente.`))
  } else {
    console.log(chalk.bold.cyan(`ꕥ La carpeta: ${jadi} ya está creada.`))
  }
  const readRutaJadiBot = readdirSync(rutaJadiBot)
  if (readRutaJadiBot.length > 0) {
    const creds = 'creds.json'
    for (const gjbts of readRutaJadiBot) {
      const botPath = join(rutaJadiBot, gjbts)
      if (existsSync(botPath) && statSync(botPath).isDirectory()) {
        const readBotPath = readdirSync(botPath)
        if (readBotPath.includes(creds)) {
          yukiJadiBot({ pathYukiJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' })
        }
      }
    }
  }
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger?.error && conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true)
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger?.info && conn.logger.info(` updated plugin - '${filename}'`)
      else {
        conn.logger?.warn && conn.logger.warn(`deleted plugin - '${filename}'`)
        return delete global.plugins[filename]
      }
    } else conn.logger?.info && conn.logger.info(`new plugin - '${filename}'`)
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    })
    if (err) conn.logger?.error && conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
        global.plugins[filename] = module.default || module
      } catch (e) {
        conn.logger?.error && conn.logger.error(`error require plugin '${filename}\n${format(e)}`)
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
      }
    }
  }
}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

// فحص سريع للأدوات
async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => { p.on('close', (code) => { resolve(code !== 127) }) }),
      new Promise((resolve) => { p.on('error', (_) => resolve(false)) })
    ])
  }))
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
  Object.freeze(global.support)
}
setInterval(async () => {
  const tmpDir = join(__dirname, 'tmp')
  try {
    const filenames = readdirSync(tmpDir)
    filenames.forEach(file => { const filePath = join(tmpDir, file); unlinkSync(filePath) })
    console.log(chalk.gray(`→ Archivos de la carpeta TMP eliminados`))
  } catch {
    console.log(chalk.gray(`→ Los archivos de la carpeta TMP no se pudieron eliminar`))
  }
}, 30 * 1000)
_quickTest().catch(console.error)

async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
    if (number.startsWith('+521')) {
      number = number.replace('+521', '+52')
    } else if (number.startsWith('+52') && number[4] === '1') {
      number = number.replace('+52 1', '+52')
    }
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch (error) {
    return false
  }
}

async function joinChannels(sock) {
  for (const value of Object.values(global.ch || {})) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) {
      await sock.newsletterFollow(value).catch(() => {})
    }
  }
}