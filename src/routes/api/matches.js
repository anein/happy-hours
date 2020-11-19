import * as axios from "axios";
import {parse} from 'node-html-parser';

var fs = require('fs');

export async function get(req, res, next) {

    const {friendId = null} = req.query;

    const my_id = "924790347"
    // const alise_id = "32081734"
    // const p2_id = "893728993"
    // const red_id = "839959568"
    // const STEAM_API_KEY = "8273A998470F9C245E136B210DACCDE6"

    // check base status
    if (!friendId) {
        res.json({"error": "Friend ID is empty"})
        return;
    }

    const myMatches = await getMatches(my_id);
    const friendsMatches = await getMatches(friendId);

    if (myMatches.count === 0 || friendsMatches.count === 0) {
        res.json({"error": `My Matches: ${myMatches.count}. Friends Matches: ${friendsMatches.count}.`})
        return;
    }

    const myMatchesIds = myMatches.matches;
    const friendsMatchesIds = friendsMatches.matches;

    // find intersection between match ids of friend and player
    console.log(friendsMatchesIds.length, myMatchesIds.length);

    const intersection = friendsMatchesIds.filter((item) => true === myMatchesIds.some((item2) => item.match_id === item2.match_id))
    const sortedIntersection = intersection.sort( (a,b) =>  new Date(a.date) - new Date(b.date) )

    console.log(sortedIntersection[0]);

    const duration = intersection.map((item) => item.duration).reduce((a, b) => a + b);
    const durationInHours = Math.floor(duration / 3600);

    res.json({
        count: intersection.length,
        total_duration: duration,
        total_duration_in_hours: durationInHours
    });


}

async function getMatches(userId) {

    let {page, matches} = readUserFile(userId);
    let result;

    try {

        console.log(`ID: ${userId} , Start Page: ${page}`)

        while (page) {

            const response = await axios.get(`https://www.dotabuff.com/players/${userId}/matches?enhance=overview&page=${page}`);

            if (response.status !== 200) {
                console.log(response.statusText);
                break;
            }


            const root = parse(response.data);
            const nextPage = root.querySelector(".next a");

            const matchesTable = root.querySelectorAll("section table")[1];
            const matchesIds = getMatchesIdsFromListOfNodes(matchesTable.querySelectorAll("tbody tr"));

            matches.push(...matchesIds)

            if (nextPage) {
                page = nextPage.getAttribute("href").toString().match(/(?<=page=)\d+/).toString()
            } else {
                page = null;
            }

            await new Promise(resolve => setTimeout(resolve, 3000));

        }

    } catch (e) {
        console.log(e.message, "Page: " + page)
        // res.json({"error": e.message});
        // return;
    } finally {

        result = {count: matches.length, "last_page": page, matches: matches};

        writeUserMatchesToFile(userId, result)

    }

    return result;

}

function readUserFile(userId) {
    const fileName = `/home/white/Projects/steam/friends-hours/static/${userId}.json`;

    if (!fs.existsSync(fileName)) {
        return {page: 1, matches: []}
    } else {
        const content = fs.readFileSync(fileName, "utf-8")
        const data = JSON.parse(content);
        return {page: data.last_page, matches: data.matches}
    }

}

function writeUserMatchesToFile(userId, content) {

    fs.writeFileSync(`/home/white/Projects/steam/friends-hours/static/${userId}.json`, JSON.stringify(content))
}

function getMatchesIdsFromListOfNodes(matches) {

    const ids = [];

    for (const match of matches) {
        const tds = match.querySelectorAll("td");

        const id = tds[1].querySelector("a").getAttribute("href").toString().match(/(?<=\/)(\d+)$/)[0]
        const duration = durationToSeconds(tds[5].innerText);
        const date = tds[3].querySelector("time").getAttribute("datetime").toString();

        ids.push({"match_id": id, "duration": duration, "date": date})
    }

    return ids;

}

function getDurationFromListOfNodes(durations) {

    const ids = [];

    for (const duration of durations) {
        const totalInSeconds = 0;
        const listOfValue = durations.innerText.toString().split(":")

        const hours = (listOfValue.length === 3) ? listOfValue[0] : 0;
        const minutes = listOfValue[listOfValue.length - 2] ? listOfValue[listOfValue.length - 2] : 0;
        const seconds = listOfValue[listOfValue.length - 1];

        ids.push(+hours * 3600 + +minutes * 60 + +seconds);

    }

    return ids;

}

function durationToSeconds(duration) {
    const listOfValue = duration.toString().split(":")

    const hours = (listOfValue.length === 3) ? listOfValue[0] : 0;
    const minutes = listOfValue[listOfValue.length - 2] ? listOfValue[listOfValue.length - 2] : 0;
    const seconds = listOfValue[listOfValue.length - 1];

    return +hours * 3600 + +minutes * 60 + +seconds;
}