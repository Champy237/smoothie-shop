# forms.py
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Customer


class CustomerRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=False)
    telephone = forms.CharField(max_length=20, required=False)
    adresse = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "email", "password1", "password2"]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]

        if commit:
            user.save()
            Customer.objects.create(
                user=user,
                telephone=self.cleaned_data.get("telephone"),
                adresse=self.cleaned_data.get("adresse"),
            )
        return user
