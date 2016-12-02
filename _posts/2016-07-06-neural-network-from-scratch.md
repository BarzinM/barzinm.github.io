---
layout: post
date:   2016-11-30
title: Neural Network from Scratch
category: Machine Intelligence
permalink: neural-network-from-scratch
---

# Neural Network Code from Scratch


**Note:** *I might change contents of this page in future. The general discussion will stay the same. I'll make modifications as my knowledge improve on this topic or find errors.*

Let's make a simple Fully Connected Neural Network code. I'm going to use basic Python packages like Numpy. Instead of going through the theory, I'll list some useful resources below.

One of my favorite resources: [http://neuralnetworksanddeeplearning.com/chap1.html](http://neuralnetworksanddeeplearning.com/chap1.html)

Less mathematical theory, at the same time a fantastic resource: [http://karpathy.github.io/neuralnets/](http://karpathy.github.io/neuralnets/)


## Code
We are going to need the following dependencies:

```python
import numpy as np
from matplotlib.pyplot import plot, show, close, pause, figure, draw
from scipy.special import expit
```

First, some functions that we will be using later.
Two common activation functions are `relu` and `sigmoid`. I've tried to find implementations that give the fastest performance. Last function is a simple square sum that we will use to calculate the cost.

```python
def relu(inputs):
    return np.maximum(inputs, 0, inputs)


def sigmoid(inputs):
    return expit(inputs)


def reluDerivative(inputs):
    return np.where(inputs > 0, 1, 0)


def sigmoidDerivative(inputs):
    ex = np.exp(-inputs)
    return ex / (1 + ex)**2


def getCost(error):
    return np.sum(np.power(error, 2))
```

Now, let's see the class code. I've tried to comment it thoroughly:

```python
class NN(object):
    def __init__(self, shape, batch_size):
        self.batch_size = batch_size
        self.number_of_layers = len(shape)

        self.weights = []
        self.neuron_outputs = []
        self.neuron_inputs = []
        self.neuron_errors = []

        eps = .1  # for range of random initial weights
        for layer in range(len(shape)):  # let's construct layers one by one

            # initializing input arrays
            self.neuron_inputs.append(np.zeros([batch_size, shape[layer]]))

            # initializing error arrays
            self.neuron_errors.append(np.zeros([batch_size, shape[layer]]))

            if layer < len(shape) - 1:  # we add bias to all the layers except output
                self.neuron_outputs.append(
                    np.zeros([batch_size, shape[layer] + 1]))  # initializing output of each neuron

            else:  # this is last layer (output layer)
                self.neuron_outputs.append(
                    np.zeros([batch_size, shape[layer]]))

        for layer in range(1, len(shape)):
            self.weights.append(np.random.normal(0, eps, size=(
                shape[layer], shape[layer - 1] + 1)))  # '+1' at the end is for bias

    # adding a neuron with constant value `1` as bias. Instead of adjusting the
    # bias, we let the backpropagation to adjust the weight associated with it.
    def withBias(self, inputs):
        return np.concatenate(
            (np.ones([self.batch_size, 1]), inputs), axis=1)

    # outputs of each layer multiplied by weights are the input of next layer
    def calculateNextLayerInputs(self, layer):
        return np.dot(self.neuron_outputs[layer], self.weights[layer].T)

    def batchFeedForward(self, inputs):
        # We need our bias for first (input) layer
        self.neuron_outputs[0] = self.withBias(inputs)

        for layer in range(1, self.number_of_layers):
            self.neuron_inputs[
                layer] = self.calculateNextLayerInputs(layer - 1)

            # we don't add bias to the last (output) layer
            if layer == self.number_of_layers - 1:
                self.neuron_outputs[layer] = relu(self.neuron_inputs[layer])

            else:  # all other layers need bias
                output = relu(self.neuron_inputs[layer])
                self.neuron_outputs[layer] = self.withBias(output)

    # to be used after training. It's similar to the batchFeedForward()
    def estimate(self, inputs):
        outputs = np.concatenate(
            [np.ones([inputs.shape[0], 1]), inputs], axis=1)
        for layer in range(1, self.number_of_layers):
            inputs = np.dot(outputs, self.weights[layer - 1].T)

            if layer == self.number_of_layers - 1:
                outputs = relu(inputs)

            else:
                outputs = relu(inputs)
                outputs = np.concatenate(
                    [np.ones([inputs.shape[0], 1]), inputs], axis=1)
        return outputs

    # simply calculating the error of each neuron on last layer
    def errors(self, desired_output):
        return self.neuron_outputs[-1] - desired_output

    # backpropagate error of each layer to the one before it
    def backpropagate(self, error):
        # let's start with last layer
        self.neuron_errors[-1] = error * reluDerivative(self.neuron_inputs[-1])
        for layer in range(self.number_of_layers - 2, 0, -1):
            # derivation of activation function
            d = reluDerivative(self.neuron_inputs[layer])
            e = np.dot(self.neuron_errors[
                layer + 1], self.weights[layer][:, 1:])  # derivation of weights
            self.neuron_errors[layer] = e * d

    # adjust the weights in the direction that decreases the error based on
    # gradient
    def updateWeights(self, learning_rate):
        for layer in range(0, self.number_of_layers - 1):
            gradient = np.dot(self.neuron_errors[layer + 1].T,
                              self.neuron_outputs[layer]) / self.batch_size
            self.weights[layer] -= learning_rate * gradient

```

## Testing

Let's test with a `sin` and a `cosine` function. We input some random numbers and train the network to give estimate the `sin` and `cos` values.

```python
def main():
    # 1 input neurons, 16 at the hidden layer, and 2 at the output layer
    shape = [1, 16, 2]
    batch_size = 32
    number_of_batches = 300  # means that we will have 32*300 datapoints to train on
    learning_rate = 1.

    data = np.random.rand(number_of_batches, batch_size, 1)

    inputs = np.concatenate([data], axis=2)
    desired_output = np.concatenate([np.sin(data), np.cos(data)], axis=2)

    net = NN(shape, batch_size)

    cost_history = np.zeros(number_of_batches)
    for batch in range(number_of_batches):
        net.batchFeedForward(inputs[batch])
        error = net.errors(desired_output[batch])

        cost_history[batch] = getCost(error)

        net.backpropagate(error)
        net.updateWeights(learning_rate)

    test_data = np.linspace(0, 1., num=30)  # making some test data
    # adjusting the dimensions to feed to network
    test_data = np.expand_dims(test_data, 1)
    # getting the output from our network
    test_estimates = net.estimate(test_data)

    f0 = figure(1, figsize=(9, 9))
    plot(np.sin(test_data), linewidth=5.)  # plotting true values for sin
    plot(test_estimates[:, 0], linewidth=5.)  # plotting estimated values
    draw()
    pause(.1)

    raw_input("<Hit Enter To Close>")
    close(f0)

    f0 = figure(1, figsize=(9, 9))
    plot(np.cos(test_data), linewidth=5.)  # plotting true values for cos
    plot(test_estimates[:, 1], linewidth=5.)
    draw()
    pause(.1)

    raw_input("<Hit Enter To Close>")
    close(f0)

    f0 = figure(1, figsize=(9, 9))
    plot(range(number_of_batches), cost_history, linewidth=5.) # let's look at the cost over training
    draw()
    pause(.1)

    print("%.5f cost at the start of learning and %.5f at the end" %
          (np.max(cost_history[:10]), np.max(cost_history[-10:])))
    raw_input("<Hit Enter To Close>")
    close(f0)


if __name__ == "__main__":
    main()
```

Below is a result from a test run. We make some test data and plot both true values (blue lines) and estimated values (green lines) for `sin` and `cos`.

This is for `sin`:

![Sin]({{ site.url }}/img/post_images/fcn_sin.bmp "Sin")


And `cos`:

![Cos]({{ site.url }}/img/post_images/fcn_cos.bmp "Cos")


Let's look how cost decreased through the training. The vertical axis is the cost and horizontal one is the number of batches.

![Cost]({{ site.url }}/img/post_images/fcn_cost.bmp "Cost")

## Think About These

- Try getting few results with changing the last line of the class constructor as below (i.e. change `0` to `-eps`). Why sometimes we get bad results out of this?

```python
self.weights.append(np.random.normal(-eps, eps, size=(
                shape[layer], shape[layer - 1] + 1)))  # '+1' at the end is for bias
```


- Try `sigmoid` and `sigmoidDerivative` instead of `relu` and `reluDerivative`. What is the difference for same number of steps. Time the learning too.

- Modify the cost calculation and use sum of absolute values. Compare the performance for both cases by averaging over lots of runs.

- Reduce the size of dataset and add L1 and L2 regularization to the cost function.