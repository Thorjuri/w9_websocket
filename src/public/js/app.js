const socket = io(); //프론트에 socket.io 설치

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form")

function backendDone(msg){
    console.log('the backend says: ', msg) //msg는 백엔드에서 함수 실행시킬때 지정해줄 수 있음
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector('input')
    socket.emit("enter_room", input.value, backendDone); //function 형식은 반드시 가장 마지막 parameter로
input.value = ""                                        //function 형식은 백엔드가 실행시키고 >> 프론트에서 실행 됨
};                                                      //fucntion의 파라미터는, 실행시키는 백엔드에서 지정해줄 수 있음

form.addEventListener("submit", handleRoomSubmit)


// emit 의 parameters 규칙
// 1. 첫번째 인자는 반드시 '이벤트명'(string)
// 2. 함수는 반드시 마지막 인자로
// 3. 첫번째 ~ 마지막 사이의 인자들은 형식, 갯수 제한 없음 
// 4. 서버에서 on 으로 받을때는 '이벤트명'과 인자 갯수, 순서 반드시 맞춰주기