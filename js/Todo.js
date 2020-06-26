const $ = function (sel) {
    return document.querySelector(sel);
};
const $All = function (sel) {
    return document.querySelectorAll(sel);
};

var model = window.model;

var LastTouchTime = new Date().getTime();

const COMPLETED = 'completed';
const SELECTED = 'selected' ;
const EDITING = 'editing';
const ACTIVE = 'active';

function createNewItem(msg, id, state=ACTIVE) {
    if (msg === ''){
        return null;
    }

    let todo_list = $('#todo-list');

    let item = document.createElement('li');
    let item_id = 'item' + id;
    item.setAttribute('id', item_id);
    item.innerHTML = [
        '<div class="toggle">✔</div>',
        '<label class="todo-label">' + msg + '</label>',
        //'  <button class="destroy"></button>',
    ].join('');

    // change to completed
    if(state === COMPLETED){
        item.classList.add(COMPLETED);
        item.querySelector('.toggle').classList.add(SELECTED);
    }

    // Here add event listener
    item.querySelector('.toggle').addEventListener('click', function () {
        updateTodo(item_id);
    })
    item.querySelector('.todo-label').addEventListener('click', function () {
        editItem(item_id);
    })
    createSwipeBtns();
    addSwipeListener()
    //item.querySelector('.destroy').addEventListener('click', function () {
    //    removeTodo(id);
    //})

    // swipe operations
    function addSwipeListener() {
        let x_start, x_end;
        item.addEventListener('touchstart', function (event) {
            x_start = event.changedTouches[0].pageX;
        })
        item.addEventListener('touchmove', function (event) {
            x_end = event.changedTouches[0].pageX;

            // left
            if (x_start - x_end > 10){
                // event.preventDefault();
                let swipe_btns = item.lastChild;
                swipe_btns.classList.add('swipe-left');
            }
            // right
            if (x_end - x_start > 10){
                event.stopPropagation();
                let swipe_btns = item.lastChild;
                if (swipe_btns.classList.contains('swipe-left')){
                    swipe_btns.classList.remove('swipe-left');
                }
            }
        })
    }

    function createSwipeBtns(){
        let del_btn = document.createElement('div');
        del_btn.innerHTML = 'X';
        del_btn.classList.add('del-btn');
        del_btn.addEventListener('click', function () {
            removeTodo(item_id);
        })

        // top button, remove and push a new item
        let top_btn = document.createElement('div');
        top_btn.innerHTML = '↑';
        top_btn.classList.add('top-btn');
        top_btn.addEventListener('click', function () {
            removeTodo(item_id);
            let top_item = {msg:msg, state:state};
            model.data.items.push(top_item);
            model.flush();
            update();
        })

        let swipe_btns = document.createElement('div');
        swipe_btns.classList.add('swipe-btns');
        // swipe_btns.classList.add('swipe-left');
        swipe_btns.appendChild(top_btn);
        swipe_btns.appendChild(del_btn);

        item.appendChild(swipe_btns);
    }

    todo_list.insertBefore(item, todo_list.firstChild);

    // used for display by filters
    return item;
}

function addTodo(){
    let new_todo = $('#new-todo')
    let msg = new_todo.value;

    if (msg === '') return;

    // store in model
    let new_item = {msg:msg, state:ACTIVE};
    model.data.items.push(new_item);
    model.flush();

    update();
    new_todo.value = '';
}

function updateTodo(item_id) {
    let items = model.data.items;
    let id = item_id[item_id.length-1];
    if (items[id].state === COMPLETED){
        model.data.items[id].state = ACTIVE;
    }
    else {
        model.data.items[id].state = COMPLETED;
    }
    model.flush();
    update();
}

function removeTodo(item_id) {
    let id = item_id[item_id.length-1];
    model.data.items.splice(id, 1);
    model.flush();
    update();
}

function clearCompleted() {
    let items = model.data.items;
    let todo_list = $('#todo-list');
    for (let i = items.length - 1; i >= 0; --i){
        if(items[i].state === COMPLETED){
            items.splice(i,1);
        }
    }
    model.flush();
    update();
}

function update() {
    let filter = model.data.filter;
    let items = model.data.items;
    let list = $('#todo-list');
    // let items = $All('#todo-list li');
    // let filter = $('#filters li a.selected').innerHTML;
    let left_num = 0;
    let item, i, display;

    // clear all list items
    list.innerHTML = '';

    for (i = 0; i < items.length; ++i) {
        item = items[i];
        if (!(item.state === COMPLETED)) left_num++;

        // create new item
        let new_item = createNewItem(item.msg, i, item.state);

        // filters
        display = 'none';
        if (filter === 'All'
            || (filter === 'Active' && !(item.state === COMPLETED))
            || (filter === 'Completed' && (item.state === COMPLETED))) {

            display = '';
        }
        if (new_item !== null) new_item.style.display = display;
    }

    let completed_num = items.length - left_num;
    let count = $('#todo-count');
    count.innerHTML = (left_num || 'No') + (left_num > 1 ? ' items' : ' item') + ' left';

    // let clear_completed = $('#clear-btn');
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
    let items = model.data.items;
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
        if (checked) item.state = COMPLETED;
        else item.state = ACTIVE;
    }
    model.flush();
    update();
}

function editItem(item_id) {
    // simulate a double-click event
    if(new Date().getTime() - LastTouchTime > 500){
        LastTouchTime = new Date().getTime();
        console.log(LastTouchTime);
        return;
    }

    let item = $('#' + item_id);
    let item_label = item.querySelector('.todo-label');
    let editBox = document.createElement('input');

    editBox.setAttribute('class','item-content');
    editBox.setAttribute('type', 'text');
    editBox.setAttribute('value', item_label.innerHTML);

    editBox.addEventListener('blur', function () {
        item_label.innerHTML = this.value;
        let id = item_id[item_id.length-1];
        model.data.items[id].msg = this.value;
        model.flush();
        update();
        item.removeChild(editBox);
    })
    item.replaceChild(editBox, item_label);
    editBox.focus();
}

function resizeRoot() {
    let deviceWidth = document.documentElement.clientWidth;
    let maxWidth = 750;

    if (deviceWidth > maxWidth) {
        deviceWidth = maxWidth;
    }
    document.documentElement.style.fontSize = deviceWidth / 35 + "px";
}

window.onload = function init(){
    // debug
    // window.localStorage.clear();

    // resize
    resizeRoot();

    // initial data
    model.init(update);

    // add button
    let add_btn = $('#add-btn');
    add_btn.addEventListener('touchstart', function () {
        addTodo();
        add_btn.classList.add('press-down');
    })
    add_btn.addEventListener('touchend', function () {
        add_btn.classList.remove('press-down');
    })

    // clear button
    let clear_completed = $('#clear-btn');
    clear_completed.addEventListener('touchstart', function() {
        clearCompleted();
        clear_completed.classList.add('press-down');
    })
    clear_completed.addEventListener('touchend', function () {
        clear_completed.classList.remove('press-down');
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

                // stored filters data
                model.data.filter = filter.innerHTML;
                model.flush();

                update();
            }, false);
        })(filters[i])
    }
}

window.onresize = function () {
    resizeRoot();
};