from django.contrib import admin
from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'status', 'created_at')
    search_fields = ('title', 'description', 'user__username')
    list_filter = ('category', 'status')
