import inquirer = require('inquirer');

async function run() {
    let choices = [{ name: "A", value: 1 },
    { name: "A", value: 2 },
    { name: "B", value: 3 }]
    let answers = await inquirer.prompt<any>([
        {
            type: 'list',
            name: "id",
            message: 'Select toppings',
            choices: choices,
        },
    ]);
    console.log(answers);
}

// var ui = new inquirer.ui.BottomBar();


// // Or simply write output
// ui.log.write('something just happened.');
// ui.log.write('Almost over, standby!');

// // During processing, update the bottom bar content to display a loader
// // or output a progress bar, etc
// ui.updateBottomBar('new bottom bar content');
run();