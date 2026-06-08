
# CAD Command Line Autocomplete

A JavaScript-based command line autocomplete system designed for CAD applications. The project provides intelligent command suggestions, alias support, system variable search, keyboard navigation, command execution, and customizable autocomplete settings to improve user productivity.

---

# Overview

This project implements a smart command line interface that helps users quickly find and execute commands within a CAD environment. The system dynamically loads commands, aliases, and system variables, then displays relevant suggestions as the user types.

The autocomplete engine supports exact matching, prefix matching, and mid-string searching, making command discovery fast and efficient.

---

# Key Features

## Smart Command Suggestions

* Displays command suggestions in real time.
* Supports exact match and partial match searching.
* Reduces typing effort and improves command discovery.

### Example :
Input: LIN

Suggestions:
LINE
LINEAR
LINETYPE

---

## Alias Support

The system supports command aliases, allowing users to execute commands using shorter keywords.

### Example
L → LINE
C → CIRCLE
Aliases are dynamically loaded and included in autocomplete suggestions.

---

## System Variable Search

The autocomplete engine can also search and suggest system variables.

### Example
ORTHOMODE
SNAPMODE

This enables quick access to application settings and configurations.

---

## Mid-String Search

Unlike traditional autocomplete systems, this implementation supports searching from the middle of command names.

### Example
Input: DIM

Results:
DIMLINEAR
ALIGNEDDIMENSION

This improves usability when users remember only part of a command.

---

## Keyboard Navigation

The suggestion list can be fully controlled using the keyboard.

| Key    | Action                  |
| ------ | ----------------------- |
| ↑      | Previous Suggestion     |
| ↓      | Next Suggestion         |
| Enter  | Select Command          |
| Esc    | Clear Input             |
| Delete | Delete Selected Objects |

---

## Command Execution

When a suggestion is selected, the command is executed directly in the active document.

The system communicates with the CAD application and triggers command execution without requiring additional user interaction.

---

## Undo and Redo Support

Integrated keyboard shortcuts:
Ctrl + Z → Undo
Ctrl + Y → Redo

This provides a familiar workflow for users.

---

## Copy, Cut and Paste Integration

Supports:
Ctrl + C
Ctrl + X
Ctrl + V

Custom clipboard handling ensures smooth integration with the application's shortcut framework.

---

## Interactive Suggestion List

Users can:

* Navigate suggestions using keyboard arrows.
* Hover over suggestions with the mouse.
* Click suggestions to execute commands.
* Automatically highlight active suggestions.

---

## Context Menu Customization

A right-click context menu allows users to configure autocomplete behavior.

Available options:

* Auto Suggestion
* Include Aliases
* Include Mid-String Search
* Include System Variables
* Display Suggestion List

This provides flexibility based on user preferences.

---

## Draggable Command Window

The command window can be moved freely across the interface.

Features:

* Drag and drop support
* Dynamic positioning
* Responsive behavior during window resize

---

## Focus Management

The command line automatically receives focus when required, allowing users to start typing commands immediately.

This improves workflow efficiency and user experience.

---

# Technical Highlights

### Dynamic Data Loading

The application asynchronously loads:

* Command List
* Alias List
* System Variable List

using JavaScript Promises for better performance and responsiveness.

---

### Event Driven Architecture

The system responds to:

* Keyboard Events
* Mouse Events
* Clipboard Events
* Context Menu Events

This ensures smooth interaction throughout the application.

---

### DOM Manipulation

Autocomplete suggestions and context menus are generated dynamically using JavaScript DOM APIs.

---

# Technologies Used

* JavaScript (ES6)
* HTML DOM Manipulation
* CSS
* Event Listeners
* Promise API
* jQuery

---

# Project Architecture

XeCFxCommandLine
│
├── Command Management
│   ├── Command List
│   ├── Alias List
│   └── System Variable List
│
├── Search Engine
│   ├── Exact Match
│   ├── Prefix Match
│   └── Mid-String Match
│
├── User Interaction
│   ├── Keyboard Navigation
│   ├── Mouse Selection
│   └── Context Menu
│
├── Command Execution
│
└── UI Components
    ├── Suggestion Popup
    ├── Focus Management
    └── Draggable Window

---

# Benefits

* Faster command execution
* Improved user productivity
* Enhanced user experience
* Flexible search capabilities
* Customizable autocomplete behavior
* Easy integration with CAD applications

---

# Learning Outcomes

Through this project, I gained experience in:

* JavaScript event handling
* DOM manipulation
* Autocomplete implementation
* UI/UX interaction design
* Asynchronous programming using Promises
* Keyboard shortcut management
* Context menu development

---

# Conclusion

CAD Command Line Autocomplete is a feature-rich JavaScript autocomplete framework built for command-driven applications. By combining intelligent search, alias handling, keyboard navigation, command execution, and customizable settings, it provides an efficient and user-friendly command input experience.

---

### Repo Description (About Section)

A JavaScript-based CAD command line autocomplete system featuring intelligent command suggestions, alias support, system variable search, keyboard navigation, command execution, and customizable autocomplete settings.
