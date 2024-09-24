import puppeteer, { Page, Browser } from 'puppeteer';
import config from './config.json';

let browser: Browser;

export const watchdog = {
  timeout: 10000,
  interval: 1000,
  maxRetries: 10,
  retryInterval: 1000,
  retryCount: 0,
  retryMax: 10,
  currentPlayerIndex: 0,
  currentGiftCodeIndex: 0,
}

export async function runForNextPlayer(){
  if(watchdog.currentPlayerIndex >= config.playerIds.length){
    return allDone();
  }
  watchdog.currentGiftCodeIndex = 0;

  const playerId = config.playerIds[watchdog.currentPlayerIndex];
  const page = (await browser.pages())[0];
  await login(playerId, page);
  
  await runForNextGiftCode(page);

  watchdog.currentPlayerIndex++;
  await logout(page);
  await runForNextPlayer();
}

export async function runForNextGiftCode(page: Page){
  console.log(`Running for player ${watchdog.currentPlayerIndex} gift code ${watchdog.currentGiftCodeIndex}`);
  if(watchdog.currentGiftCodeIndex >= config.giftCodes.length){
    return;
  }

  const giftCode = config.giftCodes[watchdog.currentGiftCodeIndex];
  await enterGiftCode(giftCode, page);
  watchdog.currentGiftCodeIndex++;

  // prevent suspicion due to too fast execution
  await new Promise(resolve => setTimeout(resolve, 1000));
  return runForNextGiftCode(page);
}

export async function main() {
  console.log('Starting Puppeteer...');
  
  browser = await puppeteer.launch({
    headless: false, // Show the browser window
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
    args: ['--window-size=1920,1080']
  });
  console.log('Viewport and window size set to 1920x1080');

  const page = (await browser.pages())[0];

  console.log(`Navigating to ${config.urls[0]}...`);
  await page.goto(config.urls[0]);
  const title = await page.title();
  console.log(`Page title: ${title}`);

  runForNextPlayer();

}

async function enterGiftCode(giftCode: string, page: Page) {
  const input = await page.$('input[placeholder="Enter Gift Code"]');
  if (!input) {
    console.log('Input field not found.');
    return;
  }
  await input.click({ clickCount: 3 });
  await input.press('Backspace');
  await input.type(giftCode);
  // Find the button with text "Confirm"
  const confirmButton = await page.$('div.exchange_btn');
  
  if (!confirmButton) {
    return console.log('Confirm button not found.');
  }
  console.log('Confirm button found. Clicking...');
  await confirmButton.click();
  
  // Wait for a short time to ensure any new elements have loaded
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Find the confirm button within the message modal
  const okMsgBtn = await page.$('div.message_modal div.confirm_btn');
  if (!okMsgBtn) {
    return console.log('okMsgBtn button not found.');
  }
  
  console.log('Confirm button found in message modal. Clicking...');
  await okMsgBtn.click();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Clicked confirm button.');
}

async function logout(page: Page){
  const logoutButton = await page.$('div.exit_con');
  if (!logoutButton) {
    return console.log('Logout button not found.');
  }
  
  console.log('Logout button found. Clicking...');
  await logoutButton.click();
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Clicked logout button.');
}

async function login(playerId: string, page: Page) {
  const input = await page.$('input[placeholder="Player ID"]');
  if (!input) {
    return console.log('Input field not found.');
  }
  await input.click({ clickCount: 3 });
  await input.press('Backspace');
  await input.type(playerId);
  
  const loginButton = await page.$('div.login_btn');
  
  if (!loginButton) {
    return console.log('Login button not found.');
  }
  console.log('Login button found. Clicking...');
  await loginButton.click();
  
  // Wait for a specific element that appears after successful login
  try {
    await page.waitForSelector('div.exit_con', { timeout: 10000 }); // Adjust timeout as needed
    console.log('Login successful. Logout button found.');
  } catch (error) {
    console.log('Login may have failed. Logout button not found after waiting.');
  }

  // Additional check for any error messages
  const errorMessage = await page.$('div.error-message');
  if (errorMessage) {
    console.log('Error message found after login attempt.');
    const errorText = await page.evaluate(el => el.textContent, errorMessage);
    console.log(`Error message: ${errorText}`);
  }

  // Log the current URL to help diagnose where we ended up
  console.log(`Current URL after login attempt: ${page.url()}`);
  
}


export async function allDone(){
  // Close the browser
  await browser.close();
  console.log('Browser closed. All Done.');
}
