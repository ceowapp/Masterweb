from django.http import JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib.auth import login


def register_valiation(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]

        # Check if the username or email already exists
        if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
            return JsonResponse({"success": False, "message": "Username or email already exists."})

        # Create a new user
        user = User.objects.create_user(username, email, password)
        user.save()

        # Log in the user
        login(request, user)

        return JsonResponse({"success": True})
    else:
        return render(request, "login.html")
