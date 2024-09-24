# web-automation

Small web automation projects for fun and experiments.

The scripts are written in TypeScript and uses Puppeteer, a powerful library for controlling headless browsers.

To run the scripts, you need to have `Node.js` and `npm` installed.

## Setup

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Update the config files in the respective project folders
4. Run `npm run build` to build the project (this will create a `dist` folder with the compiled JavaScript files)

## Running the scripts
1. Run `npm run start` to start. 
2. You will be presented with choices for which script to run. Select the desired script from the available options.
3. Follow the prompts or instructions specific to the chosen script.

Note: Make sure you have configured any necessary settings or files for the specific script you want to run.


## Sub Projects

### WOS Gift Claim

This is designed to automate the process of claiming gifts from a game called "Whiteout: Survival". 

#### Features

1. **Player ID Management**: It can manage multiple player IDs, useful for different accounts or characters.
1. **Gift Code Management**: The script can handle multiple gift codes, allowing you to claim gifts from different events or promotions.

#### Usage

1. See `config.json.sample` file in the `wos-gift-claim` folder with the following structure
1. Rename the file to `config.json`
1. Edit the file to set the player IDs and gift codes you want to claim
1. Run the script

