TEMPLATE FOR RETROSPECTIVE (Team 10)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done `4/4`
- Total points committed vs done `10/10`
- Nr of hours planned vs spent (as a team) `112h/111h15m`

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed


### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |39       |    -   |81h         |  81h30m      |
| _#19_  | 5       |2       |6h30m       |6h30m         |
| _#10_  | 8       |5       |13h         | 13h          |
| _#20_  | 5       |2       | 7h30m      |  6h45m       |
| _#14_  | 3       |1       |4h          |3h30m         |


- Hours per task (average, standard deviation)
  - estimate: `average: 1 hours 52 minutes` `standard deviation: 1 hours 48 minutes`
  - actual: `average: 1 hours 51 minutes` `standard deviation: 1 hours 50 minutes`
- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1
    $$\frac{\sum_i estimation_{task_i}}{\sum_i spent_{task_i}} - 1 = 0.006741573
     $$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated `4h`
  - Total hours spent `3h30m`
  - Nr of automated unit test cases
    - `157 tests`
    - `9 tests suites`
  - Coverage (if available) 
    - server test: 

      |  File   | % Statements | % Branches | % Functions | % Lines |
      |---------|--------------|------------|-------------|---------|
      | All     |     82.08    |    72.01   |    73.88    |   81.33 |

- E2E testing:
  - Total hours estimated `10h`
  - Total hours spent `9h30m`
- Code review 
  - Total hours estimated `4h`
  - Total hours spent `3h30m`
- Technical Debt management:
  - Strategy adopted
    - First we migrated from SQLite to MariaDB to have a more robust database and the ability to handle transactions better
    - Then we continued with the issues that had a worse rating in SonarCloud
  - Total hours estimated estimated at sprint planning  `14h`
  - Total hours spent `14h15m`

## ASSESSMENT

- What caused your errors in estimation (if any)?
  - Mainly our mistakes were in story number 20 and story number 14 where we didn't consider that most of the work for these new stories had already been implemented with the previous one and with fixing the issues, because we thought it would take less effort.

- What lessons did you learn (both positive and negative) in this sprint?
  - The main lesson we learned in this sprint is that being organized from the beginning is a great help in managing the work during the sprint and helps to finish it sooner, so we have time to test it and look for bugs. Also, good communication in the team helps a lot to get the work done faster.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  - We managed to improve team chemistry. 
  
- Which ones you were not able to achieve? Why?
  -   We couldn't finish the work two days before the demo, because the rework was time-consuming and had to be done sequentially.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - Improve the communication between frontend and backend.
  - All the work should be ready two days before the demo.

- One thing you are proud of as a Team!!
  - In the end we are satisfied with how the demo went and the final result. We are eager to fix the problems that emerged in the demo.