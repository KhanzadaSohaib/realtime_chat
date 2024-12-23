const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const leaveBtn = document.getElementById("leave-btn"); // Get leave button

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Receive and display message
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Leave button functionality
leaveBtn.addEventListener("click", () => {
  // Emit 'leaveRoom' event to the server
  socket.emit("leaveRoom");

  // Redirect to the home page or another page
  window.location = "/"; // Adjust the URL as needed
});

// Output message to the chat window
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;

  // Append the message to the chat container
  chatMessages.appendChild(div);
}

// Add room name to the DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to the DOM
function outputUsers(users) {
  userList.innerHTML = users
    .map((user) => `<li>${user.username}</li>`)
    .join("");
}
