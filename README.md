# alloy-support README

Alloy support adds some very basic support for the Alloy 6 programming language.

## Features

This extension allows the user to:

* List all the available commands
* Execute one of the previous commands and see the results
* Open the Alloy editor instance

There are a couple of features that are not fully available but registered in the system:

* Syntax highlighting: based on [this previous work](https://github.com/DongyuZhao/vscode-alloy/blob/master/syntaxes/alloy.tmLanguage.json) I have registered the language processor but would need to spend some more time on it in order to fully support the Alloy 6 language
* Ability to show the results of a particular execution (the command is registered but it just prints a message at this very moment)

## Requirements

Java 8+ needs to be available in the system

## Extension Settings


## Known Issues

This is just a working prototype with some initial support for the Alloy 6 programming language

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of the Alloy support extension
