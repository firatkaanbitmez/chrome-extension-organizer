[![Chrome Web Store](https://img.shields.io/badge/Download-Chrome%20Web%20Store-brightgreen.svg?style=for-the-badge&logo=google-chrome)](https://chromewebstore.google.com/detail/extension-organizer/cidoihbodlchadoknfiohphlokmlmokp?authuser=0&hl=tr)

# Extension Organizer

![Extension Icon](https://raw.githubusercontent.com/firatkaanbitmez/chrome-extension-organizer/main/icons/icon128.png)

**Extension Organizer** is a powerful Chrome extension designed to streamline and enhance your ability to manage other extensions. With intuitive categorization, one-click toggling, and customizable settings, managing your Chrome extensions becomes a breeze.

## Key Features

- **Categorize with Ease**: Group your extensions into customizable categories for seamless organization.
- **Quick Enable/Disable**: Toggle the state of any extension with just one click, directly from the extension's popup.
- **Adaptive Themes**: Choose between light and dark themes to suit your aesthetic preference, configurable from the options page.
- **Drag-and-Drop Interface**: Conveniently rearrange extensions within and between categories via drag and drop.
- **Activity Logging**: Keep track of extension activities with an automatic event log for actions like enabling or disabling extensions.

## Getting Started

### Installation

#### Install from Chrome Web Store

You can easily install the extension directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/extension-organizer/cidoihbodlchadoknfiohphlokmlmokp?authuser=0&hl=tr).

#### Manual Installation Using CRX File

1. Download the latest release CRX file from the [Project page](https://github.com/firatkaanbitmez/chrome-extension-organizer/releases).
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Drag and drop the downloaded `.crx` file into the `chrome://extensions/` page to install the extension.

#### Install Using Source Code

1. Download the latest release from the [Project page](https://github.com/firatkaanbitmez/chrome-extension-organizer/releases).
2. Extract the downloaded ZIP file.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable "Developer mode" by toggling the switch in the top right corner.
5. Click on "Load unpacked" and select the `Source` folder from the extracted files.

## How to Use

- **Organize Your Extensions**: Automatically sorts new installations into 'Uncategorized' or a specified default category.
- **Customize Categories**: Easily add and name categories through the user interface.
- **Toggle Extensions**: Enable or disable any extension with a simple checkbox action.

## Screenshots

![Screenshot 1](https://raw.githubusercontent.com/firatkaanbitmez/chrome-extension-organizer/main/screenshot/ss1.png)
![Screenshot 2](https://raw.githubusercontent.com/firatkaanbitmez/chrome-extension-organizer/main/screenshot/ss2.png)

## Error Solutions for Chrome and Edge

If you encounter the following error during installation:

**EN**: "This extension is not from any known source, and may have been added without your knowledge."

**TR**: "Bu uzantı, bilinen herhangi bir kaynaktan değil ve bilginiz dışında eklenmiş olabilir."

Follow these steps to resolve the issue:

1. Run the `fix.bat` file located in the project folder as an administrator. This will adjust the necessary Windows Registry settings to support the installation of the extension.
2. The browsers will be restarted automatically upon completion.

## Development

To build and test the extension locally:

1. Navigate to the `Source` folder in your terminal.
2. Use the `fix.bat` script to register the extension and restart browsers.

## Configurable Options

Customize your experience on the options page with settings like:
- **Theme Selection**: Switch between light and dark themes.
- **Auto-Categorization**: Set new extensions to automatically fall into a chosen category.

## Contributing

We welcome contributions! If you have ideas or improvements, please fork the project, implement your changes, and submit a pull request.

## Development Tools

Built with:
- **HTML/CSS** for UI elements.
- **JavaScript** for logic and API interactions.
- Chrome's **management** and **storage** APIs for extension manipulation and data persistence.

## Feedback and Support

Got feedback or need help? Reach out via [email](mailto:firatbitmez.dev@gmail.com).

## License

**Extension Organizer** is made available under the MIT License. See the [LICENSE.md](LICENSE.md) file for full details.
