const tasks = {};
const taskSorted = {};

function saveTasks(user, task) {
    if(!tasks.user){        // if it does not exist, make a new stack
        tasks[user] = [task]
    } else {
        tasks.user.push(task)
    }
}

function loadTasks(playerList) {
    for (var i = 0; i < playerList.length; i++) {
        for (var queueNumber = 0; queueNumber < playerList.length; queueNumber++) {
            taskSorted[i].push(
                tasks[playerList[(i + queueNumber) % playerList.length]][queueNumber]);
        }
    }
    return (taskSorted);
}

module.exports = {
    saveTasks,
}
