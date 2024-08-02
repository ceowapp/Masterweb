import os
import os.path
import logging
#from myapp.aimedical.monai_deploy.deploy.operators import STLConversionOperator
from django.http import JsonResponse
from livertumor_seg_operator import LiverTumorSegOperator
import asyncio
from ..monai_deploy.deploy.core import AppContext
from SobelOperator import SobelOperator
from GaussianOperator import GaussianOperator
from MedianOperator import MedianOperator
from addNode import addNode


from SobelOperator import SobelOperator
from GaussianOperator import GaussianOperator
from MedianOperator import MedianOperator
class App():
    """This is a very basic application.

    This showcases the MONAI Deploy application framework.
    """

    # App's name. <class name>('App') if not specified.
    name = "simple_imaging_app"
    # App's description. <class docstring> if not specified.
    description = "This is a very simple application."
    # App's version. <git version tag> or '0.0.0' if not specified.
    version = "0.1.0"

    def compose(self):
        """This application has three operators.

        Each operator has a single input and a single output port.
        Each operator performs some kind of image processing function.
        """
        app_context = Application.init_app_context({})  # Do not pass argv in Jupyter notebook
        sample_data_path = Path(app_context.input_path)
        output_data_path = Path(app_context.output_path)
        print(f"sample_data_path: {sample_data_path}")

        # Please note that the Application object, self, is passed as the first positonal argument
        # and the others as kwargs.
        # Also note the CountCondition of 1 on the first operator, indicating to the application executor
        # to invoke this operator, hence the pipleline, only once.
        sobel_op = SobelOperator(self, CountCondition(self, 1), input_path=sample_data_path, name="sobel_op")
        median_op = MedianOperator(self, name="median_op")
        gaussian_op = GaussianOperator(self, output_folder=output_data_path, name="gaussian_op")
        self.add_flow(
            sobel_op,
            median_op,
            {
                ("out1", "in1"),
            },
        )
        self.add_flow(
            median_op,
            gaussian_op,
            {
                (
                    "out1",
                    "in1",
                )
            },
        )  # Using port name is optional for single port cases


if __name__ == "__main__":
    print("The statement, App().run(), is needed when this is run directly by the interpreter.")
    # App().run()

async def compose(input_img):
    """This application has three operators.

           Each operator has a single input and a single output port.
           Each operator performs some kind of image processing function.
           """
    app_context = Application.init_app_context({})  # Do not pass argv in Jupyter notebook
    sample_data_path = Path(app_context.input_path)
    output_data_path = Path(app_context.output_path)
    print(f"sample_data_path: {sample_data_path}")

    # Please note that the Application object, self, is passed as the first positonal argument
    # and the others as kwargs.
    # Also note the CountCondition of 1 on the first operator, indicating to the application executor
    # to invoke this operator, hence the pipleline, only once.
    sobel_op = SobelOperator(self, CountCondition(self, 1), input_path=sample_data_path, name="sobel_op")
    median_op = MedianOperator(self, name="median_op")
    gaussian_op = GaussianOperator(self, output_folder=output_data_path, name="gaussian_op")
    self.add_flow(
        sobel_op,
        median_op,
        {
            ("out1", "in1"),
        },
    )
    self.add_flow(
        median_op,
        gaussian_op,
        {
            (
                "out1",
                "in1",
            )
        },
    )  # Using port name is optional for single port cases
    app_context = AppContext()
    await asyncio.sleep(5)  # Simulate processing time

    # Model-specific inference operator, supporting MONAI transforms.
    sobel_process_img = SobelOperator(model_path=path)
    gaussian_process_img =
    median_process_img =

    # Replace this with your actual processing logic
    result_data = {"output": liver_tumor_seg_op.output_name_seg}
    return result_data

async def process_and_respond(input_img):
    try:
        # Process point cloud asynchronously
        processed_data = await process_data(input_img)

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
        return response_data

# Django view function
async def handleAppEvent(request):
    if request.method == "POST":
        input_img = request.FILES.get('uploaded_img')

        # Start asynchronous processing
        response_data = await process_and_respond(input_img)

        # Return the JSON response
        return JsonResponse(response_data, safe=False)

    else:
        # Handle other HTTP methods (e.g., GET)
        return JsonResponse({"error": "Invalid request method"}, status=400)



if __name__ == "__main__":
    print("The statement, App().run(), is needed when this is run directly by the interpreter.")
    # App().run()