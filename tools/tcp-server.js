const net = require('net');
const fs = require('fs');
const zlib = require('zlib');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const fileContent = fs.readFileSync('robot-data-example/global-costmap.json').toString();
let dataRaw = JSON.parse(fileContent);
// console.log(fileJson)

const dataNice = {
  payload: {
    velocity: dataRaw.velocity,
    pose: dataRaw.pose,
    ...dataRaw.map ? { map: dataRaw.map } : {},
    ...dataRaw.global_costmap ? { global_costmap: dataRaw.global_costmap } : {}
  }
};

const server = net.createServer(function(socket) {
  socket.on('data', (data) => {
    console.log(data.toString());
  });

  // setTimeout(() => {
  //   socket.destroy();
  // }, 1000);

  
  setInterval(() => {
    dataNice.payload.pose.position.x = 0.85;
    dataNice.payload.pose.position.y = 0 + Math.floor(Date.now()/1000%10)/10*4;
    dataNice.payload.pose.orientation.z = 0.5;
    dataNice.payload.pose.orientation.w = 0 + Math.floor(Date.now()/1000%10)/10;
    console.log(dataNice.payload)
  
    const str = JSON.stringify(dataNice)
    const magicNumber = Buffer.from('R1');
    const strContent = zlib.deflateSync(str);
    const strLength = Buffer.alloc(3);
    // console.log(strContent.length);
    strLength.writeUIntBE(strContent.length, 0, 3);
    const checksumWaton = Buffer.from('SU');

    // console.log(Date.now());
    // socket.write(`{"cmd_vel": {"linear": {"x": ${randomInt(1, 8)},"y": 9.0,"z": 11.0},"angular": {"x": 1.0,"y": 2.0,"z": ${randomInt(1, 8)}}}}`);
    const toSend = Buffer.concat([magicNumber, strLength, strContent, checksumWaton]);
    socket.write(toSend);
    console.log(toSend);
  }, 500);
});

server.listen(48100, '127.0.0.1', () => {
  console.log('listening');
});
