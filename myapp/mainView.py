from django.shortcuts import render
from django.http import JsonResponse, FileResponse, HttpResponse
def generator_view_public(request, template_name):
    # Adjust the template path to include the 'public' folder
    adjusted_template_name = f'mainHTML/public/{template_name}'
    return render(request, adjusted_template_name)


def generator_view_extend(request, template_name):
    # Adjust the template path to include the 'public' folder
    adjusted_template_name = f'mainHTML/public/extend/{template_name}'
    return render(request, adjusted_template_name)
def generator_view_main(request, template_name):
    # Adjust the template path to include the 'main' folder
    adjusted_template_name = f'mainHTML/main/{template_name}'
    return render(request, adjusted_template_name)

def generator_view_component(request, template_name):
    # Adjust the template path to include the 'components' folder
    adjusted_template_name = f'mainHTML/components/{template_name}'
    return render(request, adjusted_template_name)


def generator_qr_view(request, template_name):
    qr_template_name = 'mainHTML/index-qr.html'
    return render(request, qr_template_name)

def generator_3d_view(request, template_name):
    template_name = 'mainHTML/threeJS.html'
    return render(request, template_name)

def generator_view_data(request, template_name):
    # Adjust the template path to include the 'RFile' folder
    adjusted_template_name = f'RFile/{template_name}'
    return render(request, adjusted_template_name)

