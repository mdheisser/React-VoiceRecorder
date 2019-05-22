import React, {Component} from 'react';

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity, Image
} from 'react-native';

const RNFS = require('react-native-fs');

import {AudioUtils} from "react-native-audio";
import Sound from 'react-native-sound';
import Toast from 'react-native-simple-toast';
import {images} from "../../images";
import LinearGradient from "react-native-linear-gradient";

let sound = null;

class Dashboard extends Component {
  static navigationOptions = {
    header: null
  };

  state = {
    files: [],
  };

  componentDidMount = () => {
    this.listFiles();
  };

  componentWillUnmount() {
    if (sound !== null) {
      sound.stop();
    }
  }

  listFiles = () => {
    RNFS.readDir(AudioUtils.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        const files = [];
        for (let file of result) {
          if (file && file.name.includes('.aac') && file.size > 0) {
            files.push(file)
          }
        }
        this.setState({files})
      })

  };

  deleteFile = path => {
    return RNFS.unlink(path)
      .then(() => {
        this.listFiles()
      })
      .catch((err) => {
        console.log('failed to delete');
      });
  };

  play = path => {
    setTimeout(() => {
      sound = new Sound(path, '', (error) => {
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
  };

  onFileAdd = () => {
    this.listFiles();
  };


  record = () => {
    if (sound !== null) {
      sound.stop(() => {
        this.openRecordScreen();
      });
    } else {
      this.openRecordScreen();
    }
  };

  openRecordScreen = () => {
    setTimeout(() => {
      this.props.navigation.navigate('Recorder', {
        fileAdded: this.onFileAdd,
      });
    }, 100)
  };


  renderList = () => {
    return <FlatList
      data={this.state.files}
      extraData={this.state}
      renderItem={({item}) => <View key={item.name} style={styles.fileItemStyle}>
        <Text style={styles.fileNameStyle}>
          {item.name}
        </Text>
        <TouchableOpacity onPress={() => {
          if (sound !== null) {
            sound.stop(() => {
              this.play(item.path)
            });
          } else {
            this.play(item.path)
          }
        }
        }>
          <Image style={styles.iconStyle} source={images.play}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.deleteFile(item.path)}>
          <Image style={styles.iconStyle} source={images.delete}/>
        </TouchableOpacity>
      </View>
      }
    />
  };

  renderButton = (title, onPress) => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Image source={title}/>
      </TouchableOpacity>
    );
  };

  render() {

    return (
      <LinearGradient colors={['#CD853F', '#F4A460', '#FF8C00']} style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <View style={styles.flexList}>
          {this.renderList()}
        </View>
        <View style={styles.controls}>
          {this.renderButton(images.add, () => {
            this.record()
          })}
        </View>
      </SafeAreaView>
      </LinearGradient>
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
    flex: 0.15,
  },
  fileItemStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
    paddingBottom: 8
  },
  fileNameStyle: {
    width: '60%',
    textAlign: 'left'
  },
  iconStyle: {
    height: 24,
    width: 24
  },
  flexList: {
    flex: 0.85
  }

});

export default Dashboard;
