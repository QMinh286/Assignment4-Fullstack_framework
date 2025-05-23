from django.shortcuts import render
from .models import Post,Photo
from .forms import PostForm
from django.http import JsonResponse, HttpResponse
from profiles.models import Profile
from .utils import action_permission
from django.contrib.auth.decorators import login_required
# Create your views here.

@login_required
def post_list_and_create(request):
    form= PostForm(request.POST or None)
    #qs = Post.objects.all()

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest': 
        if form.is_valid():
            author = Profile.objects.get(user=request.user)
            instance = form.save(commit=False)
            instance.author =author
            instance.save()
            return JsonResponse ({
                'title':instance.title,
                'body':instance.body,
                'author':instance.author.user.username,
                'id':instance.id,
            })
    context = {
        'form':form
    }
    return render(request,'posts/main.html',context)

@login_required
def post_detail(request,pk):
    obj = Post.objects.get(pk=pk)
    form =PostForm()


    context = {
        'obj':obj,
        'form':form,
    }

    return render(request,'posts/detail.html',context)


@login_required
def load_post_data_view(request, num_posts):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        visible = 3
        upper = num_posts
        lower = upper - visible
        size = Post.objects.all().count()
        
        qs = Post.objects.all()
        data =[]
        for obj in qs:
            item = {
                'id':obj.id,
                'title':obj.title,
                'body':obj.body,
                'like':True if request.user in obj.like.all() else False,
                'count':obj.like_count,
                'author': obj.author.user.username,
            }
            data.append(item)
        return JsonResponse({'data':data[lower:upper],'size':size})


@login_required
def post_detail_data_view(request,pk):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        obj =Post.objects.get(pk=pk)
        data ={
            'id':obj.id,
            'title':obj.title,
            'body':obj.body,
            'author':obj.author.user.username,
            'logged_in':request.user.username,
        }
        return JsonResponse({'data':data})
    return redirect('posts:main-board')

@login_required
def like_unlike_post(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # AJAX check
        pk = request.POST.get('pk')
        obj = Post.objects.get(pk=pk)
        if request.user in obj.like.all():
            like = False
            obj.like.remove(request.user)
        else:
            like= True
            obj.like.add(request.user)
        return JsonResponse({'like':like,'count':obj.like_count})
    return redirect('posts:main-board')


@login_required
@action_permission
def update_post(request,pk):
    obj = Post.objects.get(pk=pk)
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest': 
        new_title = request.POST.get('title')
        new_body = request.POST.get('body')
        obj.title=new_title
        obj.body=new_body
        obj.save()
        return JsonResponse({
            'title': new_title,
            'body': new_body
        })
    return redirect('posts:main-board')


@login_required
@action_permission
def delete_post(request,pk):
    obj = Post.objects.get(pk=pk)
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest': 
        obj.delete()
        return JsonResponse({'msg':'some message'})
    #return JsonResponse({'msg':'access denied - ajax only'})
    return redirect('posts:main-board')

def image_upload_view(request):
    #print(request.FILES)
    if request.method == 'POST':
        img = request.FILES.get('file')
        new_post_id = request.POST.get('new_post_id')
        post = Post.objects.get(id=new_post_id)
        Photo.objects.create(image=img,post=post)
    return HttpResponse()

@login_required
def search_posts_view(request):
    query = request.GET.get('query', '')
    print(f"Search query: {query}") 
    posts = Post.objects.filter(
        title__icontains=query
    ).order_by('-created') 
    
    print(f"Found {posts.count()} posts") 
    
    data = []
    for post in posts:
        item = {
            'id': post.id,
            'title': post.title,
            'body': post.body,
            'like': True if request.user in post.like.all() else False,
            'count': post.like_count,
        }
        data.append(item)
    
    return JsonResponse({'data': data})