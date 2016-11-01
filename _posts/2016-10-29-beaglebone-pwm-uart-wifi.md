---
layout: post
date:   2016-10-31
title: BeagleBone, PWM, UART, and WiFi
category: robotics
---

# BeagleBone, PWM, UART, and WiFi in Ubuntu 16.04

## PWM

### PWM Dependencies

Make sure you can use the `config-pin` command in your BeagleBone terminal. If you don't have it then set it up like this:

	$ cd /tmp
	$ wget https://raw.githubusercontent.com/cdsteinkuehler/beaglebone-universal-io/master/config-pin
	$ sudo chmod +x config-pin # turn it to an executable
	$ sudo cp ./config-pin /usr/bin # copy it somewhere that you can use it from any path
	$ config-pin -l P8.07 # list the pin's available functionalities, confirms that `config-pin` works

The last line should output something similar to below:

	default gpio gpio_pu gpio_pd timer

### PWM Setup

First we load the universal IO device tree overlay by doing the following:
	
	$ echo cape-universaln > /sys/devices/platform/bone_capemgr/slots

Based on the OS image that you have, the path above might be different. If so, use `find` to find it (e.g. `sudo find / -name slots | grep bone_capemgr`). I initially thought that the `cape-universaln` has a typo but then realized that it's correct. Doing that also needs superuser privileges. So either you can do `sudo su` before typing it or use the following instead:

	$ sudo sh -c "echo cape-universaln > /sys/devices/platform/bone_capemgr/slots"

Confirm the change by doing the following:

	$ cat /sys/devices/platform/bone_capemgr/slots

That should output something like the following in which we want to see something similar to the last line:

	0: PF----  -1 
	1: PF----  -1 
	2: PF----  -1 
	3: PF----  -1 
	4: P-O-L-   0 Override Board Name,00A0,Override Manuf,cape-universaln

### Enable PWM on a Pin

In this example, I'll enable PWM on P9.14:

	$ config-pin P9.14 pwm

Confirm the change:

	$ cat /sys/devices/platform/ocp/ocp\:P9_14_pinmux/state

That should output `pwm`. You should alternatively be able to change the state by:

	$ echo pwm > /sys/devices/platform/ocp/ocp\:P9_14_pinmux/state

Find the related chip from [https://github.com/jadonk/bonescript/blob/master/src/bone.js](https://github.com/jadonk/bonescript/blob/master/src/bone.js) and locate it in `/sys/class/pwm` by:

	$ ls -l /sys/class/pwm

Go into the directory of interest and use the following commands to configure the PWM output. Notice that the pwm subdirectory is created after the export part.


	$ echo $i > /sys/class/pwm/pwmchip2/export # i = pwm output of the chip
	$ echo $i > /sys/class/pwm/pwmchip2/unexport

	# if i=0 then the pwm0/ directory is created which you need to go into

	$ echo 1000000000 > /sys/class/pwm/pwmchip2/pwm0/period
	$ echo 500000000 > /sys/class/pwm/pwmchip2/pwm0/duty_cycle

	$ echo 1 > /sys/class/pwm/pwmchip2/pwm0/enable
	$ echo 0 > /sys/class/pwm/pwmchip2/pwm0/enable

### Load Device Tree Overlay on Boot

To have the `cape-universaln` loaded by default at boot time change this line in `/boot/uEnv.txt`

	# cape_enable=bone_capemgr.enable_partno=

To the following and don't forget to uncomment it if needed:

	cape_enable=bone_capemgr.enable_partno=cape-universaln

Also, your `uEnv.txt` file might be in a different directory like `/boot/uboot/`.

## WiFi

### Enable WiFi and Connect to Network on Boot

Find out what the interface's name is:

	$ iw dev

Outputs something like:

	phy#0
		Interface wlxe8de27a1697e # <- this
			ifindex 6
			wdev 0x1
			addr e8:de:27:a1:69:7e
			type managed

Save your network authentication information in a file by doing the below which will ask for a passphrase:

	$ sudo sh -c "wpa_passphrase Bruce >> /etc/wpa_supplicant/wpa_supplicant.conf"

Add your network and wpa configuration information to `/etc/network/interfaces`:

	auto wlxe8de27a1697e
	iface wlxe8de27a1697e inet static
	    address 192.168.1.4 # IP of choice for BeagleBone
	    netmask 255.255.255.0
	    network 192.168.1.0
	    gateway 192.168.1.1
	    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
	    dns-nameservers 8.8.8.8 # a DNS address

### Disable Password For SSH

Thanks to and based on [http://askubuntu.com/questions/46930/how-can-i-set-up-password-less-ssh-login](http://askubuntu.com/questions/46930/how-can-i-set-up-password-less-ssh-login). In the host terminal perform and give the configurations that you'd like:

	$ ssh-keygen

Again on the host:

	$ ssh-copy-id some_username@192.168.1.4

Now you don't need to provide password for the BeagleBone each time you want to ssh into it from the host device. Next, we will disable password authentication so that devices other than the host device that you just configured cannot easily guess your password:

	$ sudo nano /etc/ssh/sshd_config

There is a line that says something like:
	
	#PasswordAuthentication yes

Which you should uncomment and change to:

	PasswordAuthentication no

### Remove username:password Information from SSH Login Message:

The information is given by `/etc/issue.net` so change it however you like:

	sudo nano /etc/issue.net # change the message