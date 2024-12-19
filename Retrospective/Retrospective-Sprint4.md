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
| _#11_  |    3    |   1    |    2h30m   |     2h30m    |
| _#17_  |    3    |   1    |    3h30m   |     3h45m    |
| _#12_  |   10    |   5    |   17h30m   |    18h30m    |
| _#13_  |    7    |   3    |    9h30m   |     9h       |
   

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
  - Total hours estimated `3h30m`
  - Total hours spent `4h`
  - Nr of automated unit test cases 
    - `205 tests`
    - `9 tests suites`
  - Coverage
    - server test: 

      |  File   | % Statements | % Branches | % Functions | % Lines |
      |---------|--------------|------------|-------------|---------|
      | All     |     87.05    |    72.42   |    83.75    |   86.77 |

- E2E testing:
  - Total hours estimated `4h30m`
  - Total hours spent `4h`
  - Nr of test cases `5`
- Code review 
  - Total hours estimated `11h30m`
  - Total hours spent `11h15m`
- Technical Debt management:
  - Strategy adopted 
    We have resolved most of the issues identified by SonarCloud.
  - Total hours estimated estimated `14h`
  - Total hours spent `15h`
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
The errors in the planning estimates arise from the difficulty of accurately estimating technical debt due to the large number and variety of SonarCloud issues, and from estimating implementative tasks as if they were independent of the existing codebase, which is now significant.

- What lessons did you learn (both positive and negative) in this sprint?
In this sprint, I learned the importance of effective communication, collaboration, and planning. A well-structured plan helps manage time, ensures clarity on responsibilities, and allows us to tackle complex issues more efficiently.

- Which improvement goals set in the previous retrospective were you able to achieve? 
We were able to achieve the improvement goal of finding our balance as a group. By getting to know each other better on a personal level, we improved our teamwork and communication, allowing us to collaborate more effectively.
  
- Which ones you were not able to achieve? Why?
We weren't able to finish two days before the demo as we had hoped, but we've made progress. We completed the work the day before, although we still had to make some last-minute adjustments.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
Improve modularity by adding features without making significant changes to the existing structure.
Ensure all work is completed two days before the demo to allow time for final adjustments and testing.

- One thing you are proud of as a Team!!
I'm proud of my team for completing almost all the stories and achieving a great result. Moreover, we accomplished this without any conflicts, working together smoothly and harmoniously and maintaining a positive spirit throughout the sprint.
