//Global scope variables
let totalScore = 0 
let currentRound = 0 
const maxNumOfRounds = 10 //declaring this as variable so the number of rounds is easy to adjust
const displayPhoto = document.getElementById('image') 
const randomPhotosArray = [] //Empty array to store the details of each previously shown photo (to prevent repeats and also to display the used photos and their details at the end)

//Starts on black page with BEGIN button
const startButton = document.createElement('button')
startButton.textContent = "BEGIN"
document.body.appendChild(startButton)
startButton.addEventListener('click', () => {
    removeInstructions()
     startGame()
})

//Function removes the instructions
function removeInstructions() {
    const instructions = document.getElementById('instructions')
        instructions.remove()
}

//Function removes "BEGIN" button, reveals the guess input form, and calls fetchRandomPhoto() to begin game
function startGame() {
    startButton.remove()
    document.getElementById("guess-form").style.display = "block" //reveals the submit form
    fetchRandomPhoto()     
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
    currentRound ++ 
    //if there are rounds left, fetch a new photo, else end game
    if (currentRound < maxNumOfRounds) { 
        fetchRandomPhoto()
    } else {
        endGame()
    }
    
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
    displayPhoto.remove();
    guessForm.remove();
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
    document.body.classList.add('final-page');
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
    //save score to db.json
    saveScoreButton.addEventListener("click", () => {
        const playerName = playerNameInput.value
        if (playerName) {
            saveScore(playerName, totalScore)
            saveScoreButton.remove()
            playerNameInput.remove()
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
        usedPhoto.classList.add('used-photo') 
        document.body.appendChild(usedPhoto)
        usedPhoto.addEventListener('mouseover', () => revealDetails(photo, usedPhoto))
    })
}

//Function displays details for each of the photos used (with mouseover event listener)
function revealDetails(photo, photoElement) { //photo argument is the photo object, photoElement is the image element that triggered the mouseover event
    //Create a container for the photo details
    const photoDetailsContainer = document.createElement("div")
    photoDetailsContainer.classList.add("photo-details-container")

    //Add photo details
    const titleAndYearReveal = document.createElement("p")
    titleAndYearReveal.textContent = `${photo.title} (${photo.year})`
    const descriptionReveal = document.createElement("p")
    descriptionReveal.textContent = photo.description
    descriptionReveal.classList.add("photo-descriptions")

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

    const newLeader = { name: playerName, score: score}

    fetch('http://localhost:3000/leaders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLeader)
    })
    .then(response => response.json())
    .then(() => {
        showLeaderboard()
    })
    .catch(() => {
        alert("Error saving score")
    })
}

//Function fetches the leaders object from db.json and adds player's name and score to it (in right location)
function showLeaderboard() {
    fetch('http://localhost:3000/leaders') 
        .then(response => response.json())
        .then(data => {
            const leaderboard = data.sort((a,b) => a.score - b.score) //Sorts by score in ascending order
            const leaderboardContainer = document.createElement("div")
            leaderboardContainer.classList.add("leaderboard-container")
            leaderboardContainer.innerHTML = "<h3>Leaderboard</h3>"

            leaderboard.forEach((entry, index) => {
                const scoreEntry = document.createElement("p")
                scoreEntry.textContent = `${index + 1}. ${entry.name} - ${entry.score} points` // `${index +1}` displays the index of the player in the leader (plus 1 to make more user-friendly), ${entry.name} displays the name property of the entry (aka the player name), ${entry.score} will display the score property of the entry/user
                scoreEntry.classList.add("leaderboard-entry")
                leaderboardContainer.appendChild(scoreEntry)
            })

            document.body.appendChild(leaderboardContainer)
        })
        .catch(() => {
            alert("Error fetching leaderboard")
        })
}

//Testing instructions typing function
function typeOutText(element, text, speed = 150) {
    let index = 0;

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }

    type();
}

//Call the typing instructions
const instructions = document.getElementById('instructions');
const instructionText = "Welcome to Chronoguesser... Guess the year each photo was taken. The closer you are, the better your score.";
typeOutText(instructions, instructionText);

// Wait for the start music button to be clicked, then play music on loop
document.getElementById('start-music').addEventListener('click', function() {
    const audio = document.getElementById('background-music');
    audio.play(); // Start playing the background music
    this.remove(); // Removes the "Start Music" button once clicked
});