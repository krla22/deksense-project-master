// tensor-helper.js

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const BITMAP_DIMENSION = 224;

const modelJson = require('../models/model.json');
const modelWeights = require('../models/weights.bin');

// 0: channel from JPEG-encoded image
// 1: gray scale
// 3: RGB image
const TENSORFLOW_CHANNEL = 3;

export const getModel = async () => {
  try {
    // wait until TensorFlow is ready
    await tf.ready();
    // load the trained model
    return await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
  } catch (error) {
    console.log('Could not load model', error);
  }
};

export const convertUriToTensor = async (imageUri) => {
  try {
    // Crop and resize the image
    const { uri } = await cropPicture(imageUri, BITMAP_DIMENSION);
    // Decode JPEG-encoded image to a 3D Tensor
    const decodedImage = decodeJpeg({ uri }, TENSORFLOW_CHANNEL);
    // Reshape Tensor into a 4D array
    return decodedImage.reshape([1, BITMAP_DIMENSION, BITMAP_DIMENSION, TENSORFLOW_CHANNEL]);
  } catch (error) {
    console.error('Error converting URI to tensor:', error);
    throw error;
  }
};


const cropPicture = async (imageUri, maskDimension) => {
  try {
    const { uri, width, height } = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: width / 2 - maskDimension / 2,
            originY: height / 2 - maskDimension / 2,
            width: maskDimension,
            height: maskDimension,
          },
        },
        {
          resize: {
            width: BITMAP_DIMENSION,
            height: BITMAP_DIMENSION,
          },
        },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    return { uri, width: BITMAP_DIMENSION, height: BITMAP_DIMENSION };
  } catch (error) {
    console.log('Could not crop & resize photo', error);
    throw error;
  }
};
