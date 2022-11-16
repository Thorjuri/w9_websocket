const socket = io(); //프론트에 socket.io 설치

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li);
}; 

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector('#msg input')
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=> {
        addMessage(`You: ${value}`)
    });
    input.value = ""
}

function handlenickNameSubmit(event){
    event.preventDefault();
    const input = room.querySelector('#name input')
    socket.emit("nickname", input.value);
}

function showRoom(counts){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${counts})`
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit)
    nameForm.addEventListener("submit", handlenickNameSubmit)
};

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector('input')
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value; //function 형식은 반드시 가장 마지막 parameter로
    input.value = ""                                        //function 형식은 백엔드가 실행시키고 >> 프론트에서 실행 됨
};                                                      //fucntion의 파라미터는, 실행시키는 백엔드에서 지정해줄 수 있음

form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", (user, roomName,  newCount)=> {  //백엔드의 'welcom'이벤트의 socket.to 실행을 위한 프론트측 코드 (신규접속 시 방 전체 메세지)
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${user} joined!!`)
});

socket.on("room_change", (rooms) => {  // welcome 화면에 현재 존재하는 public room 목록 보여주기
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0) {
        return ;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li)
    });
});

socket.on("new_message", addMessage)

socket.on("Bye", (left, newCount)=> {  //백엔드의 'Bye'이벤트의 socket.to 실행을 위한 프론트측 코드 (연결종료 시 방 전체 메세지)
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${left} left!!`)
});




// emit 의 parameters 규칙
// 1. 첫번째 인자는 반드시 '이벤트명'(string)
// 2. 함수는 반드시 마지막 인자로
// 3. 첫번째 ~ 마지막 사이의 인자들은 형식, 갯수 제한 없음 
// 4. 서버에서 on 으로 받을때는 '이벤트명'과 인자 갯수, 순서 반드시 맞춰주기