/*
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
IMPORTS
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
*/

const fetch = require('node-fetch');
const { spawn } = require("child_process");
const fs = require('fs');
const mqtt = require('mqtt');

/*
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
VARIABLES
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
*/

var $accessToken = 'TOKEN';
var $serverAddress = 'https://SERVER_ADDRESS';
var $location = 'Universal';
var $PIN = '';
var $lastPIN = '';
var $lastURL = fs.readFileSync('url.txt', 'utf8');

var $client = mqtt.connect('wss://MQTT_ADDRESS', {
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'USERNAME',
    password: 'PASSWORD'
});

/*
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
UTILITY FUNCTIONS
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
*/

function rpiPingServer() {

    var $ip = '';
    var $pi = JSON.parse(fs.readFileSync('pi.json', 'utf8'));
    var $lastPIN = fs.readFileSync('pin.txt', 'utf8');

    if ($pi.lanIP != '') {
        $ip = $pi.lanIP;
    }
    if ($pi.wifiIP != '') {
        $ip = $pi.wifiIP;
    }

    if ($pi.lanIP != '' || $pi.wifiIP != '') {
        fs.writeFileSync('online.txt', 'true', 'utf8');
    } else {
        fs.writeFileSync('online.txt', 'false', 'utf8');
    }

    var $data = {
        token: $accessToken,
        UUID: $pi.lanMAC + '-' + $pi.wifiMAC,
        IP: $ip,
        LAN: $pi.lanIP,
        WIFI: $pi.wifiIP,
        Type: 'Raspberry Pi',
        Name: 'RPI-' + $location,
        Location: $location,
        Version: '2.5'
    };

    fetch($serverAddress + '/rpi/RPI/ping/',
        {
            method: 'POST',
            body: JSON.stringify($data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    .then($response => $response.json())
    .then($json => {
        $PIN = $json.data.Pin;
        fs.writeFileSync('pin.txt', $json.data.Pin, 'utf8');
        if ($PIN != $lastPIN) {
            rpiMQTTSubscribe();
        }
    });

}

function rpiMQTTSubscribe() {

    if ($client.connected == true && $PIN != '....') {
        console.log('MQTT: subscribing, pin is:', $PIN);
        $client.subscribe('mqtt/rpi/broadcast');
        $client.subscribe('mqtt/rpi/' + $PIN);
    } else {
        console.log('MQTT: trying to resubscribe in few seconds.');
        var $delay = 4000 + parseInt(Math.random() * 1000);
        setTimeout(() => {
            rpiMQTTSubscribe();
        }, $delay);
    }

}

/*
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
STARTUP
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
*/

// attempt to subscribe to MQTT topics when MQTT connected
$client.on('connect', function () {
    console.log('MQTT: connected.');
    rpiMQTTSubscribe();
});

// process MQTT commands
$client.on('message', function ($topic, $message) {
    $message = $message.toString();
    console.log('MQTT: message received:', $topic, $message);

    switch (true) {
        case /^>RESET$/.test($message):
            spawn("chromix-too", ['url', 'http://localhost:8080']);
            break;

        case /^>REBOOT$/.test($message):
            spawn("sudo", ["reboot"]);
            break;

        case /^>POWEROFF$/.test($message):
            spawn("sudo", ["poweroff"]);
            break;

        case /^>VIDEO (.*?)$/.test($message):
            var $matches = /^>VIDEO (.*?)$/.exec($message);
            var $video = $matches[1] || '';
            if ($video != '') {
                spawn("omxplayer", [$video]);
            }
        break;

        case /^>URL (.*?)$/.test($message):
            var $matches = /^>URL (.*?)$/.exec($message);
            var $url = $matches[1] || '';
            if ($url != '') {
                spawn("chromix-too", ['url', $url]);
            }
        break;

        default:
            console.log('default triggered.');
            if ($message != '') {
                fs.writeFileSync('url.txt', $message, 'utf8');
            }
        break;
    }

});

// timer to ping server and update PIN
setInterval(() => {
    rpiPingServer();
}, 15000);
