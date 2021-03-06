# ÃBB Watcher

![Version 1 Image](screenshots/Version1.0.3.png)

## Features
- ð Select train from a list
- ð¯ Pass train number as direct (optional) argument
- ð List Last / Next and Final Stop
- ð Terminal Beep on station change
- ð¬ Display Planned and Actual Arrival/Departure time if they divert
- âï¸ Show delay
- â± Set custom update interval in seconds
## Install
`yarn install` to get all dependencies

## Run
- Run for all commands: `node index.js`  
- Run to select a train: `node index.js monitor`  
- Run directly for a specific train: `node index.js monitor RJX169`  

## Help

### index
```
Usage: index [options] [command]

Options:
  -v, --version              output the version number
  -h, --help                 display help for command

Commands:
  monitor [options] [train]  Monitor an ÃBB train
  help [command]             display help for command
```

### monitor
```
Usage: index monitor [options] [train]

Monitor an ÃBB train

Options:
  -i, --interval <time_in_s>  Update Interval in seconds
  -h, --help                  display help for command
```