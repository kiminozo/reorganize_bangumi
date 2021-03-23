import inquirer = require('inquirer');

async function run() {
    let choices = [{ name: "A" }, { name: "B" }]
    let answers = await inquirer.prompt<any>([
        {
            type: 'rawlist',
            name: "name1",
            message: 'Select toppings',
            choices: choices,
            validate: function (answer) {
                if (answer.length < 1) {
                    return 'You must choose at least one topping.';
                }
                return true;
            },
        },
    ]);
    console.log(answers);
}

run();