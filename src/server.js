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


// public room 목록 추출
function publicRooms(){ //객체의 구조 분해 할당 3겹 (io란 객체 안의, sockets 객체 안의, adapter 객체 안의 sids, rooms 란 객체)
    const {
        sockets: {
            adapter: { sids, rooms }
        },
    } = io;
    const publicRooms = []  
    rooms.forEach((_, key) => {   //public room을 찾는 방법. 모든 소켓은 연결시 자동으로 각자의 private room을 갖는다.
        if(sids.get(key) === undefined){   //이 private room은 socketId(sids)와 같은 이름
            publicRooms.push(key)   // sockets.adapter의 rooms, sids 를 이용해, private room이 아닌, 누군가 임의로 만든 public room을 찾는 방법
        }                           // room 이름이 sids와 같으면 private room 인것을 이용해, if문으로 같지 않은 public room을 추출한다.
    })
    return publicRooms;
};

// room 안의 접속자 수 추출
function countRoom(roomName){
    return io.sockets.adapter.rooms.get(roomName)?.size;
}


io.on("connection", socket => {
    // io.socketsJoin("Anouncement") //모든 소켓이 'Anouncemetn'라는 room으로 들어가게 함!!
    socket["nickname"] = "Anon";
    socket.onAny((event)=> {  //onAny 메소드 = 미들웨어 개념. socket으로 들어온 모든 event를 감지함
        console.log(io.sockets.adapter);
        console.log(`socket Event: ${event}`) // 'socket Event: enter_room'
    })
    socket.on("enter_room", (roomName, cb ) => {  // room 만들기 혹은 입장
        socket.join(roomName) // 1.room 입장
        const counts = countRoom(roomName)
        cb(counts)  //2. 프론트에 showRoom 함수실행
        socket.to(roomName).emit("welcome", socket.nickname, roomName, countRoom(roomName)); //해당 socket의, 해당 room의 - 모든 접속자에게 메세지 보냄(본인 제외)
        io.sockets.emit("room_change", publicRooms()); //연결된 모든 socket의 모든 접속자에게 'public room' 목록을 보냄
    });

    socket.on("new_message", (message, room, cb) => {  // message 보내기
        socket.to(room).emit("new_message", `${socket.nickname}: ${message}`); //해당 room의 모든 접속자에게 message 보냄
        cb();
    });

    socket.on("nickname", (nickname) => { //프론트에서 받아온 nickname을 socket 객체에 nickname 속성으로 저장
        socket["nickname"] = nickname;    // 필요할땐 언제든 socket 객체에서 꺼내설 쓸 수 있음
    });

    socket.on("disconnecting", ()=>{ //disconnecting = 연결 종료 직전**
        socket.rooms.forEach(room => { socket.to(room).emit("Bye", socket.nickname, countRoom(room)-1) // 연결 종료 시(직전에) 해당 room 전체에 메세지 보냄(본인 제외)
        });
    });

    socket.on("disconnect", ()=>{ //disconnecting = 연결 종료 직후**
        io.sockets.emit("room_change", publicRooms()); //연결된 모든 socket의 모든 접속자에게 'public room' 목록을 보냄
    });

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


