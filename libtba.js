const UserAgent = "4456Scouting/ 1.0";
const baseURI = "https://www.thebluealliance.com/api/v3";
import {ToastAndroid} from "react-native";
async function getAllTeamInfo(TBAkey)
{
    var teamData = []
    var continueGetting = true;
    var count = 0;
    while(continueGetting)
    {
        var options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                "User-Agent": UserAgent,
                "X-TBA-Auth-Key": TBAkey
            }
        }
        var r = await fetch(baseURI+"/teams/"+count, options);
        r = await r.json();
        ToastAndroid.showWithGravity(
            'TBA download progress: ('+count+'/15)',
            1,
            ToastAndroid.BOTTOM
        );
        if(r.length != 0)
        {
            r.forEach(element => {
                teamData.push(element);
            });
            count += 1
        }
        else
        {
            continueGetting = false;
            ToastAndroid.showWithGravity(
                'TBA download completed. Storing data.',
                1,
                ToastAndroid.BOTTOM
              );
            return teamData;
        }
    }
}
module.exports.getAllTeamInfo = getAllTeamInfo;