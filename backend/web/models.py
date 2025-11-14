from django.db import models
from django.conf import settings


class Item(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, default='Outros')
    location = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to='items/', blank=True, null=True)
    status = models.CharField(max_length=50, default='disponível')
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.title} ({self.user})"
