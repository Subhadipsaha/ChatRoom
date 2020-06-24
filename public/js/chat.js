const socket = io()

//Elements

const $messageForm = document.querySelector("#message-form")
const $messageFormInputt = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages= document.querySelector("#messages")

//Templates

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplete=document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
//Options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {

    //New message element
const $newMessage = $messages.lastElementChild

//Height of the new message
const newMessageStyles = getComputedStyle($newMessage)
const newMessageMargin = parseInt(newMessageStyles.marginBottom)
const newMessageHeigt = $newMessage.offsetHeight+newMessageMargin

//Visible height
const visibleHeight = $messages.offsetHeight

//Height of message container

const containerHeight = $messages.scrollHeight

//How far have i scrolled?
const scrollOffset = $messages.scrollTop+visibleHeight

if(containerHeight-newMessageHeigt<=scrollOffset) {
    $messages.scrollTop=$messages.scrollHeight
}

}

socket.on("message",(message)=>{
 console.log(message);

 const html = Mustache.render(messageTemplate,{
     username:message.username,
     message:message.text,
     createdAt:moment(message.createdAt).format("h:mm a")
    })
 $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on("locationMessage",({url,createdAt,username})=>{
    console.log(url);
    const html = Mustache.render(locationMessageTemplete,{
        username,
        url,
        createdAtLocation:moment(createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()

})

socket.on("roomData",({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    //disable send button
    $messageFormButton.setAttribute("disabled","disabled")

    const message = e.target.elements.message.value

    socket.emit("sendMessage",message,(message)=>{
        //enable
        $messageFormButton.removeAttribute("disabled")
        $messageFormInputt.value=''
        $messageFormInputt.focus()
        console.log(message);
        
    })
})

$sendLocationButton.addEventListener("click",()=>{
    if(!navigator.geolocation)
    {
        return alert("Sorry!! Your browser doesnt support this feature")
    }

    $sendLocationButton.setAttribute("disabled","disabled")
    navigator.geolocation.getCurrentPosition((position)=>{
        const location = {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }

       // const location = `Location: ${position.coords.latitude},${position.coords.longitude}`
        
        socket.emit("sendLocation",location,(message)=>{
            $sendLocationButton.removeAttribute("disabled")
            console.log(message);
            
        })
    })
})

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
    
})