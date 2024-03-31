import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';
import Button from './src/components/Button';
import axios from 'axios';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [capturingImage, setCapturingImage] = useState(true); // State to control camera rendering
  const [image, setImage] = useState(null); // State to store captured image
  const [prediction, setPrediction] = useState(null); // State to store prediction result
  const cameraRef = useRef(null);

  // Request camera permissions and set permission state
  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []);

  // Function to handle taking a picture
  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        setImage(data.uri);
        setCapturingImage(false); // Switch to captured image state
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Function to send the captured image to the API for prediction
  const sendImageToApi = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpeg',
      });

      const response = await axios.post('http://10.66.23.243:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const data = response.data;
        console.log(data);
        setPrediction(response.data); // Update the prediction state with the result
      } else {
        console.log('Failed to send image to API');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle saving the captured image
  const savePicture = async () => {
    if (image) {
      try {
        const asset = await MediaLibrary.createAssetAsync(image);
        //setImage(null);
        console.log('saved successfully');
        sendImageToApi(asset.uri);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Function to handle retaking the picture
  const retakePicture = () => {
    setImage(null); // Clear the captured image
    setPrediction(null); // Clear the prediction result
    setCapturingImage(true); // Switch back to capturing image state
  };

  // Render the appropriate UI based on the current state
  return (
    <View style={styles.container}>
      {/* Render camera view or captured image view based on the state */}
      {hasCameraPermission === false ? (
        <Text>No access to camera</Text>
      ) : capturingImage ? (
        // Render the camera view
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={cameraRef}
        >
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <MaterialIcons name="camera" size={36} color="white" />
          </TouchableOpacity>
        </Camera>
      ) : (
        // Render the captured image view or prediction result
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.capturedImage} />
          {/* Render prediction result if available */}
          {prediction && (
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionLabel}>Prediction:</Text>
              <Text style={styles.predictionText}>
                Class: {prediction.predicted_class}
              </Text>
              <Text style={styles.predictionText}>
                Confidence: {prediction.confidence}
              </Text>
            </View>
          )}
          {/* Conditionally render "Save" and "Retake" buttons */}
          {!prediction ? ( // Show if prediction is not available
            <View style={styles.controls}>
              <Button title="Save" onPress={savePicture} />
              <Button title="Retake" onPress={retakePicture} />
            </View>
          ) : ( // Show "Retake" button only if prediction is available
            <View style={styles.controls}>
              <Button title="Retake" onPress={retakePicture} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Align the container content to the bottom
    backgroundColor: 'transparent', // Change from 'transparent' to '#000' for a black background
    padding: 10,
    borderRadius: 20, // Add border radius for curved edges
  },
  camera: {
    flex: 1,
    justifyContent: 'center', // Center the camera view vertically
    alignItems: 'center', // Center the camera view horizontally
    backgroundColor: '#000', // Background color of the camera view
    borderRadius: 20, // Add border radius for curved edges
    overflow: 'hidden', // Hide content that overflows the camera view
  },


  captureButton: {
  marginBottom: 1,
  backgroundColor: 'black', // Background color of the button
  width: 70, // Width of the button
  height: 70, // Height of the button
  borderRadius: 35, // Border radius to create a circular button
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2, // Border width
  borderColor: '', // Border color
  position: 'absolute', // Positioning the button absolutely
  bottom: 20, // Distance from the bottom of the screen
},
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 20, // Adding border radius for curved corners
    backgroundColor: '#4A90E2', // Background color
    paddingVertical: 10, // Adding vertical padding for spacing
  },
  imageContainer: {
    flex: 1,
  },
  capturedImage: {
    flex: 1,
    borderRadius: 20, // Add border radius for curved edges
  },
  predictionContainer: {
    position: 'absolute',
    bottom: 850, // Adjust the position as needed
    left: 20,
    right: 20,
    backgroundColor: '#4A90E2', // Background color
    padding: 10,
    borderRadius: 20, // Adding border radius for curved corners
    alignItems: 'center', // Center the content horizontally
  },
  predictionLabel: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5, // Add margin bottom for spacing between label and text
  },
  predictionText: {
    color: '#FFF',
    fontSize: 14,
  },
});
