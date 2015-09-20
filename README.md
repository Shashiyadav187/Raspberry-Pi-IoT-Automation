# Raspberry-Pi-IoT-Automation
Javascript, HTML 5, and CSS project that allows one to control and read the status of a Raspberry Pi's GPIO with a browser interface and a Node.js backend  
Install Node.js on your Raspberry Pi, [instructions] (http://seanbailey.tech/index.php/how-to-install-node-js-on-the-raspberry-pi/)  
To use this repo:
 1. "git clone git://github.com/shredd/Raspberry-Pi-IoT-Automation.git"
 2. "npm install"
 3. "node app.js"  
 4. Connect your web browser to the ngrok tunnel URL

NOTE: as of 9/9/2015 the latest version of Raspbian has broken the node module onoff, the app.js now requires superuser priveledges to run  
[here] (https://github.com/raspberrypi/linux/issues/1117) is the current fix

[Schematic.fzz](https://github.com/shredd/Raspberry-Pi-IoT-Automation/blob/master/Schematic.fzz) is a [Fritzing](http://fritzing.org/home/) file. It requires the [AdaFruit Fritzing Library](https://github.com/adafruit/Fritzing-Library) for the PIR sensor.

![Connection Diagram](https://raw.githubusercontent.com/shredd/Raspberry-Pi-IoT-Automation/master/Connection_Diagram.png)
