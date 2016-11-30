---
layout: post
date:   2016-06-18
title: Ubuntu Server and ROS installation on ODROID-XU4
category: robotics
---

# **Ubuntu Server** and **ROS** installation on **ODROID-XU4**

I have an Odroid XU4[^xu4] which I want to use for some robotic projects. In this post I go through the process of setting up the board, installing Ubuntu Server and ROS. Also, I look into making some adjustments to the fresh Ubuntu.

* TOC
{:toc}


## Ubuntu Installation

 1. On the host computer, download the Ubuntu server image file from [this link](http://odroid.in/ubuntu_14.04lts/ubuntu-14.04lts-server-odroid-xu3-20150725.img.xz) or you can take a look at [here](http://odroid.in/ubuntu_14.04lts/) to see if any newer version is available.

    ```bash
    $ wget http://odroid.in/ubuntu_14.04lts/ubuntu-14.04lts-server-odroid-xu3-20150725.img.xz # or any other version that you choose
    ```

 1. Connect a SD card to the host. you need find out which device it is in your `/dev/` tree. You can do so by `sudo fdisk -l`. The other way is to type the following before and after you insert the card `ls /dev/sd*`. See which the new item in that list. Using `fdisk` or `df -h` make sure that the size of the device is as expected (e.g. you shouldn't see 256GB for a 16GB card).

 1. Let's assume the SD card is on `/dev/sd?`, so I do the followings on host computer:

    ```bash
    $ unxz ubuntu-14.04lts-server-odroid-xu3-20150725.img.xz # or use tar
    $ sudo dd if=/dev/zero of=/dev/sd? bs=1M # change sd?
    $ sync
    $ sudo fdisk -l # [optional] it should say '/dev/sd?' doesn't contain a valid partition
    $ sudo dd if=ubuntu-14.04lts-server-odroid-xu3-20150725.img of=/dev/sd? bs=1M conv=fsync # change sd?
    $ sync
    $ sync # just to be sure sure
    ```

 1. \[Optional\]: if you want to have static IP on the Odroid for `eth0` then do the following:
   
    ```bash
    $ mkdir temp_folder
    $ sudo mount /dev/sd?2 temp_folder # mounting second partition: 'rootfs'
    $ sudo nano /temp_folder/etc/network/interfaces.d/eth0 # or any other editor
    ```
    
    It must look like the one below:
    
    ```bash
    auto eth0
    iface eth0 inet dhcp # gets IP automatically
    ```

    You need to change it to the following
    
    ```bash
    auto eth0
    iface eth0 inet static
    address 192.168.0.30 # or some other IP
    netmask 255.255.255.0 # modify if needed, should work for most networks
    gateway 192.168.0.1
    broadcast 192.168.0.255
    ```
    
    Save it and type in the command line:
    
    ```bash
    $ sudo umount temp_folder # unmounts the device
    $ rm -r temp_folder # if you don't need it anymore
    ```

 1. Eject the SD card and put it in the Odroid and power it up.

 1. When you first install the mentioned Ubuntu image, the user name and password for the image are respectively `root` and `odroid`. If everything is OK then you should be able to ssh into it with
    
    ```bash
    $ ssh 192.168.0.30 -l root # Use the board's IP address
    ```

    If there is something wrong then connect a monitor and keyboard. See what errors you get. If known try `ifconfig` and examine the `eth0`. These might give enough leads for troubleshooting.

## Some Ubuntu Customizations

### Create a New Account

Make a non-root account like this:

```bash
$ adduser some_username # and answer the questions asked
$ adduser some_username sudo # give sudo privileges
$ whoami # [optional] see the currently being used username
$ su - some_username # switch to some_username
$ whoami # [optional] confirm that account has been switched
```

You can use this user to ssh into the board from now on.

### Update the OS

If you are connected to the Internet then do the following in the terminal of the board. If you are not connected to the Internet, but want to get Internet access through host computer, then go to the [next section](#connect-to-internet-via-host-computer).
You need to be superuser for these commands. One option is to run them with `sudo` at the beginning of each line.

```bash
$ apt-get update
$ apt-get upgrade
$ apt-get dist-upgrade
$ apt-get autoremove
$ apt-get autoclean
```

### Connect to Internet via Host Computer

 1. Type the following in terminal of the host computer from which you plan to share the Internet. You probably need superuser privileges to do so:

    ```bash
    $ iptables --table nat --append POSTROUTING --out-interface wlan2 -j MASQUERADE # change 'wlan2' to the network interface connected to Internet
    $ iptables --append FORWARD --in-interface eth0 -j ACCEPT # change 'eth0' to the network interface connected to the board
    $ echo 1 > /proc/sys/net/ipv4/ip_forward
    ```

 2. Type the following in the terminal of the board. You can `ssh` into it to do so. Again, you need to run the commands below as superuser:

    ```bash
    $ route add default gw 192.168.0.1 # change 192.168.0.1 to whatever IP address the host computer has
    $ echo "nameserver 8.8.8.8" >> /etc/resolv.conf # 8.8.8.8 is Google's public DNS so, don't change it unless you know what you are doing
    ```

 3. Test everything by typing the following in the terminal of the board:

    ```bash
    $ ping google.com
    ```

    Alternatively, you can try the following command instead.


    ```bash
    $ ping -c 1 google.com > /dev/null 2>&1; if [ $? -eq 0 ]; then echo "YOU ARE CONNECTED!"; else echo "YOU ARE NOT CONNECTED"; fi
    ```
    

### Eliminating I2C Warnings During Boot
To fix the boot errors similar to:

    [   11.229087] [c4] INA231 2-0040: I2C write error: (-6) reg: 0x0
    [   11.233666] [c4] INA231 2-0040: ============= Probe INA231 Fail! : sensor_arm (0xFFFFFFFA) =============

Make a `/etc/modprobe.d/blacklist-odroid.conf ` file with the following content:

    blacklist ina231_sensor 

### Setup Git

Git is a powerful version control system and version control is a must for developers. It will also be helpful with downloading public repositories that you'll most probably come across many times.

 1. From a terminal install Git:

    ```bash
    $ sudo apt-get install git
    ```

 2. And configure your name and email address:
    
    ```bash
    $ git config --global user.name "YOUR NAME"
    $ git config --global user.email "YOUR EMAIL ADDRESS"
    ```

 3. \[Optional\] Configure your editor:

    ```bash
    $ git config --global core.editor vim
    ```

### Fix Clock

Correct the datetime of the board using the commands below:

```bash
$ sudo ntpdate time.nist.gov
$ sudo dpkg-reconfigure tzdata
```

## ROS Installation

 1. From a **non-root** user perform the followings in the terminal of your board to install ROS[^ros].

    ```bash
    $ sudo update-locale LANG=C LANGUAGE=C LC_ALL=C LC_MESSAGES=POSIX # setting system locale
    $ sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list' # adding ROS source to source lists
    $ sudo apt-key adv --keyserver hkp://ha.pool.sks-keyservers.net:80 --recv-key 0xB01FA116 # using a pretty good privacy[^pgp]
    $ sudo apt-get update
    $ sudo apt-get install ros-jade-ros-base # installs ROS Jade
    $ sudo apt-get install python-rosdep
    ```

 2. Now you can get most of ROS packages like this:

    ```bash
    $ sudo apt-get install ros-jade-<package-name>
    ```

 3. To be able to use ROS, finally do the followings:

    ```bash
    $ sudo rosdep init
    $ rosdep update
    $ echo "source /opt/ros/jade/setup.bash" >> ~/.bashrc
    $ source ~/.bashrc
    ```

## Notes

 *  You need to use `sync` after you call `dd`. This makes sure the buffer is written to the device.

 *  Pay attention to `bash` vs `sh`. If you want to switch from `sh` to `bash` run:

    ```bash
    $ /bin/bash
    ```

 *  Don't just unplug the power when you want to turn it off. Use:
    
    ``` bash
    $ sudo halt now # for shutting down
    #or
    $ sudo shutdown -h now
    #or
    $ sudo poweroff
    #or
    $ sudo init 0
    ```
    
    or 
    
    ```bash
    $ sudo reboot now # for reboot
    # or
    $ sudo shutdown -r
    ```

 *  Hardkernel also provides *Lubuntu* which I tried and chose not to use.

 *  If you get the following error when doing `sudo update-locale LANG=C LANGUAGE=C LC_ALL=C LC_MESSAGES=POSIX`:
    
    ```bash
    perl: warning: Setting locale failed.
    perl: warning: Please check that your locale settings:
    LANGUAGE = (unset),
    LC_ALL = (unset),
    LANG = "en_US.UTF-8"
    are supported and installed on your system.
    perl: warning: Falling back to the standard locale ("C").
    ```
    
    Fix it by running the following:

    ```bash
    $ locale-gen en_US en_US.UTF-8
    $ dpkg-reconfigure locales
    ```

---------
[^xu4]: [Odroid-XU4 wiki](http://odroid.com/dokuwiki/doku.php?id=en:odroid-xu4)

[^ros]: [ROS Ubuntu Arm](http://wiki.ros.org/jade/Installation/UbuntuARM)