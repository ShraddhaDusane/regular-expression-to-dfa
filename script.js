/* =========================================================
   AUTOMATALAB
   REGEX → DFA CONVERTER

   Algorithm:
   1. Tokenization
   2. Explicit concatenation
   3. Infix → Postfix
   4. Thompson NFA
   5. Epsilon Closure
   6. Subset Construction
   7. Complete DFA
   8. SVG Visualization
   9. DFA Simulation
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentDFA = null;

let currentNFA = null;

let currentRegex = "";

let currentPostfix = "";

let nfaStateCounter = 0;

let zoomLevel = 1;


/* =========================================================
   DOM HELPER
   ========================================================= */

function $(selector) {

    return document.querySelector(selector);

}


function $$(selector) {

    return [...document.querySelectorAll(selector)];

}


/* =========================================================
   CONSTANT
   ========================================================= */

const EPSILON = "ε";


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(text, success = true) {

    $("#statusText").textContent = text;

    const dot = document.querySelector(".status-dot");

    if (success) {

        dot.style.background = "#17b26a";

    } else {

        dot.style.background = "#d92d20";

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    const box = $("#errorBox");

    box.textContent = message;

    box.classList.remove("hidden");

    setStatus("Conversion error", false);

}


function clearError() {

    $("#errorBox").classList.add("hidden");

    setStatus("Ready", true);

}


/* =========================================================
   TOKENIZATION
   ========================================================= */

function tokenize(regex) {

    const cleaned = regex.replace(/\s+/g, "");

    if (!cleaned) {

        throw new Error(
            "Please enter a regular expression."
        );

    }

    const tokens = [];

    const chars = [...cleaned];

    for (let i = 0; i < chars.length; i++) {

        const char = chars[i];


        /*
         * Valid symbols:
         * letters
         * numbers
         * underscore
         */

        if (
            /[A-Za-z0-9_]/.test(char)
        ) {

            tokens.push(char);

            continue;

        }


        /*
         * Epsilon
         */

        if (char === EPSILON) {

            tokens.push(char);

            continue;

        }


        /*
         * Empty language symbol
         */

        if (char === "∅") {

            tokens.push(char);

            continue;

        }


        /*
         * Operators
         */

        if (
            char === "|" ||
            char === "*" ||
            char === "+" ||
            char === "?" ||
            char === "(" ||
            char === ")" ||
            char === "·"
        ) {

            tokens.push(char);

            continue;

        }


        throw new Error(
            `Unsupported symbol "${char}".`
        );

    }


    return tokens;

}


/* =========================================================
   TOKEN TYPE
   ========================================================= */

function isOperand(token) {

    return (
        /^[A-Za-z0-9_]$/.test(token) ||
        token === EPSILON ||
        token === "∅"
    );

}


function isOperator(token) {

    return (
        token === "|" ||
        token === "·"
    );

}


function isPostfixOperator(token) {

    return (
        token === "*" ||
        token === "+" ||
        token === "?"
    );

}


/* =========================================================
   CONCATENATION
   ========================================================= */

function canEndExpression(token) {

    return (
        isOperand(token) ||
        token === ")" ||
        isPostfixOperator(token)
    );

}


function canStartExpression(token) {

    return (
        isOperand(token) ||
        token === "("
    );

}


function insertConcatenation(tokens) {

    const result = [];

    for (let i = 0; i < tokens.length; i++) {

        const current = tokens[i];

        const next = tokens[i + 1];

        result.push(current);

        if (
            next !== undefined &&
            canEndExpression(current) &&
            canStartExpression(next)
        ) {

            result.push("·");

        }

    }

    return result;

}


/* =========================================================
   OPERATOR PRECEDENCE
   ========================================================= */

function precedence(operator) {

    switch (operator) {

        case "|":
            return 1;

        case "·":
            return 2;

        case "*":
        case "+":
        case "?":
            return 3;

        default:
            return 0;

    }

}


/* =========================================================
   INFIX → POSTFIX
   ========================================================= */

function toPostfix(tokens) {

    const output = [];

    const stack = [];


    for (const token of tokens) {

        /*
         * Operand
         */

        if (isOperand(token)) {

            output.push(token);

            continue;

        }


        /*
         * Opening parenthesis
         */

        if (token === "(") {

            stack.push(token);

            continue;

        }


        /*
         * Closing parenthesis
         */

        if (token === ")") {

            let foundOpening = false;

            while (stack.length > 0) {

                const top = stack.pop();

                if (top === "(") {

                    foundOpening = true;

                    break;

                }

                output.push(top);

            }

            if (!foundOpening) {

                throw new Error(
                    "Mismatched parentheses."
                );

            }

            continue;

        }


        /*
         * Postfix operators
         */

        if (
            token === "*" ||
            token === "+" ||
            token === "?"
        ) {

            output.push(token);

            continue;

        }


        /*
         * Binary operators
         */

        if (
            token === "|" ||
            token === "·"
        ) {

            while (
                stack.length > 0 &&
                stack[stack.length - 1] !== "(" &&
                precedence(
                    stack[stack.length - 1]
                ) >= precedence(token)
            ) {

                output.push(stack.pop());

            }

            stack.push(token);

        }

    }


    /*
     * Empty remaining stack
     */

    while (stack.length > 0) {

        const top = stack.pop();

        if (top === "(") {

            throw new Error(
                "Mismatched parentheses."
            );

        }

        output.push(top);

    }


    return output;

}


/* =========================================================
   NFA STATE
   ========================================================= */

function createNFAState() {

    return {

        id: nfaStateCounter++,

        edges: []

    };

}


/* =========================================================
   NFA EDGE
   ========================================================= */

function addEdge(
    from,
    to,
    symbol
) {

    from.edges.push({

        to: to,

        symbol: symbol

    });

}


/* =========================================================
   THOMPSON NFA
   ========================================================= */

function postfixToNFA(postfix) {

    nfaStateCounter = 0;

    const stack = [];


    function popFragment() {

        if (stack.length === 0) {

            throw new Error(
                "Invalid regular expression."
            );

        }

        return stack.pop();

    }


    for (const token of postfix) {


        /* ---------------------------------------------
           NORMAL SYMBOL
           --------------------------------------------- */

        if (isOperand(token)) {

            const start =
                createNFAState();

            const end =
                createNFAState();


            if (token !== "∅") {

                addEdge(
                    start,
                    end,
                    token
                );

            }


            stack.push({

                start,
                end

            });

            continue;

        }


        /* ---------------------------------------------
           UNION
           --------------------------------------------- */

        if (token === "|") {

            const right =
                popFragment();

            const left =
                popFragment();


            const start =
                createNFAState();

            const end =
                createNFAState();


            addEdge(
                start,
                left.start,
                EPSILON
            );


            addEdge(
                start,
                right.start,
                EPSILON
            );


            addEdge(
                left.end,
                end,
                EPSILON
            );


            addEdge(
                right.end,
                end,
                EPSILON
            );


            stack.push({

                start,
                end

            });

            continue;

        }


        /* ---------------------------------------------
           CONCATENATION
           --------------------------------------------- */

        if (token === "·") {

            const right =
                popFragment();

            const left =
                popFragment();


            addEdge(
                left.end,
                right.start,
                EPSILON
            );


            stack.push({

                start: left.start,

                end: right.end

            });

            continue;

        }


        /* ---------------------------------------------
           KLEENE STAR
           --------------------------------------------- */

        if (token === "*") {

            const fragment =
                popFragment();


            const start =
                createNFAState();

            const end =
                createNFAState();


            addEdge(
                start,
                fragment.start,
                EPSILON
            );


            addEdge(
                start,
                end,
                EPSILON
            );


            addEdge(
                fragment.end,
                fragment.start,
                EPSILON
            );


            addEdge(
                fragment.end,
                end,
                EPSILON
            );


            stack.push({

                start,
                end

            });

            continue;

        }


        /* ---------------------------------------------
           ONE OR MORE
           --------------------------------------------- */

        if (token === "+") {

            const fragment =
                popFragment();


            const start =
                createNFAState();

            const end =
                createNFAState();


            addEdge(
                start,
                fragment.start,
                EPSILON
            );


            addEdge(
                fragment.end,
                fragment.start,
                EPSILON
            );


            addEdge(
                fragment.end,
                end,
                EPSILON
            );


            stack.push({

                start,
                end

            });

            continue;

        }


        /* ---------------------------------------------
           OPTIONAL
           --------------------------------------------- */

        if (token === "?") {

            const fragment =
                popFragment();


            const start =
                createNFAState();

            const end =
                createNFAState();


            addEdge(
                start,
                fragment.start,
                EPSILON
            );


            addEdge(
                start,
                end,
                EPSILON
            );


            addEdge(
                fragment.end,
                end,
                EPSILON
            );


            stack.push({

                start,
                end

            });

            continue;

        }

    }


    if (stack.length !== 1) {

        throw new Error(
            "Invalid regular expression."
        );

    }


    return stack[0];

}


/* =========================================================
   EPSILON CLOSURE
   ========================================================= */

function epsilonClosure(states) {

    const closure = new Set(states);

    const stack = [...states];


    while (stack.length > 0) {

        const state = stack.pop();


        for (const transition of state.edges) {

            if (
                transition.symbol === EPSILON &&
                !closure.has(transition.to)
            ) {

                closure.add(
                    transition.to
                );

                stack.push(
                    transition.to
                );

            }

        }

    }


    return closure;

}


/* =========================================================
   MOVE
   ========================================================= */

function move(states, symbol) {

    const result = new Set();


    for (const state of states) {

        for (
            const transition
            of state.edges
        ) {

            if (
                transition.symbol === symbol
            ) {

                result.add(
                    transition.to
                );

            }

        }

    }


    return result;

}


/* =========================================================
   SET KEY
   ========================================================= */

function stateSetKey(states) {

    return [...states]

        .map(
            state => state.id
        )

        .sort(
            (a, b) => a - b
        )

        .join(",");

}


/* =========================================================
   DFA CONSTRUCTION
   ========================================================= */

function nfaToDFA(
    nfa,
    alphabet
) {

    const startSet =
        epsilonClosure(
            new Set([nfa.start])
        );


    const startKey =
        stateSetKey(startSet);


    const stateMap =
        new Map();


    const queue = [];


    stateMap.set(

        startKey,

        {

            id: 0,

            set: startSet,

            accepting:
                startSet.has(
                    nfa.end
                ),

            transitions: {}

        }

    );


    queue.push(startKey);


    while (queue.length > 0) {

        const key = queue.shift();

        const dfaState =
            stateMap.get(key);


        for (
            const symbol
            of alphabet
        ) {

            const moved =
                move(
                    dfaState.set,
                    symbol
                );


            const closure =
                epsilonClosure(
                    moved
                );


            /*
             * Empty transition
             */

            if (closure.size === 0) {

                continue;

            }


            const targetKey =
                stateSetKey(
                    closure
                );


            if (
                !stateMap.has(
                    targetKey
                )
            ) {

                stateMap.set(

                    targetKey,

                    {

                        id:
                            stateMap.size,

                        set:
                            closure,

                        accepting:
                            closure.has(
                                nfa.end
                            ),

                        transitions: {}

                    }

                );


                queue.push(
                    targetKey
                );

            }


            dfaState.transitions[
                symbol
            ] =
                stateMap.get(
                    targetKey
                ).id;

        }

    }


    const states =
        [...stateMap.values()];


    /*
     * Complete DFA with trap state
     */

    let trapState = null;

    let requiresTrap = false;


    for (const state of states) {

        for (
            const symbol
            of alphabet
        ) {

            if (
                state.transitions[
                    symbol
                ] === undefined
            ) {

                requiresTrap = true;

            }

        }

    }


    if (requiresTrap) {

        trapState = {

            id: states.length,

            set: new Set(),

            accepting: false,

            transitions: {}

        };


        for (
            const symbol
            of alphabet
        ) {

            trapState.transitions[
                symbol
            ] =
                trapState.id;

        }


        states.push(
            trapState
        );


        for (const state of states) {

            for (
                const symbol
                of alphabet
            ) {

                if (
                    state.transitions[
                        symbol
                    ] === undefined
                ) {

                    state.transitions[
                        symbol
                    ] =
                        trapState.id;

                }

            }

        }

    }


    return {

        states,

        start: 0,

        alphabet,

        trapStateId:
            trapState
                ? trapState.id
                : null

    };

}


/* =========================================================
   GET ALPHABET
   ========================================================= */

function getAlphabet(tokens) {

    const symbols = new Set();


    for (const token of tokens) {

        if (
            /^[A-Za-z0-9_]$/.test(token)
        ) {

            symbols.add(token);

        }

    }


    return [...symbols].sort();

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   LAYOUT
   ========================================================= */

function calculateLayout(dfa) {

    const count =
        dfa.states.length;


    const columns =
        Math.max(
            2,
            Math.ceil(
                Math.sqrt(
                    count * 1.4
                )
            )
        );


    const rows =
        Math.ceil(
            count / columns
        );


    const spacingX = 180;

    const spacingY = 140;


    const width =
        Math.max(
            760,
            columns * spacingX
        );


    const height =
        Math.max(
            380,
            rows * spacingY
        );


    const nodes = [];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const row =
            Math.floor(
                i / columns
            );

        const column =
            i % columns;


        nodes.push({

            ...dfa.states[i],

            x:
                90 +
                column *
                spacingX,

            y:
                80 +
                row *
                spacingY

        });

    }


    return {

        nodes,

        width,

        height

    };

}


/* =========================================================
   SVG DFA RENDERER
   ========================================================= */

function renderDFA(dfa) {

    const layout =
        calculateLayout(dfa);


    const nodes =
        layout.nodes;


    const nodeMap =
        new Map(
            nodes.map(
                node => [
                    node.id,
                    node
                ]
            )
        );


    let svg = `

<svg
    id="dfaSVG"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${layout.width} ${layout.height}"
>

<defs>

    <marker
        id="arrow"
        markerWidth="10"
        markerHeight="10"
        refX="8"
        refY="4"
        orient="auto"
    >

        <path
            d="M0,0 L8,4 L0,8 Z"
            fill="#64748b"
        />

    </marker>

</defs>

`;


    /* =====================================================
       GROUP TRANSITIONS
       ===================================================== */

    const transitionGroups = {};


    for (
        const state
        of nodes
    ) {

        for (
            const symbol
            of dfa.alphabet
        ) {

            const target =
                state.transitions[
                    symbol
                ];


            const key =
                `${state.id}->${target}`;


            if (
                !transitionGroups[key]
            ) {

                transitionGroups[key] = [];

            }


            transitionGroups[key]
                .push(symbol);

        }

    }


    /* =====================================================
       DRAW TRANSITIONS
       ===================================================== */

    for (
        const key
        of Object.keys(
            transitionGroups
        )
    ) {

        const [
            sourceId,
            targetId
        ] =
            key
                .split("->")
                .map(Number);


        const source =
            nodeMap.get(
                sourceId
            );


        const target =
            nodeMap.get(
                targetId
            );


        if (!source || !target) {

            continue;

        }


        const label =
            transitionGroups[
                key
            ].join(", ");


        let path;

        let labelX;

        let labelY;


        /* SELF LOOP */

        if (
            sourceId === targetId
        ) {

            path = `

M ${source.x - 24}
  ${source.y - 23}

C ${source.x - 75}
  ${source.y - 85},

  ${source.x + 75}
  ${source.y - 85},

  ${source.x + 24}
  ${source.y - 23}

`;


            labelX =
                source.x;


            labelY =
                source.y - 60;

        }


        /* NORMAL EDGE */

        else {

            const dx =
                target.x -
                source.x;


            const dy =
                target.y -
                source.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const ux =
                dx / distance;


            const uy =
                dy / distance;


            const startX =
                source.x +
                ux * 32;


            const startY =
                source.y +
                uy * 32;


            const endX =
                target.x -
                ux * 32;


            const endY =
                target.y -
                uy * 32;


            const perpendicularX =
                -uy * 20;


            const perpendicularY =
                ux * 20;


            const controlX =
                (
                    startX +
                    endX
                ) / 2 +
                perpendicularX;


            const controlY =
                (
                    startY +
                    endY
                ) / 2 +
                perpendicularY;


            path = `

M ${startX}
  ${startY}

Q ${controlX}
  ${controlY}

  ${endX}
  ${endY}

`;


            labelX =
                (
                    startX +
                    endX
                ) / 2 +
                perpendicularX * 1.5;


            labelY =
                (
                    startY +
                    endY
                ) / 2 +
                perpendicularY * 1.5;

        }


        svg += `

<path
    d="${path}"
    fill="none"
    stroke="#94a3b8"
    stroke-width="1.8"
    marker-end="url(#arrow)"
/>

<rect
    x="${labelX - 24}"
    y="${labelY - 11}"
    width="48"
    height="21"
    rx="6"
    fill="white"
    stroke="#e2e8f0"
/>

<text
    x="${labelX}"
    y="${labelY + 4}"
    text-anchor="middle"
    font-size="10"
    font-family="Inter"
    fill="#475569"
>
    ${escapeHTML(label)}
</text>

`;

    }


    /* =====================================================
       START ARROW
       ===================================================== */

    const startNode =
        nodeMap.get(
            dfa.start
        );


    if (startNode) {

        svg += `

<path
    d="
        M ${startNode.x - 75}
          ${startNode.y}

        L ${startNode.x - 37}
          ${startNode.y}
    "

    fill="none"

    stroke="#5b5ce2"

    stroke-width="2.5"

    marker-end="url(#arrow)"
/>

`;

    }


    /* =====================================================
       NODES
       ===================================================== */

    for (
        const node
        of nodes
    ) {

        let stroke =
            "#5b5ce2";


        if (
            node.accepting
        ) {

            stroke =
                "#14966f";

        }


        if (
            node.id ===
            dfa.trapStateId
        ) {

            stroke =
                "#d92d20";

        }


        svg += `

<circle
    cx="${node.x}"
    cy="${node.y}"
    r="31"

    fill="white"

    stroke="${stroke}"

    stroke-width="2.5"
/>

`;


        /* ACCEPTING DOUBLE CIRCLE */

        if (
            node.accepting
        ) {

            svg += `

<circle
    cx="${node.x}"
    cy="${node.y}"
    r="25"

    fill="none"

    stroke="${stroke}"

    stroke-width="1.7"
/>

`;

        }


        svg += `

<text
    x="${node.x}"
    y="${node.y + 5}"
    text-anchor="middle"

    font-size="13"

    font-family="Inter"

    font-weight="700"

    fill="#172033"
>

q${node.id}

</text>

`;


        /* START LABEL */

        if (
            node.id ===
            dfa.start
        ) {

            svg += `

<text
    x="${node.x}"
    y="${node.y + 51}"

    text-anchor="middle"

    font-size="9"

    font-family="Inter"

    fill="#667085"
>

START

</text>

`;

        }


        /* TRAP LABEL */

        if (
            node.id ===
            dfa.trapStateId
        ) {

            svg += `

<text
    x="${node.x}"
    y="${node.y + 51}"

    text-anchor="middle"

    font-size="9"

    font-family="Inter"

    fill="#d92d20"
>

TRAP

</text>

`;

        }

    }


    svg += `

</svg>

`;


    $("#diagram").innerHTML =
        svg;


    const svgElement =
        $("#dfaSVG");


    svgElement.style.transform =
        `scale(${zoomLevel})`;


    svgElement.style.transformOrigin =
        "center center";


    $("#zoomText").textContent =
        `${Math.round(
            zoomLevel * 100
        )}%`;

}


/* =========================================================
   TABLE RENDERER
   ========================================================= */

function renderTable(dfa) {

    const table =
        $("#dfaTable");


    let html = `

<thead>

<tr>

<th>State</th>

<th>Type</th>

`;


    for (
        const symbol
        of dfa.alphabet
    ) {

        html += `

<th>
    ${escapeHTML(symbol)}
</th>

`;

    }


    html += `

</tr>

</thead>

<tbody>

`;


    for (
        const state
        of dfa.states
    ) {

        let stateClass =
            "";


        if (
            state.id ===
            dfa.start
        ) {

            stateClass =
                "start-state";

        }


        if (
            state.id ===
            dfa.trapStateId
        ) {

            stateClass =
                "trap-state";

        }


        let typeText =
            "Normal";


        let typeClass =
            "";


        if (
            state.accepting
        ) {

            typeText =
                "Accept";

            typeClass =
                "accept-state";

        }


        if (
            state.id ===
            dfa.trapStateId
        ) {

            typeText =
                "Trap";

        }


        html += `

<tr>

<td class="${stateClass}">
    q${state.id}
</td>

<td class="${typeClass}">
    ${typeText}
</td>

`;


        for (
            const symbol
            of dfa.alphabet
        ) {

            html += `

<td>
    q${state.transitions[symbol]}
</td>

`;

        }


        html += `

</tr>

`;

    }


    html += `

</tbody>

`;


    table.innerHTML =
        html;

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics(dfa) {

    $("#alphabetStat").textContent =
        dfa.alphabet.length
            ? dfa.alphabet.join(", ")
            : "ε";


    $("#statesStat").textContent =
        dfa.states.length;


    $("#acceptStat").textContent =
        dfa.states.filter(
            state =>
                state.accepting
        ).length;


    $("#transitionStat").textContent =
        dfa.states.length *
        dfa.alphabet.length;

}


/* =========================================================
   CONVERSION DETAILS
   ========================================================= */

function updateDetails(
    regex,
    postfix,
    nfa,
    dfa
) {

    $("#detailRegex").textContent =
        regex;


    $("#detailPostfix").textContent =
        postfix.join(" ");


    $("#detailNFA").textContent =
        `${nfaStateCounter} states — Thompson NFA`;


    $("#detailDFA").textContent =
        `${dfa.states.length} states — Subset Construction`;

}


/* =========================================================
   MAIN CONVERSION
   ========================================================= */

function convertRegex() {

    clearError();


    try {

        const regex =
            $("#regexInput")
                .value
                .trim();


        if (!regex) {

            throw new Error(
                "Please enter a regular expression."
            );

        }


        /*
         * STEP 1
         * Tokenize
         */

        const tokens =
            tokenize(regex);


        /*
         * STEP 2
         * Add explicit concatenation
         */

        const withConcat =
            insertConcatenation(
                tokens
            );


        /*
         * STEP 3
         * Infix → postfix
         */

        const postfix =
            toPostfix(
                withConcat
            );


        /*
         * STEP 4
         * Thompson NFA
         */

        const nfa =
            postfixToNFA(
                postfix
            );


        /*
         * STEP 5
         * Alphabet
         */

        const alphabet =
            getAlphabet(
                tokens
            );


        /*
         * STEP 6
         * NFA → DFA
         */

        const dfa =
            nfaToDFA(
                nfa,
                alphabet
            );


        /*
         * Save globally
         */

        currentRegex =
            regex;


        currentPostfix =
            postfix;


        currentNFA =
            nfa;


        currentDFA =
            dfa;


        /*
         * Render
         */

        renderDFA(dfa);

        renderTable(dfa);

        updateStatistics(dfa);

        updateDetails(
            regex,
            postfix,
            nfa,
            dfa
        );


        /*
         * Reset simulator
         */

        $("#testResult").className =
            "test-result idle";


        $("#testResult").textContent =
            "Enter a string and simulate it.";


        $("#trace").innerHTML =
            "";


        setStatus(
            "Converted successfully",
            true
        );

    }

    catch (error) {

        currentDFA =
            null;

        showError(
            error.message
        );

    }

}


/* =========================================================
   STRING SIMULATION
   ========================================================= */

function simulateString() {

    if (!currentDFA) {

        convertRegex();

        if (!currentDFA) {

            return;

        }

    }


    const input =
        $("#testInput")
            .value;


    const dfa =
        currentDFA;


    let currentState =
        dfa.start;


    const trace =
        [currentState];


    /*
     * Empty string
     */

    if (input.length === 0) {

        const accepted =
            dfa.states[
                currentState
            ].accepting;


        displaySimulationResult(
            accepted,
            currentState,
            trace
        );


        return;

    }


    /*
     * Process each character
     */

    for (
        const character
        of [...input]
    ) {

        /*
         * Character not in alphabet
         */

        if (
            !dfa.alphabet.includes(
                character
            )
        ) {

            $("#testResult")
                .className =
                "test-result reject";


            $("#testResult")
                .textContent =
                `Rejected: symbol "${character}" is not in the DFA alphabet.`;


            renderTrace(
                trace
            );


            return;

        }


        currentState =
            dfa.states[
                currentState
            ].transitions[
                character
            ];


        trace.push(
            currentState
        );

    }


    const accepted =
        dfa.states[
            currentState
        ].accepting;


    displaySimulationResult(
        accepted,
        currentState,
        trace
    );

}


/* =========================================================
   SIMULATION RESULT
   ========================================================= */

function displaySimulationResult(
    accepted,
    state,
    trace
) {

    const result =
        $("#testResult");


    if (accepted) {

        result.className =
            "test-result accept";


        result.textContent =
            `Accepted ✓ — the DFA finished in q${state}.`;

    }

    else {

        result.className =
            "test-result reject";


        result.textContent =
            `Rejected ✕ — the DFA finished in q${state}.`;

    }


    renderTrace(
        trace
    );

}


/* =========================================================
   TRACE
   ========================================================= */

function renderTrace(trace) {

    const container =
        $("#trace");


    let html = "";


    trace.forEach(
        (state, index) => {

            html += `

<span class="trace-state">
    q${state}
</span>

`;


            if (
                index <
                trace.length - 1
            ) {

                html += `

<span class="trace-arrow">
    →
</span>

`;

            }

        }
    );


    container.innerHTML =
        html;

}


/* =========================================================
   CSV EXPORT
   ========================================================= */

function exportCSV() {

    if (!currentDFA) {

        alert(
            "Please generate a DFA first."
        );

        return;

    }


    const dfa =
        currentDFA;


    const rows = [];


    rows.push([

        "State",

        "Type",

        ...dfa.alphabet

    ]);


    for (
        const state
        of dfa.states
    ) {

        rows.push([

            `q${state.id}`,

            state.accepting
                ? "Accept"
                : "Normal",

            ...dfa.alphabet.map(
                symbol =>
                    `q${state.transitions[symbol]}`
            )

        ]);

    }


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            cell =>
                                `"${String(cell)
                                    .replace(
                                        /"/g,
                                        '""'
                                    )}"`
                        )
                        .join(",")
            )
            .join("\n");


    downloadFile(

        "dfa-transition-table.csv",

        csv,

        "text/csv"

    );

}


