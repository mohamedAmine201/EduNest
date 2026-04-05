from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Add your custom fields to the display
    list_display = ('username', 'email', 'role', 'identifier', 'phone_number', 'is_staff', 'is_active')

    fieldsets = BaseUserAdmin.fieldsets + (
    ('Custom Info', {'fields': ('role', 'identifier', 'profile_pic', 'bio', 'phone_number')}),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Info', {'fields': ('role', 'identifier', 'profile_pic', 'bio', 'phone_number')}),
    )