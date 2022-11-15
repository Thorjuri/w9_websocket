const messageList = document.querySelector('ul')
const messageForm = document.querySelector("#message")
const nickForm = document.querySelector("#nick")
const socket = new WebSocket(`ws://${window.location.host}`) // 해당 서버 호스트에 websocket 연결하려는 명령어

function makeMessage(type, payload){ // 메세지 객체를 각각 텍스트로 풀어놓고, 다시 객체로 조합하여 리턴
    const msg = {type, payload}
    return JSON.stringify(msg)
}


// 브라우저는 아래 3가지 이벤트에 대해 listen 하고 있다. 해당 이벤트 발생 시 각각의 콜백 함수 실행됨.
// 1. socket이 연결되어 열렸을때, 즉 'open'이벤트가 발생했을 때 실행할 callback 함수. 콘솔 출력
socket.addEventListener("open", ()=> {
    console.log("Connected to Server");
});

// 2. 'message' 이벤트가 발생했을때, 즉 메세지를 받았을때 실행할 callback 함수
socket.addEventListener('message', (message)=> {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li)
});

// 3. 'close' 이벤트 발생 시, 즉 서버와 연결이 끊어지면 아래 callback 함수 실행
socket.addEventListener('close', ()=> {
    console.log("Disconnected to Server");
});

// 10초 후에, 서버로 아래 메시지 보내기 (서버측은 socket.on('message')로 listen 중)
// setTimeout(()=> {
//     socket.send("hello from the browser");
// }, 5000);




function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.append(li)

    input.value = "";
};

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

