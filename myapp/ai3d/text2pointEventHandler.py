from PIL import Image
from tqdm.auto import tqdm
import numpy as np
from django.contrib.auth.decorators import login_required
import mimetypes
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
import io
from myapp.ai3d.text2pointGenerator import generate_pointcloud

# Configure your AWS S3 client
accessKeyId = 'AKIAQREX4EOZZIZNVFH5'
secretAccessKey = 'Un24mxOCnR7i6m544blyBpyUxLrt15pPr1oSQ0Wx'
bucketName = 'pointcloud2model'

#Functions to handle requests from clientside
# Function to handle image processing

def handle_generator_txt(request):
    if request.method == "POST":
        prompt = request.POST.get('user_input')  # Use request.POST to get text input
        user_id = request.user.id  # Retrieve the user's ID from the authenticated user

        if prompt:
            # Produce a sample from the model.
            sampler = generate_pointcloud()  # Replace this with your actual model function
            samples = None
            for x in tqdm(sampler.sample_batch_progressive(batch_size=1, model_kwargs=dict(texts=[prompt]))):
                samples = x

            # Convert the PointCloud to a NumPy array
            point_cloud = sampler.output_to_point_clouds(samples)[0]
            point_cloud_array = point_cloud.to_numpy()

            npz_buffer = io.BytesIO()
            np.savez(npz_buffer, point_cloud=point_cloud_array)
            npz_buffer.seek(0)

            object_key = "output_model.npz"
            # Save the NumPy array as an NPZ file
            create_user_folder(user_id)  # Define create_user_folder function
            upload_to_aws_s3(npz_buffer, user_id, object_key)  # Define upload_to_aws_s3 function

            # Return the point cloud data as JSON
            response_data = {
                "point_cloud": point_cloud_array.tolist(),  # Convert to a JSON-serializable format
            }

            return JsonResponse(response_data)

        else:
            # Handle the case where no text input was provided
            return JsonResponse({"error": "No text input"}, status=400)

    else:
        # Handle other HTTP methods (e.g., GET)
        return JsonResponse({"error": "Invalid request method"}, status=400)


#select user id and for each user will create a new folder for uploading
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