#!/bin/bash
set -x

iw dev uap0 del
sleep 3
systemctl stop hostapd
sleep 3
systemctl stop dnsmasq
sleep 3
systemctl restart dhcpcd
sleep 10

