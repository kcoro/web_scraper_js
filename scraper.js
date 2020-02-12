const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const writeStream = fs.createWriteStream('defaultJobs.csv');

// Write Headers for CSV File
writeStream.write('Title,Location,Company,Job Link \n');

console.log("Loading WebScraperJS ...\n");

let monsterUrl = "https://www.monster.com/jobs/search/?q=Software-Engineer&where=North-Carolina";
let indeedUrl = "https://www.indeed.com/jobs?q=software+engineer&l=Raleigh,+NC&explvl=entry_level";
let stackOverflowUrl = "https://stackoverflow.com/jobs?q=Software+Engineer&l=North+Carolina%2C+USA&d=20&u=Miles";

// ReplaceAll ... sigh JS how do you not have this!?
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

// Request to Indeed
request(indeedUrl, (error, response, html) => {
    if (!error && response.statusCode == 200) {
        const indeedPage = cheerio.load(html);
        //const jobTitle = indeedPage('.title').text().trim();
        //const jobLocation = $('')
        //console.log(jobTitle);

        // Loop through each job title
        indeedPage('.jobsearch-SerpJobCard').each((i, job) => {
            const nextJob = cheerio.load(job);
            const jobTitle = nextJob('.title a').text().trim().replaceAll(',', '');
            const jobLocation = nextJob('.location').text().trim().replaceAll(',', '');
            const company = nextJob('.company').text().trim().replaceAll(',', '');
            // Indeed JobLinks don't always have same formatting
            // Some links will be broken, thanks indeed!
            let jobLink = nextJob('.title a').attr('href');
            jobLink = jobLink.substring(7,);
            jobLink = "https://www.indeed.com/viewjob" + jobLink;

            // Write to CSV
            writeStream.write(`${jobTitle}, ${jobLocation}, ${company}, ${jobLink}, \n`);
        });
    }
});

// Request to Stack Overflow
request(stackOverflowUrl, (error, response, html) => {
    if (!error && response.statusCode == 200) {
        const stackPage = cheerio.load(html);
        
        // Loop through each Job
        stackPage('.-job').each((i, job) => {
            const stackJob = cheerio.load(job);
            const jobTitle = stackJob('.s-link').text().trim().replaceAll(',', '');
            const jobLocation = stackJob('.fc-black-700 .fc-black-500').text().trim().replaceAll(',', '');
            const company = "Stack Overflow Sucks";
            let jobLink = stackJob('.s-link').attr('href').replaceAll(',', '');
            jobLink = "https://stackoverflow.com"+jobLink;

            // Write to CSV
            writeStream.write(`${jobTitle}, ${jobLocation}, ${company}, ${jobLink}, \n`);
        });
    }
});

// Request to Monster
// Monster returns EMPTY HTML???
request(monsterUrl, (error, response, html) => {
    if (!error && response.statusCode == 200) {
        const monsterPage = cheerio.load(html);

        // Loop through each Job
        monsterPage('.flex-row').each((i, job) => {
            const monsterJob = cheerio.load(job);
            const jobTitle = monsterJob('a').text().trim().replaceAll(',', '');
            const jobLocation = monsterJob('.location span .name').text().trim().replaceAll(',', '');
            const company = "Monster Sucks";
            const jobLink = monsterJob('a').attr('href').replaceAll(',', '');

            console.log(jobTitle);
            console.log(jobLocation);
            console.log(company);
            console.log(jobLink);
            // Write to CSV
            writeStream.write(`${jobTitle}, ${jobLocation}, ${company}, ${jobLink}, \n`);
        });
    }
});

console.log('Finished Scraping Jobs! \nYour CSV file is ready.');
