const tasks = {};
const taskSorted = {};

function saveTasks(user, task) {
    if(!tasks[user]){        // if it does not exist, make a new stack
        tasks[user] = [task]
    } else {
        tasks[user].push(task)
    }
}

function loadTasks(playerList) {

    number_of_tasks = tasks[playerList[0].user_name].length;
    var all_tasks = {};
    
    for (var i = 0; i < number_of_tasks; i++) {
        tasks_sorted = []
        for (var j = i; j < playerList.length + i; j++) {
            player = playerList[j % playerList.length].user_name
            if (all_tasks[i]) {
                all_tasks[i].push(tasks[player][(j + i) % playerList.length]);
            } else {
                all_tasks[i] = [tasks[player][(j + i) % playerList.length]];
            }
        }
    }

    return (all_tasks);
}

module.exports = {
    saveTasks,
    loadTasks,
}
