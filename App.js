import React from 'react';
import { StyleSheet, Text, View, Button, FlatList, AppRegistry, TextInput, CheckBox, TouchableHighlight, Image, Alert, Linking } from 'react-native';
import {StackNavigator} from 'react-navigation';
import _ from 'underscore';
import db from './Database.js';
import libtba from './libtba.js';
import config from './Config.js';
const TBAkey = "aTiwtPGZpYPzhNxms49oT1tcMDBBklLkkdiolDgF75N4JqeUmkuefTz6jrQgoqBU";
const UserAgent = "4456Scouting/ 1.0";
var ScoutingServerIP = "http://192.168.1.1:3000";
var TeamSelected = 4456;
var MatchSelected = 0;
import Counter from './Counter.js';
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
export class DataScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: {},
      componentData: []
    }
  }
  componentWillMount() {
    db.getTeamScoutingMatches({"key": "frc"+TeamSelected, "matches":"all"})
    .then((datanew) => {
      datanew["data"].forEach((datum, i) => {
        datum.key = String(i + 1);
      });
      this.setState({data: datanew["data"], isLoading: false});
    });
  }
  render() {
    if(this.state.isLoading) {
      return (
        <Text>Loading...</Text>
      )
    }
    return (
      <View style={{flexDirection: "column", flex: 1}}>
        <View style={styles.homeScreen}>
          <View style={styles.homeScreenPart}>
            <FlatList 
            data={this.state.data}
            renderItem={({item}) => {
              return (
                <View>
                  <View style={styles.homeScreenFragment}>
                    <View style={{flexDirection: "row"}}>
                      <Text style={{flex: 1, fontSize: 24, color: "#fff"}}>{item.match_number}</Text>
                      <Button style={{flex: 5}} title="Go" onPress={()=> {
                        MatchSelected = item.match_number;
                        this.props.navigation.navigate("ScoutingViewScreen");
                      }}/>
                    </View>
                  </View>
                  <Break/>
                </View>
              )
            }}/>
          </View>
        </View>
      </View>
    )
  }
}
export class ScoutingViewScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: {},
    }
  }
  componentWillMount() {
    db.getTeamScoutingMatches({"key":"frc"+TeamSelected,"matches":[MatchSelected]})
    .then((matchData) => {
      if(!matchData["error"])
      {
        this.setState({
          isLoading: false,
          data: matchData["matches"][0],
        });
      }
      else {
        Alert.alert("Error loading match data. error:true returned from libdatabase.");
      }
      console.log(matchData);
    });
    /*.catch((err) => {
      Alert.alert("Error loading data from Database for match "+MatchSelected);
      console.warn(err);
      this.props.navigation.goBack();
    })*/
  }
  render() {
    if(this.state.isLoading) {
      return (
        <View style={styles.homeScreen}>
          <Text>Loading...</Text>
        </View>
      )
    }
    return (
      <View style={styles.homeScreen}>
        <View style={styles.homeScreenPart}>
          {/*Left Side*/}
          <View style={styles.homeScreenFragment}>
            <Text style={{textAlign: "center", fontSize: 24, color: "#F77"}}>Passed the Auto Line: </Text>
            <CheckBox value={this.state.data.auto_line}/>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Match Number: <Text style={{fontSize: 24, color: "#FFF"}}>{String(this.state.data.match_number)}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes delivered in auto to Switch: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.auto_delivered_switch}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes delivered in auto to Scale: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.auto_delivered_scale}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes delivered in auto to Opponent Switch: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.auto_delivered_oppswitch}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Additional Notes: {this.state.data.notes}</Text>
          </View>
          <Break/>
        </View>
        <View style={styles.homeScreenPart}>
          {/*Middle Side*/}
          <View style={styles.homeScreenFragment}>
            <Text style={{textAlign: "center", fontSize: 24, color: "#F77"}}>Did Climb: </Text>
            <CheckBox
            value={this.state.data.did_climb}
            />
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes delivered to Switch: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_delivered_scale}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes delivered to Scale: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_delivered_scale}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes delivered to Opponent Switch: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_delivered_oppswitch}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes delivered to Vault: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_delivered_vault}</Text></Text>
          </View>
          <Break/>
        </View>
        <View style={styles.homeScreenPart}>
          {/*Right Side*/}
          <View style={styles.homeScreenFragment}>
            <Text style={{textAlign: "center", fontSize: 24, color: "#F77"}}>Did Piggyback: </Text>
            <CheckBox value={this.state.data.did_piggyback}/>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes failed to Switch: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_failed_switch}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes failed to Scale: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_failed_scale}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes failed to Opponent Switch: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_failed_oppswitch}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes failed to Vault: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.prisms_failed_vault}</Text></Text>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text style={{fontSize: 18, color: "#ccc"}}>Cubes failed in Transit: <Text style={{fontSize: 24, color: "#FFF"}}>{this.state.data.failed_in_transit}</Text></Text>
          </View>
          <Break/>
        </View>
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
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Button title="Scout" onPress={()=>this.props.navigation.navigate("ScoutingScreen")}/>
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
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Button title="View Data" onPress={()=>this.props.navigation.navigate("DataScreen")}/>
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
export class ScoutingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: "Scouting for Team "+TeamSelected,
      headerTitleStyle: {color: "#CCC"},
    }};
  constructor(props) {
    super(props);
    /*if(typeof TBAkey == "string")
    {
      this.state = {textBoxText: TBAkey};
    }
    else
    {*/
      this.state = {
        autoLineCheckbox: false,
        climbCheckbox: false,
        matchNumber: "0",
        autoDeliveredSwitch: "0",
        autoDeliveredScale: "0",
        autoDeliveredOppSwitch: "0",
        notes: "",
        prismsDeliveredSwitch: "0",
        prismsDeliveredScale: "0",
        prismsDeliveredOppSwitch: "0",
        prismsDeliveredVault: "0",
        prismsFailedSwitch: "0",
        prismsFailedScale: "0",
        prismsFailedOppSwitch: "0",
        prismsFailedVault: "0",
        prismsFailedInTransit: "0",
        piggyBackCheckbox: false
      };
    //}
  }
  render() {
    return (
      <View style={{flexDirection: "column", flex: 1}}>
        <View style={styles.homeScreen}>
          <View style={styles.homeScreenPart}>
            {/*Left Side*/}
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#A44"}}>Passed the Auto Line: </Text>
              <CheckBox value={this.state.autoLineCheckbox} onValueChange={(autoLineCheckbox) => {
                this.setState({autoLineCheckbox})
              }}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Match Number:</Text>
              <TextInput keyboardType='numeric' value={this.state.matchNumber} onChangeText={(matchNumber) => {
                this.setState({matchNumber});
              }}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes delivered in Auto to Switch:</Text>
              <Counter onChange={(newCount) => this.setState({autoDeliveredSwitch: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes delivered in Auto to Scale:</Text>
              <Counter onChange={(newCount) => this.setState({autoDeliveredScale: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes delivered in Auto to Opponent Switch:</Text>
              <Counter onChange={(newCount) => this.setState({autoDeliveredOppSwitch: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Additional Notes:</Text>
              <TextInput value={this.state.notes} onChangeText={(notes) => {
                this.setState({notes});
              }}/>
            </View>
            <Break/>
          </View>
          <View style={styles.homeScreenPart}>
            {/*Middle Side*/}
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#A44"}}>Did Climb: </Text>
              <CheckBox value={this.state.climbCheckbox} onValueChange={(climbCheckbox) => {
                this.setState({climbCheckbox})
              }}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Button title="Save Data" onPress={() => {
                var consoleData = {
                  "key": "frc"+TeamSelected,
                  match: {
                    "match_number": Number(this.state.matchNumber), 
                    "auto_line": this.state.autoLineCheckbox, 
                    "auto_delivered_switch": Number(this.state.autoDeliveredSwitch), 
                    "auto_delivered_scale": Number(this.state.autoDeliveredScale), 
                    "auto_delivered_oppswitch": Number(this.state.autoDeliveredOppSwitch),
                    "prisms_delivered_switch": Number(this.state.prismsDeliveredSwitch),
                    "prisms_delivered_scale": Number(this.state.prismsDeliveredScale),
                    "prisms_delivered_oppswitch": Number(this.state.prismsDeliveredOppSwitch),
                    "prisms_delivered_vault": Number(this.state.prismsDeliveredVault),
                    "prisms_failed_switch": Number(this.state.prismsFailedSwitch),
                    "prisms_failed_scale": Number(this.state.prismsFailedScale),
                    "prisms_failed_oppswitch": Number(this.state.prismsFailedOppSwitch),
                    "prisms_failed_vault": Number(this.state.prismsFailedVault),
                    "notes": this.state.notes,
                    "failed_in_transit": 0,
                    "did_climb": this.state.climbCheckbox,
                    "did_piggyback": this.state.piggyBackCheckbox,
                }
              }
              async function process(data) {
                var response = await db.updateTeamScouting(data);
                if(response["error"] == true) {
                  Alert.alert("Error saving data: "+response["message"]);
                }
                else {
                  Alert.alert("Successfully saved data.");
                }
              }
              process(consoleData);
              }}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes delivered to Switch:</Text>
              <Counter onChange={(newCount) => this.setState({prismsDeliveredSwitch: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes delivered to Scale:</Text>
              <Counter onChange={(newCount) => this.setState({prismsDeliveredScale: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes delivered to Opponent Switch:</Text>
              <Counter onChange={(newCount) => this.setState({prismsDeliveredOppSwitch: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes delivered to Vault:</Text>
              <Counter onChange={(newCount) => this.setState({prismsDeliveredVault: newCount})}/>
            </View>
            <Break/>
          </View>
          <View style={styles.homeScreenPart}>
            {/*Right Side*/}
            <View style={styles.homeScreenFragment}>
              <Text style={{textAlign: "center", fontSize: 24, color: "#A44"}}>Did Piggyback: </Text>
              <CheckBox value={this.state.piggyBackCheckbox} onValueChange={(piggyBackCheckbox) => {
                this.setState({piggyBackCheckbox})
              }}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes failed to Switch:</Text>
              <Counter onChange={(newCount) => this.setState({prismsFailedSwitch: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes failed to Scale:</Text>
              <Counter onChange={(newCount) => this.setState({prismsFailedScale: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes failed to Opponent Switch:</Text>
              <Counter onChange={(newCount) => this.setState({prismsFailedOppSwitch: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes failed to Vault:</Text>
              <Counter onChange={(newCount) => this.setState({prismsFailedVault: newCount})}/>
            </View>
            <Break/>
            <View style={styles.homeScreenFragment}>
              <Text>Cubes failed in Transit:</Text>
              <Counter onChange={(newCount) => this.setState({prismsFailedInTransit: newCount})}/>
            </View>
            <Break/>
          </View>
        </View>
      </View>
    )
  }
}
var sendToScouting = async function() {
  var req = await fetch(ScoutingServerIP+"/api/v1/scoutingdata/save", {
    method: 'POST',
    body: JSON.stringify(
      await db.getAllScouting()
    )
  });
  req = await req.json();
  if(req["error"])
  {
    Alert.alert("Error sending data to Scouting Server: Server returned error: "+req["message"]);
  }
  else
  {
    Alert.alert("Successfully sent data to Scouting Server.");
  }
}
async function getFromScouting() {
  var req = await fetch(ScoutingServerIP+"/api/v1/scoutingdata/getall");
  req = await req.json();
  if(req["error"])
  {
    Alert.alert("Error getting data from Scouting Server: Server returned error: "+req["message"]);
  }
  else
  {
    Alert.alert("Successfully got data from Scouting Server.");
  }
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
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Button title="Visit EricMoranFilms (not my channel but a good one)" onPress={() => {
              Linking.openURL("https://www.youtube.com/user/EricMoranFilms");
            }}/>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Button title="Visit the Mech Cadets Website" onPress={() => {
              Linking.openURL("https://frc4456.com");
            }}/>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Text>Scouting Server IP:</Text>
            <TextInput
            value={ScoutingServerIP}
            onTextChange={(ScoutingIP) => ScoutingServerIP = ScoutingIP}
            />
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Button title={"Send data to Scouting Server"}/>
          </View>
          <Break/>
          <View style={styles.homeScreenFragment}>
            <Button title={"Get data from Scouting Server"}/>
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
  DataScreen: {
    screen: DataScreen,
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
  ScoutingScreen: {
    screen: ScoutingScreen,
    navigationOptions: {
      headerStyle: {backgroundColor: "#333"}
    }
  },
  ScoutingViewScreen: {
    screen: ScoutingViewScreen,
    navigationOptions: {
      headerStyle: {backgroundColor: "#333"}
    }
  }
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
    padding: 10,
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
