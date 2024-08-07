//import jsonData from "../data.json" assert { type: "json" };
const scoreCountClass = "scoreCount";
const plusImage = "images/icon-plus.svg";
const minusImage = "images/icon-minus.svg";
const replyImage = "images/icon-reply.svg";
const deleteImage = "images/icon-delete.svg";
const editImage = "images/icon-edit.svg";
const textarea = document.querySelector("textarea");
const bodyChat = document.querySelector(".bodyWrapper");
let fileChat
getChat() /* This function still has a delay that requires me to pause the other program execution for a few miliseconds */
/* try to use the fetch API to fetch the file chat from the json file */




async function getChat() {
  let data = await fetch('./data.json')
  data = await data.json()
  setTimeout(() => {
    fileChat = data
    populate(fileChat);

  }, 600)
  //return data
}

function populate(data) {
  data["comments"].forEach((comment) => {
    let mainChat = mainChatCreate();
    bodyChat.append(mainChat);
    let parent = mainChat;
    let chat = chatCreate(
      comment["user"]["image"]["png"],
      comment["user"]["username"],
      comment["createdAt"],
      comment["content"],
      comment["score"],
      parent,
      comment["username"] == data["currentUser"]["username"] ? true : false
    );
    mainChat.appendChild(chat);
    let subChat = mainChatCreate("subChat");
    mainChat.appendChild(subChat);
    if (comment["replies"].length) {
      parent = subChat;
      comment["replies"].forEach((reply) => {
        chat = chatCreate(
          reply["user"]["image"]["png"],
          reply["user"]["username"],
          reply["createdAt"],
          reply["content"],
          reply["score"],
          parent,
          reply["user"]["username"] == data["currentUser"]["username"]
            ? true
            : false,
          reply["replyingTo"]
        );
        parent.appendChild(chat);
      });
    }
  });
}
function chatCreate(
  avatarLocation,
  userName,
  duration,
  userComment,
  currentScore,
  parent,
  isUserChat = false,
  repliedTo = null
) {
  const chat = document.createElement("section");
  chat.classList.add("chat");
  chat.dataset["username"] = userName;
  const header = document.createElement("div");
  header.classList.add("header");
  const you = document.createElement('span')
  you.classList.add('you')
  you.innerText = 'You'
  if (isUserChat) {
    you.classList.add('show')
  }
  multipleAppend(header, [
    imgCreate("user image", avatarLocation),
    paragraphCreate("username", userName),
    you,
    paragraphCreate("duration", duration),
  ]);

  const comment = document.createElement("div");
  comment.classList.add("comment");
  if (repliedTo) {
    const special = document.createElement("span");
    special.classList.add("special");
    special.innerText = `@${repliedTo} `;
    comment.appendChild(special);
  }
  const mainUserComment = document.createElement("span");
  mainUserComment.innerText = userComment;
  comment.appendChild(mainUserComment); //replace with appropriate variable

  multipleAppend(chat, [
    header,
    comment,
    scoreGeneration(currentScore),
    optionsGenerator(parent, chat, isUserChat),
  ]);

  return chat;
}

function imgCreate(altText = "undefined", src) {
  const img = document.createElement("img");
  img.alt = altText;
  img.src = src;
  return img;
}

function paragraphCreate(className = "", textContent = 0) {
  const p = document.createElement("p");
  if (className) {
    p.classList.add(className);
  }
  p.innerText = textContent;
  return p;
}

function multipleAppend(parent, childList) {
  childList.forEach((child) => {
    parent.appendChild(child);
  });
}

function scoreGeneration(currentScore = 0) {
  const score = document.createElement("div");
  score.classList.add("score");
  multipleAppend(score, [
    imgCreate("plus image", plusImage),
    paragraphCreate(scoreCountClass, currentScore),
    imgCreate("minus image", minusImage),
  ]);
  return score;
}
function optionsGenerator(parent, chat, forUser = false) {
  const options = document.createElement("div");
  options.classList.add("options");
  if (!forUser) {
    const replyWrapper = document.createElement("div");
    replyWrapper.classList.add("reply", "lineup");
    multipleAppend(replyWrapper, [
      imgCreate("reply icon", replyImage),
      paragraphCreate("", "Reply"),
    ]);
    replyWrapper.addEventListener("click", () => {
      /* `@${chat.dataset["username"]}, ` */
      /* remove any and all tempreply from be4 */
      document.querySelectorAll(".tempReply").forEach((tempReply) => {
        tempReply.parentElement.removeChild(tempReply);
      });
      /* Then continue with normal work flow */
      const replyBox = document.createElement("div");
      replyBox.classList.add("tempReply");
      const img = imgCreate(
        "user image",
        fileChat["currentUser"]["image"]["png"]
      );
      const textarea = document.createElement("textarea");
      textarea.classList.add("tempTextare");
      const reply_btn = document.createElement("button");
      reply_btn.innerText = "REPLY";
      reply_btn.addEventListener("click", () => {
        let newParent = parent;
        if (![...parent.classList].includes("subChat")) {
          newParent = parent.children[1];
        }
        newParent.appendChild(
          chatCreate(
            fileChat["currentUser"]["image"]["png"],
            fileChat["currentUser"]["username"],
            "now",
            textarea.value,
            "0",
            newParent,
            true,
            chat.dataset["username"]
          )
        );
        parent.removeChild(replyBox);
      });
      multipleAppend(replyBox, [img, textarea, reply_btn]);
      parent.appendChild(replyBox);
      textarea.focus()
    });
    options.appendChild(replyWrapper);
  }
  if (forUser) {
    //continue here with the creation of the edit and delete icon
    const deleteWrapper = document.createElement("div");
    const editWrapper = document.createElement("div");
    deleteWrapper.classList.add("delete", "lineup");
    editWrapper.classList.add("edit", "lineup");
    multipleAppend(deleteWrapper, [
      imgCreate("delete icon", deleteImage),
      paragraphCreate("", "Delete"),
    ]);
    multipleAppend(editWrapper, [
      imgCreate("edit icon", editImage),
      paragraphCreate("", "Edit"),
    ]);
    /* Add event listeners */
    deleteWrapper.addEventListener("click", () => {
      parent.removeChild(chat);
    });
    editWrapper.addEventListener("click", () => {
      const edit = chat.children[1];
      const text = edit.innerText;
      if (text) {
        edit.innerText = null;
        const area = document.createElement("textarea");
        area.value = text;
        edit.appendChild(area);
        edit.style["display"] = "grid"
        area.focus();
        const update_btn = document.createElement("button");
        update_btn.innerText = "UPDATE";
        update_btn.addEventListener("click", () => {
          if (edit.children[0].value) {
            chat.children[1].innerHTML = edit.children[0].value;
          }
        });
        edit.appendChild(update_btn);
      }
    });
    options.appendChild(deleteWrapper);
    options.appendChild(editWrapper);
  }
  return options;
}
function mainChatCreate(className = "mainChat") {
  const mainchat = document.createElement("section");
  mainchat.classList.add(className);
  return mainchat;
}
document.querySelector("button").addEventListener("click", () => {
  let text = document.querySelector(".userInput textarea").value;
  document.querySelector(".userInput textarea").value = "";
  const parent = document.querySelector(".bodyWrapper");
  const mainChat = mainChatCreate();
  const chat = chatCreate(
    fileChat["currentUser"]["image"]["png"],
    fileChat["currentUser"]["username"],
    "now",
    text,
    "0",
    parent,
    true
  );
  mainChat.appendChild(chat)
  parent.appendChild(mainChat);
  mainChat.scrollIntoView();
});
