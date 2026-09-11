# Regular Expression to DFA Converter

A web-based **Theory of Computation** project that converts a given **Regular Expression (RE)** into a **Deterministic Finite Automaton (DFA)**.

The project demonstrates the conversion process:

**Regular Expression → NFA → DFA → String Acceptance**

---

## Project Overview

The **Regular Expression to DFA Converter** is an interactive web application designed to help students understand and visualize the conversion of regular expressions into finite automata.

Users can enter a valid regular expression, generate the corresponding DFA, view its transition table and states, and test whether a given input string is accepted or rejected by the generated DFA.

---

## Features

* Enter a Regular Expression
* Convert Regular Expression to NFA
* Convert NFA to DFA
* Generate DFA transition table
* Display DFA states
* Identify start state
* Identify final/accepting states
* Test strings using the generated DFA
* Display Accepted / Rejected result
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

### Concepts

* Regular Expressions
* Finite Automata
* ε-NFA
* NFA
* DFA
* State Transitions
* Subset Construction
* String Acceptance

---

## Supported Regular Expression Concepts

The converter can be designed to work with common regular expression operators such as:

| Operator      | Meaning     | Example    |     |    |
| ------------- | ----------- | ---------- | --- | -- |
| `             | `           | OR / Union | `a  | b` |
| `*`           | Kleene Star | `a*`       |     |    |
| `+`           | One or more | `a+`       |     |    |
| `()`          | Grouping    | `(a        | b)` |    |
| Concatenation | Sequence    | `ab`       |     |    |

> Note: Supported operators depend on the implementation of the current version.

---

## Example

### Input

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

The generated DFA can then be used to test strings.

### Test String

```text
abb
```

### Result

```text
Accepted
```

Another example:

```text
abab
```

### Result

```text
Rejected
```

---

## DFA Transition Table

The application generates a transition table similar to:

| State | a  | b  |
| ----- | -- | -- |
| q0    | q1 | q0 |
| q1    | q1 | q2 |
| q2    | q1 | q3 |
| q3    | q1 | q0 |

The exact states and transitions depend on the entered regular expression.

---

## String Testing

After generating the DFA, users can enter an input string.

The application processes the string symbol by symbol using the DFA transition table.

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

> The actual structure may vary depending on the project implementation.

---

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/ShraddhaDusane/regular-expression-to-dfa.git
```

### 2. Open the Project

```bash
cd regular-expression-to-dfa
```

### 3. Run the Application

Since this is a frontend web application, you can open:

```text
index.html
```

directly in your browser.

For the best development experience, use **Visual Studio Code + Live Server**.

---

## GitHub Pages Deployment

This project can be deployed using **GitHub Pages**.

### Steps

1. Push the project to GitHub.
2. Open the repository.
3. Go to:

```text
Settings → Pages
```

4. Under **Build and deployment**, select:

```text
Deploy from a branch
```

5. Select:

```text
main
```

6. Select:

```text
/ (root)
```

7. Click **Save**.

Your website will be available at:

```text
https://YOUR_USERNAME.github.io/regular-expression-to-dfa/
```

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
* Frontend development
* JavaScript programming
* Problem solving

---

## Future Enhancements

Possible improvements include:

* Visual NFA generation
* Animated DFA construction
* Graphical state diagram
* Step-by-step conversion
* Support for more regular expression operators
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
* Demonstrating String Acceptance

---

## Screenshots

Add screenshots of your application here:

```text
docs/
├── home.png
├── dfa-table.png
├── dfa-visualization.png
└── string-testing.png
```

Example:

```markdown
![Home Page](docs/home.png)


![DFA Transition Table](docs/dfa-table.png)

![String Testing](docs/string-testing.png)
```

---

## Project Status

**Status:** Completed / Academic Mini Project

---

## Author

### Shraddha Dusane

Computer Science and Engineering Student

Interested in:

* Software Development
* Artificial Intelligence
* Cybersecurity
* Web Development
* Computer Science Projects

---

## Acknowledgement

This project was developed as part of a **Theory of Computation** academic project to practically understand Regular Expressions, NFA, DFA, and string acceptance.

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
