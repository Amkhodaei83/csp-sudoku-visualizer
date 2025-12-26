
# 🧩 AI Sudoku & Jigsaw CSP Visualizer

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-Black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A powerful, interactive web application that visualizes **Constraint Satisfaction Problem (CSP)** algorithms solving Sudoku puzzles. 

Unlike standard solvers, this project visualizes the AI's "thought process" in real-time using Generator functions. It features an animated 3D robot companion that reacts emotionally to the algorithm's performance (celebrating wins, getting frustrated by backtracks, or thinking deeply).

🚀 **[Live Demo](https://amkhodaei83.github.io/csp-sudoku-visualizer)**

---

## 🖼️ Gallery

| **Jigsaw 6x6 Mode** | **Standard 9x9 Mode** |
|:---:|:---:|
| <img src="./jigsaw-mode.png" alt="Jigsaw Mode" width="100%"> | <img src="./standard-mode.png" alt="Standard Mode" width="100%"> |

> *The UI features a glassmorphism design with a reactive 3D robot built with React Three Fiber.*

---

## ✨ Key Features

### 🧠 Algorithmic Visualization
Watch the backtracking algorithm work in real-time with customizable heuristics:
*   **Backtracking Search:** The core recursive engine that explores the state space.
*   **MRV (Minimum Remaining Values):** A "fail-first" variable ordering heuristic that picks the cell with the fewest legal moves left.
*   **LCV (Least Constraining Value):** A value ordering heuristic that prefers numbers that rule out the fewest choices for neighbors.
*   **Forward Checking:** Proactively prunes the domains of neighboring cells to detect dead-ends early.
*   **AC-3 (Arc Consistency):** A powerful pre-processing algorithm that propagates constraints to drastically reduce the search space before guessing begins.

### 🎮 Game Modes
1.  **Jigsaw 6x6 (Homework):** Solves irregular "Squiggly" Sudoku puzzles where regions are not perfect squares. Includes dynamic map generation (Snake, Steps, Vertical, Horizontal).
2.  **Advanced 9x9:** Standard Sudoku generator with adjustable difficulty sliders (from Easy to Expert).

### 🤖 Interactive 3D Companion
*   A custom 3D Robot built with **Three.js** that tracks your mouse.
*   **Emotional State:** The robot reacts to the algorithm's status:
    *   🟡 **Thinking:** When processing nodes.
    *   🔴 **Frustrated/Angry:** When a backtrack or prune failure occurs.
    *   🟢 **Happy/Party:** When the puzzle is solved (confetti explosion!).
    *   🔵 **Surprised:** When high speed is selected.

---

## ⚙️ Tech Stack

*   **Frontend:** React 18, Vite
*   **3D Graphics:** React Three Fiber, Drei, Three.js
*   **State Management:** React Hooks (`useState`, `useRef`, `useReducer`)
*   **Styling:** Custom CSS (Glassmorphism), Framer Motion (Transitions)
*   **Icons:** Lucide React
*   **Algorithms:** Pure JavaScript (ES6+) implementation of CSP using Generator Functions (`function*`) for step-by-step visualization.

---

## 🧮 How It Works (The Logic)

This project models Sudoku as a **Constraint Satisfaction Problem (CSP)** defined by:
1.  **Variables:** The empty cells on the board.
2.  **Domains:** The possible numbers (e.g., 1-9) allowed in each cell.
3.  **Constraints:** No two cells in the same row, column, or region can share a value.

### The Visualization Loop
1.  **Generators:** The solver is written as a JavaScript Generator (`solveGenerator`). This allows the algorithm to `yield` its state (current board, domains, active cell) back to the UI loop without blocking the main thread.
2.  **Heuristics:**
    *   If **MRV** is on, the solver calculates the domain size of all empty cells and picks the smallest one.
    *   If **Forward Checking** is on, assigning a number immediately removes that number from the domains of all peers. If a peer's domain becomes empty, the branch is pruned immediately.

---

## 🚀 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Amkhodaei83/csp-sudoku-visualizer.git
    cd csp-sudoku-visualizer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## 📂 Project Structure

```text
src/
├── algorithms/       # Core Logic
│   ├── AC3.js        # Arc Consistency Algorithm (Pre-processing)
│   ├── CSP.js        # Class structure for variables/domains/constraints
│   ├── Heuristics.js # Logic for MRV and LCV
│   ├── Solver.js     # The main Backtracking generator
│   └── Generators.js # Puzzle creation logic (9x9 and Jigsaw)
├── components/       # React UI Components
│   ├── Board.js      # Grid rendering
│   ├── RobotCompanion.js # 3D Robot logic
│   ├── Controls.js   # Play/Pause/Speed buttons
│   └── theme/        # Layout and styling wrappers
├── data/             # Puzzle inputs and Jigsaw maps
└── pages/            # Main views (HomeworkPage, AdvancedPage)
```

## 🤝 Contributing

Contributions are welcome! If you have ideas for new heuristics (like Degree Heuristic) or performance optimizations, feel free to fork the repo and submit a PR.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
```

### Next Steps for you:
1.  **Add Screenshots:** Create a folder named `screenshots` in your root directory. Take a screenshot of your Jigsaw page and name it `jigsaw-mode.png`, and one of the 9x9 page named `standard-mode.png`. The README code above will automatically display them.
2.  **Commit:** Add the README to your repo and push it to GitHub. It will immediately render on your repository homepage.) puzzles.

🚀 **[Live Demo](https://amkhodaei83.github.io/csp-sudoku-visualizer)**

---

## 🖼️ Screenshots

| Standard 9x9 Solver | Jigsaw 6x6 Generator |
|:---:|:---:|
| <img src="https://i.imgur.com/screenshot1_placeholder.png" alt="9x9 Generator" width="400"/> | <img src="https://i.imgur.com/screenshot2_placeholder.png" alt="Jigsaw Generator" width="400"/> |

> *The visualizer features an animated robot companion that reacts to the algorithm's performance (thinking, frustrated, celebrating).*

---

## ✨ Key Features

### 🧠 Algorithmic Visualization
Watch the backtracking algorithm work in real-time with customizable heuristics:
*   **Backtracking Search:** The core engine that explores the state space.
*   **MRV (Minimum Remaining Values):** A "fail-first" variable ordering heuristic that picks the cell with the fewest legal moves.
*   **LCV (Least Constraining Value):** A value ordering heuristic that prefers numbers that rule out the fewest choices for neighbors.
*   **Forward Checking:** proactively prunes the domains of neighboring cells to detect dead-ends early.
*   **AC-3 (Arc Consistency):** A powerful pre-processing algorithm that propagates constraints to drastically reduce the search space before guessing begins.

### 🎮 Game Modes
1.  **Advanced 9x9:** Standard Sudoku generator with adjustable difficulty sliders.
2.  **Jigsaw 6x6:** Irregular "Squiggly" Sudoku where regions are not perfect squares. Includes a dynamic map generator.

### 🛠️ Interactive Controls
*   **Playback Control:** Play, Pause, Step Forward, Step Backward.
*   **Speed Slider:** Adjust the visualization speed from "Teaching Mode" to "Turbo".
*   **History Tracking:** Jump back in time to see where the algorithm made a decision.
*   **Performance Metrics:** Real-time tracking of **Nodes Expanded** and **Backtracks** to compare algorithmic efficiency.

---

## ⚙️ Tech Stack

*   **Frontend Framework:** React 18
*   **Build Tool:** Vite
*   **Animations:** Framer Motion & Lottie Files (Robot animations)
*   **Logic:** Pure JavaScript (ES6+) implementation of CSP algorithms
*   **State Management:** React Hooks (`useState`, `useRef`, `useReducer`)
*   **Icons:** Lucide React

---

## 🧮 How It Works (The Logic)

This project models Sudoku as a **Constraint Satisfaction Problem (CSP)** defined by:
1.  **Variables:** The empty cells on the board.
2.  **Domains:** The possible numbers (1-9) allowed in each cell.
3.  **Constraints:** No two cells in the same row, column, or region can share a value.

### The Solving Process
1.  **Generator:** A Python-like Javascript generator function (`function*`) yields the state of the board at every step.
2.  **Visualization Loop:** The React frontend consumes these yields to update the DOM, coloring cells based on their status:
    *   🟡 **Yellow:** Thinking / Active Cell
    *   🟢 **Green:** Tentative Assignment
    *   🔴 **Red:** Conflict / Backtrack
3.  **Heuristics:**
    *   If **MRV** is on, the solver calculates the domain size of all empty cells and picks the smallest one.
    *   If **Forward Checking** is on, assigning a number immediately removes that number from the domains of all peers. If a peer's domain becomes empty, the branch is pruned immediately.

---

## 🚀 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Amkhodaei83/csp-sudoku-visualizer.git
    cd csp-sudoku-visualizer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## 📂 Project Structure

```text
src/
├── algorithms/       # Core Logic
│   ├── AC3.js        # Arc Consistency Algorithm
│   ├── CSP.js        # Class structure for variables/domains
│   ├── Heuristics.js # MRV and LCV logic
│   ├── Solver.js     # The main Backtracking generator
│   └── Generators.js # Puzzle creation logic
├── components/       # React UI Components
│   ├── Board.js      # Grid rendering
│   ├── Controls.js   # Play/Pause/Speed buttons
│   └── Theme/        # Layout and Robot UI
├── data/             # Puzzle inputs and Jigsaw maps
└── pages/            # Main views (AdvancedPage, HomeworkPage)