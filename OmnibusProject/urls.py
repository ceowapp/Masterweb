"""
URL configuration for OmnibusProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from myapp import mainView as views
from myapp.aimedical import mainView as medViews
from myapp.ai3d import img2pointEventHandler
from myapp.ai3d import d3generatorEventHandler
from myapp.ai3d import text2pointEventHandler
from myapp.aisentimentanalysis import aspectSentimentEventHandler
#from myapp.aimedical.ai_livertumor_seg_app import runApp
from myapp.logView import restricted_view
from myapp import register
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(), name='login_page'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', register.register_valiation, name='register'),
    path('restricted/', restricted_view, name='restricted'),
    path('', views.generator_view_public, {'template_name': 'landingPage.html'}, name='landing_page'),
    path('index.html/', views.generator_view_extend, {'template_name': 'index.html'}, name='home_page'),
    path('card-inno.html/', views.generator_view_extend, {'template_name': 'card-inno.html'}, name='card_page'),
    path('about.html/', views.generator_view_extend, {'template_name': 'about.html'}, name='about_page'),
    path('ARVR.html/', views.generator_view_extend, {'template_name': 'ARVR.html'}, name='ARVR_page'),
    path('QR.html/', views.generator_view_extend, {'template_name': 'QR.html'}, name='QR_page'),
    path('AI.html/', views.generator_view_extend, {'template_name': 'AI.html'}, name='AI_page'),
    path('application3D.html/', views.generator_view_extend, {'template_name': 'application3D.html'}, name='3D_page'),
    path('data.html/', views.generator_view_main, {'template_name': 'data.html'}, name='data_page'),
    path('robotics.html/', views.generator_view_extend, {'template_name': 'robotics.html'}, name='robotics_page'),
    path('construction.html/', views.generator_view_extend, {'template_name': 'construction.html'}, name='construction_page'),
    path('card-moments.html/', views.generator_view_extend, {'template_name': 'card-moments.html'}, name='moment_page'),
    path('card-innovation.html/', views.generator_view_extend, {'template_name': 'card-innovation.html'}, name='innovation_page'),

    path('technology.html/', views.generator_view_extend, {'template_name': 'technology.html'}, name='technology_page'),
    path('resource.html/', views.generator_view_extend, {'template_name': 'resources. html'}, name='resource_page'),
    path('customer.html/', views.generator_view_extend, {'template_name': 'customer.html'}, name='customer_page'),
    path('partner.html/', views.generator_view_extend, {'template_name': 'partner.html'}, name='partner_page'),
    path('support.html/', views.generator_view_extend, {'template_name': 'support.html'}, name='support_page'),
    path('news.html/', views.generator_view_extend, {'template_name': 'news.html'}, name='news_page'),
    path('test.html/', views.generator_view_extend, {'template_name': 'test.html'}, name='test_page'),
    path('index-med.html/', views.generator_view_main, {'template_name': 'index-med.html'}, name='med_page'),

    #THIS IS ARVR SECTION
    path('threeJS.html/', views.generator_view_component, {'template_name': 'threeJS.html'}, name='ar_display_page'),
    re_path(r'^threeJS.html/$', views.generator_3d_view, name='static_3d_page'),
    path('normalAR.html/', views.generator_view_component, {'template_name': 'normalAR.html'}, name='normal_ar_page'),
    path('animationAR.html/', views.generator_view_component, {'template_name': 'animationAR.html'}, name='animation_ar_page'),
    path('dimensionAR.html/', views.generator_view_component, {'template_name': 'dimensionAR.html'}, name='dimension_ar_page'),
    path('lightAR.html/', views.generator_view_component, {'template_name': 'lightAR.html'}, name='light_ar_page'),
    path('markerAR.html/', views.generator_view_component, {'template_name': 'markerAR.html'}, name='marker_ar_page'),
    path('materialAR.html/', views.generator_view_component, {'template_name': 'materialAR.html'}, name='material_ar_page'),
    path('cameraAR.html/', views.generator_view_component, {'template_name': 'cameraAR.html'}, name='camera_ar_page'),
    path('stereo-vr.html/', views.generator_view_component, {'template_name': 'stereo-vr.html'}, name='vr_audio_page'),
    path('immersive-vr-session.html/', views.generator_view_component, {'template_name': 'immersive-vr-session.html'}, name='vr_display_page'),

    # THIS IS QR SECTION
    path('index-qr.html/', views.generator_view_component, {'template_name': 'index-qr.html'}, name='QR_page'),
    re_path(r'^index-qr.html/$', views.generator_qr_view, name='static_qr_page'),

    # THIS IS 3D SECTION
    path('gallery.html/', views.generator_view_component, {'template_name': 'gallery.html'}, name='game_page'),
    path('verge3d.html/', views.generator_view_component, {'template_name': 'verge3d.html'}, name='house_page'),
    path('display3d.html/', views.generator_view_component, {'template_name': 'display3d.html'}, name='display3d_page'),
    path('textEffect.html/', views.generator_view_component, {'template_name': 'textEffect.html'}, name='textapp_page'),
    path('displayLego.html/', views.generator_view_component, {'template_name': 'displayLego.html'}, name='displayLego_page'),

    # THIS IS APP SECTION
    path('appDev.html/', views.generator_view_extend, {'template_name': 'appDev.html'}, name='app_page'),
    path('androidApp.html/', views.generator_view_component, {'template_name': 'androidApp.html'}, name='android_page'),
    path('iosApp.html/', views.generator_view_component, {'template_name': 'iosApp.html'}, name='ios_page'),
    path('webApp.html/', views.generator_view_component, {'template_name': 'webApp.html'}, name='webapp_page'),

    # THIS IS MED SECTION
    #path('index-med-liver.html/', medViews.generator_liversegApp_view, name='med_liver_app'),

    # THIS IS AI SECTION
    path('index-ai.html/', views.generator_view_component, {'template_name': 'index-ai.html'}, name='tryon_page'),
    path('ring.html/', views.generator_view_component, {'template_name': 'ring.html'}, name='ring_page'),
    path('necklace.html/', views.generator_view_component, {'template_name': 'necklace.html'}, name='necklace_page'),
    path('watch.html/', views.generator_view_component, {'template_name': 'watch.html'}, name='watch_page'),
    path('earring.html/', views.generator_view_component, {'template_name': 'earring.html'}, name='earring_page'),

    path('index-3d.html/', views.generator_view_component, {'template_name': 'index-3d.html'}, name='3dGenerator_page'),
    path('faceAnimation.html/', views.generator_view_component, {'template_name': 'faceAnimation.html'}, name='computer_vision_page'),
    path('index-txt.html/', views.generator_view_component, {'template_name': 'index-txt.html'}, name='text_analysis_page'),

    path('faceAnimation.html/', views.generator_view_component, {'template_name': 'faceAnimation.html'}, name='computer_vision_page'),
    path('index-3d.html/handle_generator_img/', img2pointEventHandler.handle_generator_img, name='handle_generator_img'),
    path('index-3d.html/download/<str:pointcloudimg>/', img2pointEventHandler.download_from_aws_s3, name='download_from_aws_s3'),
    path('index-3d.html/handle_generator_3d/', d3generatorEventHandler.handle_generator_3d, name='handle_generator_3d'),
    path('index-3d.html/download/<str:model3d>/', d3generatorEventHandler.download_from_aws_s3,name='download_from_aws_s3'),
    path('index-3d.html/handle_generator_txt/', text2pointEventHandler.handle_generator_txt, name='handle_generator_txt'),
    path('index-3d.html/download/<str:pointcloudtxt>/', text2pointEventHandler.download_from_aws_s3,name='download_from_aws_s3'),
    path('index-txt.html/sentiment_analysis_processor/', aspectSentimentEventHandler.sentiment_processor,name='sentiment_processor'),
    #path('index-med-liver.html/processed-img$$/', runApp.handleAppEvent, name='handle_process_liver'),

]



