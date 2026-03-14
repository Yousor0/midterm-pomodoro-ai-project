## Transcript Highlights

### 1. Planning the features (Session 1, early)

Before writing any code, I asked Claude to help me come up with ideas and features of the pomodoro timer, I personally came up with the styling. After asking it for help coming up with ideas I went back in to ask it to refine the features and ideas for the next session.

### 2. Setting up the Timer (Session 2, early)

To get started with the most basic feature of this application, I asked Claude Code to help me build primary feature of this project, which was the timer. The issue with this is that after it removed the about page from the first iteration of the project for Week 7 it was no where to be found, and the box for the terminal was also too small, so I asked it to update it. However, I still had to go in manually to specify which size I wanted.

### 3. Setting up & debugging session tracking and streaks

I asked Claude Code to make me the session tracking and data feature that was saved in localhost, I could not figure out how to keep track of the sessions and streaks so I asked it ot give me methods to test it. I told it to look back at the code to find any errors, and it was implemented a UTC vs local data mismatch fix.

### 4. Fixed UI Clarity Issues

Originally the AI used Emoji's do display the "P" in the task list, however that gave clarity and scalability issues when the number is larger, so we replaced it with a numbered display instead of showing the number of emojis. The next change I made was to move the stats to another tab just like the about for user flow, and allow the user to focus.

### 5. Bug Fixing Config

In the config / user settings for the timer, when I reduced the number in the settings from 25 to 10 and updat it, there is an error message that says: "repeat count must be non-negative". This issue was fixed by prompting the exact error message nad the situation it happened in. The error it found was that APPLY_DURATIONS intentionally skips updating timeLeft when the timer is running.
