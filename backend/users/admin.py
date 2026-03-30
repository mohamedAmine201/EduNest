from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Add your custom fields to the display
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    
    # Add custom fields to the edit form (fieldsets)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Info', {'fields': ('role', 'profile_pic', 'bio')}),
    )
    
    # Add custom fields to the "Add user" form too
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Info', {'fields': ('role', 'profile_pic', 'bio')}),
    )