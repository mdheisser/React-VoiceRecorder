import {Component} from "react";
import React from "react";

export default class Recorder extends Component<Props> {

  componentDidMount = () => {
  };

  fileAdded = () =>{
    const {state} = this.props.navigation;
    const params = state.params || {};
    params.fileAdded();
  };

  render() {
    return (
      null
    );
  }
}
