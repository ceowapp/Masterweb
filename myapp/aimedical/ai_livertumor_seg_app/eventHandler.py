from packages.point_e.util.point_cloud import PointCloud
from tqdm.auto import tqdm
import numpy as np
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
from myapp.ai3d.d3generator import generator3D
import tempfile
import os
import asyncio

# Mock function for processing (replace with your actual processing logic)
async def process_pointcloud(pointcloud):
    await asyncio.sleep(5)  # Simulate processing time
    # Replace this with your actual processing logic
    result_data = {"output": "your_processed_data"}
    return result_data

# Functions to handle requests from clientside
async def async_func():
    print('Velotio ...')
    await asyncio.sleep(1)
    print('... Technologies!')

@login_required
@csrf_exempt
def handle_generator_3d(request):
    if request.method == "POST":
        uploaded_pointcloud = request.FILES.get('uploaded_image')

        # Mock function to process the point cloud asynchronously
        async def process_and_respond():
            try:
                # Process point cloud
                processed_data = await process_pointcloud(uploaded_pointcloud)

                # Create a JSON response containing the processed data and status
                response_data = {
                    "status": "onLoaded",
                    "data": processed_data,
                }
            except Exception as e:
                # Handle error during processing
                response_data = {
                    "status": "onLoadError",
                    "error_message": str(e),
                }
            finally:
                # Return the JSON response
                return JsonResponse(response_data)

        # Start asynchronous processing
        asyncio.ensure_future(process_and_respond())

        # Return an initial response indicating that processing has started
        return JsonResponse({"status": "onLoad"})

    else:
        # Handle other HTTP methods (e.g., GET)
        return JsonResponse({"error": "Invalid request method"}, status=400)
