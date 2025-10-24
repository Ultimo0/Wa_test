const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@adiwajshing/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");

const SESSION_FILE = './session.json';

(async () => {
  const { state, saveCreds } = await useSingleFileAuthState(SESSION_FILE);
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
      console.log('📱 QR code reçu, scanne avec WhatsApp :');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      console.log('❌ Connexion fermée', lastDisconnect?.error?.output?.statusCode);
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connecté !');
    }
  });
})();
