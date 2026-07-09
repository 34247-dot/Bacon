//Intro Canvas

/*const Canvas = document.getElementById('board');
const context = board.getContext('2d');

/*console.log(context);
/*Canvas จะต้องใช้ค่า x (width) และ ค่า y (height) เพื่อกำหนดตำแหน่งใน Canv
.moveTo กำหนดจุดเริ่มต้นของเส้น
.lineTo กำหนดเส้นที่ลากจากจุดเริ่มต้นไปที่จุดสุดท้าย
.lineWidth กำหนดความหนาของเส้น
.strokeStyle กำหนดสี
.stroke() function กำหนดให้ทุกอย่างเปลี่ยนสี .strokeStyle
.beginPath() คำสั่งที่ใช้ในการขึ้น Path ใหม่
.closePath() คำสั่งจบการทำงานของ Path
.fillStyle กำหนดสีและแรงเงา
.fill() ระบายสี
.fillRect(x,y,width,height) function สร้างสามเหลี่ยม
.strokeRect(x,y,width,height) function สามเหลี่ยมเริ่มต้นไม่มีสี
.fillText(message,x,y) function สร้างข้อความตามตำแหน่ง x , y
.strokeText(message,x,y) สร้างข้อความตามตำแหน่ง x , y เริ่มต้นไม่มีสี
.font = [normal][italic][normal | bold][ขนาด][ชื่อ Font]
.drawImage(รูปภาพที่ต้องการ ,x,y,width,height) function แสดงรูปภาพนั้นๆ ตาม
    
const myImage = new Image();
myImage.src = "bacon.png";
myImage.onload = function () {
    context.drawImage(myImage,90,10,120,120);
}
*/

//เริ่มสร้างเกม
//ตั้งค่าหน้าจอ
  
let board;
let boardWidth = 900;
let boardHeight = 300;
let context;

// ตั้งค่ารูปภาพ
let backgroundImg;
let playerImg;
let boxImg;
let itemImg;

//ตั้งค่าตัวละครเกม
let playerWidth = 85;
let playerHeight = 85;
let playerX = 50;
let playerY = 215;
let player = {
    x:playerX,
    y:playerY,
    width:playerWidth,
    height:playerHeight
}

let gameOver = false;
let score = 0
let itemScore = 0;
let time = 0;
let lives = 3;
let gameLoopId;

//สร้างอุปสรรค
let boxesArray = [];
let boxWidth = 100;
let boxHeight = 80;
let boxX = 900;
let boxY = 245;
let boxSpeed = -5;
let boxSpawnTimer;

// ตั้งค่าไอเทม
let itemsArray = [];
let itemWidth = 40;
let itemHeight = 40;
let itemX = 900;
let itemY = 120; 
let itemSpeed = -3;
let itemSpawnTimer;

//Gravity & Velocity
let velocityY = 0;
let gravity = 0.4;

// ฟังชันตั้งค่าเสียง
let jumpSound = new Audio("wuued.mp3");
let deathSound = new Audio("china.mp3");
let collectSound = new Audio("dukdik.mp3");

//การกำหนดเหตุการณ์เริ่มต้นเกม
window.onload = function() {
    //Display
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d');

    // โหลดภาพพื้นหลัง
    backgroundImg = new Image();
    backgroundImg.src = "back.jpg";

    // โหลดภาพตัวละคร
    playerImg = new Image();
    playerImg.src = "bacon.png";

    // สร้างอุปสรรค 
    boxImg = new Image();
    boxImg.src = "ghost.png";

    // โหลดภาพไอเทม
    itemImg = new Image();
    itemImg.src = "banana2.png";

    //ดักจับการกระโดด
    document.addEventListener("keydown",movePlayer);

    //สร้าง box
    scheduleNextBox();
    scheduleNextItem();

    // request animation frame
    requestAnimationFrame(update);

}

