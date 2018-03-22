import React, { Component } from "react";
import ButtonGrid from "./components/button-grid.jsx";
import "./app.scss";

// Priority determines the order of operations. Lower number is higher priority.
// Associativity indicates how operators of the same priority should be grouped.
const OPERATIONS = {
  "+": {
    priority: 4,
    associativity: "left",
    operation: (valueA, valueB) => valueA + valueB
  },
  "-": {
    priority: 4,
    associativity: "left",
    operation: (valueA, valueB) => valueA - valueB
  },
  "/": {
    priority: 3,
    associativity: "left",
    operation: (valueA, valueB) => valueA / valueB
  },
  "*": {
    priority: 3,
    associativity: "left",
    operation: (valueA, valueB) => valueA * valueB
  },
  "^": {
    priority: 2,
    associativity: "right",
    operation: (valueA, valueB) => Math.pow(valueA, valueB)
  },
  "√": {
    priority: 2,
    associativity: "left",
    operation: (valueA, valueB) => Math.sqrt(valueB)
  }
};

// List of keys to include in the body of the calculator
const BUTTON_KEYS = [
  "C",
  "(",
  ")",
  "/",
  "^",
  "7",
  "8",
  "9",
  "*",
  "√",
  "4",
  "5",
  "6",
  "-",
  "",
  "1",
  "2",
  "3",
  "+",
  "",
  "0",
  "",
  ".",
  "=",
  ""
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayedValue: ""
    };

    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.calculate = this.calculate.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleButtonClick(button) {
    switch (button) {
      case "C":
        this.clearCalc();
        break;
      case "=":
        this.calculate();
        break;
      default:
        this.handleInput(button);
    }
  }

  handleInput(button) {
    const newString = this.state.displayedValue.concat(button);
    this.setState({ displayedValue: newString });
  }

  clearCalc() {
    this.setState({
      displayedValue: ""
    });
  }

  convertToReversePolishNotation() {
    const outputStack = [];
    const operatorStack = [];
    // Converts the displayed string into an array, splitting by operators and brackets
    const inputStack = this.state.displayedValue.split(/([\+\-\√\*\/\^\(\)])/);
    const operators = Object.keys(OPERATIONS);

    // IMPORTANT: To fully understand this, look into the Shunting Yard Algorithm

    // Iterate through all tokens in the inputStack
    inputStack.forEach((token, index) => {
      // If token is a number, push it to the output stack
      if (Number(token)) {
        outputStack.push(token);
      }
      // If token is an operator, push it to the operator stack
      if (operators.includes(token)) {
        let operatorToCompareTo = operatorStack[operatorStack.length - 1];

        // While there's an operator on top of the stack with higher priority,
        // pop operators from the stack onto the output
        while (
          operatorStack.length > 0 &&
          this.shouldPushOperators(token, operatorToCompareTo)
        ) {
          outputStack.push(operatorStack.pop());
          operatorToCompareTo = operatorStack[operatorStack.length - 1];
        }

        // If there are no operators on top of the stack with higher priority,
        // push the operator onto the stack
        operatorStack.push(token);
      } else if (token === "(") {
        operatorStack.push(token);
      } else if (token === ")") {
        // Keep popping operators onto the output until the matching left
        // bracket is reached.
        while (operatorStack[operatorStack.length - 1] !== "(") {
          outputStack.push(operatorStack.pop());
        }
        // Removes left bracket from the stack
        operatorStack.pop();
      }
    });

    // Push remaining operators in the stack to the output
    while (operatorStack.length > 0) {
      outputStack.push(operatorStack.pop());
    }

    return outputStack;
  }

  calculate() {
    // Before calculating we need to convert infix notation to reverse polish
    let calcArray = this.convertToReversePolishNotation();
    const operators = Object.keys(OPERATIONS);

    // Iterate through the array until a final value is reached
    while (calcArray.length > 1) {
      // Find the first operator and perform the matching operation
      const operatorIndex = calcArray.findIndex(token => {
        return operators.includes(token);
      });
      const operator = calcArray[operatorIndex];
      const valA = Number(calcArray[operatorIndex - 2]);
      const valB = Number(calcArray[operatorIndex - 1]);
      const calculatedVal = OPERATIONS[operator].operation(valA, valB);

      // Insert the calculated value back into the array and remove the values
      // and operator used in the calculation
      let itemsToRemove = 3;
      let splicePos = operatorIndex - 2;
      if (operator === "√") {
        itemsToRemove = 2;
        splicePos = operatorIndex - 1;
      }
      calcArray.splice(splicePos, itemsToRemove, calculatedVal);
    }

    this.setState({ displayedValue: calcArray[0].toString() });
  }

  // Determines whether operators should be pushed to the stack
  shouldPushOperators(currentOperator, comparisonOperator) {
    if (comparisonOperator === "(") {
      return false;
    }
    const isLowerPriority =
      OPERATIONS[currentOperator].priority >
      OPERATIONS[comparisonOperator].priority;

    const isEqualPriority =
      OPERATIONS[currentOperator].priority ===
      OPERATIONS[comparisonOperator].priority;

    const shouldPush =
      isLowerPriority ||
      (isEqualPriority &&
        OPERATIONS[comparisonOperator].associativity === "left");

    return shouldPush ? true : false;
  }

  handleBackSpace() {
    const { displayedValue } = this.state;
    const newString = displayedValue.substr(0, displayedValue.length - 1);
    debugger;
    this.setState({ displayedValue: newString });
  }

  handleKeyPress(event) {
    if (BUTTON_KEYS.includes(event.key)) {
      this.handleButtonClick(event.key);
    } else if (event.key === "Enter") {
      this.calculate();
    } else if (event.key === "Backspace" || event.key === "Delete") {
      this.handleBackSpace();
    }
  }

  render() {
    return (
      <div className="app-container">
        <div className="calculator-container">
          <div className="input-container">
            <input
              type="text"
              className="input-display"
              autoFocus
              onKeyDown={this.handleKeyPress}
              value={this.state.displayedValue}
            />
          </div>
          <ButtonGrid
            buttons={BUTTON_KEYS}
            onButtonClick={this.handleButtonClick}
          />
        </div>
      </div>
    );
  }
}
export default App;
