from django.shortcuts import render
from .models import Post
from .forms import PostForm
from django.http import JsonResponse
from profiles.models import Profile
# Create your views here.


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
                'author': obj.author.user.username
            }
            data.append(item)
        return JsonResponse({'data':data[lower:upper],'size':size})

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
def hello_world_view(request):
    return JsonResponse({'text':'hello world'})