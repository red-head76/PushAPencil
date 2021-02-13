import numpy as np
import matplotlib.pyplot as plt
from queue import Queue
import time

cWidth = 1000
cHeight = 1000
colorLayer = np.ones((cWidth, cHeight)) * 1

# colorLayer[np.arange(40, 60), 40] = 2
# colorLayer[np.arange(40, 60), 60] = 2
# colorLayer[40, np.arange(40, 60)] = 2
# colorLayer[59, np.arange(40, 60)] = 2
# for i in range(40, 60):
#     for j in range(40, 60):
#         if ((i - 50)**2 + (j - 50)**2) > 80:
#             colorLayer[i, j] = 2


def BucketTool(StartPixel, DesiredValue):
    pixelStack = Queue()
    pixelStack.put(startPixel)
    StartValue = colorLayer[startPixel[0], startPixel[1]]
    if (StartValue != DesiredValue):
        while (pixelStack.qsize()):
            newPos = pixelStack.get()
            x = newPos[0]
            y = newPos[1]
            while (y >= 0 and matchStartValue(x, y, StartValue)):
                y -= 1
            y += 1
            reachLeft = False
            reachRight = False

            while (y < cHeight - 1 and matchStartValue(x, y, StartValue)):
                setPixel(x, y)
                if (x > 0):
                    if matchStartValue(x - 1, y, StartValue) and not reachLeft:
                        pixelStack.put([x - 1, y])
                        colorLayer[x - 1, y] = 1
                        reachLeft = True
                    elif reachLeft:
                        reachLeft = False
                if (x < cWidth - 1):
                    if matchStartValue(x + 1, y, StartValue) and not reachRight:
                        pixelStack.put([x + 1, y])
                        colorLayer[x + 1, y] = 1
                        reachRight = True
                    elif reachRight:
                        reachRight = False
                y += 1


def matchStartValue(x, y, StartValue):
    return (colorLayer[x, y] == StartValue or colorLayer[x, y] == 1)


def setPixel(x, y):
    colorLayer[x, y] = DesiredValue


t0 = time.time()
BucketTool([50, 50], 3)
print(time.time() - t0)
# plt.imshow(colorLayer)
# plt.show()
