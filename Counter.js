import React from 'react';
import { StyleSheet, Text, View, Button, FlatList, AppRegistry, TextInput, CheckBox, TouchableHighlight, Image, Alert } from 'react-native';
export default class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
        }
    }
    componentWillMount() {
        if(!this.props.onChange) {
            console.error("Error rendering Counter: function onChange is a required prop.");
        }
    }
    render() {
        return (
            <View style={styles.counterView}>
                <Button style={styles.counterButton} title={" -10 "} onPress={() => {
                    this.setState({count: this.state.count - 10});
                    this.props.onChange(this.state.count - 10);
                }}/>
                <Button style={styles.counterButton} title={" -1 "} onPress={() => {
                    this.setState({count: this.state.count - 1});
                    this.props.onChange(this.state.count - 1);
                }}/>
                <Text style={styles.counterTextbox}>{this.state.count}</Text>
                <Button style={styles.counterButton} title={" +1 "} onPress={() => {
                    this.setState({count: this.state.count + 1});
                    this.props.onChange(this.state.count + 1);
                }}/>
                <Button style={styles.counterButton} title={" +10 "} onPress={() => {
                    this.setState({count: this.state.count + 10});
                    this.props.onChange(this.state.count + 10);
                }}/>
            </View>
        )
    }
}
var styles = StyleSheet.create({
    counterView: {
        flexDirection: "row",
    },
    counterButton: {
        flex: 4,
        color: "#888",
    },
    counterTextbox: {
        flex: 1,
        color: "#FFF",
        paddingHorizontal: 10,
        fontSize: 24
    }
});