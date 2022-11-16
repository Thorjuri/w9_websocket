const http = require('http');
const SocketIo = require('socket.io')
const express = require('express');
const { parse } = require('path');
const app = express();
const port = 3000

app.set('view engine', "pug");
app.set("views", __dirname + "/views");
app.use('/public',express.static(__dirname+ '/public'));

app.get('/', (req, res)=> {
    res.render("home")
});
app.get("/*", (req, res)=> {
    res.redirect("/");
});



const server = http.createServer(app); //http 서버
const io = SocketIo(server); // http + socketio 서버
// const wss = new WebSocket.Server({ server }); // http + websocket 서버
// http://localhost:3000/socket.io/socket.io.js socketio가 제공하는 url

io.on("connection", socket => {
    socket.onAny((event)=> {  //onAny 메소드 = 미들웨어 개념. socket으로 들어온 모든 event를 감지함
        console.log(`socket Event: ${event}`) // 'socket Event: enter_room'
    })
    socket.on("enter_room", (roomName, cb ) => {
        console.log(socket.id) // 'hAVSAZa6eYzcWkEcAAAC' id 메소드 = socketId 확인
        console.log(socket.rooms) // Set(1) { 'hAVSAZa6eYzcWkEcAAAC' } 
        socket.join(roomName)
        console.log(socket.rooms)// Set(2) { 'hAVSAZa6eYzcWkEcAAAC', 'Thor room' } rooms 메소드 = 입장한 room 확인
        setTimeout(()=> {
            cb("hello from the backend");  //프론트에서 실행될 함수에, 파라미터를 백엔드에서 지정해 줄 수 있음.
        }, 5000) //받아온 파라미터 중 '함수'형식 =  백엔드가 실행시키고 >> 프론트엔드에서 실행 됨
    })
});
 


server.listen(port, ()=> {
    console.log(`${port}번 서버 실행`);
});


/*
'connection' 이벤트가 발생했을 때 실행할 callback 함수 정의 (연결 이후의 발생하는 모든 이벤트는 callback함수 안에 모두 쓴다)
즉 connection 이벤트가 발생하면 해당 상태가 지속됨. 그래서 하나의 callback 함수안에 명령어를 모두 쓴다. 
콘솔 출력하고 브라우저로 hello 메세지 보내기
특정 이벤트를 listen 할때 : 서버측은 socket.on -- 브라우저측은 socket.addEventListener
이 코드가 없어도 브라우저는 websocket 연결은 된다. 하지만 서버가 connection에 대한 listen을 하지 않으니, 
브라우저에게 응답해주지는 못함. 즉, connection 이후의 모든 응답은 아래 connection listen을 해야만 가능.
*/

/*  ---------- websocket ------------
const sockets = [];

wss.on("connection", (socket)=> {  // 웹소켓이 연결되면,
    sockets.push(socket);
    socket["nickname"] = "Anon"
    console.log("Connected to Browser"); //콘솔에 출력하고,
    socket.on("close", ()=> { console.log('Disconnected from Browser')} ) //연결이 끊기는 이벤트 listen하면, 콘솔 출력하고
    socket.on('message', (msg)=> {  //브라우저로부터 메세지 받는 이벤트 listen하면, 메세지 출력
        const message = JSON.parse(msg.toString('utf-8'))
            switch(message.type){ // else if 반복 대신에 더 깔끔하게 쓸 수 있는 문법: switch(검증할항목) - case "조건" :
                case "new_message":
                    sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
                case "nickname":
                    socket["nickname"] = message.payload //socket은 객체라서 임의로 값(속성)을 넣을 수 있다
            };        
    });  
});
-------------------------------------- */


