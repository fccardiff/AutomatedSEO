# AutomatedSEO

This quick project was written in Node.js for broken link building.

Give it a set of URLs, it'll search for them, filter them out based on DA, and provide you with a nice set of contacts.

It'll then export them into a CSV.

# Installation

To install, you'll need 3 things:
- A server with the latest Node.js version installed
- All required packages (run "npm install" before running)
- A Moz API subscription for getting domain metrics (can also work on the trial in smaller projects)
- A Hunter.io API subscription, or trial, for getting emails and contact info

# Running

This module will iterate through a list of CSVs at your given path, check Hunter.io stats, and if enabled, import them into your CRM for further review.

You can set min or max domain authority based on your targets, and reach out to website owners from there.

Currently, there's just one mode: "BROKEN_LINKS", but I do plan to expand this for other methods of link building.


# Configuration

To configure, simply enter your API keys as necessary and set "enabled" to true on Moz and Hunter.

The "path" variable is the directory in which your CSVs are located. The "column" var is the name of the CSV column that contains the list of broken links. By default, it's set to the local directory and Ahrefs' default CSV headers.

# Notes

This project is a hobby project and as such I'm not taking feature requests for the open source platform.

If, however, you're interested in custom additions, feel free to contact me at finn [at] fccardiff.com.
