const $ = function (sel) {
    return document.querySelector(sel);
};
const $All = function (sel) {
    return document.querySelectorAll(sel);
};

const COMPLETED = 'completed';
const SELECTED = 'selected' ;
const EDITING = 'editing';
let item_id = 0;

function  addTodo(){
    let new_todo = $('#new-todo')
    let msg = new_todo.value;
    if (msg === ''){
        return;
    }

    let todo_list = $('#todo-list');

    let item = document.createElement('li');
    let id = 'item' + item_id++;
    item.setAttribute('id', id);
    item.innerHTML = [
        '<div class="view">',
        '  <input class="toggle" type="checkbox">',
        '  <label class="todo-label">' + msg + '</label>',
        '  <button class="destroy"></button>',
        '</div>'
    ].join('');

    // Here add event listener
    // label.addEventListener('dbclick', );
    item.querySelector('.toggle').addEventListener('change', function () {
        updateTodo(id, this.checked);
    })
    item.querySelector('.destroy').addEventListener('click', function () {
        removeTodo(id);
    })

    todo_list.insertBefore(item, todo_list.firstChild);
    new_todo.value = '';
    update();
}

function updateTodo(item_id, done) {
    let item = $('#' + item_id);
    if (done) item.classList.add(COMPLETED);
    else item.classList.remove(COMPLETED);
    update();
}

function removeTodo(item_id) {
    let todo_list = $('#todo-list');
    let item = $('#' + item_id);
    todo_list.removeChild(item);
    update();
}

function clearCompleted() {
    let todo_list = $('#todo-list');
    let items = todo_list.querySelectorAll('li');
    for (let i = items.length - 1; i >= 0; --i){
        let item = items[i];
        if (item.classList.contains(COMPLETED)) todo_list.removeChild(item);
    }
    update();
}

function update() {
    let items = $All('#todo-list li');
    let filter = $('#filters li a.selected').innerHTML;
    let left_num = 0;
    let item, i, display;

    for (i = 0; i < items.length; ++i) {
        item = items[i];
        if (!item.classList.contains(COMPLETED)) left_num++;

        // filters
        display = 'none';
        if (filter === 'All'
            || (filter === 'Active' && !item.classList.contains(COMPLETED))
            || (filter === 'Completed' && item.classList.contains(COMPLETED))) {

            display = '';
        }
        item.style.display = display;
    }

    let completed_num = items.length - left_num;
    let count = $('#todo-count');
    count.innerHTML = (left_num || 'No') + (left_num > 1 ? ' items' : ' item') + ' left';

    // let clear_completed = $('#clear-completed');
    // clear_completed.style.visibility = completed_num > 0 ? 'visible' : 'hidden';

    let toggle_all = $('#toggle-all');
    // toggle_all.style.visibility = items.length > 0 ? 'visible' : 'hidden';
    if (items.length === completed_num){
        toggle_all.classList.add(SELECTED);
    }
    else{
        toggle_all.classList.remove(SELECTED);
    }
}

function toggleAll() {
    let items = $All('#todo-list li');
    let toggle_all = $('#toggle-all');
    let checked;
    if (toggle_all.classList.contains(SELECTED)){
        toggle_all.classList.remove(SELECTED);
        checked = false;
    }
    else {
        toggle_all.classList.add(SELECTED);
        checked = true;
    }
    for (let i = 0; i < items.length; ++i) {
        let item = items[i];
        let toggle = item.querySelector('.toggle');
        if (toggle.checked !== checked) {
            toggle.checked = checked;
            if (checked) item.classList.add(COMPLETED);
            else item.classList.remove(COMPLETED);
        }
    }
    update();
}

function resizeRoot() {
    let deviceWidth = document.documentElement.clientWidth;  // 获得设备宽度
    let maxWidth = 750;

    if (deviceWidth > maxWidth) {
        deviceWidth = maxWidth;
    }
    document.documentElement.style.fontSize = deviceWidth / 35 + "px";
}

window.onload = function init(){
    // resize
    resizeRoot();

    // add button
    let add_btn = $('#add-btn');
    add_btn.addEventListener('click', function () {
        addTodo();
    })

    // clear button
    let clear_completed = $('#clear-completed');
    clear_completed.addEventListener('click', function(){
        clearCompleted();
    })

    // select all button
    let toggle_all = $('#toggle-all');
    toggle_all.addEventListener('click', function () {
        toggleAll();
    })

    // filters
    let filters = $All('#filters li a');
    for (let i = 0; i < filters.length; ++i) {
        (function(filter) {
            filter.addEventListener('click', function() {
                for (let j = 0; j < filters.length; ++j) {
                    filters[j].classList.remove(SELECTED);
                }
                filter.classList.add(SELECTED);
                update();
            }, false);
        })(filters[i])
    }
    update();
}

window.onresize = function () {
    resizeRoot();
};