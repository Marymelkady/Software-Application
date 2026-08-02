# PER Software Challenge

This repository contains two pieces.

`server` is a Python server that replays a livestream of real sensor data from the competition our team attended this past june.

`example` contains a web app, made with [React.js](https://www.w3schools.com/react/react_intro.asp), that displays a speedometer in your browser. The app connects to `server` and receives the live data stream, updating the speedometer in real time. This demonstrates to you what a potential application submission could look like.


## Quick explanation

Our Python server uses something called **[Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)**. Clients connect **once**, and it keeps the connection open, pushing a new message every 50ms.

On startup, the server loads in `data_replay.h5`, a compressed file containing all of the data. The server reads through the data in small batches. Each time it reads a batch, it sends it to all its connected clients. When it reaches the end of the data, it pauses for a few seconds, then starts over from the beginning.

Each message is a [JSON object](https://stackoverflow.blog/2022/06/02/a-beginners-guide-to-json-the-data-format-for-the-internet/) containing three lists of the same length. The same position across the three lists refer to the same sample. Here's an example:

```json
{ "ts": [123000, 123010], "id": [4, 8], "v": [723.0, 62.9] }
```
- `ts` — timestamps of each sample. This is in units of microseconds since the start of the replay.

- `id` — which sensor each sample came from. A table of sensor IDs is listed below.

- `v` — the actual value for each sample.

So, the above example means that at 123000us, sensor 4 (pcm.pedals.brakePressure.front) had a value of 723.0, and at 123010us, sensor 8 (pcm.moc.motor.temp) had a value of 62.9.

|ID|Sensor Name|⠀⠀⠀⠀⠀⠀⠀⠀|ID|Sensor Name|
|--|-----------|----------|--|-----------|
|0|pcm.wheelSpeeds.frontLeft||13|bms.stack.mma.temp.avg|
|1|pcm.wheelSpeeds.backLeft||14|ludwig.steeringWheel.angle|
|2|pcm.wheelSpeeds.backRight||15|ludwig.shockpot.frontLeft|
|3|pcm.pedals.accel||16|ludwig.shockpot.frontRight|
|4|pcm.pedals.brakePressure.front||17|ludwig.shockpot.rearLeft|
|5|pcm.pedals.brakePressure.rear||18|ludwig.shockpot.rearRight|
|6|pcm.moc.motor.requestedTorque||19|pcm.vnav.posLla.latitude|
|7|pcm.moc.motor.torqueFeedback||20|pcm.vnav.posLla.longitude|
|8|pcm.moc.motor.temp||21|pcm.vnav.velocityBody.x|
|9|pcm.coolingLoop.temp||22|pcm.vnav.velocityBody.y|
|10|bms.pack.voltage||23|pcm.vnav.compensatedAccel.x|
|11|bms.pack.current||24|pcm.vnav.compensatedAccel.y|
|12|bms.pack.power||25|pcm.vnav.yawPitchRoll.yaw|

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

6. **OPTIONAL** If you want, you can run the example widget we provide. First, make sure you have Node.js installed. Visit [Node.js's official website](https://nodejs.org/en/download/) and follow the instructions there to install it.

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