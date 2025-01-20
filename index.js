let randomPhoto = {}
let totalScore = 0
let currentRound = 0
const maxNumOfRounds = 5 //declaring this as variable so the number of rounds is easy to adjust
const displayPhoto = document.getElementById('image') //Grabs the display photo element
//WILL PROBABLY UPDATE randomPhotosArray TO AN OBJECT FOR BETTER ORGANIZATION - THEN WILL NOT THE BELOW "LET"S AND CAN STORE ALL DETAILS IN ONE PLACE
const randomPhotosArray = [] //Empty array to store the src of each previously shown photo (to prevent repeats and also to display the used photos at the end)

let photoYear = ""
let photoTitle = ""
let photoDescription = ""
let photoSource = ""

//Starts on black page with simple BEGIN button for drama
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
        const availablePhotos = data.filter(photo => !randomPhotosArray.includes(photo.image))
        
        //Select a random photo from the remaining available ones
        const randomInteger = Math.floor(Math.random() * availablePhotos.length)
        randomPhoto = availablePhotos[randomInteger]
            
        //Update the displayed photo
        displayPhoto.src = randomPhoto.image
        photoYear = randomPhoto.year
        photoTitle = randomPhoto.title
        photoDescription = randomPhoto.description
        photoSource = randomPhoto.source
           
        //Append photo to the DOM and track it in randomPhotosArray
        document.body.appendChild(displayPhoto) //Append the image to the body
        randomPhotosArray.push(randomPhoto.image) 
    })
    .catch( () => {
        alert("Errorfetching photos")
    })
}


//Handle guess submission
const guessForm = document.querySelector("#guess-form") //select the form
guessForm.addEventListener('submit', (event) => { //listen for submit on the form
    event.preventDefault() //prevent the form from submitting
    const guessYear = Number(document.querySelector("#guess-year").value) //access input value directly
    calculateScore(guessYear) //pass the value to the function
    console.log(totalScore)
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


function endGame() {
    document.body.innerHTML = ""
        const gameOver = document.createElement("h4")
        gameOver.textContent = `Game Over! Final Score: ${totalScore}`
        document.body.appendChild(gameOver)//display "game over" on the blacked out screen
        // calculateScore(guessYear)
        console.log(totalScore)
        const acceptDefeatButton = document.createElement("button")
        acceptDefeatButton.textContent = "See the truth"
        document.body.appendChild(acceptDefeatButton)
        acceptDefeatButton.addEventListener('click', () => {
            gameOver.remove()
            acceptDefeatButton.remove()
            revealPhoto() //USE FOR EACH TO MAKE IT DISPLAY EACH OF THE RANDOM PHOTOS (SAVED IN AN ARRAY EACH GAME) AND THEIR DETAILS
        })
}


//function will calculate user's score
function calculateScore(guessYear) {
    const photoYearNumber = Number(randomPhoto.year) //convert to a number for the calculations
    const roundScore = Math.abs( randomPhoto.year - guessYear ) //score for each round = |accurate year - guess year|
    totalScore += roundScore
}

function revealPhoto() {
    randomPhotosArray.forEach((photoSrc) => {
        const usedPhoto = document.createElement('img')
        usedPhoto.src = photoSrc
        usedPhoto.classList.add('used-photo') //this will make all the used photos have the classname "used-photo", so I can style it in CSS
        document.body.appendChild(usedPhoto)
        usedPhoto.addEventListener('mouseover', revealDetails)
    })
}

//Reveals photo information 
function revealDetails() {
    const yearReveal = document.createElement("p")
    yearReveal.textContent = photoYear
    const titleReveal = document.createElement("p")
    titleReveal.textContent = photoTitle
    const descriptionReveal = document.createElement("p")
    descriptionReveal.textContent = photoDescription
    document.body.appendChild(yearReveal)
    document.body.appendChild(titleReveal)
    document.body.appendChild(descriptionReveal)
}


//When game finishes, user is prompted to input name


//Log to leaderboard: will take User's name and score and place on chart 




//FUNCTIONALITY TO DOS:
//make sure photos don't repeat
//make an array of the random photos
//push each new random photo to array
//if next random photo is already in array, generate new random photo


//Have a start button (small white button on all black page) -- maybe it *shakes/trembles* when clicked
//Maybe have that text disappear like mist
//and then next text is instructions
//when instructions timeout or are clicked, they shake/tremble and game begins (text disappears)

//FORMATTING TO DOS:
//Make photo fit to whole webpage
