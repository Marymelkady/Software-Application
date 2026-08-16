# PER Software Challenge

This repository contains two pieces.

`server` is a Python server that replays a livestream of real sensor data from the competition our team attended this past june.

`example` contains a web app, made with [React.js](https://www.w3schools.com/react/react_intro.asp), that displays a speedometer in your browser. The app connects to `server` and receives the live data stream, updating the speedometer in real time. This demonstrates to you what a potential application submission could look like.


## Quick explanation

Our Python server uses something called **[Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)**. Clients connect **once**, and it keeps the connection open, pushing a new message every 50ms.

On startup, the server loads in `data_replay.h5`, a compressed file containing all of the data. The server reads through the data in small batches. Each time it reads a batch, it sends it to all its connected clients. When it reaches the end of the data, it pauses for a few seconds, then starts over from the beginning.

Each message is a [JSON object](https://stackoverflow.blog/2022/06/02/a-beginners-guide-to-json-the-data-format-for-the-internet/) containing three lists of the same length. The same position across the three lists refer to the same sample. Here's an example:

```json
{ "ts": [123000, 124200], "id": [4, 8], "v": [41.5, 13.6] }
```
- `ts` — timestamps of each sample. This is in units of microseconds since the start of the replay.

- `id` — which sensor each sample came from. A table of sensor IDs is listed below.

- `v` — the actual value for each sample.

So, the above example means that at 123000us, sensor 4 (pcm.moc.motor.requestedTorque) had a value of 41.5, and at 124200us, sensor 8 (pcm.vnav.velocityBody.x) had a value of 13.6.

|ID|Sensor Name|⠀⠀⠀⠀⠀⠀⠀⠀|ID|Sensor Name|
|--|-----------|----------|--|-----------|
|0|pcm.wheelSpeeds.frontLeft||12|pcm.vnav.compensatedAngularRate.z|
|1|pcm.pedals.accel||13|bms.pack.voltage|
|2|pcm.coolingLoop.temp||14|bms.pack.current|
|3|pcm.moc.motor.temp||15|bms.pack.power|
|4|pcm.moc.motor.requestedTorque||16|bms.stack.mma.temp.avg|
|5|pcm.moc.motor.torqueFeedback||17|pdu.sensors.currPmp1|
|6|pcm.vnav.posLla.latitude||18|pdu.sensors.currPmp2|
|7|pcm.vnav.posLla.longitude||19|pdu.sensors.currFan1|
|8|pcm.vnav.velocityBody.x||20|pdu.sensors.currFan2|
|9|pcm.vnav.velocityBody.y||21|ludwig.steeringWheel.angle|
|10|pcm.vnav.compensatedAccel.y||22–37|ludwig.tireTemps.rearLeft[N], <br/>*16 channels, 0-15, N can be any integer from 0 to 15*|
|11|pcm.vnav.yawPitchRoll.yaw||38–53|ludwig.tireTemps.rearRight[N] <br/>*16 channels, 0-15, N can be any integer from 0 to 15*|

To understand what these terms mean, what units the values `v` are in, and what visualizations you might want to use them for, come to office hours to talk to us!

## How to use

1. First, you need to download all the code in this [repository](https://www.gitkraken.com/learn/git/tutorials/what-is-a-git-repository). We strongly recommend using [Git](https://www.freecodecamp.org/news/what-is-git-learn-git-version-control/).

    Visit [Git's official website](https://git-scm.com/install) and follow the instructions there to install Git. Once installed successfully, open a terminal and run the following command to download the code:

    ```shell
    git clone https://github.com/Penn-Electric-Racing/Software-Application.git
    ```
    Keep in mind, this will create a folder wherever your terminal was when you ran the command. You can move it anywhere, but make sure to move the whole folder together, and to remember where you put it.


2. **[OPTIONAL]** We recommend using VSCode to view, edit, and run the code. If you don't have it, visit [VSCode's official website](https://code.visualstudio.com/download) and follow the instructions there to install it.

3. Let's make sure you have Python installed. We've been running on version 3.13.1, but in practice, any version close to that (3.11+) should work.

    Visit [Python's official website](https://www.python.org/downloads/) and follow the steps there to install Python.

4. We need to setup a [virtual environment](https://realpython.com/python-virtual-environments-a-primer/).

    In a terminal, run the following commands:
    ```shell
    python -m venv .venv

    # If you are on Windows, activate by running:
    .venv\Scripts\activate
    # If you are on Mac or Linux, activate by running:
    source .venv/bin/activate

    # On all platforms, run
    pip install -r requirements.txt
    ```
    In the future, always remember to activate the virtual environment before running the server. You can tell it's activated if your terminal prompt starts with `(.venv)`.

5. You are ready to run the server! In a terminal, run the following command: 
    ```
    uvicorn server.server:app --host 0.0.0.0 --port 8081
    ```
    Make sure that when you run this command, your terminal is in the root of the repository (the folder named `Software-Application`, that contains the subfolders `server` and `example`), and that your virtual environment is activated.

    Keep in mind that this entire setup is meant to run on [localhost](https://www.freecodecamp.org/news/what-is-localhost/) (your own computer). We would like your widget to be a separate application from the server, connected locally through a [port](https://www.whatismyip.com/what-is-a-port/) (8081 in the example command above). When you are ready to run your widget, you should first startup the server, then startup your widget.

6. **[OPTIONAL]** If you want, you can run the example widget we provide. First, make sure you have Node.js installed. Visit [Node.js's official website](https://nodejs.org/en/download/) and follow the instructions there to install it.

    Then, in a terminal, run the following commands. `npm` is [Node's package manager](https://www.freecodecamp.org/news/what-is-npm-a-node-package-manager-tutorial-for-beginners/). It comes with a standard Node installation.
    ```shell
    # If your terminal is not already in the example folder, make sure you are in it
    cd example

    # Install all the dependencies used by the example widget
    npm install

    # Run the example widget. Remember to start the server first!
    npm run dev
    ```
    You should see a localhost link in your terminal. Copy the link into your browser and open it. You should see a speedometer that updates in real time with the data from the server.

## Advice

Please know that we **expect** you to run into issues with trying to set things up. This is a typical part of software development, and we consider it a part of the challenge! **Please come to office hours** when you have issues. We **want** to chat with you and help you out, and we like team members who are willing to ask for help and learn new things when necessary.