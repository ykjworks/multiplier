# Specification

# Overview

Web-based game that helps students master multiplication and division facts

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
18. Support a hint mode via a small link to the right of the answer submit button. If clicked/tapped, or if the user types an "h" in the answer box or even when answer box is not focused, reveal the values in cells above and below, left and right of the answer cell (2-4 cells depending on placement. Scroll window to hint location and reset focus to answer box (without scrolling back up). Display a "?" in the answer cell.
19. A "Skip (S)" button floats to the right of the Submit button in the question box. It only appears after a configurable delay (in seconds) once a question is shown. Clicking it or pressing S on the keyboard (when the button is visible) proceeds as if the question was answered incorrectly.
20. The skip delay is configurable via the Options popup with the label "Time before skip offered (sec)", persisted in browser storage.
21. A question mode dropdown appears in the scoreboard panel above the Options button. It has three options — Multiplication, Division, and Mixed — defaulting to Multiplication. The selection is persisted in browser storage.
22. In Multiplication mode, each question presents "a × b = ?" and expects the product as the answer. Both the row (a) and column (b) are highlighted, and the hint reveals the four neighboring cells around the answer cell.
23. In Division mode, each question selects a pair (a, b) and randomly designates one as the divisor. The question is presented as "a×b ÷ divisor = ?", expecting the quotient (the other factor) as the answer. Only the divisor's row or column is highlighted. On reveal, the quotient's row or column label is highlighted green (correct) or red (wrong). The hint reveals the two neighboring cells along the divisor's axis.
24. In Mixed mode, each question is independently and randomly chosen to be either a multiplication or division question with equal probability.
