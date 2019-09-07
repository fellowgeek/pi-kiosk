# Raspberry Pi Fullscreen Web Kiosk

Setup raspberry pi to auto login on boot

```
sudo raspi-config
```
Goto Boot Options > B1 Desktop / CLI > B2 Console AutoLogin
Then hit enter select 'OK' and exit


Install 'chromium' and 'unclutter'
```
sudo apt-get install chromium-browser
sudo apt-get install unclutter
```

Setup '.bash_profile' script

```
touch ~/.bash_profile
nano ~/.bash_profile
```

Then paste the content below inside '.bash_profile' file and save

```
if  [ $(tty) == "/dev/tty1" ]
then
    startx
fi
```

Setup '.xinitrc' script
```
touch ~/.xinitrc
nano ~/.xinitrc
```

Then paste the content below inside '.xinitrc' file and save

```
#!/bin/sh
xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser https://www.google.com --window-position=0,0 --window-size=1920,1080 --start-fullscreen --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI --disk-cache-dir=/dev/null
```

Change the URL to website of your choice.

Profit!