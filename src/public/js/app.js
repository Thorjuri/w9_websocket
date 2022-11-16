const socket = io(); //프론트에 socket.io 설치

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form")

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector('input')
    socket.emit("enter_room", {payload: input.value},"hey", "its 5th data", 5, true, ()=>{ //enter_room 이벤트 발생 시, argument를 emit(객체형식 가능)
        console.log("server is done!!")  //추가로 서버에서 호출한 callback 함수도 실행 
    }); 
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit)


//emit의 파라미터(arguments)는 객수 제한이 없다. 원하는 만큼 보낼 수 있음
// 대신 서버의 on 에서도 해당 갯수만큼 파라미터를 받아줘야함 = io.on("event", (prm1, prm2, prm3, prm4, prm5....)=> { })
// 첫번째, event명 (임으로 지정 가능. 단 받을 서버측에도 이벤트명 똑같이 맞춰줄 것, string 형식.)
// 두번째, 보낼 데이터 (스트링, 객체 모두 가능)
// 세번째, 서버에서 호출하는 callback 함수
// 네번째, ..
// 다섯번재, ..