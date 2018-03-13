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
module.exports.writeTBAteams = writeTBAteams;
module.exports.getTBAteam = getTBAteam;
module.exports.readConfig = readConfig;
module.exports.updateConfig = updateConfig;