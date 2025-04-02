console.log('hello world')

const helloWorldBox = document.getElementById('hello-world')
const postsBox = document.getElementById('posts-box')

helloWorldBox.innerHTML = 'hello <b> world </b>'

$.ajax({
    type: 'GET',
    url:'/hello-world/',
    success:function(response){
        console.log('success',response)
        helloWorldBox.textContent = response.text
    },
    error:function(error){
        console.log('error',error)
    }
})

$.ajax({
    type:'GET',
    url:'/data/',
    success:function(response){
        console.log(response)
        const data = response.data
        console.log(data)
        data.forEach(element => {
            postsBox.innerHTML += `
                ${element.title} - <b> ${element.body}</b></br>
            `
        });
    },
    error:function(error){
        console.log(error)
    }
})