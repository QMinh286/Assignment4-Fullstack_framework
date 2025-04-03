from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    title = forms.CharField(widget=forms.TextInput)
    class Meta:
        model = Post
        fields = ('title','body',)