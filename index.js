#!/usr/bin/env node

const program = require('commander');
const Git = require('nodegit');
const GitHub =  require('github-api');
const axios = require('axios');
const { prompt } = require('inquirer');
const fs = require('fs');



var API_KEY;
const questions = [
    {
      type : 'input',
      name : 'repo',
      message : 'Enter the type of repository you want ... e.g react, react-firebase etc.'
    },
    {
      type : 'input',
      name : 'language',
      message : 'Enter language that the repo might use (this is just to streamline the search) ...'
    },

 
  ];

  const select = [
    {
        type : 'input',
        name : 'repo',
        message : 'Enter the type of repository you want ... e.g react, react-firebase etc.'
      },
      {
        type : 'input',
        name : 'language',
        message : 'Enter language that the repo might use (this is just to streamline the search) ...'
      },  
    {
        type: 'input',
        name: 'number',
        message: 'Number of the repo, default (1):'

    },
    {
        type: 'input',
        name: 'name',
        message: 'Name of the folder you want to clone the repo into:'
    }
 
  ];
const creds = [

    {
        type: 'input',
        name: 'access_token',
        message: 'Enter you Github access_token, you must create a github app in your account settings (developer Settings):'
    }
]
program
    .version('0.0.1')
    .description('Installs the best boilerplate from github for you!!!')

program
    .command('start')
    .alias('s')
    .description('Create a new project from the boilerplate type')
    .action(() => {
        prompt(select)
        .then(answers => 
            axios.get(`https://api.github.com/search/repositories?q=${answers.repo}+language:${answers.language}+in:name&sort=stars&order=desc/?access_token=${API_KEY}`)
            .then((res) => {
                const data = res.data.items
                if(answers.number > 0){
                  var git_data = data[answers.number-1]
                }
                else{
                    var git_data = data[0]
                }
                
                console.info(`Currently cloning and downloading ${git_data.git_url}, it has ${git_data.stargazers_count} stars and was last updated at ${git_data.updated_at}`)
                return [git_data, answers]
            })
            .then((data) => {
                console.info("Downloading the repo...")
                Git.Clone(data[0].git_url, data[1].name).then(() => {
                    console.info('Your Repo is ready!!!')
                    let metadata = {
                        repo_name: data[0].name,
                        repo_url: data[0].git_url,
                        repo_stars: data[0].stargazers_count,
                        description: data[0].description,
                        updated_at: data[0].updated_at

                    }
                    let repo = JSON.stringify(metadata, null, 2)
                    fs.writeFile('boiler.json',repo, (err) => {
                        if(err) throw err;
                        console.info('Check the boiler.json file to see details of the repo downloaded')
                    });
                })
            })
            .catch(err => console.info("Unable to get repo, please check your connection"))
        )
        .catch(err => console.info(err))
    });


program
    .command('init')
    .alias('i')
    .description('Initialize the github API')
    .action(() => {
        prompt(creds).then((answer) => {
            API_KEY = answer.access_token
        })
    });

program
    .command('list')
    .alias('l')
    .description('Show a list of the 5 top repos based on your search')
    .action(() => {
        prompt(questions)
        .then(answers => {
            ANSWER = answers
            axios.get(`https://api.github.com/search/repositories?q=${answers.repo}+language:${answers.language}+in:name&sort=stars&order=desc/?access_token=${API_KEY}`)
            .then((res) => {
                const data = res.data.items
                data.map((repo, idx) => {
                    console.info(`${idx+1}. Name:${repo.name} | Author: ${repo.full_name} | Stars: ${repo.stargazers_count/1000}K`)
                })

            })
            .catch(err => console.info("Unable to get repo, please check your connection"))
    })
        .catch(err => console.info(err))
    
});

program.parse(process.argv);