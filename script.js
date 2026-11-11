/**
 * ==============================================================================
 * MODERN CALCULATOR LOGIC (script.js)
 * ==============================================================================
 * 
 * HOW THIS CALCULATOR THINKS:
 * Think of the calculator as maintaining 4 pieces of "state" (memory):
 * 1. currentOperand:  The number you are currently typing.
 * 2. previousOperand: The number you typed before choosing an operator.
 * 3. operation:       The selected math operation (+, −, ×, ÷).
 * 4. shouldResetScreen: A flag (true/false) that tells us if the next number 
 *                       you press should wipe the screen or append to it.
 */

// ==========================================
// 1. STATE VARIABLES (The Memory)
// ==========================================
let currentOperand = '0';
let previousOperand = '';
let operation = null;
let shouldResetScreen = false;

// ==========================================
// 2. DOM ELEMENT REFERENCES (HTML Connections)
// ==========================================
// We grab the HTML elements we need to read from or update
const previousOperandTextElement = document.getElementById('previousOperand');
const currentOperandTextElement = document.getElementById('currentOperand');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const clearButton = document.querySelector('[data-action="clear"]');
const toggleSignButton = document.querySelector('[data-action="toggle-sign"]');
const percentButton = document.querySelector('[data-action="percent"]');
const equalsButton = document.querySelector('[data-action="calculate"]');

// ==========================================
// 3. CORE LOGIC FUNCTIONS
// ==========================================

/**
 * Resets the calculator back to its initial starting state.
 */
function clear() {
  currentOperand = '0';
  previousOperand = '';
  operation = null;
  shouldResetScreen = false;
  clearActiveOperatorStyles();
}

/**
 * Appends a digit or decimal point to the current number string.
 * We work with strings while typing so that clicking "5" then "2" becomes "52",
 * rather than doing math immediately.
 */
function appendNumber(number) {
  // If a calculation just finished or an operator was pressed, reset the screen
  if (shouldResetScreen) {
    currentOperand = '';
    shouldResetScreen = false;
  }

  // Prevent multiple decimal points (e.g., prevent "5.2.3")
  if (number === '.' && currentOperand.includes('.')) return;

  // If the screen currently shows just '0' and we type a non-decimal number, replace '0'
  if (currentOperand === '0' && number !== '.') {
    currentOperand = number;
  } else {
    currentOperand += number;
  }
}

/**
 * Selects an operation (+, −, ×, ÷).
 * If the user chains operations (e.g., "5 + 5 + 5"), it computes intermediate results.
 */
function chooseOperation(selectedOperator) {
  // If we already had an operator selected and user clicks another operator without
  // typing a new number, just switch the operator
  if (shouldResetScreen && operation !== null) {
    operation = selectedOperator;
    highlightActiveOperator(selectedOperator);
    return;
  }

  // If previous number exists, compute the intermediate result first
  if (previousOperand !== '') {
    compute();
  }

  operation = selectedOperator;
  previousOperand = currentOperand;
  shouldResetScreen = true;
  highlightActiveOperator(selectedOperator);
}

/**
 * Performs the arithmetic calculation based on previousOperand, currentOperand, and operation.
 */
function compute() {
  let computation;
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  // If either number is invalid, abort computation
  if (isNaN(prev) || isNaN(current)) return;

  // Execute arithmetic based on the operator symbol
  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
    case '−':
      computation = prev - current;
      break;
    case '×':
    case '*':
      computation = prev * current;
      break;
    case '÷':
    case '/':
      // Guard against division by zero!
      if (current === 0) {
        currentOperand = 'Error';
        previousOperand = '';
        operation = null;
        shouldResetScreen = true;
        clearActiveOperatorStyles();
        return;
      }
      computation = prev / current;
      break;
    default:
      return;
  }

  // Handle floating point inaccuracies (e.g., 0.1 + 0.2 = 0.30000000000000004)
  // We round to 12 decimal places to keep calculations clean and exact
  currentOperand = String(Math.round(computation * 1e12) / 1e12);
  operation = null;
  previousOperand = '';
  shouldResetScreen = true;
  clearActiveOperatorStyles();
}

/**
 * Toggles the sign of the current number (Positive <-> Negative).
 */
function toggleSign() {
  if (currentOperand === '0' || currentOperand === 'Error') return;
  currentOperand = String(parseFloat(currentOperand) * -1);
}

/**
 * Converts the current number into a percentage (divides by 100).
 */
