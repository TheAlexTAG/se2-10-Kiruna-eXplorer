TEMPLATE FOR RETROSPECTIVE (Team ##)
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
- Nr of hours planned vs spent (as a team) `112h/113h`

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    47   |    -   |  79h25m    |       79h    |
| _#11_  |    3    |        |    2h30m   |     2h30m    |
| _#17_  |    3    |        |    3h30m   |     3h45m    |
| _#12_  |   10    |        |   17h30m   |    18h30m    |
| _#13_  |    7    |        |    9h30m   |     9h       |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |1h36m | 1h38m | 
| Actual     |1h37m | 1h40m |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.0089285714 $$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0,093333333 $$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated `3h30m` //ricordarsi spiegare
  - Total hours spent `4h`
  - Nr of automated unit test cases 
  - Coverage
- E2E testing:
  - Total hours estimated
  - Total hours spent
  - Nr of test cases
- Code review 
  - Total hours estimated 
  - Total hours spent
- Technical Debt management:
  - Strategy adopted
  - Total hours estimated estimated
  - Total hours spent
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

- What lessons did you learn (both positive and negative) in this sprint?

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
- Which ones you were not able to achieve? Why?

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

> Propose one or two

- One thing you are proud of as a Team!!
