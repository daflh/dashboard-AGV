const net = require('net');
const fs = require('fs');
const zlib = require('zlib');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const fileContent = fs.readFileSync('robot-data-example/global-costmap.json').toString();
let dataNice = JSON.parse(fileContent);
// console.log(fileJson)

dataNice = {
  payload: dataNice
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
    console.log(dataNice.payload.pose)
  
    const str = JSON.stringify(dataNice)
    const magicNumber = Buffer.from('fe01', 'hex');
    const strLength = Buffer.alloc(4);
    strLength.writeUInt32BE(str.length, 0);
    const strContent = Buffer.from(str, 'utf-8');

    // console.log(Date.now());
    // socket.write(`{"cmd_vel": {"linear": {"x": ${randomInt(1, 8)},"y": 9.0,"z": 11.0},"angular": {"x": 1.0,"y": 2.0,"z": ${randomInt(1, 8)}}}}`);
    socket.write(Buffer.concat([magicNumber, strLength, strContent]));
  }, 500);
});

server.listen(48100, '127.0.0.1', () => {
  console.log('listening');
});