//function Update
function update() {
    
    if(gameOver) {//ตรวจว่าเกม Over มั้ย
        return;
    } 

    gameLoopId = requestAnimationFrame(update);

    context.clearRect(0,0,board.width ,board.height); //เคลียร์ภาพซ้อน
    context.drawImage(backgroundImg, 0, 0, board.width, board.height);
    
    velocityY += gravity;

    //create plaay Object
    player.y = player.y + velocityY;
    if (player.y >= playerY) {
        player.y = playerY;
        velocityY = 0; 
    }

    context.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // อัปเดตไอเทม (เหรียญ)
    for(let i = 0; i < itemsArray.length; i++) {
        let item = itemsArray[i];
        item.x += itemSpeed;
        context.drawImage(item.img, item.x, item.y, item.width, item.height);
    
        // ตรวจสอบการชน (เก็บไอเทม)
        if(onCollision(player, item)) {
            score += 10; 
            itemScore += 1;

            try {
                collectSound.currentTime = 0;
                collectSound.play().catch(e => {}); 
            } catch(e){}
            
            itemsArray.splice(i, 1);
            i--; 
        }
    }

    //create Array Box
    for(let i = 0 ; i < boxesArray.length ; i++ ) {
        let box = boxesArray[i];
        box.x += boxSpeed;
        context.drawImage(box.img , box.x ,box.y ,box.width ,box.height);

        //ตรวจสอบเงื่อนไขการชนของอุปสรรค
        if(onCollision(player,box)) {
            gameOver = true;
            try {
                deathSound.play().catch(e => {});
            } catch(e){}
            
            lives--;

            context.font = "bold 40px Arial";
            context.textAlign = "center";
            context.fillStyle = "black";
            
            if (lives > 0) {
                context.fillText("เดินมองทางหน่อยเพ่", boardWidth / 2, boardHeight / 2 - 20);
                context.font = "bold 25px Arial";
                context.fillText("Lives left: " + lives + " (Press Restart to try again)", boardWidth / 2, boardHeight / 2 + 20);
            } else {
                context.fillText("Game Over!", boardWidth / 2, boardHeight / 2 - 20);
                context.font = "bold 25px Arial";
                context.fillText("อาการของคน 'หมดใจ' ", boardWidth / 2, boardHeight / 2 + 20);
                ontext.fillText("Final Score : " + Math.floor(score), boardWidth / 2, boardHeight / 2 + 60);
            }
            return; 
        }
    }

    score += 0.05;

    // จับเวลา 60 วินาที
    time += 0.016;
    if (time >= 60) {
        gameOver = true;
        context.font = "bold 40px Arial";
        context.textAlign = "center";
        context.fillText("เวลาหมด หมดเวลา", boardWidth / 2, boardHeight / 2);
        context.font = "bold 30px Arial";
        context.fillText("Final Score : " + Math.floor(score), boardWidth / 2, boardHeight / 2 + 50);
        return;
    }

    // แสดงผล คะแนน,ชีวิต,เวลา)
    context.fillStyle = "black";
    context.font = "bold 20px Arial";
    context.textAlign = "left";
    context.fillText("Score : " + Math.floor(score), 10, 30);
    context.fillText("Items : " + itemScore, 10, 60); 
    context.fillText("Lives : " + lives, 10, 90);

    context.textAlign = "right";
    context.fillText("Time : " + (time.toFixed(2)) + "s / 60s", 880, 30);
}

    // Function เคลื่อนตัวละคร
function movePlayer(e) {
    if(gameOver) {
        return;
    }
    // เช็คว่าอยู่บนพื้นถึงจะกระโดดได้
    if((e.code == "Space" || e.key == " " || e.code == "ArrowUp") && player.y >= playerY) {
        velocityY = -13;
        try {
            jumpSound.currentTime = 0; 
            jumpSound.play().catch(error => {
                console.log("เว็บบราวเซอร์บล็อกการเล่นเสียงอัตโนมัติ ให้คลิกที่หน้าจอเกม 1 ครั้งก่อนเล่นเจ้าค่ะ");
            }); 
        } catch (err) {
            console.log(err);
        }
    }
}

// Function สุ่มสร้างกล่อง
function scheduleNextBox() {
    if (gameOver) return;
    let randomTime = Math.random() * (4000 - 2000) + 2000;
    
    boxSpawnTimer = setTimeout(function() {
        createBox();
        scheduleNextBox(); 
    }, randomTime);
}

function createBox() {
    if(gameOver) return;
    let box = {
        img: boxImg,
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight
    };
    boxesArray.push(box);
    if(boxesArray.length > 5) boxesArray.shift();
}

// Function สุ่มสร้างไอเทม
function scheduleNextItem() {
    if (gameOver) return;
    
    let randomTime = Math.random() * (6000 - 3000) + 3000; 
    
    itemSpawnTimer = setTimeout(function() {
        createItem();
        scheduleNextItem(); 
    }, randomTime);
}

function createItem() {
    if(gameOver) return;
    let item = {
        img: itemImg,
        x: itemX,
        y: itemY,
        width: itemWidth,
        height: itemHeight
    };
    itemsArray.push(item);
    if(itemsArray.length > 5) itemsArray.shift();
}

// Function ตรวจสอบการชน
function onCollision(obj1, obj2) {
    return obj1.x < (obj2.x + obj2.width) &&
           (obj1.x + obj1.width) > obj2.x &&
           obj1.y < (obj2.y + obj2.height) &&
           (obj1.y + obj1.height) > obj2.y; 
}

// Function เริ่มเกมใหม่
function restartGame() {

    cancelAnimationFrame(gameLoopId);

    if (lives <= 0) {
        alert("ชีวิตหมดเเล้วจ้า กรุณาเริ่มต้นกับคนใหม่ ไม่ใช่คนเก่า");
        return; 
    }

    if (document.activeElement) {
        document.activeElement.blur();
    }

    gameOver = false;
    score = 0;
    itemScore = 0;
    time = 0;
    player.y = playerY;
    velocityY = 0;
    boxesArray = [];
    itemsArray = [];
    
    clearTimeout(boxSpawnTimer);
    clearTimeout(itemSpawnTimer);
    
    scheduleNextBox();
    scheduleNextItem();
    
    gameLoopId = requestAnimationFrame(update);
}