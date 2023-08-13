# Raspberry Pi Fullscreen Web Kiosk


Download Rasbian LITE (https://www.raspberrypi.org/downloads/raspbian/) and flash it on microSD card

Setup raspberry pi to auto login on boot

```
sudo raspi-config
```
Goto Boot Options > B1 Desktop / CLI > B2 Console AutoLogin
Then hit enter select 'OK' and exit


Install 'X11', 'chromium' and 'unclutter'
```
sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit
sudo apt-get install chromium-browser
sudo apt-get install unclutter
```

Disable Chromium updates
```
sudo touch /etc/chromium-browser/customizations/01-disable-update-check;echo CHROMIUM_FLAGS=\"\$\{CHROMIUM_FLAGS\} --check-for-update-interval=31536000\" | sudo tee /etc/chromium-browser/customizations/01-disable-update-check
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
    while [ "$(hostname -I)" = "" ]; do
        echo -e "\e[1A\e[KNo network: $(date)"
        sleep 1
    done
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
