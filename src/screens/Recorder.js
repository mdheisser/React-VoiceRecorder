import React, {Component} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';

import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Toast from 'react-native-simple-toast';
import {images} from "../../images";

let sound = null;

class Recorder extends Component {

  static navigationOptions = {
    header: null
  };

  state = {
    currentTime: 0.0,
    recording: false,
    stoppedRecording: false,
    finished: false,
    audioPath: AudioUtils.DocumentDirectoryPath + '/REC.aac',
    hasPermission: undefined,
  };

  prepareRecordingPath(audioPath) {
    const date = new Date();
    const timestamp = date.getTime();
    const newPath = AudioUtils.DocumentDirectoryPath + `/REC${timestamp}.aac`;
    AudioRecorder.prepareRecordingAtPath(newPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
    this.setState({
      audioPath: newPath,
    })
  }

  componentDidMount() {
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      this.setState({hasPermission: isAuthorised});

      if (!isAuthorised) return;

      this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = (data) => {
        this.setState({currentTime: Math.floor(data.currentTime)});
      };

      AudioRecorder.onFinished = (data) => {
        if (Platform.OS === 'ios') {
          this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
        }
      };
    });
  }

  componentWillUnmount() {
    if (sound !== null) {
      sound.stop();
    }
    this._stop();
  }


  renderBack = (title, onPress) => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Image style={{height: 32, width: 32,}} source={title}/>
      </TouchableOpacity>
    );
  };

  renderButton = (title, onPress) => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Image source={title}/>
      </TouchableOpacity>
    );
  };

  async _stop() {
    if (!this.state.recording) {
      console.log('Can\'t stop, not recording!');
      return;
    }

    this.setState({stoppedRecording: true, recording: false});

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
      Toast.show('Recording Saved');
      return filePath;
    } catch (error) {
      console.log(error);
    }
  }

  async _play() {
    if (this.state.recording) {
      await this._stop();
    }

    setTimeout(() => {
      sound = new Sound(this.state.audioPath, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        } else {
          Toast.show('Playing Recording');
        }
      });

      setTimeout(() => {
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  }

  async _record() {
    if (this.state.recording) {
      console.log('Already recording!');
      return;
    }

    if (!this.state.hasPermission) {
      Toast.show('Can\'t record, no permission granted!');
      console.log('Can\'t record, no permission granted!');
      return;
    }

    if (this.state.stoppedRecording) {
      this.prepareRecordingPath(this.state.audioPath);
    }

    this.setState({recording: true});
    Toast.show('Recording Started');
    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.log(error);
    }
  }

  showCountDown = totalSeconds => {
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    return hours + ":" + minutes + ":" + seconds;
  };

  _finishRecording(didSucceed, filePath, fileSize) {
    this.setState({finished: didSucceed});
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.renderBack(images.back, () => {
          if (sound !== null) {
            sound.stop(() => {
              this.props.navigation.pop();
            });
          } else {
            this.props.navigation.pop();
          }
        })}
        <View style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.progressText}>{this.showCountDown(this.state.currentTime)}</Text>
        </View>
        <View style={styles.controls}>
          {this.state.recording === false && this.renderButton(images.record, () => {
            if (sound !== null) {
              sound.stop(() => {
                this._record()
              });
            } else {
              this._record()
            }
          }, this.state.recording)}
          {this.state.recording === false && this.state.stoppedRecording && this.renderButton(images.play, () => {
            if (sound !== null) {
              sound.stop(() => {
                this._play()
              });
            } else {
              this._play()
            }
          })}
          {this.state.recording && this.renderButton(images.stop, () => {
            this._stop()
          })}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
    flexDirection: 'row',
  },
  progressText: {
    paddingTop: 50,
    fontSize: 50,
    color: "#000000",
    alignSelf: 'center',
  },
  button: {
    padding: 20
  },
  disabledButtonText: {
    color: '#eee'
  },
  buttonText: {
    fontSize: 20,
  },
  activeButtonText: {
    fontSize: 20,
  }

});


export default Recorder;
