---
layout: post
date:   2016-5-26 23:26:12
title: Odriod Setup and Configuration
caption_header: Odriod Setup and Configuration what is this?
---



# **Ubuntu Server** and **ROS** installation on **ODROID-XU4**

## My Setup

I have an Odroid XU4[^xu4] on which I want to have Ubuntu Server and ROS.

## Ubuntu Installation

### Hacky Way

1. First we get the `arm-eabi-x.y.tar.gz` toolchain this is used for building native apps. Eabi is embedded ABI[^abi] which means that it is designed for bare metal. Then you need to find an *Ubuntu* source to build it with this.

### Easy and Fast Way

1. On the host computer, download the Ubuntu server image file from [this link](http://odroid.in/ubuntu_14.04lts/ubuntu-14.04lts-server-odroid-xu3-20150725.img.xz) or you can take a look at [here](http://odroid.in/ubuntu_14.04lts/) to see if any newer version is available.

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

1. [Optional]: if you want to have static IP on the Odroid for `eth0` then do the following:
   
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
    $ ssh 192.168.0.30 -l root # Use the IP assigned to the board
    ```

    * If there is something wrong then connect a monitor and keyboard. See what errors you get. If known try `ifconfig` and examine the `eth0`. These might give enough leads for troubleshooting.

## Some Ubuntu Customizations

### Update the OS

If you are connected to the Internet then do the following in the terminal of the board. If you are not connected to the Internet but want to be then go to the [next section](#connect-to-internet-via-host-computer). You need to be superuser for these commands. One option is to run them with `sudo` at the beginning of each line.

```bash
$ apt-get update
$ apt-get upgrade
$ apt-get dist-upgrade
$ apt-get autoclean
$ apt-get autoremove
```

### Connect to Internet via Host Computer

1. Type the following in terminal of the host computer from which you plan to share the Internet. You probably need superuser privileges to do so:

    ```bash
    $ iptables --table nat --append POSTROUTING --out-interface wlan2 -j MASQUERADE # change wlan2 to the network interface connected to internet
    $ iptables --append FORWARD --in-interface eth0 -j ACCEPT # change eth0 to the network interface connected to the board
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

    * If you don't know what to get out of the `ping` output, well, you should. In the meanwhile, you can try the following command instead.


    ```bash
    $ ping -c 1 google.com > /dev/null 2>&1; if [ $? -eq 0 ]; then echo "YOU ARE CONNECTE!"; else echo "YOU ARE NOT CONNECTED"; fi
    ```
    

### Eliminating I2C Warnings During Boot
http://odroid.com/dokuwiki/doku.php?id=en:xu4_tips

### Setup Git

### Fix Clock

sudo ntpdate time.nist.gov
dpkg-reconfigure tzdata


## ROS Installation

1. From a **non-root** user perform the followings in the terminal of your board to install ROS[^ros].

    ```bash
    $ sudo update-locale LANG=C LANGUAGE=C LC_ALL=C LC_MESSAGES=POSIX # setting system locale
    $ sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list' # adding ROS source to source lists
    $ sudo apt-key adv --keyserver hkp://ha.pool.sks-keyservers.net:80 --recv-key 0xB01FA116 # using a pretty good privacy [^pgp]
    $ sudo apt-get update
    $ sudo apt-get install ros-jade-ros-base # installs ROS Jade
    $ sudo apt-get install python-rosdep
    $ sudo rosdep init
    $ rosdep update
    $ echo "source /opt/ros/jade/setup.bash" >> ~/.bashrc
    $ source ~/.bashrc
    ```

## Notes

* You need to use `sync` when you call `dd`. This makes sure the buffer is written to the device.

* Pay attention to `bash` vs `sh`. If you want to switch from `sh` to `bash` run:

    /bin/bash

* Don't just unplug the power when you want to turn it off. Use:
    
    ```
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

* Odroid also provides *Lubuntu* which I tried and chose not to use.
* If you get the following error when doing `sudo update-locale LANG=C LANGUAGE=C LC_ALL=C LC_MESSAGES=POSIX`:
    
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
    $ locale-gen en_US en_US.UTF-8 hu_HU hu_HU.UTF-8
    ```

## TODO

## References
[^abi]:[What is Application Binary Interface (ABI)?](http://stackoverflow.com/questions/2171177/what-is-application-binary-interface-abi?rq=1)
[Difference between API and ABI](http://stackoverflow.com/questions/3784389/difference-between-api-and-abi?rq=1)

[^xu4]: [Odroid-XU4 wiki](http://odroid.com/dokuwiki/doku.php?id=en:odroid-xu4)

[^pgp]: [Introduction to Apt Authentication](https://help.ubuntu.com/community/SecureApt)

[^ros]: [ROS Ubuntu Arm](http://wiki.ros.org/jade/Installation/UbuntuARM)