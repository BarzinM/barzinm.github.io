---
layout: post
date:   2016-06-18
title: Ubuntu Server and ROS installation on ODROID-XU4
category: robotics
---

# Autoencoders, Convolutional Autoencoders, and Convolution Transpose

I'll discuss the motivation and application of these tools first. I won't go into theoretical details but include some resources for anyone interested. At the end, let's take a look at a Convolutional Autoencoder code on mnist dataset with some discussion on practicality and possible modifications.


* TOC
{:toc}

## Intro

### Autoencoders

What is Autoencoder? I'm glad you asked. Autoencoders in general come from the beautiful idea that let us improve models in unsupervised fashion. In Deep learning we sometimes want to infer from high dimensional data to meaningful lower dimension states for example in perception applications. In other words we want the low dimension information to contain all the important information in the high dimensional input. Here is where Autoencoder show it's strength. The idea is that we first map from high dimensions to lower dimensions and then map this low dimension information to high dimension output. We can conclude that the low dimension layer (bottleneck) is a good representation of information if we can have the model to learn to have outputs with values as close as possible to the inputs.

Want to learn more? Use these useful resources:

A comprehensive resource:
[http://www.deeplearningbook.org/contents/autoencoders.html](http://www.deeplearningbook.org/contents/autoencoders.html)

Get your feet wet:
[http://cs.stanford.edu/people/karpathy/convnetjs/demo/autoencoder.html](http://cs.stanford.edu/people/karpathy/convnetjs/demo/autoencoder.html)

A quick overview:
[http://ufldl.stanford.edu/tutorial/unsupervised/Autoencoders/](http://ufldl.stanford.edu/tutorial/unsupervised/Autoencoders/)

Explanation with good visualization:
[https://blog.keras.io/building-autoencoders-in-keras.html](https://blog.keras.io/building-autoencoders-in-keras.html)

### Convolutional Autoencoders and Convolution Transpose

Assuming you know what Convolution networks are, I'll explain Convolution Transpose. These type of models are similar to convolutional but the direction of information is reversed. Meaning that instead of reducing the dimensions and increasing the depth, Convolution Transpose increases the dimensions and reduces the depth. Some [visualization](http://deeplearning.net/software/theano_versions/dev/tutorial/conv_arithmetic.html#transposed-convolution) might be helpful to better understand.

Convolutional Autoencoders in their simple form are autoencoders that stack a convolution transpose on top of a convolutional network.

Experimenting with convolutional autoencoders:
[https://swarbrickjones.wordpress.com/2015/04/29/convolutional-autoencoders-in-pythontheanolasagne/](https://swarbrickjones.wordpress.com/2015/04/29/convolutional-autoencoders-in-pythontheanolasagne/)




## Code

A class to quickly generate convolutional models:

```python
    class Convolutional(object):
        def __init__(self):
            self.parameters = []

        def addConv(self, patch_size, depth, stride):
            self.parameters.append((patch_size, depth, stride))
            

        def modelEncoder(self,input):
            self.input_shape = [int(a) for a in input.get_shape()]
            
            previous_depth = self.input_shape[-1]
            flow = input
            for patch_size,depth,stride in self.parameters:
                w,b = generateWeightAndBias([patch_size,patch_size,previous_depth,depth])
                previous_depth = depth
                flow = tf.nn.conv2d(flow, w, strides=[1, 1, 1, 1], padding='SAME')
                flow = tf.nn.bias_add(flow, b)
                flow = tf.nn.max_pool(flow, ksize=[1,stride,stride,1], strides=[1,stride,stride,1],padding='SAME')
                flow = tf.nn.relu(flow)
            return flow
```


Class for convolutional autoencoders:


```python
    class AutoEncoder(Convolutional):

        def modelDecoder(self,input):
            flow = input
            batch_size,height,width,depth = [int(a) for a in input.get_shape()]
            parameters = list(reversed(self.parameters))
            for i in range(len(parameters)-1):
                patch_size,depth,stride = parameters[i]
                next_depth = parameters[i+1][1]
                patch_size,depth,stride = parameters[i]
                w = tf.Variable(tf.truncated_normal([patch_size,patch_size,next_depth,depth], stddev=.1))
                b = tf.Variable(tf.constant(.01, shape=[next_depth]))
                height = height*stride
                width = width * stride
                flow = tf.nn.conv2d_transpose(
                    flow, w, output_shape=[batch_size,height,width,next_depth], strides=[1, stride, stride, 1], padding="SAME")
                flow = tf.nn.bias_add(flow, b)
                flow = tf.nn.relu(flow)
            patch_size,depth,stride = parameters[-1]
            original_depth = self.input_shape[-1]
            w = tf.Variable(tf.truncated_normal([patch_size,patch_size,original_depth,depth], stddev=.1))
            b = tf.Variable(tf.constant(.01, shape=[original_depth]))
            flow = tf.nn.conv2d_transpose(
                flow, w, output_shape=self.input_shape, strides=[1, stride, stride, 1], padding="SAME")
            flow = tf.nn.bias_add(flow, b)
            return tf.nn.tanh(flow)
                    
        def model(self,input):
            with tf.variable_scope('encoder'):
                flow = self.modelEncoder(input)
            with tf.variable_scope('decoder'):
                return self.modelDecoder(flow)


        def loadModel(self, path):
            # https://www.tensorflow.org/versions/master/api_docs/python/state_ops.html#exporting-and-importing-meta-graphs
            self.model()
            saver = tf.train.Saver()
            with tf.Session() as session:
                saver.restore(session, path)
```


Let's test:


```python
    import autoencoder as ae
    import numpy as np
    import dataGenerator, showMultipleArraysHorizontally
    import tensorflow as tf
    from time import time

    batch_size = 8
    train_dataset = '../data/processed/notmnist_images_train'
    valid_dataset = '../data/processed/notmnist_images_valid'


    def _gen(file_name):
        gen = dataGenerator(batch_size, file_name)
        while True:
            yield np.expand_dims(next(gen), axis=3)


    train_generator = _gen(train_dataset)
    valid_generator = _gen(valid_dataset)


    net = ae.AutoEncoder()
    net.addConv(7,4,2)
    net.addConv(7,12,7)
    # net.addConv(3,12,7)

    data_input = tf.placeholder(tf.float32, shape=(batch_size, 28, 28, 1), name="data_input_placeholder")
    output = net.model(data_input)
    loss = tf.reduce_mean(tf.abs(output - data_input))
    optimizer = tf.train.AdamOptimizer(.001).minimize(loss)


    train_steps = 100000
    valid_steps = 1000

    with tf.Session() as session:
        tf.initialize_all_variables().run()
        start_time = time()
        for i in range(1, train_steps + 1):
            train_data = next(train_generator)
            _, l = session.run([optimizer, loss], feed_dict={
                               data_input: train_data})
            if i % 100 == 0:
                c = 0
                for batch in range(0, valid_steps):
                    valid_data = next(valid_generator)
                    feed_dict = {data_input: valid_data}
                    c += loss.eval(feed_dict)
                print('%5d: Train loss: %.3f, Validation loss: %.3f' %
                      (i, l, c / valid_steps))
        print("Took %f seconds" % (time() - start_time))
```