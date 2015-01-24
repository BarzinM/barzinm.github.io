---
layout: post
date:   2014-02-03 23:26:12
photo: regression.png
caption_header: Regression Method In Machine Learning
caption: Study and development of algorithm capable of reading spreadsheets, perform machine learning, and predict numerical or logical variables.
---


# Linear Regression Method for Machine learning
* This line is a placeholder to generate the table of contents
{:toc}

## Introduction

Linear regression method is used to predict a value based on the information from a data set. In this method a relationship between a dependent variable and one or more explanatory variables is derived. The explanatory variables are called features. Value of features in study can be independent from each other or be a combination of other features. For example, for predicting the power load on a power plant the following features can be considered:

+ Constant value of $$X_0=1$$
+ Time of the day
+ Time of the year
+ Town population
+ e<sup>age of power infrastructure</sup>
+ Number of houses
+ $$ \frac{Town Population}{Number Of Houses} $$
+ ...

### Hypothesis
Hypothesis is a function that uses some values ($$X_0, X_1, X_2, X_3, ...$$) to output a value $$y$$ as a prediction.
Each feature $$ X $$ is multiplied to a parameter $$\theta$$ to construct a hypothesis. The hypothesis (e.g. power load prediction) has the following linear form:
$$h_\theta (x) = \theta^T X$$
Using optimization methods the best $$\theta$$ values are calculated in a way that generate minimum errors from training set.
Two main methods of calculating parameters $$\theta$$ are:

### Gradient descent

In gradient descent method, a cost function is computed that is equal to the average of differences (error) square between predicted values by hypothesis and actual values in the training set. 

$$J(\theta)=\frac{1}{2m}\sum_{i=1}^{m} (h_\theta(x^{(i)})-y^{(i)})^2$$


{% highlight matlab %}
J = transpose(X * theta - y) * (X * theta - y) / 2 / m;	% Cost function calculation
{% endhighlight %}
In which $$J$$ is the cost value, $$y$$ is vector of  dependent values from the training set, and $$m$$ is number of training samples.
The gradient of this cost function shows the best direction for minimizing relative to each parameter.

$$\theta_j := \theta_j-\frac{\alpha}{m}\sum_{i=1}^{m} (h_\theta(x^{(i)})-y^{(i)})x_j^{(i)}$$ 
{% highlight matlab %}
sum = transpose(X) * ( X * theta - y);	% Should be the same size of theta
theta = theta - sum * alpha / m;	% Updated theta values
{% endhighlight %}
In which $$\alpha$$(`alpha`) is the learning rate set by the user.
This method requires feature normalization to reduce the number of iterations needed. This is done by subtracting the mean value of each feature group in the training set and dividing by their respective standard deviation.
{% highlight matlab %}
mu = mean(X);	% Average value
sigma = std(X);	% Standard deviation
X_norm = (X - mu) ./ sigma;	% Normalized values
{% endhighlight %}

### Normal equations

This method gives the exact solution in a single calculation for optimized parameters $$\theta$$ and does not need any feature scaling (normalization). The downside of using this method is that in case of adding a training set to the existing one or even adding one more training data requires doing all the calculations from the beginning which can be process demanding.
Normal equation can be calculated as follow:

$$\theta=(X^T X)^{-1} X^T y$$


{% highlight matlab %}
theta = (transpose(X) * X) \ (transpose(X) * y); % Optimal theta values
{% endhighlight %}

## Implementation

In this section, the linear regression method is applied to a data set with 47 training samples each with 2 features.

### Code

{% highlight matlab %}
clear ; close all; clc

fprintf('Loading data ...\n');

%% Load Data
data = load('training_set.txt');
X = data(:, 1:2);
y = data(:, 3);
m = length(y);

