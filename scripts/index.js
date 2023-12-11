const billInputElements = document.getElementsByClassName("bill-input");
// const billInput = billInputElement.value;
const errorMessageElement = document.getElementById("error-message");
const numberRegex = /^[0-9]+$/;
let bill = 0;
let inputs = [0.0, 0.0];
let numberOfPeople = 1;
let person_days = [];
const peopleDayInputDiv = document.getElementById("people-day-input");
function checkNumber(input) {
  /** Checks each input only has numbers */
  if (!input.match(numberRegex)) {
    errorMessageElement.style.display = "block";
    return false;
  } else {
    errorMessageElement.style.display = "none";
    return true;
  }
}
/** Define function for even splitting */
function evenSplit(bill, n) {
  bill = Number(bill);
  /**Need to take into account floating point error, or being off by a small amount of money so
   * 1) split bill into integer part + decimal part.
   * 2) Divide integer part by 3. Round it down. Multiply by 3, find difference.
   * 3) For decimal part, divide by 3, round it down, multiply by 3, find differences
   * 4) Add everything up, find total difference and distribute
   */
  let billsPerPerson = [];
  let integerPart = Math.floor(bill);
  let decimalPart = bill - integerPart;
  let dividedInteger = integerPart / n;
  decimalPart += dividedInteger - Math.floor(dividedInteger);

  for (let i = 0; i < n; i++) {
    billsPerPerson[i] =
      Math.floor(dividedInteger) +
      Math.round((decimalPart + Number.EPSILON) * 100) / 100;
  }

  return billsPerPerson;
}
/**Define function for day-weighted splitting*/
function dayWeightedSplit(person_days, bill, total_days) {
  /**
   * person_days = [[personID(int), number of days(int)]]
   * bill(float)
   * total_days(int) : number of total days to weight over
   */
  let person_bills = [];
  for (let i = 0; i < person_days.length; i++) {
    person_bills[i] = [
      person_days[i][0],
      Number(Number(bill) * (Number(person_days[i][1]) / Number(total_days))),
    ];
  }
  return person_bills;
}

/**Add event listeners to each input box for continuous error checking */
const eventListeners = ["change", "click", "focus"];
eventListeners.forEach(function (listener) {
  for (let i = 0; i < billInputElements.length; i++) {
    billInputElements[i].addEventListener(listener, (event) => {
      if (checkNumber(event.target.value)) {
        inputs[i] = event.target.value;
        // console.log(event.target.value);
        bill = 0.01 * Number(inputs[1]) + Number(inputs[0]);
      }
    });
  }
});

const numberOfPeopleElem = document.getElementById("people-input");
numberOfPeopleElem.addEventListener("change", function (event) {
  numberOfPeople = event.target.value;
  /**Also additionally add boxes for day-splitting */
  /**First remove all nodes */
  while (peopleDayInputDiv.firstChild) {
    peopleDayInputDiv.removeChild(peopleDayInputDiv.lastChild);
  }

  for (let i = 1; i <= event.target.value; i++) {
    let div = document.createElement("div");
    let label = document.createElement("label");
    label.for = "days-" + i;
    label.innerText = "Person " + i + ":";
    // label.textContent = "Person " + i + ":";
    let input = document.createElement("input");
    input.id = "days-" + i;
    input.value = 1;
    input.type = "number";
    input.min = 1;
    input["aria-labelledby"] = "days-" + i;
    div.appendChild(label);
    div.appendChild(input);
    input.addEventListener("change", function (dayEvent) {
      console.log(person_days);
      person_days[i - 1] = [
        i,
        Number(dayEvent.target.value) >= 1 ? Number(dayEvent.target.value) : 1,
      ];
    });
    peopleDayInputDiv.appendChild(div);
  }
});

/** Get the radio buttons for splitting */
document.addEventListener("DOMContentLoaded", function () {
  let radios = document.querySelectorAll('input[name="split"]');
  let divs = document.querySelectorAll(".container");

  radios.forEach(function (radio, index) {
    radio.addEventListener("change", function () {
      divs.forEach(function (div, i) {
        if (i === index) {
          div.style.display = "block";
        } else {
          div.style.display = "none";
        }
      });
    });
  });
});
/**Get all submit buttons */
let evenSplitBtn = document.getElementById("even-split-btn");
let daySplitBtn = document.getElementById("day-weighted-split-btn");
const days = document.getElementById("days-weighted");
const daysResult = document.getElementById("people-day-result");
evenSplitBtn.addEventListener("click", function () {
  let result = evenSplit(bill, numberOfPeople);
  document.getElementById("even-split-result").innerText = result;
});
daySplitBtn.addEventListener("click", function () {
  console.log(person_days);

  while (daysResult.firstChild) {
    daysResult.removeChild(daysResult.lastChild);
  }
  let result = dayWeightedSplit(person_days, Number(bill), Number(days.value));
  console.log(result);

  for (let i = 0; i < result.length; i++) {
    let p = document.createElement("p");
    p.innerText = `Person ${result[i][0]}: ${result[i][1]}`;
    daysResult.appendChild(p);
  }
});
