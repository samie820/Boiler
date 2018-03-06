#!/usr/bin/env node

const program = require('commander');
const Git = require('nodegit');
const GitHub =  require('github-api');
const axios = require('axios');
const { prompt } = require('inquirer');

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
        prompt(questions)
        .then(answers => 
            axios.get(`https://api.github.com/search/repositories?q=${answers.repo}+language:${answers.language}+in:name&sort=stars&order=desc/?access_token=${API_KEY}`)
            .then((res) => {
                const data = res.data.items
                var git_data = data[0]
                console.info(`Currently cloning and downloading ${git_data.git_url}, it has ${git_data.stargazers_count} stars and was last updated at ${git_data.updated_at}`)
                return [git_data.git_url, answers]
            })
            .then((data) => {
                console.info("Downloading the repo...")
                Git.Clone(data[0], data[1].repo).then(() => {
                    console.info('Your Repo is ready!!!')
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

program.parse(process.argv);