% Print out some data points
fprintf('First 10 examples from the dataset: \n');
fprintf(' x = [%.0f %.0f], y = %.0f \n', [X(1:10,:) y(1:10,:)]');

% Scale features and normalization
fprintf('Normalizing Features ...\n');

[X mu sigma] = featureNormalize(X);

% Add intercept term to X
X = [ones(m, 1) X];

fprintf('Running gradient descent ...\n');

% Choose some alpha value
alpha = 0.01;
num_iters = 400;

% Init Theta and Run Gradient Descent 
theta = zeros(3, 1);
[theta, J_history] = gradientDescentMulti(X, y, theta, alpha, num_iters);
% Plot the convergence graph
figure;
plot(1:numel(J_history), J_history, '-b', 'LineWidth', 2);
xlabel('Number of iterations');
ylabel('Cost J');

% Display gradient descent's result
fprintf('Theta computed from gradient descent: \n');
fprintf(' %f \n', theta);
fprintf('\n');

mu = [0 mu];
sigma = [1 sigma];
x_sample = ([1 1650 3] - mu) ./ sigma;

y = x_sample * theta; % You should change this

fprintf(['Predicted y (using gradient descent):\n $%f\n'], y);

fprintf('Solving with normal equations...\n');

data = csvread('ex1data2.txt');
X = data(:, 1:2);
y = data(:, 3);
m = length(y);

% Add intercept term to X
X = [ones(m, 1) X];

% Calculate the parameters from the normal equation
theta = normalEqn(X, y);

% Display normal equation's result
fprintf('Theta computed from the normal equations: \n');
fprintf(' %f \n', theta);
fprintf('\n');

x_sample = [1 1650 3];
y = x_sample * theta; 

fprintf(['Predicted y (using normal equations):\n $%f\n'], y);
{% endhighlight %}
---------------------
{% highlight matlab %}
function [X_norm, mu, sigma] = featureNormalize(X)
%FEATURENORMALIZE Normalizes the features in X 
%   FEATURENORMALIZE(X) returns a normalized version of X where
%   the mean value of each feature is 0 and the standard deviation
%   is 1. This is often a good preprocessing step to do when
%   working with learning algorithms.

X_norm = X;
mu = zeros(1, size(X, 2));
sigma = zeros(1, size(X, 2));     

mu = mean(X);
sigma = std(X);
X_norm = (X - mu) ./ sigma;

end
{% endhighlight %}
---------------
{% highlight matlab %}
function [theta, J_history] = gradientDescentMulti(X, y, theta, alpha, num_iters)
%GRADIENTDESCENTMULTI Performs gradient descent to learn theta
%   theta = GRADIENTDESCENTMULTI(x, y, theta, alpha, num_iters) updates theta by
%   taking num_iters gradient steps with learning rate alpha

% Initialize values
m = length(y); % number of training examples
J_history = zeros(num_iters, 1);

for iter = 1:num_iters

    % Save the cost J in every iteration    
    J_history(iter) = computeCostMulti(X, y, theta);

end

end

{% endhighlight %}
------------------------------
{% highlight matlab %}
function J = computeCostMulti(X, y, theta)
%COMPUTECOSTMULTI Compute cost for linear regression with multiple variables
%   J = COMPUTECOSTMULTI(X, y, theta) computes the cost of using theta as the
%   parameter for linear regression to fit the data points in X and y

m = length(y); % number of training examples

J = transpose(X * theta - y) * (X * theta - y) / 2 / m;

end

{% endhighlight %}
----------------------------------
{% highlight matlab %}
function [theta] = normalEqn(X, y)
%NORMALEQN Computes the closed-form solution to linear regression 
%   NORMALEQN(X,y) computes the closed-form solution to linear 
%   regression using the normal equations.

theta = (transpose(X) * X) \ (transpose(X) * y);

end

{% endhighlight %}
___________________________________________

### Training set

Visualization of data:

![Data Visualization](https://dl.dropboxusercontent.com/u/9059775/blog/Machine_Learning/Linear_regression_data.jpg)

Few numerical samples of data:

 x = [2104 3], y = 399900 

 x = [1600 3], y = 329900 

 x = [2400 3], y = 369000 

 x = [1416 2], y = 232000 

 x = [3000 4], y = 539900 

 x = [1985 4], y = 299900 

 x = [1534 3], y = 314900 

 x = [1427 3], y = 198999 

 x = [1380 3], y = 212000 

 x = [1494 3], y = 242500 

### Results

Decreasing the cost function via gradient descent can be seen in the figure below:

![Cost function](https://dl.dropboxusercontent.com/u/9059775/blog/Machine_Learning/LinearRegressionCost.jpg)

And the final results are:

|    |Gradient descent|Normal equation |
|---------:|----------------|---------------|
|$$\theta_1$$| 334302.063993  |89597.909543   |
|$$\theta_2$$|100087.116006   |139.210674     |
|$$\theta_3$$|3673.548451     |-8738.019112   | 
|Predicted $$y$$ for $$x = [1650, 3]$$|289314.620338|293081.464335  |


**DO NOT FORGET** that for calculating $$y$$ using gradient descent method, $$x=[1650, 3]$$ should go through the same normalization process as rest of the data. This is the main reason for the big difference between $$\theta$$ values in two methods.
