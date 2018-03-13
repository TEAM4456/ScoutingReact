import React from 'react';
import { StyleSheet, Text, View, Button, FlatList, AppRegistry, TextInput, CheckBox, TouchableHighlight, Image, Alert } from 'react-native';
import {StackNavigator} from 'react-navigation';
import _ from 'underscore';
import db from './Database.js';
import libtba from './libtba.js';
import config from './Config.js';
import * as Progress from "react-native-progress";
const TBAkey = "aTiwtPGZpYPzhNxms49oT1tcMDBBklLkkdiolDgF75N4JqeUmkuefTz6jrQgoqBU";
const UserAgent = "4456Scouting/ 1.0";
var TeamSelected = 4456;
export class TeamSelect extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: "Team Input",
      headerTitleStyle: {color: "#CCC"}
    }};
  constructor(props) {
    super(props);
    this.state = {text: ""};
  }
  render() {
    return (
      <View style={{backgroundColor: "#DDD", alignItems: "center", justifyContent: "center", flex: 1}}>
        <View style={{padding:20, flex: 1}}>
        <Text>Enter team number here:</Text>
        <TextInput editable = {true}
        value = {this.state.text}
        maxLength = {4}
        onChangeText={(text) => {
          this.setState({text});
          }}
        onSubmitEditing={(event) => {
          if(!isNaN(this.state.text)) {
            TeamSelected = Number(this.state.text);
            this.props.navigation.navigate("TeamScreen");
          }
          else {
            alert("Error: Team number is not valid, as it is not a number.");
          }
        }}>
          </TextInput>
          </View>
      </View>
    )
  }
}
export class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: "Mech Cadets Scouting",
      headerTitleStyle: {color: "#CCC"}
    }};
  constructor(props) {
    super(props);
    this.state = {menuBarText: "Scouting app by FRC 4456"};
  }
  render() {
    return (
      <View style={{flexDirection: "column", flex: 1}}>
        <View style={styles.homeScreen}>
          <View style={styles.homeScreenPart}>
            {/*Left Side*/}
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#A44"}}>Welcome to the Team 4456 Scouting app!</Text>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Button title="Go to Settings" onPress={()=>{TeamSelected = 4456; this.props.navigation.navigate("SettingsScreen")}}/>
            </View>
          </View>
          <View style={styles.homeScreenPart}>
            {/*Right Side*/}
            <View style={styles.homeScreenFragment}>
              <Button title="Go to team info for team 4456" onPress={()=>{TeamSelected = 4456; this.props.navigation.navigate("TeamScreen")}}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Button title="Go to team input screen" onPress={()=>this.props.navigation.navigate("TeamSelect")}/>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
export class Break extends React.Component {
  render() {
    return (
      <View style={{padding: 10}}>
      </View>
    )
  }
}
export class TeamScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: "Team "+TeamSelected,
      headerTitleStyle: {color: "#CCC"}
    }};
  constructor(props) {
    super(props);
    this.state = {isLoading: true, data: {}};
  }
  componentDidMount() {
    /*return fetch("https://www.thebluealliance.com/api/v3/team/frc"+TeamSelected, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        "User-Agent": UserAgent,
        "X-TBA-Auth-Key": TBAkey
      }
    }).then((response) => response.json()).then((responseJson) => {
      if(responseJson["Errors"])
      {
        alert("Team does not exist.");
        this.props.navigation.goBack();
      }
      else {
        this.setState({isLoading: false, data: responseJson}, function(){});
      }
    })*/
    return (
      db.getTBAteam([TeamSelected])
      .then((responseJson) => {
        if(responseJson[0] != null)
        {
          this.setState({isLoading: false, data: responseJson[0]}, function(){});
        }
        else {
          Alert.alert("This team does not exist.");
          this.props.navigation.goBack();
        }
      }));
  }
  render() {
    if(this.state.isLoading) {
      return (
      <View style={{flexDirection: "column", flex: 1}}>
        <View style={styles.homeScreen}>
          <Text style={{textAlign: "center", justifyContent: "center"}}>Loading</Text>
        </View>
      </View>
      )
    }
    return (
      <View style={{flexDirection: "column", flex: 1}}>
        <View style={styles.homeScreen}>
          <View style={styles.homeScreenPart}>
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#88F"}}>Team name: {this.state.data.nickname}</Text>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#88F"}}>Team full name (sponsors): </Text>
              <Text style={{fontSize:12, color:"#BBB", textAlign:"center"}}>{this.state.data.name}</Text>
            </View>
          </View>
          <View style={styles.homeScreenPart}>
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#88F"}}>Location: {this.state.data.city+", "+this.state.data.country}</Text>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#88F"}}>Rookie year: {this.state.data.rookie_year}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
var syncData = async function()
{
  Alert.alert("Data is syncing. Do not do anything until you get the popup with \"Data has been synced.\"");
  var data = await libtba.getAllTeamInfo(TBAkey);
  await db.writeTBAteams(data);
  Alert.alert("Data has been synced.");
}
export class SettingsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: "Settings",
      headerTitleStyle: {color: "#CCC"}
    }};
  constructor(props) {
    super(props);
    /*if(typeof TBAkey == "string")
    {
      this.state = {textBoxText: TBAkey};
    }
    else
    {*/
      this.state = {textBoxText: ""};
    //}
  }
  render() {
    return (
      <View style={{flexDirection: "row", flex: 1}}>
        <View style={styles.homeScreenPart}>
          <View style={styles.homeScreenFragment}>
            <Button title="Sync TBA data" onPress={syncData}/>
          </View>
        </View>
      </View>
    )
  }
}
export default StackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerStyle: {backgroundColor: "#333"}
    }
  },
  TeamScreen: {
    screen: TeamScreen,
    navigationOptions: {
      headerStyle: {backgroundColor: "#333"}
    }
  },
  TeamSelect: {
    screen: TeamSelect,
    navigationOptions: {
      headerStyle: {backgroundColor: "#333"}
    }
  },
  SettingsScreen: {
    screen: SettingsScreen,
    navigationOptions: {
      headerStyle: {backgroundColor: "#333"}
    }
  },
})
const styles = StyleSheet.create({
  homeScreen: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#444'
  },
  homeScreenPart: {
    borderRadius: 3,
    padding: 10,
    flex: 1,
    flexDirection: "column"
  },
  homeScreenFragment: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#555",
  },
  button: {
    backgroundColor: '#444'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
