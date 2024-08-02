from django.shortcuts import render
from django.http import JsonResponse

def generate_3d_model_view(request, model):
    # clear any pre
    viewContainer.clear()
    viewContainer.append(model)
    return render(request, 'index-3d.html', {'viewContainer': view-container})
