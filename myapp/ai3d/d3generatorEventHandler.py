from pointe.point_e.util.point_cloud import PointCloud
from tqdm.auto import tqdm
import numpy as np
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
from myapp.ai3d.d3generator import generator3D
import tempfile
import os
import base64

# Configure your AWS S3 clientpython manage.py runserver
accessKeyId = 'AKIAQREX4EOZZIZNVFH5'
secretAccessKey = 'Un24mxOCnR7i6m544blyBpyUxLrt15pPr1oSQ0Wx'
bucketName = 'pointcloud2model'

#Functions to handle requests from clientside

def serialize_point_cloud(pc):
    """
    Serialize the PointCloud object into a dictionary.
    You can customize this function based on the structure of your PointCloud class.
    """
    return {
        "coords": pc.coords.tolist(),  # Assuming coords is a NumPy array
        "channels": {key: value.tolist() for key, value in pc.channels.items()}  # Assuming channels is a dictionary of NumPy arrays
    }

def handle_generator_3d(request):
    if request.method == "POST":
        uploaded_pointcloud = request.FILES.get('uploaded_pc')

        if uploaded_pointcloud:
            # Load the uploaded NPZ point cloud data
            pc = PointCloud.load(uploaded_pointcloud)

            # Generate the 3D mesh
            mesh = generator3D(pc)  # Replace with your actual 3D model generation code

            # Create a temporary directory to store the PLY file
            with tempfile.TemporaryDirectory() as tmp_dir:
                ply_file_path = os.path.join(tmp_dir, 'mesh.ply')

                # Ensure the directory exists
                os.makedirs(tmp_dir, exist_ok=True)

                # Write the mesh to the PLY file
                with open(ply_file_path, 'wb') as f:
                    mesh.write_ply(f)

                # Read the PLY file as bytes
                with open(ply_file_path, 'rb') as ply_file:
                    ply_data = ply_file.read()

                # Encode the PLY data as base64
                ply_data_base64 = base64.b64encode(ply_data).decode('utf-8')

                # Serialize the PointCloud data
                serialized_pc = serialize_point_cloud(pc)

                # Create a JSON response containing both the point cloud data and the PLY data (base64 encoded)
                response_data = {
                    "point_cloud": serialized_pc,
                    "ply_data": ply_data_base64,
                }

                # Return the JSON response
                return JsonResponse(response_data)

        else:
            # Handle the case where no point cloud was uploaded
            return JsonResponse({"error": "No point cloud uploaded"}, status=400)

    else:
        # Handle other HTTP methods (e.g., GET)
        return JsonResponse({"error": "Invalid request method"}, status=400)



def create_user_folder(user_id):
    """
    Creates a user-specific folder in the S3 bucket.

    Args:
        user_id (str): Unique identifier for the user.
    """
    s3 = boto3.client('s3', aws_access_key_id=accessKeyId, aws_secret_access_key=secretAccessKey)
    folder_key = f"users/{user_id}/"

    # Create an empty object with a trailing slash to represent a folder
    s3.put_object(Bucket=bucketName, Key=folder_key)



def upload_to_aws_s3(uploaded_file, user_id, object_key):
    """
    Uploads a file to a user-specific folder in an AWS S3 bucket.

    Args:
        request (HttpRequest): Django HttpRequest object.

    Returns:
        JsonResponse: A JSON response indicating the upload status.
    """
    if uploaded_file:
        folder_key = f"users/{user_id}/"

        s3 = boto3.client('s3', aws_access_key_id=accessKeyId, aws_secret_access_key=secretAccessKey)

        # Check if the object already exists in the user's folder
        try:
            s3.head_object(Bucket=bucketName, Key=folder_key + object_key)
            message = f"A file named '{object_key}' already exists for this user."
        except Exception as e:
            # Object does not exist, proceed with the upload
            s3.upload_fileobj(uploaded_file, bucketName, folder_key + object_key)
            message = f"File '{object_key}' uploaded successfully for this user."

        return JsonResponse({"message": message})

    # Handle other cases (e.g., GET request or upload failure)
    return JsonResponse({"error": "Invalid request"}, status=400)


@login_required
@csrf_exempt
def download_from_aws_s3(request):
    """
    Downloads a file from an AWS S3 bucket.

    Args:
        request (HttpRequest): Django HttpRequest object.
        file_identifier (str): The identifier of the file to download.

    Returns:
        FileResponse: An HTTP response containing the file to download.
    """
    if request.method == "GET":
        user_id = request.user.id  # Retrieve the user's ID from the authenticated user
        folder_key = f"users/{user_id}/"
        object_key = "output_model.npz"
        s3 = boto3.client('s3', aws_access_key_id=accessKeyId, aws_secret_access_key=secretAccessKey)

        try:
            # Check if the object exists in the user's folder
            s3.head_object(Bucket=bucketName, Key=folder_key + object_key)
            # If the object exists, create an HTTP response to return the file
            response = FileResponse(s3.get_object(Bucket=bucketName, Key=folder_key + object_key)['Body'])
            response['Content-Disposition'] = f'attachment; filename="{object_key}"'
            return response
        except Exception as e:
            # Object does not exist or other error occurred
            return JsonResponse({"error": str(e)}, status=400)

    # Handle other cases (e.g., POST request)
    return JsonResponse({"error": "Invalid request"}, status=400)