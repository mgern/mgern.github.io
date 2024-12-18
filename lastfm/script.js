const apiKey = '8d9d7f71d10a0f2f967b3e68364a005f';
const baseUrl = 'https://ws.audioscrobbler.com/2.0/';
//timeframes: overall | 7day | 1month | 3month | 6month | 12month 
const timeframe = "12month";

const currentYear = new Date().getFullYear();
// const fromTimestamp = new Date(currentYear, 0, 1).getTime() / 1000;
// const toTimestamp = new Date(currentYear, 11, 31, 23, 59, 59).getTime() / 1000;

async function getUserTopArtists() {
    const username = document.getElementById('username').value;
    const resultDiv = document.getElementById('artists');

    // Get the current year

    document.getElementById("artistimage").style.display = "block";
    const url = `${baseUrl}?method=user.gettopartists&user=${username}&api_key=${apiKey}&format=json&limit=5&period=12month`;

    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.error) {
                        throw new Error(data.message);
                    }

                    const topArtists = data.topartists.artist;

                    resultDiv.innerHTML = `
                    <h3>Top Artists</h3>
                    <ol>
                        ${topArtists.map(artist => `<li><span>${artist.name}</span></li>`).join('')}
                    </ol>`;


                } else {
                    throw new Error(`HTTP request failed with status ${xhr.status}`);
                }
            }
        };
        xhr.send();
    } catch (error) {
        console.error('Error fetching data:', error.message || error);
        resultDiv.innerHTML = `<p>Error: ${error.message || 'Unknown error'}</p>`;
    }
}

async function fetchSpotifyAccessToken() {
    const response = await fetch('https://open.spotify.com/get_access_token?reason=transport&productType=web_player');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    console.log(data.accessToken);
    return data.accessToken;
}

async function getArtistPicture(artist) {
    try {
      const url = `https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(artist)}&decorate_restrictions=false&best_match=true&include_external=audio&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${fetchSpotifyAccessToken()}`,
          'Content-Type': 'application/json'
        //   'Accept': 'application/json',
        //   'Origin': window.location.origin

        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
}

async function getTopArtistImage() {
    try {
        const method = 'chart.gettopartists';
        const period = timeframe;
        const params = new URLSearchParams({
            method: method,
            api_key: apiKey,
            format: 'json',
            period: period,
            limit: 1  // Get only the top artist
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const artist = data.artists.artist[0];
        const imageUrl = getArtistPicture(artist)

        
        




        console.log(imageUrl)
        // Get the image element and update its properties
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = `${artist.name}`;
        
        // Get the container div and append the new image
        const container = document.getElementById('artistimage');
        // Clear any existing content
        container.innerHTML = '';
        // Append the new image
        container.appendChild(imgElement);
    } catch (error) {
        console.error('Error fetching artist image:', error);
        // Optionally set a fallback image
        document.getElementById("artistimage").src = 'path/to/fallback-image.jpg';
    }
}


async function getUserTopTracks() {
    const username = document.getElementById('username').value;
    const resultDiv = document.getElementById('tracks');

    // Get the current year
    const currentYear = new Date().getFullYear();
    // const fromTimestamp = new Date(currentYear, 0, 1).getTime() / 1000;
    // const toTimestamp = new Date(currentYear, 11, 31, 23, 59, 59).getTime() / 1000;

    const url = `${baseUrl}?method=user.gettoptracks&user=${username}&api_key=${apiKey}&format=json&limit=5&period=12month`;

    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.error) {
                        throw new Error(data.message);
                    }

                    const topTracks = data.toptracks.track;

                    resultDiv.innerHTML = `
                    <h3>Top Songs</h3>
                    <ol>
                        ${topTracks.map(track => `<li><span>${track.name} - ${track.artist.name},</span></li>`).join('')}
                    </ol>`;

                } else {
                    throw new Error(`HTTP request failed with status ${xhr.status}`);
                }
            }
        };
        xhr.send();
    } catch (error) {
        console.error('Error fetching data:', error.message || error);
        resultDiv.innerHTML = `<p>Error: ${error.message || 'Unknown error'}</p>`;
    }
}






