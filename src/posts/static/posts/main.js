console.log('hello world')

const postsBox = document.getElementById('posts-box')
const spinnerBox = document.getElementById('spinner-box')
const loadBtn = document.getElementById('load-btn')
const endBox = document.getElementById('end-box')

const postForm = document.getElementById('post-form')
const title = document.getElementById('id_title')
const body = document.getElementById('id_body')
const csrf = document.getElementsByName('csrfmiddlewaretoken')

const alertBox = document.getElementById('alert-box')
const url = window.location.href

const addBtn = document.getElementById('add-btn')
const closeBtns = [...document.getElementsByClassName('add-modal-close')]
const dropozone = document.getElementById('my-dropzone')

// New elements for search functionality
const searchInput = document.getElementById('search-input')
const searchBtn = document.getElementById('search-btn')
const resetSearchBtn = document.getElementById('reset-search-btn')

// Flag to track if we're in search mode
let isSearchMode = false
let searchQuery = ''

const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');
// Function to handle alerts
const handleAlerts = (type, msg) => {
    alertBox.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${msg}
        </div>
    `
    setTimeout(() => {
        alertBox.innerHTML = ''
    }, 3000)
}

const deleted = localStorage.getItem('title')
if(deleted){
    handleAlerts('danger',`deleted "${deleted}"`)
    localStorage.clear()
}


const likeUnlikePosts = () => {
    const likeUnlikeForms = [...document.getElementsByClassName('like-unlike-forms')]
    likeUnlikeForms.forEach(form => form.addEventListener('submit', e => {
        e.preventDefault()
        const clickedId = e.target.getAttribute('data-form-id')
        const clickedBtn = document.getElementById(`like-unlike-${clickedId}`)

        $.ajax({
            type: 'POST',
            url: "/like-unlike/",
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk': clickedId,
            },
            success: function(response) {
                console.log(response)
                clickedBtn.textContent = response.like ? `Unlike (${response.count})` : `Like (${response.count})`
            },
            error: function(error) {
                console.log(error)
            }
        })
    }))
}

let visible = 3

const renderPosts = (data, append = false) => {
    if (!append) {
        postsBox.innerHTML = ''
    }
    
    data.forEach(element => {
        postsBox.innerHTML += `
            <div class="card mb-2" >
                <div class="card-body">
                    <h5 class="card-title">${element.title}</h5>
                    <p class="card-text">${element.body}</p>
                </div>
                <div class="card-footer">
                    <div class="row">
                        <div class="col-2">
                            <a href="${url}${element.id}" class="btn btn-primary">Details</a>
                        </div>
                        <div class="col-2">
                            <form class="like-unlike-forms" data-form-id="${element.id}">
                                <button class="btn btn-primary" id="like-unlike-${element.id}">${element.like ? `Unlike (${element.count})` : `Like (${element.count})`}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `
    });
    likeUnlikePosts()
}

const getData = (append = false) => {
    $.ajax({
        type: 'GET',
        url: `/data/${visible}/`,
        success: function(response) {
            console.log(response)
            const data = response.data
            setTimeout(() => {
                spinnerBox.classList.add('not-visible')
                console.log(data)
                renderPosts(data, append)
            }, 100)
            console.log(response.size)
            if (response.size === 0) {
                endBox.textContent = 'No posts added yet'
            }
            else if (response.size <= visible) {
                loadBtn.classList.add('not-visible')
                endBox.textContent = 'No more posts to load'
            } else {
                loadBtn.classList.remove('not-visible')
            }
        },
        error: function(error) {
            console.log(error)
        }
    })
}

// Function to search posts by title
const searchPosts = () => {
    const query = searchInput.value.trim()
    if (query === '') {
        handleAlerts('warning', 'Please enter a search term')
        return
    }
    
    searchQuery = query
    isSearchMode = true
    spinnerBox.classList.remove('not-visible')
    
    $.ajax({
        type: 'GET',
        url: 'search-posts/',
        data: {
            'query': query
        },
        success: function(response) {
            console.log("Search response:", response)
            setTimeout(() => {
                spinnerBox.classList.add('not-visible')
                const data = response.data
                renderPosts(data)
                
                if (data.length === 0) {
                    endBox.textContent = 'No posts found matching your search'
                    loadBtn.classList.add('not-visible')
                } else {
                    endBox.textContent = `Found ${data.length} post(s)`
                    loadBtn.classList.add('not-visible')
                }
            }, 100)
        },
        error: function(error) {
            spinnerBox.classList.add('not-visible')
            console.log("Search error:", error)
            handleAlerts('danger', 'Error occurred during search')
        }
    })
}

// Function to reset search and show all posts
const resetSearch = () => {
    searchInput.value = ''
    isSearchMode = false
    endBox.textContent = ''
    visible = 3 
    getData(false) 
}
loadBtn.addEventListener('click', () => {
    if (!isSearchMode) {
        spinnerBox.classList.remove('not-visible')
        visible += 3
        getData(true)
    }
})

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, adding search event listeners");
    
    const searchBtn = document.getElementById('search-btn')
    const searchInput = document.getElementById('search-input')
    const resetSearchBtn = document.getElementById('reset-search-btn')
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            console.log("Search button clicked");
            searchPosts();
        });
    } else {
        console.error("Search button not found in DOM");
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log("Enter key pressed in search input");
                searchPosts();
            }
        });
    } else {
        console.error("Search input not found in DOM");
    }
    
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', () => {
            console.log("Reset button clicked");
            resetSearch();
        });
    } else {
        console.error("Reset button not found in DOM");
    }
});

let newPostId = null
postForm.addEventListener('submit', e => {
    e.preventDefault()

    $.ajax({
        type: 'POST',
        url: '',
        data: {
            'csrfmiddlewaretoken': csrf[0].value,
            'title': title.value,
            'body': body.value
        },
        success: function(response) {
            console.log(response)
            newPostId = response.id
            if (!isSearchMode) {
                postsBox.insertAdjacentHTML('afterbegin', `
                    <div class="card mb-2" >
                        <div class="card-body">
                            <h5 class="card-title">${response.title}</h5>
                            <p class="card-text">${response.body}</p>
                        </div>
                        <div class="card-footer">
                            <div class="row">
                                <div class="col-2">
                                    <a href="${url}${response.id}" class="btn btn-primary">Details</a>
                                </div>
                                <div class="col-2">
                                    <form class="like-unlike-forms" data-form-id="${response.id}">
                                        <button class="btn btn-primary" id="like-unlike-${response.id}">Like (0)</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                `)
                likeUnlikePosts()
            }
            handleAlerts('success', 'New post added!')
        },
        error: function(error) {
            console.log(error)
            handleAlerts('danger', 'Oops .. something went wrong')
        }
    })
})

addBtn.addEventListener('click', e => {
    dropozone.classList.remove('not-visible')
})

closeBtns.forEach(btn => btn.addEventListener('click', () => {
    postForm.reset()
    if (!dropozone.classList.contains('not-visible')) {
        dropozone.classList.add('not-visible')
    }
    const myDropzone = Dropzone.forElement("#my-dropzone")
    myDropzone.removeAllFiles(true)
}))

Dropzone.autoDiscover = false
const myDropzone = new Dropzone('#my-dropzone', {
    url: 'upload/',
    init: function() {
        this.on('sending', function(file, xhr, formData) {
            formData.append('csrfmidllewaretoken', csrftoken)
            formData.append('new_post_id', newPostId)
        })
    },
    maxFiles: 3,
    maxFilesize: 4,
    acceptedFiles: '.png, .jpg, .jpeg'
})

// Initialize the page
getData()