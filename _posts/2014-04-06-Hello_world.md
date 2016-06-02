---
layout: post
date:   2014-12-07 23:26:12
title: Hello World!
caption_header: Hello World!
---

# Hello World!

## First post

The purpose of this site is to introduce projects that I've worked on during my professional career. Also I'm using this space to post interesting stuff that I come across, mainly in the field of technology.

```python
import pika


class MessageQueueService(object):

    def log(self, message, queue, host, direction=MessageQueueLog.RECEIVED):
        message_log = MessageQueueLog.objects.create(
                queue=queue,
                host=host,
                message=message,
                direction=direction
            )
        return message_log	pass
```

```c++
#include <iostream>

using namespace std;

int main(int argc, char *argv[])
{
cout << "Hello World !!!" << endl;
return 0;
}

```