async function getTopGenre() {
    // Get the current year
    const currentYear = new Date().getFullYear();
    const username = document.getElementById('username').value;
    const resultDiv = document.getElementById('genre');
    limit = 20;//increase for more accurate results
    genres = [];

    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&limit=${limit}&api_key=${apiKey}&format=json`;

    resultDiv.innerHTML = `<h3>Top Genre</h3><p>Loading Genre...`;


    try {
        // Fetch data from the Last.fm API
        const response = await fetch(apiUrl);
        const data = await response.json();

        // console.log(data.topartists.artist.length);
        // Check if the API request was successful
        if (data.topartists.artist.length > 0) {
            // Get the top genre from the first artist in the list
            // const topGenre = data.topartists.artist[0].['@attr'].genre;

            //loop through the 5 top artists and get the first 'tag' from artist.getinfo from that artist.
            for (i = 0; i < limit; ++i) {
                try {

                    artist = data.topartists.artist[i].name;
                    // console.log(artist);
                    // Construct the Last.fm API endpoint for artist.getinfo
                    const artistInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&api_key=${apiKey}&format=json`;

                    // Fetch data from the Last.fm API for artist.getinfo
                    const response = await fetch(artistInfoUrl);
                    const data2 = await response.json();

                    // Check if the API request was successful
                    if (data2.artist.tags.tag.length > 0) {
                        // Get the first tag as the genre
                        genre = data2.artist.tags.tag[0].name;
                        genres.push(genre);
                        //you know what lets also do the artists second tag
                        genre = data2.artist.tags.tag[1].name;
                        genres.push(genre);

                    } else {
                        console.error(`Unable to fetch genre data for ${artist} from Last.fm API.`);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            console.log(genres);
            resultDiv.innerHTML = `<h3>Top Genre:</h3> 
                        ${mode(genres)}`;
            // return topGenre;
        } else {
            console.error('A whoopsie happened in the top genre request');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function mode(array) {
    if (array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}





// function handleKeyPress(event) {
//     if (event.key === 'Enter') {
//         event.preventDefault(); // Prevents the default form submission
//         getUserTopArtists();
//     }
// }





//this is the most mental one
async function getMinutesListened() {
    const username = document.getElementById('username').value;
    const resultDiv = document.getElementById('minuteslistened');

    totalDuration = 0;
    pageCounter = 1;

    minutes = 0

    const pages = await getPageAmount(apiKey, username);

    try {
        for (let i = 1; i < pages; i++) {
            resultDiv.innerHTML = `<h3>Minutes Listened</h3><p>Counting minutes...  ${pageCounter} / ${pages - 1}...`;
            pageCounter++;


            const strPages = i.toString();
            const pageData = await getPageData(apiKey, username, strPages);

            for (let j = 0; j < 200; j++) {
                const temp = pageData[j];

                const tempDuration = parseInt(temp.duration);
                const tempPlayCount = parseInt(temp.playcount);

                const duration = tempDuration * tempPlayCount;
                totalDuration += duration;
            }
        }
    } catch (error) {
        console.log("Minutes fucked up")
        // resultDiv.innerHTML += `<p>${minutes} minutes`;
    }
    
    minutes = Math.round(totalDuration / 60)
    minutes = new Intl.NumberFormat().format(minutes);
    resultDiv.innerHTML = `<h3>Minutes Listened</h3><p>${minutes}`;
}
let totalDuration = 0;
let pageCounter = 1;
// let timeframe = null;
async function getPageAmount(apiKey, username) {
    const dataURL = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${apiKey}&limit=200&period=${timeframe}&format=json`;

    const response = await fetch(dataURL);
    const data = await response.json();

    const pages = data.toptracks['@attr'].totalPages;
    return parseInt(pages) + 1;
}
async function getPageData(apiKey, username, strPages) {
    const dataURL2 = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&limit=200&api_key=${apiKey}&page=${strPages}&period=${timeframe}&format=json`;

    const response = await fetch(dataURL2);
    const data = await response.json();

    return data.toptracks.track;
}
/////end of hell
