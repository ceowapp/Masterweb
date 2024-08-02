from django.shortcuts import render
from django.http import JsonResponse, FileResponse, HttpResponse

#THIS IS FOR RENDERING ENTIRE APP VIEW - SERVE AS CONSTRUCTORpython manage.py migrate

def generator_medApp_view(request, template_name):
    # Adjust the template path to include the 'medApp' folder
    app_name = f'medApp/{template_name}'
    return render(request, app_name)

#THIS IS FOR RENDERING LIVER SEGMENTATION APP INTERFACE
def generator_liversegApp_view(request):
    # Adjust the template path to include the 'medApp' folder
    liver_UI = generator_medApp_view(request, 'index-med-liver.html')
    return liver_UI
