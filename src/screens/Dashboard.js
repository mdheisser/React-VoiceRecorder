import React, {Component} from 'react';

import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity, Image
} from 'react-native';
import {images} from "../../images";

export default class Dashboard extends Component {
  static navigationOptions = {
    header: null
  };

  state = {};

  openRecordScreen = () => {
    setTimeout(() => {
      this.props.navigation.navigate('Recorder', {
        fileAdded: this.onFileAdd,
      });
    }, 100)
  };

  onFileAdd = () => {
  };

  renderList = () => {
    return null
  };

  renderButton = (title, onPress) => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Image style={{height: 50, width: 50}} source={title}/>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.flexList}>
          {this.renderList()}
        </View>
        <View style={styles.controls}>
          {this.renderButton(images.add, () => {
            this.openRecordScreen()
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
    flex: 0.15,
  },
  flexList: {
    flex: 0.85
  }

});
