//import Realm from "realm";
import { ToastAndroid } from "react-native";
const FRCteamSchema = {
    name: "FRCteamSchema",
    properties: {
        key: "string",
        team_number: {default: 0, type: "int"},
        nickname: {default: "", type: "string"},
        name: {default: "", type: "string"},
        city: {default: "", type: "string"},
        state_prov: {default: "", type: "string"},
        country: {default: "", type: "string"},
        address: {default: "", type: "string"},
        postal_code: {default: "", type: "string"},
        gmaps_place_id: {default: "", type: "string"},
        gmaps_url: {default: "", type: "string"},
        lat: {default: "", type: "string"},
        lng: {default: "", type: "string"},
        location_name: {default: "", type: "string"},
        website: {default: "", type: "string"},
        rookie_year: {default: 0, type: "int"},
        motto: {default: "", type: "string"},
    }
}
const PowerUpMatchSchema = {
    name: "PowerUpMatch",
    properties: {
        // TEAM INFO BLOCK
        match_number: {default: 0, type: "int"},
        // AUTO BLOCK
        auto_line: {default: false, type: "bool"},
        auto_delivered_switch: {default: 0, type: "int"},
        auto_delivered_scale: {default: 0, type: "int"},
        auto_delivered_oppswitch: {default: 0, type: "int"},
        // MANUAL BLOCK
        prisms_delivered_switch: {default: 0, type: "int"},
        prisms_delivered_scale: {default: 0, type: "int"},
        prisms_delivered_oppswitch: {default: 0, type: "int"},
        prisms_delivered_vault: {default: 0, type: "int"},
        prisms_failed_switch: {default: 0, type: "int"},
        prisms_failed_scale: {default: 0, type: "int"},
        prisms_failed_oppswitch: {default: 0, type: "int"},
        prisms_failed_vault: {default: 0, type: "int"},
        // OTHER BLOCK
        notes: {default: "None", type: "string"},
        failed_in_transit: {default: 0, type: "int"}
    }
}
const PowerUpScoutSchema = {
    name: "PowerUpScoutSchema",
    properties: {
        key: "string",
        matches: "PowerUpMatch[]"
    }
}
const ConfigSchema = {
    name: "Config",
    properties: {
        version: {default: 1, type: "int"},
        TBAkey: {default: "Please insert TBA key", type: "string"}
    }
}
// configData is a JSON dict with the following:
// {"TBAkey": "<insert key here>"}
async function updateConfig(configData)
{
    var realm = await new Realm({schema: [ConfigSchema]});
    var config = await realm.objects("Config");
    await realm.write(() => realm.delete(config));
    await realm.write(() => realm.create("Config", {TBAkey: configData["TBAkey"]}));
    return null;
}
async function readConfig()
{
    var realm = await new Realm({schema: [ConfigSchema]});
    var config = await realm.objects("Config");
    return config[0];
}
// tbadata is an array of all FRC teams. Returns null.
// ex: [{"key": "frc4456", "nickname": "Mech Cadets"}, {"key": "frc0", "nickname": "Team 0"}]
async function writeTBAteams(tbadata)
{
    var realm = await new Realm({schema: [FRCteamSchema]});
    var allTeams = realm.objects("FRCteamSchema");
    ToastAndroid.showWithGravity(
        'Purging current information',
        1,
        ToastAndroid.CENTER
      );
    await realm.write(() => realm.delete(allTeams));
    for(var i = 0; i < tbadata.length; i++)
    {
        var team = tbadata[i];
        Object.keys(team).forEach(element =>
        {
            if(team[element] == null || team[element] == undefined)
            {
                team[element] = "";
            }
        });
        const teamInfo = {
            key: team.key,
            team_number: team.team_number,
            nickname: team.nickname,
            name: team.name,
            city: team.city,
            state_prov: team.state_prov,
            country: team.country,
            address: team.address,
            postal_code: team.postal_code,
            gmaps_place_id: team.gmaps_place_id,
            gmaps_url: team.gmaps_url,
            lat: team.lat,
            lng: team.lng,
            location_name: team.location_name,
            website: team.website,
            rookie_year: Number(team.rookie_year),
            motto: team.motto,
        }
        await realm.write(() =>
        {
            realm.create("FRCteamSchema", teamInfo);
        });
    }
}
// Data is an array of teams to get, in terms of key. Returns an array of results.
// ex: ["frc4456", "frc0"]
function getTBAteam(data)
{
    return new Promise(async function(resolve, reject) {
        var realm = await new Realm({schema: [FRCteamSchema]});
        const teamReturn = [];
        data.forEach(async function(teamKey)
        {
            var filterstr = "key BEGINSWITH \"frc"+teamKey+"\"";
            var obj = await realm.objects("FRCteamSchema").filtered(filterstr)["0"];
            teamReturn.push(obj);
        });
        resolve(teamReturn);
    });
}
// Data is an object with data on the team matching the schema. All but the team key are optional.
/* Ex: {
    "key": "frc4456",
    match: {
        "match_number": 16, 
        "auto_line": true, 
        "auto_delivered_switch": 4456, 
        "auto_delivered_scale": 4456, 
        "auto_delivered_oppswitch": 4456,
        "prisms_delivered_switch": 9001,
        "prisms_delivered_scale": 9001,
        "prisms_delivered_oppswitch": 9001,
        "prisms_delivered_vault": 9001,
        "prisms_failed_switch": 0,
        "prisms_failed_scale": 0,
        "prisms_failed_oppswitch": 0,
        "prisms_failed_vault": 0,
        "notes": "Their robot scored over 9000!",
        "failed_in_transit": 0
    }
}
*/
async function updateTeamScouting(data)
{
    var realm = await new Realm({schema: [PowerUpMatchSchema, PowerUpScoutSchema], path: "scouting.realm"});
    var currentTeam = await realm.objects("PowerUpScoutSchema").filtered("key BEGINSWITH \""+data["key"]+"\"");
    if(currentTeam.length == 0)
    {
        await realm.write(() => currentTeam = realm.create("PowerUpScoutSchema", {
            "key": data["key"],
            "matches": []
        }));
    }
    if(currentTeam["0"]) {
        currentTeam = currentTeam["0"];
    }
    var matches = currentTeam.matches
    //Duplicate match checking does not work yet
    if(getObjectValues(matches).length > 0)
    {
        getObjectValues(matches).forEach(match => {
            if(Number(match["match_number"]) == Number(data["match"]["match_number"])) {
                return {"error":true,"message": "Duplicate Match"};
            }
            else {
            }
        })
    }
    // currentTeam = currentTeam[0];
    realm.write(() => {
        //currentTeam.matches.push(data["match"]);
        matches.push(data["match"]);
    });
    return {"error":false}
}
// Data is an array of match numbers inside of a dict for a team, or string "all"
// Example: {"key": "frc4456", "matches": [1, 6, 11, 16], key: "frc0", "matches": "all"}
// Example response: {"error": false, matches: [{"match_number": 1, etc},...]}
// Example failed response: {"error": true, error: "team not found"}
async function getTeamScoutingMatches(data)
{
    var realm = await new Realm({schema: [PowerUpMatchSchema, PowerUpScoutSchema], path: "scouting.realm"});
    var currentTeam = await realm.objects("PowerUpScoutSchema").filtered("key ENDSWITH \""+data["key"]+"\"");
    if(currentTeam["0"])
    {
        currentTeam = currentTeam["0"];
    }
    var returnData = {
        "error": false,
        "matches": []
    }
    if(currentTeam.length == 0)
    {
        return {"error":true,"error":"team not found"};
    }
    if(data["matches"] === "all")
    {
        return {"error": false, "data": getObjectValues(currentTeam.matches)};
    }
    currentTeam.matches.forEach(match => {
        if(data["matches"].indexOf(match["match_number"]) != -1)
        {
            returnData["matches"].push(data);
        }
    });
    return returnData;
}
function getObjectValues(data)
{
    var val = [];
    Object.keys(data).forEach((obj) => val.push(data[obj]));
    return val;
}
module.exports.writeTBAteams = writeTBAteams;
module.exports.getTBAteam = getTBAteam;
module.exports.readConfig = readConfig;
module.exports.updateConfig = updateConfig;
module.exports.updateTeamScouting = updateTeamScouting;
module.exports.getTeamScoutingMatches = getTeamScoutingMatches;