---
layout: post
date:   2016-06-18
title: Ubuntu Server and ROS installation on ODROID-XU4
category: robotics
---


# **Ubuntu Server** and **ROS** installation on **ODROID-XU4**

* placeholder
{:toc}

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
    # Terminal:
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

 1. The user name and password for the image are respectively `root` and `odroid`. If everything is OK then you should be able to ssh into it with
    
    ```bash
    $ ssh 192.168.0.30 -l root # Use the IP assigned to the board
    ```

    * If there is something wrong then connect a monitor and keyboard. See what errors you get during boot. If you know what IP it's suppose to have try `ifconfig` and confirm the `eth0` network interface. These might give enough leads for troubleshooting.

## Some Ubuntu Customizations

### Connect to Internet via Host Computer

### Eliminating I2C Warnings During Boot
http://odroid.com/dokuwiki/doku.php?id=en:xu4_tips


## ROS Installation


## Notes

* You need to use `sync` when you call `dd`. This makes sure the buffer is writen to the device.

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

## TODO

## References
[^abi]:[What is Application Binary Interface (ABI)?](http://stackoverflow.com/questions/2171177/what-is-application-binary-interface-abi?rq=1)
[Difference between API and ABI](http://stackoverflow.com/questions/3784389/difference-between-api-and-abi?rq=1)

[^xu4]: [Odroid-XU4 wiki](http://odroid.com/dokuwiki/doku.php?id=en:odroid-xu4)

