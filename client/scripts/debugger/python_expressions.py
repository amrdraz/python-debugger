import math

s = math.sqrt(eval(input("enter something to square root")))

# python expressions

1
print(1)
a = 2
print(a)
a += 3
print(a)
b = a - 4
print(b)
c = b / a
print(c)
d = b ** 2
print(d)
c = d // b * (a + c)
print(c)
r = d % b
print(r)
b = 3 | 2
print(b)
b = 2 & -1
print(b)

print("Booelan Expressions")
print(False)
t = True
print(t)
f = False
print(f)
b = t and f
print(b)
b = t or f
print(b)
b = not f
print(b)
n = 0 or 2
print(b)
m = 1 and 50
print(m)
b = (1+3 and f) or t
print(b)

b = t == b
print(b)
b = t is b
print(b)
b = t != b
print(b)
b = n < m
print(b)
b = n > m
print(b)
b = n <= m
print(b)
b = n >= m
print(b)

print("iteratables")
l = [a, b, c, d]
print(l)
s = {a, b, c, d}
print(s)
d = {"a": a, "c": c}
print(d)
t = (a, c)
print(t)

if t:
    print("true")

if b:
    print("True")
else:
    print("False")

if b:
    print("true")
elif b:
    print("true")
else:
    print("true")

while m > n:
    m /= n
    print(m)

while m > 0:
    m = m // 2
    print(m)
    while n > 0:
        n = n // 2
    n = m

# loop over list
for i in l:
    print(i)

# loop over list accessing the values
for i in range(len(l)):
    print(l[i])

r = range(2)
# loop over range
for i in r:
    print(i)

[x for x in l]

[x for x in l if x > 20]

def baz():
    pass

def bar(a):
    return a


def biz(a, *args, **kwgs):
    pass


def boo(a=3):
    pass


def buk(a=3):
    global b
    b = 4

def foo(): print ("in foo")

foo()


def rec(n):
    if (not n):
        return
    print(n)
    rec(n-1)

rec(2)

def print_nums(x):
  for i in range(x):
    print(i)

print_nums(10)
