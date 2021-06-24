# [Draw & Guess](https://drawguess.tw)

An educational real-time multiplayer game using <span>Socket.IO</span> to enjoy drawing and guessing.

#### Website URL: [https://drawguess.tw](https://drawguess.tw)

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

<img width="1000" src="https://d3cek75nx38k91.cloudfront.net/draw/architecture.v4.png">

## Database Design

<img width="1000" src="https://d3cek75nx38k91.cloudfront.net/draw/database.png">

## Socket Server Auto Scaling Flowchart

- Used AWS ELB & Auto Scaling to deal with high-loading issues.
- Solved socket server synchronization issues of horizontal expansion with sticky sessions and Socket.IO-redis.
- Reshaped the traffic by clearing cookies when users join rooms.

<img width="1000" src="https://d3cek75nx38k91.cloudfront.net/draw/socket.io-redis.v3.png">

## Features

### Synchronous Browsing

- Used <span>Socket.IO</span>to simultaneously browse drawings in each room.

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/room_view.gif">

### Chat Room

- Accomplished a real-time group chat room.
- Built an answer filtering system to prevent cheating.
<img width="800" src="">

### Change Photo

- Players can choose their favorite headers or upload their own photos.

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/replacePhoto.gif">

## Demonstration

### Home

<img width="800" src="">

### Draw

<img width="800" src="">

### Guess

<img width="800" src="">

### Single Mode

<img width="800" src="https://d3cek75nx38k91.cloudfront.net/draw/single+mode.gif">

## Data Source

- idiom : [教育部成語典](https://dict.idioms.moe.edu.tw/search.jsp)
- english : [Lingokids](https://lingokids.com/english-for-kids)

## Contact
### [Hsueh Kuan Tsai](https://github.com/Tsai-Hsueh-Kuan)
- Email: <a href="mailto:hsuehkuantsai@drawguess.tw">hsuehkuantsai@drawguess.tw</a>

