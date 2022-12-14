import { cardDeck } from "./cardSet.js";

//dom elements
const div = document.querySelector(".div");
const get_cards = document.querySelector(".get-cards");
const show_result = document.querySelector(".show-result");
const replay = document.querySelector(".replay");
const main_wrapper = document.querySelector(".main-wrapper");
const resultDom = document.querySelector(".result");
const botsCard = document.querySelector(".botsCard");
const yourCard = document.querySelector(".yourCard");
const deck = document.querySelector(".deck");
const blind = document.querySelector("#blind");
const winnerName = document.querySelector("#winnerName");
const setName = document.querySelector("#setName");
const YOU = document.querySelector(".you");
const BOT = document.querySelector(".bot");
const DRAW = document.querySelector(".draw");
const calculatingDom = document.querySelector(".calc");
const resultImgs = document.querySelector(".resultImgs");
let pressed = false;
let isShowResult = false;
const cardRenderSound = new Audio("../assets/sounds/swish.m4a");
const winSound = new Audio("../assets/sounds/winSound.mp3");
const loseSound = new Audio("../assets/sounds/loseSound.mp3");
const drawSound = new Audio("../assets/sounds/drawSound.mp3");

//variables

let playerCardSet = [];
let botCardSet = [];
let playerScore = {};
let botScore = {};
let array = [];
let result = {};
let youwon = 0;
let botwon = 0;
let draw = 0;

//event listeners

//get cards btn logic
get_cards.addEventListener("click", async () => {
  if (!pressed) {
    pressed = true;
    array = await promiseWraper(() => CardArrayMaker());
    await promiseWraper(() => distribute(array));
    blind.classList.remove("d-none");
    renderCards(playerCardSet, yourCard, 1000);
    renderCards(botCardSet, botsCard, 0);
    playerScore = await promiseWraper(() => setScore(playerCardSet));
    botScore = await promiseWraper(() => setScore(botCardSet));
    result = await promiseWraper(() => calculateResult(playerScore, botScore));
    ({ player: playerCardSet, bot: botCardSet });
  }
});

//show result btn logic
show_result.addEventListener("click", async () => {
  if (!isShowResult) {
    isShowResult = true;
    blind.classList.add("d-none");
    botsCard.classList.remove("d-none");
    get_cards.classList.add("d-none");
    show_result.classList.add("d-none");
    replay.classList.remove("d-none");
    await sleep(500);
    calculatingDom.classList.remove("d-none");
    deck.classList.add("load");
    await sleep(1500);
    calculatingDom.classList.add("d-none");
    deck.classList.remove("load");
    main_wrapper.classList.add("d-none");

    showResult(result);
    resultDom.classList.remove("d-none");
  }
});

//reset all

replay.addEventListener("click", async () => {
  await promiseWraper(() => {
    playerCardSet = [];
    botCardSet = [];
    playerScore = {};
    botScore = {};
    array = [];
    result = {};
    yourCard.innerHTML = "";
    botsCard.innerHTML = "";
    winnerName.innerHTML = "";
    setName.innerHTML = "";
    resultImgs.innerHTML = "";
    pressed = false;
    isShowResult = false;
    botsCard.classList.add("d-none");
  });
  resultDom.classList.add("d-none");
  get_cards.classList.remove("d-none");
  show_result.classList.remove("d-none");
  replay.classList.add("d-none");
  main_wrapper.classList.remove("d-none");
});

//sleep function
let sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

//ramdom number
function randomNumber(num) {
  let number = Math.floor(Math.random() * num);
  return number;
}

//selecting cards
function CardArrayMaker() {
  let numberArray = [];
  let cardArray = [];
  while (numberArray.length < 7) {
    let number = randomNumber(52);
    if (numberArray.indexOf(number) === -1) numberArray.push(number);
  }
  cardArray = [];
  for (let i = 0; i < 6; i++) {
    let card = cardDeck[numberArray[i]];
    cardArray.push(card);
  }
  return cardArray;
}

//distribute cards to players

