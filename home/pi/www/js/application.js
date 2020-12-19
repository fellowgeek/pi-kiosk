/*
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
GLOBALS
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
*/

var $online = false;

var $client = mqtt.connect('wss://MQTT_ADDRESS', {
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'USERNAME',
    password: 'PASSWORD'
});

var $context = null;

/*
----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
UTILITY FUNCTIONS
----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
*/

function readTextFile($file, $successCallback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", $file, false);
    rawFile.setRequestHeader('Cache-Control', 'no-cache');
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                $successCallback(allText);
            }
        }
    }
    rawFile.send(null);
}

function updateDisplay($url) {
    document.getElementById('display').src = $url;
}

function updateDisplayPin() {
    readTextFile("pin.txt", function ($pin) {
        if ($pin != '') {
            document.querySelector('#pin').innerHTML = $pin;
        }
    });

}

function MQTTSubscribe() {

    readTextFile("pin.txt", function ($pin) {
        if ($pin != '' && $pin != '....' && $online == true) {
            document.querySelector('#pin').innerHTML = $pin;
            $client.subscribe('mqtt/rpi/broadcast');
            $client.subscribe('mqtt/rpi/' + $pin);
            $client.subscribe('mqtt/rpi/' + $pin + '/whiteboard');
        } else {
            setTimeout(() => {
                MQTTSubscribe();
            }, 10000);
        }
    });

}

/*
----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
WHITEBOARD
----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
*/

function drawLine($x0, $y0, $x1, $y1, $color) {

    $context.beginPath();

    $context.moveTo($x0, $y0);
    $context.lineTo($x1, $y1);
    $context.strokeStyle = $color;
    $context.lineWidth = 2;
    $context.stroke();

    $context.closePath();

}

function handleDrawCommand($cmd) {

    switch ($cmd.action) {
        case 'draw':
            drawLine($cmd.x0, $cmd.y0, $cmd.x1, $cmd.y1, $cmd.color);
            break;

        case 'clear':
            $context.clearRect(0, 0, 1920, 1080);
            break;

        case 'ping':
            var $url = document.getElementById('display').src;
            var $pin = document.getElementById('pin').innerHTML;
            if ($url && $url != '#') {
                $client.publish('mqtt/rpi/' + $pin + '/url', $url);
            }
            break;

        default:
            break;
    }

}

/*
----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
INITALIZATION
----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
*/

document.addEventListener('DOMContentLoaded', function () {

    $context = document.getElementById('whiteboard').getContext('2d');

    updateDisplayPin();
    setInterval(() => {
        updateDisplayPin();
    }, 20000);

    setTimeout(() => {
        readTextFile("url.txt", function ($url) {
            if ($url != 'http://localhost:8080/') {
                updateDisplay($url);
            }
        });
    }, 5000);

    $client.on('connect', function () {
        $online = true;
        document.querySelector('#pin').classList = 'bg-online';
        MQTTSubscribe();
    });

    $client.on('offline', function () {
        $online = false;
        document.querySelector('#pin').classList = 'bg-offline';
    });

    $client.on("message", function ($from, $message) {

        if ($from.endsWith('whiteboard')) {
            handleDrawCommand(JSON.parse($message));
            return;
        }

        switch (true) {
            case /^>RESET$/.test($message):
                break;

            case /^>REBOOT$/.test($message):
                break;

            case /^>POWEROFF$/.test($message):
                break;

            case /^>VIDEO (.*?)$/.test($message):
                break;

            case /^>AUDIO (.*?)$/.test($message):
                break;

            case /^>TV ON (.*?)$/.test($message):
                break;

            case /^>TV OFF (.*?)$/.test($message):
                break;

            case /^>URL (.*?)$/.test($message):
                break;

            default:
                if ($message != '') {
                    updateDisplay($message);
                }
                break;
        }

    });

});