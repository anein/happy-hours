import * as axios from "axios";

export async function get(req, res, next) {

    const my_id = "924790347"
    const alise_id = "32081734"
    const red_id = "839959568"
    const STEAM_API_KEY = "8273A998470F9C245E136B210DACCDE6"

    let playerResponse;
    let friendResponse;

    try {

        // playerResponse = await axios.get(`http://localhost:3000/${my_id}.json`);
        // friendResponse = await axios.get(`http://localhost:3000/${alise_id}.json`);

        playerResponse = await axios.get(`https://api.opendota.com/api/players/${my_id}/matches`);
        friendResponse = await axios.get(`https://api.opendota.com/api/players/${alise_id}/matches`);

    } catch (e) {
        res.json({"error": e.message});
        return;
    }

    // check base status
    if (playerResponse.status !== 200 || friendResponse.status !== 200) {
        res.json({"error": playerResponse.statusText})
        return;
    }

    // get data
    const playerMatchesData = playerResponse.data;
    const friendMatchesData = friendResponse.data;

    // check if some received data is empty
    if (playerMatchesData.length === 0 || friendMatchesData.length === 0) {
        let message = ""
            + ((playerMatchesData.length === 0) ? "Player match data is empty" : "")
            + ((friendMatchesData.length === 0) ? "Friend match data is empty" : "");

        res.json({"error": message})
        return;
    }

    // create array of player match IDs
    const myMatchesIds = (playerMatchesData.map((item) => {
        return {'match_id': item.match_id, "duration": item.duration}
    }));

    // create array of player match IDs
    const friendsMatchesIds = (friendMatchesData.map((item) => {
        return {'match_id': item.match_id, "duration": item.duration}
    }));

    // find intersection between match ids of friend and player
    const intersection = friendsMatchesIds.filter((item) => true === myMatchesIds.some((item2) => item.match_id === item2.match_id))

    // calculate total duration
    const duration = intersection.map((item) => item.duration).reduce((a, b) => a + b);
    const durationInHours = Math.floor(duration / 3600);

    res.json({
        count: intersection.length,
        total_duration: duration,
        total_duration_in_hours: durationInHours,
        match_ids: intersection
    });

}

async function getMatches(next) {

    let URL = `https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=${STEAM_API_KEY}&account_id=${my_id}`;

    if (next) {
        URL += `&start_at_match_id=${next}`
    }

    return await axios.get(URL)
}