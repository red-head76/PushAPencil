const tasks = [];

function saveTasks(user, task, game_code) {
    if (!tasks[game_code]) {
        tasks[game_code] = {}
        tasks[game_code][user] = [task];
    } else {
        if(!tasks[game_code][user]) {        // if it does not exist, make a new stack
            tasks[game_code][user] = [task];
        } else {
            tasks[game_code][user].push(task)
        }
    }
}

function loadTasks(playerList, game_code) {

    number_of_tasks = tasks[game_code][playerList[0].user_name].length;
    var all_tasks = {};
    
    for (var task_number = 0; task_number < number_of_tasks; task_number++) {
        tasks_sorted = []
        for (var player_index = task_number; player_index < number_of_tasks + task_number; player_index++) {
            player = playerList[player_index % playerList.length].user_name
            tasks_sorted.push(tasks[game_code][player][player_index - task_number])
        }
        all_tasks[task_number] = tasks_sorted;
    }
    return (all_tasks);
}

module.exports = {
    saveTasks,
    loadTasks,
}
