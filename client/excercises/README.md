From Coursera's cs 101 by stanford we have these excercises that we meight want to try

## Introduction to Digital Images Help Center

### Question 1

A single pixel shows how many colors?

- As many as you want 
- 3
- 1
- 2

### Question 2

In the RGB scheme, for one pixel, how many numbers define the color of that pixel?

- 2
- 3
- 4
- 1

### Question 3

Hint: You may find it helpful to use the RGB explorer for this question.

What are the RGB numbers to make pure white?
- Red = 0, Green = 255, Blue = 255
- Red = 0, Green = 255, Blue = 0
- Red = 255, Green = 255, Blue = 255
- Red = 0, Green = 0, Blue = 255

### Question 4

Hint: You may find it helpful to use the RGB explorer for this question.

What are the RGB numbers to make bright yellow?
- Red = 0, Green = 0, Blue = 255
- Red = 255, Green = 0, Blue = 0
- Red = 255, Green = 255, Blue = 0
- Red = 0, Green = 255, Blue = 255

## Image Code

### Question 1

Write code to set the pixel at (0, 0) to blue (i.e. blue value is 255, red and green are left at 0).

#### Start Code

```
image = new SimpleImage("x.png");

image.setZoom(20);
print(image);
```

#### Solution

```
image = new SimpleImage("x.png");

image.setZoom(20);
image.getPixel(0, 0).setBlue(255);
print(image);
```

### Question 2

Write code to set the pixel at (0, 0) to be violet (i.e. red and blue both 255, green left at 0).
Answer for Question 2

#### Start Code

```
image = new SimpleImage("x.png");

image.setZoom(20);
print(image);
```

#### Solution

```
image = new SimpleImage("x.png");

image.setZoom(20);
pixel = image.getPixel(0, 0)
pixel.setBlue(255);
pixel.setRed(255);

print(image);
```

### Question 3

Write code to set the pixel at (1, 0) to be red.

#### Start Code

```
image = new SimpleImage("x.png");

image.setZoom(20);
print(image);
```

#### Solution

```
image = new SimpleImage("x.png");

image.setZoom(20);
image.getPixel(1, 0).setRed(255);
print(image);
```


## For loops

### Question 1

Add code inside the loop to modify flowers.jpg like this: set each pixel to have red 255, green 0, blue 0.

```
image = new SimpleImage("flowers.jpg");

for (pixel: image) {
  // Your code here

}

print(image);
```

### Question 2

Add code inside the loop to modify flowers.jpg like this: set each pixel to have green of 0, leaving red and blue unchanged. The result should be that the flowers look red, since the yellow was made of red+green light.
Answer for Question 2

```
image = new SimpleImage("flowers.jpg");

for (pixel: image) {
  // Your code here

}

print(image);
```

## Image Expressions Help Center

For each puzzle image, the red, green, and blue values have been divided by a factor of 5, 10, or 20, but you don't know which factor was used on which color. Write code to fix the image, multiplying each color by 5, 10 or, 20 to get them back to their original values. Reminder: here is the line to use in the loop to multiply, for example, the red value of each pixel by 20:
```
  pixel.setRed(pixel.getRed() * 20);
```
There are a few solutions that look somewhat correct, but just one solution that looks exactly right. Figure out that solution.

### Question 1

Write code to fix the 51020-poppy.png image which should show an orange California Poppy in the foreground (the California state flower!), with a green and brown out-of-focus background.

#### Start
```
image = new SimpleImage("51020-poppy.png");

for (pixel: image) {
  // Your code here

}

print(image);
```

#### Solution
```
image = new SimpleImage("51020-poppy.png");

for (pixel: image) {
  // Your code here
  pixel.setRed(pixel.getRed() * 10);
  pixel.setGreen(pixel.getGreen() * 5);
  pixel.setBlue(pixel.getBlue() * 20);
}

print(image);
```

### Question 2

Write code to fix the 51020-stop-sky.png image which should show a red stop sign front with a background of a light blue sky and green tree leaves.

### Start
```
image = new SimpleImage("51020-stop-sky.png");

for (pixel: image) {
  // Your code here

}

print(image);
```

#### Solution
```
image = SimpleImage("51020-stop-sky.png");

for pixel in image:
  pixel.setRed(pixel.getRed() * 20);
  pixel.setGreen(pixel.getGreen() * 10);
  pixel.setBlue(pixel.getBlue() * 5);

print(image);
```
### Question 3

Write code to fix the 51020-oranges.png image which should show a box of oranges. The box itself is dull gray. The sign on the box is black, with "organic" written in light orange, and the rest of the letters in white.
Answer for Question 3

#### Start
```
image = new SimpleImage("51020-oranges.png");

for (pixel: image) {
  // Your code here

}

print(image);
```

#### Solution
```
image = SimpleImage("51020-stop-sky.png");

for pixel in image:
  pixel.setRed(pixel.getRed() * 20);
  pixel.setGreen(pixel.getGreen() * 5);
  pixel.setBlue(pixel.getBlue() * 10);

print(image);
```

## Puzzles 

Here we'll do puzzles like the gold puzzle shown in lecture. Reminder: here is the line to use in the loop to multiply, for example, the red value of each pixel by 20:

```
pixel.setRed(pixel.getRed() * 20);
```

### Question 1

Iron Puzzle - write code to fix the puzzle-iron.png image. The green and red values in the image are random noise, so they should be set to 0. The real image is in the blue values, which have been divide by 10. The "solution" image will look blue, since it is exclusively in the blue values, so don't worry about that. We'll see a way to fix that blueness in a later section.

#### Start Code
```
image = new SimpleImage("puzzle-iron.png");

for (pixel: image) {
  // your code here

}

print(image);
```

### Question 2

Copper Puzzle - write code to fix the puzzle-copper.png image. The red values in the image are random noise, so they should be set to 0. The real image is in the blue and green values, which have been divide by 10.

#### Start Code
```
image = new SimpleImage("puzzle-copper.png");

for (pixel: image) {
  // your code here

}

print(image);
```

