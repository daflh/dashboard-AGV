const net = require('net');

// const INTEGRITY_SERVER = '10.6.6.121';
const INTEGRITY_SERVER = 'peneliti2';
const SECURE_PORT = 1234
const INSECURE_PORT = 1235

const secureClient = new net.Socket();
secureClient.connect(SECURE_PORT, INTEGRITY_SERVER, () => {
    console.log('Connected to server on port 1235');
});

secureClient.on('data', (data) => {
    console.log('Data from server on port 1235: ' + data);
});

secureClient.on('close', () => {
    console.log('Connection closed on port 1235');
});

secureClient.on('error', (err) => {
    console.error('Error in client1: ', err);
});

//////////////////////////////////

const insecureClient = new net.Socket();
insecureClient.connect(INSECURE_PORT, INTEGRITY_SERVER, () => {
    console.log('Connected to server on port 1234');
});

insecureClient.on('data', (data) => {
    console.log('Data from server on port 1234: ' + data.toString());
});

insecureClient.on('close', () => {
    console.log('Connection closed on port 1234');
});

insecureClient.on('error', (err) => {
    console.error('Error in client2: ', err);
});

///////////////////////////

setTimeout(() => {
  // Send data to the server
  // const message = "S0Wicak Gantenge^&og\r\n\r\n";
  const message = `S0Wicak Ganteng|ndog|
{
  "Challenge": "4E6DDCD7CC76B2D3B278D3D5B2D3B2A8D578B2D5D3D3D5B2B1B2D3D3D5B1D3B1",
  "Signature": "66469F7704C823FC074173E35CEAD7F36BA76D1E507CB5796B40889E8016DDAA562389AC3598D29B2A0BB4AF07BBB0DF254B5E57A2441C8ED06799DADB77D24F"
}e^&og\r\n\r\n`;
  secureClient.write(message, () => {
      console.log('Message sent: ', message);
  });
}, 500);
