TEMPLATE FOR RETROSPECTIVE (Team 10)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done `3/4`
- Total points committed vs. done `7/15`
- Nr of hours planned vs. spent (as a team) `112h/106h 45m`

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed


### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |22       |        |43h 30m     |41h           |
| _#1_   |12       |2       |20h30m      |20h45m        |
| _#2_   |12       |3       |14h30m      |15h30m        |
| _#3_   |14       |2       |20h30m      |18h45m        |
| _#4_   |8        |8       |13h         |10h45m        |



- Hours per task average, standard deviation (estimate and actual)
  - estimate: `average: 1 hours 38 minutes` `standard deviation: 17 minutes`
  - actual: `average: 1 hours 34 minutes` `standard deviation: 15 minutes`
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = −0.0469 $$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| =0.0794 $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: `16h30m`
  - Total hours spent: `16h30m`
  - Nr of automated unit test cases `72 test cases into 12 test suits`
  - Coverage (if available) `only available for server tests: | 68.15% stmts | 56.15% branch | 58.97% funcs | 67.71% lines`
- E2E testing:
  - Total hours estimated: `4h`
  - Total hours spent: `3h`
- Code review 
  - Total hours estimated `8h30m`
  - Total hours spent `8h`
  


## ASSESSMENT

- What caused your errors in estimation (if any)? 
  - `The majority are small estimation errors.` 
  - `The main problem is that we estimated the main difficulty in story 4 while assigning the story points but the complexity of understading how the map and coordinates work is mainly in the story 3.`

- What lessons did you learn (both positive and negative) in this sprint? 
  - `The main lesson learned in this sprint is to be organized from the start is a great help for handling the work during the sprint.`

- Which improvement goals set in the previous retrospective were you able to achieve? 
  - `We improve our organization.`
  
- Which ones you were not able to achieve? Why?
- ` We are not satysfied with the level of the organization we achieved. `

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > - Improving team coordination between back-end team and front-end team.
  > - All the work should be ready one day before the demo.

- One thing you are proud of as a Team!!
  > - In the end we are satisfied about how the demo works and we are eager to fix the problems emerged in the demo.
