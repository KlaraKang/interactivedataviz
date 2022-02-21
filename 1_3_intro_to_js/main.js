console.log('hello world');

const label = document.getElementById("pet-label")
const input = document.getElementById("pet-name")
const color = document.getElementById("pet-color")
const gender = document.getElementById("pet-gender")
const age = document.getElementById("pet-age")
const button = document.getElementById("pet-submit")
const count = document.getElementById("pet-count")

let petName;
let petColor;
let petGender;
let petAge;

let petCount = 0;

function petNameUpdate() {
    petName = input.value
    petColor = color.value
    petGender = gender.value
    petAge = age.value
    
    console.log(petName)
    console.log(petColor)
    console.log(petGender)
    console.log(petAge)
    label.innerText = petName + " is " + petColor + " color " + petAge + " years old " +  petGender + "!"
    button.innerText = "Enter another pet!"
    
    console.log(petCount)
    petCount = petCount +1
    count.innerText = "Number of names you have entered: " + petCount;
    input.value = ""
    color.value=""
    gender.value=""
    age.value=""
}


