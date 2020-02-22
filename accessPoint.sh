#!/bin/bash
set -x

iw dev wlan0 interface add uap0 type __ap
sleep 5
systemctl start hostapd
sleep 3
systemctl start dnsmasq
sleep 3
systemctl restart dhcpcd
sleep 10
