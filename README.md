# [Draw & Guess](https://drawguess.tw)

An educational real-time multiplayer game using <span>Socket.IO</span> to enjoy drawing and guessing.

#### Website URL: [https://drawguess.tw](https://drawguess.tw)

<img width="800" src="可愛圖片">

#### Test Accounts:

- test
  - name: test
  - password: test

#### One-Click Login:

Type email and password automatically when sign in

  - [test](https://drawguess.tw/?test=test)

## Table of Contents

- [Technologies](#Technologies)
- [Architecture](#Architecture)
- [Database Design](#Database-Design)
- [Socket Server Auto Scaling Flowchart](#Socket-Server-Auto-Scaling-Flowchart)
- [Features](#Features)
- [Demonstration](#Demonstration)
- [Data Source](#Data-Source)
- [Contact](#Contact)

## Technologies

### Back-End

- Node.js
- Express.js
- MVC
- Linux

### Front-End

- HTML
- CSS
- JavaScript
- Bootstrap
- AJAX
- jQuery

### Cloud Service (AWS)

- Elastic Compute Cloud (EC2)
- Simple Storage Service (S3)
- CloudFront
- Relational Database Service (RDS)
- ElastiCache
- Route 53
- Elastic Load Balancer(ELB)
- Auto Scaling

### Database

- MySQL
- Redis

### WebSocket

- <span>Socket.IO</span>
- Socket.IO-redis
- Socket.IO-client

### Networking

- HTTP & HTTPS
- Domain Name System(DNS)
- NGINX

### Test

- Mocha
- Chai
- Artillery

### Others

- Design Pattern: MVC
- Version Control: Git, GitHub
- Agile: Trello (Scrum)
- Linter: ESLint

## Architecture

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/architecture.v4.png">

## Database Design

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/database.png">

## Socket Server Auto Scaling Flowchart

- Used AWS ELB & Auto Scaling to deal with high-loading issues.
- Solved socket server synchronization issues of horizontal expansion with sticky sessions and Socket.IO-redis.
- Reshaped the traffic by clearing cookies when users join rooms.

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/socket.io-redis.v3.png">

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/del_cookies.gif">

<br>

## Features

### Synchronous Browsing

- The game will keep showing the drawing all the time, whether the player joins the room after the game has already started or leaves the room then rejoins again.

#### Technique
- Used <span>Socket.IO</span> with redis to simultaneously browse drawings in each room.

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/room_view.gif">

### Game Start System

- Players can choose either single or multiplayer when starting the game. System will also decide a game mode automatically if players press the quick start button.

#### Technique

- Prevent a player from joining a room multiple times in order to gain abnormal scores. 
- When quick start mode activated, <span>Socket.IO</span> will check the concurrent users then guide players into 3 possible situations as follows:
  1. if there are no concurrent users, players will be directed to single player mode.
  2. if there are concurrent users with open rooms, players will be directed to a room as a guesser.
  3. if there are concurrent users with no open rooms, players will be directed to a room as a drawer.

### Chat Room

- Accomplished a real-time group chat room.

#### Technique

- Utilized <span>Socket.IO</span> to achieve user communication in real-time
- Built an answer filtering system to prevent cheating by regular expressions.

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/chatRoom.gif">

### Change Photo

- Players can choose their favorite headers or upload their own photos.

#### Technique

- Stored and delivered images by AWS S3 and CloudFront service.

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/replacePhoto.gif">

### Rank System

- Players can earn points in the game to instantly improve their rankings.

#### Technique

- The left time of guessing will be counted into players final score in Back-End calculation.

<img width="800" src="答題得到分數影片">

### Online Mode : Draw

<img width="800" src="畫畫中影片">

### Online Mode : Guess

<img width="800" src="答題影片">

### Single Mode

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/single+mode.gif">

## Data Source

- idiom : [教育部成語典](https://dict.idioms.moe.edu.tw/search.jsp)
- english : [Lingokids](https://lingokids.com/english-for-kids)

## Contact

### [Hsueh Kuan Tsai](https://github.com/Tsai-Hsueh-Kuan)
- Email : <a href="mailto:hsuehkuantsai@drawguess.tw">hsuehkuantsai@drawguess.tw</a>