function distribute(arr) {
  for (let i = 0; i < 3; i++) {
    playerCardSet.push(arr[i]);
  }
  for (let j = 3; j < 6; j++) {
    botCardSet.push(arr[j]);
  }
}
function showResult(result) {
  const { name, msg } = result;

  if (name === "You won") {
    youwon++;
    YOU.innerHTML = youwon;
    forloop(playerCardSet, resultImgs);
    winSound.play();
  } else if (name === "Bot won") {
    botwon++;
    BOT.innerHTML = botwon;
    forloop(botCardSet, resultImgs);
    loseSound.play();
  } else {
    draw++;
    DRAW.innerHTML = draw;
    forloop(playerCardSet, resultImgs);
    resultImgs.innerHTML += `<h4>Cards are equivalent</h4>`;
    forloop(botCardSet, resultImgs);
    drawSound.play();
  }
  winnerName.innerHTML = name;
  setName.innerHTML = msg;
}
//render cards

async function renderCards(arr, dom, ms) {
  for (let card of arr) {
    const { value, set } = card;
    const src = `${value.toString() + set}.png`;
    const htmlMarkup = `
    
    <img src="./assets/CARDS/${src}" alt=""></img>`;
    cardRenderSound.play();
    await promiseWraper(() => (dom.innerHTML += htmlMarkup));
    await sleep(ms);
  }
}

function forloop(arr, dom) {
  for (let card of arr) {
    const { value, set } = card;
    const src = `${value.toString() + set}.png`;
    const htmlMarkup = `
    <img src="./assets/CARDS/${src}" alt=""></img>`;
    dom.innerHTML += htmlMarkup;
  }
}

//promise wraper function
let promiseWraper = (work) => {
  return new Promise((resolve, reject) => {
    resolve(work());
  });
};

//checking for conditions and setting score
function setScore(CardSet) {
  let scoreObject = {};
  let [cardOne, cardTwo, cardThree] = CardSet;
  let { value: valueOne, set: setOne, card: card1 } = cardOne;
  let { value: valueTwo, set: setTwo, card: card2 } = cardTwo;
  let { value: valueThree, set: setThree, card: card3 } = cardThree;
  let numArray = [valueOne, valueTwo, valueThree];
  let largest = valueOne;
  let smallest = valueOne;
  let middle = valueOne;
  for (let data of numArray) {
    if (largest < data) {
      largest = data;
    }
    if (smallest > data) {
      smallest = data;
    }
  }
  for (let data of numArray) {
    if (data > smallest && data < largest) {
      middle = data;
    }
  }

  //major card condition
  scoreObject = {
    majorCard: true,
    score: largest,
    second: middle,
    third: smallest,
  };

  //checking for duo
  if (
    valueOne === valueTwo ||
    valueTwo === valueThree ||
    valueOne === valueThree
  ) {
    if (valueOne === valueTwo) {
      scoreObject = { duo: true, score: valueOne, second: valueThree };
    } else if (valueOne === valueThree) {
      scoreObject = { duo: true, score: valueOne, second: valueTwo };
    } else {
      scoreObject = { duo: true, score: valueTwo, second: valueOne };
    }
  }

  //checking for color
  if (setOne === setTwo && setTwo === setThree) {
    scoreObject = {
      colore: true,
      score: largest,
      second: middle,
      third: smallest,
    };
  }

  //checking for sequence

  //1. checking for ace 2 3
  let tempval1 = valueOne;
  let tempval2 = valueTwo;
  let tempval3 = valueThree;
  if (valueOne === 2 || valueTwo === 2 || valueThree === 2) {
    if (valueOne === 14 || valueTwo === 14 || valueThree === 14) {
      if (valueOne === 14) {
        tempval1 = 1;
      }
      if (valueTwo === 14) {
        tempval2 = 1;
      }
      if (valueThree === 14) {
        tempval3 = 1;
      }
    }
  }

  //check for sequence
  let arr = [tempval1, tempval2, tempval3];
  let templargest = tempval1;
  let tempsmallest = tempval1;
  let tempmiddle = tempval1;
  for (let i = 0; i < 3; i++) {
    if (templargest < arr[i]) {
      templargest = arr[i];
    }
    if (tempsmallest > arr[i]) {
      tempsmallest = arr[i];
    }
  }
  for (let i = 0; i < 3; i++) {
    if (arr[i] < templargest && arr[i] > tempsmallest) {
      tempmiddle = arr[i];
    }
  }
  let sm = tempsmallest + 1;
  let mm = tempmiddle + 1;
  if (sm === tempmiddle && mm === templargest) {
    //check for pure seqence
    if (cardOne.set === cardTwo.set && cardTwo.set === cardThree.set) {
      if (tempsmallest === 1) {
        scoreObject = { pureSequence: true, score: 14, second: 14, third: 14 };
      } else {
        scoreObject = {
          pureSequence: true,
          score: templargest,
          second: templargest,
          third: templargest,
        };
      }
      if (largest === 14 && middle === 13 && smallest === 12) {
        scoreObject = { pureSequenceOfAce: true };
      }
    } else {
      if (tempsmallest === 1) {
        scoreObject = {
          normalSequence: true,
          score: 14,
          second: 14,
          third: 14,
        };
      } else {
        scoreObject = {
          normalSequence: true,
          score: templargest,
          second: templargest,
          third: templargest,
        };
      }
      if (largest === 14 && middle === 13 && smallest === 12) {
        scoreObject = {
          normalSequence: true,
          score: 15,
          second: 15,
          third: 15,
        };
      }
    }
  }

  //checking for trio
  if (valueOne === valueTwo && valueTwo === valueThree) {
    let score = valueOne;
    scoreObject = { score: score, trio: true, second: score, third: score };
  }

  return scoreObject;
}

