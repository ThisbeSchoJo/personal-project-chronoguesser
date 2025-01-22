//Initial variables
let totalScore = 0 
let currentRound = 0 
const maxNumOfRounds = 3 //declaring this as variable so the number of rounds is easy to adjust
const displayPhoto = document.getElementById('image') 
const randomPhotosArray = [] //Empty array to store the details of each previously shown photo (to prevent repeats and also to display the used photos and their details at the end)

//Starts on black page with BEGIN button
const startButton = document.createElement('button')
startButton.textContent = "BEGIN"
document.body.appendChild(startButton)
startButton.addEventListener('click', startGame)//will remove the "BEGIN" button when it is clicked

//Function removes "BEGIN" button, reveals the guess input form, and calls fetchRandomPhoto() to begin game
function startGame() {
    startButton.remove()
    document.getElementById("guess-form").style.display = "block" //reveals the submit form
    fetchRandomPhoto() //calls function to start generating random photos    
}

//Function that fetches a random photo from the photos object in db.json
function fetchRandomPhoto() {
    fetch('http://localhost:3000/photos') 
    .then(response => response.json())
    .then(data => {
        //Filter photos to exclude already used ones
        const availablePhotos = data.filter(photo => //filter method is applied to the data array (which contains all the photos fetched) and creates a new array "availablePhotos" - will only include the items from the data array that meet the conditions
            !randomPhotosArray.some(item => item.image === photo.image) // item.image === photo.image looks for any photo in randomPhotosArray with the same image property as the current photo from the data array (.some method will return true if such a photo exists, but "!" negates this so will return false if the photo is in randomPhotosArray)
        ) //result is a new array (availablePhotos) that will only include photos not in the randomPhotosArray (photos already used)
        
        //Select a random photo from the availablePhotos array
        const randomInteger = Math.floor(Math.random() * availablePhotos.length) //Separated from next line of code for readability
        const randomPhoto = availablePhotos[randomInteger]
            
        //Update the displayed photo and add the displayed photo to the randomPhotosArray (so it won't be used again)
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
const guessForm = document.querySelector("#guess-form") 
guessForm.addEventListener('submit', (event) => { 
    event.preventDefault() 
    const guessYear = Number(document.querySelector("#guess-year").value) //access input value directly
    calculateScore(guessYear) //pass the value to the function to calculate user's score
    //Either move onto next round or end the game
    currentRound ++ //goes to next round

    if (currentRound < maxNumOfRounds) { //if there are rounds left, fetch a new photo
        fetchRandomPhoto()
    } else { //if you've hit the max number of rounds, end the game
        endGame()
    }
    //clear the input field
    guessForm.reset() 
})

//Function will calculate player's score
function calculateScore(guessYear) {
    const roundPhoto = randomPhotosArray[currentRound] 
    const roundScore = Math.abs(Number(roundPhoto.year) - guessYear ) //score for each round = |accurate year - guess year|
    totalScore += roundScore
}

//Function will display "game over" message, player's score, calls acceptPlayerInput(), and displays "See Details" button
function endGame() {
    document.body.innerHTML = "" //clears all of the webpage's content
    const gameOver = document.createElement("h4")
    gameOver.textContent = `Game Over! Final Score: ${totalScore}`
    document.body.appendChild(gameOver)

    acceptPlayerInput()

    const seeDetailsButton = document.createElement("button")
    seeDetailsButton.textContent = "See Details"
    document.body.appendChild(seeDetailsButton)
    seeDetailsButton.style.margin = "5px"
    seeDetailsButton.addEventListener('click', () => {
        gameOver.remove()
        seeDetailsButton.remove()
        revealPhoto() 
    })
}

//Function accepts player's name and calls saveScore() on player's name and totalScore
function acceptPlayerInput() {
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
}

//Function displays the photos used in each of the rounds
function revealPhoto() {
    randomPhotosArray.forEach((photo) => {
        const usedPhoto = document.createElement('img')
        usedPhoto.src = photo.image
        usedPhoto.classList.add('used-photo') //this will make all the used photos have the classname "used-photo", so I can style it in CSS
        document.body.appendChild(usedPhoto)
        usedPhoto.addEventListener('mouseover', () => revealDetails(photo, usedPhoto))
    })
}


//Function displays details for each of the photos used (with mouseover event listener)
function revealDetails(photo, photoElement) { //photo argument is the photo object, photoElement is the image element that triggered the mouseover event
    //Create a container for the photo details
    const photoDetailsContainer = document.createElement("div")

    //Add details to the container
    const titleAndYearReveal = document.createElement("p")
    titleAndYearReveal.textContent = `${photo.title} (${photo.year})`
    const descriptionReveal = document.createElement("p")
    descriptionReveal.textContent = photo.description

    //Append details to the container
    photoDetailsContainer.appendChild(titleAndYearReveal)
    photoDetailsContainer.appendChild(descriptionReveal)

    //Replace the photo with the details
    photoElement.replaceWith(photoDetailsContainer)

    //Revert photo back when user hovers out
    photoDetailsContainer.addEventListener("mouseout", () => {
        photoDetailsContainer.replaceWith(photoElement)
    })
}

//Function saves the player's name and score and calls showLeaderboard()
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

//Function fetches the leaders object from db.json and adds player's name and score to it (in right location)
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


