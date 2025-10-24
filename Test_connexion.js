const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@adiwajshing/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const path = require("path");
const fs = require("fs");

const SESSION_DIR = './session';
const AUTH_DIR = path.join(SESSION_DIR, 'auth_info');

(async () => {
  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    version
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('📱 QR code reçu, scanne avec ton WhatsApp :');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      console.log('❌ Connexion fermée', lastDisconnect?.error?.output?.statusCode);
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connecté !');
    }
  });
})();
