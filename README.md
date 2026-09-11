# Regular Expression to DFA Converter

A web-based **Theory of Computation** project that converts a given **Regular Expression (RE)** into a **Deterministic Finite Automaton (DFA)**.

The project demonstrates the conversion process:

**Regular Expression → NFA → DFA → String Acceptance**

---

## Project Overview

The **Regular Expression to DFA Converter** is an interactive web application designed to help students understand and visualize the conversion of regular expressions into finite automata.

Users can enter a valid regular expression, generate the corresponding DFA, view its transition table and states, and test whether a given input string is accepted or rejected.

---

## Features

* Regular Expression input
* Regular Expression to NFA conversion
* NFA to DFA conversion
* DFA transition table generation
* DFA state visualization
* Start state identification
* Final/accepting state identification
* Input string testing
* Accepted / Rejected result
* Interactive and user-friendly UI
* Input validation and error handling
* Responsive web interface

---

## Conversion Process

The application follows these major steps:

```text
Regular Expression
        ↓
   RE Processing
        ↓
       NFA
        ↓
 NFA → DFA Conversion
        ↓
       DFA
        ↓
 Transition Table
        ↓
 String Testing
        ↓
 Accepted / Rejected
```

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Theory of Computation Concepts

* Regular Expressions
* Regular Languages
* Finite Automata
* NFA
* DFA
* State Transitions
* Subset Construction
* String Acceptance

---

## Supported Regular Expression Operators

| Operator      | Meaning     | Example  |
| ------------- | ----------- | -------- |
| `\|`          | OR / Union  | `a\|b`   |
| `*`           | Kleene Star | `a*`     |
| `+`           | One or more | `a+`     |
| `()`          | Grouping    | `(a\|b)` |
| Concatenation | Sequence    | `ab`     |

> **Note:** The supported operators depend on the current implementation of the converter.

---

## Example

### Regular Expression

```text
(a|b)*abb
```

### Conversion

```text
Regular Expression
       ↓
      NFA
       ↓
      DFA
```

The generated DFA can then be used to test input strings.

### Test String

```text
abb
```

### Result

```text
Accepted
```

Another test string:

```text
abab
```

### Result

```text
Rejected
```

---

## DFA Transition Table

The application generates a DFA transition table based on the entered regular expression.

Example format:

| State | a  | b  |
| ----- | -- | -- |
| q0    | q1 | q0 |
| q1    | q1 | q2 |
| q2    | q1 | q3 |
| q3    | q1 | q0 |

> The actual states and transitions are generated dynamically according to the input regular expression.

---

## String Testing

After generating the DFA, users can enter an input string to check whether it is accepted by the generated automaton.

The application processes the input string symbol by symbol using the DFA transition table.

```text
Start State
     ↓
 Read Symbol
     ↓
Find Transition
     ↓
Next State
     ↓
Read Next Symbol
     ↓
Final State?
   ↙       ↘
 Yes       No
 ↓          ↓
Accepted   Rejected
```

---

## Project Structure

```text
regular-expression-to-dfa/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── assets/
    ├── images/
    └── icons/
```

> The project structure may vary depending on the current implementation.

---

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/ShraddhaDusane/regular-expression-to-dfa.git
```

### 2. Navigate to the Project

```bash
cd regular-expression-to-dfa
```

### 3. Run the Application

Open `index.html` directly in a web browser.

For development, you can use **Visual Studio Code with the Live Server extension**.

---

## Live Demo

**GitHub Pages:**

https://ShraddhaDusane.github.io/regular-expression-to-dfa/

> Replace the URL above with the actual GitHub Pages URL if GitHub provides a different URL.

---

## Screenshots

### Home Page

![Home Page](https://github.com/user-attachments/assets/a8411c43-4035-44c3-aed1-0a4eb62c1b78)

### DFA Transition Table

![DFA Transition Table](https://github.com/user-attachments/assets/c7959fa7-bb26-4233-b47e-13a6de6ba198)

### String Testing

![String Testing](https://github.com/user-attachments/assets/d9ecfd6b-2ad4-4ca0-8a6e-bf22dec4b2f3)

---

## Learning Outcomes

This project helped in understanding:

* Regular Languages
* Regular Expressions
* NFA construction
* DFA construction
* Subset Construction Algorithm
* State transitions
* Automata theory
* String acceptance
* JavaScript programming
* Frontend development
* Problem solving

---

## Future Enhancements

* Visual NFA generation
* Animated DFA construction
* Graphical state diagram
* Step-by-step conversion
* Support for additional regular expression operators
* Export DFA as an image
* Export transition table as PDF
* Dark/Light theme
* Improved mobile responsiveness
* Conversion history
* Interactive automata simulation

---

## Use Cases

This project can be useful for:

* Theory of Computation practicals
* Automata demonstrations
* College mini projects
* Learning Regular Expressions
* Understanding NFA and DFA conversion
* Demonstrating string acceptance

---

## Project Status

**Completed**

---

## Author

### Shraddha Dusane

Computer Science and Engineering Student

**Areas of Interest:**

* Software Development
* Artificial Intelligence
* Cybersecurity
* Web Development
* Computer Science

---

## Acknowledgement

This project was developed as part of a **Theory of Computation** academic project to practically understand Regular Expressions, NFA, DFA, state transitions, and string acceptance.

---

## License

This project is created for **educational and academic purposes**.

---

## Keywords

```text
Regular Expression
Regex
DFA
NFA
Automata
Finite Automata
Theory of Computation
Regular Language
JavaScript
HTML
CSS
Web Application
String Acceptance
Subset Construction
```

---

**If you find this project useful, consider giving the repository a ⭐ on GitHub!**
