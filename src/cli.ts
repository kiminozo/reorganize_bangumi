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

var ui = new inquirer.ui.BottomBar();


// Or simply write output
ui.log.write('something just happened.');
ui.log.write('Almost over, standby!');

// During processing, update the bottom bar content to display a loader
// or output a progress bar, etc
ui.updateBottomBar('new bottom bar content');
//run();