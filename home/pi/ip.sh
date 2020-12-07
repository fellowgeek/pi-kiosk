#!/bin/sh

lanIP=$(ifconfig eth0 | grep 'inet ' | awk '{ print $2 }')
wifiIP=$(ifconfig wlan0 | grep 'inet ' | awk '{ print $2 }')
lanMAC=$(cat /sys/class/net/eth0/address)
wifiMAC=$(cat /sys/class/net/wlan0/address)
echo "{\"lanIP\":\"$lanIP\",\"wifiIP\":\"$wifiIP\",\"lanMAC\":\"$lanMAC\",\"wifiMAC\":\"$wifiMAC\"}" > /home/pi/www/pi.json
echo "{\"lanIP\":\"$lanIP\",\"wifiIP\":\"$wifiIP\",\"lanMAC\":\"$lanMAC\",\"wifiMAC\":\"$wifiMAC\"}"
