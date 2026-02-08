let handler = async (m, { conn, text, command }) => {
let id = text ? text : m.chat  
await conn.reply(id, '┊❄️┊:•⪼ اخذت امر من مطوري بالخروج') 
await conn.groupLeave(id)}
handler.command = /^(اخرج|اطلع)$/i
handler.group = true
handler.rowner = true
export default handler