function percentage() {
  if (currentOperand === 'Error') return;
  currentOperand = String(parseFloat(currentOperand) / 100);
}

// ==========================================
// 4. DISPLAY & FORMATTING HELPERS
// ==========================================

/**
 * Helper to format large numbers with commas (e.g., 1000000 -> 1,000,000)
 * while properly handling trailing decimals during input.
 */
function getDisplayNumber(numberString) {
  if (numberString === 'Error') return 'Error';

  const stringNumber = String(numberString);
  const integerDigits = parseFloat(stringNumber.split('.')[0]);
  const decimalDigits = stringNumber.split('.')[1];

  let integerDisplay;
  if (isNaN(integerDigits)) {
    integerDisplay = '';
  } else {
    // toLocaleString() adds localized commas
    integerDisplay = integerDigits.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  }

  // If a decimal exists, append it back with its digits
  if (decimalDigits != null) {
    return `${integerDisplay}.${decimalDigits}`;
  } else {
    return integerDisplay;
  }
}

/**
 * Updates both the previous-operand and current-operand text on screen.
 * Also dynamically shrinks font-size for long numbers so text never overflows!
 */
function updateDisplay() {
  currentOperandTextElement.innerText = getDisplayNumber(currentOperand);

  if (operation != null) {
    previousOperandTextElement.innerText = `${getDisplayNumber(previousOperand)} ${operation}`;
  } else {
    previousOperandTextElement.innerText = '';
  }

  // Dynamic font sizing for long numbers
  const length = currentOperand.length;
  if (length > 9) {
    currentOperandTextElement.style.fontSize = '2rem';
  } else if (length > 6) {
    currentOperandTextElement.style.fontSize = '2.5rem';
  } else {
    currentOperandTextElement.style.fontSize = '3.2rem';
  }
}

/**
 * Visual styling: Highlights the currently selected operator button.
 */
function highlightActiveOperator(opSymbol) {
  clearActiveOperatorStyles();
  operatorButtons.forEach(button => {
    if (button.dataset.operator === opSymbol) {
      button.classList.add('is-active');
    }
  });
}

/**
 * Visual styling: Removes highlight from all operator buttons.
 */
function clearActiveOperatorStyles() {
  operatorButtons.forEach(button => button.classList.remove('is-active'));
}

// ==========================================
// 5. EVENT LISTENERS (Handling User Input)
// ==========================================

// Handle Number Buttons (0-9 and .)
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    appendNumber(button.dataset.number);
    updateDisplay();
  });
});

// Handle Operator Buttons (+, −, ×, ÷)
operatorButtons.forEach(button => {
  button.addEventListener('click', () => {
    chooseOperation(button.dataset.operator);
    updateDisplay();
  });
});

// Handle Calculate / Equals (=)
equalsButton.addEventListener('click', () => {
  compute();
  updateDisplay();
});

// Handle All Clear (AC)
clearButton.addEventListener('click', () => {
  clear();
  updateDisplay();
});

// Handle Plus/Minus (±)
toggleSignButton.addEventListener('click', () => {
  toggleSign();
  updateDisplay();
});

// Handle Percentage (%)
percentButton.addEventListener('click', () => {
  percentage();
  updateDisplay();
});

// ==========================================
// 6. BONUS: KEYBOARD SUPPORT
// ==========================================
// Allows users to type using their computer keyboard!
window.addEventListener('keydown', (event) => {
  const key = event.key;

  // Numbers and decimal
  if ((key >= '0' && key <= '9') || key === '.') {
    appendNumber(key);
    updateDisplay();
  }

  // Operators
  if (key === '+') {
    chooseOperation('+');
    updateDisplay();
  }
  if (key === '-') {
    chooseOperation('-');
    updateDisplay();
  }
  if (key === '*') {
    chooseOperation('×');
    updateDisplay();
  }
  if (key === '/') {
    event.preventDefault(); // Prevents browser search shortcut
    chooseOperation('÷');
    updateDisplay();
  }

  // Enter or Equal to calculate
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    compute();
    updateDisplay();
  }

  // Escape to Clear
  if (key === 'Escape') {
    clear();
    updateDisplay();
  }

  // Backspace to delete the last digit
  if (key === 'Backspace') {
    if (currentOperand.length > 1 && currentOperand !== 'Error') {
      currentOperand = currentOperand.slice(0, -1);
    } else {
      currentOperand = '0';
    }
    updateDisplay();
  }
});

