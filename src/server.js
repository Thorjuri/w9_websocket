const http = require('http');
const WebSocket = require('ws')
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

;


const server = http.createServer(app); //http 서버
const wss = new WebSocket.Server({ server }); // http + ws 서버
//server.js 한 페이지 안에, http서버와 ws 서버를 모두 만들기 위해 http서버와 ws서버 리스너를 분리해서 작성한다.
// http서버인 'server'를 인자로 넣어주면 http 서버, ws 서버를 모두 돌릴 수 있다.
// 꼭 이렇게 안 해도 됨. 그냥 ws 서버로만 만들어도 됨.
// 이 wss 는 http와 ws 서버를 같은 서버(포트)에서 돌리기 위해 응용한 방식.


/*
'connection' 이벤트가 발생했을 때 실행할 callback 함수 정의 (연결 이후의 발생하는 모든 이벤트는 callback함수 안에 모두 쓴다)
즉 connection 이벤트가 발생하면 해당 상태가 지속됨. 그래서 하나의 callback 함수안에 명령어를 모두 쓴다. 
콘솔 출력하고 브라우저로 hello 메세지 보내기
특정 이벤트를 listen 할때 : 서버측은 socket.on -- 브라우저측은 socket.addEventListener
이 코드가 없어도 브라우저는 websocket 연결은 된다. 하지만 서버가 connection에 대한 listen을 하지 않으니, 
브라우저에게 응답해주지는 못함. 즉, connection 이후의 모든 응답은 아래 connection listen을 해야만 가능.
*/

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

server.listen(port, ()=> {
    console.log(`${port}번 서버 실행`);
});

