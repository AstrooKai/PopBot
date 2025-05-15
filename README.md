# POPBOT

A customizable bot for [popcat.click](https://popcat.click/) that automatically sends pops to your chosen country.  
Supports both browser and Node.js automation.

---

## Features

### Node.js Version

- **Customizable Pops**: Set the number of pops sent per interval.
- **Max Pops Limit**: Option to stop after reaching a maximum number of total pops.
- **Country Code**: Set a two-letter country code to determine where the pops are sent.
- **Stats Tracking**: Optionally saves stats to `stats.json`.
- **Graceful Shutdown**: Handles shutdown signals and errors cleanly.
- **Cross-platform**: Works on Windows, macOS, and Linux.

### Browser Version

- **Customizable Pops**: Set the number of pops sent per interval.
- **Max Pops Limit**: Option to stop after reaching a maximum number of total pops.
- **Country Code**: Set a two-letter country code to determine where the pops are sent.
- **Debug Mode**: Toggle debug logs to trace the script's behavior.
- **Cookie Tracking**: Automatically tracks the number of pops in a `pop_count` cookie.

---

## How to Use

### Node.js Version

1. **Clone or Download the Repository**  
   Download or clone this repository to your computer.

2. **Install Dependencies**  
   Open a terminal in the project directory and run:
   ```
   npm install
   ```
   This will install [puppeteer](https://www.npmjs.com/package/puppeteer).

3. **Configure the Bot**  
   Edit `config.json` to set your desired options:
   ```json
   {
     "POP_AMOUNT": 800,
     "INTERVAL_MS": 30000,
     "COUNTRY": "PH",
     "DEBUG": true,
     "MAX_POPS": null,
     "ENABLE_STATS": true
   }
   ```
   - `POP_AMOUNT`: Number of pops sent per interval (default: 800)
   - `INTERVAL_MS`: Interval in milliseconds (default: 30000)
   - `COUNTRY`: Two-letter country code (default: "PH")
   - `DEBUG`: Enable debug logs (default: true)
   - `MAX_POPS`: Maximum total pops before stopping (set to `null` to disable)
   - `ENABLE_STATS`: Save stats to `stats.json` (default: true)

4. **Run the Bot**  
   In the terminal, run:
   ```
   node node.js
   ```

---

### Browser Version

1. **Open the POPCAT website**: Visit [https://popcat.click/](https://popcat.click/).
   
2. **Open Developer Tools**:
   - **Chrome/Firefox**: Press `Ctrl + Shift + I` (Windows/Linux) or `Cmd + Opt + I` (Mac) to open DevTools.
   - **Safari**: Press `Cmd + Opt + I`.

3. **Go to the Console tab**: Once the DevTools are open, navigate to the `Console` tab.

4. **Paste the Script**:
   - Copy the contents of the [`browser.js`](browser.js) file (or the [`browser-min.js`](browser-min.js) file for the minified version) from this repository.
   - Paste the script into the `Console` tab.

5. **Run the Script**: Press `Enter` to run the script. The bot will start sending pops automatically based on the configuration settings.

#### Browser Script Configuration

You can configure the browser script by modifying the `CONFIG` object within the script:

```javascript
const CONFIG = {
    POP_AMOUNT: 800,             // Number of pops sent per interval (default: 800)
    INTERVAL_MS: 30000,          // Interval in milliseconds (default: 30000)
    COUNTRY: 'PH',               // Set which country the pops should be sent to (default: 'PH')
    MAX_TOTAL_POPS: 100000,      // Set the maximum total pops. Set to null to disable stopping (default: 100000)
    DEBUG: true                  // Set to false to suppress debug/info logs in the console (default: true)
};
```

---

## Notes & Warnings

> [!NOTE]  
> This bot was written with assistance from AI services, intended to demonstrate the capabilities of AI in programming. It is not meant to devalue the skills or creativity of human programmers, but rather to showcase just how advanced AI tools have become in recent years. The goal is to inspire curiosity and highlight the potential for collaboration between humans and AI in software development, not to replace or diminish the important role of human expertise.

> [!WARNING]  
> popcat.click only allows 800 pops every 30 seconds, going beyond that will flag you as a bot.

> [!CAUTION]  
> This project is released into the public domain under [The Unlicense](LICENSE). **Use responsibly and at your own risk.**

---

## Credits

A project by AstrooKai - Made with AI.

> [!DISCLAIMER]  
> The author is **not liable for any damages, misuse, or consequences** resulting from the use of this project. Use at your own risk and ensure compliance with all applicable laws and website terms of service.