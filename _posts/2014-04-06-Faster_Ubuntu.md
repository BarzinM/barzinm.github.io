---
layout: post
date:   2015-01-02 23:26:12
title: Faster Ubuntu
caption_header: Making Ubuntu run faster
---

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

http://www.pelagodesign.com/blog/2009/07/21/how-to-make-ubuntu-linux-run-faster-on-a-laptop/
http://ubuntuforums.org/showthread.php?t=1062261
http://askubuntu.com/questions/196603/how-to-remove-the-graphical-user-interface

