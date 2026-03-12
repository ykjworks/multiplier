# Specification

# Overview

Web-based game that helps students master multiplication facts

# Detailed Requirements

1. Visually start with an empty 12x12 grid. Labels across top/bottom and left/right are the integers 1-12.
2. Each cell in the grid corresponds to the product of the row number and column number. Example: the value in the bottom right cell will correspond to 12x12==144.
3. The user will be able to set a timer (in minutes, default 4) and click a Start button to start the game and the timer.
4. Once the game starts, two integers (1-12) will be selected, call them a and b. The row corresponding to a and the column corresponding to b will be highlighted and the corresponding labels will be bolded and increased slightly in size.
5. When the row/column are highlighted, a floating div will be displayed (at a location that is above the grid but not over the highlighted row/column) that will state the problem "a x b = " (e.g. "12 x 12 = ") with a text field and a submission button.
6. As soon as the user hits the button or types the Enter key, all the numbers in the row/column will be displayed, with the answer bolded and made slightly larger.
7. To the right of the grid, a score tally will be kept update with the number of right and wrong guesses.
8. Before moving to the next question, display the correct answer in place of the prompt (e.g. "12 x 12 = 144") and prompt the user to hit Enter to continue the game.
9. When timer is running, change Start button to Stop and let the user end the game early. Once game is stopped, change back to Start.
10. On first load, use the area above the grid to display instructions on how to play.
11. When timer is not running, show all values in the grid.
12. Size the grid to 70% of the browser window (using 70vmin so it scales with the smaller of width/height).
13. Use 1.5rem font size for grid.
14. When game completes, show a message at the top like "Time's up! You completed 56 facts in 4 minutes and got 51 (91%) correct." and include a button to reset the grid (show all facts).
15. When game completes, show all the completed facts on the grid. If the most recent answer for a cell was correct, highlight in green. If not, highlight in red.
16. Support running in countdown mode (time set in advance) and stopwatch mode (no automatic game end, user has to press stop). This would be set in a popup options menu and be persisted across page reloads via browser storage.
17. Support disabling the countdown/stopwatch timer display as an option in the popup options menu (also persisted in browser storage). When selected, just display the message "Game in progress..." instead of the timer.
