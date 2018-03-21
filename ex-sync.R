#

#seewave not available (for R version 3.4.2)

library(imager)

##In a file called test_args.R
args <- commandArgs(TRUE)

#upload jpg of spectrogram, turn greyscale and turn into dataframe
img <- load.image(args[1])

#If there is still alpha in the images and it won't move to gray scale, enable this code
img=rm.alpha(img)
imgGrey <- grayscale(img)
df=data.frame(imgGrey[,,,1])
#computes mean in each time frame
mean=apply(df,1,mean)
#Calculates standard deviation
sd=sd(mean)
#Tests if the SD is above 0.019 , and outputs TRUE on breath
0.005<sd
args[1]
args[2]
args[3]
