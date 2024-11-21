# RETROSPECTIVE OF SPRINT 2 (Team 10)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done `6/6`
- Total points committed vs. done `23/23`
- Nr of hours planned vs. spent (as a team) `112h/113h 45m`

**Remember** a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#4_  | 4       | 8      | 6h         | 6h           |
| _#5_  | 11      | 8      | 16h        | 17h30m       |
| _#6_  | 4       | 1      | 3h30m      | 3h30m        |
| _#7_  | 8       | 2      | 12h        | 13h15m       |
| _#8_  | 8       | 1      | 9h30m      | 9h30m        |
| _#9_  | 10      | 3      | 16h        | 15h30m       |

- Hours per task average, standard deviation (estimate and actual)
  - estimate: `average: 1 hours 21 minutes` `standard deviation: 15 minutes`
  - actual: `average: 1 hours 24 minutes` `standard deviation: 17 minutes`
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = −0.0357 $$

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| =0.0588 $$

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated: `8h`
  - Total hours spent: `7h15m`
  - Nr of automated unit test cases `125 test cases into 20 test suits`
  - Coverage (if available) `only available for server tests: | 65.22% stmts | 44.88% branch | 61.23% funcs | 66.38% lines`
- E2E testing:
  - Total hours estimated: `11h30m`
  - Total hours spent: `12h45m`
- Code review
  - Total hours estimated `10h`
  - Total hours spent `9h30m`

## ASSESSMENT

- What caused your errors in estimation (if any)?

  - `The majority are small estimation errors.`
  - `The main problem is that we didn't know the exact difficulty of one of the tasks (Story 7) until we started working on it.`

- What lessons did you learn (both positive and negative) in this sprint?

  - `The main lesson learned in this sprint is to be organized from the start is a great help for handling the work during the sprint and it helps to finish sooner so we have time to test it and look for bugs.`

- Which improvement goals set in the previous retrospective were you able to achieve?
  - `Good communication.`
- Which ones you were not able to achieve? Why?
- `Finish exactly when we had planned to. `

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > - Improving designing and decrease bugs on front-end.
  > - All the work should be ready one day before the demo.

- One thing you are proud of as a Team!!
  > - In the end we are satisfied about how the demo works and we are eager to fix the problems emerged in the demo.
