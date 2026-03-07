# Chronos: The Grand Descent

**Chronos** is a high-performance historical timeline engine designed for a "vertical descent" through time. It allows users to scroll from the **Big Bang** all the way to the **Modern Era**, revealing significant historical milestones, scientific discoveries, and iconic cultural figures along the way.

The application includes a built-in **Database Curation Mode** for vetting historical data, fixing typos, adjusting significance levels, and exporting vetted datasets back into the core engine.

---

## 🚀 Important Execution Files
These are the core files required for the application to run correctly:

1.  **[index.html](index.html)**: The main entry point. It loads all the necessary scripts and styles.
2.  **[script.js](script.js)**: The brain of the application. It handles the timeline rendering, scroll animations, the curation table logic, and the quiz systems.
3.  **[style.css](style.css)**: Provides the modern "Glassmorphism" UI, animations, and responsive layout for desktop/mobile.
4.  **[wikidata_master.js](wikidata_master.js)**: A massive, pre-fetched "Master List" of ~300 high-significance historical events from Wikidata.
5.  **[wikidata_consensus.js](wikidata_consensus.js)**: The vetted dataset containing items that have been specifically curated or synced for your live version.

---

## 🛠️ Utility & Curation Tools
These files are used for managing and preparing the data but aren't strictly needed for the end-user to view the site:

*   **[chronos_master_prep.csv](chronos_master_prep.csv)**: A spreadsheet-ready version of your entire database. Perfect for mass-editing in Excel or Google Sheets.
*   **[generate_csv.pl](generate_csv.pl)**: A Perl script used to generate the above CSV from the JavaScript data files.
*   **[generate_csv.js](generate_csv.js)**: A Node.js version of the CSV generator.

---

## 🧹 Non-Essential or Obsolete Files
These files can be safely deleted or ignored as they are either temporary exports or older versions of scripts:


