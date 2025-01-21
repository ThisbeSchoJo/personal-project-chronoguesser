//Initial variables
let totalScore = 0 
let currentRound = 0 
const maxNumOfRounds = 10 //declaring this as variable so the number of rounds is easy to adjust
const displayPhoto = document.getElementById('image') //Grabs the display photo element
const randomPhotosArray = [] //Empty array to store the src of each previously shown photo (to prevent repeats and also to display the used photos at the end)

//Starts on black page with simple BEGIN button
//COULD PROBABLY PUT SOME OF THE NEXT LINES IN THE HTML CODE FOR SIMPLICITY (and instead just getELementById and add eventListener)
const startButton = document.createElement('button')
startButton.textContent = "BEGIN"
document.body.appendChild(startButton)
startButton.addEventListener('click', () => {
    startButton.remove() //removes the start button after click/starting
    //Start the game
    document.getElementById("guess-form").style.display = "block" //reveals the submit form
    fetchRandomPhoto() //calls function to start generating random photos
})

//Function that fetches a random photo from the photos object in db.json
function fetchRandomPhoto() {
    fetch('http://localhost:3000/photos') //fetches photos object in db.json
    .then(response => response.json()) //Parse the JSON file
    .then(data => {
        //Filter photos to exclude already used ones
        const availablePhotos = data.filter(photo => 
            !randomPhotosArray.some(item => item.image === photo.image)
        )
        
        //Select a random photo from the remaining available ones
        const randomInteger = Math.floor(Math.random() * availablePhotos.length) //Separated from next line of code for readability
        const randomPhoto = availablePhotos[randomInteger]
            
        //Update the displayed photo
        displayPhoto.src = randomPhoto.image
        randomPhotosArray.push({
            image: randomPhoto.image,
            year: randomPhoto.year,
            title: randomPhoto.title,
            description: randomPhoto.description
        })
    })
    .catch(() => alert("Error fetching photos"))
}


//Handle guess submission
const guessForm = document.querySelector("#guess-form") //select the form
guessForm.addEventListener('submit', (event) => { //listen for submit on the form
    event.preventDefault() //prevent the form from submitting
    const guessYear = Number(document.querySelector("#guess-year").value) //access input value directly
    calculateScore(guessYear) //pass the value to the function
    //Either move onto next round or end the game
    currentRound ++

    if (currentRound < maxNumOfRounds) {
        fetchRandomPhoto()
    } else {
        endGame()
    }
    //
    guessForm.reset() //clear the input field
})

//function will calculate user's score
function calculateScore(guessYear) {
    const roundPhoto = randomPhotosArray[currentRound] 
    const roundScore = Math.abs(Number(roundPhoto.year) - guessYear ) //score for each round = |accurate year - guess year|
    totalScore += roundScore
}

function endGame() {
    document.body.innerHTML = ""
        const gameOver = document.createElement("h4")
        gameOver.textContent = `Game Over! Final Score: ${totalScore}`
        document.body.appendChild(gameOver)//display "game over" on the blacked out screen

        const playerNameInput = document.createElement("input")
        playerNameInput.placeholder = "Enter your name"
        document.body.appendChild(playerNameInput)
        playerNameInput.style.margin = "5px"

        const saveScoreButton = document.createElement("button")
        saveScoreButton.textContent = "Save Score"
        document.body.appendChild(saveScoreButton)
        saveScoreButton.style.margin = "5px"

        saveScoreButton.addEventListener("click", () => {
            const playerName = playerNameInput.value
            if (playerName) {
                saveScore(playerName, totalScore) //save score to db.json
            } else {
                alert("Please enter your name.")
            }
        })

        const acceptDefeatButton = document.createElement("button")
        acceptDefeatButton.textContent = "See Details"
        document.body.appendChild(acceptDefeatButton)
        acceptDefeatButton.style.margin = "5px"
        acceptDefeatButton.addEventListener('click', () => {
            gameOver.remove()
            acceptDefeatButton.remove()
            revealPhoto() //USE FOR EACH TO MAKE IT DISPLAY EACH OF THE RANDOM PHOTOS (SAVED IN AN ARRAY EACH GAME) AND THEIR DETAILS
        })
}


function revealPhoto() {
    randomPhotosArray.forEach((photo) => {
        const usedPhoto = document.createElement('img')
        usedPhoto.src = photo.image
        usedPhoto.classList.add('used-photo') //this will make all the used photos have the classname "used-photo", so I can style it in CSS
        document.body.appendChild(usedPhoto)
        usedPhoto.addEventListener('mouseover', () => revealDetails(photo, usedPhoto))
    })
}


//Reveals photo information 
function revealDetails(photo, photoElement) { //photo argument is the photo object, photoElement is the image element that triggered the mouseover event
    //Create a container for the photo details
    const photoDetailsContainer = document.createElement("div")

    //Add details to the container
    // const yearReveal = document.createElement("p")
    // yearReveal.textContent = `Year: ${photoYear}`
    const titleAndYearReveal = document.createElement("p")
    titleAndYearReveal.textContent = `${photo.title} (${photo.year})`
    const descriptionReveal = document.createElement("p")
    descriptionReveal.textContent = photo.description

    //Append details to the container
    // photoDetailsContainer.appendChild(yearReveal)
    photoDetailsContainer.appendChild(titleAndYearReveal)
    photoDetailsContainer.appendChild(descriptionReveal)

    //Replace the photo with the details
    photoElement.replaceWith(photoDetailsContainer)

    //Revert photo back when user hovers out
    photoDetailsContainer.addEventListener("mouseout", () => {
        photoDetailsContainer.replaceWith(photoElement)
    })
}


function saveScore(playerName, score) {
    //Create an object to store the player's name and score
    const newLeader = { name: playerName, score: score}

    //Send a POST request to update the 'leaders' array in db.json
    fetch('http://localhost:3000/leaders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLeader)
    })
    .then(response => response.json())
    .then(() => {
        showLeaderboard() //Display the leaderboard after saving the score
    })
    .catch(() => {
        alert("Error saving score")
    })
}

function showLeaderboard() {
    fetch('http://localhost:3000/leaders') //Fetch the leaders data from db.json
        .then(response => response.json())
        .then(data => {
            const leaderboard = data.sort((a,b) => a.score - b.score) //Sorts by score in ascending order
            const leaderboardContainer = document.createElement("div")
            leaderboardContainer.innerHTML = "<h3>Leaderboard</h3>"

            leaderboard.forEach((entry, index) => {
                const scoreEntry = document.createElement("p")
                scoreEntry.textContent = `${index + 1}. ${entry.name} - ${entry.score} points` // `${index +1}` displays the index of the player in the leader (plus 1 to make more user-friendly), ${entry.name} displays the name property of the entry (aka the player name), ${entry.score} will display the score property of the entry/user
                leaderboardContainer.appendChild(scoreEntry)
            })

            document.body.appendChild(leaderboardContainer)
        })
        .catch(() => {
            alert("Error fetching leaderboard")
        })
}