/* =========================================================
   SVG EXPORT
   ========================================================= */

function exportSVG() {

    if (!currentDFA) {

        alert(
            "Please generate a DFA first."
        );

        return;

    }


    const svg =
        $("#dfaSVG");


    if (!svg) {

        return;

    }


    const clone =
        svg.cloneNode(true);


    clone.style.transform =
        "none";


    const serializer =
        new XMLSerializer();


    const source =
        serializer.serializeToString(
            clone
        );


    downloadFile(

        "dfa.svg",

        source,

        "image/svg+xml"

    );

}


/* =========================================================
   DOWNLOAD HELPER
   ========================================================= */

function downloadFile(
    filename,
    content,
    type
) {

    const blob =
        new Blob(
            [content],
            {
                type
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        500
    );

}


/* =========================================================
   CLEAR
   ========================================================= */

function clearAll() {

    $("#regexInput").value =
        "";


    $("#testInput").value =
        "";


    currentDFA =
        null;


    currentNFA =
        null;


    currentRegex =
        "";


    currentPostfix =
        "";


    $("#diagram").innerHTML = `

<div class="empty-diagram">

    <div class="empty-icon">
        Σ
    </div>

    <h3>
        DFA will appear here
    </h3>

    <p>
        Enter a regular expression and click Convert.
    </p>

</div>

`;


    $("#dfaTable").innerHTML = `

<thead>

<tr>

<th>
    State
</th>

<th>
    Type
</th>

</tr>

</thead>

<tbody>

<tr>

<td colspan="2">
    No DFA generated
</td>

</tr>

</tbody>

`;


    $("#alphabetStat").textContent =
        "—";


    $("#statesStat").textContent =
        "—";


    $("#acceptStat").textContent =
        "—";


    $("#transitionStat").textContent =
        "—";


    $("#detailRegex").textContent =
        "—";


    $("#detailPostfix").textContent =
        "—";


    $("#detailNFA").textContent =
        "—";


    $("#detailDFA").textContent =
        "—";


    $("#testResult").className =
        "test-result idle";


    $("#testResult").textContent =
        "Enter a string and simulate it.";


    $("#trace").innerHTML =
        "";


    clearError();

}


/* =========================================================
   ZOOM IN
   ========================================================= */

function zoomIn() {

    zoomLevel =
        Math.min(
            1.8,
            zoomLevel + 0.1
        );


    if (currentDFA) {

        renderDFA(
            currentDFA
        );

    }

}


/* =========================================================
   ZOOM OUT
   ========================================================= */

function zoomOut() {

    zoomLevel =
        Math.max(
            0.6,
            zoomLevel - 0.1
        );


    if (currentDFA) {

        renderDFA(
            currentDFA
        );

    }

}


/* =========================================================
   FIT
   ========================================================= */

function fitDiagram() {

    zoomLevel =
        1;


    if (currentDFA) {

        renderDFA(
            currentDFA
        );

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const buttons =
        $$(".nav-button");


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        btn =>
                            btn.classList
                                .remove(
                                    "active"
                                )
                    );


                    button.classList.add(
                        "active"
                    );


                    const section =
                        button.dataset.section;


                    $$(".page-section")
                        .forEach(
                            page =>
                                page.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    $(
                        `#${section}`
                    ).classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   EXAMPLE BUTTONS
   ========================================================= */

function setupExamples() {

    $$("[data-example]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        $("#regexInput")
                            .value =
                            button.dataset.example;


                        convertRegex();

                    }
                );

            }
        );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function setupKeyboard() {

    $("#regexInput")
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    convertRegex();

                }

            }
        );


    $("#testInput")
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    simulateString();

                }

            }
        );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initialize() {

    $("#convertButton")
        .addEventListener(
            "click",
            convertRegex
        );


    $("#testButton")
        .addEventListener(
            "click",
            simulateString
        );


    $("#clearButton")
        .addEventListener(
            "click",
            clearAll
        );


    $("#exportCSV")
        .addEventListener(
            "click",
            exportCSV
        );


    $("#exportSVG")
        .addEventListener(
            "click",
            exportSVG
        );


    $("#zoomIn")
        .addEventListener(
            "click",
            zoomIn
        );


    $("#zoomOut")
        .addEventListener(
            "click",
            zoomOut
        );


    $("#fitButton")
        .addEventListener(
            "click",
            fitDiagram
        );


    setupNavigation();

    setupExamples();

    setupKeyboard();


    /*
     * Initial demo
     */

    convertRegex();

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);