//comparing score and calculating result

function calculateResult(playerScore, botScore) {
  let winner = {};
  const {
    trio: trio_b,
    pureSequenceOfAce: pureSequenceOfAce_b,
    pureSequence: pureSequence_b,
    normalSequence: normalSequence_b,
    colore: colore_b,
    duo: duo_b,
    majorCard: majorCard_b,
  } = botScore;
  const {
    trio: trio_p,
    pureSequenceOfAce: pureSequenceOfAce_p,
    pureSequence: pureSequence_p,
    normalSequence: normalSequence_p,
    colore: colore_p,
    duo: duo_p,
    majorCard: majorCard_p,
  } = playerScore;

  //trio
  if (trio_p || trio_b) {
    winner = ifElseWrapper(trio_p, trio_b, "Trio", playerScore, botScore);
    return winner;
  }

  //pureSequence of ace
  else if (pureSequenceOfAce_p || pureSequenceOfAce_b) {
    winner = ifElseWrapper(
      pureSequenceOfAce_p,
      pureSequenceOfAce_b,
      "Pure sequence of Ace",
      playerScore,
      botScore
    );
    return winner;
  }

  //pure sequence
  else if (pureSequence_p || pureSequence_b) {
    winner = ifElseWrapper(
      pureSequence_p,
      pureSequence_b,
      "Pure sequence",
      playerScore,
      botScore
    );
    return winner;
  }

  //normal sequence
  else if (normalSequence_p || normalSequence_b) {
    winner = ifElseWrapper(
      normalSequence_p,
      normalSequence_b,
      "Normal Sequence",
      playerScore,
      botScore
    );
    return winner;
  }

  //color
  else if (colore_p || colore_b) {
    winner = ifElseWrapper(colore_p, colore_b, "Color", playerScore, botScore);
    return winner;
  }

  //duo
  else if (duo_p || duo_b) {
    winner = ifElseWrapper(duo_p, duo_b, "Duo", playerScore, botScore);
    return winner;
  }
  // major card
  else if (majorCard_p || majorCard_b) {
    winner = ifElseWrapper(
      majorCard_p,
      majorCard_b,
      "Major Card",
      playerScore,
      botScore
    );
    return winner;
  }
}

function ifElseWrapper(cond_one, cond_Two, msg, playerScore, botScore) {
  let win = {};
  const { score: score_b, second: second_b, third: third_b } = botScore;
  const { score: score_p, second: second_p, third: third_p } = playerScore;
  let youWon = { name: "You won", msg: msg };
  let botWon = { name: "Bot won", msg: msg };
  if (cond_one && !cond_Two) {
    win = youWon;
    return win;
  } else if (!cond_one && cond_Two) {
    win = botWon;
    return win;
  } else {
    if (score_p > score_b) {
      win = youWon;
      return win;
    } else if (score_p < score_b) {
      win = botWon;
      return win;
    } else {
      if (second_p > second_b) {
        win = youWon;
        return win;
      } else if (second_p < second_b) {
        win = botWon;
        return win;
      } else {
        if (third_p > third_b) {
          win = youWon;
        } else if (third_p < third_b) {
          win = botWon;
          return win;
        } else {
          win = { name: "it's a Draw", msg: msg };
          return win;
        }
      }
    }
  }
}
